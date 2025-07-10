import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { useCourseFilterStore } from '@/store/course-filter.store';
import { cn } from '@/lib/utils';

interface FilterSidebarProps {
  categories: Array<{ id: string; name: string; count?: number }>;
  isOpen?: boolean;
  onClose?: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ 
  categories, 
  isOpen = true, 
  onClose 
}) => {
  const { filters, updateFilter } = useCourseFilterStore();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['categories', 'level', 'price'])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleCategoryToggle = (categoryId: string) => {
    const currentCategories = filters.categories || [];
    const updated = currentCategories.includes(categoryId)
      ? currentCategories.filter(id => id !== categoryId)
      : [...currentCategories, categoryId];
    updateFilter('categories', updated);
  };

  const handleLevelToggle = (level: 'beginner' | 'intermediate' | 'advanced') => {
    const currentLevels = filters.levels || [];
    const updated = currentLevels.includes(level)
      ? currentLevels.filter(l => l !== level)
      : [...currentLevels, level];
    updateFilter('levels', updated);
  };

  const handlePriceTypeToggle = (type: 'free' | 'paid') => {
    const currentTypes = filters.priceType || [];
    const updated = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    updateFilter('priceType', updated);
  };

  const handleRatingChange = (rating: number) => {
    updateFilter('ratings', filters.ratings === rating ? undefined : rating);
  };

  return (
    <aside className={cn(
      'bg-white border-r border-gray-200 w-72 h-full overflow-y-auto',
      'fixed lg:sticky top-0 z-30 transition-transform duration-300',
      isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    )}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('categories')}
            className="flex items-center justify-between w-full py-2 text-left"
          >
            <h3 className="font-medium text-gray-900">Categories</h3>
            {expandedSections.has('categories') ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
          
          {expandedSections.has('categories') && (
            <div className="mt-3 space-y-2">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center gap-3 cursor-pointer hover:text-primary-600"
                >
                  <input
                    type="checkbox"
                    checked={filters.categories?.includes(category.id) || false}
                    onChange={() => handleCategoryToggle(category.id)}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">
                    {category.name}
                    {category.count !== undefined && (
                      <span className="text-gray-400 ml-1">({category.count})</span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Level */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('level')}
            className="flex items-center justify-between w-full py-2 text-left"
          >
            <h3 className="font-medium text-gray-900">Level</h3>
            {expandedSections.has('level') ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
          
          {expandedSections.has('level') && (
            <div className="mt-3 space-y-2">
              {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                <label
                  key={level}
                  className="flex items-center gap-3 cursor-pointer hover:text-primary-600"
                >
                  <input
                    type="checkbox"
                    checked={filters.levels?.includes(level) || false}
                    onChange={() => handleLevelToggle(level)}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 capitalize">{level}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Price */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full py-2 text-left"
          >
            <h3 className="font-medium text-gray-900">Price</h3>
            {expandedSections.has('price') ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
          
          {expandedSections.has('price') && (
            <div className="mt-3 space-y-2">
              <label className="flex items-center gap-3 cursor-pointer hover:text-primary-600">
                <input
                  type="checkbox"
                  checked={filters.priceType?.includes('free') || false}
                  onChange={() => handlePriceTypeToggle('free')}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Free</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer hover:text-primary-600">
                <input
                  type="checkbox"
                  checked={filters.priceType?.includes('paid') || false}
                  onChange={() => handlePriceTypeToggle('paid')}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Paid</span>
              </label>
            </div>
          )}
        </div>

        {/* Rating */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('rating')}
            className="flex items-center justify-between w-full py-2 text-left"
          >
            <h3 className="font-medium text-gray-900">Rating</h3>
            {expandedSections.has('rating') ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
          
          {expandedSections.has('rating') && (
            <div className="mt-3 space-y-2">
              {[4, 3, 2, 1].map((rating) => (
                <label
                  key={rating}
                  className="flex items-center gap-3 cursor-pointer hover:text-primary-600"
                >
                  <input
                    type="radio"
                    name="rating"
                    checked={filters.ratings === rating}
                    onChange={() => handleRatingChange(rating)}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-700">{rating}+ stars</span>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className={cn(
                            'w-4 h-4',
                            i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          )}
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Clear Filters */}
        <button
          onClick={() => useCourseFilterStore.getState().clearFilters()}
          className="w-full py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Clear All Filters
        </button>
      </div>
    </aside>
  );
};