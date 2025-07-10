-- Demo Data Seed for Educational Marketplace
-- This creates sample data for testing and development

-- Insert demo tenant
INSERT INTO tenants (id, subdomain, name, settings, features, billing)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'demo', 'Demo Academy', 
   '{"primaryColor": "#4A90E2", "logo": "/assets/demo-logo.png"}',
   '{"maxCourses": 1000, "maxStudents": 10000, "customBranding": true, "whiteLabel": false, "apiAccess": true}',
   '{"plan": "professional", "platformFeePercentage": 15}'),
  ('22222222-2222-2222-2222-222222222222', 'tech', 'Tech Institute',
   '{"primaryColor": "#27AE60", "logo": "/assets/tech-logo.png"}',
   '{"maxCourses": 500, "maxStudents": 5000, "customBranding": true, "whiteLabel": false, "apiAccess": false}',
   '{"plan": "starter", "platformFeePercentage": 20}');

-- Insert demo users (passwords would be hashed in real implementation)
-- Password for all users: "demo123"
INSERT INTO users (id, tenant_id, email, email_verified, password_hash, persona, profile)
VALUES
  -- Demo tenant users
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 
   'admin@demo.com', true, '$2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'admin',
   '{"firstName": "Admin", "lastName": "User", "avatar": "/avatars/admin.jpg"}'),
   
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111',
   'instructor1@demo.com', true, '$2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'instructor',
   '{"firstName": "John", "lastName": "Smith", "avatar": "/avatars/john.jpg", "bio": "Expert in web development with 10+ years of experience"}'),
   
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111',
   'instructor2@demo.com', true, '$2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'instructor',
   '{"firstName": "Jane", "lastName": "Doe", "avatar": "/avatars/jane.jpg", "bio": "Data science and machine learning specialist"}'),
   
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111',
   'student1@demo.com', true, '$2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'learner',
   '{"firstName": "Alice", "lastName": "Johnson", "avatar": "/avatars/alice.jpg"}'),
   
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111',
   'student2@demo.com', true, '$2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'learner',
   '{"firstName": "Bob", "lastName": "Williams", "avatar": "/avatars/bob.jpg"}');

-- Insert categories
INSERT INTO categories (id, tenant_id, parent_id, name, slug, description, icon, display_order)
VALUES
  ('11111111-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', NULL,
   'Programming', 'programming', 'Learn various programming languages and frameworks', 'code', 1),
   
  ('11111111-0001-0001-0001-000000000002', '11111111-1111-1111-1111-111111111111', NULL,
   'Data Science', 'data-science', 'Master data analysis, machine learning, and AI', 'chart', 2),
   
  ('11111111-0001-0001-0001-000000000003', '11111111-1111-1111-1111-111111111111', 
   '11111111-0001-0001-0001-000000000001',
   'Web Development', 'web-development', 'Frontend and backend web technologies', 'globe', 1),
   
  ('11111111-0001-0001-0001-000000000004', '11111111-1111-1111-1111-111111111111',
   '11111111-0001-0001-0001-000000000001',
   'Mobile Development', 'mobile-development', 'iOS and Android app development', 'smartphone', 2);

-- Insert demo courses
INSERT INTO courses (id, tenant_id, instructor_id, title, slug, description, short_description,
                    thumbnail_url, price, metadata, categories, tags, language, skill_level,
                    duration_minutes, status, published_at, rating, rating_count, enrollment_count)
VALUES
  -- Course 1: React Fundamentals
  ('11111111-0002-0002-0002-000000000001', '11111111-1111-1111-1111-111111111111',
   'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   'React Fundamentals: Build Modern Web Apps',
   'react-fundamentals-build-modern-web-apps',
   'Master React.js from the ground up. Learn components, hooks, state management, and build real-world applications with confidence.',
   'Complete React course for beginners to intermediate developers',
   '/thumbnails/react-course.jpg',
   '{"amount": 89.99, "currency": "USD", "type": "one-time"}',
   '{"duration": 720, "skillLevel": "beginner", "language": "en", "prerequisites": ["Basic JavaScript", "HTML & CSS"], "objectives": ["Understand React components", "Master React Hooks", "Build complete applications", "Deploy to production"]}',
   ARRAY['11111111-0001-0001-0001-000000000003']::UUID[],
   ARRAY['react', 'javascript', 'frontend', 'web development'],
   'en', 'beginner', 720, 'published', NOW() - INTERVAL '30 days',
   4.7, 156, 523),

  -- Course 2: Python for Data Science
  ('11111111-0002-0002-0002-000000000002', '11111111-1111-1111-1111-111111111111',
   'cccccccc-cccc-cccc-cccc-cccccccccccc',
   'Python for Data Science: From Zero to Hero',
   'python-data-science-zero-to-hero',
   'Comprehensive Python course focused on data science applications. Learn pandas, numpy, matplotlib, and machine learning basics.',
   'Master Python for data analysis and machine learning',
   '/thumbnails/python-course.jpg',
   '{"amount": 129.99, "currency": "USD", "type": "one-time"}',
   '{"duration": 1080, "skillLevel": "beginner", "language": "en", "prerequisites": ["Basic programming knowledge"], "objectives": ["Python fundamentals", "Data manipulation with pandas", "Data visualization", "Intro to machine learning"]}',
   ARRAY['11111111-0001-0001-0001-000000000002']::UUID[],
   ARRAY['python', 'data science', 'pandas', 'machine learning'],
   'en', 'beginner', 1080, 'published', NOW() - INTERVAL '45 days',
   4.8, 234, 892),

  -- Course 3: Advanced Node.js
  ('11111111-0002-0002-0002-000000000003', '11111111-1111-1111-1111-111111111111',
   'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   'Advanced Node.js: Microservices and Scalability',
   'advanced-nodejs-microservices',
   'Take your Node.js skills to the next level. Build scalable microservices, implement advanced patterns, and master deployment strategies.',
   'Advanced Node.js patterns and microservices architecture',
   '/thumbnails/nodejs-course.jpg',
   '{"amount": 149.99, "currency": "USD", "type": "one-time"}',
   '{"duration": 900, "skillLevel": "advanced", "language": "en", "prerequisites": ["Intermediate Node.js", "Basic Docker knowledge"], "objectives": ["Microservices architecture", "Advanced async patterns", "Performance optimization", "Production deployment"]}',
   ARRAY['11111111-0001-0001-0001-000000000003']::UUID[],
   ARRAY['nodejs', 'microservices', 'backend', 'javascript'],
   'en', 'advanced', 900, 'published', NOW() - INTERVAL '15 days',
   4.9, 89, 267);

-- Insert modules for React course
INSERT INTO modules (id, course_id, title, description, display_order, duration_minutes)
VALUES
  ('11111111-0003-0003-0003-000000000001', '11111111-0002-0002-0002-000000000001',
   'Getting Started with React', 'Set up your development environment and create your first React app', 1, 90),
   
  ('11111111-0003-0003-0003-000000000002', '11111111-0002-0002-0002-000000000001',
   'Components and Props', 'Learn about React components, props, and component composition', 2, 120),
   
  ('11111111-0003-0003-0003-000000000003', '11111111-0002-0002-0002-000000000001',
   'State and Hooks', 'Master React state management with useState, useEffect, and custom hooks', 3, 180);

-- Insert lessons for first module
INSERT INTO lessons (id, module_id, title, description, lesson_type, content_url, duration_minutes, display_order, is_preview)
VALUES
  ('11111111-0004-0004-0004-000000000001', '11111111-0003-0003-0003-000000000001',
   'Course Introduction', 'Welcome to React Fundamentals', 'video', '/videos/react-intro.mp4', 10, 1, true),
   
  ('11111111-0004-0004-0004-000000000002', '11111111-0003-0003-0003-000000000001',
   'Setting Up Your Environment', 'Install Node.js, npm, and create-react-app', 'video', '/videos/react-setup.mp4', 20, 2, false),
   
  ('11111111-0004-0004-0004-000000000003', '11111111-0003-0003-0003-000000000001',
   'Your First React App', 'Create and understand a basic React application', 'video', '/videos/first-app.mp4', 30, 3, false),
   
  ('11111111-0004-0004-0004-000000000004', '11111111-0003-0003-0003-000000000001',
   'JSX Fundamentals', 'Understanding JSX syntax and its benefits', 'article', NULL, 15, 4, false),
   
  ('11111111-0004-0004-0004-000000000005', '11111111-0003-0003-0003-000000000001',
   'Module Quiz', 'Test your knowledge of React basics', 'quiz', NULL, 15, 5, false);

-- Insert sample enrollments
INSERT INTO enrollments (id, tenant_id, student_id, course_id, enrolled_at, status, completion_percentage, last_accessed_at)
VALUES
  ('11111111-0005-0005-0005-000000000001', '11111111-1111-1111-1111-111111111111',
   'dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-0002-0002-0002-000000000001',
   NOW() - INTERVAL '20 days', 'active', 35, NOW() - INTERVAL '2 days'),
   
  ('11111111-0005-0005-0005-000000000002', '11111111-1111-1111-1111-111111111111',
   'dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-0002-0002-0002-000000000002',
   NOW() - INTERVAL '25 days', 'completed', 100, NOW() - INTERVAL '5 days'),
   
  ('11111111-0005-0005-0005-000000000003', '11111111-1111-1111-1111-111111111111',
   'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-0002-0002-0002-000000000001',
   NOW() - INTERVAL '15 days', 'active', 60, NOW() - INTERVAL '1 day');

-- Insert lesson progress
INSERT INTO lesson_progress (id, enrollment_id, lesson_id, status, started_at, completed_at, time_spent_seconds)
VALUES
  ('11111111-0006-0006-0006-000000000001', '11111111-0005-0005-0005-000000000001',
   '11111111-0004-0004-0004-000000000001', 'completed', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days', 600),
   
  ('11111111-0006-0006-0006-000000000002', '11111111-0005-0005-0005-000000000001',
   '11111111-0004-0004-0004-000000000002', 'completed', NOW() - INTERVAL '19 days', NOW() - INTERVAL '19 days', 1200),
   
  ('11111111-0006-0006-0006-000000000003', '11111111-0005-0005-0005-000000000001',
   '11111111-0004-0004-0004-000000000003', 'in_progress', NOW() - INTERVAL '2 days', NULL, 900);

-- Insert certificate template
INSERT INTO certificate_templates (id, tenant_id, name, template_type, design, variables, is_default)
VALUES
  ('11111111-0007-0007-0007-000000000001', '11111111-1111-1111-1111-111111111111',
   'Default Course Certificate', 'course',
   '{"layout": "landscape", "backgroundColor": "#FFFFFF", "borderStyle": "elegant", "fonts": {"title": {"family": "Helvetica", "size": 36, "color": "#2C3E50"}, "body": {"family": "Helvetica", "size": 14, "color": "#34495E"}, "accent": {"family": "Times", "size": 18, "color": "#E74C3C"}}, "elements": [{"type": "text", "position": {"x": 396, "y": 150}, "variable": "courseName", "style": {"fontSize": 28, "fontWeight": "bold"}}, {"type": "text", "position": {"x": 396, "y": 250}, "content": "This is to certify that", "style": {"fontSize": 18}}, {"type": "text", "position": {"x": 396, "y": 300}, "variable": "studentName", "style": {"fontSize": 24, "fontWeight": "bold"}}, {"type": "text", "position": {"x": 396, "y": 350}, "content": "has successfully completed the course", "style": {"fontSize": 16}}]}',
   ARRAY['studentName', 'courseName', 'completionDate', 'instructorName'],
   true);

-- Insert sample certificate
INSERT INTO certificates (id, tenant_id, student_id, course_id, enrollment_id, template_id,
                         certificate_number, certificate_url, metadata, verification_code)
VALUES
  ('11111111-0008-0008-0008-000000000001', '11111111-1111-1111-1111-111111111111',
   'dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-0002-0002-0002-000000000002',
   '11111111-0005-0005-0005-000000000002', '11111111-0007-0007-0007-000000000001',
   'CERT-2024-000001', '/certificates/CERT-2024-000001.pdf',
   '{"studentName": "Alice Johnson", "courseName": "Python for Data Science: From Zero to Hero", "instructorName": "Jane Doe", "completionDate": "2024-01-05T00:00:00Z", "score": 92, "courseDuration": 18}',
   'ABCD123456');

-- Insert course reviews
INSERT INTO course_reviews (id, course_id, student_id, enrollment_id, rating, title, comment, helpful_count)
VALUES
  ('11111111-0009-0009-0009-000000000001', '11111111-0002-0002-0002-000000000002',
   'dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-0005-0005-0005-000000000002',
   5, 'Excellent course for beginners!',
   'Jane explains complex concepts in a very simple way. The hands-on projects really helped solidify my understanding.',
   23),
   
  ('11111111-0009-0009-0009-000000000002', '11111111-0002-0002-0002-000000000001',
   'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-0005-0005-0005-000000000003',
   4, 'Great content, could use more exercises',
   'John is a great instructor. I would have liked more practice exercises between videos.',
   15);

-- Create indexes for demo data
CREATE INDEX idx_demo_courses_tenant ON courses(tenant_id) WHERE tenant_id = '11111111-1111-1111-1111-111111111111';
CREATE INDEX idx_demo_enrollments_student ON enrollments(student_id) WHERE tenant_id = '11111111-1111-1111-1111-111111111111';