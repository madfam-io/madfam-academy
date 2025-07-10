'use client';

import { useState, useEffect } from 'react';
import { useSearchContext } from '@/components/providers/search-provider';
import { CourseCard } from '@/components/marketplace/course-card';
import { CourseGridSkeleton } from '@/components/ui/skeletons';
import { SortDropdown } from '@/components/marketplace/sort-dropdown';
import { ViewToggle } from '@/components/marketplace/view-toggle';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { useCourses } from '@/hooks/use-courses';
import { Course } from '@/types/course';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

export function CourseGrid() {
  const { filters, updateFilters } = useSearchContext();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const {
    data: coursesData,
    isLoading,
    error,
    refetch
  } = useCourses(filters);

  useEffect(() => {
    refetch();
  }, [filters, refetch]);

  if (isLoading) {
    return <CourseGridSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Something went wrong
          </h3>
          <p className="text-muted-foreground mb-4">
            We couldn't load the courses. Please try again.
          </p>
          <button
            onClick={() => refetch()}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const courses = coursesData?.courses || [];
  const total = coursesData?.total || 0;
  const hasMore = coursesData?.hasMore || false;
  const currentPage = filters.page || 1;
  const totalPages = coursesData?.totalPages || 1;

  return (
    <div className="space-y-6">
      {/* Header with results count and controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">
            {filters.query ? `Search Results for "${filters.query}"` : 'All Courses'}
          </h1>
          {total > 0 && (
            <span className="text-sm text-muted-foreground">
              {total.toLocaleString()} {total === 1 ? 'course' : 'courses'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filters Toggle */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden btn btn-outline btn-sm"
          >
            <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
            Filters
          </button>

          {/* View Toggle */}
          <ViewToggle view={view} onViewChange={setView} />

          {/* Sort Dropdown */}
          <SortDropdown
            value={filters.sortBy || 'relevance'}
            onChange={(sortBy) => updateFilters({ sortBy })}
          />
        </div>
      </div>

      {/* Active Filters */}
      {(filters.query || (filters.categories && filters.categories.length > 0) || 
        (filters.levels && filters.levels.length > 0) || filters.priceRange) && (
        <div className="flex flex-wrap gap-2">
          {filters.query && (
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
              Search: {filters.query}
              <button
                onClick={() => updateFilters({ query: undefined })}
                className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
              >
                ×
              </button>
            </div>
          )}
          {filters.categories?.map((category) => (
            <div
              key={category}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {category}
              <button
                onClick={() => updateFilters({
                  categories: filters.categories?.filter(c => c !== category)
                })}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                ×
              </button>
            </div>
          ))}
          {filters.levels?.map((level) => (
            <div
              key={level}
              className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
            >
              {level}
              <button
                onClick={() => updateFilters({
                  levels: filters.levels?.filter(l => l !== level)
                })}
                className="ml-1 hover:bg-green-200 rounded-full p-0.5"
              >
                ×
              </button>
            </div>
          ))}
          {filters.priceRange && (
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              ${filters.priceRange.min} - ${filters.priceRange.max}
              <button
                onClick={() => updateFilters({ priceRange: undefined })}
                className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
              >
                ×
              </button>
            </div>
          )}
          <button
            onClick={() => updateFilters({
              query: undefined,
              categories: undefined,
              levels: undefined,
              priceRange: undefined
            })}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Course Grid/List */}
      {courses.length === 0 ? (
        <EmptyState
          title="No courses found"
          description="Try adjusting your search criteria or browse all courses."
          action={{
            label: 'Browse All Courses',
            onClick: () => updateFilters({
              query: undefined,
              categories: undefined,
              levels: undefined,
              priceRange: undefined
            })
          }}
        />
      ) : (
        <>
          <div className={`
            ${view === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
              : 'space-y-4'
            }
          `}>
            {courses.map((course: Course) => (
              <CourseCard
                key={course.id}
                course={course}
                view={view}
                className="animate-in fade-in slide-in-from-bottom"
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => updateFilters({ page })}
              />
            </div>
          )}

          {/* Load More Button (Alternative to pagination) */}
          {hasMore && view === 'grid' && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => updateFilters({ page: currentPage + 1 })}
                className="btn btn-outline"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load More Courses'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Course Count Summary */}
      {courses.length > 0 && (
        <div className="text-center text-sm text-muted-foreground mt-8">
          Showing {((currentPage - 1) * (filters.limit || 12)) + 1} to{' '}
          {Math.min(currentPage * (filters.limit || 12), total)} of {total.toLocaleString()} courses
        </div>
      )}
    </div>
  );
}