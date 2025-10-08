import React from 'react';
import { useResponsive } from '../../hooks/useResponsive';

interface ResponsiveCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
}

const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  title,
  subtitle,
  children,
  icon: Icon,
  onClick,
  className = '',
  variant = 'default',
  size = 'md',
  loading = false,
  actions,
  footer,
}) => {
  const { isMobile } = useResponsive();

  const getVariantClasses = () => {
    switch (variant) {
      case 'elevated':
        return 'shadow-medium hover:shadow-strong';
      case 'outlined':
        return 'border-2 border-gray-200 hover:border-gray-300';
      case 'glass':
        return 'bg-white/60 backdrop-blur-sm border border-white/50';
      default:
        return 'shadow-soft hover:shadow-medium';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'p-3 sm:p-4';
      case 'lg':
        return 'p-6 sm:p-8 lg:p-10';
      default:
        return 'p-4 sm:p-6 lg:p-8';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-6 h-6 sm:w-8 sm:h-8';
      case 'lg':
        return 'w-10 h-10 sm:w-12 sm:h-12';
      default:
        return 'w-8 h-8 sm:w-10 sm:h-10';
    }
  };

  const cardClasses = `
    dashboard-card-responsive
    ${getVariantClasses()}
    ${onClick ? 'cursor-pointer hover:-translate-y-1' : ''}
    ${className}
  `;

  const contentClasses = getSizeClasses();

  if (loading) {
    return (
      <div className={cardClasses}>
        <div className={contentClasses}>
          <div className="animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gray-200 rounded-full w-8 h-8 sm:w-10 sm:h-10"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cardClasses} onClick={onClick}>
      <div className={contentClasses}>
        {/* Header */}
        {(title || subtitle || Icon || actions) && (
          <div className="flex items-start justify-between mb-4 sm:mb-6">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {Icon && (
                <div className={`${getIconSize()} bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-1/2 h-1/2 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                {title && (
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-sm sm:text-base text-gray-600 truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            {actions && (
              <div className="flex-shrink-0 ml-3">
                {actions}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="space-y-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// Specialized card variants
export const StatCard: React.FC<{
  title: string;
  value: string | number;
  change?: { value: number; type: 'increase' | 'decrease' };
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}> = ({ title, value, change, icon: Icon, className = '' }) => {
  const { isMobile } = useResponsive();

  return (
    <ResponsiveCard
      title={title}
      icon={Icon}
      className={className}
      size={isMobile ? 'sm' : 'md'}
    >
      <div className="space-y-2">
        <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
          {value}
        </div>
        {change && (
          <div className={`flex items-center space-x-1 text-sm ${
            change.type === 'increase' ? 'text-green-600' : 'text-red-600'
          }`}>
            <span className={change.type === 'increase' ? 'text-green-500' : 'text-red-500'}>
              {change.type === 'increase' ? '↗' : '↘'}
            </span>
            <span>{Math.abs(change.value)}%</span>
            <span>from last month</span>
          </div>
        )}
      </div>
    </ResponsiveCard>
  );
};

export const ActionCard: React.FC<{
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  className?: string;
}> = ({ title, description, icon: Icon, onClick, className = '' }) => {
  return (
    <ResponsiveCard
      title={title}
      subtitle={description}
      icon={Icon}
      onClick={onClick}
      className={`hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 ${className}`}
    >
      <div className="text-sm text-gray-600">
        Click to access
      </div>
    </ResponsiveCard>
  );
};

export default ResponsiveCard;
