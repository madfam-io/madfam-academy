import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, Users, Award, Leaf, Star, Play, Download, Eye } from 'lucide-react';
import { useCourse } from '../hooks/useCourse';
import { SolarpunkAlignment } from '../components/course/SolarpunkAlignment';
import { CoursePreview } from '../components/course/CoursePreview';
import { CourseSyllabus } from '../components/course/CourseSyllabus';
import { EnrollmentFlow } from '../components/enrollment/EnrollmentFlow';
import { PricingDisplay } from '../components/pricing/PricingDisplay';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';

export const CourseDetails: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { data: course, isLoading, error } = useCourse(courseId!);
  const [showEnrollmentFlow, setShowEnrollmentFlow] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  if (isLoading) {
    return <CourseDetailsLoading />;
  }

  if (error || !course) {
    return (
      <ErrorMessage 
        title="Course not found"
        message="The course you're looking for doesn't exist or isn't available."
      />
    );
  }

  const handleEnrollClick = () => {
    setShowEnrollmentFlow(true);
  };

  const handlePreviewClick = () => {
    setShowPreview(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Course Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Course Title and Meta */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="primary">{course.category}</Badge>
              <Badge variant="outline">{course.difficulty}</Badge>
              {course.conocerCertified && (
                <Badge variant="success" className="flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  CONOCER Certified
                </Badge>
              )}
              {course.solarpunkAlignment.overallScore >= 80 && (
                <Badge variant="green" className="flex items-center gap-1">
                  <Leaf className="w-3 h-3" />
                  Solarpunk Aligned
                </Badge>
              )}
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {course.title}
            </h1>

            <p className="text-lg text-gray-600 mb-6">
              {course.description}
            </p>

            {/* Course Stats */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{course.durationHours} hours</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{course.enrollmentCount} students</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{course.rating} ({course.reviewCount} reviews)</span>
              </div>
            </div>
          </div>

          {/* Course Content Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
              <TabsTrigger value="instructor">Instructor</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="space-y-6">
                {/* What You'll Learn */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">What You'll Learn</h3>
                  <ul className="space-y-2">
                    {course.learningObjectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-700">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Solarpunk Alignment */}
                <SolarpunkAlignment alignment={course.solarpunkAlignment} />

                {/* Prerequisites */}
                {course.prerequisites && course.prerequisites.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Prerequisites</h3>
                    <ul className="space-y-2">
                      {course.prerequisites.map((prereq, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-700">{prereq}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Course Materials */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Course Includes</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Play className="w-5 h-5 text-green-600" />
                      <span>{course.videoCount} video lessons</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Download className="w-5 h-5 text-green-600" />
                      <span>{course.resourceCount} downloadable resources</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-green-600" />
                      <span>Certificate of completion</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Eye className="w-5 h-5 text-green-600" />
                      <span>Lifetime access</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="syllabus" className="mt-6">
              <CourseSyllabus modules={course.modules} />
            </TabsContent>

            <TabsContent value="instructor" className="mt-6">
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-start gap-4">
                  <img
                    src={course.instructor.avatarUrl || '/placeholder-avatar.jpg'}
                    alt={course.instructor.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">
                      {course.instructor.name}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {course.instructor.bio}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Students: </span>
                        <span className="text-gray-600">
                          {course.instructor.studentCount?.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Courses: </span>
                        <span className="text-gray-600">
                          {course.instructor.courseCount}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Rating: </span>
                        <span className="text-gray-600">
                          {course.instructor.rating} ⭐
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Reviews: </span>
                        <span className="text-gray-600">
                          {course.instructor.reviewCount?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-xl font-semibold mb-4">Student Reviews</h3>
                  <div className="text-center text-gray-500 py-8">
                    Reviews component will be implemented here
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            {/* Course Preview */}
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="relative aspect-video bg-gray-900">
                <img
                  src={course.thumbnailUrl || '/placeholder-course.jpg'}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={handlePreviewClick}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-20 transition-all"
                >
                  <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-gray-900 ml-1" />
                  </div>
                </button>
              </div>

              <div className="p-6">
                {/* Pricing */}
                <PricingDisplay pricing={course.pricing} />

                {/* Enrollment Button */}
                <Button
                  onClick={handleEnrollClick}
                  className="w-full mb-4"
                  size="lg"
                >
                  Enroll Now
                </Button>

                <Button
                  onClick={handlePreviewClick}
                  variant="outline"
                  className="w-full"
                >
                  Preview Course
                </Button>

                {/* Course Features */}
                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">{course.durationHours} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Skill Level</span>
                    <span className="font-medium capitalize">{course.difficulty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Language</span>
                    <span className="font-medium">{course.language || 'English'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Students</span>
                    <span className="font-medium">{course.enrollmentCount.toLocaleString()}</span>
                  </div>
                  {course.conocerCertified && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">CONOCER Cert</span>
                      <span className="font-medium text-green-600">Included</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Related Courses */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Related Courses</h3>
              <div className="text-center text-gray-500">
                Related courses component will be implemented here
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEnrollmentFlow && (
        <EnrollmentFlow
          course={course}
          onClose={() => setShowEnrollmentFlow(false)}
        />
      )}

      {showPreview && (
        <CoursePreview
          course={course}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

const CourseDetailsLoading: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <LoadingSkeleton className="h-8 w-3/4" />
          <LoadingSkeleton className="h-4 w-full" />
          <LoadingSkeleton className="h-4 w-2/3" />
          <div className="flex gap-4">
            <LoadingSkeleton className="h-8 w-24" />
            <LoadingSkeleton className="h-8 w-24" />
            <LoadingSkeleton className="h-8 w-24" />
          </div>
          <LoadingSkeleton className="h-64 w-full" />
        </div>
        <div className="lg:col-span-1">
          <LoadingSkeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
};