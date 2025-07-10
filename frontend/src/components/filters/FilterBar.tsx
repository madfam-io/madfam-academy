import React from 'react';
import { Search, SlidersHorizontal, Grid3X3, List } from 'lucide-react';
import { useCourseFilterStore } from '@/store/course-filter.store';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  totalResults?: number;
  onFilterToggle?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ totalResults, onFilterToggle }) => {
  const { filters, updateFilter, viewMode, setViewMode } = useCourseFilterStore();

  const sortOptions = [
    { value: 'created_at', label: 'Newest' },
    { value: 'enrollment_count', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price', label: 'Price' },
    { value: 'title', label: 'Title A-Z' },
  ];

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="px-6 py-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={filters.search || ''}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Filter Toggle (Mobile) */}
            <button
              onClick={onFilterToggle}
              className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm font-medium">Filters</span>
            </button>

            {/* Sort */}
            <select
              value={filters.sortBy || 'created_at'}
              onChange={(e) => updateFilter('sortBy', e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* View Mode */}
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 rounded-l-lg',
                  viewMode === 'grid'
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
                aria-label="Grid view"
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 rounded-r-lg border-l',
                  viewMode === 'list'
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
                aria-label="List view"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count & Active Filters */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {totalResults !== undefined && (
              <span>{totalResults} courses found</span>
            )}
          </div>

          {/* Active Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {filters.levels?.map((level) => (
              <span
                key={level}
                className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
              >
                {level}
                <button
                  onClick={() => {
                    const updated = filters.levels?.filter(l => l !== level) || [];
                    updateFilter('levels', updated.length ? updated : undefined);
                  }}
                  className="ml-1 hover:text-primary-900"
                >
                  ×
                </button>
              </span>
            ))}
            {filters.priceType?.map((type) => (
              <span
                key={type}
                className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
              >
                {type === 'free' ? 'Free' : 'Paid'}
                <button
                  onClick={() => {
                    const updated = filters.priceType?.filter(t => t !== type) || [];
                    updateFilter('priceType', updated.length ? updated : undefined);
                  }}
                  className="ml-1 hover:text-primary-900"
                >
                  ×
                </button>
              </span>
            ))}
            {filters.ratings && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
                {filters.ratings}+ stars
                <button
                  onClick={() => updateFilter('ratings', undefined)}
                  className="ml-1 hover:text-primary-900"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};