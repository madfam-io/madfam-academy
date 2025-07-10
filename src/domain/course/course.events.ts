import { DomainEvent } from '@/shared/domain/event-bus';

export class CourseCreatedEvent implements DomainEvent {
  eventName = 'CourseCreated';

  constructor(
    public readonly aggregateId: string,
    public readonly title: string,
    public readonly occurredOn: Date = new Date()
  ) {}

  get eventData() {
    return {
      title: this.title
    };
  }
}

export class CoursePublishedEvent implements DomainEvent {
  eventName = 'CoursePublished';

  constructor(
    public readonly aggregateId: string,
    public readonly publishedAt: Date,
    public readonly occurredOn: Date = new Date()
  ) {}

  get eventData() {
    return {
      publishedAt: this.publishedAt
    };
  }
}

export class CourseUpdatedEvent implements DomainEvent {
  eventName = 'CourseUpdated';

  constructor(
    public readonly aggregateId: string,
    public readonly changes: Record<string, any>,
    public readonly occurredOn: Date = new Date()
  ) {}

  get eventData() {
    return {
      changes: this.changes
    };
  }
}