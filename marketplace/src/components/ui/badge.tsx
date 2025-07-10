import * as React from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = {
  default: 'border-transparent bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
  destructive: 'border-transparent bg-red-600 text-white hover:bg-red-700',
  outline: 'text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600',
  success: 'border-transparent bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  warning: 'border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  info: 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof badgeVariants;
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div 
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        badgeVariants[variant],
        className
      )} 
      {...props} 
    />
  );
}

export { Badge, badgeVariants };