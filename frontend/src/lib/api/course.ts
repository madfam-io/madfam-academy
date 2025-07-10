import { apiClient } from './client';
import type { Course, CourseFilters, Enrollment, CourseProgress } from '../../types/course';

export const courseApi = {
  // Get all courses with optional filters
  getCourses: async (filters?: CourseFilters): Promise<{ data: Course[]; pagination: any }> => {
    const params = new URLSearchParams();
    
    if (filters?.category) params.append('category', filters.category);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.solarpunkAligned !== undefined) params.append('solarpunk_aligned', filters.solarpunkAligned.toString());
    if (filters?.conocerCertified !== undefined) params.append('conocer_certified', filters.conocerCertified.toString());
    if (filters?.priceRange) {
      if (filters.priceRange.min !== undefined) params.append('price_min', filters.priceRange.min.toString());
      if (filters.priceRange.max !== undefined) params.append('price_max', filters.priceRange.max.toString());
    }
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const queryString = params.toString();
    const url = queryString ? `/courses?${queryString}` : '/courses';
    
    return apiClient.get(url);
  },

  // Get single course by ID
  getCourse: async (courseId: string): Promise<Course> => {
    return apiClient.get(`/courses/${courseId}`);
  },

  // Create new course (instructors only)
  createCourse: async (courseData: Partial<Course>): Promise<Course> => {
    return apiClient.post('/courses', courseData);
  },

  // Update existing course
  updateCourse: async (courseId: string, updates: Partial<Course>): Promise<Course> => {
    return apiClient.put(`/courses/${courseId}`, updates);
  },

  // Delete course
  deleteCourse: async (courseId: string): Promise<void> => {
    return apiClient.delete(`/courses/${courseId}`);
  },

  // Enroll in course
  enrollCourse: async (courseId: string, options: {
    paymentMethodId?: string;
    couponCode?: string;
    requestConocerCert?: boolean;
    solarpunkCommitment?: boolean;
  }): Promise<Enrollment> => {
    return apiClient.post(`/courses/${courseId}/enroll`, options);
  },

  // Get course progress for enrolled user
  getCourseProgress: async (courseId: string): Promise<CourseProgress> => {
    return apiClient.get(`/progress/courses/${courseId}`);
  },

  // Complete a lesson
  completeLesson: async (lessonId: string, data: {
    timeSpent: number;
    quizScore?: number;
    solarpunkActions?: Array<{
      actionType: string;
      title: string;
      description: string;
      impactScore: number;
    }>;
  }): Promise<{ progressUpdated: boolean; courseProgress: CourseProgress }> => {
    return apiClient.post(`/progress/lessons/${lessonId}/complete`, data);
  },

  // Get course reviews
  getCourseReviews: async (courseId: string, page = 1, limit = 10): Promise<{
    data: any[];
    pagination: any;
  }> => {
    return apiClient.get(`/courses/${courseId}/reviews?page=${page}&limit=${limit}`);
  },

  // Submit course review
  submitReview: async (courseId: string, review: {
    rating: number;
    comment: string;
    solarpunkImpactRating?: number;
  }): Promise<any> => {
    return apiClient.post(`/courses/${courseId}/reviews`, review);
  },

  // Get related courses
  getRelatedCourses: async (courseId: string, limit = 4): Promise<Course[]> => {
    return apiClient.get(`/courses/${courseId}/related?limit=${limit}`);
  },

  // Search courses
  searchCourses: async (query: string, filters?: Partial<CourseFilters>): Promise<{
    data: Course[];
    suggestions: string[];
    facets: any;
  }> => {
    const params = new URLSearchParams({ search: query });
    
    if (filters?.category) params.append('category', filters.category);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.solarpunkAligned !== undefined) params.append('solarpunk_aligned', filters.solarpunkAligned.toString());
    if (filters?.conocerCertified !== undefined) params.append('conocer_certified', filters.conocerCertified.toString());
    
    return apiClient.get(`/courses/search?${params.toString()}`);
  },

  // Get course analytics (instructors only)
  getCourseAnalytics: async (courseId: string, timeRange?: string): Promise<{
    enrollments: number;
    completions: number;
    averageRating: number;
    revenue: number;
    solarpunkImpact: {
      totalActionsRecorded: number;
      averageImpactScore: number;
      topActionTypes: Array<{ type: string; count: number }>;
    };
    studentProgress: Array<{
      userId: string;
      progressPercentage: number;
      lastActivity: string;
    }>;
  }> => {
    const params = timeRange ? `?timeRange=${timeRange}` : '';
    return apiClient.get(`/courses/${courseId}/analytics${params}`);
  },

  // Publish/unpublish course
  publishCourse: async (courseId: string): Promise<Course> => {
    return apiClient.post(`/courses/${courseId}/publish`);
  },

  unpublishCourse: async (courseId: string): Promise<Course> => {
    return apiClient.post(`/courses/${courseId}/unpublish`);
  },

  // Upload course thumbnail
  uploadThumbnail: async (courseId: string, file: File): Promise<{ thumbnailUrl: string }> => {
    const formData = new FormData();
    formData.append('thumbnail', file);
    
    return apiClient.post(`/courses/${courseId}/thumbnail`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Upload course materials
  uploadMaterial: async (courseId: string, file: File, type: 'video' | 'document' | 'image'): Promise<{
    materialId: string;
    url: string;
    type: string;
    size: number;
  }> => {
    const formData = new FormData();
    formData.append('material', file);
    formData.append('type', type);
    
    return apiClient.post(`/courses/${courseId}/materials`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get enrollment statistics
  getEnrollmentStats: async (courseId: string): Promise<{
    totalEnrollments: number;
    activeStudents: number;
    completionRate: number;
    averageTimeToComplete: number;
    enrollmentsByDate: Array<{ date: string; count: number }>;
  }> => {
    return apiClient.get(`/courses/${courseId}/stats/enrollments`);
  },

  // Bulk operations (admin only)
  bulkUpdateCourses: async (courseIds: string[], updates: Partial<Course>): Promise<{
    updated: number;
    errors: Array<{ courseId: string; error: string }>;
  }> => {
    return apiClient.post('/courses/bulk-update', { courseIds, updates });
  },

  // Export course data
  exportCourseData: async (courseId: string, format: 'csv' | 'json' | 'xlsx'): Promise<{
    downloadUrl: string;
    expiresAt: string;
  }> => {
    return apiClient.post(`/courses/${courseId}/export`, { format });
  },

  // Import course from template
  importCourseFromTemplate: async (templateId: string, customizations?: any): Promise<Course> => {
    return apiClient.post('/courses/import-template', { templateId, customizations });
  },

  // Get course templates
  getCourseTemplates: async (): Promise<Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    difficulty: string;
    estimatedDuration: number;
    solarpunkAligned: boolean;
  }>> => {
    return apiClient.get('/courses/templates');
  }
};