'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CourseFilters } from '@/types/course';
import { buildSearchParams, parseSearchParams } from '@/lib/utils';

interface SearchContextType {
  filters: CourseFilters;
  updateFilters: (newFilters: Partial<CourseFilters>) => void;
  resetFilters: () => void;
  isLoading: boolean;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function useSearchContext() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }
  return context;
}

interface SearchProviderProps {
  children: React.ReactNode;
  initialFilters?: Record<string, any>;
}

export function SearchProvider({ children, initialFilters = {} }: SearchProviderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // Parse initial filters from URL or props
  const [filters, setFilters] = useState<CourseFilters>(() => {
    const urlParams = parseSearchParams(searchParams);
    
    return {
      query: urlParams.q || initialFilters.q,
      categories: urlParams.category ? [urlParams.category] : initialFilters.categories,
      levels: urlParams.level ? [urlParams.level] : initialFilters.levels,
      priceRange: urlParams.price ? {
        min: Number(urlParams.price.split('-')[0]),
        max: Number(urlParams.price.split('-')[1])
      } : initialFilters.priceRange,
      rating: urlParams.rating ? Number(urlParams.rating) : initialFilters.rating,
      sortBy: urlParams.sort || initialFilters.sort || 'relevance',
      page: urlParams.page ? Number(urlParams.page) : initialFilters.page || 1,
      limit: 12,
      ...initialFilters
    };
  });

  // Update URL when filters change
  const updateURL = useCallback((newFilters: CourseFilters) => {
    const params: Record<string, any> = {};

    if (newFilters.query) params.q = newFilters.query;
    if (newFilters.categories?.length) params.category = newFilters.categories;
    if (newFilters.levels?.length) params.level = newFilters.levels;
    if (newFilters.priceRange) {
      params.price = `${newFilters.priceRange.min}-${newFilters.priceRange.max}`;
    }
    if (newFilters.rating) params.rating = newFilters.rating;
    if (newFilters.sortBy && newFilters.sortBy !== 'relevance') params.sort = newFilters.sortBy;
    if (newFilters.page && newFilters.page > 1) params.page = newFilters.page;

    const searchParams = buildSearchParams(params);
    const newURL = searchParams.toString() ? `?${searchParams.toString()}` : '';
    
    router.push(`/marketplace${newURL}`, { scroll: false });
  }, [router]);

  const updateFilters = useCallback((newFilters: Partial<CourseFilters>) => {
    setIsLoading(true);
    
    setFilters(prev => {
      // Reset page to 1 when filters change (except when page is being updated)
      const shouldResetPage = !('page' in newFilters) && Object.keys(newFilters).length > 0;
      
      const updatedFilters = {
        ...prev,
        ...newFilters,
        ...(shouldResetPage && { page: 1 })
      };

      updateURL(updatedFilters);
      return updatedFilters;
    });

    // Simulate loading delay
    setTimeout(() => setIsLoading(false), 300);
  }, [updateURL]);

  const resetFilters = useCallback(() => {
    const defaultFilters: CourseFilters = {
      sortBy: 'relevance',
      page: 1,
      limit: 12
    };
    
    setFilters(defaultFilters);
    updateURL(defaultFilters);
  }, [updateURL]);

  // Sync with URL changes (back/forward navigation)
  useEffect(() => {
    const urlParams = parseSearchParams(searchParams);
    
    const newFilters: CourseFilters = {
      query: urlParams.q,
      categories: urlParams.category ? [urlParams.category] : undefined,
      levels: urlParams.level ? [urlParams.level] : undefined,
      priceRange: urlParams.price ? {
        min: Number(urlParams.price.split('-')[0]),
        max: Number(urlParams.price.split('-')[1])
      } : undefined,
      rating: urlParams.rating ? Number(urlParams.rating) : undefined,
      sortBy: urlParams.sort || 'relevance',
      page: urlParams.page ? Number(urlParams.page) : 1,
      limit: 12
    };

    setFilters(newFilters);
  }, [searchParams]);

  const value = {
    filters,
    updateFilters,
    resetFilters,
    isLoading
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}