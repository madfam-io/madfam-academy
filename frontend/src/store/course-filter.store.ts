import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { CourseFilters } from '@/types/course';

interface CourseFilterState {
  filters: CourseFilters;
  viewMode: 'grid' | 'list';
  setFilters: (filters: CourseFilters) => void;
  updateFilter: <K extends keyof CourseFilters>(key: K, value: CourseFilters[K]) => void;
  clearFilters: () => void;
  setViewMode: (mode: 'grid' | 'list') => void;
}

const defaultFilters: CourseFilters = {
  search: '',
  categories: [],
  levels: [],
  priceType: [],
  instructors: [],
  ratings: undefined,
  sortBy: 'created_at',
  sortOrder: 'desc',
};

export const useCourseFilterStore = create<CourseFilterState>()(
  devtools(
    persist(
      (set) => ({
        filters: defaultFilters,
        viewMode: 'grid',
        
        setFilters: (filters) => set({ filters }),
        
        updateFilter: (key, value) =>
          set((state) => ({
            filters: {
              ...state.filters,
              [key]: value,
            },
          })),
          
        clearFilters: () => set({ filters: defaultFilters }),
        
        setViewMode: (mode) => set({ viewMode: mode }),
      }),
      {
        name: 'course-filters',
        partialize: (state) => ({ viewMode: state.viewMode }),
      }
    )
  )
);