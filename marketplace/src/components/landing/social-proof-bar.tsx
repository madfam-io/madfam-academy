'use client';

import { useState, useEffect } from 'react';
import { useABTest } from '@/components/providers/ab-test-provider';
import Image from 'next/image';
import { StarIcon, UserGroupIcon, AcademicCapIcon, BriefcaseIcon } from '@heroicons/react/24/solid';

export function SocialProofBar() {
  const { getVariantConfig, trackEvent } = useABTest();
  const [currentMetric, setCurrentMetric] = useState(0);
  
  const socialProofStyle = getVariantConfig('socialProofStyle', 'numbers');

  // Real-time metrics (simulated)
  const metrics = [
    { icon: UserGroupIcon, value: '2,847,329', label: 'Students Enrolled', increment: 1 },
    { icon: AcademicCapIcon, value: '485,672', label: 'Certificates Earned', increment: 2 },
    { icon: BriefcaseIcon, value: '127,394', label: 'Career Changes', increment: 1 },
    { icon: StarIcon, value: '4.9/5', label: 'Average Rating', increment: 0 }
  ];

  const companyLogos = [
    { name: 'Google', logo: '/logos/google.svg' },
    { name: 'Microsoft', logo: '/logos/microsoft.svg' },
    { name: 'Amazon', logo: '/logos/amazon.svg' },
    { name: 'Apple', logo: '/logos/apple.svg' },
    { name: 'Meta', logo: '/logos/meta.svg' },
    { name: 'Netflix', logo: '/logos/netflix.svg' },
    { name: 'Tesla', logo: '/logos/tesla.svg' },
    { name: 'Spotify', logo: '/logos/spotify.svg' }
  ];

  const achievements = [
    { text: 'Featured in TechCrunch', icon: '📰' },
    { text: 'Best Online Platform 2024', icon: '🏆' },
    { text: '95% Job Placement Rate', icon: '💼' },
    { text: 'Industry Partner Network', icon: '🤝' }
  ];

  useEffect(() => {
    // Cycle through metrics every 3 seconds
    const interval = setInterval(() => {
      setCurrentMetric((prev) => (prev + 1) % metrics.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Track social proof visibility
    trackEvent('social_proof_view', { 
      style: socialProofStyle,
      current_metric: metrics[currentMetric].label 
    });
  }, [currentMetric, socialProofStyle]);

  const renderNumbersStyle = () => (
    <div className="flex items-center justify-center space-x-8 md:space-x-12">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        const isActive = index === currentMetric;
        
        return (
          <div 
            key={index}
            className={`flex flex-col items-center transition-all duration-500 ${
              isActive ? 'scale-110 text-white' : 'scale-100 text-primary-200'
            }`}
          >
            <Icon className={`w-6 h-6 mb-2 ${isActive ? 'text-yellow-400' : 'text-current'}`} />
            <div className={`text-2xl md:text-3xl font-bold ${isActive ? 'text-white' : 'text-current'}`}>
              {metric.value}
            </div>
            <div className={`text-sm md:text-base ${isActive ? 'text-primary-100' : 'text-current'}`}>
              {metric.label}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderLogosStyle = () => (
    <div className="space-y-4">
      <div className="text-center text-primary-100 text-sm md:text-base font-medium">
        Our graduates work at top companies worldwide
      </div>
      <div className="flex items-center justify-center space-x-6 md:space-x-8 overflow-x-auto">
        {companyLogos.map((company, index) => (
          <div 
            key={index}
            className="flex-shrink-0 grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
          >
            <Image
              src={company.logo}
              alt={`${company.name} logo`}
              width={80}
              height={40}
              className="h-8 md:h-10 w-auto filter brightness-0 invert"
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderMixedStyle = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {achievements.map((achievement, index) => (
        <div 
          key={index}
          className="flex flex-col items-center text-center bg-white/10 rounded-lg p-3 md:p-4 backdrop-blur-sm hover:bg-white/20 transition-colors duration-300"
        >
          <div className="text-2xl mb-2">{achievement.icon}</div>
          <div className="text-sm md:text-base text-primary-100 font-medium">
            {achievement.text}
          </div>
        </div>
      ))}
    </div>
  );

  const renderContent = () => {
    switch (socialProofStyle) {
      case 'logos':
        return renderLogosStyle();
      case 'mixed':
        return renderMixedStyle();
      default:
        return renderNumbersStyle();
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 animate-gradient-x"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-6 md:py-8">
        {renderContent()}
      </div>

      {/* Live Activity Indicator */}
      <div className="absolute top-2 right-4 flex items-center space-x-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <span>Live Activity</span>
      </div>

      {/* Scrolling Ticker (for mobile) */}
      <div className="md:hidden absolute bottom-0 left-0 right-0 bg-primary-700/50 py-2 overflow-hidden">
        <div className="animate-scroll-left whitespace-nowrap">
          <span className="text-primary-100 text-sm">
            🎉 Sarah from NYC just enrolled in Web Development • 
            💼 Mike from LA got hired at Google • 
            ⭐ 4.9/5 rating from 50K+ students • 
            🚀 Join 2M+ successful learners today
          </span>
        </div>
      </div>

      {/* Additional Styles */}
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        
        @keyframes scroll-left {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        
        .animate-gradient-x {
          animation: gradient-x 15s ease infinite;
        }
        
        .animate-scroll-left {
          animation: scroll-left 30s linear infinite;
        }
      `}</style>
    </div>
  );
}