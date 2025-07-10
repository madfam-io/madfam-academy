import { Certificate } from './certificate.entity';

export interface CertificateRepository {
  findById(id: string, tenantId?: string): Promise<Certificate | null>;
  save(certificate: Certificate): Promise<void>;
  findByNumber(certificateNumber: string): Promise<Certificate | null>;
  findByUserId(userId: string): Promise<Certificate[]>;
  findByCourseId(courseId: string): Promise<Certificate[]>;
  findByVerificationCode(code: string): Promise<Certificate | null>;
  findByStudent(studentId: string, tenantId: string): Promise<Certificate[]>;
  findDefault(tenantId: string, type: string): Promise<Certificate | null>;
}