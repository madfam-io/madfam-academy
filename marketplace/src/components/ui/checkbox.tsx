import { forwardRef } from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';

export interface CheckboxProps {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ id, checked, onCheckedChange, disabled, className, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        <div
          className={cn(
            'h-4 w-4 rounded border-2 border-border bg-background flex items-center justify-center transition-colors',
            checked && 'bg-primary border-primary',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
        >
          {checked && <CheckIcon className="h-3 w-3 text-primary-foreground" />}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';