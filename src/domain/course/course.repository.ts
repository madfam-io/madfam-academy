import { Knex } from 'knex';
import { Course, CourseId, Price, CourseMetadata } from './course.entity';
import { Module, Lesson } from './course.entity';

export interface CourseRepository {
  findById(id: CourseId, tenantId: string): Promise<Course | null>;
  findBySlug(slug: string, tenantId: string): Promise<Course | null>;
  findByInstructor(instructorId: string, tenantId: string): Promise<Course[]>;
  save(course: Course): Promise<void>;
  delete(id: CourseId, tenantId: string): Promise<void>;
  search(criteria: CourseSearchCriteria, tenantId: string): Promise<CourseSearchResult>;
}

export interface CourseSearchCriteria {
  query?: string;
  categories?: string[];
  tags?: string[];
  instructorId?: string;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  priceMin?: number;
  priceMax?: number;
  status?: 'draft' | 'published' | 'archived';
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'price' | 'rating' | 'enrollment_count';
  sortOrder?: 'asc' | 'desc';
}

export interface CourseSearchResult {
  courses: Course[];
  total: number;
  page: number;
  totalPages: number;
}

export class KnexCourseRepository implements CourseRepository {
  constructor(private readonly knex: Knex) {}

  async findById(id: CourseId, tenantId: string): Promise<Course | null> {
    const courseData = await this.knex('courses')
      .where({ id: id.value, tenant_id: tenantId })
      .first();

    if (!courseData) return null;

    const modules = await this.loadModules(id.value);
    return this.toDomainEntity(courseData, modules);
  }

  async findBySlug(slug: string, tenantId: string): Promise<Course | null> {
    const courseData = await this.knex('courses')
      .where({ slug, tenant_id: tenantId })
      .first();

    if (!courseData) return null;

    const modules = await this.loadModules(courseData.id);
    return this.toDomainEntity(courseData, modules);
  }

  async findByInstructor(instructorId: string, tenantId: string): Promise<Course[]> {
    const coursesData = await this.knex('courses')
      .where({ instructor_id: instructorId, tenant_id: tenantId })
      .orderBy('created_at', 'desc');

    const courses = await Promise.all(
      coursesData.map(async (courseData) => {
        const modules = await this.loadModules(courseData.id);
        return this.toDomainEntity(courseData, modules);
      })
    );

    return courses;
  }

  async save(course: Course): Promise<void> {
    const courseData = this.toPersistence(course);
    
    await this.knex.transaction(async (trx) => {
      // Upsert course
      await trx('courses')
        .insert(courseData)
        .onConflict('id')
        .merge();

      // Delete existing modules and lessons
      const existingModuleIds = await trx('modules')
        .where('course_id', course.props.id.value)
        .pluck('id');

      if (existingModuleIds.length > 0) {
        await trx('lessons')
          .whereIn('module_id', existingModuleIds)
          .delete();
        
        await trx('modules')
          .where('course_id', course.props.id.value)
          .delete();
      }

      // Insert modules and lessons
      for (const module of course.props.modules) {
        const moduleData = {
          id: module.id,
          course_id: course.props.id.value,
          title: module.props.title,
          description: module.props.description,
          display_order: module.props.order,
          duration_minutes: module.totalDuration,
        };

        await trx('modules').insert(moduleData);

        // Insert lessons for this module
        const lessonsData = module.props.lessons.map(lesson => ({
          id: lesson.id,
          module_id: module.id,
          title: lesson.props.title,
          lesson_type: lesson.props.type,
          content_url: lesson.props.contentUrl,
          duration_minutes: lesson.props.duration,
          display_order: lesson.props.order,
          is_preview: lesson.props.isPreview,
        }));

        if (lessonsData.length > 0) {
          await trx('lessons').insert(lessonsData);
        }
      }

      // Handle domain events (if event store is implemented)
      const events = course.getUncommittedEvents();
      // await this.eventStore.saveEvents(events);
      course.markEventsAsCommitted();
    });
  }

  async delete(id: CourseId, tenantId: string): Promise<void> {
    await this.knex('courses')
      .where({ id: id.value, tenant_id: tenantId })
      .delete();
  }

  async search(criteria: CourseSearchCriteria, tenantId: string): Promise<CourseSearchResult> {
    const page = criteria.page || 1;
    const limit = criteria.limit || 20;
    const offset = (page - 1) * limit;

    let query = this.knex('courses')
      .where('tenant_id', tenantId);

    // Apply filters
    if (criteria.status) {
      query = query.where('status', criteria.status);
    }

    if (criteria.instructorId) {
      query = query.where('instructor_id', criteria.instructorId);
    }

    if (criteria.skillLevel) {
      query = query.where('skill_level', criteria.skillLevel);
    }

    if (criteria.categories && criteria.categories.length > 0) {
      query = query.whereRaw('categories && ?', [criteria.categories]);
    }

    if (criteria.tags && criteria.tags.length > 0) {
      query = query.whereRaw('tags && ?', [criteria.tags]);
    }

    if (criteria.priceMin !== undefined) {
      query = query.whereRaw("(price->>'amount')::numeric >= ?", [criteria.priceMin]);
    }

    if (criteria.priceMax !== undefined) {
      query = query.whereRaw("(price->>'amount')::numeric <= ?", [criteria.priceMax]);
    }

    if (criteria.query) {
      query = query.whereRaw(
        "to_tsvector('english', title || ' ' || COALESCE(description, '')) @@ plainto_tsquery('english', ?)",
        [criteria.query]
      );
    }

    // Count total results
    const countQuery = query.clone();
    const [{ count }] = await countQuery.count('* as count');
    const total = parseInt(count as string, 10);

    // Apply sorting
    const sortBy = criteria.sortBy || 'created_at';
    const sortOrder = criteria.sortOrder || 'desc';
    query = query.orderBy(sortBy, sortOrder);

    // Apply pagination
    query = query.limit(limit).offset(offset);

    // Execute query
    const coursesData = await query;

    // Load modules for each course
    const courses = await Promise.all(
      coursesData.map(async (courseData) => {
        const modules = await this.loadModules(courseData.id);
        return this.toDomainEntity(courseData, modules);
      })
    );

    return {
      courses,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  private async loadModules(courseId: string): Promise<Module[]> {
    const modulesData = await this.knex('modules')
      .where('course_id', courseId)
      .orderBy('display_order');

    const modules = await Promise.all(
      modulesData.map(async (moduleData) => {
        const lessonsData = await this.knex('lessons')
          .where('module_id', moduleData.id)
          .orderBy('display_order');

        const lessons = lessonsData.map(lessonData => 
          new Lesson({
            id: lessonData.id,
            title: lessonData.title,
            type: lessonData.lesson_type,
            contentUrl: lessonData.content_url,
            duration: lessonData.duration_minutes,
            order: lessonData.display_order,
            isPreview: lessonData.is_preview,
          })
        );

        return new Module({
          id: moduleData.id,
          title: moduleData.title,
          description: moduleData.description,
          order: moduleData.display_order,
          lessons,
        });
      })
    );

    return modules;
  }

  private toDomainEntity(courseData: any, modules: Module[]): Course {
    const price = new Price({
      amount: courseData.price.amount,
      currency: courseData.price.currency,
      type: courseData.price.type,
      period: courseData.price.period,
    });

    const metadata = new CourseMetadata({
      duration: courseData.duration_minutes,
      skillLevel: courseData.skill_level,
      language: courseData.language,
      prerequisites: courseData.requirements || [],
      objectives: courseData.objectives || [],
    });

    return new Course({
      id: new CourseId(courseData.id),
      tenantId: courseData.tenant_id,
      instructorId: courseData.instructor_id,
      title: courseData.title,
      slug: courseData.slug,
      description: courseData.description,
      thumbnail: courseData.thumbnail_url,
      price,
      metadata,
      categories: courseData.categories || [],
      tags: courseData.tags || [],
      modules,
      status: courseData.status,
      publishedAt: courseData.published_at,
      rating: courseData.rating,
      enrollmentCount: courseData.enrollment_count,
    });
  }

  private toPersistence(course: Course): any {
    return {
      id: course.props.id.value,
      tenant_id: course.props.tenantId,
      instructor_id: course.props.instructorId,
      title: course.props.title,
      slug: course.props.slug,
      description: course.props.description,
      thumbnail_url: course.props.thumbnail,
      price: course.props.price.value,
      metadata: course.props.metadata.value,
      requirements: course.props.metadata.value.prerequisites,
      objectives: course.props.metadata.value.objectives,
      categories: course.props.categories,
      tags: course.props.tags,
      language: course.props.metadata.value.language,
      skill_level: course.props.metadata.value.skillLevel,
      duration_minutes: course.props.metadata.value.duration,
      status: course.props.status,
      published_at: course.props.publishedAt,
      rating: course.props.rating,
      enrollment_count: course.props.enrollmentCount,
    };
  }
}