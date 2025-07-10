# MADFAM Academy API Specification
**Version 1.0** | **OpenAPI 3.0** | **Date: 2024-07-10**

## Overview

The MADFAM Academy API provides comprehensive access to the educational marketplace platform, supporting multi-tenant operations, CONOCER certification integration, and Solarpunk impact tracking. All APIs follow REST principles with JSON payloads and include comprehensive error handling.

## Base Configuration

```yaml
openapi: 3.0.3
info:
  title: MADFAM Academy API
  version: 1.0.0
  description: Multi-tenant educational marketplace with CONOCER integration and Solarpunk impact tracking
  contact:
    name: MADFAM Academy Engineering
    email: engineering@madfam.academy
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://api.madfam.academy/v1
    description: Production server
  - url: https://staging-api.madfam.academy/v1
    description: Staging server
  - url: http://localhost:3000/v1
    description: Development server
```

## Authentication

### JWT Bearer Token
All API endpoints require authentication via JWT Bearer token in the Authorization header.

```http
Authorization: Bearer <jwt_token>
```

### Token Structure
```typescript
interface JWTPayload {
  sub: string;           // User ID
  tenant_id: string;     // Tenant ID
  persona: Persona;      // User persona (learner, instructor, admin, super_admin)
  permissions: string[]; // Granted permissions
  exp: number;          // Expiration timestamp
  iat: number;          // Issued at timestamp
}

enum Persona {
  LEARNER = 'learner',
  INSTRUCTOR = 'instructor', 
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}
```

## API Endpoints

### 1. Authentication & User Management

#### POST /auth/login
Authenticate user and return JWT token.

```yaml
/auth/login:
  post:
    summary: User authentication
    tags: [Authentication]
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [email, password]
            properties:
              email:
                type: string
                format: email
                example: "learner@example.com"
              password:
                type: string
                minLength: 8
                example: "SecurePassword123!"
              tenant_domain:
                type: string
                example: "demo.madfam.academy"
    responses:
      200:
        description: Authentication successful
        content:
          application/json:
            schema:
              type: object
              properties:
                access_token:
                  type: string
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                refresh_token:
                  type: string
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                expires_in:
                  type: integer
                  example: 3600
                user:
                  $ref: '#/components/schemas/User'
      401:
        $ref: '#/components/responses/Unauthorized'
      429:
        $ref: '#/components/responses/TooManyRequests'
```

#### GET /users/profile
Get current user profile with Solarpunk metrics.

```yaml
/users/profile:
  get:
    summary: Get user profile
    tags: [Users]
    security:
      - bearerAuth: []
    responses:
      200:
        description: User profile retrieved successfully
        content:
          application/json:
            schema:
              allOf:
                - $ref: '#/components/schemas/User'
                - type: object
                  properties:
                    solarpunk_profile:
                      $ref: '#/components/schemas/SolarpunkProfile'
                    learning_analytics:
                      $ref: '#/components/schemas/LearningAnalytics'
```

#### PUT /users/profile
Update user profile information.

```yaml
/users/profile:
  put:
    summary: Update user profile
    tags: [Users]
    security:
      - bearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/UserUpdateRequest'
    responses:
      200:
        description: Profile updated successfully
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/User'
      400:
        $ref: '#/components/responses/BadRequest'
      401:
        $ref: '#/components/responses/Unauthorized'
```

### 2. Course Management

#### GET /courses
List courses with filtering and pagination.

```yaml
/courses:
  get:
    summary: List courses
    tags: [Courses]
    security:
      - bearerAuth: []
    parameters:
      - name: page
        in: query
        schema:
          type: integer
          minimum: 1
          default: 1
      - name: limit
        in: query
        schema:
          type: integer
          minimum: 1
          maximum: 100
          default: 20
      - name: category
        in: query
        schema:
          type: string
          example: "sustainability"
      - name: difficulty
        in: query
        schema:
          type: string
          enum: [beginner, intermediate, advanced]
      - name: solarpunk_aligned
        in: query
        schema:
          type: boolean
          description: Filter courses aligned with Solarpunk principles
      - name: conocer_certified
        in: query
        schema:
          type: boolean
          description: Filter courses offering CONOCER certification
    responses:
      200:
        description: Courses retrieved successfully
        content:
          application/json:
            schema:
              type: object
              properties:
                data:
                  type: array
                  items:
                    $ref: '#/components/schemas/Course'
                pagination:
                  $ref: '#/components/schemas/PaginationMeta'
                filters_applied:
                  type: object
                  properties:
                    category: { type: string }
                    difficulty: { type: string }
                    solarpunk_aligned: { type: boolean }
                    conocer_certified: { type: boolean }
```

#### POST /courses
Create a new course (Instructor only).

```yaml
/courses:
  post:
    summary: Create new course
    tags: [Courses]
    security:
      - bearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/CourseCreateRequest'
    responses:
      201:
        description: Course created successfully
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Course'
      400:
        $ref: '#/components/responses/BadRequest'
      401:
        $ref: '#/components/responses/Unauthorized'
      403:
        $ref: '#/components/responses/Forbidden'
```

#### GET /courses/{courseId}
Get detailed course information.

```yaml
/courses/{courseId}:
  get:
    summary: Get course details
    tags: [Courses]
    security:
      - bearerAuth: []
    parameters:
      - name: courseId
        in: path
        required: true
        schema:
          type: string
          format: uuid
    responses:
      200:
        description: Course details retrieved successfully
        content:
          application/json:
            schema:
              allOf:
                - $ref: '#/components/schemas/Course'
                - type: object
                  properties:
                    modules:
                      type: array
                      items:
                        $ref: '#/components/schemas/Module'
                    enrollment_status:
                      $ref: '#/components/schemas/EnrollmentStatus'
                    progress:
                      $ref: '#/components/schemas/CourseProgress'
      404:
        $ref: '#/components/responses/NotFound'
```

#### POST /courses/{courseId}/enroll
Enroll in a course.

```yaml
/courses/{courseId}/enroll:
  post:
    summary: Enroll in course
    tags: [Courses]
    security:
      - bearerAuth: []
    parameters:
      - name: courseId
        in: path
        required: true
        schema:
          type: string
          format: uuid
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              payment_method_id:
                type: string
                description: Payment method ID for paid courses
              coupon_code:
                type: string
                description: Optional coupon code
    responses:
      200:
        description: Enrollment successful
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Enrollment'
      400:
        $ref: '#/components/responses/BadRequest'
      402:
        description: Payment required
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/PaymentRequired'
```

### 3. Learning Progress & Analytics

#### GET /progress/courses/{courseId}
Get detailed progress for a specific course.

```yaml
/progress/courses/{courseId}:
  get:
    summary: Get course progress
    tags: [Progress]
    security:
      - bearerAuth: []
    parameters:
      - name: courseId
        in: path
        required: true
        schema:
          type: string
          format: uuid
    responses:
      200:
        description: Progress retrieved successfully
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/DetailedCourseProgress'
```

#### POST /progress/lessons/{lessonId}/complete
Mark a lesson as completed.

```yaml
/progress/lessons/{lessonId}/complete:
  post:
    summary: Complete lesson
    tags: [Progress]
    security:
      - bearerAuth: []
    parameters:
      - name: lessonId
        in: path
        required: true
        schema:
          type: string
          format: uuid
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              time_spent:
                type: integer
                description: Time spent in seconds
                minimum: 0
              quiz_score:
                type: number
                description: Quiz score (0-100)
                minimum: 0
                maximum: 100
              solarpunk_actions:
                type: array
                description: Solarpunk actions taken during lesson
                items:
                  $ref: '#/components/schemas/SolarpunkAction'
    responses:
      200:
        description: Lesson completed successfully
        content:
          application/json:
            schema:
              type: object
              properties:
                progress_updated:
                  type: boolean
                course_progress:
                  $ref: '#/components/schemas/CourseProgress'
                achievements_unlocked:
                  type: array
                  items:
                    $ref: '#/components/schemas/Achievement'
                solarpunk_impact:
                  $ref: '#/components/schemas/SolarpunkImpact'
```

### 4. Certification & CONOCER Integration

#### GET /certificates
List user certificates.

```yaml
/certificates:
  get:
    summary: List user certificates
    tags: [Certificates]
    security:
      - bearerAuth: []
    parameters:
      - name: status
        in: query
        schema:
          type: string
          enum: [pending, issued, verified, expired]
      - name: conocer_status
        in: query
        schema:
          type: string
          enum: [not_submitted, pending, approved, rejected]
    responses:
      200:
        description: Certificates retrieved successfully
        content:
          application/json:
            schema:
              type: object
              properties:
                data:
                  type: array
                  items:
                    $ref: '#/components/schemas/Certificate'
                summary:
                  type: object
                  properties:
                    total_certificates: { type: integer }
                    conocer_approved: { type: integer }
                    solarpunk_certified: { type: integer }
```

#### POST /certificates/request
Request certificate for completed course.

```yaml
/certificates/request:
  post:
    summary: Request course certificate
    tags: [Certificates]
    security:
      - bearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [course_id]
            properties:
              course_id:
                type: string
                format: uuid
              submit_to_conocer:
                type: boolean
                default: true
                description: Whether to submit to CONOCER for official recognition
              solarpunk_portfolio_include:
                type: boolean
                default: true
                description: Include in Solarpunk impact portfolio
    responses:
      201:
        description: Certificate request processed
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CertificateRequest'
      400:
        $ref: '#/components/responses/BadRequest'
      409:
        description: Certificate already exists or course not completed
```

#### GET /certificates/{certificateId}/verify
Verify certificate authenticity.

```yaml
/certificates/{certificateId}/verify:
  get:
    summary: Verify certificate
    tags: [Certificates]
    parameters:
      - name: certificateId
        in: path
        required: true
        schema:
          type: string
          format: uuid
    responses:
      200:
        description: Certificate verification result
        content:
          application/json:
            schema:
              type: object
              properties:
                valid:
                  type: boolean
                certificate:
                  $ref: '#/components/schemas/Certificate'
                verification_details:
                  type: object
                  properties:
                    blockchain_hash: { type: string }
                    conocer_verification: { type: string }
                    issuing_institution: { type: string }
                    verification_date: { type: string, format: date-time }
```

### 5. Solarpunk Impact Tracking

#### GET /solarpunk/dashboard
Get comprehensive Solarpunk impact dashboard.

```yaml
/solarpunk/dashboard:
  get:
    summary: Solarpunk impact dashboard
    tags: [Solarpunk]
    security:
      - bearerAuth: []
    parameters:
      - name: timeframe
        in: query
        schema:
          type: string
          enum: [daily, weekly, monthly, quarterly, yearly]
          default: monthly
    responses:
      200:
        description: Dashboard data retrieved successfully
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SolarpunkDashboard'
```

#### POST /solarpunk/actions
Record a Solarpunk action.

```yaml
/solarpunk/actions:
  post:
    summary: Record Solarpunk action
    tags: [Solarpunk]
    security:
      - bearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/SolarpunkActionRequest'
    responses:
      201:
        description: Action recorded successfully
        content:
          application/json:
            schema:
              type: object
              properties:
                action:
                  $ref: '#/components/schemas/SolarpunkAction'
                impact_score:
                  type: number
                  description: Impact score added to user profile
                achievements_unlocked:
                  type: array
                  items:
                    $ref: '#/components/schemas/Achievement'
```

### 6. Administrative APIs

#### GET /admin/tenants
List all tenants (Super Admin only).

```yaml
/admin/tenants:
  get:
    summary: List tenants
    tags: [Administration]
    security:
      - bearerAuth: []
    parameters:
      - name: status
        in: query
        schema:
          type: string
          enum: [active, suspended, trial]
    responses:
      200:
        description: Tenants retrieved successfully
        content:
          application/json:
            schema:
              type: object
              properties:
                data:
                  type: array
                  items:
                    $ref: '#/components/schemas/Tenant'
                summary:
                  type: object
                  properties:
                    total_tenants: { type: integer }
                    active_tenants: { type: integer }
                    total_users: { type: integer }
                    total_courses: { type: integer }
```

#### GET /admin/analytics/platform
Get platform-wide analytics (Super Admin only).

```yaml
/admin/analytics/platform:
  get:
    summary: Platform analytics
    tags: [Administration, Analytics]
    security:
      - bearerAuth: []
    parameters:
      - name: from_date
        in: query
        schema:
          type: string
          format: date
      - name: to_date
        in: query
        schema:
          type: string
          format: date
      - name: metrics
        in: query
        schema:
          type: array
          items:
            type: string
            enum: [users, courses, enrollments, certificates, revenue, solarpunk_impact]
    responses:
      200:
        description: Analytics data retrieved successfully
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/PlatformAnalytics'
```

## Data Schemas

### Core Entities

```yaml
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        tenant_id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        name:
          type: string
          example: "María González"
        persona:
          $ref: '#/components/schemas/Persona'
        profile:
          $ref: '#/components/schemas/UserProfile'
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    UserProfile:
      type: object
      properties:
        avatar_url:
          type: string
          format: uri
        bio:
          type: string
          maxLength: 500
        location:
          type: string
        timezone:
          type: string
          example: "America/Mexico_City"
        language_preference:
          type: string
          example: "es-MX"
        sustainability_goals:
          type: array
          items:
            type: string
        community_interests:
          type: array
          items:
            type: string

    Course:
      type: object
      properties:
        id:
          type: string
          format: uuid
        tenant_id:
          type: string
          format: uuid
        title:
          type: string
          example: "Permacultura Urbana: Fundamentos"
        description:
          type: string
        instructor:
          $ref: '#/components/schemas/Instructor'
        category:
          type: string
          example: "sustainability"
        difficulty:
          type: string
          enum: [beginner, intermediate, advanced]
        duration_hours:
          type: number
          example: 40.5
        pricing:
          $ref: '#/components/schemas/PricingModel'
        solarpunk_alignment:
          $ref: '#/components/schemas/SolarpunkAlignment'
        conocer_standard:
          $ref: '#/components/schemas/CONOCERStandard'
        status:
          type: string
          enum: [draft, published, archived]
        enrollment_count:
          type: integer
        rating:
          type: number
          minimum: 0
          maximum: 5
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    Module:
      type: object
      properties:
        id:
          type: string
          format: uuid
        course_id:
          type: string
          format: uuid
        title:
          type: string
        description:
          type: string
        order:
          type: integer
        lessons:
          type: array
          items:
            $ref: '#/components/schemas/Lesson'
        estimated_duration:
          type: number
          description: Duration in hours

    Lesson:
      type: object
      properties:
        id:
          type: string
          format: uuid
        module_id:
          type: string
          format: uuid
        title:
          type: string
        content_type:
          type: string
          enum: [video, text, quiz, assignment, interactive]
        content_url:
          type: string
          format: uri
        duration:
          type: number
          description: Duration in minutes
        order:
          type: integer
        solarpunk_elements:
          type: array
          items:
            type: string
        learning_objectives:
          type: array
          items:
            type: string

    Certificate:
      type: object
      properties:
        id:
          type: string
          format: uuid
        user_id:
          type: string
          format: uuid
        course_id:
          type: string
          format: uuid
        issued_at:
          type: string
          format: date-time
        expires_at:
          type: string
          format: date-time
        status:
          type: string
          enum: [pending, issued, verified, expired]
        verification_hash:
          type: string
        conocer_submission:
          $ref: '#/components/schemas/CONOCERSubmission'
        solarpunk_compliance:
          $ref: '#/components/schemas/SolarpunkCompliance'
        download_url:
          type: string
          format: uri
```

### Solarpunk-Specific Schemas

```yaml
    SolarpunkProfile:
      type: object
      properties:
        sustainability_score:
          type: number
          minimum: 0
          maximum: 100
        community_impact_score:
          type: number
          minimum: 0
          maximum: 100
        regenerative_actions_count:
          type: integer
        carbon_footprint_reduction:
          type: number
          description: CO2 equivalent in kg
        circular_economy_contributions:
          type: integer
        knowledge_sharing_sessions:
          type: integer
        community_projects_initiated:
          type: integer
        last_updated:
          type: string
          format: date-time

    SolarpunkAlignment:
      type: object
      properties:
        overall_score:
          type: number
          minimum: 0
          maximum: 100
        ecological_sustainability:
          type: boolean
        social_equity:
          type: boolean
        economic_viability:
          type: boolean
        technological_appropriateness:
          type: boolean
        cultural_relevance:
          type: boolean
        regenerative_design:
          type: boolean
        alignment_details:
          type: object
          properties:
            sustainability_elements:
              type: array
              items:
                type: string
            community_benefits:
              type: array
              items:
                type: string
            regenerative_practices:
              type: array
              items:
                type: string

    SolarpunkAction:
      type: object
      properties:
        id:
          type: string
          format: uuid
        user_id:
          type: string
          format: uuid
        action_type:
          type: string
          enum: [
            sustainability_practice,
            community_contribution,
            knowledge_sharing,
            regenerative_project,
            circular_economy_action,
            social_justice_initiative
          ]
        title:
          type: string
        description:
          type: string
        impact_metrics:
          type: object
          properties:
            carbon_impact:
              type: number
              description: CO2 impact in kg
            people_benefited:
              type: integer
            resources_conserved:
              type: string
        verification_status:
          type: string
          enum: [self_reported, peer_verified, expert_verified]
        verification_evidence:
          type: array
          items:
            type: object
            properties:
              type: { type: string }
              url: { type: string, format: uri }
        recorded_at:
          type: string
          format: date-time

    SolarpunkDashboard:
      type: object
      properties:
        timeframe:
          type: string
          enum: [daily, weekly, monthly, quarterly, yearly]
        overall_impact_score:
          type: number
          minimum: 0
          maximum: 100
        metrics:
          type: object
          properties:
            sustainability_actions:
              type: integer
            community_contributions:
              type: integer
            knowledge_sharing_sessions:
              type: integer
            carbon_footprint_reduction:
              type: number
            biodiversity_impact_score:
              type: number
            social_justice_activities:
              type: integer
        achievements:
          type: array
          items:
            $ref: '#/components/schemas/Achievement'
        impact_trends:
          type: object
          properties:
            sustainability_trend:
              type: string
              enum: [increasing, stable, decreasing]
            community_engagement_trend:
              type: string
              enum: [increasing, stable, decreasing]
        community_leaderboard:
          type: array
          items:
            type: object
            properties:
              user_name: { type: string }
              impact_score: { type: number }
              rank: { type: integer }
```

### CONOCER Integration Schemas

```yaml
    CONOCERStandard:
      type: object
      properties:
        id:
          type: string
        code:
          type: string
          example: "EC0301"
        title:
          type: string
        description:
          type: string
        competency_units:
          type: array
          items:
            $ref: '#/components/schemas/CompetencyUnit'
        required_hours:
          type: integer
        validity_period:
          type: integer
          description: Validity period in months
        solarpunk_alignment:
          $ref: '#/components/schemas/SolarpunkAlignment'

    CompetencyUnit:
      type: object
      properties:
        code:
          type: string
        title:
          type: string
        learning_outcomes:
          type: array
          items:
            type: string
        assessment_criteria:
          type: array
          items:
            type: string
        knowledge_elements:
          type: array
          items:
            type: string

    CONOCERSubmission:
      type: object
      properties:
        id:
          type: string
          format: uuid
        certificate_id:
          type: string
          format: uuid
        submission_id:
          type: string
          description: CONOCER external submission ID
        status:
          type: string
          enum: [pending, submitted, approved, rejected, expired]
        submitted_at:
          type: string
          format: date-time
        response_data:
          type: object
        solarpunk_compliance_score:
          type: number
          minimum: 0
          maximum: 100
```

### Analytics & Progress Schemas

```yaml
    LearningAnalytics:
      type: object
      properties:
        total_courses_enrolled:
          type: integer
        courses_completed:
          type: integer
        total_learning_time:
          type: number
          description: Total time in hours
        average_course_rating:
          type: number
          minimum: 0
          maximum: 5
        skill_progression:
          type: array
          items:
            type: object
            properties:
              skill: { type: string }
              level: { type: integer, minimum: 1, maximum: 5 }
              progress: { type: number, minimum: 0, maximum: 100 }
        learning_velocity:
          type: number
          description: Lessons completed per week
        engagement_score:
          type: number
          minimum: 0
          maximum: 100

    CourseProgress:
      type: object
      properties:
        course_id:
          type: string
          format: uuid
        user_id:
          type: string
          format: uuid
        progress_percentage:
          type: number
          minimum: 0
          maximum: 100
        modules_completed:
          type: integer
        lessons_completed:
          type: integer
        total_time_spent:
          type: number
          description: Time in minutes
        last_accessed:
          type: string
          format: date-time
        estimated_completion_date:
          type: string
          format: date
        solarpunk_actions_taken:
          type: integer

    Achievement:
      type: object
      properties:
        id:
          type: string
          format: uuid
        title:
          type: string
        description:
          type: string
        type:
          type: string
          enum: [learning, solarpunk, community, certification]
        badge_url:
          type: string
          format: uri
        earned_at:
          type: string
          format: date-time
        rarity:
          type: string
          enum: [common, rare, epic, legendary]
```

### Utility Schemas

```yaml
    PaginationMeta:
      type: object
      properties:
        current_page:
          type: integer
          minimum: 1
        per_page:
          type: integer
          minimum: 1
        total_pages:
          type: integer
        total_count:
          type: integer
        has_next_page:
          type: boolean
        has_prev_page:
          type: boolean

    ErrorResponse:
      type: object
      properties:
        error:
          type: object
          properties:
            code:
              type: string
              example: "VALIDATION_ERROR"
            message:
              type: string
              example: "The provided data is invalid"
            details:
              type: array
              items:
                type: object
                properties:
                  field: { type: string }
                  message: { type: string }
        request_id:
          type: string
          format: uuid
        timestamp:
          type: string
          format: date-time

    Persona:
      type: string
      enum: [learner, instructor, admin, super_admin]
      description: User role within the platform
```

## Error Handling

### Standard Error Responses

```yaml
components:
  responses:
    BadRequest:
      description: Invalid request data
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          example:
            error:
              code: "VALIDATION_ERROR"
              message: "The provided data is invalid"
              details:
                - field: "email"
                  message: "Invalid email format"
            request_id: "123e4567-e89b-12d3-a456-426614174000"
            timestamp: "2024-07-10T10:30:00Z"

    Unauthorized:
      description: Authentication required or invalid
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          example:
            error:
              code: "UNAUTHORIZED"
              message: "Invalid or expired authentication token"
            request_id: "123e4567-e89b-12d3-a456-426614174000"
            timestamp: "2024-07-10T10:30:00Z"

    Forbidden:
      description: Insufficient permissions
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          example:
            error:
              code: "FORBIDDEN"
              message: "Insufficient permissions for this operation"
            request_id: "123e4567-e89b-12d3-a456-426614174000"
            timestamp: "2024-07-10T10:30:00Z"

    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          example:
            error:
              code: "NOT_FOUND"
              message: "The requested resource was not found"
            request_id: "123e4567-e89b-12d3-a456-426614174000"
            timestamp: "2024-07-10T10:30:00Z"

    TooManyRequests:
      description: Rate limit exceeded
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          example:
            error:
              code: "RATE_LIMIT_EXCEEDED"
              message: "Too many requests, please try again later"
            request_id: "123e4567-e89b-12d3-a456-426614174000"
            timestamp: "2024-07-10T10:30:00Z"
      headers:
        X-RateLimit-Limit:
          schema:
            type: integer
          description: Request limit per hour
        X-RateLimit-Remaining:
          schema:
            type: integer
          description: Remaining requests in current window
        X-RateLimit-Reset:
          schema:
            type: integer
          description: Unix timestamp when limit resets

    InternalServerError:
      description: Internal server error
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          example:
            error:
              code: "INTERNAL_ERROR"
              message: "An internal server error occurred"
            request_id: "123e4567-e89b-12d3-a456-426614174000"
            timestamp: "2024-07-10T10:30:00Z"
```

## Rate Limiting

### Rate Limit Headers
All API responses include rate limiting headers:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1625097600
X-RateLimit-Window: 3600
```

### Rate Limit Tiers

| Persona | Requests/Hour | Burst Limit |
|---------|---------------|-------------|
| Learner | 1,000 | 50/minute |
| Instructor | 2,000 | 100/minute |
| Admin | 5,000 | 200/minute |
| Super Admin | 10,000 | 500/minute |

## Webhooks

### Webhook Events

```yaml
webhooks:
  course-completed:
    post:
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                event_type:
                  type: string
                  example: "course.completed"
                data:
                  type: object
                  properties:
                    user_id: { type: string, format: uuid }
                    course_id: { type: string, format: uuid }
                    completion_date: { type: string, format: date-time }
                    certificate_requested: { type: boolean }
                    solarpunk_impact: { $ref: '#/components/schemas/SolarpunkImpact' }
                tenant_id:
                  type: string
                  format: uuid
                timestamp:
                  type: string
                  format: date-time

  certificate-issued:
    post:
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                event_type:
                  type: string
                  example: "certificate.issued"
                data:
                  type: object
                  properties:
                    certificate_id: { type: string, format: uuid }
                    user_id: { type: string, format: uuid }
                    course_id: { type: string, format: uuid }
                    conocer_submitted: { type: boolean }
                    verification_url: { type: string, format: uri }
```

## Security Considerations

### Input Validation
- All input is validated against strict schemas
- SQL injection prevention through parameterized queries
- XSS prevention through output encoding
- File upload validation and virus scanning

### Authentication Security
- JWT tokens with short expiration (1 hour)
- Refresh token rotation
- Multi-factor authentication support
- Session management and invalidation

### Data Protection
- Encryption at rest (AES-256)
- Encryption in transit (TLS 1.3)
- PII data masking in logs
- GDPR compliance for data export/deletion

### API Security
- CORS policy enforcement
- Request size limits
- Content-Type validation
- CSRF protection for web clients

---

**API Version**: 1.0  
**Last Updated**: 2024-07-10  
**Maintained By**: MADFAM Academy Engineering Team