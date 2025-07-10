import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware';
import { requirePersona, requirePermission } from '@/infrastructure/auth/persona-permissions';
import { CourseController } from '../controllers/course.controller';
import { EnrollmentController } from '../controllers/enrollment.controller';
import { CertificateController } from '../controllers/certificate.controller';
import { AnalyticsController } from '../controllers/analytics.controller';
import { UserController } from '../controllers/user.controller';
import { TenantController } from '../controllers/tenant.controller';

export function createPersonaRoutes(
  courseController: CourseController,
  enrollmentController: EnrollmentController,
  certificateController: CertificateController,
  analyticsController: AnalyticsController,
  userController: UserController,
  tenantController: TenantController
): Router {
  const router = Router();

  // =====================================================
  // LEARNER ROUTES
  // =====================================================
  const learnerRouter = Router();
  learnerRouter.use(authenticateUser);
  learnerRouter.use(requirePersona('learner', 'instructor', 'admin', 'super_admin'));

  // Course browsing
  learnerRouter.get('/courses', courseController.listCourses);
  learnerRouter.get('/courses/:id', courseController.getCourseDetails);
  learnerRouter.get('/courses/slug/:slug', courseController.getCourseBySlug);

  // Enrollments
  learnerRouter.post('/enrollments', requirePermission('enrollment:create:own'), enrollmentController.enrollInCourse);
  learnerRouter.get('/enrollments', requirePermission('enrollment:read:own'), enrollmentController.getMyEnrollments);
  learnerRouter.get('/enrollments/:id', requirePermission('enrollment:read:own'), enrollmentController.getEnrollmentDetails);

  // Progress tracking
  learnerRouter.post('/enrollments/:id/lessons/:lessonId/start', requirePermission('progress:update:own'), enrollmentController.startLesson);
  learnerRouter.patch('/enrollments/:id/lessons/:lessonId/progress', requirePermission('progress:update:own'), enrollmentController.updateLessonProgress);
  learnerRouter.get('/enrollments/:id/progress', requirePermission('progress:read:own'), enrollmentController.getProgressSummary);

  // Certificates
  learnerRouter.get('/certificates', requirePermission('certificate:read:own'), certificateController.getMyCertificates);
  learnerRouter.get('/certificates/:id', requirePermission('certificate:read:own'), certificateController.getCertificateDetails);
  learnerRouter.get('/certificates/:id/download', requirePermission('certificate:download:own'), certificateController.downloadCertificate);

  // Profile
  learnerRouter.get('/profile', requirePermission('profile:read:own'), userController.getMyProfile);
  learnerRouter.patch('/profile', requirePermission('profile:update:own'), userController.updateMyProfile);

  router.use('/learner', learnerRouter);

  // =====================================================
  // INSTRUCTOR ROUTES
  // =====================================================
  const instructorRouter = Router();
  instructorRouter.use(authenticateUser);
  instructorRouter.use(requirePersona('instructor', 'admin', 'super_admin'));

  // Course management
  instructorRouter.post('/courses', requirePermission('course:create'), courseController.createCourse);
  instructorRouter.get('/courses', requirePermission('course:read:own'), courseController.getInstructorCourses);
  instructorRouter.put('/courses/:id', requirePermission('course:update:own'), courseController.updateCourse);
  instructorRouter.post('/courses/:id/publish', requirePermission('course:publish:own'), courseController.publishCourse);
  instructorRouter.delete('/courses/:id', requirePermission('course:delete:own'), courseController.archiveCourse);

  // Module and lesson management
  instructorRouter.post('/courses/:id/modules', requirePermission('module:create:own'), courseController.addModule);
  instructorRouter.delete('/courses/:id/modules/:moduleId', requirePermission('module:delete:own'), courseController.removeModule);
  instructorRouter.put('/courses/:id/modules/reorder', requirePermission('module:update:own'), courseController.reorderModules);

  // Student management
  instructorRouter.get('/courses/:id/enrollments', requirePermission('enrollment:read:own_courses'), enrollmentController.getCourseEnrollments);
  instructorRouter.get('/courses/:id/analytics', requirePermission('analytics:read:own'), analyticsController.getCourseAnalytics);

  // Revenue and analytics
  instructorRouter.get('/analytics/revenue', requirePermission('revenue:read:own'), analyticsController.getInstructorRevenue);
  instructorRouter.get('/analytics/engagement', requirePermission('analytics:read:own'), analyticsController.getEngagementMetrics);

  router.use('/instructor', instructorRouter);

  // =====================================================
  // ADMIN ROUTES
  // =====================================================
  const adminRouter = Router();
  adminRouter.use(authenticateUser);
  adminRouter.use(requirePersona('admin', 'super_admin'));

  // User management
  adminRouter.get('/users', requirePermission('user:read:tenant'), userController.listTenantUsers);
  adminRouter.post('/users', requirePermission('user:create:tenant'), userController.createUser);
  adminRouter.put('/users/:id', requirePermission('user:update:tenant'), userController.updateUser);
  adminRouter.post('/users/:id/suspend', requirePermission('user:suspend:tenant'), userController.suspendUser);

  // Course management (all courses in tenant)
  adminRouter.get('/courses', requirePermission('course:read:tenant'), courseController.getAllTenantCourses);
  adminRouter.put('/courses/:id', requirePermission('course:update:tenant'), courseController.updateCourse);
  adminRouter.post('/courses/:id/feature', requirePermission('course:feature:tenant'), courseController.featureCourse);

  // Category management
  adminRouter.get('/categories', requirePermission('category:read'), courseController.listCategories);
  adminRouter.post('/categories', requirePermission('category:create'), courseController.createCategory);
  adminRouter.put('/categories/:id', requirePermission('category:update'), courseController.updateCategory);
  adminRouter.delete('/categories/:id', requirePermission('category:delete'), courseController.deleteCategory);

  // Tenant settings
  adminRouter.get('/tenant', requirePermission('tenant:read:own'), tenantController.getTenantDetails);
  adminRouter.put('/tenant/settings', requirePermission('settings:update:tenant'), tenantController.updateSettings);

  // Analytics (tenant-wide)
  adminRouter.get('/analytics/overview', requirePermission('analytics:read:tenant'), analyticsController.getTenantOverview);
  adminRouter.get('/analytics/courses', requirePermission('analytics:read:tenant'), analyticsController.getTenantCourseAnalytics);
  adminRouter.get('/analytics/revenue', requirePermission('revenue:read:tenant'), analyticsController.getTenantRevenue);
  adminRouter.post('/analytics/report', requirePermission('reports:generate:tenant'), analyticsController.generateReport);

  router.use('/admin', adminRouter);

  // =====================================================
  // SUPER ADMIN ROUTES
  // =====================================================
  const superAdminRouter = Router();
  superAdminRouter.use(authenticateUser);
  superAdminRouter.use(requirePersona('super_admin'));

  // Tenant management
  superAdminRouter.post('/tenants', requirePermission('tenant:create'), tenantController.createTenant);
  superAdminRouter.get('/tenants', requirePermission('tenant:read:all'), tenantController.listAllTenants);
  superAdminRouter.get('/tenants/:id', requirePermission('tenant:read:all'), tenantController.getTenantById);
  superAdminRouter.put('/tenants/:id', requirePermission('tenant:update:all'), tenantController.updateTenant);
  superAdminRouter.post('/tenants/:id/suspend', requirePermission('tenant:suspend'), tenantController.suspendTenant);

  // User management (cross-tenant)
  superAdminRouter.get('/users', requirePermission('user:read:all'), userController.listAllUsers);
  superAdminRouter.post('/users/:id/impersonate', requirePermission('user:impersonate'), userController.impersonateUser);

  // Platform configuration
  superAdminRouter.get('/platform/config', requirePermission('platform:configure'), tenantController.getPlatformConfig);
  superAdminRouter.put('/platform/config', requirePermission('platform:configure'), tenantController.updatePlatformConfig);

  // Platform monitoring
  superAdminRouter.get('/platform/health', requirePermission('platform:monitor'), analyticsController.getHealthStatus);
  superAdminRouter.get('/platform/metrics', requirePermission('platform:monitor'), analyticsController.getPlatformMetrics);

  router.use('/super-admin', superAdminRouter);

  // =====================================================
  // PUBLIC ROUTES (No authentication required)
  // =====================================================
  const publicRouter = Router();

  // Certificate verification
  publicRouter.get('/verify/certificate/:code', certificateController.verifyCertificate);

  // Public course catalog (if enabled)
  publicRouter.get('/catalog/courses', courseController.getPublicCourses);
  publicRouter.get('/catalog/categories', courseController.getPublicCategories);

  router.use('/public', publicRouter);

  return router;
}

// Example middleware for specific resource ownership checks
export function courseOwnershipMiddleware() {
  return async (req: any, res: any, next: any) => {
    try {
      const courseId = req.params.id;
      const userId = req.user.id;
      const courseService = req.app.get('courseService');
      
      const course = await courseService.findById(courseId, req.tenantId);
      
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }
      
      if (course.props.instructorId !== userId && req.user.persona !== 'admin' && req.user.persona !== 'super_admin') {
        return res.status(403).json({ error: 'You do not own this course' });
      }
      
      req.course = course;
      next();
    } catch (error) {
      next(error);
    }
  };
}

// Example usage in Express app:
/*
import express from 'express';
import { createPersonaRoutes } from './persona-routes';

const app = express();

// Initialize controllers...
const courseController = new CourseController(courseService);
// ... other controllers

// Create and mount persona routes
const personaRoutes = createPersonaRoutes(
  courseController,
  enrollmentController,
  certificateController,
  analyticsController,
  userController,
  tenantController
);

app.use('/api/v1', personaRoutes);
*/