import React, { useState } from 'react';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import {
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';

const Security: React.FC = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [securitySettings, setSecuritySettings] = useState({
    mfa_enabled: false,
    email_notifications: true,
    login_alerts: true,
    session_timeout: 30,
    require_password_change: false
  });

  const [recentSessions] = useState([
    {
      id: '1',
      device: 'Chrome on Windows',
      location: 'New York, NY',
      ip: '192.168.1.1',
      last_activity: '2024-01-15T10:30:00Z',
      is_current: true
    },
    {
      id: '2',
      device: 'Safari on iPhone',
      location: 'New York, NY',
      ip: '192.168.1.2',
      last_activity: '2024-01-14T16:20:00Z',
      is_current: false
    },
    {
      id: '3',
      device: 'Firefox on Mac',
      location: 'San Francisco, CA',
      ip: '192.168.1.3',
      last_activity: '2024-01-13T09:15:00Z',
      is_current: false
    }
  ]);

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    setIsChangingPassword(true);
    // TODO: Implement API call to change password
    setTimeout(() => {
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      alert('Password changed successfully');
    }, 2000);
  };

  const handleToggle2FA = () => {
    if (!securitySettings.mfa_enabled) {
      setIsSettingUp2FA(true);
    } else {
      if (window.confirm('Are you sure you want to disable 2FA?')) {
        setSecuritySettings(prev => ({ ...prev, mfa_enabled: false }));
      }
    }
  };

  const handleVerify2FA = () => {
    if (twoFactorCode.length === 6) {
      setSecuritySettings(prev => ({ ...prev, mfa_enabled: true }));
      setIsSettingUp2FA(false);
      setTwoFactorCode('');
      alert('2FA enabled successfully');
    } else {
      alert('Please enter a valid 6-digit code');
    }
  };

  const handleTerminateSession = (sessionId: string) => {
    if (window.confirm('Are you sure you want to terminate this session?')) {
      // TODO: Implement API call to terminate session
      console.log('Terminating session:', sessionId);
    }
  };

  const handleTerminateAllSessions = () => {
    if (window.confirm('Are you sure you want to terminate all other sessions?')) {
      // TODO: Implement API call to terminate all sessions
      console.log('Terminating all sessions');
    }
  };

  const renderPasswordInput = (label: string, field: keyof typeof passwordData, showPassword: boolean, setShowPassword: (show: boolean) => void) => ( // eslint-disable-line no-unused-vars
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={passwordData[field]}
          onChange={(e) => handlePasswordChange(field, e.target.value)}
          className="w-full pr-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          {showPassword ? (
            <EyeSlashIcon className="h-5 w-5 text-gray-400" />
          ) : (
            <EyeIcon className="h-5 w-5 text-gray-400" />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Security Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account security and authentication settings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Password Management */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Change Password" />
            <div className="p-6 space-y-4">
              {renderPasswordInput('Current Password', 'currentPassword', showCurrentPassword, setShowCurrentPassword)}
              {renderPasswordInput('New Password', 'newPassword', showNewPassword, setShowNewPassword)}
              {renderPasswordInput('Confirm New Password', 'confirmPassword', showConfirmPassword, setShowConfirmPassword)}
              
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Password Requirements</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• At least 8 characters long</li>
                  <li>• Contains uppercase and lowercase letters</li>
                  <li>• Contains at least one number</li>
                  <li>• Contains at least one special character</li>
                </ul>
              </div>

              <Button
                onClick={handleChangePassword}
                disabled={isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                className="w-full"
              >
                {isChangingPassword ? 'Changing Password...' : 'Change Password'}
              </Button>
            </div>
          </Card>

          {/* Two-Factor Authentication */}
          <Card>
            <CardHeader title="Two-Factor Authentication" />
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">2FA Status</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {securitySettings.mfa_enabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                <div className={`flex items-center ${securitySettings.mfa_enabled ? 'text-green-600' : 'text-gray-400'}`}>
                  {securitySettings.mfa_enabled ? (
                    <CheckCircleIcon className="h-5 w-5" />
                  ) : (
                    <XMarkIcon className="h-5 w-5" />
                  )}
                </div>
              </div>

              {!securitySettings.mfa_enabled && !isSettingUp2FA && (
                <Button onClick={handleToggle2FA} variant="outline" className="w-full">
                  <DevicePhoneMobileIcon className="h-4 w-4 mr-2" />
                  Set Up 2FA
                </Button>
              )}

              {isSettingUp2FA && (
                <div className="space-y-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
                    <QrCodeIcon className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Scan this QR code with your authenticator app</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleVerify2FA} className="flex-1">
                      Verify & Enable
                    </Button>
                    <Button onClick={() => setIsSettingUp2FA(false)} variant="outline">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {securitySettings.mfa_enabled && (
                <Button onClick={handleToggle2FA} variant="outline" className="w-full text-red-600 border-red-300 hover:bg-red-50">
                  Disable 2FA
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Security Preferences */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Security Preferences" />
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Email Notifications</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get notified of security events</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={securitySettings.email_notifications}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, email_notifications: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Login Alerts</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Alert on new device logins</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={securitySettings.login_alerts}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, login_alerts: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Session Timeout (minutes)
                </label>
                <select
                  value={securitySettings.session_timeout}
                  onChange={(e) => setSecuritySettings(prev => ({ ...prev, session_timeout: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                  <option value={480}>8 hours</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Active Sessions */}
          <Card>
            <CardHeader title="Active Sessions" />
            <div className="p-6 space-y-4">
              {recentSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {session.device}
                      </h4>
                      {session.is_current && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {session.location} • {session.ip}
                    </p>
                    <p className="text-xs text-gray-500">
                      Last activity: {new Date(session.last_activity).toLocaleString()}
                    </p>
                  </div>
                  {!session.is_current && (
                    <Button
                      onClick={() => handleTerminateSession(session.id)}
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Terminate
                    </Button>
                  )}
                </div>
              ))}

              <Button
                onClick={handleTerminateAllSessions}
                variant="outline"
                className="w-full text-red-600 border-red-300 hover:bg-red-50"
              >
                Terminate All Other Sessions
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Security Status */}
      <Card>
        <CardHeader title="Security Status" />
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className={`p-2 rounded-lg ${securitySettings.mfa_enabled ? 'bg-green-100' : 'bg-red-100'}`}>
                {securitySettings.mfa_enabled ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                ) : (
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Two-Factor Auth</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {securitySettings.mfa_enabled ? 'Enabled' : 'Not enabled'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <EnvelopeIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Email Verified</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Verified</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Account Security</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Good</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Security;
