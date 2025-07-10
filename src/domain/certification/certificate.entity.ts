import { Entity, ValueObject, AggregateRoot } from '@/shared/domain';
import { CertificateGeneratedEvent, CertificateValidatedEvent, CertificateRevokedEvent } from './certificate.events';

// Value Objects
export class CertificateId extends ValueObject<string> {
  static create(): CertificateId {
    return new CertificateId(crypto.randomUUID());
  }
}

export class CertificateNumber extends ValueObject<string> {
  private static sequence = 0;

  static create(): CertificateNumber {
    const year = new Date().getFullYear();
    const number = (++this.sequence).toString().padStart(6, '0');
    return new CertificateNumber(`CERT-${year}-${number}`);
  }

  static fromString(value: string): CertificateNumber {
    return new CertificateNumber(value);
  }
}

export class VerificationCode extends ValueObject<string> {
  static create(): VerificationCode {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 10; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return new VerificationCode(code);
  }
}

export class CertificateMetadata extends ValueObject<{
  studentName: string;
  courseName: string;
  instructorName: string;
  completionDate: Date;
  score?: number;
  grade?: string;
  courseDuration: number;
  customFields?: Record<string, any>;
}> {
  get formattedCompletionDate(): string {
    return this.value.completionDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  get displayGrade(): string {
    if (this.value.grade) return this.value.grade;
    if (this.value.score) {
      if (this.value.score >= 90) return 'A';
      if (this.value.score >= 80) return 'B';
      if (this.value.score >= 70) return 'C';
      if (this.value.score >= 60) return 'D';
      return 'F';
    }
    return 'Pass';
  }
}

// Certificate Template Entity
export class CertificateTemplate extends Entity<{
  id: string;
  tenantId: string;
  name: string;
  templateType: 'course' | 'achievement' | 'pathway';
  design: {
    layout: 'portrait' | 'landscape';
    backgroundColor: string;
    borderStyle?: string;
    logoUrl?: string;
    signatureUrls?: string[];
    fonts: {
      title: { family: string; size: number; color: string };
      body: { family: string; size: number; color: string };
      accent: { family: string; size: number; color: string };
    };
    elements: Array<{
      type: 'text' | 'image' | 'shape' | 'signature';
      position: { x: number; y: number };
      size?: { width: number; height: number };
      content?: string;
      style?: Record<string, any>;
      variable?: string; // For dynamic content
    }>;
  };
  variables: string[];
  isDefault: boolean;
}> {
  updateDesign(design: Partial<CertificateTemplate['props']['design']>): void {
    this.props.design = { ...this.props.design, ...design };
  }

  setAsDefault(): void {
    this.props.isDefault = true;
  }

  extractVariables(): string[] {
    const variables = new Set<string>();
    this.props.design.elements.forEach(element => {
      if (element.variable) {
        variables.add(element.variable);
      }
    });
    return Array.from(variables);
  }
}

// Certificate Aggregate Root
export class Certificate extends AggregateRoot<{
  id: CertificateId;
  tenantId: string;
  studentId: string;
  courseId?: string;
  enrollmentId?: string;
  templateId: string;
  certificateNumber: CertificateNumber;
  verificationCode: VerificationCode;
  metadata: CertificateMetadata;
  certificateUrl?: string;
  issuedAt: Date;
  expiresAt?: Date;
  revokedAt?: Date;
  revocationReason?: string;
}> {
  static issue(props: {
    tenantId: string;
    studentId: string;
    courseId?: string;
    enrollmentId?: string;
    templateId: string;
    metadata: CertificateMetadata;
    expiresAt?: Date;
  }): Certificate {
    const certificateId = CertificateId.create();
    const certificateNumber = CertificateNumber.create();
    const verificationCode = VerificationCode.create();

    const certificate = new Certificate({
      id: certificateId,
      tenantId: props.tenantId,
      studentId: props.studentId,
      courseId: props.courseId,
      enrollmentId: props.enrollmentId,
      templateId: props.templateId,
      certificateNumber,
      verificationCode,
      metadata: props.metadata,
      issuedAt: new Date(),
      expiresAt: props.expiresAt,
    });

    certificate.addDomainEvent(new CertificateGeneratedEvent(
      certificateId.value,
      certificateNumber.value
    ));

    return certificate;
  }

  setCertificateUrl(url: string): void {
    this.props.certificateUrl = url;
  }

  revoke(reason: string): void {
    if (this.props.revokedAt) {
      throw new Error('Certificate is already revoked');
    }

    this.props.revokedAt = new Date();
    this.props.revocationReason = reason;
  }

  isValid(): boolean {
    // Check if revoked
    if (this.props.revokedAt) {
      return false;
    }

    // Check if expired
    if (this.props.expiresAt && new Date() > this.props.expiresAt) {
      return false;
    }

    return true;
  }

  get isExpired(): boolean {
    return this.props.expiresAt ? new Date() > this.props.expiresAt : false;
  }

  get isRevoked(): boolean {
    return !!this.props.revokedAt;
  }

  getVerificationData(): {
    number: string;
    code: string;
    issuedAt: Date;
    status: 'valid' | 'expired' | 'revoked';
    studentName: string;
    courseName: string;
  } {
    let status: 'valid' | 'expired' | 'revoked' = 'valid';
    if (this.isRevoked) status = 'revoked';
    else if (this.isExpired) status = 'expired';

    return {
      number: this.props.certificateNumber.value,
      code: this.props.verificationCode.value,
      issuedAt: this.props.issuedAt,
      status,
      studentName: this.props.metadata.value.studentName,
      courseName: this.props.metadata.value.courseName,
    };
  }
}