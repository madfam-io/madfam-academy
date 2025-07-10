import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  variant?: 'icon' | 'full';
}

export function Logo({ className, variant = 'icon' }: LogoProps) {
  if (variant === 'full') {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">M</span>
        </div>
        <span className="font-bold text-xl">MADFAM Academy</span>
      </div>
    );
  }

  return (
    <div className={cn(
      'w-8 h-8 bg-gradient-to-br from-primary to-primary-600 rounded-lg flex items-center justify-center',
      className
    )}>
      <span className="text-white font-bold text-sm">M</span>
    </div>
  );
}