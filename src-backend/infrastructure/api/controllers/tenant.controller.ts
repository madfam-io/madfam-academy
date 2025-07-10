import { Request, Response } from 'express';

export class TenantController {
  async getTenants(req: Request, res: Response): Promise<void> {
    res.json({ tenants: [] });
  }

  async getTenant(req: Request, res: Response): Promise<void> {
    res.json({ tenant: null });
  }

  async createTenant(req: Request, res: Response): Promise<void> {
    res.json({ success: true });
  }

  async updateTenant(req: Request, res: Response): Promise<void> {
    res.json({ success: true });
  }
}