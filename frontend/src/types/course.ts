export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  thumbnail?: string;
  instructor: {
    id: string;
    name: string;
    avatar?: string;
    bio?: string;
  };
  price: {
    amount: number;
    currency: string;
    type: 'free' | 'one-time' | 'subscription';
    period?: 'monthly' | 'yearly';
  };
  duration: number; // minutes
  level: 'beginner' | 'intermediate' | 'advanced';
  categories: Category[];
  tags: string[];
  rating?: number;
  ratingCount: number;
  enrollmentCount: number;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
}

export interface CourseFilters {
  search?: string;
  categories?: string[];
  levels?: ('beginner' | 'intermediate' | 'advanced')[];
  priceMin?: number;
  priceMax?: number;
  priceType?: ('free' | 'paid')[];
  instructors?: string[];
  ratings?: number;
  duration?: {
    min?: number;
    max?: number;
  };
  sortBy?: 'created_at' | 'price' | 'rating' | 'enrollment_count' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface CourseListResponse {
  data: Course[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}