import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { CourseFilters, CourseListResponse } from '@/types/course';
import { useDebounce } from './useDebounce';
import { useCourseFilterStore } from '@/store/course-filter.store';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export function useCourses(page: number = 1, limit: number = 20) {
  const filters = useCourseFilterStore((state) => state.filters);
  const debouncedSearch = useDebounce(filters.search, 300);

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (debouncedSearch) params.append('search', debouncedSearch);
    if (filters.categories?.length) params.append('categories', filters.categories.join(','));
    if (filters.levels?.length) params.append('levels', filters.levels.join(','));
    if (filters.priceMin !== undefined) params.append('price_min', filters.priceMin.toString());
    if (filters.priceMax !== undefined) params.append('price_max', filters.priceMax.toString());
    if (filters.ratings) params.append('min_rating', filters.ratings.toString());
    if (filters.sortBy) params.append('sort', filters.sortBy);
    if (filters.sortOrder) params.append('order', filters.sortOrder);
    
    // Handle price type filter
    if (filters.priceType?.length) {
      if (filters.priceType.includes('free') && !filters.priceType.includes('paid')) {
        params.append('price_max', '0');
      } else if (filters.priceType.includes('paid') && !filters.priceType.includes('free')) {
        params.append('price_min', '0.01');
      }
    }
    
    return params.toString();
  };

  return useQuery<CourseListResponse>({
    queryKey: ['courses', page, limit, debouncedSearch, filters],
    queryFn: async () => {
      const response = await axios.get(
        `${API_BASE_URL}/courses?${buildQueryParams()}`
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/categories`);
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}