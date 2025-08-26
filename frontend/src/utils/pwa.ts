// Progressive Web App utilities

interface PWAConfig {
  name: string;
  shortName: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  orientation: 'portrait' | 'landscape' | 'any';
  scope: string;
  startUrl: string;
  icons: {
    src: string;
    sizes: string;
    type: string;
    purpose?: string;
  }[];
}

class PWA {
  private config: PWAConfig;
  private registration: ServiceWorkerRegistration | null = null;

  constructor(config: PWAConfig) {
    this.config = config;
    this.initializePWA();
  }

  private async initializePWA(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        await this.registerServiceWorker();
        this.setupUpdateNotifications();
        this.setupOfflineDetection();
      } catch (error) {
        console.error('PWA initialization failed:', error);
      }
    }
  }

  private async registerServiceWorker(): Promise<void> {
    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: this.config.scope,
      });

      console.log('Service Worker registered successfully:', this.registration);

      // Handle service worker updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration!.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateNotification();
            }
          });
        }
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  private setupUpdateNotifications(): void {
    if (this.registration) {
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration!.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateNotification();
            }
          });
        }
      });
    }
  }

  private setupOfflineDetection(): void {
    window.addEventListener('online', () => {
      this.showNotification('You are back online!', 'success');
      this.syncData();
    });

    window.addEventListener('offline', () => {
      this.showNotification('You are offline. Some features may be limited.', 'warning');
    });
  }

  private showUpdateNotification(): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('App Update Available', {
        body: 'A new version of the app is available. Click to update.',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: 'app-update',
        requireInteraction: true,
      });

      notification.addEventListener('click', () => {
        window.location.reload();
      });
    } else {
      // Fallback to in-app notification
      this.showInAppNotification('App Update Available', 'A new version is available. Please refresh the page.');
    }
  }

  private showNotification(message: string, type: 'success' | 'warning' | 'error'): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('EduCore Ultra', {
        body: message,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
      });
    }
  }

  private showInAppNotification(title: string, message: string): void {
    // Create a custom notification element
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
    notification.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <h4 class="font-semibold">${title}</h4>
          <p class="text-sm opacity-90">${message}</p>
        </div>
        <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
          ×
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }

  // Request notification permission
  public async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Notifications are not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('Notification permission denied');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  // Install PWA
  public async installPWA(): Promise<void> {
    if (!this.registration) {
      throw new Error('Service Worker not registered');
    }

    try {
      await this.registration.showNotification('Installing EduCore Ultra...', {
        body: 'The app is being installed on your device.',
        icon: '/icon-192x192.png',
      });

      // Trigger the install prompt
      const deferredPrompt = (window as any).deferredPrompt;
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          this.showNotification('App installed successfully!', 'success');
        }
        
        (window as any).deferredPrompt = null;
      }
    } catch (error) {
      console.error('PWA installation failed:', error);
      throw error;
    }
  }

  // Check if app is installed
  public isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  // Check if app is running offline
  public isOffline(): boolean {
    return !navigator.onLine;
  }

  // Sync data when back online
  private async syncData(): Promise<void> {
    if (this.registration && this.registration.sync) {
      try {
        await this.registration.sync.register('sync-data');
        console.log('Background sync registered');
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    }
  }

  // Cache data for offline use
  public async cacheData(url: string, data: any): Promise<void> {
    if ('caches' in window) {
      try {
        const cache = await caches.open('educore-data-v1');
        const response = new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json' },
        });
        await cache.put(url, response);
        console.log('Data cached successfully:', url);
      } catch (error) {
        console.error('Failed to cache data:', error);
      }
    }
  }

  // Get cached data
  public async getCachedData(url: string): Promise<any | null> {
    if ('caches' in window) {
      try {
        const cache = await caches.open('educore-data-v1');
        const response = await cache.match(url);
        
        if (response) {
          const data = await response.json();
          return data;
        }
      } catch (error) {
        console.error('Failed to get cached data:', error);
      }
    }
    return null;
  }

  // Clear cache
  public async clearCache(): Promise<void> {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('Cache cleared successfully');
      } catch (error) {
        console.error('Failed to clear cache:', error);
      }
    }
  }

  // Get app size
  public async getAppSize(): Promise<number> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return estimate.usage || 0;
      } catch (error) {
        console.error('Failed to get app size:', error);
      }
    }
    return 0;
  }

  // Get storage quota
  public async getStorageQuota(): Promise<number> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return estimate.quota || 0;
      } catch (error) {
        console.error('Failed to get storage quota:', error);
      }
    }
    return 0;
  }

  // Generate manifest
  public generateManifest(): string {
    return JSON.stringify({
      name: this.config.name,
      short_name: this.config.shortName,
      description: this.config.description,
      theme_color: this.config.themeColor,
      background_color: this.config.backgroundColor,
      display: this.config.display,
      orientation: this.config.orientation,
      scope: this.config.scope,
      start_url: this.config.startUrl,
      icons: this.config.icons,
      categories: ['education', 'productivity'],
      lang: 'en',
      dir: 'ltr',
    }, null, 2);
  }

  // Get PWA status
  public getStatus(): {
    installed: boolean;
    offline: boolean;
    serviceWorker: boolean;
    notifications: boolean;
    cache: boolean;
  } {
    return {
      installed: this.isInstalled(),
      offline: this.isOffline(),
      serviceWorker: !!this.registration,
      notifications: 'Notification' in window && Notification.permission === 'granted',
      cache: 'caches' in window,
    };
  }

  // Generate PWA report
  public async generateReport(): Promise<string> {
    const status = this.getStatus();
    const appSize = await this.getAppSize();
    const storageQuota = await this.getStorageQuota();

    return `
PWA Report:
===========
App Name: ${this.config.name}
Short Name: ${this.config.shortName}
Description: ${this.config.description}

Status:
- Installed: ${status.installed ? 'Yes' : 'No'}
- Offline: ${status.offline ? 'Yes' : 'No'}
- Service Worker: ${status.serviceWorker ? 'Active' : 'Inactive'}
- Notifications: ${status.notifications ? 'Enabled' : 'Disabled'}
- Cache: ${status.cache ? 'Available' : 'Not Available'}

Storage:
- App Size: ${(appSize / 1024 / 1024).toFixed(2)} MB
- Storage Quota: ${(storageQuota / 1024 / 1024).toFixed(2)} MB
- Usage: ${((appSize / storageQuota) * 100).toFixed(2)}%

Configuration:
- Display Mode: ${this.config.display}
- Orientation: ${this.config.orientation}
- Theme Color: ${this.config.themeColor}
- Background Color: ${this.config.backgroundColor}
- Scope: ${this.config.scope}
- Start URL: ${this.config.startUrl}
- Icons: ${this.config.icons.length} configured
    `.trim();
  }
}

// Default PWA configuration
const defaultPWAConfig: PWAConfig = {
  name: 'EduCore Ultra',
  shortName: 'EduCore',
  description: 'AI-Powered School Management System',
  themeColor: '#3B82F6',
  backgroundColor: '#ffffff',
  display: 'standalone',
  orientation: 'portrait',
  scope: '/',
  startUrl: '/',
  icons: [
    {
      src: '/icon-192x192.png',
      sizes: '192x192',
      type: 'image/png',
    },
    {
      src: '/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
    },
    {
      src: '/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any maskable',
    },
  ],
};

// Create singleton instance
export const pwa = new PWA(defaultPWAConfig);

import React from 'react';

// React hook for PWA
export const usePWA = () => {
  const [status, setStatus] = React.useState(pwa.getStatus());

  React.useEffect(() => {
    const updateStatus = () => {
      setStatus(pwa.getStatus());
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  return {
    ...status,
    install: pwa.installPWA.bind(pwa),
    requestNotificationPermission: pwa.requestNotificationPermission.bind(pwa),
    cacheData: pwa.cacheData.bind(pwa),
    getCachedData: pwa.getCachedData.bind(pwa),
    clearCache: pwa.clearCache.bind(pwa),
    getAppSize: pwa.getAppSize.bind(pwa),
    getStorageQuota: pwa.getStorageQuota.bind(pwa),
    generateReport: pwa.generateReport.bind(pwa),
  };
};
