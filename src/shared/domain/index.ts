export abstract class ValueObject<T> {
  constructor(public readonly value: T) {}

  equals(other: ValueObject<T>): boolean {
    return this.value === other.value;
  }
}

export abstract class Entity<T> {
  private _domainEvents: DomainEvent[] = [];

  constructor(public readonly props: T) {}

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  getUncommittedEvents(): DomainEvent[] {
    return this._domainEvents;
  }

  markEventsAsCommitted(): void {
    this._domainEvents = [];
  }
}

export abstract class AggregateRoot<T> extends Entity<T> {
  constructor(props: T) {
    super(props);
  }
}

export interface DomainEvent {
  eventName: string;
  aggregateId: string;
  occurredOn: Date;
  eventData: any;
}

export class DomainEventBus {
  private handlers: Map<string, ((event: DomainEvent) => void)[]> = new Map();

  subscribe(eventName: string, handler: (event: DomainEvent) => void): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)!.push(handler);
  }

  publish(event: DomainEvent): void {
    const handlers = this.handlers.get(event.eventName);
    if (handlers) {
      handlers.forEach(handler => handler(event));
    }
  }
}