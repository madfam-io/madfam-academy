'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  StarIcon,
  ClockIcon,
  UsersIcon,
  HeartIcon as HeartOutline,
  PlayIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { Course } from '@/types/course';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDuration, formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface CourseCardProps {
  course: Course;
  view?: 'grid' | 'list';
  className?: string;
}

export function CourseCard({ course, view = 'grid', className }: CourseCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsWishlisted(!isWishlisted);
    // TODO: Implement wishlist API call
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.preventDefault();
    // TODO: Implement course preview modal
    console.log('Preview course:', course.id);
  };

  if (view === 'list') {
    return (
      <div className={cn(
        "group bg-card rounded-lg border shadow-sm hover:shadow-md transition-all duration-200",
        className
      )}>
        <Link href={`/courses/${course.slug}`}>
          <div className="flex flex-col sm:flex-row">
            {/* Image */}
            <div className="relative sm:w-80 sm:flex-shrink-0">
              <div className="aspect-video relative overflow-hidden rounded-t-lg sm:rounded-l-lg sm:rounded-t-none">
                {!imageError ? (
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">No image</span>
                  </div>
                )}
                
                {/* Preview button */}
                {course.preview && (
                  <button
                    onClick={handlePreview}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div className="bg-white rounded-full p-3">
                      <PlayIcon className="h-6 w-6 text-gray-900" />
                    </div>
                  </button>
                )}

                {/* Wishlist button */}
                <button
                  onClick={handleWishlistToggle}
                  className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors"
                >
                  {isWishlisted ? (
                    <HeartSolid className="h-4 w-4 text-red-500" />
                  ) : (
                    <HeartOutline className="h-4 w-4 text-gray-600" />
                  )}
                </button>

                {/* Level badge */}
                <div className="absolute top-3 left-3">
                  <Badge variant={course.level === 'beginner' ? 'default' : course.level === 'intermediate' ? 'secondary' : 'destructive'}>
                    {course.level}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="mb-2">
                      {course.category.name}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {course.shortDescription}
                  </p>

                  {/* Instructor */}
                  <div className="flex items-center gap-2 mb-4">
                    <Image
                      src={course.instructor.avatar}
                      alt={course.instructor.name}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <span className="text-sm text-muted-foreground">
                      {course.instructor.name}
                    </span>
                    {course.instructor.rating > 4.5 && (
                      <CheckBadgeIcon className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{course.rating.average.toFixed(1)}</span>
                      <span>({course.rating.count.toLocaleString()})</span>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      <span>{formatDuration(course.duration.totalMinutes)}</span>
                    </div>

                    {/* Enrollment */}
                    <div className="flex items-center gap-1">
                      <UsersIcon className="h-4 w-4" />
                      <span>{course.enrollment.count.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    {course.price.compareAtPrice && (
                      <div className="text-sm text-muted-foreground line-through">
                        {formatPrice(course.price.compareAtPrice, course.price.currency)}
                      </div>
                    )}
                    <div className="text-lg font-bold text-foreground">
                      {course.price.amount === 0 ? 'Free' : formatPrice(course.price.amount, course.price.currency)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className={cn(
      "group magic-card overflow-hidden",
      className
    )}>
      <Link href={`/courses/${course.slug}`}>
        {/* Image */}
        <div className="relative aspect-video overflow-hidden">
          {!imageError ? (
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">No image</span>
            </div>
          )}
          
          {/* Preview button */}
          {course.preview && (
            <button
              onClick={handlePreview}
              className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <div className="bg-white rounded-full p-3">
                <PlayIcon className="h-6 w-6 text-gray-900" />
              </div>
            </button>
          )}

          {/* Wishlist button */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors"
          >
            {isWishlisted ? (
              <HeartSolid className="h-4 w-4 text-red-500" />
            ) : (
              <HeartOutline className="h-4 w-4 text-gray-600" />
            )}
          </button>

          {/* Level badge */}
          <div className="absolute top-3 left-3">
            <Badge variant={course.level === 'beginner' ? 'default' : course.level === 'intermediate' ? 'secondary' : 'destructive'}>
              {course.level}
            </Badge>
          </div>

          {/* Duration */}
          <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
            {formatDuration(course.duration.totalMinutes)}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          <Badge variant="outline" className="mb-2">
            {course.category.name}
          </Badge>

          {/* Title */}
          <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>

          {/* Instructor */}
          <div className="flex items-center gap-2 mb-3">
            <Image
              src={course.instructor.avatar}
              alt={course.instructor.name}
              width={20}
              height={20}
              className="rounded-full"
            />
            <span className="text-sm text-muted-foreground">
              {course.instructor.name}
            </span>
            {course.instructor.rating > 4.5 && (
              <CheckBadgeIcon className="h-3 w-3 text-blue-500" />
            )}
          </div>

          {/* Rating and Enrollment */}
          <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{course.rating.average.toFixed(1)}</span>
              <span>({course.rating.count.toLocaleString()})</span>
            </div>
            <div className="flex items-center gap-1">
              <UsersIcon className="h-4 w-4" />
              <span>{course.enrollment.count.toLocaleString()}</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              {course.price.compareAtPrice && (
                <div className="text-sm text-muted-foreground line-through">
                  {formatPrice(course.price.compareAtPrice, course.price.currency)}
                </div>
              )}
              <div className="text-lg font-bold text-foreground">
                {course.price.amount === 0 ? 'Free' : formatPrice(course.price.amount, course.price.currency)}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}