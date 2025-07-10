import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Course, CourseFilters, CourseSearchResult, CourseCategory, Instructor } from '@/types/course';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.request<T>(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Course API methods
  courses = {
    search: async (filters: CourseFilters): Promise<CourseSearchResult> => {
      // Mock data for development
      return this.getMockCourseSearchResult(filters);
    },

    getById: async (id: string): Promise<Course> => {
      return this.request<Course>({
        method: 'GET',
        url: `/courses/${id}`,
      });
    },

    getBySlug: async (slug: string): Promise<Course> => {
      return this.request<Course>({
        method: 'GET',
        url: `/courses/slug/${slug}`,
      });
    },

    getFeatured: async (limit: number = 8): Promise<Course[]> => {
      return this.request<Course[]>({
        method: 'GET',
        url: '/courses/featured',
        params: { limit },
      });
    },

    getPopular: async (limit: number = 8): Promise<Course[]> => {
      return this.request<Course[]>({
        method: 'GET',
        url: '/courses/popular',
        params: { limit },
      });
    },

    getRecent: async (limit: number = 8): Promise<Course[]> => {
      return this.request<Course[]>({
        method: 'GET',
        url: '/courses/recent',
        params: { limit },
      });
    },

    getByCategory: async (categoryId: string, limit: number = 12): Promise<Course[]> => {
      return this.request<Course[]>({
        method: 'GET',
        url: `/courses/category/${categoryId}`,
        params: { limit },
      });
    },

    getByInstructor: async (instructorId: string, limit: number = 12): Promise<Course[]> => {
      return this.request<Course[]>({
        method: 'GET',
        url: `/courses/instructor/${instructorId}`,
        params: { limit },
      });
    },

    getRelated: async (courseId: string, limit: number = 4): Promise<Course[]> => {
      return this.request<Course[]>({
        method: 'GET',
        url: `/courses/${courseId}/related`,
        params: { limit },
      });
    },

    getReviews: async (courseId: string, page: number = 1, limit: number = 10) => {
      return this.request({
        method: 'GET',
        url: `/courses/${courseId}/reviews`,
        params: { page, limit },
      });
    },

    getCurriculum: async (courseId: string) => {
      return this.request({
        method: 'GET',
        url: `/courses/${courseId}/curriculum`,
      });
    },
  };

  // Category API methods
  categories = {
    getAll: async (): Promise<CourseCategory[]> => {
      return this.request<CourseCategory[]>({
        method: 'GET',
        url: '/categories',
      });
    },

    getById: async (id: string): Promise<CourseCategory> => {
      return this.request<CourseCategory>({
        method: 'GET',
        url: `/categories/${id}`,
      });
    },

    getFeatured: async (): Promise<CourseCategory[]> => {
      return this.request<CourseCategory[]>({
        method: 'GET',
        url: '/categories/featured',
      });
    },
  };

  // Instructor API methods
  instructors = {
    getAll: async (): Promise<Instructor[]> => {
      return this.request<Instructor[]>({
        method: 'GET',
        url: '/instructors',
      });
    },

    getById: async (id: string): Promise<Instructor> => {
      return this.request<Instructor>({
        method: 'GET',
        url: `/instructors/${id}`,
      });
    },

    getFeatured: async (): Promise<Instructor[]> => {
      return this.request<Instructor[]>({
        method: 'GET',
        url: '/instructors/featured',
      });
    },
  };

  // Mock data helper for development
  private getMockCourseSearchResult(filters: CourseFilters): Promise<CourseSearchResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockCourses: Course[] = this.generateMockCourses(filters);
        
        resolve({
          courses: mockCourses,
          total: 156,
          hasMore: (filters.page || 1) < 13,
          page: filters.page || 1,
          totalPages: 13,
          filters: {
            categories: [
              { value: 'web-development', label: 'Web Development', count: 45 },
              { value: 'data-science', label: 'Data Science', count: 32 },
              { value: 'design', label: 'Design', count: 28 },
            ],
            levels: [
              { value: 'beginner', label: 'Beginner', count: 67 },
              { value: 'intermediate', label: 'Intermediate', count: 52 },
              { value: 'advanced', label: 'Advanced', count: 37 },
            ],
            priceRanges: [
              { value: '0-50', label: 'Under $50', count: 43 },
              { value: '50-100', label: '$50 - $100', count: 56 },
              { value: '100-200', label: '$100 - $200', count: 34 },
            ],
            features: [
              { value: 'certificate', label: 'Certificate', count: 89 },
              { value: 'lifetime', label: 'Lifetime Access', count: 76 },
            ],
            languages: [
              { value: 'english', label: 'English', count: 145 },
              { value: 'spanish', label: 'Spanish', count: 11 },
            ],
            instructors: [
              { value: 'john-doe', label: 'John Doe', count: 12 },
              { value: 'jane-smith', label: 'Jane Smith', count: 8 },
            ],
          },
        });
      }, 800);
    });
  }

  private generateMockCourses(filters: CourseFilters): Course[] {
    const limit = filters.limit || 12;
    const courses: Course[] = [];

    for (let i = 0; i < limit; i++) {
      courses.push({
        id: `course-${i + 1}`,
        title: `Advanced ${['React', 'Vue', 'Angular', 'Node.js', 'Python', 'Java', 'Go', 'Rust'][i % 8]} Development`,
        slug: `advanced-${['react', 'vue', 'angular', 'nodejs', 'python', 'java', 'go', 'rust'][i % 8]}-development`,
        description: 'Master modern web development with hands-on projects and real-world applications.',
        shortDescription: 'Learn advanced concepts and build production-ready applications.',
        thumbnail: `https://images.unsplash.com/photo-${1600000000000 + i}?w=400&h=300&fit=crop`,
        images: [`https://images.unsplash.com/photo-${1600000000000 + i}?w=800&h=600&fit=crop`],
        price: {
          amount: [99, 149, 199, 0, 299, 399][i % 6],
          currency: 'USD',
          compareAtPrice: i % 3 === 0 ? [199, 249, 299, 99, 399, 499][i % 6] : undefined,
        },
        instructor: {
          id: `instructor-${(i % 4) + 1}`,
          name: ['John Doe', 'Jane Smith', 'Alex Johnson', 'Sarah Wilson'][i % 4],
          avatar: `https://images.unsplash.com/photo-${1500000000000 + (i % 4)}?w=100&h=100&fit=crop&crop=face`,
          bio: 'Senior developer with 10+ years of experience.',
          rating: 4.5 + (i % 5) * 0.1,
          coursesCount: 5 + (i % 10),
        },
        category: {
          id: ['web-dev', 'data-science', 'design', 'business'][i % 4],
          name: ['Web Development', 'Data Science', 'Design', 'Business'][i % 4],
          slug: ['web-development', 'data-science', 'design', 'business'][i % 4],
        },
        tags: ['programming', 'web', 'frontend', 'backend'].slice(0, 2 + (i % 3)),
        level: ['beginner', 'intermediate', 'advanced'][i % 3] as any,
        duration: {
          hours: 8 + (i % 20),
          minutes: 30,
          totalMinutes: (8 + (i % 20)) * 60 + 30,
        },
        language: 'en',
        subtitles: ['en', 'es'],
        rating: {
          average: 4.0 + (i % 10) * 0.1,
          count: 100 + (i * 23),
          distribution: { 5: 60, 4: 25, 3: 10, 2: 3, 1: 2 },
        },
        enrollment: {
          count: 1000 + (i * 157),
          isUnlimited: true,
        },
        status: 'published',
        publishedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        lastUpdated: new Date().toISOString(),
        createdAt: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toISOString(),
        features: {
          hasVideos: true,
          hasQuizzes: i % 2 === 0,
          hasAssignments: i % 3 === 0,
          hasCertificate: i % 2 === 1,
          hasDownloads: i % 4 === 0,
          lifetimeAccess: true,
          mobileAccess: true,
        },
        curriculum: [],
        requirements: ['Basic programming knowledge', 'Computer with internet access'],
        learningObjectives: ['Build modern applications', 'Understand advanced concepts'],
        targetAudience: ['Developers', 'Students', 'Professionals'],
        seo: {
          metaTitle: `Learn Advanced ${['React', 'Vue', 'Angular'][i % 3]} Development`,
          metaDescription: 'Master modern web development with this comprehensive course.',
          keywords: ['programming', 'web development', 'javascript'],
        },
        preview: i % 3 === 0 ? {
          videoUrl: 'https://example.com/preview.mp4',
          duration: 120,
        } : undefined,
      });
    }

    return courses;
  }
}

export const api = new ApiClient();