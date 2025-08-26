import React, { useState, useEffect } from 'react';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';

import {
  ShieldCheckIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  QrCodeIcon,
} from '@heroicons/react/24/outline';

interface SecuritySettings {
  two_factor_enabled: boolean;
  two_factor_method: 'app' | 'sms' | 'email';
  password_last_changed: string;
  sessions: Session[];
  login_history: LoginHistory[];
  security_alerts: SecurityAlert[];
}

interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip_address: string;
  last_activity: string;
  is_current: boolean;
}

interface LoginHistory {
  id: string;
  timestamp: string;
  device: string;
  browser: string;
  location: string;
  ip_address: string;
  status: 'success' | 'failed';
}

interface SecurityAlert {
  id: string;
  type: 'login_attempt' | 'password_change' | '2fa_enabled' | 'suspicious_activity';
  message: string;
  timestamp: string;
  is_read: boolean;
}

const Security: React.FC = () => {
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [qrCode, setQrCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  useEffect(() => {
    // Mock data for demonstration
    const mockSettings: SecuritySettings = {
      two_factor_enabled: false,
      two_factor_method: 'app',
      password_last_changed: '2024-01-15T10:00:00Z',
      sessions: [
        {
          id: '1',
          device: 'MacBook Pro',
          browser: 'Chrome 120.0.0.0',
          location: 'New York, NY, USA',
          ip_address: '192.168.1.100',
          last_activity: '2024-12-15T14:30:00Z',
          is_current: true
        },
        {
          id: '2',
          device: 'iPhone 15',
          browser: 'Safari Mobile',
          location: 'New York, NY, USA',
          ip_address: '192.168.1.101',
          last_activity: '2024-12-14T09:15:00Z',
          is_current: false
        },
        {
          id: '3',
          device: 'Windows PC',
          browser: 'Firefox 121.0',
          location: 'Los Angeles, CA, USA',
          ip_address: '203.0.113.45',
          last_activity: '2024-12-10T16:20:00Z',
          is_current: false
        }
      ],
      login_history: [
        {
          id: '1',
          timestamp: '2024-12-15T14:30:00Z',
          device: 'MacBook Pro',
          browser: 'Chrome 120.0.0.0',
          location: 'New York, NY, USA',
          ip_address: '192.168.1.100',
          status: 'success'
        },
        {
          id: '2',
          timestamp: '2024-12-15T14:25:00Z',
          device: 'MacBook Pro',
          browser: 'Chrome 120.0.0.0',
          location: 'New York, NY, USA',
          ip_address: '192.168.1.100',
          status: 'failed'
        },
        {
          id: '3',
          timestamp: '2024-12-14T09:15:00Z',
          device: 'iPhone 15',
          browser: 'Safari Mobile',
          location: 'New York, NY, USA',
          ip_address: '192.168.1.101',
          status: 'success'
        }
      ],
      security_alerts: [
        {
          id: '1',
          type: 'login_attempt',
          message: 'Failed login attempt from unknown device',
          timestamp: '2024-12-15T14:25:00Z',
          is_read: false
        },
        {
          id: '2',
          type: 'password_change',
          message: 'Password changed successfully',
          timestamp: '2024-01-15T10:00:00Z',
          is_read: true
        }
      ]
    };

    setTimeout(() => {
      setSettings(mockSettings);
      setLoading(false);
    }, 1000);
  }, []);

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert('New passwords do not match');
      return;
    }

    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setShowPasswordForm(false);
    setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    setSaving(false);
  };

  const handleEnable2FA = async () => {
    setSaving(true);
    // Simulate API call to generate QR code
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setQrCode('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    setBackupCodes(['12345678', '87654321', '11111111', '22222222', '33333333', '44444444', '55555555', '66666666']);
    setShow2FASetup(true);
    setSaving(false);
  };

  const handleDisable2FA = async () => {
    if (!confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return;
    }

    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (settings) {
      setSettings({ ...settings, two_factor_enabled: false });
    }
    setSaving(false);
  };

  const handleTerminateSession = async (sessionId: string) => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (settings) {
      setSettings({
        ...settings,
        sessions: settings.sessions.filter(s => s.id !== sessionId)
      });
    }
    setSaving(false);
  };

  const handleTerminateAllSessions = async () => {
    if (!confirm('Are you sure you want to terminate all other sessions? You will be logged out from all other devices.')) {
      return;
    }

    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (settings) {
      setSettings({
        ...settings,
        sessions: settings.sessions.filter(s => s.is_current)
      });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <ShieldCheckIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Security settings not found</h3>
          <p className="text-gray-600">Unable to load security information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Security</h1>
        <p className="text-gray-600">Manage your account security and privacy settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Password Security */}
        <Card>
          <CardHeader title="Password Security" />
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Password</h3>
                <p className="text-sm text-gray-600">
                  Last changed: {new Date(settings.password_last_changed).toLocaleDateString()}
                </p>
              </div>
              <Button onClick={() => setShowPasswordForm(true)}>
                <KeyIcon className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            </div>

            {showPasswordForm && (
              <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                                         <input
                       type={showPasswords.current ? 'text' : 'password'}
                       value={passwordData.current_password}
                       onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePasswordChange('current_password', e.target.value)}
                       placeholder="Enter current password"
                       className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                     />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => togglePasswordVisibility('current')}
                    >
                      {showPasswords.current ? (
                        <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                                         <input
                       type={showPasswords.new ? 'text' : 'password'}
                       value={passwordData.new_password}
                       onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePasswordChange('new_password', e.target.value)}
                       placeholder="Enter new password"
                       className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                     />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => togglePasswordVisibility('new')}
                    >
                      {showPasswords.new ? (
                        <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                                         <input
                       type={showPasswords.confirm ? 'text' : 'password'}
                       value={passwordData.confirm_password}
                       onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePasswordChange('confirm_password', e.target.value)}
                       placeholder="Confirm new password"
                       className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                     />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => togglePasswordVisibility('confirm')}
                    >
                      {showPasswords.confirm ? (
                        <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setShowPasswordForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleChangePassword} disabled={saving}>
                    {saving ? 'Changing...' : 'Change Password'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Two-Factor Authentication */}
        <Card>
          <CardHeader title="Two-Factor Authentication" />
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">2FA Status</h3>
                <p className="text-sm text-gray-600">
                  {settings.two_factor_enabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              {settings.two_factor_enabled ? (
                <Button variant="outline" onClick={handleDisable2FA} disabled={saving}>
                  <XMarkIcon className="w-4 h-4 mr-2" />
                  Disable 2FA
                </Button>
              ) : (
                <Button onClick={handleEnable2FA} disabled={saving}>
                  <DevicePhoneMobileIcon className="w-4 h-4 mr-2" />
                  Enable 2FA
                </Button>
              )}
            </div>

            {show2FASetup && (
              <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="text-center">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Scan QR Code</h4>
                  <div className="inline-block p-2 bg-white border border-gray-200 rounded">
                    <img src={qrCode} alt="QR Code" className="w-32 h-32" />
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Scan this QR code with your authenticator app
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Backup Codes</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="bg-gray-50 p-2 rounded text-center font-mono text-sm">
                        {code}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Save these codes in a secure location. You can use them to access your account if you lose your device.
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => setShow2FASetup(false)}>
                    Done
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Active Sessions */}
        <Card>
          <CardHeader title="Active Sessions" />
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {settings.sessions.length} active session{settings.sessions.length !== 1 ? 's' : ''}
              </span>
              {settings.sessions.filter(s => !s.is_current).length > 0 && (
                                 <Button variant="outline" onClick={handleTerminateAllSessions}>
                   Terminate All Others
                 </Button>
              )}
            </div>

            <div className="space-y-3">
              {settings.sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <ComputerDesktopIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{session.device}</p>
                      <p className="text-xs text-gray-600">
                        {session.browser} • {session.location}
                      </p>
                      <p className="text-xs text-gray-500">
                        Last activity: {new Date(session.last_activity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {session.is_current && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Current
                      </span>
                    )}
                    {!session.is_current && (
                                             <Button
                         variant="outline"
                         onClick={() => handleTerminateSession(session.id)}
                         disabled={saving}
                       >
                         Terminate
                       </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Security Alerts */}
        <Card>
          <CardHeader title="Security Alerts" />
          <div className="p-6 space-y-4">
            <div className="space-y-3">
              {settings.security_alerts.map((alert) => (
                <div key={alert.id} className={`flex items-start space-x-3 p-3 rounded-lg ${
                  alert.is_read ? 'bg-gray-50' : 'bg-yellow-50 border border-yellow-200'
                }`}>
                  <ExclamationTriangleIcon className={`w-5 h-5 mt-0.5 ${
                    alert.is_read ? 'text-gray-400' : 'text-yellow-600'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {!alert.is_read && (
                    <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Login History */}
      <Card>
        <CardHeader title="Recent Login History" />
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-gray-600">
                <tr>
                  <th className="py-2 pr-4">Date & Time</th>
                  <th className="py-2 pr-4">Device</th>
                  <th className="py-2 pr-4">Location</th>
                  <th className="py-2 pr-4">IP Address</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {settings.login_history.map((login) => (
                  <tr key={login.id} className="border-t">
                    <td className="py-3 pr-4">
                      {new Date(login.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 pr-4">{login.device}</td>
                    <td className="py-3 pr-4">{login.location}</td>
                    <td className="py-3 pr-4">{login.ip_address}</td>
                    <td className="py-3 pr-0">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        login.status === 'success' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {login.status === 'success' ? 'Success' : 'Failed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Security;


