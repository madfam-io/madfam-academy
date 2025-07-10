import { Request, Response, NextFunction } from 'express';

export type PersonaType = 'learner' | 'instructor' | 'admin' | 'super_admin';
export type ResourceAction = string; // Format: "resource:action" or "resource:action:scope"

interface User {
  id: string;
  tenantId: string;
  persona: PersonaType;
  permissions?: string[];
}

interface AuthRequest extends Request {
  user?: User;
  tenantId?: string;
}

// Permission definitions by persona
export const PERSONA_PERMISSIONS: Record<PersonaType, ResourceAction[]> = {
  learner: [
    // Catalog
    'catalog:read',
    'course:read',
    'category:read',
    
    // Enrollments
    'enrollment:create:own',
    'enrollment:read:own',
    'enrollment:cancel:own',
    
    // Progress
    'progress:read:own',
    'progress:update:own',
    
    // Certificates
    'certificate:read:own',
    'certificate:download:own',
    
    // Profile
    'profile:read:own',
    'profile:update:own',
    
    // Reviews
    'review:create',
    'review:read',
    'review:update:own',
    'review:delete:own',
    
    // Discussions
    'discussion:create',
    'discussion:read',
    'discussion:update:own',
    'discussion:delete:own',
  ],

  instructor: [
    // Include all learner permissions
    'catalog:read',
    'course:read',
    'category:read',
    'enrollment:create:own',
    'enrollment:read:own',
    'enrollment:cancel:own',
    'progress:read:own',
    'progress:update:own',
    'certificate:read:own',
    'certificate:download:own',
    'profile:read:own',
    'profile:update:own',
    'review:create',
    'review:read',
    'review:update:own',
    'review:delete:own',
    'discussion:create',
    'discussion:read',
    'discussion:update:own',
    'discussion:delete:own',
    
    // Course Management
    'course:create',
    'course:update:own',
    'course:delete:own',
    'course:publish:own',
    'course:archive:own',
    
    // Module & Lesson Management
    'module:create:own',
    'module:read:own',
    'module:update:own',
    'module:delete:own',
    'lesson:create:own',
    'lesson:read:own',
    'lesson:update:own',
    'lesson:delete:own',
    
    // Content Management
    'content:upload:own',
    'content:read:own',
    'content:delete:own',
    
    // Student Management
    'enrollment:read:own_courses',
    'progress:read:own_courses',
    
    // Analytics
    'analytics:read:own',
    'revenue:read:own',
    
    // Announcements
    'announcement:create:own_courses',
    'announcement:update:own',
    'announcement:delete:own',
  ],

  admin: [
    // Include all instructor permissions
    'catalog:read',
    'course:read',
    'category:read',
    'enrollment:create:own',
    'enrollment:read:own',
    'enrollment:cancel:own',
    'progress:read:own',
    'progress:update:own',
    'certificate:read:own',
    'certificate:download:own',
    'profile:read:own',
    'profile:update:own',
    'review:create',
    'review:read',
    'review:update:own',
    'review:delete:own',
    'discussion:create',
    'discussion:read',
    'discussion:update:own',
    'discussion:delete:own',
    'course:create',
    'course:update:own',
    'course:delete:own',
    'course:publish:own',
    'course:archive:own',
    'module:create:own',
    'module:read:own',
    'module:update:own',
    'module:delete:own',
    'lesson:create:own',
    'lesson:read:own',
    'lesson:update:own',
    'lesson:delete:own',
    'content:upload:own',
    'content:read:own',
    'content:delete:own',
    'enrollment:read:own_courses',
    'progress:read:own_courses',
    'analytics:read:own',
    'revenue:read:own',
    'announcement:create:own_courses',
    'announcement:update:own',
    'announcement:delete:own',
    
    // User Management
    'user:read:tenant',
    'user:create:tenant',
    'user:update:tenant',
    'user:delete:tenant',
    'user:suspend:tenant',
    
    // Course Management (all courses in tenant)
    'course:read:tenant',
    'course:update:tenant',
    'course:delete:tenant',
    'course:publish:tenant',
    'course:feature:tenant',
    
    // Category Management
    'category:create',
    'category:update',
    'category:delete',
    
    // Tenant Settings
    'tenant:read:own',
    'tenant:update:own',
    'settings:read:tenant',
    'settings:update:tenant',
    
    // Moderation
    'content:moderate:tenant',
    'review:moderate:tenant',
    'discussion:moderate:tenant',
    
    // Analytics (tenant-wide)
    'analytics:read:tenant',
    'revenue:read:tenant',
    'reports:generate:tenant',
    
    // Billing
    'billing:read:tenant',
    'subscription:manage:tenant',
  ],

  super_admin: [
    // Full system access
    '*:*:*',
    
    // Platform-specific
    'tenant:create',
    'tenant:read:all',
    'tenant:update:all',
    'tenant:delete',
    'tenant:suspend',
    
    'user:read:all',
    'user:update:all',
    'user:impersonate',
    
    'platform:configure',
    'platform:monitor',
    'platform:backup',
  ],
};

// Permission checking utilities
export class PermissionChecker {
  /**
   * Check if user has a specific permission
   */
  static hasPermission(user: User, requiredPermission: ResourceAction): boolean {
    const userPermissions = this.getUserPermissions(user);
    
    // Check exact match
    if (userPermissions.includes(requiredPermission)) {
      return true;
    }

    // Check wildcard permissions
    const [resource, action, scope] = requiredPermission.split(':');
    
    // Check resource wildcard (e.g., "course:*")
    if (userPermissions.includes(`${resource}:*`)) {
      return true;
    }

    // Check full wildcard (e.g., "*:*:*" for super admin)
    if (userPermissions.includes('*:*:*') || userPermissions.includes('*:*')) {
      return true;
    }

    return false;
  }

  /**
   * Check if user has all required permissions
   */
  static hasAllPermissions(user: User, requiredPermissions: ResourceAction[]): boolean {
    return requiredPermissions.every(permission => 
      this.hasPermission(user, permission)
    );
  }

  /**
   * Check if user has any of the required permissions
   */
  static hasAnyPermission(user: User, requiredPermissions: ResourceAction[]): boolean {
    return requiredPermissions.some(permission => 
      this.hasPermission(user, permission)
    );
  }

  /**
   * Get all permissions for a user
   */
  static getUserPermissions(user: User): ResourceAction[] {
    const basePermissions = PERSONA_PERMISSIONS[user.persona] || [];
    const customPermissions = user.permissions || [];
    return [...basePermissions, ...customPermissions];
  }

  /**
   * Check ownership-based permissions
   */
  static checkOwnership(
    user: User, 
    permission: ResourceAction, 
    resourceOwnerId: string
  ): boolean {
    if (!this.hasPermission(user, permission)) {
      return false;
    }

    // If permission includes "own" scope, check ownership
    if (permission.includes(':own')) {
      return user.id === resourceOwnerId;
    }

    return true;
  }

  /**
   * Check tenant-scoped permissions
   */
  static checkTenantScope(
    user: User,
    permission: ResourceAction,
    resourceTenantId: string
  ): boolean {
    if (!this.hasPermission(user, permission)) {
      return false;
    }

    // Super admin can access all tenants
    if (user.persona === 'super_admin') {
      return true;
    }

    // Check if permission is tenant-scoped
    if (permission.includes(':tenant')) {
      return user.tenantId === resourceTenantId;
    }

    return true;
  }
}

// Express middleware factories
export function requirePermission(permission: ResourceAction) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!PermissionChecker.hasPermission(req.user, permission)) {
      res.status(403).json({ 
        error: 'Forbidden',
        message: `Missing permission: ${permission}`
      });
      return;
    }

    next();
  };
}

export function requireAnyPermission(...permissions: ResourceAction[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!PermissionChecker.hasAnyPermission(req.user, permissions)) {
      res.status(403).json({ 
        error: 'Forbidden',
        message: `Missing any of permissions: ${permissions.join(', ')}`
      });
      return;
    }

    next();
  };
}

export function requireAllPermissions(...permissions: ResourceAction[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!PermissionChecker.hasAllPermissions(req.user, permissions)) {
      res.status(403).json({ 
        error: 'Forbidden',
        message: `Missing required permissions`
      });
      return;
    }

    next();
  };
}

export function requirePersona(...personas: PersonaType[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!personas.includes(req.user.persona)) {
      res.status(403).json({ 
        error: 'Forbidden',
        message: `Required persona: ${personas.join(' or ')}`
      });
      return;
    }

    next();
  };
}

// Dynamic permission checking for ownership
export function requireOwnership(
  permission: ResourceAction,
  getOwnerId: (req: AuthRequest) => string | Promise<string>
) {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    try {
      const ownerId = await getOwnerId(req);
      
      if (!PermissionChecker.checkOwnership(req.user, permission, ownerId)) {
        res.status(403).json({ 
          error: 'Forbidden',
          message: 'Insufficient permissions for this resource'
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

// Example usage:
/*
// Basic permission check
router.post('/courses', 
  requirePermission('course:create'), 
  createCourseHandler
);

// Multiple permission options
router.get('/analytics',
  requireAnyPermission('analytics:read:own', 'analytics:read:tenant'),
  getAnalyticsHandler
);

// Persona-based
router.get('/admin/users',
  requirePersona('admin', 'super_admin'),
  listUsersHandler
);

// Ownership-based
router.put('/courses/:id',
  requireOwnership('course:update:own', async (req) => {
    const course = await courseService.findById(req.params.id);
    return course.instructorId;
  }),
  updateCourseHandler
);

// Combined checks
router.delete('/courses/:id',
  requirePermission('course:delete:own'),
  requireOwnership('course:delete:own', async (req) => {
    const course = await courseService.findById(req.params.id);
    return course.instructorId;
  }),
  deleteCourseHandler
);
*/