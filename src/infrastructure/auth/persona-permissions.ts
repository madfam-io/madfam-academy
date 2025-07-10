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
    ...PERSONA_PERMISSIONS.learner,
    
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
    ...PERSONA_PERMISSIONS.instructor,
    
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
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!PermissionChecker.hasPermission(req.user, permission)) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: `Missing permission: ${permission}`
      });
    }

    next();
  };
}

export function requireAnyPermission(...permissions: ResourceAction[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!PermissionChecker.hasAnyPermission(req.user, permissions)) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: `Missing any of permissions: ${permissions.join(', ')}`
      });
    }

    next();
  };
}

export function requireAllPermissions(...permissions: ResourceAction[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!PermissionChecker.hasAllPermissions(req.user, permissions)) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: `Missing required permissions`
      });
    }

    next();
  };
}

export function requirePersona(...personas: PersonaType[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!personas.includes(req.user.persona)) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: `Required persona: ${personas.join(' or ')}`
      });
    }

    next();
  };
}

// Dynamic permission checking for ownership
export function requireOwnership(
  permission: ResourceAction,
  getOwnerId: (req: AuthRequest) => string | Promise<string>
) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const ownerId = await getOwnerId(req);
      
      if (!PermissionChecker.checkOwnership(req.user, permission, ownerId)) {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'Insufficient permissions for this resource'
        });
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