import React, { useState, useEffect } from 'react';
import { usePWA } from '../../utils/pwa';

interface PWAInstallProps {
  className?: string;
  showStatus?: boolean;
  showInstallButton?: boolean;
}

const PWAInstall: React.FC<PWAInstallProps> = ({
  className = '',
  showStatus = true,
  showInstallButton = true,
}) => {
  const {
    installed,
    offline,
    serviceWorker,
    notifications,
    cache,
    install,
    requestNotificationPermission,
    getAppSize,
    getStorageQuota,
    generateReport,
  } = usePWA();

  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [appSize, setAppSize] = useState<number>(0);
  const [storageQuota, setStorageQuota] = useState<number>(0);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if install prompt should be shown
    const checkInstallPrompt = () => {
      const deferredPrompt = (window as any).deferredPrompt;
      setShowInstallPrompt(!!deferredPrompt && !installed);
    };

    checkInstallPrompt();
    window.addEventListener('beforeinstallprompt', checkInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', checkInstallPrompt);
    };
  }, [installed]);

  useEffect(() => {
    // Get app size and storage quota
    const getStorageInfo = async () => {
      const size = await getAppSize();
      const quota = await getStorageQuota();
      setAppSize(size);
      setStorageQuota(quota);
    };

    getStorageInfo();
  }, [getAppSize, getStorageQuota]);

  const handleInstall = async () => {
    try {
      setIsInstalling(true);
      await install();
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleNotificationPermission = async () => {
    try {
      const granted = await requestNotificationPermission();
      if (granted) {
        // Show success message
        console.log('Notification permission granted');
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const report = await generateReport();
      console.log('PWA Report:', report);
      
      // Create a downloadable report
      const blob = new Blob([report], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'educore-pwa-report.txt';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: boolean): string => {
    return status ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (status: boolean): string => {
    return status ? '✅' : '❌';
  };

  if (!showInstallButton && !showStatus) {
    return null;
  }

  return (
    <div className={`pwa-install ${className}`}>
      {/* Install Button */}
      {showInstallButton && showInstallPrompt && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">📱</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Install EduCore Ultra</h3>
                <p className="text-sm text-gray-600">
                  Get the full app experience with offline access
                </p>
              </div>
            </div>
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isInstalling ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Installing...</span>
                </>
              ) : (
                <>
                  <span>📥</span>
                  <span>Install</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Status Indicators */}
      {showStatus && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">PWA Status</h3>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-1">
                {installed ? '📱' : '🌐'}
              </div>
              <div className="text-sm font-medium text-gray-900">
                {installed ? 'Installed' : 'Web App'}
              </div>
            </div>

            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-1">
                {offline ? '📶' : '🌐'}
              </div>
              <div className="text-sm font-medium text-gray-900">
                {offline ? 'Offline' : 'Online'}
              </div>
            </div>

            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-1">
                {serviceWorker ? '⚙️' : '❌'}
              </div>
              <div className="text-sm font-medium text-gray-900">
                Service Worker
              </div>
            </div>

            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-1">
                {notifications ? '🔔' : '🔕'}
              </div>
              <div className="text-sm font-medium text-gray-900">
                Notifications
              </div>
            </div>
          </div>

          {/* Detailed Status */}
          {showDetails && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">App Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Installation:</span>
                      <span className={`text-sm font-medium ${getStatusColor(installed)}`}>
                        {getStatusIcon(installed)} {installed ? 'Installed' : 'Not Installed'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Service Worker:</span>
                      <span className={`text-sm font-medium ${getStatusColor(serviceWorker)}`}>
                        {getStatusIcon(serviceWorker)} {serviceWorker ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Cache Support:</span>
                      <span className={`text-sm font-medium ${getStatusColor(cache)}`}>
                        {getStatusIcon(cache)} {cache ? 'Available' : 'Not Available'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Notifications:</span>
                      <span className={`text-sm font-medium ${getStatusColor(notifications)}`}>
                        {getStatusIcon(notifications)} {notifications ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Storage</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">App Size:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatBytes(appSize)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Storage Quota:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatBytes(storageQuota)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Usage:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {storageQuota > 0 ? `${((appSize / storageQuota) * 100).toFixed(1)}%` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                {!notifications && (
                  <button
                    onClick={handleNotificationPermission}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Enable Notifications
                  </button>
                )}
                
                <button
                  onClick={handleGenerateReport}
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                >
                  Download Report
                </button>

                <button
                  onClick={() => window.location.reload()}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Refresh App
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PWAInstall;
