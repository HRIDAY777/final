import React from 'react';

export const Skeleton: React.FC<{ className?: string }>
  = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200/80 dark:bg-secondary-700 rounded ${className}`} />
);

export const SkeletonText: React.FC<{ lines?: number }>
  = ({ lines = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className={`h-3 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
    ))}
  </div>
);


