export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  images: string[];
  price: {
    amount: number;
    currency: string;
    compareAtPrice?: number;
  };
  instructor: {
    id: string;
    name: string;
    avatar: string;
    bio: string;
    rating: number;
    coursesCount: number;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  subcategory?: {
    id: string;
    name: string;
    slug: string;
  };
  tags: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: {
    hours: number;
    minutes: number;
    totalMinutes: number;
  };
  language: string;
  subtitles: string[];
  rating: {
    average: number;
    count: number;
    distribution: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
  };
  enrollment: {
    count: number;
    capacity?: number;
    isUnlimited: boolean;
  };
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  lastUpdated: string;
  createdAt: string;
  features: {
    hasVideos: boolean;
    hasQuizzes: boolean;
    hasAssignments: boolean;
    hasCertificate: boolean;
    hasDownloads: boolean;
    lifetimeAccess: boolean;
    mobileAccess: boolean;
  };
  curriculum: CourseModule[];
  requirements: string[];
  learningObjectives: string[];
  targetAudience: string[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  preview?: {
    videoUrl: string;
    duration: number;
  };
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  order: number;
  duration: {
    hours: number;
    minutes: number;
  };
  lessons: CourseLesson[];
  isPreview: boolean;
}

export interface CourseLesson {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article' | 'quiz' | 'assignment' | 'resource';
  duration: {
    minutes: number;
  };
  order: number;
  isPreview: boolean;
  isMandatory: boolean;
  content?: {
    videoUrl?: string;
    articleContent?: string;
    resources?: LessonResource[];
  };
}

export interface LessonResource {
  id: string;
  title: string;
  type: 'pdf' | 'document' | 'link' | 'download';
  url: string;
  size?: number;
}

export interface CourseFilters {
  query?: string;
  categories?: string[];
  subcategories?: string[];
  levels?: ('beginner' | 'intermediate' | 'advanced')[];
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  duration?: {
    min: number; // in hours
    max: number;
  };
  features?: string[];
  language?: string[];
  instructor?: string[];
  tags?: string[];
  sortBy?: 'relevance' | 'newest' | 'price_low' | 'price_high' | 'rating' | 'popular';
  page?: number;
  limit?: number;
}

export interface CourseSearchResult {
  courses: Course[];
  total: number;
  hasMore: boolean;
  page: number;
  totalPages: number;
  filters: {
    categories: FilterOption[];
    levels: FilterOption[];
    priceRanges: FilterOption[];
    features: FilterOption[];
    languages: FilterOption[];
    instructors: FilterOption[];
  };
}

export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

export interface CourseCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  coursesCount: number;
  subcategories: CourseSubcategory[];
  featured: boolean;
  order: number;
}

export interface CourseSubcategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  coursesCount: number;
  order: number;
}

export interface Instructor {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  title: string;
  company?: string;
  website?: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    youtube?: string;
  };
  rating: {
    average: number;
    count: number;
  };
  stats: {
    coursesCount: number;
    studentsCount: number;
    reviewsCount: number;
  };
  expertise: string[];
  languages: string[];
  verified: boolean;
  featured: boolean;
  joinedAt: string;
}

export interface CourseReview {
  id: string;
  courseId: string;
  studentId: string;
  student: {
    name: string;
    avatar: string;
  };
  rating: number;
  title: string;
  comment: string;
  helpful: number;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseProgress {
  courseId: string;
  studentId: string;
  enrolledAt: string;
  lastAccessedAt: string;
  completionPercentage: number;
  completedLessons: string[];
  currentLesson?: string;
  quizScores: Record<string, number>;
  assignments: Record<string, {
    submitted: boolean;
    score?: number;
    feedback?: string;
  }>;
  certificateEarned: boolean;
  certificateIssuedAt?: string;
}

export interface Enrollment {
  id: string;
  courseId: string;
  studentId: string;
  enrolledAt: string;
  expiresAt?: string;
  status: 'active' | 'completed' | 'expired' | 'cancelled';
  progress: CourseProgress;
  paymentId: string;
}