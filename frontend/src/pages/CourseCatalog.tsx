import React, { useState } from 'react';
import { FilterBar } from '@/components/filters/FilterBar';
import { FilterSidebar } from '@/components/filters/FilterSidebar';
import { CourseGrid } from '@/components/courses/CourseGrid';
import { useCourses, useCategories } from '@/hooks/useCourses';
import { cn } from '@/lib/utils';

export const CourseCatalog: React.FC = () => {
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data: coursesData, isLoading, error } = useCourses(currentPage);
  const { data: categories = [] } = useCategories();

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Filter Bar */}
      <FilterBar 
        totalResults={coursesData?.pagination.total}
        onFilterToggle={() => setFilterSidebarOpen(!filterSidebarOpen)}
      />

      <div className="flex">
        {/* Filter Sidebar */}
        <FilterSidebar
          categories={categories}
          isOpen={filterSidebarOpen}
          onClose={() => setFilterSidebarOpen(false)}
        />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <CourseGrid 
            courses={coursesData?.data || []}
            loading={isLoading}
            error={error as Error | null}
          />

          {/* Pagination */}
          {coursesData && coursesData.pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={cn(
                    'px-3 py-2 rounded-lg border',
                    currentPage === 1
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  )}
                >
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, coursesData.pagination.totalPages) }, (_, i) => {
                    const page = i + 1;
                    const startPage = Math.max(1, currentPage - 2);
                    const actualPage = startPage + i;
                    
                    if (actualPage > coursesData.pagination.totalPages) return null;

                    return (
                      <button
                        key={actualPage}
                        onClick={() => handlePageChange(actualPage)}
                        className={cn(
                          'w-10 h-10 rounded-lg',
                          actualPage === currentPage
                            ? 'bg-primary-600 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        )}
                      >
                        {actualPage}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === coursesData.pagination.totalPages}
                  className={cn(
                    'px-3 py-2 rounded-lg border',
                    currentPage === coursesData.pagination.totalPages
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  )}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {filterSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setFilterSidebarOpen(false)}
        />
      )}
    </div>
  );
};