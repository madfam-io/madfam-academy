import { DomainEvent, DomainEventBus } from './index';

export class EventBus extends DomainEventBus {
  private static instance: EventBus;

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  async publishAsync(event: DomainEvent): Promise<void> {
    return new Promise((resolve) => {
      this.publish(event);
      resolve();
    });
  }
}

export { DomainEvent };