import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from './Button';

interface ErrorMessageProps {
  title?: string;
  message?: string;
  error?: Error | string;
  showRetry?: boolean;
  showHome?: boolean;
  onRetry?: () => void;
  onGoHome?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Something went wrong',
  message,
  error,
  showRetry = true,
  showHome = false,
  onRetry,
  onGoHome,
  className = ''
}) => {
  const errorMessage = message || (typeof error === 'string' ? error : error?.message) || 'An unexpected error occurred';

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h2>
      
      <p className="text-gray-600 mb-6 max-w-md">
        {errorMessage}
      </p>
      
      <div className="flex gap-3">
        {showRetry && onRetry && (
          <Button
            onClick={onRetry}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Try Again
          </Button>
        )}
        
        {showHome && onGoHome && (
          <Button
            variant="outline"
            onClick={onGoHome}
            leftIcon={<Home className="w-4 h-4" />}
          >
            Go Home
          </Button>
        )}
      </div>
    </div>
  );
};