import React, { useState, useEffect } from 'react';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import {
  CogIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  GlobeAltIcon,
  EyeIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  date_format: string;
  time_format: '12h' | '24h';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    desktop: boolean;
  };
  notification_types: {
    announcements: boolean;
    assignments: boolean;
    grades: boolean;
    attendance: boolean;
    events: boolean;
    messages: boolean;
  };
  display: {
    compact_mode: boolean;
    show_avatars: boolean;
    auto_refresh: boolean;
    refresh_interval: number;
  };
  accessibility: {
    high_contrast: boolean;
    large_text: boolean;
    reduce_motion: boolean;
    screen_reader: boolean;
  };
}

const Preferences: React.FC = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalPreferences, setOriginalPreferences] = useState<UserPreferences | null>(null);

  useEffect(() => {
    // Mock data for demonstration
    const mockPreferences: UserPreferences = {
      theme: 'light',
      language: 'en',
      timezone: 'America/New_York',
      date_format: 'MM/DD/YYYY',
      time_format: '12h',
      notifications: {
        email: true,
        push: true,
        sms: false,
        desktop: true
      },
      notification_types: {
        announcements: true,
        assignments: true,
        grades: true,
        attendance: false,
        events: true,
        messages: true
      },
      display: {
        compact_mode: false,
        show_avatars: true,
        auto_refresh: true,
        refresh_interval: 30
      },
      accessibility: {
        high_contrast: false,
        large_text: false,
        reduce_motion: false,
        screen_reader: false
      }
    };

    setTimeout(() => {
      setPreferences(mockPreferences);
      setOriginalPreferences(mockPreferences);
      setLoading(false);
    }, 1000);
  }, []);

  const handlePreferenceChange = (category: string, field: string, value: any) => {
    if (!preferences) return;

    const categoryValue = preferences[category as keyof UserPreferences];
    if (typeof categoryValue !== 'object' || categoryValue === null) return;

    const newPreferences = {
      ...preferences,
      [category]: {
        ...categoryValue,
        [field]: value
      }
    };

    setPreferences(newPreferences);
    setHasChanges(true);
  };

  const handleSimplePreferenceChange = (field: string, value: any) => {
    if (!preferences) return;

    const newPreferences = {
      ...preferences,
      [field]: value
    };

    setPreferences(newPreferences);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setOriginalPreferences(preferences);
    setHasChanges(false);
    setSaving(false);
  };

  const handleReset = () => {
    if (originalPreferences) {
      setPreferences(originalPreferences);
      setHasChanges(false);
    }
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

  if (!preferences) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <CogIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Preferences not found</h3>
          <p className="text-gray-600">Unable to load preferences.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Preferences</h1>
          <p className="text-gray-600">Customize your experience and notification settings</p>
        </div>
        {hasChanges && (
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleReset}>
              <XMarkIcon className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <CheckIcon className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance */}
        <Card>
          <CardHeader title="Appearance" />
          <div className="p-6 space-y-6">
            {/* Theme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'light', label: 'Light', icon: SunIcon },
                  { value: 'dark', label: 'Dark', icon: MoonIcon },
                  { value: 'auto', label: 'Auto', icon: CogIcon }
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => handleSimplePreferenceChange('theme', value)}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      preferences.theme === value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-6 h-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select
                value={preferences.language}
                onChange={(e) => handleSimplePreferenceChange('language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="zh">中文</option>
                <option value="ja">日本語</option>
              </select>
            </div>

            {/* Time Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="12h"
                    checked={preferences.time_format === '12h'}
                    onChange={(e) => handleSimplePreferenceChange('time_format', e.target.value)}
                    className="mr-2"
                  />
                  12-hour (AM/PM)
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="24h"
                    checked={preferences.time_format === '24h'}
                    onChange={(e) => handleSimplePreferenceChange('time_format', e.target.value)}
                    className="mr-2"
                  />
                  24-hour
                </label>
              </div>
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader title="Notifications" />
          <div className="p-6 space-y-6">
            {/* Notification Channels */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Notification Channels</h4>
              <div className="space-y-3">
                {[
                  { key: 'email', label: 'Email Notifications', icon: BellIcon },
                  { key: 'push', label: 'Push Notifications', icon: BellIcon },
                  { key: 'sms', label: 'SMS Notifications', icon: BellIcon },
                  { key: 'desktop', label: 'Desktop Notifications', icon: BellIcon }
                ].map(({ key, label, icon: Icon }) => (
                  <label key={key} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Icon className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-700">{label}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.notifications[key as keyof typeof preferences.notifications]}
                      onChange={(e) => handlePreferenceChange('notifications', key, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Notification Types */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Notification Types</h4>
              <div className="space-y-3">
                {[
                  { key: 'announcements', label: 'Announcements' },
                  { key: 'assignments', label: 'Assignments' },
                  { key: 'grades', label: 'Grades & Results' },
                  { key: 'attendance', label: 'Attendance Updates' },
                  { key: 'events', label: 'Events & Activities' },
                  { key: 'messages', label: 'Messages' }
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{label}</span>
                    <input
                      type="checkbox"
                      checked={preferences.notification_types[key as keyof typeof preferences.notification_types]}
                      onChange={(e) => handlePreferenceChange('notification_types', key, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Display Settings */}
        <Card>
          <CardHeader title="Display Settings" />
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div className="flex items-center">
                  <EyeIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">Compact Mode</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.display.compact_mode}
                  onChange={(e) => handlePreferenceChange('display', 'compact_mode', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between">
                <div className="flex items-center">
                  <EyeIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">Show Avatars</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.display.show_avatars}
                  onChange={(e) => handlePreferenceChange('display', 'show_avatars', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between">
                <div className="flex items-center">
                  <GlobeAltIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">Auto Refresh</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.display.auto_refresh}
                  onChange={(e) => handlePreferenceChange('display', 'auto_refresh', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>

              {preferences.display.auto_refresh && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refresh Interval (seconds)
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="300"
                    step="10"
                    value={preferences.display.refresh_interval}
                    onChange={(e) => handlePreferenceChange('display', 'refresh_interval', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>10s</span>
                    <span>{preferences.display.refresh_interval}s</span>
                    <span>300s</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Accessibility */}
        <Card>
          <CardHeader title="Accessibility" />
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div className="flex items-center">
                  <EyeIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">High Contrast</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.accessibility.high_contrast}
                  onChange={(e) => handlePreferenceChange('accessibility', 'high_contrast', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between">
                <div className="flex items-center">
                  <EyeIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">Large Text</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.accessibility.large_text}
                  onChange={(e) => handlePreferenceChange('accessibility', 'large_text', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between">
                <div className="flex items-center">
                  <SpeakerXMarkIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">Reduce Motion</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.accessibility.reduce_motion}
                  onChange={(e) => handlePreferenceChange('accessibility', 'reduce_motion', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between">
                <div className="flex items-center">
                  <SpeakerWaveIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">Screen Reader Support</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.accessibility.screen_reader}
                  onChange={(e) => handlePreferenceChange('accessibility', 'screen_reader', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Preferences;


