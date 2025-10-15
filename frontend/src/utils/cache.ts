/**
 * Advanced caching utilities for performance optimization
 */
import { useState, useEffect, useCallback, useMemo } from 'react'

export interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum number of items
  staleWhileRevalidate?: boolean // Allow stale data while revalidating
}

export interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
  key: string
}

/**
 * In-memory cache implementation
 */
class MemoryCache<T = any> {
  private cache = new Map<string, CacheItem<T>>()
  private options: Required<CacheOptions>

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || 5 * 60 * 1000, // 5 minutes default
      maxSize: options.maxSize || 100,
      staleWhileRevalidate: options.staleWhileRevalidate || false
    }
  }

  set(key: string, data: T, ttl?: number): void {
    // Remove oldest items if cache is full
    if (this.cache.size >= this.options.maxSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.options.ttl,
      key
    })
  }

  get(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    const now = Date.now()
    const isExpired = now - item.timestamp > item.ttl

    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false

    const now = Date.now()
    const isExpired = now - item.timestamp > item.ttl

    if (isExpired) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  // Get stale data for revalidation
  getStale(key: string): T | null {
    const item = this.cache.get(key)
    return item ? item.data : null
  }

  // Check if data is stale
  isStale(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return true

    const now = Date.now()
    return now - item.timestamp > item.ttl
  }
}

/**
 * Local Storage cache implementation
 */
class LocalStorageCache<T = any> {
  private prefix: string
  private options: Required<CacheOptions>

  constructor(prefix = 'app_cache_', options: CacheOptions = {}) {
    this.prefix = prefix
    this.options = {
      ttl: options.ttl || 5 * 60 * 1000,
      maxSize: options.maxSize || 50,
      staleWhileRevalidate: options.staleWhileRevalidate || false
    }
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }

  set(key: string, data: T, ttl?: number): void {
    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttl || this.options.ttl,
        key
      }
      
      localStorage.setItem(this.getKey(key), JSON.stringify(item))
    } catch (error) {
      console.warn('Failed to set cache item:', error)
    }
  }

  get(key: string): T | null {
    try {
      const itemStr = localStorage.getItem(this.getKey(key))
      if (!itemStr) return null

      const item: CacheItem<T> = JSON.parse(itemStr)
      const now = Date.now()
      const isExpired = now - item.timestamp > item.ttl

      if (isExpired) {
        this.delete(key)
        return null
      }

      return item.data
    } catch (error) {
      console.warn('Failed to get cache item:', error)
      return null
    }
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): boolean {
    try {
      localStorage.removeItem(this.getKey(key))
      return true
    } catch (error) {
      console.warn('Failed to delete cache item:', error)
      return false
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn('Failed to clear cache:', error)
    }
  }
}

/**
 * React Query-like cache hook
 */
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions & {
    cache?: 'memory' | 'localStorage'
    enabled?: boolean
    refetchOnWindowFocus?: boolean
  } = {}
) {
  const {
    cache = 'memory',
    enabled = true,
    refetchOnWindowFocus = true,
    ...cacheOptions
  } = options

  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [isStale, setIsStale] = useState(false)

  const cacheInstance = useMemo(() => {
    return cache === 'localStorage' 
      ? new LocalStorageCache<T>(undefined, cacheOptions)
      : new MemoryCache<T>(cacheOptions)
  }, [cache, cacheOptions])

  const fetchData = useCallback(async (force = false) => {
    if (!enabled) return

    // Check cache first
    if (!force && cacheInstance.has(key)) {
      const cachedData = cacheInstance.get(key)
      if (cachedData) {
        setData(cachedData)
        setError(null)
        
        // Check if data is stale
        if (cacheInstance.isStale(key)) {
          setIsStale(true)
        }
        return
      }
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await fetcher()
      
      // Cache the result
      cacheInstance.set(key, result)
      
      setData(result)
      setIsStale(false)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      
      // Return stale data if available
      if (cacheInstance.has(key)) {
        const staleData = cacheInstance.getStale(key)
        if (staleData) {
          setData(staleData)
          setIsStale(true)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }, [key, fetcher, enabled, cacheInstance])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus) return

    const handleFocus = () => {
      if (cacheInstance.isStale(key)) {
        fetchData(true)
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [fetchData, key, refetchOnWindowFocus, cacheInstance])

  const refetch = useCallback(() => {
    fetchData(true)
  }, [fetchData])

  const invalidate = useCallback(() => {
    cacheInstance.delete(key)
    setData(null)
    setIsStale(false)
  }, [cacheInstance, key])

  return {
    data,
    isLoading,
    error,
    isStale,
    refetch,
    invalidate
  }
}

/**
 * Cache manager for global state
 */
class CacheManager {
  private memoryCache = new MemoryCache()
  private localStorageCache = new LocalStorageCache()

  set(key: string, data: any, options: { ttl?: number; storage?: 'memory' | 'localStorage' } = {}) {
    const { storage = 'memory', ttl } = options
    
    if (storage === 'localStorage') {
      this.localStorageCache.set(key, data, ttl)
    } else {
      this.memoryCache.set(key, data, ttl)
    }
  }

  get(key: string, storage: 'memory' | 'localStorage' = 'memory'): any {
    if (storage === 'localStorage') {
      return this.localStorageCache.get(key)
    } else {
      return this.memoryCache.get(key)
    }
  }

  has(key: string, storage: 'memory' | 'localStorage' = 'memory'): boolean {
    if (storage === 'localStorage') {
      return this.localStorageCache.has(key)
    } else {
      return this.memoryCache.has(key)
    }
  }

  delete(key: string, storage?: 'memory' | 'localStorage'): void {
    if (storage === 'localStorage') {
      this.localStorageCache.delete(key)
    } else if (storage === 'memory') {
      this.memoryCache.delete(key)
    } else {
      // Delete from both
      this.localStorageCache.delete(key)
      this.memoryCache.delete(key)
    }
  }

  clear(storage?: 'memory' | 'localStorage'): void {
    if (storage === 'localStorage') {
      this.localStorageCache.clear()
    } else if (storage === 'memory') {
      this.memoryCache.clear()
    } else {
      // Clear both
      this.localStorageCache.clear()
      this.memoryCache.clear()
    }
  }

  // Cache statistics
  getStats() {
    return {
      memory: {
        size: this.memoryCache.size(),
        keys: this.memoryCache.keys()
      },
      localStorage: {
        keys: this.localStorageCache.keys()
      }
    }
  }
}

// Global cache manager instance
export const cacheManager = new CacheManager()

// React hook for cache manager
export function useCacheManager() {
  return {
    set: cacheManager.set.bind(cacheManager),
    get: cacheManager.get.bind(cacheManager),
    has: cacheManager.has.bind(cacheManager),
    delete: cacheManager.delete.bind(cacheManager),
    clear: cacheManager.clear.bind(cacheManager),
    getStats: cacheManager.getStats.bind(cacheManager)
  }
}

export default {
  MemoryCache,
  LocalStorageCache,
  useCache,
  cacheManager,
  useCacheManager
}
