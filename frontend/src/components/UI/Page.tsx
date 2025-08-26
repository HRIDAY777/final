import React from 'react';

export const PageHeader: React.FC<{ title: string; subtitle?: string; actions?: React.ReactNode }>
  = ({ title, subtitle, actions }) => (
  <div className="mb-6 flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
      {subtitle && <p className="text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>}
    </div>
    {actions}
  </div>
);

export const Section: React.FC<{ title: string; children: React.ReactNode }>
  = ({ title, children }) => (
  <div>
    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">{title}</h2>
    {children}
  </div>
);

export const EmptyState: React.FC<{ title: string; description?: string }>
  = ({ title, description }) => (
  <div className="text-center text-gray-500 py-10">
    <p className="font-medium text-gray-700 dark:text-gray-300">{title}</p>
    {description && <p className="text-sm mt-1">{description}</p>}
  </div>
);


