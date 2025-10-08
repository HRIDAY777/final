import React from 'react';
import { cn } from '@/utils/cn';

interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

interface DropdownMenuContentProps {
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  return <div className="relative inline-block text-left">{children}</div>;
};

const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({ children, className, asChild }) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      className: cn("inline-flex items-center justify-center", className),
      ...children.props
    });
  }
  
  return (
    <button className={cn("inline-flex items-center justify-center", className)}>
      {children}
    </button>
  );
};

const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({ children, className, align = 'end' }) => {
  const alignClasses = {
    start: 'left-0',
    center: 'left-1/2 transform -translate-x-1/2',
    end: 'right-0'
  };

  return (
    <div className={cn(
      "absolute mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50",
      alignClasses[align],
      className
    )}>
      <div className="py-1">
        {children}
      </div>
    </div>
  );
};

const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({ children, className, onClick, disabled }) => {
  return (
    <button
      className={cn(
        "block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem };
