'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useABTest } from '@/components/providers/ab-test-provider';
import { 
  XMarkIcon, 
  GiftIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  UserIcon,
  PhoneIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  ArrowRightIcon
} from '@heroicons/react/24/solid';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  experience: string;
  goals: string[];
  source: string;
}

export function LeadCaptureModal() {
  const { trackEvent, trackConversion } = useABTest();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    experience: '',
    goals: [],
    source: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal trigger logic
  useEffect(() => {
    const triggers = {
      timeDelay: () => {
        setTimeout(() => {
          if (!localStorage.getItem('lead_capture_shown')) {
            setIsOpen(true);
            trackEvent('lead_capture_trigger', { trigger_type: 'time_delay' });
          }
        }, 30000); // 30 seconds
      },
      
      exitIntent: () => {
        const handleMouseLeave = (e: MouseEvent) => {
          if (e.clientY <= 0 && !localStorage.getItem('lead_capture_shown')) {
            setIsOpen(true);
            trackEvent('lead_capture_trigger', { trigger_type: 'exit_intent' });
          }
        };
        
        document.addEventListener('mouseleave', handleMouseLeave);
        return () => document.removeEventListener('mouseleave', handleMouseLeave);
      },
      
      scrollDepth: () => {
        const handleScroll = () => {
          const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
          if (scrollPercent > 70 && !localStorage.getItem('lead_capture_shown')) {
            setIsOpen(true);
            trackEvent('lead_capture_trigger', { trigger_type: 'scroll_depth', scroll_percent: scrollPercent });
          }
        };
        
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
      }
    };

    const cleanupFunctions = [
      triggers.timeDelay(),
      triggers.exitIntent(),
      triggers.scrollDepth()
    ].filter(Boolean);

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup && cleanup());
    };
  }, []);

  const experienceLevels = [
    { id: 'beginner', label: 'Complete Beginner', description: 'New to tech' },
    { id: 'some', label: 'Some Experience', description: '1-2 years' },
    { id: 'intermediate', label: 'Intermediate', description: '3-5 years' },
    { id: 'advanced', label: 'Advanced', description: '5+ years' }
  ];

  const careerGoals = [
    { id: 'career_change', label: 'Career Change', icon: BriefcaseIcon },
    { id: 'skill_upgrade', label: 'Skill Upgrade', icon: AcademicCapIcon },
    { id: 'promotion', label: 'Get Promoted', icon: StarIcon },
    { id: 'freelance', label: 'Start Freelancing', icon: UserIcon },
    { id: 'salary_increase', label: 'Increase Salary', icon: GiftIcon },
    { id: 'start_business', label: 'Start Business', icon: BriefcaseIcon }
  ];

  const trafficSources = [
    { id: 'google', label: 'Google Search' },
    { id: 'social', label: 'Social Media' },
    { id: 'referral', label: 'Friend Referral' },
    { id: 'youtube', label: 'YouTube' },
    { id: 'podcast', label: 'Podcast' },
    { id: 'other', label: 'Other' }
  ];

  const benefits = [
    'Free career consultation (30 mins)',
    'Personalized learning roadmap',
    'Access to exclusive webinars',
    'Industry salary report',
    'Resume review checklist'
  ];

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('lead_capture_shown', 'true');
    trackEvent('lead_capture_close', { step: currentStep });
  };

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGoalToggle = (goalId: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter(g => g !== goalId)
        : [...prev.goals, goalId]
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
      trackEvent('lead_capture_step_advance', { from_step: currentStep, to_step: currentStep + 1 });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      trackEvent('lead_capture_submit', { 
        form_data: formData,
        completed_steps: 3
      });
      trackConversion('lead_capture', 1);
      
      // Store completion and close modal
      localStorage.setItem('lead_capture_completed', 'true');
      localStorage.setItem('lead_capture_shown', 'true');
      setIsOpen(false);
      
      // Show success message (you might want to replace this with a toast notification)
      alert('Thank you! Check your email for your free resources.');
      
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.firstName && formData.lastName && formData.email;
      case 2:
        return formData.experience && formData.goals.length > 0;
      case 3:
        return formData.source;
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scale-up">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-primary-600 to-purple-600 px-6 py-8 text-white text-center">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
          
          <GiftIcon className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Get Your FREE Career Transformation Kit
          </h2>
          <p className="text-primary-100 text-lg">
            Join 50,000+ students who landed their dream jobs
          </p>
          
          {/* Benefits */}
          <div className="mt-6 text-left">
            <div className="text-sm font-semibold mb-3 text-center">What You'll Get (Worth $500):</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-300 flex-shrink-0" />
                  <span className="text-primary-100">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Step {currentStep} of 3</span>
            <span>{Math.round((currentStep / 3) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-6 py-6 max-h-96 overflow-y-auto">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-foreground mb-2">Let's Get Started</h3>
                <p className="text-muted-foreground">Tell us a bit about yourself</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <UserIcon className="w-4 h-4 inline mr-1" />
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <EnvelopeIcon className="w-4 h-4 inline mr-1" />
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="john@example.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <PhoneIcon className="w-4 h-4 inline mr-1" />
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          )}

          {/* Step 2: Experience & Goals */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-foreground mb-2">Your Background</h3>
                <p className="text-muted-foreground">Help us personalize your experience</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-4">
                  What's your current experience level? *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {experienceLevels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => handleInputChange('experience', level.id)}
                      className={`p-4 border rounded-lg text-left transition-all duration-200 ${
                        formData.experience === level.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="font-medium">{level.label}</div>
                      <div className="text-sm text-muted-foreground">{level.description}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-4">
                  What are your career goals? (Select all that apply) *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {careerGoals.map((goal) => {
                    const Icon = goal.icon;
                    const isSelected = formData.goals.includes(goal.id);
                    return (
                      <button
                        key={goal.id}
                        onClick={() => handleGoalToggle(goal.id)}
                        className={`p-3 border rounded-lg text-left transition-all duration-200 ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span className="font-medium text-sm">{goal.label}</span>
                          {isSelected && <CheckCircleIcon className="w-4 h-4 text-primary ml-auto" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Source & Confirmation */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-foreground mb-2">Almost Done!</h3>
                <p className="text-muted-foreground">How did you hear about us?</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-4">
                  How did you find MADFAM Academy? *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {trafficSources.map((source) => (
                    <button
                      key={source.id}
                      onClick={() => handleInputChange('source', source.id)}
                      className={`p-3 border rounded-lg text-center transition-all duration-200 ${
                        formData.source === source.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="font-medium text-sm">{source.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Summary */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-3">Your Information:</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Name:</strong> {formData.firstName} {formData.lastName}</div>
                  <div><strong>Email:</strong> {formData.email}</div>
                  <div><strong>Experience:</strong> {experienceLevels.find(l => l.id === formData.experience)?.label}</div>
                  <div><strong>Goals:</strong> {formData.goals.map(g => careerGoals.find(cg => cg.id === g)?.label).join(', ')}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-border">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ClockIcon className="w-4 h-4" />
              <span>Takes less than 2 minutes</span>
            </div>
            
            <div className="flex gap-3">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  Back
                </Button>
              )}
              
              {currentStep < 3 ? (
                <Button
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="bg-primary hover:bg-primary/90"
                >
                  Continue
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepValid() || isSubmitting}
                  className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                >
                  {isSubmitting ? 'Sending...' : 'Get My Free Kit'}
                  {!isSubmitting && <GiftIcon className="w-4 h-4 ml-2" />}
                </Button>
              )}
            </div>
          </div>
          
          <div className="text-xs text-center text-muted-foreground mt-3">
            🔒 Your information is secure and will never be shared
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scale-up {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-scale-up {
          animation: scale-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}