/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
import { apiClient } from '../lib/api-client'
import { monitoring } from '../utils/monitoring'
import type { AxiosResponse } from 'axios'

export interface LoginCredentials {
  email: string
  password: string
  remember_me?: boolean
}

export interface RegisterData {
  email: string
  password: string
  password_confirm: string
  first_name: string
  last_name: string
  role?: string
}

export interface AuthResponse {
  access: string
  refresh: string
  user: User
}

export interface User {
  id: number | string
  email: string
  first_name: string
  last_name: string
  role: string
  permissions: string[]
  is_active: boolean
  is_verified: boolean
  avatar?: string
  created_at: string
  updated_at: string
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirm {
  token: string
  password: string
  password_confirm: string
}

export interface ChangePassword {
  old_password: string
  new_password: string
  new_password_confirm: string
}

class AuthService {
  private readonly API_PREFIX = '/auth'

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await apiClient.post(
        `${this.API_PREFIX}/login/`,
        credentials
      )

      const { access, refresh, user } = response.data

      // Store tokens
      apiClient.setToken(access)
      apiClient.setRefreshToken(refresh)

      // Store user data
      this.setUser(user)

      // Track login event
      monitoring.trackEvent('auth', 'authentication', 'login', 'success')
      monitoring.setUserId(user.id.toString())

      return response.data
    } catch (error) {
      monitoring.trackEvent('auth', 'authentication', 'login', 'failed')
      throw error
    }
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await apiClient.post(
        `${this.API_PREFIX}/register/`,
        data
      )

      const { access, refresh, user } = response.data

      // Store tokens
      apiClient.setToken(access)
      apiClient.setRefreshToken(refresh)

      // Store user data
      this.setUser(user)

      // Track registration event
      monitoring.trackEvent('auth', 'authentication', 'register', 'success')
      monitoring.setUserId(user.id.toString())

      return response.data
    } catch (error) {
      monitoring.trackEvent('auth', 'authentication', 'register', 'failed')
      throw error
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(`${this.API_PREFIX}/logout/`)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear auth data regardless of API response
      apiClient.clearAuth()
      this.clearUser()
      
      // Track logout event
      monitoring.trackEvent('auth', 'authentication', 'logout', 'success')
      
      // Redirect to login
      window.location.href = '/login'
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(data: PasswordResetRequest): Promise<void> {
    const response = await apiClient.post(`${this.API_PREFIX}/password-reset/`, data)
    monitoring.trackEvent('auth', 'password', 'reset_request', 'success')
    return response.data
  }

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(data: PasswordResetConfirm): Promise<void> {
    const response = await apiClient.post(`${this.API_PREFIX}/password-reset-confirm/`, data)
    monitoring.trackEvent('auth', 'password', 'reset_confirm', 'success')
    return response.data
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePassword): Promise<void> {
    const response = await apiClient.post(`${this.API_PREFIX}/change-password/`, data)
    monitoring.trackEvent('auth', 'password', 'change', 'success')
    return response.data
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<void> {
    const response = await apiClient.post(`${this.API_PREFIX}/verify-email/`, { token })
    monitoring.trackEvent('auth', 'email', 'verify', 'success')
    return response.data
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(): Promise<void> {
    const response = await apiClient.post(`${this.API_PREFIX}/resend-verification/`)
    return response.data
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response: AxiosResponse<User> = await apiClient.get(`${this.API_PREFIX}/profile/`)
    this.setUser(response.data)
    return response.data
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    const response: AxiosResponse<User> = await apiClient.patch(`${this.API_PREFIX}/profile/`, data)
    this.setUser(response.data)
    monitoring.trackEvent('auth', 'profile', 'update', 'success')
    return response.data
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('educore_auth_token')
    const user = this.getUser()
    return !!token && !!user
  }

  /**
   * Get current user
   */
  getUser(): User | null {
    const userStr = localStorage.getItem('educore_user')
    if (!userStr) return null
    
    try {
      return JSON.parse(userStr)
    } catch (error) {
      return null
    }
  }

  /**
   * Set user data
   */
  private setUser(user: User): void {
    localStorage.setItem('educore_user', JSON.stringify(user))
  }

  /**
   * Clear user data
   */
  private clearUser(): void {
    localStorage.removeItem('educore_user')
  }

  /**
   * Check user permission
   */
  hasPermission(permission: string): boolean {
    const user = this.getUser()
    if (!user) return false
    
    return user.permissions.includes(permission)
  }

  /**
   * Check user role
   */
  hasRole(role: string): boolean {
    const user = this.getUser()
    if (!user) return false
    
    return user.role === role
  }

  /**
   * Check multiple permissions (AND logic)
   */
  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(permission))
  }

  /**
   * Check multiple permissions (OR logic)
   */
  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission))
  }
}

// Create singleton instance
export const authService = new AuthService()

// Export default
export default authService
