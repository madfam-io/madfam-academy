'use client';

import { useQuery } from '@tanstack/react-query';
import { CourseFilters, CourseSearchResult } from '@/types/course';
import { api } from '@/lib/api';

export function useCourses(filters: CourseFilters) {
  return useQuery<CourseSearchResult>({
    queryKey: ['courses', filters],
    queryFn: () => api.courses.search(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: ['course', id],
    queryFn: () => api.courses.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCourseBySlug(slug: string) {
  return useQuery({
    queryKey: ['course', 'slug', slug],
    queryFn: () => api.courses.getBySlug(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useFeaturedCourses(limit = 8) {
  return useQuery({
    queryKey: ['courses', 'featured', limit],
    queryFn: () => api.courses.getFeatured(limit),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

export function usePopularCourses(limit = 8) {
  return useQuery({
    queryKey: ['courses', 'popular', limit],
    queryFn: () => api.courses.getPopular(limit),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

export function useRecentCourses(limit = 8) {
  return useQuery({
    queryKey: ['courses', 'recent', limit],
    queryFn: () => api.courses.getRecent(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCoursesByCategory(categoryId: string, limit = 12) {
  return useQuery({
    queryKey: ['courses', 'category', categoryId, limit],
    queryFn: () => api.courses.getByCategory(categoryId, limit),
    enabled: !!categoryId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCoursesByInstructor(instructorId: string, limit = 12) {
  return useQuery({
    queryKey: ['courses', 'instructor', instructorId, limit],
    queryFn: () => api.courses.getByInstructor(instructorId, limit),
    enabled: !!instructorId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useRelatedCourses(courseId: string, limit = 4) {
  return useQuery({
    queryKey: ['courses', 'related', courseId, limit],
    queryFn: () => api.courses.getRelated(courseId, limit),
    enabled: !!courseId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

export function useCourseReviews(courseId: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: ['course', courseId, 'reviews', page, limit],
    queryFn: () => api.courses.getReviews(courseId, page, limit),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCourseCurriculum(courseId: string) {
  return useQuery({
    queryKey: ['course', courseId, 'curriculum'],
    queryFn: () => api.courses.getCurriculum(courseId),
    enabled: !!courseId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}