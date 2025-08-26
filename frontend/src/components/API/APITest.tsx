import React, { useState, useEffect } from 'react';
import { apiService, testApiConnection } from '../../services/api';

const APITest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'failed'>('testing');
  const [healthData, setHealthData] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setConnectionStatus('testing');
      setError('');
      
      // Test basic API connection
      const isConnected = await testApiConnection();
      
      if (isConnected) {
        setConnectionStatus('connected');
        
        // Test health endpoint
        try {
          const health = await apiService.get('/health/');
          setHealthData(health);
        } catch (healthError) {
          console.error('Health check failed:', healthError);
        }
      } else {
        setConnectionStatus('failed');
        setError('API connection failed');
      }
    } catch (err) {
      setConnectionStatus('failed');
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return '✅';
      case 'failed':
        return '❌';
      default:
        return '⏳';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">API Connection Test</h2>
      
      <div className={`p-4 rounded-xl ${getStatusColor()} mb-4`}>
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{getStatusIcon()}</span>
          <div>
            <p className="font-semibold">
              {connectionStatus === 'testing' && 'Testing Connection...'}
              {connectionStatus === 'connected' && 'Connected Successfully!'}
              {connectionStatus === 'failed' && 'Connection Failed'}
            </p>
            <p className="text-sm opacity-75">
              Backend: http://localhost:8000
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800 font-medium">Error:</p>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {healthData && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <p className="text-green-800 font-medium">Health Check:</p>
          <pre className="text-green-700 text-sm mt-2 overflow-auto">
            {JSON.stringify(healthData, null, 2)}
          </pre>
        </div>
      )}

      <button
        onClick={testConnection}
        disabled={connectionStatus === 'testing'}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        {connectionStatus === 'testing' ? 'Testing...' : 'Test Again'}
      </button>

      <div className="mt-4 text-xs text-gray-500">
        <p>Frontend: http://localhost:3001</p>
        <p>Backend: http://localhost:8000</p>
        <p>API: http://localhost:8000/api/</p>
      </div>
    </div>
  );
};

export default APITest;
