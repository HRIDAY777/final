import React, { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  mobileStyle?: 'fullscreen' | 'bottomSheet' | 'centered';
  showCloseButton?: boolean;
  className?: string;
}

/**
 * 100% Responsive Modal Component
 * - Desktop: Centered modal with backdrop
 * - Mobile: Bottom sheet or fullscreen
 */
const ResponsiveModal: React.FC<ResponsiveModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  mobileStyle = 'bottomSheet',
  showCloseButton = true,
  className = ''
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'sm:max-w-md',
    md: 'sm:max-w-lg md:max-w-xl',
    lg: 'sm:max-w-2xl md:max-w-3xl lg:max-w-4xl',
    xl: 'sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl',
    full: 'sm:max-w-full'
  };

  const mobileStyleClasses = {
    fullscreen: 'fixed inset-0 sm:inset-auto sm:relative sm:my-8',
    bottomSheet: 'fixed bottom-0 left-0 right-0 rounded-t-2xl sm:relative sm:rounded-2xl sm:my-8',
    centered: 'relative my-8 mx-4'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-end sm:items-center justify-center">
        <div
          className={`
            ${mobileStyleClasses[mobileStyle]}
            ${sizeClasses[size]}
            w-full
            max-h-screen sm:max-h-[90vh]
            bg-white
            shadow-xl
            overflow-y-auto
            ${className}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4 md:px-6 md:py-5 border-b border-gray-200">
              {title && (
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
                  {title}
                </h3>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-auto"
                >
                  <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveModal;
