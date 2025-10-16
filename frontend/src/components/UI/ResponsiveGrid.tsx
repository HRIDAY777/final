import React from 'react';

interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    wide?: number;
  };
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * 100% Responsive Grid Component
 * Auto-adjusts columns based on screen size
 */
const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3, wide: 4 },
  gap = 'md',
  className = ''
}) => {
  const gapClasses = {
    xs: 'gap-2',
    sm: 'gap-3 sm:gap-4',
    md: 'gap-3 sm:gap-4 md:gap-5 lg:gap-6',
    lg: 'gap-4 sm:gap-5 md:gap-6 lg:gap-8',
    xl: 'gap-5 sm:gap-6 md:gap-8 lg:gap-10'
  };

  const colClasses = `
    grid
    grid-cols-${cols.mobile || 1}
    sm:grid-cols-${cols.tablet || 2}
    lg:grid-cols-${cols.desktop || 3}
    xl:grid-cols-${cols.wide || 4}
    ${gapClasses[gap]}
    ${className}
  `.trim();

  return (
    <div className={colClasses}>
      {children}
    </div>
  );
};

export default ResponsiveGrid;


