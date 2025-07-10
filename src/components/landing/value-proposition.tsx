'use client';

import { useABTest } from '@/components/providers/ab-test-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RocketLaunchIcon, 
  AcademicCapIcon, 
  BriefcaseIcon, 
  ClockIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  TrophyIcon,
  LightBulbIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/solid';

interface ValuePropositionProps {
  variant: string;
}

export function ValueProposition({ variant }: ValuePropositionProps) {
  const { getVariantConfig, trackEvent, trackConversion } = useABTest();

  const propositions = {
    A: {
      title: 'Why Choose MADFAM Academy?',
      subtitle: 'The complete learning platform designed for your success',
      features: [
        {
          icon: RocketLaunchIcon,
          title: 'Launch Your Career Fast',
          description: 'Go from beginner to job-ready in just 12 weeks with our structured learning paths.',
          benefit: '3x faster than traditional education'
        },
        {
          icon: UserGroupIcon,
          title: 'Expert-Led Instruction',
          description: 'Learn from industry professionals who work at top tech companies worldwide.',
          benefit: '95% instructor satisfaction rate'
        },
        {
          icon: ShieldCheckIcon,
          title: 'Success Guarantee',
          description: 'Get hired within 6 months or receive a full refund - we believe in our results.',
          benefit: '30-day money-back guarantee'
        }
      ]
    },
    B: {
      title: 'Transform Your Future in 30 Days',
      subtitle: 'The proven system that launched 50,000+ successful careers',
      features: [
        {
          icon: ClockIcon,
          title: 'Rapid Skill Development',
          description: 'Master high-demand skills with our accelerated learning methodology.',
          benefit: 'Job-ready in 30 days'
        },
        {
          icon: BriefcaseIcon,
          title: 'Direct Industry Access',
          description: 'Connect directly with hiring partners and get placed in your dream job.',
          benefit: '95% job placement rate'
        },
        {
          icon: TrophyIcon,
          title: 'Proven Track Record',
          description: 'Join thousands of successful graduates earning 2x their previous salary.',
          benefit: 'Average 100% salary increase'
        }
      ]
    },
    C: {
      title: 'The Future of Learning is Here',
      subtitle: 'Revolutionary education that adapts to your goals and schedule',
      features: [
        {
          icon: LightBulbIcon,
          title: 'AI-Powered Learning',
          description: 'Personalized curriculum that adapts to your learning style and pace.',
          benefit: 'Custom learning experience'
        },
        {
          icon: AcademicCapIcon,
          title: 'Industry Certifications',
          description: 'Earn recognized certifications that employers actively seek.',
          benefit: 'HR-approved credentials'
        },
        {
          icon: RocketLaunchIcon,
          title: 'Career Acceleration',
          description: 'Fast-track your career with our comprehensive support system.',
          benefit: 'Lifetime career support'
        }
      ]
    }
  };

  const currentProposition = propositions[variant as keyof typeof propositions] || propositions.A;

  const handleFeatureClick = (featureTitle: string) => {
    trackEvent('value_prop_feature_click', { 
      variant, 
      feature: featureTitle 
    });
  };

  const handleCTAClick = () => {
    trackEvent('value_prop_cta_click', { variant });
    trackConversion('value_proposition_cta', 1);
  };

  const stats = [
    { number: '2M+', label: 'Students Enrolled' },
    { number: '95%', label: 'Job Placement Rate' },
    { number: '50K+', label: 'Career Changes' },
    { number: '4.9/5', label: 'Student Rating' }
  ];

  const learningPaths = [
    {
      title: 'Full-Stack Development',
      duration: '12 weeks',
      skills: ['React', 'Node.js', 'MongoDB', 'AWS'],
      jobs: 'Frontend/Backend Developer',
      salary: '$75K-$120K'
    },
    {
      title: 'Data Science & AI',
      duration: '16 weeks',
      skills: ['Python', 'Machine Learning', 'SQL', 'Tableau'],
      jobs: 'Data Scientist/Analyst',
      salary: '$85K-$140K'
    },
    {
      title: 'Cloud & DevOps',
      duration: '10 weeks',
      skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins'],
      jobs: 'DevOps Engineer',
      salary: '$90K-$150K'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary">
          Why Students Choose Us
        </Badge>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
          {currentProposition.title}
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          {currentProposition.subtitle}
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
              {stat.number}
            </div>
            <div className="text-sm md:text-base text-muted-foreground">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Main Features */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {currentProposition.features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div 
              key={index}
              className="group bg-card rounded-2xl p-8 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg cursor-pointer"
              onClick={() => handleFeatureClick(feature.title)}
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                <Icon className="w-8 h-8 text-primary" />
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {feature.description}
              </p>
              
              <div className="flex items-center text-sm font-medium text-primary">
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                {feature.benefit}
              </div>
            </div>
          );
        })}
      </div>

      {/* Learning Paths */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Choose Your Learning Path
          </h3>
          <p className="text-lg text-muted-foreground">
            Structured programs designed to get you hired
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {learningPaths.map((path, index) => (
            <div key={index} className="bg-gradient-to-br from-card to-muted/20 rounded-2xl p-6 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-bold text-foreground">{path.title}</h4>
                <Badge variant="outline" className="text-xs">
                  {path.duration}
                </Badge>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Skills You'll Learn:</div>
                  <div className="flex flex-wrap gap-2">
                    {path.skills.map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Job Roles:</div>
                  <div className="text-sm text-foreground">{path.jobs}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Average Salary:</div>
                  <div className="text-lg font-bold text-primary">{path.salary}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-gradient-to-r from-primary/10 to-purple-600/10 rounded-3xl p-12">
        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
          Ready to Transform Your Career?
        </h3>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of successful graduates who transformed their lives with MADFAM Academy
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg rounded-xl"
            onClick={handleCTAClick}
          >
            Start Your Journey Today
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            className="px-8 py-4 text-lg rounded-xl"
          >
            View All Programs
          </Button>
        </div>
        
        <div className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground">
          <CheckCircleIcon className="w-4 h-4 text-green-600" />
          <span>30-day money-back guarantee</span>
        </div>
      </div>
    </div>
  );
}