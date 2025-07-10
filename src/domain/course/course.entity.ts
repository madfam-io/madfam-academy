import { Entity, ValueObject, AggregateRoot } from '@/shared/domain';
import { CourseCreatedEvent, CoursePublishedEvent, CourseUpdatedEvent } from './course.events';

// Value Objects
export class CourseId extends ValueObject<string> {
  static create(): CourseId {
    return new CourseId(crypto.randomUUID());
  }
}

export class Price extends ValueObject<{
  amount: number;
  currency: string;
  type: 'free' | 'one-time' | 'subscription';
  period?: 'monthly' | 'yearly';
}> {
  get isFree(): boolean {
    return this.value.type === 'free' || this.value.amount === 0;
  }

  get displayPrice(): string {
    if (this.isFree) return 'Free';
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.value.currency,
    });
    const price = formatter.format(this.value.amount);
    return this.value.type === 'subscription' 
      ? `${price}/${this.value.period}` 
      : price;
  }
}

export class CourseMetadata extends ValueObject<{
  duration: number; // minutes
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  prerequisites: string[];
  objectives: string[];
}> {
  get durationHours(): number {
    return Math.floor(this.value.duration / 60);
  }

  get formattedDuration(): string {
    const hours = this.durationHours;
    const minutes = this.value.duration % 60;
    if (hours === 0) return `${minutes}m`;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
}

// Module Entity
export class Module extends Entity<{
  id: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
}> {
  get id(): string {
    return this.props.id;
  }

  get order(): number {
    return this.props.order;
  }

  set order(value: number) {
    this.props.order = value;
  }

  get lessons(): Lesson[] {
    return this.props.lessons;
  }

  addLesson(lesson: Lesson): void {
    this.props.lessons.push(lesson);
    this.props.lessons.sort((a, b) => a.order - b.order);
  }

  removeLesson(lessonId: string): void {
    this.props.lessons = this.props.lessons.filter(l => l.id !== lessonId);
  }

  reorderLessons(lessonIds: string[]): void {
    const lessonMap = new Map(this.props.lessons.map(l => [l.id, l]));
    this.props.lessons = lessonIds
      .map((id, index) => {
        const lesson = lessonMap.get(id);
        if (lesson) {
          lesson.order = index;
          return lesson;
        }
        return null;
      })
      .filter(Boolean) as Lesson[];
  }

  get totalDuration(): number {
    return this.props.lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);
  }
}

// Lesson Entity
export class Lesson extends Entity<{
  id: string;
  title: string;
  type: 'video' | 'article' | 'quiz' | 'assignment';
  contentUrl?: string;
  duration?: number; // minutes
  order: number;
  isPreview: boolean;
}> {
  get id(): string {
    return this.props.id;
  }

  get order(): number {
    return this.props.order;
  }

  set order(value: number) {
    this.props.order = value;
  }

  get duration(): number | undefined {
    return this.props.duration;
  }

  markAsPreview(): void {
    this.props.isPreview = true;
  }

  updateContent(contentUrl: string, duration?: number): void {
    this.props.contentUrl = contentUrl;
    if (duration !== undefined) {
      this.props.duration = duration;
    }
  }
}

// Course Aggregate Root
export class Course extends AggregateRoot<{
  id: CourseId;
  tenantId: string;
  instructorId: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  price: Price;
  metadata: CourseMetadata;
  categories: string[];
  tags: string[];
  modules: Module[];
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  rating?: number;
  enrollmentCount: number;
}> {
  static create(props: {
    tenantId: string;
    instructorId: string;
    title: string;
    description: string;
    price: Price;
    metadata: CourseMetadata;
  }): Course {
    const courseId = CourseId.create();
    const slug = props.title.toLowerCase().replace(/\s+/g, '-');
    
    const course = new Course({
      id: courseId,
      tenantId: props.tenantId,
      instructorId: props.instructorId,
      title: props.title,
      slug,
      description: props.description,
      price: props.price,
      metadata: props.metadata,
      categories: [],
      tags: [],
      modules: [],
      status: 'draft',
      enrollmentCount: 0,
    });

    course.addDomainEvent(new CourseCreatedEvent(
      courseId.value,
      props.title
    ));

    return course;
  }

  publish(): void {
    if (this.props.status === 'published') {
      throw new Error('Course is already published');
    }

    if (this.props.modules.length === 0) {
      throw new Error('Cannot publish course without modules');
    }

    const hasContent = this.props.modules.some(m => m.lessons.length > 0);
    if (!hasContent) {
      throw new Error('Cannot publish course without lessons');
    }

    this.props.status = 'published';
    this.props.publishedAt = new Date();

    this.addDomainEvent(new CoursePublishedEvent(
      this.props.id.value,
      this.props.publishedAt!
    ));
  }

  archive(): void {
    if (this.props.status === 'archived') {
      throw new Error('Course is already archived');
    }

    this.props.status = 'archived';
  }

  updateDetails(props: {
    title?: string;
    description?: string;
    price?: Price;
    metadata?: CourseMetadata;
  }): void {
    if (props.title) {
      this.props.title = props.title;
      this.props.slug = props.title.toLowerCase().replace(/\s+/g, '-');
    }
    if (props.description) this.props.description = props.description;
    if (props.price) this.props.price = props.price;
    if (props.metadata) this.props.metadata = props.metadata;

    this.addDomainEvent(new CourseUpdatedEvent(
      this.props.id.value,
      props
    ));
  }

  addModule(module: Module): void {
    module.order = this.props.modules.length;
    this.props.modules.push(module);
  }

  removeModule(moduleId: string): void {
    this.props.modules = this.props.modules.filter(m => m.id !== moduleId);
    // Reorder remaining modules
    this.props.modules.forEach((m, index) => {
      m.order = index;
    });
  }

  reorderModules(moduleIds: string[]): void {
    const moduleMap = new Map(this.props.modules.map(m => [m.id, m]));
    this.props.modules = moduleIds
      .map((id, index) => {
        const module = moduleMap.get(id);
        if (module) {
          module.order = index;
          return module;
        }
        return null;
      })
      .filter(Boolean) as Module[];
  }

  updateCategories(categories: string[]): void {
    this.props.categories = categories;
  }

  updateTags(tags: string[]): void {
    this.props.tags = tags;
  }

  incrementEnrollment(): void {
    this.props.enrollmentCount++;
  }

  updateRating(newRating: number): void {
    this.props.rating = newRating;
  }

  get totalDuration(): number {
    return this.props.modules.reduce((sum, module) => sum + module.totalDuration, 0);
  }

  get totalLessons(): number {
    return this.props.modules.reduce((sum, module) => sum + module.lessons.length, 0);
  }

  get isComplete(): boolean {
    return this.props.modules.length > 0 && 
           this.props.modules.every(m => m.lessons.length > 0);
  }

  get canBePublished(): boolean {
    return this.props.status === 'draft' && this.isComplete;
  }

  get previewLessons(): Lesson[] {
    return this.props.modules
      .flatMap(m => m.lessons)
      .filter(l => l.isPreview);
  }
}