import { Request, Response, NextFunction } from 'express';
import { TenantService } from '@/application/services/tenant.service';
import { UnauthorizedException, NotFoundException } from '@/shared/exceptions';

export interface TenantRequest extends Request {
  tenant?: {
    id: string;
    subdomain: string;
    settings: Record<string, any>;
  };
  tenantId?: string;
}

export class TenantMiddleware {
  constructor(
    private readonly tenantService: TenantService
  ) {}

  /**
   * Extract tenant from subdomain
   */
  fromSubdomain() {
    return async (req: TenantRequest, res: Response, next: NextFunction) => {
      try {
        const host = req.get('host');
        if (!host) {
          throw new UnauthorizedException('Invalid request');
        }

        // Extract subdomain
        const subdomain = this.extractSubdomain(host);
        if (!subdomain || subdomain === 'www' || subdomain === 'api') {
          // No tenant-specific subdomain, continue without tenant
          return next();
        }

        // Load tenant
        const tenant = await this.tenantService.findBySubdomain(subdomain);
        if (!tenant) {
          throw new NotFoundException('Tenant not found');
        }

        // Attach tenant to request
        req.tenant = {
          id: tenant.id,
          subdomain: tenant.domain,
          settings: tenant.settings
        };
        req.tenantId = tenant.id;

        // Set tenant context for database queries
        await this.setDatabaseContext(tenant.id);

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Extract tenant from header
   */
  fromHeader(headerName: string = 'X-Tenant-ID') {
    return async (req: TenantRequest, res: Response, next: NextFunction) => {
      try {
        const tenantId = req.get(headerName);
        if (!tenantId) {
          // No tenant header, check if already set by subdomain
          if (req.tenantId) {
            return next();
          }
          throw new UnauthorizedException('Tenant ID required');
        }

        // Load tenant
        const tenant = await this.tenantService.findById(tenantId);
        if (!tenant) {
          throw new NotFoundException('Tenant not found');
        }

        // Attach tenant to request
        req.tenant = {
          id: tenant.id,
          subdomain: tenant.domain,
          settings: tenant.settings
        };
        req.tenantId = tenant.id;

        // Set tenant context for database queries
        await this.setDatabaseContext(tenant.id);

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Extract tenant from JWT token
   */
  fromToken() {
    return async (req: TenantRequest, res: Response, next: NextFunction) => {
      try {
        // Assumes auth middleware has already run and attached user
        const user = (req as any).user;
        if (!user || !user.tenantId) {
          throw new UnauthorizedException('Invalid token');
        }

        // Load tenant
        const tenant = await this.tenantService.findById(user.tenantId);
        if (!tenant) {
          throw new NotFoundException('Tenant not found');
        }

        // Attach tenant to request
        req.tenant = {
          id: tenant.id,
          subdomain: tenant.domain,
          settings: tenant.settings
        };
        req.tenantId = tenant.id;

        // Set tenant context for database queries
        await this.setDatabaseContext(tenant.id);

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Ensure tenant is present (use after other tenant middleware)
   */
  requireTenant() {
    return (req: TenantRequest, res: Response, next: NextFunction) => {
      if (!req.tenantId || !req.tenant) {
        return next(new UnauthorizedException('Tenant context required'));
      }
      next();
    };
  }

  /**
   * Validate tenant features/limits
   */
  requireFeature(feature: string) {
    return (req: TenantRequest, res: Response, next: NextFunction) => {
      if (!req.tenant) {
        return next(new UnauthorizedException('Tenant context required'));
      }

      const hasFeature = this.tenantService.hasFeature(req.tenant.id, feature);
      if (!hasFeature) {
        return next(new UnauthorizedException(`Feature '${feature}' not available for tenant`));
      }

      next();
    };
  }

  /**
   * Check tenant limits
   */
  checkLimit(resource: string, currentCount: number) {
    return async (req: TenantRequest, res: Response, next: NextFunction) => {
      if (!req.tenant) {
        return next(new UnauthorizedException('Tenant context required'));
      }

      const limit = await this.tenantService.getLimit(req.tenant.id, resource);
      if (limit !== null && currentCount >= limit) {
        return next(new UnauthorizedException(`Limit reached for ${resource}`));
      }

      next();
    };
  }

  private extractSubdomain(host: string): string | null {
    const parts = host.split('.');
    
    // Handle localhost
    if (host.includes('localhost')) {
      return null;
    }

    // For standard domains (e.g., subdomain.example.com)
    if (parts.length >= 3) {
      return parts[0];
    }

    return null;
  }

  private async setDatabaseContext(tenantId: string): Promise<void> {
    // This would set the tenant context for the current database connection
    // Implementation depends on your database strategy
    
    // For PostgreSQL with RLS:
    // await db.query(`SET app.current_tenant = '${tenantId}'`);
    
    // For separate schemas:
    // await db.query(`SET search_path TO tenant_${tenantId}, public`);
  }
}

// Factory function for creating tenant middleware
export function createTenantMiddleware(tenantService: TenantService) {
  const middleware = new TenantMiddleware(tenantService);
  
  return {
    fromSubdomain: middleware.fromSubdomain.bind(middleware),
    fromHeader: middleware.fromHeader.bind(middleware),
    fromToken: middleware.fromToken.bind(middleware),
    requireTenant: middleware.requireTenant.bind(middleware),
    requireFeature: middleware.requireFeature.bind(middleware),
    checkLimit: middleware.checkLimit.bind(middleware),
  };
}

// Example usage in Express app:
/*
import express from 'express';
import { createTenantMiddleware } from './tenant.middleware';
import { tenantService } from './services';

const app = express();
const tenantMiddleware = createTenantMiddleware(tenantService);

// Apply tenant resolution globally
app.use(tenantMiddleware.fromSubdomain());
app.use(tenantMiddleware.fromHeader());

// Protected routes
app.use('/api/courses', 
  tenantMiddleware.requireTenant(),
  tenantMiddleware.requireFeature('courses'),
  coursesRouter
);

// Limit checking
app.post('/api/courses',
  tenantMiddleware.requireTenant(),
  async (req, res, next) => {
    const courseCount = await courseService.countByTenant(req.tenantId);
    next();
  },
  tenantMiddleware.checkLimit('courses', courseCount),
  createCourseHandler
);
*/