'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useABTest } from '@/components/providers/ab-test-provider';
import { 
  CheckCircleIcon, 
  XMarkIcon,
  StarIcon,
  ClockIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/solid';

interface PricingCTAProps {
  variant: string;
}

export function PricingCTA({ variant }: PricingCTAProps) {
  const { getVariantConfig, trackEvent, trackConversion } = useABTest();
  const [selectedPlan, setSelectedPlan] = useState('bootcamp');

  const priceDisplay = getVariantConfig('priceDisplay', 'strikethrough');
  const ctaText = getVariantConfig('ctaText', 'Start Learning Today');
  const ctaColor = getVariantConfig('ctaColor', 'primary');

  // Pricing plans with different configurations
  const pricingPlans = {
    starter: {
      name: 'Course Library',
      description: 'Access to all courses and community',
      originalPrice: 199,
      currentPrice: 99,
      savings: 100,
      duration: 'monthly',
      popular: false,
      features: [
        'Access to 500+ courses',
        'Community forum access',
        'Mobile app access',
        'Course completion certificates',
        'Email support'
      ],
      notIncluded: [
        'Live mentoring sessions',
        'Career coaching',
        'Interview preparation',
        'Job placement assistance'
      ]
    },
    bootcamp: {
      name: 'Career Bootcamp',
      description: 'Complete career transformation program',
      originalPrice: 2999,
      currentPrice: 1499,
      savings: 1500,
      duration: '12-week program',
      popular: true,
      features: [
        'Everything in Course Library',
        'Live instructor-led classes',
        'Personal career coach',
        'Real-world project portfolio',
        'Interview preparation',
        'Job placement assistance',
        'Alumni network access',
        'Lifetime course updates',
        '1-on-1 mentoring sessions',
        'Industry certification prep'
      ],
      notIncluded: []
    },
    premium: {
      name: 'Executive Program',
      description: 'Premium mentorship and leadership track',
      originalPrice: 4999,
      currentPrice: 2999,
      savings: 2000,
      duration: '6-month program',
      popular: false,
      features: [
        'Everything in Career Bootcamp',
        'Executive mentorship',
        'Leadership skill development',
        'Business strategy training',
        'Startup incubator access',
        'Investment network intro',
        'Personal branding coaching',
        'Public speaking training',
        'Industry conference tickets',
        'Lifetime premium support'
      ],
      notIncluded: []
    }
  };

  const selectedPlanData = pricingPlans[selectedPlan as keyof typeof pricingPlans];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    trackEvent('pricing_plan_select', { plan: planId, variant });
  };

  const handleCTAClick = () => {
    trackEvent('pricing_cta_click', { 
      plan: selectedPlan, 
      variant, 
      price: selectedPlanData.currentPrice 
    });
    trackConversion('pricing_cta', selectedPlanData.currentPrice);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  const calculateSavingsPercentage = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100);
  };

  const renderPriceDisplay = () => {
    const { originalPrice, currentPrice, savings } = selectedPlanData;
    const savingsPercentage = calculateSavingsPercentage(originalPrice, currentPrice);

    switch (priceDisplay) {
      case 'highlight':
        return (
          <div className="text-center">
            <div className="text-5xl font-bold text-white mb-2">
              {formatPrice(currentPrice)}
            </div>
            <div className="text-xl text-green-300 font-semibold">
              Save {formatPrice(savings)} ({savingsPercentage}% off)
            </div>
            <div className="text-lg text-primary-200 line-through">
              Regular: {formatPrice(originalPrice)}
            </div>
          </div>
        );
      case 'percentage':
        return (
          <div className="text-center">
            <div className="text-6xl font-bold text-yellow-400 mb-2">
              {savingsPercentage}% OFF
            </div>
            <div className="text-3xl text-white font-bold mb-1">
              {formatPrice(currentPrice)}
            </div>
            <div className="text-lg text-primary-200 line-through">
              was {formatPrice(originalPrice)}
            </div>
          </div>
        );
      default: // strikethrough
        return (
          <div className="text-center">
            <div className="text-2xl text-primary-200 line-through mb-1">
              {formatPrice(originalPrice)}
            </div>
            <div className="text-5xl font-bold text-white mb-2">
              {formatPrice(currentPrice)}
            </div>
            <div className="text-xl text-green-300 font-semibold">
              Limited Time: {formatPrice(savings)} off!
            </div>
          </div>
        );
    }
  };

  const ctaVariants = {
    primary: 'bg-white text-primary hover:bg-gray-100',
    success: 'bg-green-500 text-white hover:bg-green-600',
    magic: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600'
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-purple-700 to-primary-800"></div>
      <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-green-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-yellow-400 text-yellow-900 font-bold">
            🔥 LIMITED TIME OFFER
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Choose Your Learning Path
          </h2>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto">
            Start your career transformation today with our proven programs
          </p>
        </div>

        {/* Plan Selection Tabs */}
        <div className="flex flex-col md:flex-row justify-center gap-4 mb-12">
          {Object.entries(pricingPlans).map(([planId, plan]) => (
            <button
              key={planId}
              onClick={() => handlePlanSelect(planId)}
              className={`relative px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                selectedPlan === planId
                  ? 'bg-white text-primary shadow-lg transform scale-105'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-yellow-400 text-yellow-900 font-bold">
                    <SparklesIcon className="w-3 h-3 mr-1" />
                    MOST POPULAR
                  </Badge>
                </div>
              )}
              <div className="text-lg font-bold">{plan.name}</div>
              <div className="text-sm opacity-80">{plan.description}</div>
            </button>
          ))}
        </div>

        {/* Main Pricing Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Pricing Info */}
              <div className="text-center lg:text-left">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  {selectedPlanData.name}
                </h3>
                <p className="text-lg text-primary-100 mb-6">
                  {selectedPlanData.description}
                </p>

                {/* Price Display */}
                <div className="mb-8">
                  {renderPriceDisplay()}
                  <div className="text-primary-200 mt-2">
                    {selectedPlanData.duration}
                  </div>
                </div>

                {/* Key Stats */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <UserGroupIcon className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                    <div className="text-lg font-bold text-white">2M+</div>
                    <div className="text-xs text-primary-200">Students</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <StarIcon className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                    <div className="text-lg font-bold text-white">4.9/5</div>
                    <div className="text-xs text-primary-200">Rating</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <ClockIcon className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <div className="text-lg font-bold text-white">95%</div>
                    <div className="text-xs text-primary-200">Job Rate</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <CurrencyDollarIcon className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <div className="text-lg font-bold text-white">$85K+</div>
                    <div className="text-xs text-primary-200">Avg Salary</div>
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  size="lg"
                  className={`w-full md:w-auto ${ctaVariants[ctaColor as keyof typeof ctaVariants]} px-12 py-6 text-xl font-bold rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300`}
                  onClick={handleCTAClick}
                >
                  {ctaText}
                  <ArrowRightIcon className="w-6 h-6 ml-3" />
                </Button>

                {/* Guarantee */}
                <div className="flex items-center justify-center lg:justify-start gap-2 mt-6 text-primary-100">
                  <ShieldCheckIcon className="w-5 h-5 text-green-400" />
                  <span className="text-sm">30-day money-back guarantee</span>
                </div>
              </div>

              {/* Features List */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h4 className="text-xl font-bold text-white mb-6 flex items-center">
                  <AcademicCapIcon className="w-6 h-6 mr-2 text-yellow-400" />
                  What's Included
                </h4>
                
                <div className="space-y-3">
                  {selectedPlanData.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-primary-100">{feature}</span>
                    </div>
                  ))}
                  
                  {selectedPlanData.notIncluded.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 opacity-50">
                      <XMarkIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <span className="text-primary-200 line-through">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Bonus Items */}
                <div className="mt-6 pt-6 border-t border-white/20">
                  <h5 className="font-semibold text-yellow-400 mb-3">🎁 Limited Time Bonuses:</h5>
                  <div className="space-y-2 text-sm text-primary-100">
                    <div>• Free industry certification exam voucher ($300 value)</div>
                    <div>• 1-year access to premium job board ($200 value)</div>
                    <div>• Personal LinkedIn profile optimization ($150 value)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional CTAs */}
        <div className="text-center mt-12">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              variant="outline"
              className="border-white/50 text-white hover:bg-white/10"
            >
              Schedule Free Consultation
            </Button>
            <Button
              variant="ghost"
              className="text-primary-100 hover:text-white"
            >
              View Full Curriculum
            </Button>
          </div>
          
          <div className="mt-6 text-center text-primary-200 text-sm">
            <p>Questions? Call us at (555) 123-4567 or chat with our team</p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center items-center gap-8 mt-12 opacity-70">
          <div className="text-white text-sm">🔒 SSL Secured</div>
          <div className="text-white text-sm">💳 Secure Payment</div>
          <div className="text-white text-sm">🛡️ Money-Back Guarantee</div>
          <div className="text-white text-sm">⭐ 4.9/5 Rating</div>
        </div>
      </div>
    </div>
  );
}