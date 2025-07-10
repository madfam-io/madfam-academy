import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface SliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export function Slider({ 
  value, 
  onValueChange, 
  min = 0, 
  max = 100, 
  step = 1, 
  className 
}: SliderProps) {
  const [isDragging, setIsDragging] = useState<number | null>(null);

  const handleMouseDown = useCallback((index: number) => {
    setIsDragging(index);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging === null) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newValue = min + percentage * (max - min);
    const steppedValue = Math.round(newValue / step) * step;

    const newValues = [...value];
    newValues[isDragging] = Math.max(min, Math.min(max, steppedValue));
    
    // Ensure values don't cross over
    if (isDragging === 0 && newValues[0] > newValues[1]) {
      newValues[0] = newValues[1];
    } else if (isDragging === 1 && newValues[1] < newValues[0]) {
      newValues[1] = newValues[0];
    }

    onValueChange(newValues);
  }, [isDragging, min, max, step, value, onValueChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  const getPercentage = (val: number) => ((val - min) / (max - min)) * 100;

  return (
    <div
      className={cn('relative h-6 flex items-center', className)}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Track */}
      <div className="relative w-full h-2 bg-muted rounded-full">
        {/* Range */}
        <div
          className="absolute h-2 bg-primary rounded-full"
          style={{
            left: `${getPercentage(value[0])}%`,
            width: `${getPercentage(value[1]) - getPercentage(value[0])}%`,
          }}
        />
        
        {/* Thumbs */}
        {value.map((val, index) => (
          <div
            key={index}
            className="absolute w-4 h-4 bg-primary rounded-full border-2 border-background shadow-sm cursor-pointer hover:scale-110 transition-transform"
            style={{
              left: `${getPercentage(val)}%`,
              transform: 'translateX(-50%)',
              top: '50%',
              marginTop: '-8px',
            }}
            onMouseDown={() => handleMouseDown(index)}
          />
        ))}
      </div>
    </div>
  );
}