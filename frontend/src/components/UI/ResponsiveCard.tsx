import React from 'react';

interface ResponsiveCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

/**
 * 100% Responsive Card Component
 * Adapts padding, shadows, and layout for all screen sizes
 */
const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  title,
  subtitle,
  headerAction,
  className = '',
  padding = 'md',
  hover = true,
  clickable = false,
  onClick
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-5 md:p-6',
    lg: 'p-5 sm:p-6 md:p-8'
  };

  const hoverClasses = hover ? 'hover:shadow-md transition-shadow duration-200' : '';
  const clickableClasses = clickable || onClick ? 'cursor-pointer active:scale-98 transition-transform' : '';

  return (
    <div
      onClick={onClick}
      className={`
        bg-white 
        rounded-lg sm:rounded-xl lg:rounded-2xl 
        shadow-sm 
        ${hoverClasses}
        ${clickableClasses}
        ${className}
      `}
    >
      {/* Header */}
      {(title || headerAction) && (
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 border-b border-gray-200 ${padding === 'none' ? 'p-4 sm:p-5' : paddingClasses[padding]} pb-3 sm:pb-4`}>
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-600 truncate">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && (
            <div className="flex-shrink-0">
              {headerAction}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className={padding === 'none' ? '' : paddingClasses[padding]}>
        {children}
      </div>
    </div>
  );
};

export default ResponsiveCard;
