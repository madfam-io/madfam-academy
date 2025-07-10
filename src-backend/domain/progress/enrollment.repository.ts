import { Enrollment } from './progress.entity';

export interface EnrollmentRepository {
  findById(id: string): Promise<Enrollment | null>;
  save(enrollment: Enrollment): Promise<void>;
  findByUserId(userId: string): Promise<Enrollment[]>;
  findByCourseId(courseId: string, tenantId: string): Promise<Enrollment[]>;
  findByUserAndCourse(userId: string, courseId: string): Promise<Enrollment | null>;
  findByStudentAndCourse(studentId: string, courseId: string): Promise<Enrollment | null>;
  findByStudent(studentId: string, tenantId: string): Promise<Enrollment[]>;
}