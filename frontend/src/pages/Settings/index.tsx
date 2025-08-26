import React, { useEffect, useState } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { Button } from '../../components/UI/Button';
import { apiService } from '../../services/api';
import LanguageSelector from '../../components/UI/LanguageSelector';
import { useTranslation } from '../../utils/i18n';
import {
  CogIcon,
  UserIcon,
  ShieldCheckIcon,
  BellIcon,
  GlobeAltIcon,
  KeyIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface SettingsStats {
  total_settings: number;
  public_settings: number;
  required_settings: number;
  settings_by_category: Record<string, number>;
  total_preferences: number;
  preferences_by_category: Record<string, number>;
  total_configs: number;
  active_configs: number;
  total_feature_flags: number;
  enabled_feature_flags: number;
  recent_changes: Array<{
    id: string;
    setting_key: string;
    action: string;
    user_name: string;
    timestamp: string;
  }>;
}

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<SettingsStats>({
    total_settings: 0,
    public_settings: 0,
    required_settings: 0,
    settings_by_category: {},
    total_preferences: 0,
    preferences_by_category: {},
    total_configs: 0,
    active_configs: 0,
    total_feature_flags: 0,
    enabled_feature_flags: 0,
    recent_changes: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettingsStats();
  }, []);

  const fetchSettingsStats = async () => {
    try {
      setLoading(true);
      
      // Mock data for now - replace with actual API call
      const mockStats: SettingsStats = {
        total_settings: 45,
        public_settings: 23,
        required_settings: 12,
        settings_by_category: {
          'general': 8,
          'email': 6,
          'security': 10,
          'database': 4,
          'file_upload': 5,
          'notification': 7,
          'payment': 3,
          'integration': 2
        },
        total_preferences: 156,
        preferences_by_category: {
          'interface': 45,
          'notification': 38,
          'privacy': 23,
          'accessibility': 18,
          'language': 12,
          'timezone': 10,
          'theme': 8,
          'dashboard': 2
        },
        total_configs: 15,
        active_configs: 12,
        total_feature_flags: 8,
        enabled_feature_flags: 5,
        recent_changes: [
          {
            id: '1',
            setting_key: 'email.smtp_host',
            action: 'updated',
            user_name: 'Admin User',
            timestamp: '2024-01-20T10:30:00Z'
          },
          {
            id: '2',
            setting_key: 'security.password_min_length',
            action: 'updated',
            user_name: 'System Admin',
            timestamp: '2024-01-19T15:45:00Z'
          },
          {
            id: '3',
            setting_key: 'notification.email_enabled',
            action: 'created',
            user_name: 'Admin User',
            timestamp: '2024-01-18T09:15:00Z'
          },
          {
            id: '4',
            setting_key: 'feature.advanced_analytics',
            action: 'activated',
            user_name: 'System Admin',
            timestamp: '2024-01-17T14:20:00Z'
          },
          {
            id: '5',
            setting_key: 'payment.stripe_enabled',
            action: 'updated',
            user_name: 'Admin User',
            timestamp: '2024-01-16T11:30:00Z'
          }
        ]
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching settings stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'general':
        return <CogIcon className="w-5 h-5" />;
      case 'security':
        return <ShieldCheckIcon className="w-5 h-5" />;
      case 'email':
        return <DocumentTextIcon className="w-5 h-5" />;
      case 'notification':
        return <BellIcon className="w-5 h-5" />;
      case 'payment':
        return <KeyIcon className="w-5 h-5" />;
      case 'integration':
        return <GlobeAltIcon className="w-5 h-5" />;
      case 'interface':
        return <UserIcon className="w-5 h-5" />;
      case 'privacy':
        return <EyeIcon className="w-5 h-5" />;
      default:
        return <CogIcon className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'general':
        return 'bg-blue-100 text-blue-600';
      case 'security':
        return 'bg-red-100 text-red-600';
      case 'email':
        return 'bg-green-100 text-green-600';
      case 'notification':
        return 'bg-yellow-100 text-yellow-600';
      case 'payment':
        return 'bg-purple-100 text-purple-600';
      case 'integration':
        return 'bg-indigo-100 text-indigo-600';
      case 'interface':
        return 'bg-pink-100 text-pink-600';
      case 'privacy':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'text-green-600 bg-green-50';
      case 'updated':
        return 'text-blue-600 bg-blue-50';
      case 'deleted':
        return 'text-red-600 bg-red-50';
      case 'activated':
        return 'text-green-600 bg-green-50';
      case 'deactivated':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const quickActions = [
    {
      name: 'System Settings',
      description: 'Manage system-wide configuration',
      icon: CogIcon,
      action: () => console.log('System settings clicked')
    },
    {
      name: 'User Preferences',
      description: 'Manage user-specific preferences',
      icon: UserIcon,
      action: () => console.log('User preferences clicked')
    },
    {
      name: 'Feature Flags',
      description: 'Enable/disable features',
      icon: ChartBarIcon,
      action: () => console.log('Feature flags clicked')
    },
    {
      name: 'Security Settings',
      description: 'Configure security parameters',
      icon: ShieldCheckIcon,
      action: () => console.log('Security settings clicked')
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('nav.settings')}
        subtitle="Manage system configuration, user preferences, and feature flags"
        actions={
          <div className="flex items-center space-x-4">
            <LanguageSelector variant="buttons" />
            <Button onClick={() => console.log('Create setting')}>
              <CogIcon className="w-4 h-4 mr-2" />
              {t('common.add')} {t('nav.settings')}
            </Button>
          </div>
        }
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CogIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Settings</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total_settings}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">User Preferences</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total_preferences}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Configs</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.active_configs}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <KeyIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Feature Flags</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.enabled_feature_flags}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <CogIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <button
                key={action.name}
                onClick={action.action}
                className="w-full flex items-center p-3 text-left rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <action.icon className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{action.name}</p>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Settings by Category */}
        <Card className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Settings by Category</h3>
            <ChartBarIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {Object.entries(stats.settings_by_category).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${getCategoryColor(category)}`}>
                    {getCategoryIcon(category)}
                  </div>
                  <span className="ml-2 text-sm font-medium capitalize">{category}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Preferences by Category */}
        <Card className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Preferences by Category</h3>
            <UserIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {Object.entries(stats.preferences_by_category).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${getCategoryColor(category)}`}>
                    {getCategoryIcon(category)}
                  </div>
                  <span className="ml-2 text-sm font-medium capitalize">{category}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Changes */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Setting Changes</h3>
          <Button variant="outline">
            View All
          </Button>
        </div>
        <div className="space-y-3">
          {stats.recent_changes.map((change) => (
            <div key={change.id} className="flex items-center p-3 rounded-lg border">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${getCategoryColor('general')}`}>
                  <CogIcon className="w-5 h-5" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">{change.setting_key}</p>
                  <p className="text-xs text-gray-500">
                    Changed by {change.user_name}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">
                  {new Date(change.timestamp).toLocaleDateString()}
                </p>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(change.action)}`}>
                  {change.action}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* System Health */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
          <CheckCircleIcon className="w-5 h-5 text-green-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center p-3 rounded-lg border">
            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">Required Settings</p>
              <p className="text-xs text-gray-500">{stats.required_settings} configured</p>
            </div>
          </div>
          <div className="flex items-center p-3 rounded-lg border">
            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">Public Settings</p>
              <p className="text-xs text-gray-500">{stats.public_settings} available</p>
            </div>
          </div>
          <div className="flex items-center p-3 rounded-lg border">
            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">Feature Flags</p>
              <p className="text-xs text-gray-500">{stats.enabled_feature_flags} active</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;

