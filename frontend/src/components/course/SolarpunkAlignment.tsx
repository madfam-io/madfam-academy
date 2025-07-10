import React from 'react';
import { Leaf, Users, Recycle, Heart, Zap, Sprout } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SolarpunkAlignmentProps {
  alignment: {
    overallScore: number;
    ecologicalSustainability: boolean;
    socialEquity: boolean;
    economicViability: boolean;
    technologicalAppropriate: boolean;
    culturalRelevance: boolean;
    regenerativeDesign: boolean;
    alignmentDetails?: {
      sustainabilityElements: string[];
      communityBenefits: string[];
      regenerativePractices: string[];
    };
  };
}

export const SolarpunkAlignment: React.FC<SolarpunkAlignmentProps> = ({
  alignment
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-700 bg-green-100';
    if (score >= 70) return 'text-green-600 bg-green-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-orange-600 bg-orange-50';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Exceptional';
    if (score >= 70) return 'Strong';
    if (score >= 50) return 'Moderate';
    return 'Developing';
  };

  const principles = [
    {
      key: 'ecologicalSustainability',
      label: 'Ecological Sustainability',
      icon: Leaf,
      description: 'Promotes environmental restoration and protection'
    },
    {
      key: 'socialEquity',
      label: 'Social Equity',
      icon: Users,
      description: 'Advances justice, inclusion, and community empowerment'
    },
    {
      key: 'economicViability',
      label: 'Economic Viability',
      icon: Recycle,
      description: 'Supports circular economy and sustainable livelihoods'
    },
    {
      key: 'technologicalAppropriate',
      label: 'Appropriate Technology',
      icon: Zap,
      description: 'Uses technology that serves human and ecological needs'
    },
    {
      key: 'culturalRelevance',
      label: 'Cultural Relevance',
      icon: Heart,
      description: 'Respects and preserves cultural diversity and wisdom'
    },
    {
      key: 'regenerativeDesign',
      label: 'Regenerative Design',
      icon: Sprout,
      description: 'Creates systems that heal and restore'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border border-green-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Solarpunk Alignment
            </h3>
            <p className="text-sm text-gray-600">
              How this course contributes to a sustainable future
            </p>
          </div>
        </div>
        
        <div className={cn(
          'px-4 py-2 rounded-full text-sm font-medium',
          getScoreColor(alignment.overallScore)
        )}>
          {alignment.overallScore}% {getScoreLabel(alignment.overallScore)}
        </div>
      </div>

      {/* Principles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {principles.map((principle) => {
          const isAligned = alignment[principle.key as keyof typeof alignment] as boolean;
          const Icon = principle.icon;
          
          return (
            <div
              key={principle.key}
              className={cn(
                'p-4 rounded-lg border transition-all',
                isAligned
                  ? 'bg-green-50 border-green-200 text-green-900'
                  : 'bg-gray-50 border-gray-200 text-gray-600'
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <Icon className={cn(
                  'w-5 h-5',
                  isAligned ? 'text-green-600' : 'text-gray-400'
                )} />
                <h4 className="font-medium text-sm">{principle.label}</h4>
              </div>
              <p className="text-xs leading-relaxed">
                {principle.description}
              </p>
              {isAligned && (
                <div className="mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detailed Benefits */}
      {alignment.alignmentDetails && (
        <div className="space-y-4">
          {alignment.alignmentDetails.sustainabilityElements.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-gray-900 mb-2">
                Sustainability Elements
              </h4>
              <div className="flex flex-wrap gap-2">
                {alignment.alignmentDetails.sustainabilityElements.map((element, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                  >
                    {element}
                  </span>
                ))}
              </div>
            </div>
          )}

          {alignment.alignmentDetails.communityBenefits.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-gray-900 mb-2">
                Community Benefits
              </h4>
              <div className="flex flex-wrap gap-2">
                {alignment.alignmentDetails.communityBenefits.map((benefit, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
          )}

          {alignment.alignmentDetails.regenerativePractices.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-gray-900 mb-2">
                Regenerative Practices
              </h4>
              <div className="flex flex-wrap gap-2">
                {alignment.alignmentDetails.regenerativePractices.map((practice, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                  >
                    {practice}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Impact Statement */}
      <div className="mt-6 p-4 bg-white rounded-lg border border-green-200">
        <p className="text-sm text-gray-700 leading-relaxed">
          <span className="font-medium text-green-700">Impact: </span>
          By completing this course, you'll gain knowledge and skills that contribute to 
          building a more sustainable, equitable, and regenerative future. Your learning 
          becomes part of a larger movement toward positive environmental and social change.
        </p>
      </div>
    </div>
  );
};