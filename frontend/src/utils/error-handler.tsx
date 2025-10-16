/**
 * Production-ready error handling utilities
 */
import React from 'react'
import { toast } from 'react-hot-toast'

export interface ErrorInfo {
  message: string
  code?: string | number
  status?: number
  timestamp: string
  userAgent: string
  url: string
  userId?: string
  stack?: string
}

export interface ErrorContext {
  component?: string
  action?: string
  userId?: string
  sessionId?: string
  additionalInfo?: Record<string, any>
}

class ErrorHandler {
  private isDevelopment = import.meta.env.DEV
  private isProduction = import.meta.env.PROD
  private errorQueue: ErrorInfo[] = []
  private maxQueueSize = 50

  /**
   * Handle and report errors
   */
  handleError(
    error: Error | unknown,
    context?: ErrorContext,
    showToast: boolean = true
  ): void {
    const errorInfo = this.createErrorInfo(error, context)
    
    // Log to console in development
    if (this.isDevelopment) {
      console.error('Error caught:', errorInfo)
      if (error instanceof Error && error.stack) {
        console.error('Stack trace:', error.stack)
      }
    }

    // Add to error queue
    this.addToErrorQueue(errorInfo)

    // Show user-friendly message
    if (showToast) {
      this.showUserFriendlyMessage(errorInfo)
    }

    // Report to monitoring service in production
    if (this.isProduction) {
      this.reportError(errorInfo, context)
    }
  }

  /**
   * Handle API errors specifically
   */
  handleApiError(error: any, context?: ErrorContext): void {
    const errorInfo = this.createErrorInfo(error, context)
    
    // Extract API-specific information
    if (error.response) {
      errorInfo.status = error.response.status
      errorInfo.code = error.response.status
      
      // Handle specific HTTP status codes
      switch (error.response.status) {
        case 400:
          errorInfo.message = 'Invalid request. Please check your input.'
          break
        case 401:
          errorInfo.message = 'Authentication required. Please log in.'
          break
        case 403:
          errorInfo.message = 'Access denied. You don\'t have permission.'
          break
        case 404:
          errorInfo.message = 'Resource not found.'
          break
        case 409:
          errorInfo.message = 'Conflict. The resource already exists.'
          break
        case 422:
          errorInfo.message = 'Validation error. Please check your data.'
          break
        case 429:
          errorInfo.message = 'Too many requests. Please try again later.'
          break
        case 500:
          errorInfo.message = 'Server error. Please try again later.'
          break
        case 503:
          errorInfo.message = 'Service temporarily unavailable.'
          break
        default:
          errorInfo.message = error.response.data?.message || 'An error occurred'
      }
    } else if (error.request) {
      errorInfo.message = 'Network error. Please check your connection.'
      errorInfo.code = 'NETWORK_ERROR'
    } else {
      errorInfo.message = error.message || 'An unexpected error occurred'
    }

    this.handleError(error, context, true)
  }

  /**
   * Handle async function errors
   */
  async handleAsync<T>(
    asyncFn: () => Promise<T>,
    context?: ErrorContext,
    fallback?: T
  ): Promise<T | undefined> {
    try {
      return await asyncFn()
    } catch (error) {
      this.handleError(error, context)
      return fallback
    }
  }

  /**
   * Create error info object
   */
  private createErrorInfo(error: Error | unknown, context?: ErrorContext): ErrorInfo {
    const now = new Date().toISOString()
    
    return {
      message: error instanceof Error ? error.message : String(error),
      code: this.extractErrorCode(error),
      status: this.extractStatus(error),
      timestamp: now,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: context?.userId,
      stack: error instanceof Error ? error.stack : undefined
    }
  }

  /**
   * Extract error code
   */
  private extractErrorCode(error: Error | unknown): string | number | undefined {
    if (error && typeof error === 'object') {
      if ('code' in error) return error.code as string | number
      if ('status' in error) return error.status as number
      if ('statusCode' in error) return error.statusCode as number
    }
    return undefined
  }

  /**
   * Extract HTTP status
   */
  private extractStatus(error: Error | unknown): number | undefined {
    if (error && typeof error === 'object') {
      if ('response' in error && error.response && typeof error.response === 'object') {
        if ('status' in error.response) return error.response.status as number
      }
      if ('status' in error) return error.status as number
      if ('statusCode' in error) return error.statusCode as number
    }
    return undefined
  }

  /**
   * Add error to queue
   */
  private addToErrorQueue(errorInfo: ErrorInfo): void {
    this.errorQueue.unshift(errorInfo)
    
    // Limit queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue = this.errorQueue.slice(0, this.maxQueueSize)
    }
  }

  /**
   * Show user-friendly error message
   */
  private showUserFriendlyMessage(errorInfo: ErrorInfo): void {
    let message = errorInfo.message
    
    // Make messages more user-friendly
    if (message.includes('Network Error')) {
      message = 'Connection problem. Please check your internet.'
    } else if (message.includes('timeout')) {
      message = 'Request timed out. Please try again.'
    } else if (message.includes('Failed to fetch')) {
      message = 'Unable to connect to server.'
    }

    // Show toast notification
    toast.error(message, {
      duration: 5000,
      position: 'top-right',
      id: `error-${errorInfo.timestamp}`
    })
  }

  /**
   * Report error to monitoring service
   */
  private async reportError(errorInfo: ErrorInfo, context?: ErrorContext): Promise<void> {
    try {
      // In production, you would send to your monitoring service
      // Example: Sentry, LogRocket, Bugsnag, etc.
      
      const payload = {
        ...errorInfo,
        context,
        environment: 'production',
        version: import.meta.env.VITE_APP_VERSION || '1.0.0',
        buildTime: import.meta.env.VITE_BUILD_TIME
      }

      // Example: Send to your backend error endpoint
      if (import.meta.env.VITE_API_URL) {
        await fetch(`${import.meta.env.VITE_API_URL}/errors`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        }).catch(() => {
          // Silently fail if error reporting fails
        })
      }
    } catch (reportingError) {
      // Silently fail error reporting to avoid infinite loops
      console.warn('Error reporting failed:', reportingError)
    }
  }

  /**
   * Get error queue for debugging
   */
  getErrorQueue(): ErrorInfo[] {
    return [...this.errorQueue]
  }

  /**
   * Clear error queue
   */
  clearErrorQueue(): void {
    this.errorQueue = []
  }

  /**
   * Create error boundary fallback
   */
  createErrorFallback(error: Error, resetError: () => void) {
    return {
      error,
      resetError,
      retry: () => {
        resetError()
        window.location.reload()
      }
    }
  }
}

// Create singleton instance
export const errorHandler = new ErrorHandler()

// Export types and utilities
export type { ErrorInfo, ErrorContext }

// React Hook for error handling
export const useErrorHandler = () => {
  return {
    handleError: errorHandler.handleError.bind(errorHandler),
    handleApiError: errorHandler.handleApiError.bind(errorHandler),
    handleAsync: errorHandler.handleAsync.bind(errorHandler)
  }
}

// Higher-order function for error boundaries
export const withErrorHandler = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
) => {
  return (props: P) => {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{
    fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
  }>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{
    fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
  }>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    errorHandler.handleError(error, {
      component: 'ErrorBoundary',
      additionalInfo: errorInfo
    })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return (
          <FallbackComponent
            error={this.state.error}
            resetError={() => this.setState({ hasError: false, error: undefined })}
          />
        )
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-medium text-gray-900">
                Something went wrong
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                We're sorry, but something unexpected happened.
              </p>
              <div className="mt-4 space-x-3">
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Reload Page
                </button>
                <button
                  onClick={() => this.setState({ hasError: false, error: undefined })}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default errorHandler
