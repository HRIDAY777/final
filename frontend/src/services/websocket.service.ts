/**
 * WebSocket Service for real-time communication
 */
import { io, Socket } from 'socket.io-client'
import { monitoring } from '../utils/monitoring'
import { errorHandler } from '../utils/error-handler'

const WS_CONFIG = {
  url: import.meta.env.VITE_WS_URL || 'ws://localhost:8000',
  path: import.meta.env.VITE_WS_PATH || '/ws',
  reconnectInterval: Number(import.meta.env.VITE_WS_RECONNECT_INTERVAL) || 5000,
  maxReconnectAttempts: Number(import.meta.env.VITE_WS_MAX_RECONNECT_ATTEMPTS) || 5,
}

export interface WebSocketConfig {
  autoConnect?: boolean
  auth?: {
    token: string
  }
}

export type WebSocketEventHandler = (data: any) => void

class WebSocketService {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private eventHandlers: Map<string, Set<WebSocketEventHandler>> = new Map()
  private isConnecting = false
  private isManuallyDisconnected = false

  /**
   * Initialize WebSocket connection
   */
  connect(config: WebSocketConfig = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve()
        return
      }

      if (this.isConnecting) {
        resolve()
        return
      }

      this.isConnecting = true
      this.isManuallyDisconnected = false

      try {
        // Get authentication token
        const token = localStorage.getItem('educore_auth_token')

        this.socket = io(WS_CONFIG.url, {
          path: WS_CONFIG.path,
          transports: ['websocket', 'polling'],
          auth: {
            token: config.auth?.token || token,
          },
          reconnection: true,
          reconnectionAttempts: WS_CONFIG.maxReconnectAttempts,
          reconnectionDelay: WS_CONFIG.reconnectInterval,
          autoConnect: config.autoConnect !== false,
        })

        this.setupEventListeners()

        this.socket.on('connect', () => {
          this.isConnecting = false
          this.reconnectAttempts = 0
          monitoring.trackEvent('websocket', 'connection', 'connected', 'success')
          console.log('[WebSocket] Connected')
          resolve()
        })

        this.socket.on('connect_error', (error) => {
          this.isConnecting = false
          monitoring.trackEvent('websocket', 'connection', 'error', 'failed')
          errorHandler.handleError(error, { component: 'WebSocket' })
          reject(error)
        })

        if (config.autoConnect !== false) {
          this.socket.connect()
        }
      } catch (error) {
        this.isConnecting = false
        errorHandler.handleError(error, { component: 'WebSocket Init' })
        reject(error)
      }
    })
  }

  /**
   * Setup WebSocket event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return

    // Connection events
    this.socket.on('disconnect', (reason) => {
      console.log('[WebSocket] Disconnected:', reason)
      monitoring.trackEvent('websocket', 'connection', 'disconnected', reason)

      // Attempt reconnection if not manually disconnected
      if (!this.isManuallyDisconnected && reason === 'io server disconnect') {
        this.attemptReconnect()
      }
    })

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('[WebSocket] Reconnected after', attemptNumber, 'attempts')
      monitoring.trackEvent('websocket', 'connection', 'reconnected', 'success')
      this.reconnectAttempts = 0
    })

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('[WebSocket] Reconnecting... Attempt:', attemptNumber)
      monitoring.trackEvent('websocket', 'connection', 'reconnect_attempt', attemptNumber.toString())
    })

    this.socket.on('reconnect_error', (error) => {
      console.error('[WebSocket] Reconnection error:', error)
      monitoring.trackEvent('websocket', 'connection', 'reconnect_error', 'failed')
    })

    this.socket.on('reconnect_failed', () => {
      console.error('[WebSocket] Reconnection failed')
      monitoring.trackEvent('websocket', 'connection', 'reconnect_failed', 'failed')
      errorHandler.handleError(new Error('WebSocket reconnection failed'), {
        component: 'WebSocket Reconnect'
      })
    })

    // Error handling
    this.socket.on('error', (error) => {
      console.error('[WebSocket] Error:', error)
      errorHandler.handleError(error, { component: 'WebSocket' })
    })

    // Custom message handler
    this.socket.onAny((event, data) => {
      const handlers = this.eventHandlers.get(event)
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(data)
          } catch (error) {
            errorHandler.handleError(error, {
              component: 'WebSocket Event Handler',
              action: event
            })
          }
        })
      }
    })
  }

  /**
   * Attempt manual reconnection
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= WS_CONFIG.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    
    setTimeout(() => {
      if (this.socket && !this.socket.connected && !this.isManuallyDisconnected) {
        console.log('[WebSocket] Attempting reconnection...')
        this.socket.connect()
      }
    }, WS_CONFIG.reconnectInterval * this.reconnectAttempts)
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    this.isManuallyDisconnected = true
    
    if (this.socket) {
      this.socket.removeAllListeners()
      this.socket.disconnect()
      this.socket = null
    }

    this.eventHandlers.clear()
    monitoring.trackEvent('websocket', 'connection', 'manual_disconnect', 'success')
    console.log('[WebSocket] Manually disconnected')
  }

  /**
   * Subscribe to an event
   */
  on(event: string, handler: WebSocketEventHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set())
    }

    this.eventHandlers.get(event)!.add(handler)

    // Return unsubscribe function
    return () => {
      this.off(event, handler)
    }
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, handler: WebSocketEventHandler): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.delete(handler)
      if (handlers.size === 0) {
        this.eventHandlers.delete(event)
      }
    }
  }

  /**
   * Emit an event
   */
  emit(event: string, data?: any): void {
    if (!this.socket || !this.socket.connected) {
      console.warn('[WebSocket] Not connected. Cannot emit event:', event)
      return
    }

    this.socket.emit(event, data)
    monitoring.trackEvent('websocket', 'message', 'sent', event)
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false
  }

  /**
   * Get socket instance
   */
  getSocket(): Socket | null {
    return this.socket
  }

  /**
   * Join a room
   */
  joinRoom(room: string): void {
    this.emit('join', { room })
    console.log(`[WebSocket] Joined room: ${room}`)
  }

  /**
   * Leave a room
   */
  leaveRoom(room: string): void {
    this.emit('leave', { room })
    console.log(`[WebSocket] Left room: ${room}`)
  }

  /**
   * Send message to room
   */
  sendToRoom(room: string, event: string, data: any): void {
    this.emit(event, { room, ...data })
  }
}

// Create singleton instance
export const websocketService = new WebSocketService()

// Export default
export default websocketService

// React Hook for WebSocket
export const useWebSocket = (event?: string, handler?: WebSocketEventHandler) => {
  React.useEffect(() => {
    if (event && handler) {
      const unsubscribe = websocketService.on(event, handler)
      return unsubscribe
    }
  }, [event, handler])

  return {
    connect: websocketService.connect.bind(websocketService),
    disconnect: websocketService.disconnect.bind(websocketService),
    emit: websocketService.emit.bind(websocketService),
    on: websocketService.on.bind(websocketService),
    off: websocketService.off.bind(websocketService),
    isConnected: websocketService.isConnected.bind(websocketService),
    joinRoom: websocketService.joinRoom.bind(websocketService),
    leaveRoom: websocketService.leaveRoom.bind(websocketService),
    sendToRoom: websocketService.sendToRoom.bind(websocketService),
  }
}
