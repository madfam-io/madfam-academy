import { DomainEvent } from '@/shared/domain/event-bus';

export class EnrollmentCreatedEvent implements DomainEvent {
  eventName = 'EnrollmentCreated';

  constructor(
    public readonly aggregateId: string,
    public readonly userId: string,
    public readonly courseId: string,
    public readonly occurredOn: Date = new Date()
  ) {}

  get eventData() {
    return {
      userId: this.userId,
      courseId: this.courseId
    };
  }
}

export class LessonCompletedEvent implements DomainEvent {
  eventName = 'LessonCompleted';

  constructor(
    public readonly aggregateId: string,
    public readonly lessonId: string,
    public readonly userId: string,
    public readonly courseId: string,
    public readonly completedAt: Date,
    public readonly occurredOn: Date = new Date()
  ) {}

  get eventData() {
    return {
      lessonId: this.lessonId,
      userId: this.userId,
      courseId: this.courseId,
      completedAt: this.completedAt
    };
  }
}

export class ModuleCompletedEvent implements DomainEvent {
  eventName = 'ModuleCompleted';

  constructor(
    public readonly aggregateId: string,
    public readonly moduleId: string,
    public readonly userId: string,
    public readonly courseId: string,
    public readonly completedAt: Date,
    public readonly occurredOn: Date = new Date()
  ) {}

  get eventData() {
    return {
      moduleId: this.moduleId,
      userId: this.userId,
      courseId: this.courseId,
      completedAt: this.completedAt
    };
  }
}

export class CourseCompletedEvent implements DomainEvent {
  eventName = 'CourseCompleted';

  constructor(
    public readonly aggregateId: string,
    public readonly userId: string,
    public readonly courseId: string,
    public readonly completedAt: Date,
    public readonly certificateEligible: boolean,
    public readonly occurredOn: Date = new Date()
  ) {}

  get eventData() {
    return {
      userId: this.userId,
      courseId: this.courseId,
      completedAt: this.completedAt,
      certificateEligible: this.certificateEligible
    };
  }
}