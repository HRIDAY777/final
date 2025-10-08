import { useState, useEffect } from 'react';

export interface Breakpoint {
  xs: boolean;
  sm: boolean;
  md: boolean;
  lg: boolean;
  xl: boolean;
  '2xl': boolean;
  '3xl': boolean;
}

export interface ResponsiveConfig {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  breakpoint: Breakpoint;
  width: number;
  height: number;
}

const getBreakpoint = (width: number): Breakpoint => ({
  xs: width >= 475,
  sm: width >= 640,
  md: width >= 768,
  lg: width >= 1024,
  xl: width >= 1280,
  '2xl': width >= 1536,
  '3xl': width >= 1920,
});

export const useResponsive = (): ResponsiveConfig => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const breakpoint = getBreakpoint(windowSize.width);

  return {
    isMobile: !breakpoint.sm,
    isTablet: breakpoint.sm && !breakpoint.lg,
    isDesktop: breakpoint.lg && !breakpoint['2xl'],
    isLargeDesktop: breakpoint['2xl'],
    breakpoint,
    width: windowSize.width,
    height: windowSize.height,
  };
};

export const useIsMobile = (): boolean => {
  const { isMobile } = useResponsive();
  return isMobile;
};

export const useIsTablet = (): boolean => {
  const { isTablet } = useResponsive();
  return isTablet;
};

export const useIsDesktop = (): boolean => {
  const { isDesktop } = useResponsive();
  return isDesktop;
};

export const useIsLargeDesktop = (): boolean => {
  const { isLargeDesktop } = useResponsive();
  return isLargeDesktop;
};

export const useBreakpoint = (breakpoint: keyof Breakpoint): boolean => {
  const { breakpoint: bp } = useResponsive();
  return bp[breakpoint];
};
