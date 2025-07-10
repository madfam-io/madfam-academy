import { Metadata } from 'next';
import { Suspense } from 'react';
import { MarketplaceHeader } from '@/components/marketplace/marketplace-header';
import { CourseGrid } from '@/components/marketplace/course-grid';
import { FilterSidebar } from '@/components/marketplace/filter-sidebar';
import { CourseGridSkeleton } from '@/components/ui/skeletons';
import { SearchProvider } from '@/components/providers/search-provider';

export const metadata: Metadata = {
  title: 'Course Marketplace - Discover Your Next Learning Adventure',
  description: 'Browse our comprehensive catalog of courses. Filter by category, level, price, and more to find the perfect learning experience.',
  openGraph: {
    title: 'Course Marketplace - MADFAM Academy',
    description: 'Browse our comprehensive catalog of courses. Filter by category, level, price, and more.',
  },
};

interface MarketplacePageProps {
  searchParams: {
    q?: string;
    category?: string;
    level?: string;
    price?: string;
    rating?: string;
    sort?: string;
    page?: string;
  };
}

export default function MarketplacePage({ searchParams }: MarketplacePageProps) {
  return (
    <SearchProvider initialFilters={searchParams}>
      <div className="min-h-screen bg-background">
        {/* Marketplace Header */}
        <MarketplaceHeader />
        
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="lg:w-80 flex-shrink-0">
              <div className="sticky top-8">
                <FilterSidebar />
              </div>
            </aside>
            
            {/* Main Content */}
            <main className="flex-1">
              <Suspense fallback={<CourseGridSkeleton />}>
                <CourseGrid />
              </Suspense>
            </main>
          </div>
        </div>
      </div>
    </SearchProvider>
  );
}