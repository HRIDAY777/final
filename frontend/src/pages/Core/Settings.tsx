import React, { useEffect, useState } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { Button } from '../../components/UI/Button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../../components/UI/Select';
import { Textarea } from '../../components/UI/Textarea';

import {
  CogIcon,
  ShieldCheckIcon,
  ServerIcon,
  CircleStackIcon,
  BellIcon
} from '@heroicons/react/24/outline';

interface SystemSetting {
  id: string;
  category: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description: string;
  is_editable: boolean;
}

interface SettingCategory {
  name: string;
  icon: any;
  description: string;
  settings: SystemSetting[];
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SettingCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // Mock data for now - replace with actual API calls
      const mockSettings: SettingCategory[] = [
        {
          name: 'General',
          icon: CogIcon,
          description: 'Basic system configuration',
          settings: [
            {
              id: '1',
              category: 'general',
              key: 'site_name',
              value: 'EduCore Ultra',
              type: 'string',
              description: 'Name of the application',
              is_editable: true
            },
            {
              id: '2',
              category: 'general',
              key: 'site_description',
              value: 'Comprehensive School Management System',
              type: 'string',
              description: 'Application description',
              is_editable: true
            },
            {
              id: '3',
              category: 'general',
              key: 'timezone',
              value: 'UTC',
              type: 'string',
              description: 'Default timezone',
              is_editable: true
            },
            {
              id: '4',
              category: 'general',
              key: 'language',
              value: 'en',
              type: 'string',
              description: 'Default language',
              is_editable: true
            }
          ]
        },
        {
          name: 'Security',
          icon: ShieldCheckIcon,
          description: 'Security and authentication settings',
          settings: [
            {
              id: '5',
              category: 'security',
              key: 'session_timeout',
              value: '3600',
              type: 'number',
              description: 'Session timeout in seconds',
              is_editable: true
            },
            {
              id: '6',
              category: 'security',
              key: 'password_min_length',
              value: '8',
              type: 'number',
              description: 'Minimum password length',
              is_editable: true
            },
            {
              id: '7',
              category: 'security',
              key: 'enable_2fa',
              value: 'true',
              type: 'boolean',
              description: 'Enable two-factor authentication',
              is_editable: true
            },
            {
              id: '8',
              category: 'security',
              key: 'max_login_attempts',
              value: '5',
              type: 'number',
              description: 'Maximum login attempts',
              is_editable: true
            }
          ]
        },
        {
          name: 'Database',
          icon: CircleStackIcon,
          description: 'Database configuration settings',
          settings: [
            {
              id: '9',
              category: 'database',
              key: 'backup_retention_days',
              value: '30',
              type: 'number',
              description: 'Number of days to retain backups',
              is_editable: true
            },
            {
              id: '10',
              category: 'database',
              key: 'auto_backup',
              value: 'true',
              type: 'boolean',
              description: 'Enable automatic database backups',
              is_editable: true
            },
            {
              id: '11',
              category: 'database',
              key: 'backup_time',
              value: '02:00',
              type: 'string',
              description: 'Daily backup time (HH:MM)',
              is_editable: true
            }
          ]
        },
        {
          name: 'Email',
          icon: BellIcon,
          description: 'Email notification settings',
          settings: [
            {
              id: '12',
              category: 'email',
              key: 'smtp_host',
              value: 'smtp.gmail.com',
              type: 'string',
              description: 'SMTP server host',
              is_editable: true
            },
            {
              id: '13',
              category: 'email',
              key: 'smtp_port',
              value: '587',
              type: 'number',
              description: 'SMTP server port',
              is_editable: true
            },
            {
              id: '14',
              category: 'email',
              key: 'smtp_username',
              value: 'noreply@educore.com',
              type: 'string',
              description: 'SMTP username',
              is_editable: true
            },
            {
              id: '15',
              category: 'email',
              key: 'enable_email_notifications',
              value: 'true',
              type: 'boolean',
              description: 'Enable email notifications',
              is_editable: true
            }
          ]
        },
        {
          name: 'System',
          icon: ServerIcon,
          description: 'System performance and maintenance',
          settings: [
            {
              id: '16',
              category: 'system',
              key: 'maintenance_mode',
              value: 'false',
              type: 'boolean',
              description: 'Enable maintenance mode',
              is_editable: true
            },
            {
              id: '17',
              category: 'system',
              key: 'log_retention_days',
              value: '90',
              type: 'number',
              description: 'Number of days to retain logs',
              is_editable: true
            },
            {
              id: '18',
              category: 'system',
              key: 'cache_timeout',
              value: '300',
              type: 'number',
              description: 'Cache timeout in seconds',
              is_editable: true
            }
          ]
        }
      ];

      setSettings(mockSettings);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (categoryName: string, settingKey: string, value: string) => {
    setSettings(prev => prev.map(category => {
      if (category.name.toLowerCase() === categoryName.toLowerCase()) {
        return {
          ...category,
          settings: category.settings.map(setting => {
            if (setting.key === settingKey) {
              return { ...setting, value };
            }
            return setting;
          })
        };
      }
      return category;
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      // Collect all changed settings
      const changedSettings = settings.flatMap(category =>
        category.settings.map(setting => ({
          id: setting.id,
          key: setting.key,
          value: setting.value,
          category: setting.category
        }))
      );

      // Mock API call - replace with actual API call
      console.log('Saving settings:', changedSettings);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderSettingInput = (setting: SystemSetting, categoryName: string) => {
    if (!setting.is_editable) {
      return (
        <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded border">
          {setting.value}
        </div>
      );
    }

    switch (setting.type) {
      case 'boolean':
        return (
          <Select
            value={setting.value}
            onValueChange={(value) => handleSettingChange(categoryName, setting.key, value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Enabled</SelectItem>
              <SelectItem value="false">Disabled</SelectItem>
            </SelectContent>
          </Select>
        );
      case 'number':
        return (
          <input
            type="number"
            value={setting.value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSettingChange(categoryName, setting.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
      case 'json':
        return (
          <Textarea
            value={setting.value}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleSettingChange(categoryName, setting.key, e.target.value)}
            rows={3}
          />
        );
      default:
        return (
          <input
            type="text"
            value={setting.value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSettingChange(categoryName, setting.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
    }
  };

  const activeCategory = settings.find(cat => 
    cat.name.toLowerCase() === activeTab.toLowerCase()
  );

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
        title="System Settings"
        subtitle="Configure system-wide settings and preferences"
        actions={
          <Button onClick={handleSaveSettings} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <div className="space-y-2">
              {settings.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setActiveTab(category.name.toLowerCase())}
                  className={`w-full flex items-center p-3 text-left rounded-lg transition-colors ${
                    activeTab === category.name.toLowerCase()
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'hover:bg-gray-50 border-transparent text-gray-700'
                  } border`}
                >
                  <category.icon className="w-5 h-5 mr-3" />
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-xs text-gray-500">{category.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <Card>
            {activeCategory ? (
              <div>
                <div className="flex items-center mb-6">
                  <activeCategory.icon className="w-6 h-6 text-gray-400 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{activeCategory.name} Settings</h3>
                    <p className="text-sm text-gray-500">{activeCategory.description}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {activeCategory.settings.map((setting) => (
                    <div key={setting.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </label>
                          <p className="text-xs text-gray-500">{setting.description}</p>
                        </div>
                        <div className="md:col-span-2">
                          {renderSettingInput(setting, activeCategory.name)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CogIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Select a category to view settings</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
