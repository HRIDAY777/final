import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useResponsive } from '../../hooks/useResponsive';

interface NavigationItem {
  name: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: NavigationItem[];
}

interface ResponsiveNavigationProps {
  items: NavigationItem[];
  logo?: React.ReactNode;
  className?: string;
  variant?: 'header' | 'sidebar' | 'tabs';
}

const ResponsiveNavigation: React.FC<ResponsiveNavigationProps> = ({
  items,
  logo,
  className = '',
  variant = 'header',
}) => {
  const { isMobile, isTablet } = useResponsive();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const toggleItem = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const renderNavItem = (item: NavigationItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.name);
    const isItemActive = isActive(item.path);
    const isAnyChildActive = hasChildren && item.children!.some(child => isActive(child.path));

    const baseClasses = `
      nav-item-responsive
      ${isItemActive || isAnyChildActive ? 'active' : ''}
      ${level > 0 ? 'ml-4' : ''}
    `;

    if (hasChildren) {
      return (
        <div key={item.name}>
          <button
            onClick={() => toggleItem(item.name)}
            className={baseClasses}
          >
            <div className="flex items-center space-x-3">
              {item.icon && <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />}
              <span>{item.name}</span>
            </div>
            <div className="flex items-center">
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
          {isExpanded && (
            <div className="mt-2 space-y-1">
              {item.children!.map(child => renderNavItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.name}
        to={item.path}
        className={baseClasses}
        onClick={() => setIsOpen(false)}
      >
        <div className="flex items-center space-x-3">
          {item.icon && <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />}
          <span>{item.name}</span>
        </div>
      </Link>
    );
  };

  if (variant === 'tabs') {
    return (
      <div className={`flex space-x-1 overflow-x-auto ${className}`}>
        {items.map(item => (
          <Link
            key={item.name}
            to={item.path}
            className={`
              flex-shrink-0 px-3 sm:px-4 py-2 text-sm sm:text-base font-medium rounded-lg transition-all duration-200
              ${isActive(item.path)
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }
            `}
          >
            {item.name}
          </Link>
        ))}
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <nav className={`space-y-2 ${className}`}>
        {items.map(item => renderNavItem(item))}
      </nav>
    );
  }

  // Header variant
  if (isMobile) {
    return (
      <div className={className}>
        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl hover:bg-gray-100/80 transition-all duration-200"
        >
          {isOpen ? (
            <XMarkIcon className="w-5 h-5 text-gray-700" />
          ) : (
            <Bars3Icon className="w-5 h-5 text-gray-700" />
          )}
        </button>

        {/* Mobile menu overlay */}
        {isOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div 
              className="fixed inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                {logo}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl hover:bg-gray-100/80 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <nav className="p-4 space-y-2 overflow-y-auto">
                {items.map(item => renderNavItem(item))}
              </nav>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop header navigation
  return (
    <nav className={`hidden lg:flex items-center space-x-1 ${className}`}>
      {items.map(item => {
        const isItemActive = isActive(item.path);
        
        return (
          <Link
            key={item.name}
            to={item.path}
            className={`
              px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
              ${isItemActive
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }
            `}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
};

export default ResponsiveNavigation;
