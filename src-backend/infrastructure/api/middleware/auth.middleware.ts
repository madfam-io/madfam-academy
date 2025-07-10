import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    roles: string[];
  };
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  // Placeholder authentication middleware
  req.user = {
    id: 'user-123',
    email: 'user@example.com',
    roles: ['student']
  };
  next();
}

export function authenticateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  // Alias for authenticate to match route imports
  authenticate(req, res, next);
}

export function authorize(roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const hasRole = roles.some(role => req.user!.roles.includes(role));
    if (!hasRole) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    next();
  };
}