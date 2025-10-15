/**
 * Advanced API Client with interceptors, retry logic, and monitoring
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { errorHandler } from '../utils/error-handler'
import { monitoring } from '../utils/monitoring'
import { csrfProtection } from '../utils/security'

// API Configuration
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  basePath: import.meta.env.VITE_API_BASE_PATH || '/api',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  tokenKey: import.meta.env.VITE_AUTH_TOKEN_KEY || 'educore_auth_token',
  refreshTokenKey: import.meta.env.VITE_AUTH_REFRESH_TOKEN_KEY || 'educore_refresh_token',
  userKey: import.meta.env.VITE_AUTH_USER_KEY || 'educore_user',
}

class ApiClient {
  private client: AxiosInstance
  private isRefreshing = false
  private failedQueue: Array<{
    resolve: (value?: any) => void
    reject: (error?: any) => void
  }> = []

  constructor() {
    this.client = axios.create({
      baseURL: `${API_CONFIG.baseURL}${API_CONFIG.basePath}`,
      timeout: API_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: true,
    })

    this.setupInterceptors()
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request Interceptor
    this.client.interceptors.request.use(
      (config) => {
        const startTime = Date.now()
        
        // Add request metadata
        config.metadata = { startTime }

        // Add authentication token
        const token = this.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // Add CSRF token
        if (import.meta.env.VITE_ENABLE_CSRF === 'true') {
          const csrfToken = csrfProtection.getToken()
          if (csrfToken) {
            config.headers['X-CSRFToken'] = csrfToken
          }
        }

        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId()

        // Log request in development
        if (import.meta.env.DEV) {
          console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data)
        }

        return config
      },
      (error) => {
        errorHandler.handleError(error, { component: 'API Request Interceptor' })
        return Promise.reject(error)
      }
    )

    // Response Interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Track API call performance
        const duration = Date.now() - (response.config.metadata?.startTime || 0)
        
        monitoring.trackApiCall(
          response.config.url || '',
          response.config.method?.toUpperCase() || '',
          response.status,
          duration
        )

        // Log response in development
        if (import.meta.env.DEV) {
          console.log(`[API Response] ${response.config.url}`, response.data)
        }

        return response
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

        // Track API error
        const duration = Date.now() - ((originalRequest as any).metadata?.startTime || 0)
        monitoring.trackApiCall(
          originalRequest?.url || '',
          originalRequest?.method?.toUpperCase() || '',
          error.response?.status || 0,
          duration,
          error.message
        )

        // Handle 401 Unauthorized - Token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject })
            }).then(token => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`
              }
              return this.client(originalRequest)
            })
          }

          originalRequest._retry = true
          this.isRefreshing = true

          try {
            const newToken = await this.refreshToken()
            this.processQueue(null, newToken)
            
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`
            }
            
            return this.client(originalRequest)
          } catch (refreshError) {
            this.processQueue(refreshError, null)
            this.handleAuthError()
            return Promise.reject(refreshError)
          } finally {
            this.isRefreshing = false
          }
        }

        // Handle 403 Forbidden
        if (error.response?.status === 403) {
          errorHandler.handleApiError(error, {
            action: 'API Call',
            additionalInfo: { url: originalRequest?.url }
          })
        }

        // Handle 429 Too Many Requests - Retry with exponential backoff
        if (error.response?.status === 429 && !originalRequest._retry) {
          const retryAfter = error.response.headers['retry-after']
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : 5000
          
          await this.delay(delay)
          return this.client(originalRequest)
        }

        // Handle 5xx Server Errors - Retry logic
        if (
          error.response?.status &&
          error.response.status >= 500 &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true
          
          for (let i = 0; i < API_CONFIG.retryAttempts; i++) {
            try {
              await this.delay(API_CONFIG.retryDelay * Math.pow(2, i))
              return await this.client(originalRequest)
            } catch (retryError) {
              if (i === API_CONFIG.retryAttempts - 1) {
                throw retryError
              }
            }
          }
        }

        // Handle network errors
        if (!error.response) {
          errorHandler.handleApiError(error, {
            action: 'Network Error',
            additionalInfo: { url: originalRequest?.url }
          })
        }

        return Promise.reject(error)
      }
    )
  }

  /**
   * Get authentication token
   */
  private getToken(): string | null {
    return localStorage.getItem(API_CONFIG.tokenKey)
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    localStorage.setItem(API_CONFIG.tokenKey, token)
  }

  /**
   * Get refresh token
   */
  private getRefreshToken(): string | null {
    return localStorage.getItem(API_CONFIG.refreshTokenKey)
  }

  /**
   * Set refresh token
   */
  setRefreshToken(token: string): void {
    localStorage.setItem(API_CONFIG.refreshTokenKey, token)
  }

  /**
   * Refresh authentication token
   */
  private async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken()
    
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await axios.post(
        `${API_CONFIG.baseURL}${API_CONFIG.basePath}/auth/refresh/`,
        { refresh: refreshToken }
      )

      const { access } = response.data
      this.setToken(access)
      
      return access
    } catch (error) {
      this.clearAuth()
      throw error
    }
  }

  /**
   * Process queued requests after token refresh
   */
  private processQueue(error: any, token: string | null = null): void {
    this.failedQueue.forEach(promise => {
      if (error) {
        promise.reject(error)
      } else {
        promise.resolve(token)
      }
    })

    this.failedQueue = []
  }

  /**
   * Handle authentication error
   */
  private handleAuthError(): void {
    this.clearAuth()
    
    // Redirect to login if not already there
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }

  /**
   * Clear authentication data
   */
  clearAuth(): void {
    localStorage.removeItem(API_CONFIG.tokenKey)
    localStorage.removeItem(API_CONFIG.refreshTokenKey)
    localStorage.removeItem(API_CONFIG.userKey)
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Delay helper for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config)
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config)
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config)
  }

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config)
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config)
  }

  /**
   * Upload file
   */
  async upload<T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<AxiosResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)

    return this.client.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })
  }

  /**
   * Get axios instance for custom usage
   */
  getInstance(): AxiosInstance {
    return this.client
  }
}

// Create singleton instance
export const apiClient = new ApiClient()

// Export default
export default apiClient
