'use client';

import { Badge } from '@/components/ui/badge';
import { 
  ShieldCheckIcon, 
  AcademicCapIcon, 
  TrophyIcon,
  StarIcon,
  UserGroupIcon,
  GlobeAltIcon,
  CheckBadgeIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/solid';
import Image from 'next/image';

export function TrustIndicators() {
  const certifications = [
    {
      name: 'SOC 2 Type II Certified',
      icon: ShieldCheckIcon,
      description: 'Enterprise-grade security standards',
      badge: 'Security'
    },
    {
      name: 'GDPR Compliant',
      icon: GlobeAltIcon,
      description: 'Privacy protection worldwide',
      badge: 'Privacy'
    },
    {
      name: 'ISO 27001 Certified',
      icon: CheckBadgeIcon,
      description: 'Information security management',
      badge: 'ISO'
    },
    {
      name: 'WCAG 2.1 AA Accessible',
      icon: UserGroupIcon,
      description: 'Accessible to all learners',
      badge: 'Accessibility'
    }
  ];

  const awards = [
    {
      title: 'Best Online Learning Platform 2024',
      organization: 'EdTech Awards',
      image: '/awards/edtech-2024.png',
      year: '2024'
    },
    {
      title: 'Innovation in Education Award',
      organization: 'TechCrunch',
      image: '/awards/techcrunch-innovation.png',
      year: '2024'
    },
    {
      title: 'Top 50 EdTech Companies',
      organization: 'Forbes',
      image: '/awards/forbes-top50.png',
      year: '2023'
    },
    {
      title: 'Platinum Learning Award',
      organization: 'Brandon Hall Group',
      image: '/awards/brandon-hall.png',
      year: '2023'
    }
  ];

  const partnerships = [
    {
      name: 'Google for Education',
      logo: '/partners/google-edu.svg',
      type: 'Technology Partner'
    },
    {
      name: 'Microsoft Learn',
      logo: '/partners/microsoft-learn.svg',
      type: 'Certification Partner'
    },
    {
      name: 'AWS Training Partner',
      logo: '/partners/aws-training.svg',
      type: 'Cloud Training Partner'
    },
    {
      name: 'Meta Blueprint',
      logo: '/partners/meta-blueprint.svg',
      type: 'Marketing Partner'
    },
    {
      name: 'Salesforce Trailhead',
      logo: '/partners/salesforce-trailhead.svg',
      type: 'CRM Training Partner'
    },
    {
      name: 'Adobe Certified',
      logo: '/partners/adobe-certified.svg',
      type: 'Creative Partner'
    }
  ];

  const stats = [
    {
      icon: UserGroupIcon,
      number: '2.8M+',
      label: 'Students Worldwide',
      sublabel: 'Across 190 countries'
    },
    {
      icon: AcademicCapIcon,
      number: '500K+',
      label: 'Certificates Earned',
      sublabel: 'Industry-recognized'
    },
    {
      icon: TrophyIcon,
      number: '95%',
      label: 'Job Placement Rate',
      sublabel: 'Within 6 months'
    },
    {
      icon: StarIcon,
      number: '4.9/5',
      label: 'Student Satisfaction',
      sublabel: 'From 50K+ reviews'
    }
  ];

  const companyPartners = [
    { name: 'Google', logo: '/company-logos/google.svg' },
    { name: 'Microsoft', logo: '/company-logos/microsoft.svg' },
    { name: 'Amazon', logo: '/company-logos/amazon.svg' },
    { name: 'Apple', logo: '/company-logos/apple.svg' },
    { name: 'Meta', logo: '/company-logos/meta.svg' },
    { name: 'Netflix', logo: '/company-logos/netflix.svg' },
    { name: 'Tesla', logo: '/company-logos/tesla.svg' },
    { name: 'Spotify', logo: '/company-logos/spotify.svg' },
    { name: 'Airbnb', logo: '/company-logos/airbnb.svg' },
    { name: 'Uber', logo: '/company-logos/uber.svg' },
    { name: 'Salesforce', logo: '/company-logos/salesforce.svg' },
    { name: 'LinkedIn', logo: '/company-logos/linkedin.svg' }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
          Trusted Worldwide
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
          Industry-Leading Standards & Recognition
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Our commitment to excellence is recognized by leading organizations and trusted by millions of learners
        </p>
      </div>

      {/* Trust Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon className="w-8 h-8 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-2">{stat.number}</div>
              <div className="text-lg font-medium text-foreground mb-1">{stat.label}</div>
              <div className="text-sm text-muted-foreground">{stat.sublabel}</div>
            </div>
          );
        })}
      </div>

      {/* Security & Compliance */}
      <div className="mb-16">
        <h3 className="text-2xl font-bold text-foreground text-center mb-8">
          Security & Compliance Certifications
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {certifications.map((cert, index) => {
            const Icon = cert.icon;
            return (
              <div key={index} className="bg-card rounded-xl p-6 border border-border text-center hover:border-primary/50 transition-colors duration-300">
                <Badge variant="outline" className="mb-4">
                  {cert.badge}
                </Badge>
                <Icon className="w-12 h-12 text-primary mx-auto mb-4" />
                <h4 className="font-bold text-foreground mb-2">{cert.name}</h4>
                <p className="text-sm text-muted-foreground">{cert.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Awards & Recognition */}
      <div className="mb-16">
        <h3 className="text-2xl font-bold text-foreground text-center mb-8">
          Awards & Industry Recognition
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {awards.map((award, index) => (
            <div key={index} className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800 text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrophyIcon className="w-8 h-8 text-yellow-600" />
              </div>
              <Badge variant="secondary" className="mb-3 bg-yellow-100 text-yellow-700">
                {award.year}
              </Badge>
              <h4 className="font-bold text-foreground mb-2 text-sm leading-tight">{award.title}</h4>
              <p className="text-xs text-muted-foreground">{award.organization}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Technology Partnerships */}
      <div className="mb-16">
        <h3 className="text-2xl font-bold text-foreground text-center mb-8">
          Official Technology Partners
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {partnerships.map((partner, index) => (
            <div key={index} className="bg-card rounded-lg p-4 border border-border hover:border-primary/50 transition-colors duration-300 text-center">
              <div className="h-12 flex items-center justify-center mb-3">
                <Image
                  src={partner.logo}
                  alt={`${partner.name} logo`}
                  width={80}
                  height={40}
                  className="max-h-8 w-auto"
                />
              </div>
              <div className="text-xs font-medium text-foreground mb-1">{partner.name}</div>
              <div className="text-xs text-muted-foreground">{partner.type}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Employer Partners */}
      <div className="mb-16">
        <h3 className="text-2xl font-bold text-foreground text-center mb-4">
          Our Graduates Work At
        </h3>
        <p className="text-muted-foreground text-center mb-8">
          Top companies actively hire our graduates and trust our training
        </p>
        
        {/* Scrolling Logos */}
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll-logos">
            {[...companyPartners, ...companyPartners].map((company, index) => (
              <div key={index} className="flex-shrink-0 mx-8">
                <Image
                  src={company.logo}
                  alt={`${company.name} logo`}
                  width={100}
                  height={50}
                  className="h-10 w-auto grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Trust Signals */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800 text-center">
          <ShieldCheckIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h4 className="font-bold text-foreground mb-2">100% Secure Learning</h4>
          <p className="text-sm text-muted-foreground">
            Bank-level encryption protects your data and learning progress
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 text-center">
          <AcademicCapIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h4 className="font-bold text-foreground mb-2">Accredited Programs</h4>
          <p className="text-sm text-muted-foreground">
            Our courses meet the highest educational standards worldwide
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800 text-center">
          <BuildingOffice2Icon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h4 className="font-bold text-foreground mb-2">Enterprise Trusted</h4>
          <p className="text-sm text-muted-foreground">
            Fortune 500 companies use our platform for employee training
          </p>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes scroll-logos {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll-logos {
          animation: scroll-logos 30s linear infinite;
        }
      `}</style>
    </div>
  );
}