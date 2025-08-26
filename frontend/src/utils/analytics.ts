// Analytics utility for tracking user interactions
import * as React from 'react';

interface AnalyticsEvent {
  event: string;
  category?: string;
  action?: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
  timestamp?: number;
}

interface PageView {
  page_title: string;
  page_location: string;
  page_path: string;
  referrer?: string;
}

class Analytics {
  private isEnabled: boolean = true;
  private queue: AnalyticsEvent[] = [];
  private sessionId: string;
  private userId?: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeAnalytics();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeAnalytics(): void {
    // Check if analytics is enabled
    this.isEnabled = localStorage.getItem('analytics_enabled') !== 'false';
    
    // Initialize Google Analytics if available
    if (typeof window.gtag !== 'undefined') {
      this.setupGoogleAnalytics();
    }

    // Track page views
    this.trackPageView();

    // Track user engagement
    this.trackUserEngagement();
  }

  private setupGoogleAnalytics(): void {
    // Configure Google Analytics
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname,
      custom_map: {
        'custom_parameter_1': 'user_type',
        'custom_parameter_2': 'school_id',
      }
    });
  }

  // Track page view
  public trackPageView(pageTitle?: string): void {
    const pageView: PageView = {
      page_title: pageTitle || document.title,
      page_location: window.location.href,
      page_path: window.location.pathname,
      referrer: document.referrer,
    };

    this.sendEvent('page_view', 'navigation', 'page_view', pageView.page_title, undefined, pageView);
  }

  // Track custom event
  public trackEvent(
    event: string,
    category?: string,
    action?: string,
    label?: string,
    value?: number,
    properties?: Record<string, any>
  ): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      category,
      action,
      label,
      value,
      properties,
      timestamp: Date.now(),
    };

    this.queue.push(analyticsEvent);
    this.sendEvent(event, category, action, label, value, properties);
  }

  // Track user action
  public trackUserAction(action: string, details?: Record<string, any>): void {
    this.trackEvent('user_action', 'user_interaction', action, undefined, undefined, details);
  }

  // Track form submission
  public trackFormSubmission(formName: string, success: boolean, details?: Record<string, any>): void {
    this.trackEvent(
      'form_submit',
      'form',
      'submit',
      formName,
      success ? 1 : 0,
      { ...details, success }
    );
  }

  // Track button click
  public trackButtonClick(buttonName: string, location?: string): void {
    this.trackEvent('button_click', 'ui', 'click', buttonName, undefined, { location });
  }

  // Track navigation
  public trackNavigation(from: string, to: string): void {
    this.trackEvent('navigation', 'navigation', 'navigate', `${from} -> ${to}`);
  }

  // Track search
  public trackSearch(query: string, resultsCount?: number): void {
    this.trackEvent('search', 'search', 'search', query, resultsCount);
  }

  // Track error
  public trackError(error: string, errorCode?: string, details?: Record<string, any>): void {
    this.trackEvent('error', 'error', 'error', error, undefined, { errorCode, ...details });
  }

  // Track performance
  public trackPerformance(metric: string, value: number, unit: string = 'ms'): void {
    this.trackEvent('performance', 'performance', metric, unit, value);
  }

  // Track feature usage
  public trackFeatureUsage(feature: string, action: string, details?: Record<string, any>): void {
    this.trackEvent('feature_usage', 'feature', action, feature, undefined, details);
  }

  // Track user engagement
  private trackUserEngagement(): void {
    let startTime = Date.now();
    let isActive = true;

    // Track time on page
    const trackTimeOnPage = () => {
      if (isActive) {
        const timeOnPage = Date.now() - startTime;
        this.trackPerformance('time_on_page', timeOnPage);
      }
    };

    // Track user activity
    const resetTimer = () => {
      if (!isActive) {
        isActive = true;
        startTime = Date.now();
      }
    };

    // Track user inactivity
    const markInactive = () => {
      isActive = false;
    };

    // Add event listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    // Track when user becomes inactive
    let inactivityTimer: NodeJS.Timeout;
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(markInactive, 30000); // 30 seconds
    };

    events.forEach(event => {
      document.addEventListener(event, resetInactivityTimer, true);
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        markInactive();
      } else {
        resetTimer();
      }
    });

    // Track before unload
    window.addEventListener('beforeunload', trackTimeOnPage);
  }

  // Set user ID
  public setUserId(userId: string): void {
    this.userId = userId;
    
    if (typeof window.gtag !== 'undefined') {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        user_id: userId,
      });
    }
  }

  // Set user properties
  public setUserProperties(properties: Record<string, any>): void {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('set', 'user_properties', properties);
    }
  }

  // Enable/disable analytics
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    localStorage.setItem('analytics_enabled', enabled.toString());
  }

  // Get analytics status
  public isAnalyticsEnabled(): boolean {
    return this.isEnabled;
  }

  // Send event to analytics services
  private sendEvent(
    event: string,
    category?: string,
    action?: string,
    label?: string,
    value?: number,
    properties?: Record<string, any>
  ): void {
    if (!this.isEnabled) return;

    // Send to Google Analytics
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', event, {
        event_category: category,
        event_action: action,
        event_label: label,
        value: value,
        ...properties,
        session_id: this.sessionId,
        user_id: this.userId,
        timestamp: Date.now(),
      });
    }

    // Send to custom analytics endpoint
    this.sendToCustomEndpoint({
      event,
      category,
      action,
      label,
      value,
      properties,
      session_id: this.sessionId,
      user_id: this.userId,
      timestamp: Date.now(),
      page_url: window.location.href,
      user_agent: navigator.userAgent,
    });
  }

  // Send to custom analytics endpoint
  private async sendToCustomEndpoint(data: any): Promise<void> {
    try {
      await fetch('/api/analytics/events/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.warn('Failed to send analytics event:', error);
    }
  }

  // Get analytics queue
  public getQueue(): AnalyticsEvent[] {
    return [...this.queue];
  }

  // Clear analytics queue
  public clearQueue(): void {
    this.queue = [];
  }

  // Generate analytics report
  public generateReport(): string {
    const events = this.getQueue();
    const eventCounts = events.reduce((acc, event) => {
      acc[event.event] = (acc[event.event] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return `
Analytics Report:
================
Session ID: ${this.sessionId}
User ID: ${this.userId || 'Anonymous'}
Total Events: ${events.length}
Analytics Enabled: ${this.isEnabled}

Event Summary:
${Object.entries(eventCounts)
  .map(([event, count]) => `- ${event}: ${count}`)
  .join('\n')}

Recent Events:
${events
  .slice(-10)
  .map(event => `- ${event.timestamp}: ${event.event} (${event.category}/${event.action})`)
  .join('\n')}
    `.trim();
  }
}

// Create singleton instance
export const analytics = new Analytics();

// React hook for analytics
export const useAnalytics = () => {
  return {
    trackEvent: analytics.trackEvent.bind(analytics),
    trackUserAction: analytics.trackUserAction.bind(analytics),
    trackFormSubmission: analytics.trackFormSubmission.bind(analytics),
    trackButtonClick: analytics.trackButtonClick.bind(analytics),
    trackNavigation: analytics.trackNavigation.bind(analytics),
    trackSearch: analytics.trackSearch.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackPerformance: analytics.trackPerformance.bind(analytics),
    trackFeatureUsage: analytics.trackFeatureUsage.bind(analytics),
    setUserId: analytics.setUserId.bind(analytics),
    setUserProperties: analytics.setUserProperties.bind(analytics),
    setEnabled: analytics.setEnabled.bind(analytics),
    isEnabled: analytics.isAnalyticsEnabled.bind(analytics),
  };
};

// Higher-order component for analytics
export const withAnalytics = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
): React.ComponentType<P> => {
  const WrappedWithAnalytics = (props: P) => {
    React.useEffect(() => {
      analytics.trackFeatureUsage(componentName, 'view');
    }, []);

    return React.createElement(WrappedComponent, props);
  };
  
  WrappedWithAnalytics.displayName = `withAnalytics(${componentName})`;
  return WrappedWithAnalytics;
};
