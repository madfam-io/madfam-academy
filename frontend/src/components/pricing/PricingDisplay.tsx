import React from 'react';
import { Tag, Clock, Users, Zap, Crown, Gift } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PricingModel {
  type: 'free' | 'one_time' | 'subscription' | 'tiered';
  amount: number;
  currency: string;
  discountAmount?: number;
  originalAmount?: number;
  subscriptionPeriod?: 'monthly' | 'yearly';
  tieredOptions?: TieredOption[];
  features?: string[];
  limitations?: string[];
}

interface TieredOption {
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
}

interface PricingDisplayProps {
  pricing: PricingModel;
  detailed?: boolean;
  compact?: boolean;
  showFeatures?: boolean;
  onTierSelect?: (tier: TieredOption) => void;
}

export const PricingDisplay: React.FC<PricingDisplayProps> = ({
  pricing,
  detailed = false,
  compact = false,
  showFeatures = true,
  onTierSelect
}) => {
  const formatPrice = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2
    }).format(amount);
  };

  const getDiscountPercentage = () => {
    if (!pricing.originalAmount || !pricing.discountAmount) return 0;
    return Math.round(((pricing.originalAmount - pricing.amount) / pricing.originalAmount) * 100);
  };

  if (compact) {
    return <CompactPricing pricing={pricing} formatPrice={formatPrice} />;
  }

  switch (pricing.type) {
    case 'free':
      return <FreePricing pricing={pricing} showFeatures={showFeatures} />;
    
    case 'one_time':
      return (
        <OneTimePricing 
          pricing={pricing} 
          formatPrice={formatPrice}
          getDiscountPercentage={getDiscountPercentage}
          showFeatures={showFeatures}
          detailed={detailed}
        />
      );
    
    case 'subscription':
      return (
        <SubscriptionPricing 
          pricing={pricing} 
          formatPrice={formatPrice}
          getDiscountPercentage={getDiscountPercentage}
          showFeatures={showFeatures}
          detailed={detailed}
        />
      );
    
    case 'tiered':
      return (
        <TieredPricing 
          pricing={pricing} 
          formatPrice={formatPrice}
          onTierSelect={onTierSelect}
          detailed={detailed}
        />
      );
    
    default:
      return null;
  }
};

const CompactPricing: React.FC<{
  pricing: PricingModel;
  formatPrice: (amount: number, currency?: string) => string;
}> = ({ pricing, formatPrice }) => {
  if (pricing.type === 'free') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-green-600">Free</span>
        <Gift className="w-5 h-5 text-green-600" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {pricing.originalAmount && pricing.originalAmount > pricing.amount && (
        <span className="text-lg text-gray-400 line-through">
          {formatPrice(pricing.originalAmount, pricing.currency)}
        </span>
      )}
      <span className="text-2xl font-bold text-gray-900">
        {formatPrice(pricing.amount, pricing.currency)}
      </span>
      {pricing.subscriptionPeriod && (
        <span className="text-gray-600">/{pricing.subscriptionPeriod}</span>
      )}
    </div>
  );
};

const FreePricing: React.FC<{
  pricing: PricingModel;
  showFeatures: boolean;
}> = ({ pricing, showFeatures }) => {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-3 mb-4">
        <span className="text-3xl font-bold text-green-600">Free</span>
        <div className="bg-green-100 p-2 rounded-full">
          <Gift className="w-6 h-6 text-green-600" />
        </div>
      </div>
      
      <p className="text-gray-600 mb-4">
        Complete access to all course materials at no cost
      </p>

      {showFeatures && pricing.features && pricing.features.length > 0 && (
        <div className="text-left">
          <h4 className="font-medium text-gray-900 mb-3">What's Included:</h4>
          <ul className="space-y-2">
            {pricing.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      {pricing.limitations && pricing.limitations.length > 0 && (
        <div className="mt-4 text-left">
          <h4 className="font-medium text-gray-700 mb-2">Limitations:</h4>
          <ul className="space-y-1">
            {pricing.limitations.map((limitation, index) => (
              <li key={index} className="text-xs text-gray-500">
                • {limitation}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const OneTimePricing: React.FC<{
  pricing: PricingModel;
  formatPrice: (amount: number, currency?: string) => string;
  getDiscountPercentage: () => number;
  showFeatures: boolean;
  detailed: boolean;
}> = ({ pricing, formatPrice, getDiscountPercentage, showFeatures, detailed }) => {
  const discountPercentage = getDiscountPercentage();

  return (
    <div className="text-center">
      <div className="mb-4">
        {discountPercentage > 0 && (
          <div className="flex items-center justify-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-600">
              Save {discountPercentage}%
            </span>
          </div>
        )}
        
        <div className="flex items-center justify-center gap-3">
          {pricing.originalAmount && pricing.originalAmount > pricing.amount && (
            <span className="text-xl text-gray-400 line-through">
              {formatPrice(pricing.originalAmount, pricing.currency)}
            </span>
          )}
          <span className="text-4xl font-bold text-gray-900">
            {formatPrice(pricing.amount, pricing.currency)}
          </span>
        </div>
        
        <p className="text-gray-600 mt-2">One-time payment • Lifetime access</p>
      </div>

      {detailed && (
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Premium Access
            </span>
          </div>
          <p className="text-xs text-blue-700">
            Immediate access to all content, downloadable resources, and completion certificate
          </p>
        </div>
      )}

      {showFeatures && pricing.features && pricing.features.length > 0 && (
        <div className="text-left">
          <h4 className="font-medium text-gray-900 mb-3">Course Includes:</h4>
          <ul className="space-y-2">
            {pricing.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const SubscriptionPricing: React.FC<{
  pricing: PricingModel;
  formatPrice: (amount: number, currency?: string) => string;
  getDiscountPercentage: () => number;
  showFeatures: boolean;
  detailed: boolean;
}> = ({ pricing, formatPrice, getDiscountPercentage, showFeatures, detailed }) => {
  const discountPercentage = getDiscountPercentage();

  return (
    <div className="text-center">
      <div className="mb-4">
        {discountPercentage > 0 && (
          <div className="flex items-center justify-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-600">
              Save {discountPercentage}%
            </span>
          </div>
        )}
        
        <div className="flex items-center justify-center gap-2">
          {pricing.originalAmount && pricing.originalAmount > pricing.amount && (
            <span className="text-lg text-gray-400 line-through">
              {formatPrice(pricing.originalAmount, pricing.currency)}
            </span>
          )}
          <span className="text-3xl font-bold text-gray-900">
            {formatPrice(pricing.amount, pricing.currency)}
          </span>
          <span className="text-gray-600">
            /{pricing.subscriptionPeriod === 'monthly' ? 'month' : 'year'}
          </span>
        </div>
        
        <p className="text-gray-600 mt-2">
          Cancel anytime • {pricing.subscriptionPeriod === 'yearly' ? 'Billed annually' : 'Billed monthly'}
        </p>
      </div>

      {detailed && (
        <div className="bg-purple-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">
              {pricing.subscriptionPeriod === 'yearly' ? 'Annual' : 'Monthly'} Subscription
            </span>
          </div>
          <p className="text-xs text-purple-700">
            Full platform access, regular content updates, and priority support
          </p>
        </div>
      )}

      {showFeatures && pricing.features && pricing.features.length > 0 && (
        <div className="text-left">
          <h4 className="font-medium text-gray-900 mb-3">Subscription Includes:</h4>
          <ul className="space-y-2">
            {pricing.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const TieredPricing: React.FC<{
  pricing: PricingModel;
  formatPrice: (amount: number, currency?: string) => string;
  onTierSelect?: (tier: TieredOption) => void;
  detailed: boolean;
}> = ({ pricing, formatPrice, onTierSelect, detailed }) => {
  if (!pricing.tieredOptions || pricing.tieredOptions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-center mb-6">Choose Your Plan</h4>
      
      <div className={cn(
        'grid gap-4',
        pricing.tieredOptions.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' : 
        pricing.tieredOptions.length === 3 ? 'grid-cols-1 lg:grid-cols-3' :
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      )}>
        {pricing.tieredOptions.map((tier, index) => (
          <div
            key={index}
            className={cn(
              'relative border rounded-lg p-6 cursor-pointer transition-all hover:border-blue-500 hover:shadow-lg',
              tier.popular
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                : 'border-gray-200 bg-white'
            )}
            onClick={() => onTierSelect?.(tier)}
          >
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}
            
            <div className="text-center mb-4">
              <h5 className="font-semibold text-lg text-gray-900 mb-2">
                {tier.name}
              </h5>
              <div className="mb-2">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(tier.price, pricing.currency)}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {tier.description}
              </p>
            </div>

            {detailed && tier.features && tier.features.length > 0 && (
              <div className="space-y-2">
                {tier.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-2">
                    <div className={cn(
                      'w-2 h-2 rounded-full flex-shrink-0',
                      tier.popular ? 'bg-blue-500' : 'bg-green-500'
                    )} />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="text-center text-sm text-gray-500 mt-4">
        Click on a plan to select it for enrollment
      </div>
    </div>
  );
};

// Multi-tenant pricing utilities
export const useTenantPricing = () => {
  const applyTenantDiscount = (basePrice: number, tenantTier: string) => {
    const discounts = {
      'enterprise': 0.2,  // 20% discount
      'premium': 0.1,     // 10% discount
      'standard': 0.05,   // 5% discount
      'basic': 0          // No discount
    };
    
    const discount = discounts[tenantTier as keyof typeof discounts] || 0;
    return basePrice * (1 - discount);
  };

  const getTenantFeatures = (tenantTier: string) => {
    const features = {
      'enterprise': [
        'White-label branding',
        'Custom domain',
        'Advanced analytics',
        'Priority support',
        'Bulk enrollment',
        'API access'
      ],
      'premium': [
        'Custom branding',
        'Advanced analytics',
        'Priority support',
        'Bulk enrollment'
      ],
      'standard': [
        'Basic analytics',
        'Email support',
        'Group enrollment'
      ],
      'basic': [
        'Basic features',
        'Community support'
      ]
    };
    
    return features[tenantTier as keyof typeof features] || features.basic;
  };

  return {
    applyTenantDiscount,
    getTenantFeatures
  };
};