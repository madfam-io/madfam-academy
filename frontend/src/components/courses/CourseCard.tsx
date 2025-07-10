import React from 'react';
import { Star, Clock, Users, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Course } from '@/types/course';
import { cn, formatPrice, formatDuration, formatNumber } from '@/lib/utils';

interface CourseCardProps {
  course: Course;
  viewMode?: 'grid' | 'list';
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, viewMode = 'grid' }) => {
  const isGrid = viewMode === 'grid';

  return (
    <Link
      to={`/courses/${course.slug}`}
      className={cn(
        'group block bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-200',
        isGrid ? 'flex-col' : 'flex gap-6'
      )}
    >
      {/* Thumbnail */}
      <div className={cn(
        'relative overflow-hidden bg-gray-100',
        isGrid ? 'aspect-video rounded-t-lg' : 'w-64 h-40 rounded-l-lg flex-shrink-0'
      )}>
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-gray-400" />
          </div>
        )}
        
        {/* Price Badge */}
        <div className="absolute top-2 right-2">
          <span className={cn(
            'px-3 py-1 rounded-full text-sm font-medium',
            course.price.type === 'free'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-900 text-white'
          )}>
            {course.price.type === 'free' ? 'Free' : formatPrice(course.price.amount)}
          </span>
        </div>
        
        {/* Level Badge */}
        <div className="absolute top-2 left-2">
          <span className={cn(
            'px-2 py-1 rounded text-xs font-medium capitalize',
            {
              'bg-blue-100 text-blue-800': course.level === 'beginner',
              'bg-yellow-100 text-yellow-800': course.level === 'intermediate',
              'bg-red-100 text-red-800': course.level === 'advanced',
            }
          )}>
            {course.level}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className={cn(
        'flex flex-col',
        isGrid ? 'p-5' : 'flex-1 py-4 pr-6'
      )}>
        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-2">
          {course.categories.slice(0, 2).map((category) => (
            <span
              key={category.id}
              className="text-xs text-primary-600 font-medium"
            >
              {category.name}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3 className={cn(
          'font-semibold text-gray-900 group-hover:text-primary-600 transition-colors',
          isGrid ? 'text-lg mb-2 line-clamp-2' : 'text-xl mb-3'
        )}>
          {course.title}
        </h3>

        {/* Description */}
        {!isGrid && (
          <p className="text-gray-600 mb-4 line-clamp-2">
            {course.shortDescription || course.description}
          </p>
        )}

        {/* Instructor */}
        <div className="flex items-center gap-3 mb-3">
          {course.instructor.avatar ? (
            <img
              src={course.instructor.avatar}
              alt={course.instructor.name}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300" />
          )}
          <span className="text-sm text-gray-600">{course.instructor.name}</span>
        </div>

        {/* Stats */}
        <div className={cn(
          'flex items-center gap-4 text-sm text-gray-600',
          isGrid ? 'mt-auto pt-3 border-t' : ''
        )}>
          {/* Rating */}
          {course.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{course.rating.toFixed(1)}</span>
              <span className="text-gray-400">({formatNumber(course.ratingCount)})</span>
            </div>
          )}
          
          {/* Duration */}
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{formatDuration(course.duration)}</span>
          </div>
          
          {/* Enrollments */}
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{formatNumber(course.enrollmentCount)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};