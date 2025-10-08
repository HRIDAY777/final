import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useResponsive } from '../../hooks/useResponsive';

interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

const ResponsiveModal: React.FC<ResponsiveModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = '',
}) => {
  const { isMobile } = useResponsive();

  const getSizeClasses = () => {
    const baseClasses = 'w-full transform overflow-hidden rounded-xl sm:rounded-2xl bg-white shadow-strong transition-all duration-200';
    
    if (isMobile) {
      return `${baseClasses} mx-4 max-h-[90vh]`;
    }

    const sizeMap = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-xl',
      xl: 'max-w-2xl',
      '2xl': 'max-w-4xl',
      full: 'max-w-7xl',
    };

    return `${baseClasses} ${sizeMap[size]}`;
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="modal-responsive"
        onClose={closeOnOverlayClick ? onClose : () => {}}
      >
        <div className="modal-content-responsive">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className={`modal-panel-responsive ${getSizeClasses()} ${className}`}>
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                  {title && (
                    <Dialog.Title className="text-lg sm:text-xl font-semibold text-gray-900">
                      {title}
                    </Dialog.Title>
                  )}
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="p-2 rounded-xl hover:bg-gray-100/80 transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5 text-gray-600" />
                    </button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-4 sm:p-6">
                {children}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default ResponsiveModal;
