import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { ICertificateRepository } from '@/domain/certification/certificate.repository';
import { Certificate, CertificateMetadata, CertificateTemplate } from '@/domain/certification/certificate.entity';
import { IStorageService } from '@/infrastructure/storage/storage.service';
import { IEventBus } from '@/shared/domain/event-bus';

export interface IssueCertificateDto {
  tenantId: string;
  studentId: string;
  studentName: string;
  courseId?: string;
  courseName: string;
  enrollmentId?: string;
  instructorName: string;
  completionDate: Date;
  score?: number;
  courseDuration: number;
  templateId?: string;
  expiresInDays?: number;
}

export interface CertificateVerificationResult {
  isValid: boolean;
  certificate?: {
    number: string;
    studentName: string;
    courseName: string;
    issuedAt: Date;
    status: 'valid' | 'expired' | 'revoked';
    expiresAt?: Date;
    revocationReason?: string;
  };
  error?: string;
}

export class CertificateService {
  constructor(
    private readonly certificateRepository: ICertificateRepository,
    private readonly templateRepository: ICertificateTemplateRepository,
    private readonly storageService: IStorageService,
    private readonly eventBus: IEventBus
  ) {}

  async issueCertificate(dto: IssueCertificateDto): Promise<Certificate> {
    // Get template
    const template = dto.templateId
      ? await this.templateRepository.findById(dto.templateId, dto.tenantId)
      : await this.templateRepository.findDefault(dto.tenantId, 'course');

    if (!template) {
      throw new Error('Certificate template not found');
    }

    // Create certificate metadata
    const metadata = new CertificateMetadata({
      studentName: dto.studentName,
      courseName: dto.courseName,
      instructorName: dto.instructorName,
      completionDate: dto.completionDate,
      score: dto.score,
      courseDuration: dto.courseDuration,
    });

    // Calculate expiration
    const expiresAt = dto.expiresInDays
      ? new Date(Date.now() + dto.expiresInDays * 24 * 60 * 60 * 1000)
      : undefined;

    // Issue certificate
    const certificate = Certificate.issue({
      tenantId: dto.tenantId,
      studentId: dto.studentId,
      courseId: dto.courseId,
      enrollmentId: dto.enrollmentId,
      templateId: template.id,
      metadata,
      expiresAt,
    });

    // Generate PDF
    const pdfBuffer = await this.generateCertificatePDF(certificate, template);

    // Upload to storage
    const filename = `certificates/${certificate.props.certificateNumber.value}.pdf`;
    const url = await this.storageService.upload(filename, pdfBuffer, {
      contentType: 'application/pdf',
      metadata: {
        tenantId: dto.tenantId,
        studentId: dto.studentId,
        courseId: dto.courseId,
      },
    });

    // Set certificate URL
    certificate.setCertificateUrl(url);

    // Save certificate
    await this.certificateRepository.save(certificate);

    // Publish events
    const events = certificate.getUncommittedEvents();
    for (const event of events) {
      await this.eventBus.publish(event);
    }
    certificate.markEventsAsCommitted();

    return certificate;
  }

  async verifyCertificate(
    verificationCode: string,
    tenantId?: string
  ): Promise<CertificateVerificationResult> {
    try {
      const certificate = await this.certificateRepository.findByVerificationCode(
        verificationCode,
        tenantId
      );

      if (!certificate) {
        return {
          isValid: false,
          error: 'Certificate not found',
        };
      }

      const verificationData = certificate.getVerificationData();

      return {
        isValid: certificate.isValid(),
        certificate: {
          number: verificationData.number,
          studentName: verificationData.studentName,
          courseName: verificationData.courseName,
          issuedAt: verificationData.issuedAt,
          status: verificationData.status,
          expiresAt: certificate.props.expiresAt,
          revocationReason: certificate.props.revocationReason,
        },
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Verification failed',
      };
    }
  }

  async revokeCertificate(
    certificateId: string,
    reason: string,
    tenantId: string
  ): Promise<void> {
    const certificate = await this.certificateRepository.findById(certificateId, tenantId);
    
    if (!certificate) {
      throw new Error('Certificate not found');
    }

    certificate.revoke(reason);
    await this.certificateRepository.save(certificate);
  }

  async getStudentCertificates(
    studentId: string,
    tenantId: string
  ): Promise<Certificate[]> {
    return this.certificateRepository.findByStudent(studentId, tenantId);
  }

  async getCourseCertificates(
    courseId: string,
    tenantId: string
  ): Promise<Certificate[]> {
    return this.certificateRepository.findByCourse(courseId, tenantId);
  }

  private async generateCertificatePDF(
    certificate: Certificate,
    template: CertificateTemplate
  ): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    
    // Set document properties
    pdfDoc.setTitle(`Certificate - ${certificate.props.metadata.value.courseName}`);
    pdfDoc.setAuthor(certificate.props.metadata.value.instructorName);
    pdfDoc.setSubject('Course Completion Certificate');
    pdfDoc.setCreator('Educational Marketplace Platform');

    // Add page with appropriate size
    const pageWidth = template.props.design.layout === 'landscape' ? 792 : 612;
    const pageHeight = template.props.design.layout === 'landscape' ? 612 : 792;
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Load fonts
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    // Apply background color
    if (template.props.design.backgroundColor) {
      const color = this.hexToRgb(template.props.design.backgroundColor);
      page.drawRectangle({
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
        color: rgb(color.r / 255, color.g / 255, color.b / 255),
      });
    }

    // Draw border if specified
    if (template.props.design.borderStyle) {
      page.drawRectangle({
        x: 20,
        y: 20,
        width: pageWidth - 40,
        height: pageHeight - 40,
        borderColor: rgb(0, 0, 0),
        borderWidth: 2,
      });
    }

    // Process template elements
    for (const element of template.props.design.elements) {
      if (element.type === 'text') {
        let text = element.content || '';
        
        // Replace variables with actual values
        if (element.variable) {
          text = this.replaceVariable(element.variable, certificate);
        }

        const font = element.style?.fontWeight === 'bold' ? helveticaBold : helvetica;
        const fontSize = element.style?.fontSize || 14;
        const color = element.style?.color ? this.hexToRgb(element.style.color) : { r: 0, g: 0, b: 0 };

        page.drawText(text, {
          x: element.position.x,
          y: pageHeight - element.position.y, // PDF coordinates are bottom-up
          size: fontSize,
          font,
          color: rgb(color.r / 255, color.g / 255, color.b / 255),
        });
      }
      // Add more element types as needed (images, shapes, etc.)
    }

    // Add verification footer
    const verificationText = `Certificate Number: ${certificate.props.certificateNumber.value} | Verification Code: ${certificate.props.verificationCode.value}`;
    page.drawText(verificationText, {
      x: pageWidth / 2 - 150,
      y: 30,
      size: 10,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Add QR code for verification (placeholder - would need QR library)
    // const qrCode = await this.generateQRCode(certificate.props.verificationCode.value);
    // page.drawImage(qrCode, { x: pageWidth - 100, y: 20, width: 80, height: 80 });

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  private replaceVariable(variable: string, certificate: Certificate): string {
    const metadata = certificate.props.metadata.value;
    const replacements: Record<string, string> = {
      studentName: metadata.studentName,
      courseName: metadata.courseName,
      instructorName: metadata.instructorName,
      completionDate: metadata.formattedCompletionDate,
      certificateNumber: certificate.props.certificateNumber.value,
      score: metadata.score?.toString() || '',
      grade: metadata.displayGrade,
      courseDuration: `${metadata.courseDuration} hours`,
      issuedDate: certificate.props.issuedAt.toLocaleDateString(),
    };

    return replacements[variable] || `{{${variable}}}`;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  }
}

// Certificate Template Repository Interface
export interface ICertificateTemplateRepository {
  findById(id: string, tenantId: string): Promise<CertificateTemplate | null>;
  findDefault(tenantId: string, type: 'course' | 'achievement' | 'pathway'): Promise<CertificateTemplate | null>;
  save(template: CertificateTemplate): Promise<void>;
}