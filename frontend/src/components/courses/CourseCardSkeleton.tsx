import React from 'react';
import { cn } from '@/lib/utils';

interface CourseCardSkeletonProps {
  viewMode?: 'grid' | 'list';
}

export const CourseCardSkeleton: React.FC<CourseCardSkeletonProps> = ({ viewMode = 'grid' }) => {
  const isGrid = viewMode === 'grid';

  return (
    <div className={cn(
      'bg-white rounded-lg border border-gray-200',
      isGrid ? 'flex-col' : 'flex gap-6'
    )}>
      {/* Thumbnail skeleton */}
      <div className={cn(
        'bg-gray-200 animate-pulse',
        isGrid ? 'aspect-video rounded-t-lg' : 'w-64 h-40 rounded-l-lg flex-shrink-0'
      )} />

      {/* Content skeleton */}
      <div className={cn(
        'flex flex-col',
        isGrid ? 'p-5' : 'flex-1 py-4 pr-6'
      )}>
        {/* Categories */}
        <div className="flex gap-2 mb-2">
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Title */}
        <div className={cn(
          'bg-gray-200 rounded animate-pulse mb-3',
          isGrid ? 'h-6 w-full' : 'h-7 w-3/4'
        )} />
        {isGrid && <div className="h-6 w-2/3 bg-gray-200 rounded animate-pulse mb-3" />}

        {/* Description (list view only) */}
        {!isGrid && (
          <>
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse mb-4" />
          </>
        )}

        {/* Instructor */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Stats */}
        <div className={cn(
          'flex items-center gap-4',
          isGrid ? 'mt-auto pt-3 border-t' : ''
        )}>
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-14 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
};