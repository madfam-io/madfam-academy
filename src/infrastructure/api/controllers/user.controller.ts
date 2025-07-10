import { Request, Response } from 'express';

export class UserController {
  async getUsers(req: Request, res: Response): Promise<void> {
    res.json({ users: [] });
  }

  async getUser(req: Request, res: Response): Promise<void> {
    res.json({ user: null });
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    res.json({ success: true });
  }
}