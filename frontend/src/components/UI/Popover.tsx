import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';

interface PopoverProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface PopoverTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

interface PopoverContentProps {
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
}

const Popover: React.FC<PopoverProps> = ({ children, open, onOpenChange }) => {
  return <div className="relative inline-block text-left">{children}</div>;
};

const PopoverTrigger: React.FC<PopoverTriggerProps> = ({ children, asChild, className }) => {
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

const PopoverContent: React.FC<PopoverContentProps> = ({ children, className, align = 'end' }) => {
  const alignClasses = {
    start: 'left-0',
    center: 'left-1/2 transform -translate-x-1/2',
    end: 'right-0'
  };

  return (
    <div className={cn(
      "absolute mt-2 w-80 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50",
      alignClasses[align],
      className
    )}>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export { Popover, PopoverTrigger, PopoverContent };
