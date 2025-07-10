import { Entity, ValueObject, AggregateRoot } from '@/shared/domain';
import { LessonCompletedEvent, ModuleCompletedEvent, CourseCompletedEvent } from './progress.events';

// Value Objects
export class EnrollmentId extends ValueObject<string> {
  static create(): EnrollmentId {
    return new EnrollmentId(crypto.randomUUID());
  }
}

export class ProgressPercentage extends ValueObject<number> {
  constructor(value: number) {
    if (value < 0 || value > 100) {
      throw new Error('Progress percentage must be between 0 and 100');
    }
    super(Math.round(value));
  }

  static fromFraction(completed: number, total: number): ProgressPercentage {
    if (total === 0) return new ProgressPercentage(0);
    return new ProgressPercentage((completed / total) * 100);
  }

  isComplete(): boolean {
    return this.value === 100;
  }

  displayValue(): string {
    return `${this.value}%`;
  }
}

export class LessonProgressData extends ValueObject<{
  videoPosition?: number; // seconds
  quizAnswers?: Record<string, any>;
  assignmentSubmission?: {
    submittedAt: Date;
    content: any;
    attachments?: string[];
  };
  notes?: string;
}> {
  get hasVideoProgress(): boolean {
    return this.value.videoPosition !== undefined && this.value.videoPosition > 0;
  }

  get hasQuizAnswers(): boolean {
    return !!this.value.quizAnswers && Object.keys(this.value.quizAnswers).length > 0;
  }

  get hasAssignmentSubmission(): boolean {
    return !!this.value.assignmentSubmission;
  }
}

// Lesson Progress Entity
export class LessonProgress extends Entity<{
  id: string;
  lessonId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  startedAt?: Date;
  completedAt?: Date;
  timeSpentSeconds: number;
  progressData: LessonProgressData;
  attempts: number;
  score?: number;
  passed?: boolean;
}> {
  start(): void {
    if (this.props.status !== 'not_started') {
      return; // Already started
    }

    this.props.status = 'in_progress';
    this.props.startedAt = new Date();
    this.props.attempts++;
  }

  updateProgress(data: Partial<LessonProgressData['value']>): void {
    this.props.progressData = new LessonProgressData({
      ...this.props.progressData.value,
      ...data,
    });
    
    if (this.props.status === 'not_started') {
      this.start();
    }
  }

  complete(score?: number): void {
    if (this.props.status === 'completed') {
      return; // Already completed
    }

    this.props.status = 'completed';
    this.props.completedAt = new Date();
    
    if (score !== undefined) {
      this.props.score = score;
      this.props.passed = score >= 70; // Assuming 70% passing grade
    } else {
      this.props.passed = true; // Non-graded lessons
    }
  }

  addTimeSpent(seconds: number): void {
    this.props.timeSpentSeconds += seconds;
  }

  reset(): void {
    this.props.status = 'not_started';
    this.props.startedAt = undefined;
    this.props.completedAt = undefined;
    this.props.progressData = new LessonProgressData({});
    this.props.score = undefined;
    this.props.passed = undefined;
  }

  get isComplete(): boolean {
    return this.props.status === 'completed';
  }

  get isInProgress(): boolean {
    return this.props.status === 'in_progress';
  }
}

// Module Progress Summary
export class ModuleProgress extends ValueObject<{
  moduleId: string;
  totalLessons: number;
  completedLessons: number;
  inProgressLessons: number;
  totalTimeSpent: number;
  averageScore?: number;
}> {
  get progressPercentage(): ProgressPercentage {
    return ProgressPercentage.fromFraction(this.value.completedLessons, this.value.totalLessons);
  }

  get isComplete(): boolean {
    return this.value.completedLessons === this.value.totalLessons;
  }

  get isStarted(): boolean {
    return this.value.completedLessons > 0 || this.value.inProgressLessons > 0;
  }
}

// Enrollment (Progress Aggregate Root)
export class Enrollment extends AggregateRoot<{
  id: EnrollmentId;
  tenantId: string;
  studentId: string;
  courseId: string;
  enrolledAt: Date;
  expiresAt?: Date;
  status: 'active' | 'completed' | 'expired' | 'suspended';
  completionPercentage: ProgressPercentage;
  completedAt?: Date;
  lastAccessedAt?: Date;
  lessonProgress: Map<string, LessonProgress>;
  moduleProgress: Map<string, ModuleProgress>;
  totalTimeSpent: number;
  certificateId?: string;
}> {
  static create(props: {
    tenantId: string;
    studentId: string;
    courseId: string;
    expiresAt?: Date;
  }): Enrollment {
    const enrollmentId = EnrollmentId.create();

    return new Enrollment({
      id: enrollmentId,
      tenantId: props.tenantId,
      studentId: props.studentId,
      courseId: props.courseId,
      enrolledAt: new Date(),
      expiresAt: props.expiresAt,
      status: 'active',
      completionPercentage: new ProgressPercentage(0),
      lessonProgress: new Map(),
      moduleProgress: new Map(),
      totalTimeSpent: 0,
    });
  }

  startLesson(lessonId: string): LessonProgress {
    let progress = this.props.lessonProgress.get(lessonId);
    
    if (!progress) {
      progress = new LessonProgress({
        id: crypto.randomUUID(),
        lessonId,
        status: 'not_started',
        timeSpentSeconds: 0,
        progressData: new LessonProgressData({}),
        attempts: 0,
      });
      this.props.lessonProgress.set(lessonId, progress);
    }

    progress.start();
    this.updateLastAccessed();
    
    return progress;
  }

  updateLessonProgress(
    lessonId: string,
    data: Partial<LessonProgressData['value']>,
    timeSpent?: number
  ): void {
    const progress = this.props.lessonProgress.get(lessonId);
    if (!progress) {
      throw new Error('Lesson progress not found. Start the lesson first.');
    }

    progress.updateProgress(data);
    
    if (timeSpent) {
      progress.addTimeSpent(timeSpent);
      this.props.totalTimeSpent += timeSpent;
    }
    
    this.updateLastAccessed();
  }

  completeLesson(lessonId: string, score?: number): void {
    const progress = this.props.lessonProgress.get(lessonId);
    if (!progress) {
      throw new Error('Lesson progress not found');
    }

    const wasComplete = progress.isComplete;
    progress.complete(score);

    if (!wasComplete) {
      this.addDomainEvent(new LessonCompletedEvent(
        this.props.id.value,
        lessonId,
        this.props.studentId,
        this.props.courseId,
        progress.props.completedAt!
      ));

      this.recalculateProgress();
    }
    
    this.updateLastAccessed();
  }

  updateModuleProgress(moduleId: string, moduleData: ModuleProgress['value']): void {
    const moduleProgress = new ModuleProgress(moduleData);
    this.props.moduleProgress.set(moduleId, moduleProgress);

    if (moduleProgress.isComplete) {
      this.addDomainEvent(new ModuleCompletedEvent(
        this.props.id.value,
        moduleId,
        this.props.studentId,
        this.props.courseId,
        new Date()
      ));
    }
  }

  markAsCompleted(certificateId?: string): void {
    if (this.props.status === 'completed') {
      return; // Already completed
    }

    this.props.status = 'completed';
    this.props.completedAt = new Date();
    this.props.completionPercentage = new ProgressPercentage(100);
    
    if (certificateId) {
      this.props.certificateId = certificateId;
    }

    this.addDomainEvent(new CourseCompletedEvent(
      this.props.id.value,
      this.props.studentId,
      this.props.courseId,
      this.props.completedAt!,
      certificateId !== undefined
    ));
  }

  suspend(reason?: string): void {
    this.props.status = 'suspended';
  }

  reactivate(): void {
    if (this.props.status !== 'suspended') {
      throw new Error('Can only reactivate suspended enrollments');
    }
    
    this.props.status = 'active';
    this.updateLastAccessed();
  }

  checkExpiration(): void {
    if (this.props.expiresAt && new Date() > this.props.expiresAt) {
      this.props.status = 'expired';
    }
  }

  private recalculateProgress(): void {
    const totalLessons = this.props.lessonProgress.size;
    const completedLessons = Array.from(this.props.lessonProgress.values())
      .filter(p => p.isComplete).length;

    this.props.completionPercentage = ProgressPercentage.fromFraction(
      completedLessons,
      totalLessons
    );

    // Check if course is completed
    if (this.props.completionPercentage.isComplete() && this.props.status === 'active') {
      this.markAsCompleted();
    }
  }

  private updateLastAccessed(): void {
    this.props.lastAccessedAt = new Date();
  }

  get isActive(): boolean {
    return this.props.status === 'active';
  }

  get isCompleted(): boolean {
    return this.props.status === 'completed';
  }

  get daysUntilExpiration(): number | null {
    if (!this.props.expiresAt) return null;
    
    const now = new Date();
    const diffTime = this.props.expiresAt.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get averageScore(): number | null {
    const scores = Array.from(this.props.lessonProgress.values())
      .filter(p => p.props.score !== undefined)
      .map(p => p.props.score!);

    if (scores.length === 0) return null;
    
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  getModuleSummary(moduleId: string): ModuleProgress | undefined {
    return this.props.moduleProgress.get(moduleId);
  }

  getLessonProgress(lessonId: string): LessonProgress | undefined {
    return this.props.lessonProgress.get(lessonId);
  }

  getAllLessonProgress(): LessonProgress[] {
    return Array.from(this.props.lessonProgress.values());
  }
}