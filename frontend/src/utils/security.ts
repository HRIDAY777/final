/**
 * Security utilities for production applications
 */

export interface SecurityConfig {
  enableCSP: boolean
  enableXSSProtection: boolean
  enableCSRFProtection: boolean
  enableClickjackingProtection: boolean
  allowedOrigins: string[]
  maxRequestSize: number
  rateLimiting: {
    enabled: boolean
    maxRequests: number
    windowMs: number
  }
}

/**
 * XSS Protection utilities
 */
export const xssProtection = {
  /**
   * Sanitize HTML content
   */
  sanitizeHtml: (html: string): string => {
    const div = document.createElement('div')
    div.textContent = html
    return div.innerHTML
  },

  /**
   * Escape HTML special characters
   */
  escapeHtml: (text: string): string => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;'
    }
    
    return text.replace(/[&<>"'/]/g, (char) => map[char])
  },

  /**
   * Validate and sanitize user input
   */
  sanitizeInput: (input: string): string => {
    if (typeof input !== 'string') return ''
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
  },

  /**
   * Check for potential XSS in URL
   */
  isSafeUrl: (url: string): boolean => {
    try {
      const parsedUrl = new URL(url)
      const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:']
      
      if (!allowedProtocols.includes(parsedUrl.protocol)) {
        return false
      }
      
      // Check for javascript: or data: protocols
      if (url.toLowerCase().includes('javascript:') || url.toLowerCase().includes('data:')) {
        return false
      }
      
      return true
    } catch {
      return false
    }
  }
}

/**
 * CSRF Protection utilities
 */
export const csrfProtection = {
  /**
   * Generate CSRF token
   */
  generateToken: (): string => {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  },

  /**
   * Store CSRF token
   */
  storeToken: (token: string): void => {
    sessionStorage.setItem('csrf_token', token)
  },

  /**
   * Get CSRF token
   */
  getToken: (): string | null => {
    return sessionStorage.getItem('csrf_token')
  },

  /**
   * Validate CSRF token
   */
  validateToken: (token: string): boolean => {
    const storedToken = csrfProtection.getToken()
    return storedToken === token && token.length > 0
  },

  /**
   * Add CSRF token to headers
   */
  addTokenToHeaders: (headers: Record<string, string> = {}): Record<string, string> => {
    const token = csrfProtection.getToken()
    if (token) {
      headers['X-CSRFToken'] = token
    }
    return headers
  }
}

/**
 * Content Security Policy utilities
 */
export const cspProtection = {
  /**
   * Generate CSP header
   */
  generateCSP: (options: {
    allowInlineScripts?: boolean
    allowEval?: boolean
    allowedDomains?: string[]
  } = {}): string => {
    const {
      allowInlineScripts = false,
      allowEval = false,
      allowedDomains = []
    } = options

    const directives = [
      "default-src 'self'",
      `script-src 'self'${allowInlineScripts ? " 'unsafe-inline'" : ''}${allowEval ? " 'unsafe-eval'" : ''}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ]

    if (allowedDomains.length > 0) {
      const domainList = allowedDomains.join(' ')
      directives[0] += ` ${domainList}`
      directives[3] += ` ${domainList}`
    }

    return directives.join('; ')
  },

  /**
   * Set CSP meta tag
   */
  setCSPMetaTag: (policy: string): void => {
    let metaTag = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
    
    if (!metaTag) {
      metaTag = document.createElement('meta')
      metaTag.setAttribute('http-equiv', 'Content-Security-Policy')
      document.head.appendChild(metaTag)
    }
    
    metaTag.setAttribute('content', policy)
  }
}

/**
 * Input validation utilities
 */
export const inputValidation = {
  /**
   * Validate email format
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  /**
   * Validate password strength
   */
  validatePassword: (password: string): {
    isValid: boolean
    score: number
    feedback: string[]
  } => {
    const feedback: string[] = []
    let score = 0

    if (password.length < 8) {
      feedback.push('Password must be at least 8 characters long')
    } else {
      score += 1
    }

    if (!/[A-Z]/.test(password)) {
      feedback.push('Password must contain at least one uppercase letter')
    } else {
      score += 1
    }

    if (!/[a-z]/.test(password)) {
      feedback.push('Password must contain at least one lowercase letter')
    } else {
      score += 1
    }

    if (!/\d/.test(password)) {
      feedback.push('Password must contain at least one number')
    } else {
      score += 1
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      feedback.push('Password must contain at least one special character')
    } else {
      score += 1
    }

    return {
      isValid: feedback.length === 0,
      score,
      feedback
    }
  },

  /**
   * Validate phone number
   */
  isValidPhone: (phone: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  },

  /**
   * Validate URL
   */
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },

  /**
   * Validate file type
   */
  isValidFileType: (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(file.type)
  },

  /**
   * Validate file size
   */
  isValidFileSize: (file: File, maxSizeInMB: number): boolean => {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024
    return file.size <= maxSizeInBytes
  }
}

/**
 * Rate limiting utilities
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  private maxRequests: number
  private windowMs: number

  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  /**
   * Check if request is allowed
   */
  isAllowed(key: string): boolean {
    const now = Date.now()
    const windowStart = now - this.windowMs

    if (!this.requests.has(key)) {
      this.requests.set(key, [])
    }

    const userRequests = this.requests.get(key)!
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(timestamp => timestamp > windowStart)
    this.requests.set(key, validRequests)

    // Check if under limit
    if (validRequests.length >= this.maxRequests) {
      return false
    }

    // Add current request
    validRequests.push(now)
    this.requests.set(key, validRequests)

    return true
  }

  /**
   * Get remaining requests
   */
  getRemaining(key: string): number {
    const now = Date.now()
    const windowStart = now - this.windowMs

    if (!this.requests.has(key)) {
      return this.maxRequests
    }

    const userRequests = this.requests.get(key)!
    const validRequests = userRequests.filter(timestamp => timestamp > windowStart)

    return Math.max(0, this.maxRequests - validRequests.length)
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.requests.delete(key)
  }

  /**
   * Clear all rate limits
   */
  clear(): void {
    this.requests.clear()
  }
}

/**
 * Secure storage utilities
 */
export const secureStorage = {
  /**
   * Encrypt data before storing
   */
  encrypt: async (data: string, key: string): Promise<string> => {
    try {
      const encoder = new TextEncoder()
      const dataBuffer = encoder.encode(data)
      const keyBuffer = encoder.encode(key)
      
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      )
      
      const derivedKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: encoder.encode('educore-salt'),
          iterations: 100000,
          hash: 'SHA-256'
        },
        cryptoKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt']
      )
      
      const iv = crypto.getRandomValues(new Uint8Array(12))
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        derivedKey,
        dataBuffer
      )
      
      const encryptedArray = new Uint8Array(encrypted)
      const combined = new Uint8Array(iv.length + encryptedArray.length)
      combined.set(iv)
      combined.set(encryptedArray)
      
      return btoa(String.fromCharCode(...combined))
    } catch (error) {
      console.error('Encryption failed:', error)
      throw new Error('Failed to encrypt data')
    }
  },

  /**
   * Decrypt data after retrieving
   */
  decrypt: async (encryptedData: string, key: string): Promise<string> => {
    try {
      const encoder = new TextEncoder()
      const decoder = new TextDecoder()
      
      const combined = new Uint8Array(
        atob(encryptedData).split('').map(char => char.charCodeAt(0))
      )
      
      const iv = combined.slice(0, 12)
      const encrypted = combined.slice(12)
      
      const keyBuffer = encoder.encode(key)
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      )
      
      const derivedKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: encoder.encode('educore-salt'),
          iterations: 100000,
          hash: 'SHA-256'
        },
        cryptoKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      )
      
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        derivedKey,
        encrypted
      )
      
      return decoder.decode(decrypted)
    } catch (error) {
      console.error('Decryption failed:', error)
      throw new Error('Failed to decrypt data')
    }
  },

  /**
   * Store sensitive data securely
   */
  setSecureItem: async (key: string, value: string): Promise<void> => {
    const encryptionKey = await this.getOrCreateEncryptionKey()
    const encryptedValue = await secureStorage.encrypt(value, encryptionKey)
    localStorage.setItem(`secure_${key}`, encryptedValue)
  },

  /**
   * Retrieve sensitive data
   */
  getSecureItem: async (key: string): Promise<string | null> => {
    try {
      const encryptedValue = localStorage.getItem(`secure_${key}`)
      if (!encryptedValue) return null
      
      const encryptionKey = await this.getOrCreateEncryptionKey()
      return await secureStorage.decrypt(encryptedValue, encryptionKey)
    } catch (error) {
      console.error('Failed to retrieve secure item:', error)
      return null
    }
  },

  /**
   * Get or create encryption key
   */
  getOrCreateEncryptionKey: async (): Promise<string> => {
    let key = localStorage.getItem('encryption_key')
    
    if (!key) {
      // Generate a new key
      const array = new Uint8Array(32)
      crypto.getRandomValues(array)
      key = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
      localStorage.setItem('encryption_key', key)
    }
    
    return key
  }
}

/**
 * Security headers utilities
 */
export const securityHeaders = {
  /**
   * Set security headers for fetch requests
   */
  getSecureHeaders: (): Record<string, string> => {
    const token = csrfProtection.getToken()
    
    return {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      ...(token && { 'X-CSRFToken': token })
    }
  },

  /**
   * Validate response headers
   */
  validateResponseHeaders: (response: Response): boolean => {
    const requiredHeaders = [
      'X-Content-Type-Options',
      'X-Frame-Options',
      'X-XSS-Protection'
    ]
    
    return requiredHeaders.every(header => 
      response.headers.has(header)
    )
  }
}

/**
 * Security configuration
 */
export const securityConfig: SecurityConfig = {
  enableCSP: true,
  enableXSSProtection: true,
  enableCSRFProtection: true,
  enableClickjackingProtection: true,
  allowedOrigins: [
    'https://educore.com',
    'https://www.educore.com',
    'https://app.educore.com'
  ],
  maxRequestSize: 10 * 1024 * 1024, // 10MB
  rateLimiting: {
    enabled: true,
    maxRequests: 100,
    windowMs: 60000 // 1 minute
  }
}

// Initialize security measures
export const initializeSecurity = (): void => {
  // Set CSP if enabled
  if (securityConfig.enableCSP) {
    const csp = cspProtection.generateCSP({
      allowedDomains: securityConfig.allowedOrigins
    })
    cspProtection.setCSPMetaTag(csp)
  }

  // Initialize CSRF protection
  if (securityConfig.enableCSRFProtection) {
    const token = csrfProtection.generateToken()
    csrfProtection.storeToken(token)
  }

  // Set security headers
  Object.defineProperty(window, 'secureHeaders', {
    value: securityHeaders.getSecureHeaders(),
    writable: false
  })
}

export default {
  xssProtection,
  csrfProtection,
  cspProtection,
  inputValidation,
  RateLimiter,
  secureStorage,
  securityHeaders,
  securityConfig,
  initializeSecurity
}