import { Request, Response } from 'express';

export class AnalyticsController {
  async getAnalytics(req: Request, res: Response): Promise<void> {
    res.json({ analytics: {} });
  }

  async getMetrics(req: Request, res: Response): Promise<void> {
    res.json({ metrics: [] });
  }
}