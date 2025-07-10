import { Enrollment } from './progress.entity';

export interface EnrollmentRepository {
  findById(id: string): Promise<Enrollment | null>;
  save(enrollment: Enrollment): Promise<void>;
  findByUserId(userId: string): Promise<Enrollment[]>;
  findByCourseId(courseId: string): Promise<Enrollment[]>;
  findByUserAndCourse(userId: string, courseId: string): Promise<Enrollment | null>;
}