import { Certificate } from './certificate.entity';

export interface CertificateRepository {
  findById(id: string): Promise<Certificate | null>;
  save(certificate: Certificate): Promise<void>;
  findByNumber(certificateNumber: string): Promise<Certificate | null>;
  findByUserId(userId: string): Promise<Certificate[]>;
  findByCourseId(courseId: string): Promise<Certificate[]>;
}