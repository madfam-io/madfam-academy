import { EnrollmentRepository } from '@/domain/progress/enrollment.repository';
import { Enrollment, LessonProgressData } from '@/domain/progress/progress.entity';
import { CourseRepository } from '@/domain/course/course.repository';
import { CertificateService } from './certificate.service';
import { EventBus } from '@/shared/domain/event-bus';
import { PersonaType } from '@/infrastructure/auth/persona-permissions';

export interface EnrollInCourseDto {
  tenantId: string;
  studentId: string;
  courseId: string;
  paymentIntentId?: string;
}

export interface UpdateLessonProgressDto {
  lessonId: string;
  videoPosition?: number;
  quizAnswers?: Record<string, any>;
  assignmentSubmission?: {
    content: any;
    attachments?: string[];
  };
  timeSpent?: number;
  completed?: boolean;
  score?: number;
}

export interface ProgressSummary {
  enrollmentId: string;
  courseId: string;
  status: string;
  completionPercentage: number;
  totalTimeSpent: number;
  lastAccessedAt?: Date;
  completedAt?: Date;
  certificateId?: string;
  modules: Array<{
    moduleId: string;
    progressPercentage: number;
    completedLessons: number;
    totalLessons: number;
    isComplete: boolean;
  }>;
  recentProgress: Array<{
    lessonId: string;
    lessonTitle?: string;
    completedAt: Date;
    score?: number;
  }>;
}

export interface AccessContext {
  userId: string;
  tenantId: string;
  persona: PersonaType;
}

export class ProgressService {
  constructor(
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly courseRepository: CourseRepository,
    private readonly certificateService: CertificateService,
    private readonly eventBus: EventBus
  ) {}

  async enrollInCourse(dto: EnrollInCourseDto): Promise<Enrollment> {
    // Check if already enrolled
    const existingEnrollment = await this.enrollmentRepository.findByStudentAndCourse(
      dto.studentId,
      dto.courseId,
      dto.tenantId
    );

    if (existingEnrollment && existingEnrollment.isActive) {
      throw new Error('Already enrolled in this course');
    }

    // Verify course exists and is published
    const course = await this.courseRepository.findById(
      { value: dto.courseId } as any,
      dto.tenantId
    );

    if (!course) {
      throw new Error('Course not found');
    }

    if (course.props.status !== 'published') {
      throw new Error('Course is not available for enrollment');
    }

    // Create enrollment
    const enrollment = Enrollment.create({
      tenantId: dto.tenantId,
      studentId: dto.studentId,
      courseId: dto.courseId,
    });

    // Initialize lesson progress for all lessons
    const lessonCount = course.props.modules.reduce(
      (count, module) => count + module.props.lessons.length,
      0
    );

    // Save enrollment
    await this.enrollmentRepository.save(enrollment);

    // Update course enrollment count
    await this.courseRepository.incrementEnrollmentCount(dto.courseId, dto.tenantId);

    // Publish events
    await this.publishEvents(enrollment);

    return enrollment;
  }

  async startLesson(
    enrollmentId: string,
    lessonId: string,
    context: AccessContext
  ): Promise<void> {
    const enrollment = await this.getEnrollmentWithAccess(enrollmentId, context);

    enrollment.startLesson(lessonId);
    
    await this.enrollmentRepository.save(enrollment);
    await this.publishEvents(enrollment);
  }

  async updateLessonProgress(
    enrollmentId: string,
    dto: UpdateLessonProgressDto,
    context: AccessContext
  ): Promise<void> {
    const enrollment = await this.getEnrollmentWithAccess(enrollmentId, context);

    // Update progress data
    const progressData: Partial<LessonProgressData['value']> = {};
    
    if (dto.videoPosition !== undefined) {
      progressData.videoPosition = dto.videoPosition;
    }
    
    if (dto.quizAnswers) {
      progressData.quizAnswers = dto.quizAnswers;
    }
    
    if (dto.assignmentSubmission) {
      progressData.assignmentSubmission = {
        submittedAt: new Date(),
        ...dto.assignmentSubmission,
      };
    }

    enrollment.updateLessonProgress(dto.lessonId, progressData, dto.timeSpent);

    // Complete lesson if requested
    if (dto.completed) {
      enrollment.completeLesson(dto.lessonId, dto.score);
      
      // Update module progress
      await this.updateModuleProgress(enrollment, dto.lessonId);
      
      // Check if course is completed
      if (enrollment.isCompleted) {
        await this.handleCourseCompletion(enrollment);
      }
    }

    await this.enrollmentRepository.save(enrollment);
    await this.publishEvents(enrollment);
  }

  async getEnrollmentProgress(
    enrollmentId: string,
    context: AccessContext
  ): Promise<ProgressSummary> {
    const enrollment = await this.getEnrollmentWithAccess(enrollmentId, context);
    
    // Get course details for additional context
    const course = await this.courseRepository.findById(
      { value: enrollment.props.courseId } as any,
      enrollment.props.tenantId
    );

    // Build module summaries
    const modules = Array.from(enrollment.props.moduleProgress.values()).map(mp => ({
      moduleId: mp.value.moduleId,
      progressPercentage: mp.progressPercentage.value,
      completedLessons: mp.value.completedLessons,
      totalLessons: mp.value.totalLessons,
      isComplete: mp.isComplete,
    }));

    // Get recent progress
    const recentProgress = Array.from(enrollment.props.lessonProgress.values())
      .filter(lp => lp.props.completedAt)
      .sort((a, b) => b.props.completedAt!.getTime() - a.props.completedAt!.getTime())
      .slice(0, 5)
      .map(lp => ({
        lessonId: lp.props.lessonId,
        completedAt: lp.props.completedAt!,
        score: lp.props.score,
      }));

    return {
      enrollmentId: enrollment.props.id.value,
      courseId: enrollment.props.courseId,
      status: enrollment.props.status,
      completionPercentage: enrollment.props.completionPercentage.value,
      totalTimeSpent: enrollment.props.totalTimeSpent,
      lastAccessedAt: enrollment.props.lastAccessedAt,
      completedAt: enrollment.props.completedAt,
      certificateId: enrollment.props.certificateId,
      modules,
      recentProgress,
    };
  }

  async getStudentEnrollments(
    studentId: string,
    tenantId: string,
    status?: 'active' | 'completed' | 'expired'
  ): Promise<Enrollment[]> {
    return this.enrollmentRepository.findByStudent(studentId, tenantId, status);
  }

  async getCourseEnrollments(
    courseId: string,
    tenantId: string,
    context: AccessContext
  ): Promise<Enrollment[]> {
    // Verify access to course enrollments
    if (context.persona === 'learner') {
      throw new Error('Access denied');
    }

    if (context.persona === 'instructor') {
      const course = await this.courseRepository.findById(
        { value: courseId } as any,
        tenantId
      );
      
      if (course && course.props.instructorId !== context.userId) {
        throw new Error('Access denied: You can only view enrollments for your own courses');
      }
    }

    return this.enrollmentRepository.findByCourse(courseId, tenantId);
  }

  private async updateModuleProgress(
    enrollment: Enrollment,
    lessonId: string
  ): Promise<void> {
    // Get course structure to determine module
    const course = await this.courseRepository.findById(
      { value: enrollment.props.courseId } as any,
      enrollment.props.tenantId
    );

    if (!course) return;

    // Find which module contains this lesson
    for (const module of course.props.modules) {
      const lessons = module.props.lessons;
      const lessonInModule = lessons.find(l => l.id === lessonId);
      
      if (lessonInModule) {
        // Calculate module progress
        const moduleLessonIds = lessons.map(l => l.id);
        const completedCount = moduleLessonIds.filter(id => {
          const progress = enrollment.getLessonProgress(id);
          return progress?.isComplete || false;
        }).length;

        const inProgressCount = moduleLessonIds.filter(id => {
          const progress = enrollment.getLessonProgress(id);
          return progress?.isInProgress || false;
        }).length;

        const totalTimeSpent = moduleLessonIds.reduce((sum, id) => {
          const progress = enrollment.getLessonProgress(id);
          return sum + (progress?.props.timeSpentSeconds || 0);
        }, 0);

        enrollment.updateModuleProgress(module.id, {
          moduleId: module.id,
          totalLessons: lessons.length,
          completedLessons: completedCount,
          inProgressLessons: inProgressCount,
          totalTimeSpent,
        });

        break;
      }
    }
  }

  private async handleCourseCompletion(enrollment: Enrollment): Promise<void> {
    // Get course and student details
    const course = await this.courseRepository.findById(
      { value: enrollment.props.courseId } as any,
      enrollment.props.tenantId
    );

    if (!course) return;

    // Issue certificate
    try {
      const certificate = await this.certificateService.issueCertificate({
        tenantId: enrollment.props.tenantId,
        studentId: enrollment.props.studentId,
        studentName: 'Student Name', // Would need to fetch from user service
        courseId: course.props.id.value,
        courseName: course.props.title,
        enrollmentId: enrollment.props.id.value,
        instructorName: 'Instructor Name', // Would need to fetch from user service
        completionDate: new Date(),
        score: enrollment.averageScore || undefined,
        courseDuration: Math.round(course.totalDuration / 60), // Convert to hours
      });

      enrollment.markAsCompleted(certificate.props.id.value);
    } catch (error) {
      console.error('Failed to issue certificate:', error);
      enrollment.markAsCompleted();
    }
  }

  private async getEnrollmentWithAccess(
    enrollmentId: string,
    context: AccessContext
  ): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepository.findById(enrollmentId, context.tenantId);

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    // Check access
    if (context.persona === 'learner' && enrollment.props.studentId !== context.userId) {
      throw new Error('Access denied: You can only access your own enrollments');
    }

    if (context.persona === 'instructor') {
      const course = await this.courseRepository.findById(
        { value: enrollment.props.courseId } as any,
        context.tenantId
      );
      
      if (course && course.props.instructorId !== context.userId) {
        throw new Error('Access denied');
      }
    }

    return enrollment;
  }

  private async publishEvents(enrollment: Enrollment): Promise<void> {
    const events = enrollment.getUncommittedEvents();
    for (const event of events) {
      await this.eventBus.publish(event);
    }
    enrollment.markEventsAsCommitted();
  }
}