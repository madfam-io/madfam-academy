import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Clock, Play, FileText, HelpCircle, Award, Lock, Eye } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  estimatedDuration: number;
  order: number;
  locked?: boolean;
  prerequisite?: string;
}

interface Lesson {
  id: string;
  title: string;
  contentType: 'video' | 'text' | 'quiz' | 'assignment' | 'interactive';
  duration: number;
  order: number;
  previewAvailable?: boolean;
  completed?: boolean;
  locked?: boolean;
  description?: string;
}

interface CourseSyllabusProps {
  modules: Module[];
  interactive?: boolean;
  showProgress?: boolean;
  onLessonClick?: (lesson: Lesson, module: Module) => void;
  onPreviewClick?: (lesson: Lesson, module: Module) => void;
  enrollmentStatus?: 'not_enrolled' | 'enrolled' | 'completed';
}

export const CourseSyllabus: React.FC<CourseSyllabusProps> = ({
  modules,
  interactive = true,
  showProgress = false,
  onLessonClick,
  onPreviewClick,
  enrollmentStatus = 'not_enrolled'
}) => {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(modules.slice(0, 1).map(m => m.id)) // Expand first module by default
  );

  const toggleModule = (moduleId: string) => {
    if (!interactive) return;
    
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="w-4 h-4" />;
      case 'text':
        return <FileText className="w-4 h-4" />;
      case 'quiz':
        return <HelpCircle className="w-4 h-4" />;
      case 'assignment':
        return <Award className="w-4 h-4" />;
      case 'interactive':
        return <div className="w-4 h-4 bg-blue-500 rounded" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'text-red-600';
      case 'text':
        return 'text-blue-600';
      case 'quiz':
        return 'text-yellow-600';
      case 'assignment':
        return 'text-green-600';
      case 'interactive':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const calculateModuleProgress = (module: Module) => {
    if (!showProgress) return 0;
    const completedLessons = module.lessons.filter(lesson => lesson.completed).length;
    return module.lessons.length > 0 ? (completedLessons / module.lessons.length) * 100 : 0;
  };

  const calculateTotalProgress = () => {
    if (!showProgress) return 0;
    const totalLessons = modules.reduce((total, module) => total + module.lessons.length, 0);
    const completedLessons = modules.reduce((total, module) => 
      total + module.lessons.filter(lesson => lesson.completed).length, 0
    );
    return totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  };

  const totalDuration = modules.reduce((total, module) => total + module.estimatedDuration, 0);
  const totalLessons = modules.reduce((total, module) => total + module.lessons.length, 0);

  return (
    <div className="space-y-6">
      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{modules.length}</div>
          <div className="text-sm text-gray-600">Modules</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{totalLessons}</div>
          <div className="text-sm text-gray-600">Lessons</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{Math.round(totalDuration)}h</div>
          <div className="text-sm text-gray-600">Total Duration</div>
        </div>
      </div>

      {/* Overall Progress */}
      {showProgress && (
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Your Progress</h3>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(calculateTotalProgress())}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${calculateTotalProgress()}%` }}
            />
          </div>
        </div>
      )}

      {/* Modules */}
      <div className="space-y-4">
        {modules
          .sort((a, b) => a.order - b.order)
          .map((module, moduleIndex) => {
            const isExpanded = expandedModules.has(module.id);
            const moduleProgress = calculateModuleProgress(module);
            
            return (
              <div
                key={module.id}
                className={cn(
                  'border rounded-lg overflow-hidden transition-shadow',
                  module.locked ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200 hover:shadow-md'
                )}
              >
                {/* Module Header */}
                <button
                  onClick={() => toggleModule(module.id)}
                  disabled={!interactive || module.locked}
                  className={cn(
                    'w-full px-6 py-4 text-left transition-colors',
                    interactive && !module.locked ? 'hover:bg-gray-50' : '',
                    module.locked ? 'cursor-not-allowed' : 'cursor-pointer'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                          module.locked 
                            ? 'bg-gray-200 text-gray-400'
                            : showProgress && moduleProgress === 100
                            ? 'bg-green-500 text-white'
                            : 'bg-blue-500 text-white'
                        )}>
                          {module.locked ? (
                            <Lock className="w-4 h-4" />
                          ) : (
                            moduleIndex + 1
                          )}
                        </div>
                        <h3 className={cn(
                          'text-lg font-semibold',
                          module.locked ? 'text-gray-400' : 'text-gray-900'
                        )}>
                          {module.title}
                        </h3>
                        {module.locked && (
                          <span className="px-2 py-1 bg-gray-200 text-gray-500 text-xs rounded-full">
                            Locked
                          </span>
                        )}
                      </div>
                      
                      <p className={cn(
                        'text-sm mb-3',
                        module.locked ? 'text-gray-400' : 'text-gray-600'
                      )}>
                        {module.description}
                      </p>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{Math.round(module.estimatedDuration * 60)} minutes</span>
                        </div>
                        <span>{module.lessons.length} lessons</span>
                        {showProgress && (
                          <span className="font-medium">
                            {Math.round(moduleProgress)}% complete
                          </span>
                        )}
                      </div>

                      {/* Module Progress Bar */}
                      {showProgress && !module.locked && (
                        <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
                          <div
                            className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${moduleProgress}%` }}
                          />
                        </div>
                      )}

                      {/* Prerequisite Warning */}
                      {module.prerequisite && (
                        <div className="mt-2 text-xs text-amber-600">
                          <span className="font-medium">Prerequisite:</span> {module.prerequisite}
                        </div>
                      )}
                    </div>
                    
                    {interactive && !module.locked && (
                      <div className={cn(
                        'transform transition-transform',
                        isExpanded ? 'rotate-90' : ''
                      )}>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                </button>

                {/* Module Content */}
                {isExpanded && !module.locked && (
                  <div className="border-t bg-gray-50">
                    <div className="space-y-0">
                      {module.lessons
                        .sort((a, b) => a.order - b.order)
                        .map((lesson, lessonIndex) => (
                          <LessonRow
                            key={lesson.id}
                            lesson={lesson}
                            module={module}
                            index={lessonIndex}
                            enrollmentStatus={enrollmentStatus}
                            onLessonClick={onLessonClick}
                            onPreviewClick={onPreviewClick}
                            getContentTypeIcon={getContentTypeIcon}
                            getContentTypeColor={getContentTypeColor}
                          />
                        ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Enrollment CTA */}
      {enrollmentStatus === 'not_enrolled' && (
        <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-lg p-6 text-white text-center">
          <h3 className="text-xl font-semibold mb-2">Ready to Start Your Learning Journey?</h3>
          <p className="mb-4 opacity-90">
            Enroll now to unlock all {totalLessons} lessons and {Math.round(totalDuration)} hours of content
          </p>
          <button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors">
            Enroll Now
          </button>
        </div>
      )}
    </div>
  );
};

interface LessonRowProps {
  lesson: Lesson;
  module: Module;
  index: number;
  enrollmentStatus: string;
  onLessonClick?: (lesson: Lesson, module: Module) => void;
  onPreviewClick?: (lesson: Lesson, module: Module) => void;
  getContentTypeIcon: (type: string) => React.ReactNode;
  getContentTypeColor: (type: string) => string;
}

const LessonRow: React.FC<LessonRowProps> = ({
  lesson,
  module,
  index,
  enrollmentStatus,
  onLessonClick,
  onPreviewClick,
  getContentTypeIcon,
  getContentTypeColor
}) => {
  const canAccess = enrollmentStatus !== 'not_enrolled' && !lesson.locked;
  const hasPreview = lesson.previewAvailable;

  const handleClick = () => {
    if (canAccess && onLessonClick) {
      onLessonClick(lesson, module);
    }
  };

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasPreview && onPreviewClick) {
      onPreviewClick(lesson, module);
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-4 px-6 py-4 border-b border-gray-200 last:border-b-0 transition-colors',
        canAccess ? 'hover:bg-white cursor-pointer' : 'cursor-default'
      )}
      onClick={handleClick}
    >
      {/* Lesson Number */}
      <div className={cn(
        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
        lesson.completed
          ? 'bg-green-500 text-white'
          : lesson.locked
          ? 'bg-gray-200 text-gray-400'
          : 'bg-gray-300 text-gray-600'
      )}>
        {lesson.completed ? '✓' : lesson.locked ? <Lock className="w-3 h-3" /> : index + 1}
      </div>

      {/* Content Type Icon */}
      <div className={cn(
        'flex-shrink-0',
        lesson.locked ? 'text-gray-400' : getContentTypeColor(lesson.contentType)
      )}>
        {getContentTypeIcon(lesson.contentType)}
      </div>

      {/* Lesson Info */}
      <div className="flex-1 min-w-0">
        <h4 className={cn(
          'font-medium truncate',
          lesson.locked ? 'text-gray-400' : 'text-gray-900'
        )}>
          {lesson.title}
        </h4>
        
        {lesson.description && (
          <p className={cn(
            'text-sm mt-1 line-clamp-2',
            lesson.locked ? 'text-gray-400' : 'text-gray-600'
          )}>
            {lesson.description}
          </p>
        )}
        
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{Math.ceil(lesson.duration)} min</span>
          </div>
          <span className="capitalize">{lesson.contentType}</span>
          {lesson.completed && (
            <span className="text-green-600 font-medium">Completed</span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {hasPreview && (
          <button
            onClick={handlePreviewClick}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
          >
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              Preview
            </div>
          </button>
        )}
        
        {lesson.locked && (
          <div className="px-3 py-1 text-xs bg-gray-100 text-gray-500 rounded-full">
            <div className="flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Locked
            </div>
          </div>
        )}
      </div>
    </div>
  );
};