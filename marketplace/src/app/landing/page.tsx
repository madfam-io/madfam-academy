import { Metadata } from 'next';
import { Suspense } from 'react';
import { LandingPageProvider } from '@/components/providers/landing-page-provider';
import { ConversionOptimizedHero } from '@/components/landing/conversion-optimized-hero';
import { SocialProofBar } from '@/components/landing/social-proof-bar';
import { ValueProposition } from '@/components/landing/value-proposition';
import { FeaturedTestimonials } from '@/components/landing/featured-testimonials';
import { PricingCTA } from '@/components/landing/pricing-cta';
import { TrustIndicators } from '@/components/landing/trust-indicators';
import { UrgencyTimer } from '@/components/landing/urgency-timer';
import { LeadCaptureModal } from '@/components/landing/lead-capture-modal';
import { ABTestProvider } from '@/components/providers/ab-test-provider';
import { ConversionTracker } from '@/components/analytics/conversion-tracker';
import { HeroSkeleton } from '@/components/ui/skeletons';

export const metadata: Metadata = {
  title: 'Transform Your Career with MADFAM Academy - Limited Time Offer',
  description: 'Join over 2 million students learning in-demand skills. Get 50% off all courses for the next 48 hours. Start your transformation today!',
  keywords: [
    'online courses',
    'career transformation',
    'skill development',
    'professional training',
    'certification',
    'technology skills',
    'business skills'
  ],
  openGraph: {
    title: 'Transform Your Career with MADFAM Academy - 50% Off Limited Time',
    description: 'Join 2M+ students. Learn from industry experts. Get certified. Transform your career in just 30 days.',
    images: [
      {
        url: '/landing/hero-image.jpg',
        width: 1200,
        height: 630,
        alt: 'MADFAM Academy Career Transformation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Transform Your Career - 50% Off Today Only',
    description: 'Join 2M+ successful students. Industry-leading courses. Expert instructors. Start today!',
  },
  robots: {
    index: true,
    follow: true,
  },
};

interface LandingPageProps {
  searchParams: {
    variant?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    persona?: string;
  };
}

export default function LandingPage({ searchParams }: LandingPageProps) {
  const variant = searchParams.variant || 'A';
  const persona = searchParams.persona || 'learner';
  const utmParams = {
    source: searchParams.utm_source,
    medium: searchParams.utm_medium,
    campaign: searchParams.utm_campaign,
  };

  return (
    <ABTestProvider variant={variant}>
      <LandingPageProvider utmParams={utmParams} persona={persona}>
        <ConversionTracker />
        
        <div className="min-h-screen bg-background">
          {/* Hero Section */}
          <section className="relative overflow-hidden">
            <Suspense fallback={<HeroSkeleton />}>
              <ConversionOptimizedHero variant={variant} persona={persona} />
            </Suspense>
          </section>

          {/* Social Proof Bar */}
          <section className="py-4 bg-primary text-primary-foreground">
            <SocialProofBar />
          </section>

          {/* Value Proposition */}
          <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
            <ValueProposition variant={variant} />
          </section>

          {/* Featured Testimonials */}
          <section className="py-16">
            <FeaturedTestimonials persona={persona} />
          </section>

          {/* Trust Indicators */}
          <section className="py-12 bg-gray-50 dark:bg-gray-900/50">
            <TrustIndicators />
          </section>

          {/* Pricing CTA */}
          <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-700">
            <PricingCTA variant={variant} />
          </section>

          {/* Urgency Section */}
          <section className="py-8 bg-yellow-50 dark:bg-yellow-900/20 border-y border-yellow-200 dark:border-yellow-800">
            <UrgencyTimer />
          </section>

          {/* Lead Capture Modal */}
          <LeadCaptureModal />
        </div>
      </LandingPageProvider>
    </ABTestProvider>
  );
}