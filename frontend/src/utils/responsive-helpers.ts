/**
 * Responsive Helper Utilities
 * Functions to help with responsive design calculations
 */

/**
 * Get responsive value based on current screen width
 */
export const getResponsiveValue = <T,>(
  width: number,
  values: {
    mobile?: T;
    tablet?: T;
    desktop?: T;
    wide?: T;
    default: T;
  }
): T => {
  if (width < 768 && values.mobile !== undefined) return values.mobile;
  if (width >= 768 && width < 1024 && values.tablet !== undefined) return values.tablet;
  if (width >= 1024 && width < 1536 && values.desktop !== undefined) return values.desktop;
  if (width >= 1536 && values.wide !== undefined) return values.wide;
  return values.default;
};

/**
 * Calculate responsive font size
 */
export const getResponsiveFontSize = (baseSize: number, width: number): number => {
  if (width < 640) return baseSize * 0.875; // 87.5% on mobile
  if (width < 768) return baseSize * 0.9375; // 93.75% on small tablet
  return baseSize;
};

/**
 * Calculate responsive spacing
 */
export const getResponsiveSpacing = (baseSpacing: number, width: number): number => {
  if (width < 640) return baseSpacing * 0.75; // 75% on mobile
  if (width < 1024) return baseSpacing * 0.875; // 87.5% on tablet
  return baseSpacing;
};

/**
 * Get number of grid columns based on screen width
 */
export const getGridColumns = (
  width: number,
  config: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    wide?: number;
  } = {}
): number => {
  const defaults = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
    wide: 4
  };

  const cols = { ...defaults, ...config };

  if (width < 768) return cols.mobile;
  if (width < 1024) return cols.tablet;
  if (width < 1536) return cols.desktop;
  return cols.wide;
};

/**
 * Check if device is touch-enabled
 */
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
};

/**
 * Get safe area insets for mobile devices (iOS notch, etc.)
 */
export const getSafeAreaInsets = () => {
  if (typeof window === 'undefined' || typeof getComputedStyle === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  const style = getComputedStyle(document.documentElement);
  
  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0')
  };
};

/**
 * Format number for mobile display (shorter format)
 */
export const formatNumberResponsive = (num: number, isMobile: boolean): string => {
  if (!isMobile) return num.toLocaleString();
  
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

/**
 * Truncate text based on screen size
 */
export const truncateTextResponsive = (
  text: string,
  maxLength: { mobile: number; tablet: number; desktop: number },
  width: number
): string => {
  let limit = maxLength.desktop;
  if (width < 768) limit = maxLength.mobile;
  else if (width < 1024) limit = maxLength.tablet;

  if (text.length <= limit) return text;
  return text.substring(0, limit) + '...';
};

/**
 * Get responsive table page size
 */
export const getResponsivePageSize = (width: number): number => {
  if (width < 768) return 10; // Mobile: smaller pages
  if (width < 1024) return 15; // Tablet
  if (width < 1536) return 20; // Desktop
  return 25; // Wide screen
};

/**
 * Check if should use mobile layout
 */
export const shouldUseMobileLayout = (width: number = window.innerWidth): boolean => {
  return width < 768;
};

/**
 * Check if should use tablet layout
 */
export const shouldUseTabletLayout = (width: number = window.innerWidth): boolean => {
  return width >= 768 && width < 1024;
};

/**
 * Get responsive modal size class
 */
export const getResponsiveModalSize = (
  size: 'sm' | 'md' | 'lg' | 'xl',
  width: number
): string => {
  // On mobile, always use full width
  if (width < 640) return 'w-full max-w-full';
  
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg md:max-w-xl',
    lg: 'max-w-xl md:max-w-2xl lg:max-w-3xl',
    xl: 'max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl'
  };
  
  return sizes[size];
};

/**
 * Calculate responsive chart height
 */
export const getResponsiveChartHeight = (width: number): number => {
  if (width < 640) return 200;  // Mobile
  if (width < 768) return 250;  // Large mobile
  if (width < 1024) return 300; // Tablet
  if (width < 1280) return 350; // Small desktop
  return 400; // Desktop & above
};

/**
 * Get responsive button size classes
 */
export const getResponsiveButtonClass = (
  size: 'sm' | 'md' | 'lg' = 'md'
): string => {
  const sizes = {
    sm: 'px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm',
    md: 'px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3 text-sm sm:text-base',
    lg: 'px-4 py-2.5 sm:px-5 sm:py-3 md:px-6 md:py-3.5 text-base sm:text-lg'
  };
  
  return sizes[size];
};

/**
 * Debounce resize events for better performance
 */
export const debounce = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): void => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
};

