import { Request, Response } from 'express';

export class EnrollmentController {
  async getEnrollments(req: Request, res: Response): Promise<void> {
    res.json({ enrollments: [] });
  }

  async createEnrollment(req: Request, res: Response): Promise<void> {
    res.json({ success: true });
  }

  async updateProgress(req: Request, res: Response): Promise<void> {
    res.json({ success: true });
  }
}