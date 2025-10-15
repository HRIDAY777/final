/**
 * Production monitoring and analytics utilities
 */
import { reportWebVitals } from 'web-vitals'

export interface PerformanceMetrics {
  name: string
  value: number
  delta: number
  id: string
  navigationType?: string
}

export interface UserAnalytics {
  userId?: string
  sessionId: string
  page: string
  timestamp: string
  userAgent: string
  viewport: {
    width: number
    height: number
  }
  referrer: string
}

export interface CustomEvent {
  name: string
  category: string
  action: string
  label?: string
  value?: number
  userId?: string
  sessionId: string
  timestamp: string
  metadata?: Record<string, any>
}

class MonitoringService {
  private isDevelopment = import.meta.env.DEV
  private isProduction = import.meta.env.PROD
  private sessionId: string
  private userId?: string
  private events: CustomEvent[] = []
  private maxEvents = 100

  constructor() {
    this.sessionId = this.generateSessionId()
    this.initializeWebVitals()
    this.trackPageView()
  }

  /**
   * Initialize web vitals monitoring
   */
  private initializeWebVitals(): void {
    if (this.isProduction) {
      reportWebVitals((metric: PerformanceMetrics) => {
        this.trackWebVital(metric)
      })
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    const stored = sessionStorage.getItem('monitoring_session_id')
    if (stored) return stored

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('monitoring_session_id', sessionId)
    return sessionId
  }

  /**
   * Set user ID for tracking
   */
  setUserId(userId: string): void {
    this.userId = userId
    localStorage.setItem('monitoring_user_id', userId)
  }

  /**
   * Get user ID
   */
  getUserId(): string | undefined {
    if (this.userId) return this.userId
    return localStorage.getItem('monitoring_user_id') || undefined
  }

  /**
   * Track page view
   */
  trackPageView(page?: string): void {
    const pageName = page || window.location.pathname
    const analytics: UserAnalytics = {
      userId: this.getUserId(),
      sessionId: this.sessionId,
      page: pageName,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      referrer: document.referrer
    }

    this.sendAnalytics(analytics)

    // Track in development
    if (this.isDevelopment) {
      console.log('Page view tracked:', analytics)
    }
  }

  /**
   * Track custom event
   */
  trackEvent(
    name: string,
    category: string,
    action: string,
    label?: string,
    value?: number,
    metadata?: Record<string, any>
  ): void {
    const event: CustomEvent = {
      name,
      category,
      action,
      label,
      value,
      userId: this.getUserId(),
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      metadata
    }

    this.events.push(event)

    // Limit events array size
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents)
    }

    this.sendEvent(event)

    // Track in development
    if (this.isDevelopment) {
      console.log('Event tracked:', event)
    }
  }

  /**
   * Track web vital metrics
   */
  private trackWebVital(metric: PerformanceMetrics): void {
    const event: CustomEvent = {
      name: 'web_vital',
      category: 'performance',
      action: metric.name,
      label: metric.id,
      value: Math.round(metric.value),
      userId: this.getUserId(),
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      metadata: {
        delta: metric.delta,
        navigationType: metric.navigationType
      }
    }

    this.sendEvent(event)

    // Log performance issues
    if (this.isDevelopment) {
      console.log('Web Vital:', metric.name, metric.value)
    }
  }

  /**
   * Track user interaction
   */
  trackInteraction(
    element: string,
    action: string,
    metadata?: Record<string, any>
  ): void {
    this.trackEvent(
      'user_interaction',
      'engagement',
      action,
      element,
      undefined,
      metadata
    )
  }

  /**
   * Track API call
   */
  trackApiCall(
    endpoint: string,
    method: string,
    status: number,
    duration: number,
    error?: string
  ): void {
    this.trackEvent(
      'api_call',
      'api',
      method,
      endpoint,
      duration,
      {
        status,
        error,
        success: status >= 200 && status < 300
      }
    )
  }

  /**
   * Track form submission
   */
  trackFormSubmission(
    formName: string,
    success: boolean,
    errors?: string[],
    fields?: string[]
  ): void {
    this.trackEvent(
      'form_submission',
      'forms',
      success ? 'success' : 'error',
      formName,
      success ? 1 : 0,
      {
        errors,
        fields,
        fieldCount: fields?.length
      }
    )
  }

  /**
   * Track search
   */
  trackSearch(query: string, results: number, filters?: Record<string, any>): void {
    this.trackEvent(
      'search',
      'engagement',
      'search',
      query,
      results,
      {
        filters,
        queryLength: query.length
      }
    )
  }

  /**
   * Track error
   */
  trackError(
    error: string,
    component?: string,
    metadata?: Record<string, any>
  ): void {
    this.trackEvent(
      'error',
      'errors',
      'occurred',
      component || 'unknown',
      undefined,
      {
        errorMessage: error,
        ...metadata
      }
    )
  }

  /**
   * Track performance
   */
  trackPerformance(
    operation: string,
    duration: number,
    metadata?: Record<string, any>
  ): void {
    this.trackEvent(
      'performance',
      'performance',
      operation,
      undefined,
      duration,
      metadata
    )
  }

  /**
   * Send analytics data
   */
  private async sendAnalytics(analytics: UserAnalytics): Promise<void> {
    if (!this.isProduction) return

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/analytics/page-view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analytics)
      })
    } catch (error) {
      // Silently fail
      console.warn('Analytics tracking failed:', error)
    }
  }

  /**
   * Send event data
   */
  private async sendEvent(event: CustomEvent): Promise<void> {
    if (!this.isProduction) return

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/analytics/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      })
    } catch (error) {
      // Silently fail
      console.warn('Event tracking failed:', error)
    }
  }

  /**
   * Flush pending events
   */
  async flushEvents(): Promise<void> {
    if (this.events.length === 0) return

    const eventsToSend = [...this.events]
    this.events = []

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/analytics/events/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events: eventsToSend })
      })
    } catch (error) {
      // Re-add events to queue if sending failed
      this.events.unshift(...eventsToSend)
      console.warn('Event batch sending failed:', error)
    }
  }

  /**
   * Get session info
   */
  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      userId: this.getUserId(),
      eventsCount: this.events.length
    }
  }

  /**
   * Clear session data
   */
  clearSession(): void {
    this.sessionId = this.generateSessionId()
    this.events = []
    sessionStorage.removeItem('monitoring_session_id')
    localStorage.removeItem('monitoring_user_id')
  }
}

// Create singleton instance
export const monitoring = new MonitoringService()

// Export types
export type { PerformanceMetrics, UserAnalytics, CustomEvent }

// React Hook for monitoring
export const useMonitoring = () => {
  return {
    trackEvent: monitoring.trackEvent.bind(monitoring),
    trackInteraction: monitoring.trackInteraction.bind(monitoring),
    trackApiCall: monitoring.trackApiCall.bind(monitoring),
    trackFormSubmission: monitoring.trackFormSubmission.bind(monitoring),
    trackSearch: monitoring.trackSearch.bind(monitoring),
    trackError: monitoring.trackError.bind(monitoring),
    trackPerformance: monitoring.trackPerformance.bind(monitoring),
    trackPageView: monitoring.trackPageView.bind(monitoring),
    setUserId: monitoring.setUserId.bind(monitoring),
    flushEvents: monitoring.flushEvents.bind(monitoring)
  }
}

// Higher-order component for automatic page tracking
export const withPageTracking = <P extends object>(
  Component: React.ComponentType<P>,
  pageName?: string
) => {
  return (props: P) => {
    React.useEffect(() => {
      monitoring.trackPageView(pageName)
    }, [pageName])

    return <Component {...props} />
  }
}

export default monitoring
