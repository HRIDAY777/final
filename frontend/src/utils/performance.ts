// Performance monitoring utility
import * as React from 'react';

// Declare gtag for Google Analytics
declare global {
  interface Window {
    gtag?: (command: string, action: string, params: any) => void;
  }
}

interface PerformanceMetrics {
  pageLoadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    pageLoadTime: 0,
    domContentLoaded: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    cumulativeLayoutShift: 0,
    firstInputDelay: 0,
  };

  constructor() {
    this.initializeMetrics();
    this.setupObservers();
  }

  private initializeMetrics(): void {
    // Page load metrics
    if (performance.timing) {
      this.metrics.pageLoadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      this.metrics.domContentLoaded = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
    }

    // Navigation Timing API v2
    if ('PerformanceNavigationTiming' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.startTime;
        this.metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.startTime;
      }
    }
  }

  private setupObservers(): void {
    // First Contentful Paint
    if ('PerformanceObserver' in window) {
      // FCP Observer
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcp = entries[entries.length - 1];
        this.metrics.firstContentfulPaint = fcp.startTime;
        this.logMetric('FCP', fcp.startTime);
      });
      fcpObserver.observe({ entryTypes: ['paint'] });

      // LCP Observer
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lcp = entries[entries.length - 1];
        this.metrics.largestContentfulPaint = lcp.startTime;
        this.logMetric('LCP', lcp.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // CLS Observer
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShiftEntry = entry as any;
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value;
          }
        }
        this.metrics.cumulativeLayoutShift = clsValue;
        this.logMetric('CLS', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // FID Observer
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fid = entries[entries.length - 1] as any;
        this.metrics.firstInputDelay = fid.processingStart - fid.startTime;
        this.logMetric('FID', this.metrics.firstInputDelay);
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    }
  }

  private logMetric(name: string, value: number): void {
    console.log(`Performance Metric - ${name}: ${value.toFixed(2)}ms`);
    
    // Send to analytics if available
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'performance_metric', {
        metric_name: name,
        metric_value: value,
        page_location: window.location.href,
      });
    }
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public getPageLoadTime(): number {
    return this.metrics.pageLoadTime;
  }

  public getFirstContentfulPaint(): number {
    return this.metrics.firstContentfulPaint;
  }

  public getLargestContentfulPaint(): number {
    return this.metrics.largestContentfulPaint;
  }

  public getCumulativeLayoutShift(): number {
    return this.metrics.cumulativeLayoutShift;
  }

  public getFirstInputDelay(): number {
    return this.metrics.firstInputDelay;
  }

  // Measure custom performance marks
  public mark(name: string): void {
    if ('performance' in window) {
      performance.mark(name);
    }
  }

  public measure(name: string, startMark: string, endMark: string): void {
    if ('performance' in window) {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name)[0];
        this.logMetric(name, measure.duration);
      } catch (error) {
        console.warn(`Failed to measure ${name}:`, error);
      }
    }
  }

  // Monitor API response times
  public monitorApiCall(url: string, startTime: number): void {
    const duration = performance.now() - startTime;
    this.logMetric(`API_${url}`, duration);
  }

  // Monitor component render times
  public monitorComponentRender(componentName: string, startTime: number): void {
    const duration = performance.now() - startTime;
    this.logMetric(`RENDER_${componentName}`, duration);
  }

  // Get performance score based on metrics
  public getPerformanceScore(): number {
    const scores = {
      fcp: this.getFCPScore(),
      lcp: this.getLCPScore(),
      cls: this.getCLSScore(),
      fid: this.getFIDScore(),
    };

    const averageScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
    return Math.round(averageScore);
  }

  private getFCPScore(): number {
    const fcp = this.metrics.firstContentfulPaint;
    if (fcp <= 1800) return 100;
    if (fcp <= 3000) return 75;
    if (fcp <= 4000) return 50;
    return 25;
  }

  private getLCPScore(): number {
    const lcp = this.metrics.largestContentfulPaint;
    if (lcp <= 2500) return 100;
    if (lcp <= 4000) return 75;
    if (lcp <= 6000) return 50;
    return 25;
  }

  private getCLSScore(): number {
    const cls = this.metrics.cumulativeLayoutShift;
    if (cls <= 0.1) return 100;
    if (cls <= 0.25) return 75;
    if (cls <= 0.4) return 50;
    return 25;
  }

  private getFIDScore(): number {
    const fid = this.metrics.firstInputDelay;
    if (fid <= 100) return 100;
    if (fid <= 300) return 75;
    if (fid <= 500) return 50;
    return 25;
  }

  // Generate performance report
  public generateReport(): string {
    const score = this.getPerformanceScore();
    const metrics = this.getMetrics();
    
    return `
Performance Report:
==================
Overall Score: ${score}/100

Metrics:
- Page Load Time: ${metrics.pageLoadTime.toFixed(2)}ms
- DOM Content Loaded: ${metrics.domContentLoaded.toFixed(2)}ms
- First Contentful Paint: ${metrics.firstContentfulPaint.toFixed(2)}ms
- Largest Contentful Paint: ${metrics.largestContentfulPaint.toFixed(2)}ms
- Cumulative Layout Shift: ${metrics.cumulativeLayoutShift.toFixed(3)}
- First Input Delay: ${metrics.firstInputDelay.toFixed(2)}ms

Recommendations:
${this.getRecommendations(score)}
    `.trim();
  }

  private getRecommendations(score: number): string {
    if (score >= 90) {
      return "Excellent performance! Keep up the good work.";
    } else if (score >= 70) {
      return "Good performance. Consider optimizing images and reducing bundle size.";
    } else if (score >= 50) {
      return "Fair performance. Focus on improving Core Web Vitals.";
    } else {
      return "Poor performance. Immediate optimization needed for Core Web Vitals.";
    }
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for monitoring component performance
export const usePerformanceMonitor = (componentName: string) => {
  const startTime = React.useRef(performance.now());
  
  React.useEffect(() => {
    performanceMonitor.monitorComponentRender(componentName, startTime.current);
  }, [componentName]);
};

// Higher-order component for performance monitoring
export const withPerformanceMonitoring = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
): React.ComponentType<P> => {
  const WrappedWithPerformance = (props: P) => {
    usePerformanceMonitor(componentName);
    return React.createElement(WrappedComponent, props);
  };
  
  WrappedWithPerformance.displayName = `withPerformanceMonitoring(${componentName})`;
  return WrappedWithPerformance;
};
