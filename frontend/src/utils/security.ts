// Security utilities for XSS protection and input sanitization

export class SecurityUtils {
  // Sanitize HTML content to prevent XSS
  static sanitizeHTML(html: string): string {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  // Sanitize user input
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // Validate email format
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password strength
  static validatePassword(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Password must be at least 8 characters long');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one uppercase letter');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one lowercase letter');
    }

    // Number check
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one number');
    }

    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one special character');
    }

    return {
      isValid: score >= 4,
      score,
      feedback,
    };
  }

  // Generate secure random string
  static generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomArray = new Uint8Array(length);
    crypto.getRandomValues(randomArray);
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(randomArray[i] % chars.length);
    }
    
    return result;
  }

  // Hash password (client-side, for demo purposes)
  static async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Validate URL
  static isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Validate phone number (basic)
  static isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  // Escape special characters for SQL injection prevention
  static escapeSQL(input: string): string {
    return input
      .replace(/'/g, "''")
      .replace(/--/g, '')
      .replace(/;/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '');
  }

  // Validate file type
  static isValidFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  }

  // Validate file size
  static isValidFileSize(file: File, maxSizeInMB: number): boolean {
    return file.size <= maxSizeInMB * 1024 * 1024;
  }

  // Generate CSRF token
  static generateCSRFToken(): string {
    return this.generateSecureToken(32);
  }

  // Validate CSRF token
  static validateCSRFToken(token: string, storedToken: string): boolean {
    return token === storedToken && token.length === 32;
  }

  // Rate limiting utility
  static createRateLimiter(maxRequests: number, timeWindow: number) {
    const requests = new Map<string, number[]>();

    return (identifier: string): boolean => {
      const now = Date.now();
      const userRequests = requests.get(identifier) || [];
      
      // Remove old requests outside the time window
      const validRequests = userRequests.filter(time => now - time < timeWindow);
      
      if (validRequests.length >= maxRequests) {
        return false; // Rate limit exceeded
      }
      
      validRequests.push(now);
      requests.set(identifier, validRequests);
      return true; // Request allowed
    };
  }

  // Content Security Policy helper
  static generateCSP(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https:",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ');
  }

  // Input validation for common fields
  static validateInput(type: string, value: string): {
    isValid: boolean;
    message?: string;
  } {
    switch (type) {
      case 'email':
        return {
          isValid: this.isValidEmail(value),
          message: this.isValidEmail(value) ? undefined : 'Please enter a valid email address'
        };

      case 'password':
        const passwordValidation = this.validatePassword(value);
        return {
          isValid: passwordValidation.isValid,
          message: passwordValidation.isValid ? undefined : passwordValidation.feedback[0]
        };

      case 'phone':
        return {
          isValid: this.isValidPhoneNumber(value),
          message: this.isValidPhoneNumber(value) ? undefined : 'Please enter a valid phone number'
        };

      case 'url':
        return {
          isValid: this.isValidURL(value),
          message: this.isValidURL(value) ? undefined : 'Please enter a valid URL'
        };

      case 'name':
        const nameRegex = /^[a-zA-Z\s]{2,50}$/;
        return {
          isValid: nameRegex.test(value),
          message: nameRegex.test(value) ? undefined : 'Name must be 2-50 characters and contain only letters and spaces'
        };

      case 'username':
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        return {
          isValid: usernameRegex.test(value),
          message: usernameRegex.test(value) ? undefined : 'Username must be 3-20 characters and contain only letters, numbers, and underscores'
        };

      default:
        return {
          isValid: true
        };
    }
  }

  // Sanitize object properties recursively
  static sanitizeObject<T>(obj: T): T {
    if (typeof obj === 'string') {
      return this.sanitizeInput(obj) as T;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item)) as T;
    }

    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = this.sanitizeObject(value);
      }
      return sanitized;
    }

    return obj;
  }

  // Check if string contains potentially dangerous content
  static containsDangerousContent(input: string): boolean {
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /data:text\/html/gi,
      /vbscript:/gi,
      /expression\s*\(/gi,
    ];

    return dangerousPatterns.some(pattern => pattern.test(input));
  }

  // Log security events
  static logSecurityEvent(event: string, details: any): void {
    console.warn(`Security Event: ${event}`, details);
    
    // In production, send to security monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Send to security monitoring service
      // Example: sendToSecurityService(event, details);
    }
  }
}

// Export individual functions for convenience
export const {
  sanitizeHTML,
  sanitizeInput,
  isValidEmail,
  validatePassword,
  generateSecureToken,
  hashPassword,
  isValidURL,
  isValidPhoneNumber,
  escapeSQL,
  isValidFileType,
  isValidFileSize,
  generateCSRFToken,
  validateCSRFToken,
  createRateLimiter,
  generateCSP,
  validateInput,
  sanitizeObject,
  containsDangerousContent,
  logSecurityEvent,
} = SecurityUtils;
