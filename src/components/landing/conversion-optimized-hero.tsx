'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayIcon, StarIcon, CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { useABTest } from '@/components/providers/ab-test-provider';
import Image from 'next/image';

interface ConversionOptimizedHeroProps {
  variant: string;
  persona: string;
}

export function ConversionOptimizedHero({ variant, persona }: ConversionOptimizedHeroProps) {
  const { getVariantConfig, trackEvent, trackConversion } = useABTest();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const heroHeadline = getVariantConfig('heroHeadline', 'Transform Your Career with MADFAM Academy');
  const heroSubtitle = getVariantConfig('heroSubtitle', 'Join over 2 million students learning in-demand skills');
  const ctaText = getVariantConfig('ctaText', 'Start Learning Today');
  const ctaColor = getVariantConfig('ctaColor', 'primary');

  // Persona-specific content
  const personaContent = {
    learner: {
      badge: 'New to Tech? Start Here!',
      socialProof: '2M+ Students Enrolled',
      guarantee: '30-Day Money-Back Guarantee',
      features: ['Beginner-Friendly', 'Step-by-Step Guidance', 'Career Support']
    },
    professional: {
      badge: 'Advance Your Career',
      socialProof: '500K+ Professionals Upskilled',
      guarantee: 'Skills Guarantee Program',
      features: ['Industry Experts', 'Real Projects', 'Certification']
    },
    entrepreneur: {
      badge: 'Build Your Business',
      socialProof: '100K+ Entrepreneurs Trained',
      guarantee: 'Revenue Growth Guarantee',
      features: ['Business Skills', 'Marketing Mastery', 'Growth Strategies']
    }
  };

  const currentPersona = personaContent[persona as keyof typeof personaContent] || personaContent.learner;

  const handleCTAClick = () => {
    trackEvent('hero_cta_click', { 
      variant, 
      persona, 
      cta_text: ctaText 
    });
    trackConversion('hero_cta', 1);
  };

  const handleVideoPlay = () => {
    trackEvent('hero_video_play', { variant, persona });
    setIsVideoModalOpen(true);
  };

  const ctaVariants = {
    primary: 'bg-primary hover:bg-primary/90',
    success: 'bg-green-600 hover:bg-green-700',
    magic: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('/landing/hero-pattern.svg')] opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-20 w-16 h-16 bg-pink-500/20 rounded-full blur-xl animate-pulse delay-500"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content Side */}
          <div className="text-center lg:text-left space-y-8">
            {/* Badge */}
            <Badge variant="secondary" className="text-sm font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
              {currentPersona.badge}
            </Badge>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                {heroHeadline}
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
                {heroSubtitle}
              </p>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center lg:items-start gap-6">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 border-2 border-white"></div>
                  ))}
                </div>
                <span className="text-sm text-gray-300 font-medium">{currentPersona.socialProof}</span>
              </div>
              
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
                <span className="text-sm text-gray-300 ml-2">4.9/5 (50K+ reviews)</span>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {currentPersona.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-sm text-white font-medium">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className={`${ctaVariants[ctaColor as keyof typeof ctaVariants]} text-white font-semibold px-8 py-4 text-lg rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300`}
                onClick={handleCTAClick}
              >
                {ctaText}
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg rounded-xl"
                onClick={handleVideoPlay}
              >
                <PlayIcon className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Guarantee */}
            <div className="flex items-center justify-center lg:justify-start gap-2 text-sm text-gray-300">
              <CheckCircleIcon className="w-4 h-4 text-green-400" />
              <span>{currentPersona.guarantee}</span>
            </div>
          </div>

          {/* Visual Side */}
          <div className="relative">
            {/* Main Hero Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/landing/hero-dashboard.png"
                alt="MADFAM Academy Dashboard"
                width={600}
                height={400}
                className="w-full h-auto"
                priority
              />
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={handleVideoPlay}
                  className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-xl hover:bg-white transition-colors duration-300 hover:scale-110 transform"
                >
                  <PlayIcon className="w-10 h-10 text-primary ml-1" />
                </button>
              </div>

              {/* Floating Stats */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl p-4 shadow-xl">
                <div className="text-2xl font-bold text-primary">2M+</div>
                <div className="text-sm text-gray-600">Students</div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-4 shadow-xl">
                <div className="text-2xl font-bold text-green-600">95%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>

            {/* Floating Course Cards */}
            <div className="absolute -top-8 -left-8 bg-white rounded-lg p-3 shadow-lg transform rotate-12 hover:rotate-6 transition-transform duration-300">
              <div className="w-16 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded"></div>
              <div className="text-xs font-medium mt-2">Web Dev</div>
            </div>

            <div className="absolute -bottom-8 right-8 bg-white rounded-lg p-3 shadow-lg transform -rotate-12 hover:-rotate-6 transition-transform duration-300">
              <div className="w-16 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded"></div>
              <div className="text-xs font-medium mt-2">Data Science</div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">MADFAM Academy Demo</h3>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="aspect-video">
              <iframe
                src="https://www.youtube.com/embed/demo-video"
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}