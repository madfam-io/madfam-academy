import { DomainEvent } from '@/shared/domain/event-bus';

export class CertificateGeneratedEvent implements DomainEvent {
  eventName = 'CertificateGenerated';

  constructor(
    public readonly aggregateId: string,
    public readonly certificateNumber: string,
    public readonly occurredOn: Date = new Date()
  ) {}

  get eventData() {
    return {
      certificateNumber: this.certificateNumber
    };
  }
}

export class CertificateValidatedEvent implements DomainEvent {
  eventName = 'CertificateValidated';

  constructor(
    public readonly aggregateId: string,
    public readonly occurredOn: Date = new Date()
  ) {}

  get eventData() {
    return {};
  }
}

export class CertificateRevokedEvent implements DomainEvent {
  eventName = 'CertificateRevoked';

  constructor(
    public readonly aggregateId: string,
    public readonly reason: string,
    public readonly occurredOn: Date = new Date()
  ) {}

  get eventData() {
    return {
      reason: this.reason
    };
  }
}