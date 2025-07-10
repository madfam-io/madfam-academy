'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useABTest } from '@/components/providers/ab-test-provider';
import { 
  StarIcon, 
  PlayIcon,
  ChevronLeftIcon, 
  ChevronRightIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/solid';
import Image from 'next/image';

interface FeaturedTestimonialsProps {
  persona: string;
}

export function FeaturedTestimonials({ persona }: FeaturedTestimonialsProps) {
  const { getVariantConfig, trackEvent, trackConversion } = useABTest();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string>('');

  const testimonialCount = getVariantConfig('testimonialCount', 3);

  // Comprehensive testimonials database
  const allTestimonials = [
    {
      id: 1,
      name: 'Sarah Chen',
      title: 'Full-Stack Developer at Google',
      image: '/testimonials/sarah-chen.jpg',
      video: 'https://www.youtube.com/embed/testimonial-sarah',
      rating: 5,
      course: 'Full-Stack Development Bootcamp',
      timeToJob: '3 months',
      salaryIncrease: '+150%',
      location: 'San Francisco, CA',
      previousRole: 'Marketing Coordinator',
      quote: "MADFAM Academy completely transformed my career. I went from marketing to landing my dream job at Google in just 3 months. The instructors were incredible and the curriculum was exactly what I needed.",
      longQuote: "I was stuck in a marketing role that I didn't love and always dreamed of becoming a developer. MADFAM Academy not only taught me the technical skills but also gave me the confidence to make the career change. The support system is amazing - from instructors to career coaches. Now I'm living my dream working at Google!",
      tags: ['Career Change', 'Big Tech', 'Remote Work'],
      persona: 'learner'
    },
    {
      id: 2,
      name: 'Marcus Johnson',
      title: 'Senior DevOps Engineer at Microsoft',
      image: '/testimonials/marcus-johnson.jpg',
      video: 'https://www.youtube.com/embed/testimonial-marcus',
      rating: 5,
      course: 'Cloud & DevOps Mastery',
      timeToJob: '2 months',
      salaryIncrease: '+85%',
      location: 'Seattle, WA',
      previousRole: 'System Administrator',
      quote: "The cloud skills I learned at MADFAM Academy got me promoted twice in one year. The hands-on projects were exactly what employers were looking for.",
      longQuote: "As a system admin, I knew I needed to upskill in cloud technologies to stay relevant. MADFAM Academy's DevOps program was intense but incredibly practical. Every project was something I could immediately apply at work. Within 2 months of graduating, I got promoted to Senior DevOps Engineer with a massive salary bump.",
      tags: ['Promotion', 'Cloud Skills', 'Salary Growth'],
      persona: 'professional'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      title: 'Data Science Lead at Spotify',
      image: '/testimonials/emily-rodriguez.jpg',
      video: 'https://www.youtube.com/embed/testimonial-emily',
      rating: 5,
      course: 'Data Science & AI Program',
      timeToJob: '4 months',
      salaryIncrease: '+200%',
      location: 'New York, NY',
      previousRole: 'Business Analyst',
      quote: "From business analyst to leading data science initiatives at Spotify - MADFAM Academy made it possible. The AI curriculum is cutting-edge and industry-relevant.",
      longQuote: "I always loved working with data but felt limited in my business analyst role. MADFAM Academy's Data Science program opened up a whole new world for me. The machine learning projects were challenging but the instructors made complex concepts easy to understand. Now I lead AI initiatives at Spotify!",
      tags: ['Data Science', 'AI/ML', 'Leadership'],
      persona: 'professional'
    },
    {
      id: 4,
      name: 'David Kim',
      title: 'Freelance Web Developer',
      image: '/testimonials/david-kim.jpg',
      video: 'https://www.youtube.com/embed/testimonial-david',
      rating: 5,
      course: 'React & Node.js Bootcamp',
      timeToJob: '1 month',
      salaryIncrease: '+300%',
      location: 'Austin, TX',
      previousRole: 'Retail Manager',
      quote: "I built my first client project before even finishing the course. Now I run a successful freelance business making 3x what I made in retail.",
      longQuote: "After 10 years in retail management, I was burned out and needed a change. MADFAM Academy's practical approach meant I was building real projects from day one. I started freelancing while still in the program and landed my first $5K client project. Now I'm running a 6-figure freelance business!",
      tags: ['Freelancing', 'Entrepreneurship', 'Quick Start'],
      persona: 'entrepreneur'
    },
    {
      id: 5,
      name: 'Aisha Patel',
      title: 'Product Manager at Tesla',
      image: '/testimonials/aisha-patel.jpg',
      video: 'https://www.youtube.com/embed/testimonial-aisha',
      rating: 5,
      course: 'Tech Product Management',
      timeToJob: '6 weeks',
      salaryIncrease: '+120%',
      location: 'Palo Alto, CA',
      previousRole: 'Project Coordinator',
      quote: "The product management skills I learned helped me transition from coordination to strategy. Tesla hired me as a PM straight out of the program.",
      longQuote: "I was doing project coordination but wanted to move into product strategy. MADFAM Academy's PM program taught me everything from user research to technical communication. The mock interviews and portfolio reviews were invaluable. Tesla was impressed with my project portfolio and hired me immediately!",
      tags: ['Product Management', 'Strategy', 'Portfolio'],
      persona: 'professional'
    },
    {
      id: 6,
      name: 'James Wilson',
      title: 'Cybersecurity Specialist at AWS',
      image: '/testimonials/james-wilson.jpg',
      video: 'https://www.youtube.com/embed/testimonial-james',
      rating: 5,
      course: 'Cybersecurity Bootcamp',
      timeToJob: '5 months',
      salaryIncrease: '+180%',
      location: 'Arlington, VA',
      previousRole: 'IT Support',
      quote: "From fixing computers to protecting cloud infrastructure at AWS. MADFAM Academy's cybersecurity program is world-class.",
      longQuote: "I was in IT support and saw how important cybersecurity was becoming. MADFAM Academy's cybersecurity program covered everything from ethical hacking to compliance. The hands-on labs with real-world scenarios prepared me perfectly for the AWS interview process. Now I'm protecting critical infrastructure!",
      tags: ['Cybersecurity', 'Cloud Security', 'Ethical Hacking'],
      persona: 'professional'
    }
  ];

  // Filter testimonials based on persona and count
  const getFilteredTestimonials = () => {
    let filtered = allTestimonials;
    
    // Filter by persona preference
    if (persona === 'entrepreneur') {
      filtered = allTestimonials.filter(t => 
        t.persona === 'entrepreneur' || t.tags.includes('Freelancing') || t.tags.includes('Entrepreneurship')
      );
    } else if (persona === 'professional') {
      filtered = allTestimonials.filter(t => 
        t.persona === 'professional' || t.tags.includes('Promotion') || t.tags.includes('Leadership')
      );
    }
    
    return filtered.slice(0, testimonialCount);
  };

  const testimonials = getFilteredTestimonials();

  useEffect(() => {
    // Auto-advance testimonials
    if (testimonials.length > 1) {
      const interval = setInterval(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
      }, 8000);
      
      return () => clearInterval(interval);
    }
  }, [testimonials.length]);

  const handlePrevious = () => {
    setCurrentTestimonial((prev) => 
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
    trackEvent('testimonial_navigation', { direction: 'previous', testimonial_id: testimonials[currentTestimonial].id });
  };

  const handleNext = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    trackEvent('testimonial_navigation', { direction: 'next', testimonial_id: testimonials[currentTestimonial].id });
  };

  const handleVideoPlay = (videoUrl: string, testimonialId: number) => {
    setSelectedVideo(videoUrl);
    setIsVideoModalOpen(true);
    trackEvent('testimonial_video_play', { testimonial_id: testimonialId });
  };

  const handleCTAClick = () => {
    trackEvent('testimonial_cta_click', { testimonial_id: testimonials[currentTestimonial].id });
    trackConversion('testimonial_cta', 1);
  };

  const currentTestimonialData = testimonials[currentTestimonial];

  if (!currentTestimonialData) return null;

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <Badge variant="secondary" className="mb-4 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
          Success Stories
        </Badge>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
          Real Students, Real Results
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Join thousands of successful graduates who transformed their careers with MADFAM Academy
        </p>
      </div>

      {/* Main Testimonial */}
      <div className="max-w-6xl mx-auto mb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Testimonial Content */}
          <div className="order-2 lg:order-1">
            <div className="bg-card rounded-2xl p-8 border border-border shadow-lg">
              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                {[...Array(currentTestimonialData.rating)].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
                <span className="text-sm text-muted-foreground ml-2">
                  {currentTestimonialData.rating}/5 Rating
                </span>
              </div>

              {/* Quote */}
              <blockquote className="text-lg md:text-xl text-foreground mb-6 leading-relaxed italic">
                "{currentTestimonialData.longQuote}"
              </blockquote>

              {/* Author Info */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <Image
                    src={currentTestimonialData.image}
                    alt={currentTestimonialData.name}
                    width={60}
                    height={60}
                    className="rounded-full"
                  />
                  <button
                    onClick={() => handleVideoPlay(currentTestimonialData.video, currentTestimonialData.id)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300"
                  >
                    <PlayIcon className="w-6 h-6 text-white" />
                  </button>
                </div>
                <div>
                  <div className="font-bold text-foreground">{currentTestimonialData.name}</div>
                  <div className="text-sm text-primary font-medium">{currentTestimonialData.title}</div>
                  <div className="text-xs text-muted-foreground">{currentTestimonialData.location}</div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {currentTestimonialData.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Course Info */}
              <div className="border-t border-border pt-6">
                <div className="text-sm text-muted-foreground mb-2">Completed Course:</div>
                <div className="font-medium text-foreground">{currentTestimonialData.course}</div>
              </div>
            </div>
          </div>

          {/* Success Metrics */}
          <div className="order-1 lg:order-2">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 text-center border border-green-200 dark:border-green-800">
                <CalendarDaysIcon className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-green-700 dark:text-green-400 mb-1">
                  {currentTestimonialData.timeToJob}
                </div>
                <div className="text-sm text-green-600 dark:text-green-300">To New Job</div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-6 text-center border border-blue-200 dark:border-blue-800">
                <CurrencyDollarIcon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-1">
                  {currentTestimonialData.salaryIncrease}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-300">Salary Increase</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-6 text-center border border-purple-200 dark:border-purple-800">
                <BriefcaseIcon className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <div className="text-sm font-medium text-purple-700 dark:text-purple-400 mb-1">Previous Role</div>
                <div className="text-xs text-purple-600 dark:text-purple-300">{currentTestimonialData.previousRole}</div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl p-6 text-center border border-orange-200 dark:border-orange-800">
                <AcademicCapIcon className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                <div className="text-sm font-medium text-orange-700 dark:text-orange-400 mb-1">Current Role</div>
                <div className="text-xs text-orange-600 dark:text-orange-300">{currentTestimonialData.title}</div>
              </div>
            </div>

            {/* Video Testimonial CTA */}
            <div className="mt-6 bg-gradient-to-r from-primary/10 to-purple-600/10 rounded-2xl p-6 text-center">
              <h4 className="font-bold text-foreground mb-2">Watch {currentTestimonialData.name}'s Story</h4>
              <p className="text-sm text-muted-foreground mb-4">
                See how they transformed their career in just {currentTestimonialData.timeToJob}
              </p>
              <Button
                onClick={() => handleVideoPlay(currentTestimonialData.video, currentTestimonialData.id)}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <PlayIcon className="w-4 h-4 mr-2" />
                Watch Video
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      {testimonials.length > 1 && (
        <div className="flex items-center justify-center gap-6 mb-12">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            className="w-10 h-10 rounded-full p-0"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </Button>

          <div className="flex gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  index === currentTestimonial ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            className="w-10 h-10 rounded-full p-0"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* CTA Section */}
      <div className="text-center bg-gradient-to-r from-primary/10 to-purple-600/10 rounded-3xl p-12">
        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
          Ready to Write Your Success Story?
        </h3>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join {currentTestimonialData.name} and thousands of other successful graduates who transformed their careers
        </p>
        <Button 
          size="lg" 
          className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg rounded-xl"
          onClick={handleCTAClick}
        >
          Start Your Transformation Today
        </Button>
      </div>

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="text-lg font-semibold">{currentTestimonialData.name}'s Success Story</h3>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="aspect-video">
              <iframe
                src={selectedVideo}
                className="w-full h-full"
                allowFullScreen
                title="Student testimonial video"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}