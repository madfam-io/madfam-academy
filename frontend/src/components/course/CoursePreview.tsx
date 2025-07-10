import React, { useState, useRef, useEffect } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, Clock, Eye } from 'lucide-react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface CoursePreviewProps {
  course: {
    id: string;
    title: string;
    thumbnailUrl?: string;
    previewVideoUrl?: string;
    modules: Module[];
    durationHours: number;
  };
  onClose: () => void;
}

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  estimatedDuration: number;
  order: number;
}

interface Lesson {
  id: string;
  title: string;
  contentType: 'video' | 'text' | 'quiz' | 'assignment' | 'interactive';
  duration: number;
  order: number;
  previewAvailable?: boolean;
  previewUrl?: string;
}

export const CoursePreview: React.FC<CoursePreviewProps> = ({
  course,
  onClose
}) => {
  const [currentTab, setCurrentTab] = useState<'preview' | 'content'>('preview');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // Get first available preview lesson
  const previewLessons = course.modules
    .flatMap(module => module.lessons)
    .filter(lesson => lesson.previewAvailable);

  const defaultLesson = previewLessons[0] || null;

  useEffect(() => {
    if (defaultLesson && !selectedLesson) {
      setSelectedLesson(defaultLesson);
    }
  }, [defaultLesson, selectedLesson]);

  return (
    <Dialog open onClose={onClose} size="full">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Course Preview</h2>
            <p className="text-gray-600">{course.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b bg-white">
          <div className="px-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setCurrentTab('preview')}
                className={cn(
                  'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                  currentTab === 'preview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Video Preview
                </div>
              </button>
              <button
                onClick={() => setCurrentTab('content')}
                className={cn(
                  'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                  currentTab === 'content'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Course Content
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {currentTab === 'preview' ? (
            <PreviewPlayer
              course={course}
              lesson={selectedLesson}
              onLessonChange={setSelectedLesson}
              previewLessons={previewLessons}
            />
          ) : (
            <ContentOverview course={course} />
          )}
        </div>
      </div>
    </Dialog>
  );
};

const PreviewPlayer: React.FC<{
  course: any;
  lesson: Lesson | null;
  onLessonChange: (lesson: Lesson) => void;
  previewLessons: Lesson[];
}> = ({ course, lesson, onLessonChange, previewLessons }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      setVolume(vol);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePreviousLesson = () => {
    if (!lesson) return;
    const currentIndex = previewLessons.findIndex(l => l.id === lesson.id);
    if (currentIndex > 0) {
      onLessonChange(previewLessons[currentIndex - 1]);
    }
  };

  const handleNextLesson = () => {
    if (!lesson) return;
    const currentIndex = previewLessons.findIndex(l => l.id === lesson.id);
    if (currentIndex < previewLessons.length - 1) {
      onLessonChange(previewLessons[currentIndex + 1]);
    }
  };

  return (
    <div className="flex h-full">
      {/* Video Player */}
      <div className="flex-1 bg-black flex flex-col">
        <div className="flex-1 relative">
          {lesson?.previewUrl ? (
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              poster={course.thumbnailUrl}
              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              onDurationChange={(e) => setDuration(e.currentTarget.duration)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              <source src={lesson.previewUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Preview Not Available</h3>
                <p className="text-gray-300">
                  This lesson preview is not available. Enroll to access full content.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Video Controls */}
        {lesson?.previewUrl && (
          <div className="bg-black bg-opacity-80 p-4 space-y-3">
            {/* Progress Bar */}
            <div className="w-full">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handlePreviousLesson}
                  disabled={!lesson || previewLessons.findIndex(l => l.id === lesson.id) === 0}
                  className="text-white hover:text-blue-400 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                
                <button
                  onClick={handlePlayPause}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </button>
                
                <button
                  onClick={handleNextLesson}
                  disabled={!lesson || previewLessons.findIndex(l => l.id === lesson.id) === previewLessons.length - 1}
                  className="text-white hover:text-blue-400 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  <SkipForward className="w-5 h-5" />
                </button>

                <div className="flex items-center space-x-2">
                  <button onClick={handleMute} className="text-white hover:text-blue-400">
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <span className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <button className="text-white hover:text-blue-400">
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="w-80 bg-white border-l flex flex-col">
        {/* Current Lesson Info */}
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900 mb-2">
            {lesson ? lesson.title : 'Select a Preview'}
          </h3>
          {lesson && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{Math.ceil(lesson.duration)} minutes</span>
            </div>
          )}
        </div>

        {/* Preview Lessons List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h4 className="font-medium text-gray-900 mb-3">Available Previews</h4>
            {previewLessons.length > 0 ? (
              <div className="space-y-2">
                {previewLessons.map((previewLesson, index) => (
                  <button
                    key={previewLesson.id}
                    onClick={() => onLessonChange(previewLesson)}
                    className={cn(
                      'w-full text-left p-3 rounded-lg border transition-colors',
                      lesson?.id === previewLesson.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                        lesson?.id === previewLesson.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      )}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {previewLesson.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{Math.ceil(previewLesson.duration)} min</span>
                          <span>•</span>
                          <span className="capitalize">{previewLesson.contentType}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Eye className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No preview lessons available</p>
                <p className="text-xs text-gray-400 mt-1">
                  Enroll to access all course content
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Enrollment CTA */}
        <div className="p-4 border-t bg-gray-50">
          <Button className="w-full" onClick={() => {/* Handle enrollment */}}>
            Enroll to Access Full Course
          </Button>
          <p className="text-xs text-gray-500 text-center mt-2">
            Get lifetime access to all {course.durationHours} hours of content
          </p>
        </div>
      </div>
    </div>
  );
};

const ContentOverview: React.FC<{
  course: any;
}> = ({ course }) => {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const totalLessons = course.modules.reduce((total: number, module: Module) => 
    total + module.lessons.length, 0
  );

  const totalDuration = course.modules.reduce((total: number, module: Module) => 
    total + module.estimatedDuration, 0
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Course Stats */}
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Course Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{course.modules.length}</div>
              <div className="text-sm text-gray-600">Modules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalLessons}</div>
              <div className="text-sm text-gray-600">Lessons</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{Math.round(totalDuration)}h</div>
              <div className="text-sm text-gray-600">Total Duration</div>
            </div>
          </div>
        </div>

        {/* Modules List */}
        <div className="space-y-4">
          {course.modules
            .sort((a: Module, b: Module) => a.order - b.order)
            .map((module: Module) => (
              <div key={module.id} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">
                        Module {module.order}: {module.title}
                      </h4>
                      <p className="text-gray-600 text-sm mb-2">{module.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{module.lessons.length} lessons</span>
                        <span>•</span>
                        <span>{Math.round(module.estimatedDuration * 60)} minutes</span>
                      </div>
                    </div>
                    <div className={cn(
                      'transform transition-transform',
                      expandedModules.has(module.id) ? 'rotate-180' : ''
                    )}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </button>

                {expandedModules.has(module.id) && (
                  <div className="px-6 pb-4 bg-gray-50">
                    <div className="space-y-2">
                      {module.lessons
                        .sort((a: Lesson, b: Lesson) => a.order - b.order)
                        .map((lesson: Lesson, index: number) => (
                          <div key={lesson.id} className="flex items-center gap-3 py-2">
                            <div className="w-6 h-6 bg-white border rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">{lesson.title}</span>
                                {lesson.previewAvailable && (
                                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                    Preview
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>{Math.ceil(lesson.duration)} min</span>
                                <span>•</span>
                                <span className="capitalize">{lesson.contentType}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>

        {/* Enrollment CTA */}
        <div className="mt-8 text-center">
          <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-lg p-6 text-white">
            <h3 className="text-xl font-semibold mb-2">Ready to Start Learning?</h3>
            <p className="mb-4 opacity-90">
              Get instant access to all {totalLessons} lessons and {Math.round(totalDuration)} hours of content
            </p>
            <Button 
              variant="secondary" 
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Enroll Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};