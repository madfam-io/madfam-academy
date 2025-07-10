'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface UTMParams {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

interface LandingPageContextType {
  utmParams: UTMParams;
  persona: string;
  isReturningVisitor: boolean;
  sessionData: {
    sessionId: string;
    startTime: number;
    pageViews: number;
    referrer: string;
    deviceType: 'mobile' | 'tablet' | 'desktop';
    browserInfo: {
      name: string;
      version: string;
    };
    location?: {
      country?: string;
      region?: string;
      city?: string;
    };
  };
  trackUtmConversion: (action: string, value?: number) => void;
  trackPersonaEngagement: (engagement: string, data?: Record<string, any>) => void;
  getPersonaContent: (contentKey: string, defaultValue?: any) => any;
}

const LandingPageContext = createContext<LandingPageContextType | undefined>(undefined);

export function useLandingPage() {
  const context = useContext(LandingPageContext);
  if (!context) {
    throw new Error('useLandingPage must be used within a LandingPageProvider');
  }
  return context;
}

interface LandingPageProviderProps {
  children: React.ReactNode;
  utmParams: UTMParams;
  persona: string;
}

export function LandingPageProvider({ children, utmParams, persona }: LandingPageProviderProps) {
  const [sessionData, setSessionData] = useState(() => {
    if (typeof window === 'undefined') return {
      sessionId: 'server',
      startTime: Date.now(),
      pageViews: 0,
      referrer: '',
      deviceType: 'desktop' as const,
      browserInfo: { name: 'unknown', version: 'unknown' }
    };

    // Generate or retrieve session ID
    let sessionId = sessionStorage.getItem('landing_session_id');
    if (!sessionId) {
      sessionId = `landing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('landing_session_id', sessionId);
    }

    // Detect device type
    const detectDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
      const width = window.innerWidth;
      if (width < 768) return 'mobile';
      if (width < 1024) return 'tablet';
      return 'desktop';
    };

    // Detect browser
    const detectBrowser = () => {
      const ua = navigator.userAgent;
      let name = 'unknown';
      let version = 'unknown';

      if (ua.includes('Chrome/')) {
        name = 'Chrome';
        version = ua.match(/Chrome\/([0-9\.]+)/)?.[1] || 'unknown';
      } else if (ua.includes('Firefox/')) {
        name = 'Firefox';
        version = ua.match(/Firefox\/([0-9\.]+)/)?.[1] || 'unknown';
      } else if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
        name = 'Safari';
        version = ua.match(/Version\/([0-9\.]+)/)?.[1] || 'unknown';
      } else if (ua.includes('Edge/')) {
        name = 'Edge';
        version = ua.match(/Edge\/([0-9\.]+)/)?.[1] || 'unknown';
      }

      return { name, version };
    };

    return {
      sessionId,
      startTime: Date.now(),
      pageViews: parseInt(sessionStorage.getItem('landing_page_views') || '0', 10) + 1,
      referrer: document.referrer || 'direct',
      deviceType: detectDeviceType(),
      browserInfo: detectBrowser()
    };
  });

  const [isReturningVisitor, setIsReturningVisitor] = useState(false);

  // Initialize session and visitor data
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Update page views
    sessionStorage.setItem('landing_page_views', sessionData.pageViews.toString());

    // Check if returning visitor
    const hasVisited = localStorage.getItem('madfam_landing_visited');
    if (hasVisited) {
      setIsReturningVisitor(true);
    } else {
      localStorage.setItem('madfam_landing_visited', 'true');
      localStorage.setItem('madfam_first_visit', new Date().toISOString());
    }

    // Store UTM parameters for attribution
    if (Object.keys(utmParams).length > 0) {
      const filteredUtm = Object.fromEntries(
        Object.entries(utmParams).filter(([_, value]) => value !== undefined)
      );
      localStorage.setItem('madfam_utm_attribution', JSON.stringify(filteredUtm));
      localStorage.setItem('madfam_utm_timestamp', new Date().toISOString());
    }

    // Store persona for personalization
    if (persona) {
      localStorage.setItem('madfam_user_persona', persona);
    }

    // Get user location (if geolocation is available)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // In a real app, you'd reverse geocode these coordinates
          // For now, we'll just store them
          localStorage.setItem('madfam_user_coords', JSON.stringify({ latitude, longitude }));
        },
        () => {
          // Geolocation failed, that's okay
        },
        { timeout: 5000, maximumAge: 300000 } // 5 second timeout, 5 minute cache
      );
    }
  }, [utmParams, persona, sessionData.pageViews]);

  // Persona-specific content mapping
  const personaContent = {
    learner: {
      heroEmphasis: 'beginner-friendly',
      testimonialFilter: 'career_change',
      pricingFocus: 'value',
      urgencyStyle: 'educational',
      ctaLanguage: 'start_learning',
      trustIndicators: ['money_back_guarantee', 'beginner_support', 'community'],
      features: ['step_by_step', 'mentor_support', 'practical_projects']
    },
    professional: {
      heroEmphasis: 'skill_advancement',
      testimonialFilter: 'promotion',
      pricingFocus: 'roi',
      urgencyStyle: 'competitive',
      ctaLanguage: 'advance_career',
      trustIndicators: ['enterprise_trusted', 'certification', 'industry_recognition'],
      features: ['advanced_topics', 'expert_instruction', 'industry_projects']
    },
    entrepreneur: {
      heroEmphasis: 'business_growth',
      testimonialFilter: 'freelance',
      pricingFocus: 'investment',
      urgencyStyle: 'opportunity',
      ctaLanguage: 'start_business',
      trustIndicators: ['success_stories', 'business_network', 'revenue_growth'],
      features: ['business_skills', 'networking', 'monetization']
    }
  };

  const trackUtmConversion = (action: string, value: number = 1) => {
    const conversionData = {
      action,
      value,
      utm_params: utmParams,
      persona,
      session_id: sessionData.sessionId,
      timestamp: new Date().toISOString(),
      page_url: window.location.href,
      referrer: sessionData.referrer,
      device_type: sessionData.deviceType,
      browser: sessionData.browserInfo
    };

    // Send to analytics
    if (typeof window !== 'undefined') {
      // Google Analytics
      if (window.gtag) {
        window.gtag('event', 'conversion', {
          custom_parameter_1: action,
          custom_parameter_2: persona,
          custom_parameter_3: utmParams.campaign || 'direct',
          value: value,
        });
      }

      // Facebook Pixel (if available)
      if (window.fbq) {
        window.fbq('track', 'Lead', {
          content_name: action,
          content_category: persona,
          value: value,
          currency: 'USD'
        });
      }

      // Custom analytics endpoint
      fetch('/api/analytics/utm-conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conversionData),
      }).catch(console.error);

      // Store locally for backup
      const conversions = JSON.parse(localStorage.getItem('madfam_utm_conversions') || '[]');
      conversions.push(conversionData);
      localStorage.setItem('madfam_utm_conversions', JSON.stringify(conversions.slice(-50))); // Keep last 50
    }
  };

  const trackPersonaEngagement = (engagement: string, data: Record<string, any> = {}) => {
    const engagementData = {
      engagement,
      persona,
      data,
      session_id: sessionData.sessionId,
      timestamp: new Date().toISOString(),
      page_url: window.location.href,
      device_type: sessionData.deviceType
    };

    // Send to analytics
    if (typeof window !== 'undefined') {
      // Google Analytics
      if (window.gtag) {
        window.gtag('event', 'engagement', {
          custom_parameter_1: engagement,
          custom_parameter_2: persona,
          ...data
        });
      }

      // Custom analytics endpoint
      fetch('/api/analytics/persona-engagement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(engagementData),
      }).catch(console.error);
    }
  };

  const getPersonaContent = (contentKey: string, defaultValue: any = null) => {
    const currentPersonaContent = personaContent[persona as keyof typeof personaContent] || personaContent.learner;
    return currentPersonaContent[contentKey as keyof typeof currentPersonaContent] || defaultValue;
  };

  const value = {
    utmParams,
    persona,
    isReturningVisitor,
    sessionData,
    trackUtmConversion,
    trackPersonaEngagement,
    getPersonaContent
  };

  return (
    <LandingPageContext.Provider value={value}>
      {children}
    </LandingPageContext.Provider>
  );
}

// Global type declarations for analytics
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}