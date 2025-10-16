import React from 'react';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Responsive Container Component
 * Automatically adjusts padding and max-width based on screen size
 */
const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  size = 'lg',
  padding = 'md'
}) => {
  const sizeClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    full: 'max-w-full'
  };

  const paddingClasses = {
    none: '',
    sm: 'px-3 py-3 sm:px-4 sm:py-4 md:px-5 md:py-5',
    md: 'px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6 lg:px-8 lg:py-8',
    lg: 'px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8 lg:px-10 lg:py-10',
    xl: 'px-5 py-6 sm:px-8 sm:py-8 md:px-10 md:py-10 lg:px-12 lg:py-12'
  };

  return (
    <div className={`w-full ${sizeClasses[size]} mx-auto ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
};

export default ResponsiveContainer;

