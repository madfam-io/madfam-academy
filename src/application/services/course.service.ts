import { ICourseRepository, CourseSearchCriteria } from '@/domain/course/course.repository';
import { Course, CourseId, Price, CourseMetadata, Module, Lesson } from '@/domain/course/course.entity';
import { IEventBus } from '@/shared/domain/event-bus';
import { PersonaType } from '@/infrastructure/auth/persona-permissions';

export interface CreateCourseDto {
  tenantId: string;
  instructorId: string;
  title: string;
  description: string;
  price: {
    amount: number;
    currency: string;
    type: 'free' | 'one-time' | 'subscription';
    period?: 'monthly' | 'yearly';
  };
  metadata: {
    duration: number;
    skillLevel: 'beginner' | 'intermediate' | 'advanced';
    language: string;
    prerequisites: string[];
    objectives: string[];
  };
  categories?: string[];
  tags?: string[];
}

export interface UpdateCourseDto {
  title?: string;
  description?: string;
  price?: {
    amount: number;
    currency: string;
    type: 'free' | 'one-time' | 'subscription';
    period?: 'monthly' | 'yearly';
  };
  metadata?: {
    duration: number;
    skillLevel: 'beginner' | 'intermediate' | 'advanced';
    language: string;
    prerequisites: string[];
    objectives: string[];
  };
  categories?: string[];
  tags?: string[];
}

export interface AddModuleDto {
  title: string;
  description?: string;
  lessons?: {
    title: string;
    type: 'video' | 'article' | 'quiz' | 'assignment';
    contentUrl?: string;
    duration?: number;
    isPreview?: boolean;
  }[];
}

export interface CourseAccessContext {
  userId: string;
  tenantId: string;
  persona: PersonaType;
}

export class CourseService {
  constructor(
    private readonly courseRepository: ICourseRepository,
    private readonly eventBus: IEventBus
  ) {}

  async createCourse(dto: CreateCourseDto): Promise<Course> {
    const price = new Price(dto.price);
    const metadata = new CourseMetadata(dto.metadata);

    const course = Course.create({
      tenantId: dto.tenantId,
      instructorId: dto.instructorId,
      title: dto.title,
      description: dto.description,
      price,
      metadata,
    });

    if (dto.categories) {
      course.updateCategories(dto.categories);
    }

    if (dto.tags) {
      course.updateTags(dto.tags);
    }

    await this.courseRepository.save(course);
    await this.publishEvents(course);

    return course;
  }

  async updateCourse(
    courseId: string,
    dto: UpdateCourseDto,
    context: CourseAccessContext
  ): Promise<Course> {
    const course = await this.findCourseWithAccess(courseId, context, 'update');

    const updateData: any = {};
    if (dto.title) updateData.title = dto.title;
    if (dto.description) updateData.description = dto.description;
    if (dto.price) updateData.price = new Price(dto.price);
    if (dto.metadata) updateData.metadata = new CourseMetadata(dto.metadata);

    course.updateDetails(updateData);

    if (dto.categories !== undefined) {
      course.updateCategories(dto.categories);
    }

    if (dto.tags !== undefined) {
      course.updateTags(dto.tags);
    }

    await this.courseRepository.save(course);
    await this.publishEvents(course);

    return course;
  }

  async publishCourse(courseId: string, context: CourseAccessContext): Promise<Course> {
    const course = await this.findCourseWithAccess(courseId, context, 'publish');

    course.publish();

    await this.courseRepository.save(course);
    await this.publishEvents(course);

    return course;
  }

  async archiveCourse(courseId: string, context: CourseAccessContext): Promise<void> {
    const course = await this.findCourseWithAccess(courseId, context, 'delete');

    course.archive();

    await this.courseRepository.save(course);
    await this.publishEvents(course);
  }

  async addModule(
    courseId: string,
    dto: AddModuleDto,
    context: CourseAccessContext
  ): Promise<Course> {
    const course = await this.findCourseWithAccess(courseId, context, 'update');

    const module = new Module({
      id: this.generateId(),
      title: dto.title,
      description: dto.description,
      order: course.props.modules.length,
      lessons: [],
    });

    if (dto.lessons) {
      dto.lessons.forEach((lessonDto, index) => {
        const lesson = new Lesson({
          id: this.generateId(),
          title: lessonDto.title,
          type: lessonDto.type,
          contentUrl: lessonDto.contentUrl,
          duration: lessonDto.duration,
          order: index,
          isPreview: lessonDto.isPreview || false,
        });
        module.addLesson(lesson);
      });
    }

    course.addModule(module);

    await this.courseRepository.save(course);
    await this.publishEvents(course);

    return course;
  }

  async removeModule(
    courseId: string,
    moduleId: string,
    context: CourseAccessContext
  ): Promise<Course> {
    const course = await this.findCourseWithAccess(courseId, context, 'update');

    course.removeModule(moduleId);

    await this.courseRepository.save(course);
    await this.publishEvents(course);

    return course;
  }

  async findById(courseId: string, tenantId: string): Promise<Course | null> {
    return this.courseRepository.findById(new CourseId(courseId), tenantId);
  }

  async findBySlug(slug: string, tenantId: string): Promise<Course | null> {
    return this.courseRepository.findBySlug(slug, tenantId);
  }

  async searchCourses(criteria: CourseSearchCriteria, tenantId: string) {
    // Only show published courses to learners
    if (!criteria.status && (!criteria.instructorId || criteria.instructorId === '')) {
      criteria.status = 'published';
    }

    return this.courseRepository.search(criteria, tenantId);
  }

  async getInstructorCourses(instructorId: string, tenantId: string): Promise<Course[]> {
    return this.courseRepository.findByInstructor(instructorId, tenantId);
  }

  async incrementEnrollment(courseId: string, tenantId: string): Promise<void> {
    const course = await this.courseRepository.findById(new CourseId(courseId), tenantId);
    if (!course) {
      throw new Error('Course not found');
    }

    course.incrementEnrollment();
    await this.courseRepository.save(course);
  }

  async updateRating(courseId: string, newRating: number, tenantId: string): Promise<void> {
    const course = await this.courseRepository.findById(new CourseId(courseId), tenantId);
    if (!course) {
      throw new Error('Course not found');
    }

    course.updateRating(newRating);
    await this.courseRepository.save(course);
  }

  private async findCourseWithAccess(
    courseId: string,
    context: CourseAccessContext,
    action: 'read' | 'update' | 'publish' | 'delete'
  ): Promise<Course> {
    const course = await this.courseRepository.findById(
      new CourseId(courseId),
      context.tenantId
    );

    if (!course) {
      throw new Error('Course not found');
    }

    // Check access based on persona and ownership
    if (context.persona === 'admin' || context.persona === 'super_admin') {
      // Admins have full access
      return course;
    }

    if (context.persona === 'instructor') {
      // Instructors can only modify their own courses
      if (action !== 'read' && course.props.instructorId !== context.userId) {
        throw new Error('Access denied: You can only modify your own courses');
      }
    } else if (context.persona === 'learner') {
      // Learners can only read published courses
      if (action !== 'read' || course.props.status !== 'published') {
        throw new Error('Access denied');
      }
    }

    return course;
  }

  private async publishEvents(course: Course): Promise<void> {
    const events = course.getUncommittedEvents();
    for (const event of events) {
      await this.eventBus.publish(event);
    }
    course.markEventsAsCommitted();
  }

  private generateId(): string {
    return crypto.randomUUID();
  }
}