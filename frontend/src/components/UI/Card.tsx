import React from 'react';

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className = '', children }) => (
  <div className={`bg-white dark:bg-secondary-800 rounded-lg shadow-soft p-6 transition-transform duration-200 hover:shadow-medium hover:-translate-y-0.5 ${className}`}>{children}</div>
);

export const CardHeader: React.FC<{ title?: string; subtitle?: string; right?: React.ReactNode; children?: React.ReactNode }>
  = ({ title, subtitle, right, children }) => (
  <div className="flex items-center justify-between mb-4">
    {title ? (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        {subtitle && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>}
      </div>
    ) : children}
    {right}
  </div>
);

export const CardContent: React.FC<{ className?: string; children: React.ReactNode }> = ({ 
  className = '', 
  children 
}) => (
  <div className={className}>{children}</div>
);

export const CardTitle: React.FC<{ className?: string; children: React.ReactNode }> = ({ 
  className = '', 
  children 
}) => (
  <h3 className={`text-lg font-semibold text-gray-900 dark:text-gray-100 ${className}`}>{children}</h3>
); 