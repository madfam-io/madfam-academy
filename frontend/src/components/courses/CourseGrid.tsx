import React from 'react';
import { CourseCard } from './CourseCard';
import { CourseCardSkeleton } from './CourseCardSkeleton';
import { Course } from '@/types/course';
import { useCourseFilterStore } from '@/store/course-filter.store';
import { cn } from '@/lib/utils';

interface CourseGridProps {
  courses: Course[];
  loading?: boolean;
  error?: Error | null;
}

export const CourseGrid: React.FC<CourseGridProps> = ({ courses, loading, error }) => {
  const viewMode = useCourseFilterStore((state) => state.viewMode);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-red-500 mb-4">
          <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading courses</h3>
        <p className="text-gray-600">{error.message}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={cn(
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
      )}>
        {Array.from({ length: 8 }).map((_, i) => (
          <CourseCardSkeleton key={i} viewMode={viewMode} />
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses found</h3>
        <p className="text-gray-600">Try adjusting your filters or search criteria</p>
      </div>
    );
  }

  return (
    <div className={cn(
      viewMode === 'grid'
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
        : 'space-y-4'
    )}>
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} viewMode={viewMode} />
      ))}
    </div>
  );
};