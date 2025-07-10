'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface ABTest {
  id: string;
  name: string;
  variants: ABTestVariant[];
  currentVariant: string;
  isActive: boolean;
}

interface ABTestVariant {
  id: string;
  name: string;
  weight: number;
  config: Record<string, any>;
}

interface ABTestContextType {
  currentVariant: string;
  getVariantConfig: (key: string, defaultValue?: any) => any;
  trackConversion: (goalId: string, value?: number) => void;
  trackEvent: (eventName: string, properties?: Record<string, any>) => void;
}

const ABTestContext = createContext<ABTestContextType | undefined>(undefined);

export function useABTest() {
  const context = useContext(ABTestContext);
  if (!context) {
    throw new Error('useABTest must be used within an ABTestProvider');
  }
  return context;
}

interface ABTestProviderProps {
  children: React.ReactNode;
  variant?: string;
  testId?: string;
}

export function ABTestProvider({ children, variant = 'A', testId = 'landing-page-test' }: ABTestProviderProps) {
  const [currentVariant, setCurrentVariant] = useState(variant);
  const [variantConfig, setVariantConfig] = useState<Record<string, any>>({});

  // A/B Test configurations
  const testConfigs = {
    A: {
      heroHeadline: 'Transform Your Career with MADFAM Academy',
      heroSubtitle: 'Join over 2 million students learning in-demand skills from industry experts',
      ctaText: 'Start Learning Today',
      ctaColor: 'primary',
      testimonialCount: 3,
      urgencyText: 'Limited Time: 50% Off All Courses',
      priceDisplay: 'strikethrough',
      socialProofStyle: 'numbers',
    },
    B: {
      heroHeadline: 'Land Your Dream Job in 30 Days',
      heroSubtitle: 'Master high-paying skills with our proven system that launched 50,000+ careers',
      ctaText: 'Get Started Now - 50% Off',
      ctaColor: 'success',
      testimonialCount: 5,
      urgencyText: '⚡ Flash Sale: Only 24 Hours Left!',
      priceDisplay: 'highlight',
      socialProofStyle: 'logos',
    },
    C: {
      heroHeadline: 'The Fastest Way to Learn Tech Skills',
      heroSubtitle: 'Build job-ready skills in weeks, not years. Guarantee: Get hired or your money back',
      ctaText: 'Start My Transformation',
      ctaColor: 'magic',
      testimonialCount: 4,
      urgencyText: '🔥 Today Only: Save $500 on Career Bootcamps',
      priceDisplay: 'percentage',
      socialProofStyle: 'mixed',
    },
  };

  useEffect(() => {
    // Set variant configuration
    const config = testConfigs[currentVariant as keyof typeof testConfigs] || testConfigs.A;
    setVariantConfig(config);

    // Track variant assignment
    trackEvent('ab_test_variant_assigned', {
      testId,
      variant: currentVariant,
      timestamp: new Date().toISOString(),
    });

    // Store variant in localStorage for consistency
    localStorage.setItem(`ab_test_${testId}`, currentVariant);
  }, [currentVariant, testId]);

  useEffect(() => {
    // Check if user already has a variant assigned
    const storedVariant = localStorage.getItem(`ab_test_${testId}`);
    if (storedVariant && !variant) {
      setCurrentVariant(storedVariant);
    } else if (!storedVariant && !variant) {
      // Randomly assign variant if not specified
      const variants = ['A', 'B', 'C'];
      const weights = [0.4, 0.4, 0.2]; // 40% A, 40% B, 20% C
      const randomVariant = getWeightedRandomVariant(variants, weights);
      setCurrentVariant(randomVariant);
    }
  }, [testId, variant]);

  const getWeightedRandomVariant = (variants: string[], weights: number[]): string => {
    const random = Math.random();
    let cumulativeWeight = 0;
    
    for (let i = 0; i < variants.length; i++) {
      cumulativeWeight += weights[i];
      if (random <= cumulativeWeight) {
        return variants[i];
      }
    }
    
    return variants[0];
  };

  const getVariantConfig = (key: string, defaultValue: any = null) => {
    return variantConfig[key] ?? defaultValue;
  };

  const trackConversion = (goalId: string, value: number = 1) => {
    const conversionData = {
      testId,
      variant: currentVariant,
      goalId,
      value,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      userId: getUserId(),
    };

    // Send to analytics
    if (typeof window !== 'undefined') {
      // Google Analytics
      if (window.gtag) {
        window.gtag('event', 'conversion', {
          custom_parameter_1: testId,
          custom_parameter_2: currentVariant,
          custom_parameter_3: goalId,
          value: value,
        });
      }

      // Custom analytics endpoint
      fetch('/api/analytics/conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conversionData),
      }).catch(console.error);

      // Store in localStorage for backup
      const conversions = JSON.parse(localStorage.getItem('ab_test_conversions') || '[]');
      conversions.push(conversionData);
      localStorage.setItem('ab_test_conversions', JSON.stringify(conversions));
    }
  };

  const trackEvent = (eventName: string, properties: Record<string, any> = {}) => {
    const eventData = {
      testId,
      variant: currentVariant,
      eventName,
      properties,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      userId: getUserId(),
    };

    // Send to analytics
    if (typeof window !== 'undefined') {
      // Google Analytics
      if (window.gtag) {
        window.gtag('event', eventName, {
          custom_parameter_1: testId,
          custom_parameter_2: currentVariant,
          ...properties,
        });
      }

      // Custom analytics endpoint
      fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      }).catch(console.error);
    }
  };

  const getSessionId = (): string => {
    if (typeof window === 'undefined') return 'server';
    
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  };

  const getUserId = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('user_id');
  };

  const value = {
    currentVariant,
    getVariantConfig,
    trackConversion,
    trackEvent,
  };

  return (
    <ABTestContext.Provider value={value}>
      {children}
    </ABTestContext.Provider>
  );
}

// Global gtag type declaration
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}