'use client';

import { useState } from 'react';
import { 
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useSearchContext } from '@/components/providers/search-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { id: 'web-development', name: 'Web Development', count: 1250 },
  { id: 'data-science', name: 'Data Science', count: 890 },
  { id: 'design', name: 'Design', count: 654 },
  { id: 'business', name: 'Business', count: 432 },
  { id: 'marketing', name: 'Marketing', count: 398 },
  { id: 'photography', name: 'Photography', count: 287 },
  { id: 'music', name: 'Music', count: 234 },
  { id: 'health', name: 'Health & Fitness', count: 189 },
];

const LEVELS = [
  { id: 'beginner', name: 'Beginner', count: 1450 },
  { id: 'intermediate', name: 'Intermediate', count: 980 },
  { id: 'advanced', name: 'Advanced', count: 520 },
];

const FEATURES = [
  { id: 'certificate', name: 'Certificate of Completion', count: 1200 },
  { id: 'lifetime', name: 'Lifetime Access', count: 800 },
  { id: 'mobile', name: 'Mobile Access', count: 1500 },
  { id: 'downloads', name: 'Downloadable Resources', count: 600 },
  { id: 'quizzes', name: 'Practice Quizzes', count: 450 },
  { id: 'assignments', name: 'Coding Assignments', count: 300 },
];

const LANGUAGES = [
  { id: 'english', name: 'English', count: 2100 },
  { id: 'spanish', name: 'Spanish', count: 450 },
  { id: 'french', name: 'French', count: 320 },
  { id: 'german', name: 'German', count: 280 },
  { id: 'portuguese', name: 'Portuguese', count: 190 },
];

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border pb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-2 text-left"
      >
        <h3 className="font-semibold text-foreground">{title}</h3>
        {isOpen ? (
          <ChevronUpIcon className="h-4 w-4" />
        ) : (
          <ChevronDownIcon className="h-4 w-4" />
        )}
      </button>
      {isOpen && <div className="mt-4">{children}</div>}
    </div>
  );
}

export function FilterSidebar() {
  const { filters, updateFilters } = useSearchContext();
  const [priceRange, setPriceRange] = useState([0, 500]);

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const currentCategories = filters.categories || [];
    const newCategories = checked
      ? [...currentCategories, categoryId]
      : currentCategories.filter(id => id !== categoryId);
    
    updateFilters({ categories: newCategories.length > 0 ? newCategories : undefined });
  };

  const handleLevelChange = (level: 'beginner' | 'intermediate' | 'advanced', checked: boolean) => {
    const currentLevels = filters.levels || [];
    const newLevels = checked
      ? [...currentLevels, level]
      : currentLevels.filter(l => l !== level);
    
    updateFilters({ levels: newLevels.length > 0 ? newLevels : undefined });
  };

  const handleFeatureChange = (featureId: string, checked: boolean) => {
    const currentFeatures = filters.features || [];
    const newFeatures = checked
      ? [...currentFeatures, featureId]
      : currentFeatures.filter(id => id !== featureId);
    
    updateFilters({ features: newFeatures.length > 0 ? newFeatures : undefined });
  };

  const handleLanguageChange = (languageId: string, checked: boolean) => {
    const currentLanguages = filters.language || [];
    const newLanguages = checked
      ? [...currentLanguages, languageId]
      : currentLanguages.filter(id => id !== languageId);
    
    updateFilters({ language: newLanguages.length > 0 ? newLanguages : undefined });
  };

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values);
    updateFilters({
      priceRange: {
        min: values[0],
        max: values[1]
      }
    });
  };

  const clearAllFilters = () => {
    updateFilters({
      categories: undefined,
      levels: undefined,
      features: undefined,
      language: undefined,
      priceRange: undefined,
      rating: undefined
    });
    setPriceRange([0, 500]);
  };

  const hasActiveFilters = filters.categories?.length || filters.levels?.length || 
    filters.features?.length || filters.language?.length || filters.priceRange || filters.rating;

  return (
    <div className="bg-card rounded-lg border p-6 space-y-6 sticky top-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Categories */}
      <FilterSection title="Categories">
        <div className="space-y-3">
          {CATEGORIES.map((category) => (
            <div key={category.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={category.id}
                  checked={filters.categories?.includes(category.id) || false}
                  onCheckedChange={(checked) => 
                    handleCategoryChange(category.id, checked as boolean)
                  }
                />
                <label
                  htmlFor={category.id}
                  className="text-sm text-foreground cursor-pointer"
                >
                  {category.name}
                </label>
              </div>
              <span className="text-xs text-muted-foreground">
                {category.count}
              </span>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Levels */}
      <FilterSection title="Level">
        <div className="space-y-3">
          {LEVELS.map((level) => (
            <div key={level.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={level.id}
                  checked={filters.levels?.includes(level.id as any) || false}
                  onCheckedChange={(checked) => 
                    handleLevelChange(level.id as any, checked as boolean)
                  }
                />
                <label
                  htmlFor={level.id}
                  className="text-sm text-foreground cursor-pointer"
                >
                  {level.name}
                </label>
              </div>
              <span className="text-xs text-muted-foreground">
                {level.count}
              </span>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range">
        <div className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={handlePriceRangeChange}
            max={500}
            step={10}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}+</span>
          </div>
        </div>
      </FilterSection>

      {/* Features */}
      <FilterSection title="Features">
        <div className="space-y-3">
          {FEATURES.map((feature) => (
            <div key={feature.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={feature.id}
                  checked={filters.features?.includes(feature.id) || false}
                  onCheckedChange={(checked) => 
                    handleFeatureChange(feature.id, checked as boolean)
                  }
                />
                <label
                  htmlFor={feature.id}
                  className="text-sm text-foreground cursor-pointer"
                >
                  {feature.name}
                </label>
              </div>
              <span className="text-xs text-muted-foreground">
                {feature.count}
              </span>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Languages */}
      <FilterSection title="Language" defaultOpen={false}>
        <div className="space-y-3">
          {LANGUAGES.map((language) => (
            <div key={language.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={language.id}
                  checked={filters.language?.includes(language.id) || false}
                  onCheckedChange={(checked) => 
                    handleLanguageChange(language.id, checked as boolean)
                  }
                />
                <label
                  htmlFor={language.id}
                  className="text-sm text-foreground cursor-pointer"
                >
                  {language.name}
                </label>
              </div>
              <span className="text-xs text-muted-foreground">
                {language.count}
              </span>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Rating" defaultOpen={false}>
        <div className="space-y-3">
          {[4.5, 4.0, 3.5, 3.0].map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={filters.rating === rating}
                onCheckedChange={(checked) => 
                  updateFilters({ rating: checked ? rating : undefined })
                }
              />
              <label
                htmlFor={`rating-${rating}`}
                className="text-sm text-foreground cursor-pointer flex items-center gap-1"
              >
                <span>{rating}+</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={cn(
                        "h-3 w-3",
                        star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
                      )}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </label>
            </div>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}