'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useABTest } from '@/components/providers/ab-test-provider';
import { 
  ClockIcon, 
  FireIcon, 
  ExclamationTriangleIcon,
  BoltIcon,
  GiftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/solid';

export function UrgencyTimer() {
  const { getVariantConfig, trackEvent, trackConversion } = useABTest();
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isActive, setIsActive] = useState(true);

  const urgencyText = getVariantConfig('urgencyText', 'Limited Time: 50% Off All Courses');

  // Calculate time until end of offer (24 hours from now for demo)
  useEffect(() => {
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 24); // 24 hours from now
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime.getTime() - now;

      if (distance > 0) {
        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({ hours, minutes, seconds });
      } else {
        setIsActive(false);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Track urgency section view
  useEffect(() => {
    trackEvent('urgency_timer_view', { 
      urgency_text: urgencyText,
      time_remaining: `${timeLeft.hours}:${timeLeft.minutes}:${timeLeft.seconds}`
    });
  }, []);

  const handleUrgencyCTAClick = () => {
    trackEvent('urgency_cta_click', { 
      urgency_text: urgencyText,
      time_remaining: `${timeLeft.hours}:${timeLeft.minutes}:${timeLeft.seconds}`
    });
    trackConversion('urgency_cta', 1);
  };

  const offers = [
    {
      icon: GiftIcon,
      title: '50% Off All Courses',
      description: 'Save hundreds on our most popular programs',
      originalPrice: '$2,999',
      salePrice: '$1,499'
    },
    {
      icon: BoltIcon,
      title: 'Free Career Coaching',
      description: '3 months of personal career guidance included',
      value: '$1,200 value'
    },
    {
      icon: ClockIcon,
      title: 'Lifetime Access',
      description: 'Never lose access to course materials and updates',
      value: 'Unlimited value'
    }
  ];

  const testimonialQuotes = [
    {
      text: "I got this deal last month and it changed my life!",
      author: "Sarah M.",
      role: "Software Engineer"
    },
    {
      text: "Best investment I ever made. 300% ROI in 6 months.",
      author: "Mike R.",
      role: "Data Scientist"
    },
    {
      text: "The urgency was real - glad I didn't wait!",
      author: "Emma L.",
      role: "Product Manager"
    }
  ];

  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const quoteTimer = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % testimonialQuotes.length);
    }, 3000);
    
    return () => clearInterval(quoteTimer);
  }, []);

  if (!isActive) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="text-red-600 font-semibold text-lg">
            ⏰ This offer has expired
          </div>
          <p className="text-muted-foreground mt-2">
            Sign up for notifications about future special offers
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 animate-pulse"></div>
      <div className="absolute inset-0 bg-[url('/patterns/urgency-pattern.svg')] opacity-10"></div>
      
      {/* Floating Alert Icons */}
      <div className="absolute top-4 left-4 animate-bounce">
        <ExclamationTriangleIcon className="w-6 h-6 text-white/80" />
      </div>
      <div className="absolute top-4 right-4 animate-bounce delay-500">
        <FireIcon className="w-6 h-6 text-white/80" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8 items-center">
          {/* Timer Section */}
          <div className="text-center lg:text-left">
            <Badge className="mb-4 bg-red-600 text-white font-bold animate-pulse">
              🔥 FLASH SALE ENDING SOON
            </Badge>
            
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {urgencyText}
            </h3>
            
            {/* Countdown Timer */}
            <div className="flex justify-center lg:justify-start gap-4 mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 min-w-[80px]">
                <div className="text-2xl md:text-3xl font-bold text-white">
                  {timeLeft.hours.toString().padStart(2, '0')}
                </div>
                <div className="text-xs uppercase tracking-wide text-white/80">Hours</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 min-w-[80px]">
                <div className="text-2xl md:text-3xl font-bold text-white">
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </div>
                <div className="text-xs uppercase tracking-wide text-white/80">Minutes</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 min-w-[80px]">
                <div className="text-2xl md:text-3xl font-bold text-white">
                  {timeLeft.seconds.toString().padStart(2, '0')}
                </div>
                <div className="text-xs uppercase tracking-wide text-white/80">Seconds</div>
              </div>
            </div>

            <Button
              size="lg"
              className="bg-white text-orange-600 hover:bg-gray-100 font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              onClick={handleUrgencyCTAClick}
            >
              Claim This Deal Now
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Offers Grid */}
          <div className="lg:col-span-2">
            <div className="grid md:grid-cols-3 gap-4">
              {offers.map((offer, index) => {
                const Icon = offer.icon;
                return (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <Icon className="w-8 h-8 text-yellow-300 mb-3" />
                    <h4 className="font-bold text-white mb-2">{offer.title}</h4>
                    <p className="text-sm text-white/90 mb-3">{offer.description}</p>
                    {offer.originalPrice && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg line-through text-white/60">{offer.originalPrice}</span>
                        <span className="text-xl font-bold text-yellow-300">{offer.salePrice}</span>
                      </div>
                    )}
                    {offer.value && (
                      <div className="text-sm font-medium text-yellow-300">{offer.value}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Social Proof Ticker */}
        <div className="mt-8 bg-black/20 rounded-full px-6 py-3 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-4 text-white">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <div className="text-sm font-medium transition-all duration-500">
              "{testimonialQuotes[currentQuote].text}"
            </div>
            <div className="text-xs text-white/80">
              - {testimonialQuotes[currentQuote].author}, {testimonialQuotes[currentQuote].role}
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="mt-6 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-white text-sm">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4" />
              <span>Limited quantity available</span>
            </div>
            <div className="flex items-center gap-2">
              <FireIcon className="w-4 h-4" />
              <span>347 people are viewing this offer</span>
            </div>
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="w-4 h-4" />
              <span>Price increases at midnight</span>
            </div>
          </div>
        </div>

        {/* Scarcity Indicator */}
        <div className="mt-4 max-w-md mx-auto">
          <div className="flex justify-between text-white text-xs mb-2">
            <span>Spots remaining:</span>
            <span>47 / 500</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-yellow-300 to-red-400 h-2 rounded-full transition-all duration-1000"
              style={{ width: '9.4%' }}
            ></div>
          </div>
          <div className="text-center text-white text-xs mt-2">
            Only 47 spots left at this price!
          </div>
        </div>
      </div>

      {/* Floating CTA Button (Mobile) */}
      <div className="fixed bottom-4 left-4 right-4 z-50 lg:hidden">
        <Button
          size="lg"
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-2xl animate-pulse"
          onClick={handleUrgencyCTAClick}
        >
          🔥 Claim Deal - {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s Left
        </Button>
      </div>
    </div>
  );
}