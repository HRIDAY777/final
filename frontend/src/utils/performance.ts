/**
 * Performance optimization utilities
 */
import { memo, lazy, Suspense, ComponentType } from 'react'

export interface LazyComponentProps {
  fallback?: React.ReactNode
  errorBoundary?: boolean
}

/**
 * Create a lazy component with fallback
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc)
  
  return memo((props: React.ComponentProps<T> & LazyComponentProps) => {
    const { fallback: customFallback, errorBoundary = true, ...restProps } = props
    
    const defaultFallback = (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
    
    const Component = (
      <Suspense fallback={customFallback || defaultFallback}>
        <LazyComponent {...restProps} />
      </Suspense>
    )
    
    if (errorBoundary) {
      return <ErrorBoundary>{Component}</ErrorBoundary>
    }
    
    return Component
  })
}

/**
 * Simple Error Boundary for lazy components
 */
class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  { hasError: boolean }
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[200px] p-4">
          <div className="text-center">
            <p className="text-red-600 mb-2">Failed to load component</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    
    const callNow = immediate && !timeout
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    
    if (callNow) func(...args)
  }
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Virtual scrolling hook for large lists
 */
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan = 5
) {
  const [scrollTop, setScrollTop] = React.useState(0)
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )
  
  const visibleItems = items.slice(startIndex, endIndex + 1)
  const totalHeight = items.length * itemHeight
  const offsetY = startIndex * itemHeight
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop
  }
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = React.useState(false)
  const [hasIntersected, setHasIntersected] = React.useState(false)
  
  React.useEffect(() => {
    const element = elementRef.current
    if (!element) return
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    )
    
    observer.observe(element)
    
    return () => {
      observer.unobserve(element)
    }
  }, [elementRef, options, hasIntersected])
  
  return { isIntersecting, hasIntersected }
}

/**
 * Image lazy loading component
 */
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  placeholder?: string
  errorSrc?: string
  threshold?: number
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
  errorSrc,
  threshold = 0.1,
  className = '',
  ...props
}) => {
  const imgRef = React.useRef<HTMLImageElement>(null)
  const [imageSrc, setImageSrc] = React.useState(placeholder)
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [hasError, setHasError] = React.useState(false)
  
  const { hasIntersected } = useIntersectionObserver(imgRef, { threshold })
  
  React.useEffect(() => {
    if (hasIntersected && !isLoaded && !hasError) {
      const img = new Image()
      img.onload = () => {
        setImageSrc(src)
        setIsLoaded(true)
      }
      img.onerror = () => {
        setHasError(true)
        if (errorSrc) {
          setImageSrc(errorSrc)
        }
      }
      img.src = src
    }
  }, [hasIntersected, src, errorSrc, isLoaded, hasError])
  
  return (
    <img
      ref={imgRef}
      src={imageSrc}
      className={`transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-70'
      } ${className}`}
      {...props}
    />
  )
}

/**
 * Memoized component wrapper
 */
export function withMemo<T extends ComponentType<any>>(
  Component: T,
  areEqual?: (prevProps: React.ComponentProps<T>, nextProps: React.ComponentProps<T>) => boolean
) {
  return memo(Component, areEqual)
}

/**
 * Performance measurement hook
 */
export function usePerformanceMeasure(name: string) {
  const startTime = React.useRef<number>()
  
  const start = React.useCallback(() => {
    startTime.current = performance.now()
  }, [])
  
  const end = React.useCallback(() => {
    if (startTime.current) {
      const duration = performance.now() - startTime.current
      console.log(`${name} took ${duration.toFixed(2)}ms`)
      
      // Track performance in monitoring service
      if (window.monitoring) {
        window.monitoring.trackPerformance(name, duration)
      }
      
      startTime.current = undefined
      return duration
    }
    return 0
  }, [name])
  
  return { start, end }
}

/**
 * Batch state updates for better performance
 */
export function useBatchedUpdates() {
  const [, forceUpdate] = React.useReducer(x => x + 1, 0)
  
  const batchedUpdate = React.useCallback((updates: (() => void)[]) => {
    React.unstable_batchedUpdates(() => {
      updates.forEach(update => update())
    })
    forceUpdate()
  }, [])
  
  return batchedUpdate
}

/**
 * Optimized list rendering hook
 */
export function useOptimizedList<T>(
  items: T[],
  keyExtractor: (item: T, index: number) => string | number,
  options: {
    pageSize?: number
    virtualScrolling?: boolean
    itemHeight?: number
    containerHeight?: number
  } = {}
) {
  const [page, setPage] = React.useState(1)
  const [isLoading, setIsLoading] = React.useState(false)
  
  const {
    pageSize = 20,
    virtualScrolling = false,
    itemHeight = 50,
    containerHeight = 400
  } = options
  
  // Virtual scrolling
  const virtualScrollData = useVirtualScroll(
    items,
    itemHeight,
    containerHeight
  )
  
  // Pagination
  const paginatedItems = React.useMemo(() => {
    if (virtualScrolling) {
      return virtualScrollData.visibleItems
    }
    
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    return items.slice(startIndex, endIndex)
  }, [items, page, pageSize, virtualScrolling, virtualScrollData.visibleItems])
  
  const hasMore = page * pageSize < items.length
  const totalPages = Math.ceil(items.length / pageSize)
  
  const loadMore = React.useCallback(async () => {
    if (isLoading || !hasMore) return
    
    setIsLoading(true)
    
    // Simulate async loading
    await new Promise(resolve => setTimeout(resolve, 100))
    
    setPage(prev => prev + 1)
    setIsLoading(false)
  }, [isLoading, hasMore])
  
  return {
    items: paginatedItems,
    page,
    totalPages,
    hasMore,
    isLoading,
    loadMore,
    virtualScrollData: virtualScrolling ? virtualScrollData : null
  }
}

/**
 * Bundle size optimization utilities
 */
export const bundleOptimizations = {
  // Dynamic imports for code splitting
  importComponent: <T>(importFunc: () => Promise<T>) => {
    return React.lazy(importFunc)
  },
  
  // Preload critical resources
  preloadResource: (href: string, as: string) => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = as
    document.head.appendChild(link)
  },
  
  // Prefetch resources for next navigation
  prefetchResource: (href: string) => {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = href
    document.head.appendChild(link)
  }
}

export default {
  createLazyComponent,
  debounce,
  throttle,
  useVirtualScroll,
  useIntersectionObserver,
  LazyImage,
  withMemo,
  usePerformanceMeasure,
  useBatchedUpdates,
  useOptimizedList,
  bundleOptimizations
}