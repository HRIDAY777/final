import React from 'react';
import { cn } from '@/utils/cn';

interface SeparatorProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

const Separator: React.FC<SeparatorProps> = ({ className, orientation = 'horizontal' }) => {
  return (
    <div
      className={cn(
        "bg-gray-200",
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className
      )}
    />
  );
};

export default Separator;
