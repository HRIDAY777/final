import React, { useEffect, useState } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { Button } from '../../components/UI/Button';

import {
  CogIcon,
  ServerIcon,
  CircleStackIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  CloudArrowUpIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface SystemStats {
  total_users: number;
  active_users: number;
  total_tenants: number;
  active_tenants: number;
  database_size: string;
  storage_used: string;
  uptime: string;
  system_load: number;
  memory_usage: number;
  disk_usage: number;
}

interface HealthStatus {
  database: 'healthy' | 'warning' | 'error';
  cache: 'healthy' | 'warning' | 'error';
  storage: 'healthy' | 'warning' | 'error';
  memory: 'healthy' | 'warning' | 'error';
  cpu: 'healthy' | 'warning' | 'error';
  network: 'healthy' | 'warning' | 'error';
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

const Core: React.FC = () => {
  const [stats, setStats] = useState<SystemStats>({
    total_users: 0,
    active_users: 0,
    total_tenants: 0,
    active_tenants: 0,
    database_size: '0 MB',
    storage_used: '0 GB',
    uptime: '0 days',
    system_load: 0,
    memory_usage: 0,
    disk_usage: 0
  });

  const [healthStatus, setHealthStatus] = useState<HealthStatus>({
    database: 'healthy',
    cache: 'healthy',
    storage: 'healthy',
    memory: 'healthy',
    cpu: 'healthy',
    network: 'healthy'
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemData();
  }, []);

  const fetchSystemData = async () => {
    try {
      setLoading(true);
      
      // Mock data for now - replace with actual API calls
      const mockStats: SystemStats = {
        total_users: 1250,
        active_users: 890,
        total_tenants: 45,
        active_tenants: 42,
        database_size: '2.5 GB',
        storage_used: '15.8 GB',
        uptime: '15 days',
        system_load: 0.45,
        memory_usage: 65,
        disk_usage: 78
      };

      const mockHealth: HealthStatus = {
        database: 'healthy',
        cache: 'healthy',
        storage: 'warning',
        memory: 'healthy',
        cpu: 'healthy',
        network: 'healthy'
      };

      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'backup',
          description: 'Database backup completed successfully',
          timestamp: '2024-01-15T10:30:00Z',
          status: 'success'
        },
        {
          id: '2',
          type: 'maintenance',
          description: 'System maintenance scheduled for tonight',
          timestamp: '2024-01-15T09:15:00Z',
          status: 'info'
        },
        {
          id: '3',
          type: 'error',
          description: 'High disk usage detected',
          timestamp: '2024-01-15T08:45:00Z',
          status: 'warning'
        },
        {
          id: '4',
          type: 'user',
          description: 'New tenant registration: ABC School',
          timestamp: '2024-01-15T08:20:00Z',
          status: 'success'
        },
        {
          id: '5',
          type: 'security',
          description: 'Failed login attempt detected',
          timestamp: '2024-01-15T07:55:00Z',
          status: 'error'
        }
      ];

      setStats(mockStats);
      setHealthStatus(mockHealth);
      setRecentActivity(mockActivity);
    } catch (error) {
      console.error('Error fetching system data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'backup':
        return <CloudArrowUpIcon className="w-4 h-4" />;
      case 'maintenance':
        return <WrenchScrewdriverIcon className="w-4 h-4" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'user':
        return <CogIcon className="w-4 h-4" />;
      case 'security':
        return <ShieldCheckIcon className="w-4 h-4" />;
      default:
        return <DocumentTextIcon className="w-4 h-4" />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      case 'info':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const quickActions = [
    {
      name: 'System Info',
      description: 'View detailed system information',
      icon: ServerIcon,
      action: () => console.log('System Info clicked')
    },
    {
      name: 'Database Backup',
      description: 'Create database backup',
      icon: CloudArrowUpIcon,
      action: () => console.log('Backup clicked')
    },
    {
      name: 'Cleanup Files',
      description: 'Remove old files and logs',
      icon: TrashIcon,
      action: () => console.log('Cleanup clicked')
    },
    {
      name: 'Health Check',
      description: 'Run system health check',
      icon: ShieldCheckIcon,
      action: () => console.log('Health Check clicked')
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
        title="System Administration"
        subtitle="Monitor system health, performance, and manage core operations"
        actions={
          <Button onClick={fetchSystemData} variant="outline">
            Refresh
          </Button>
        }
      />

      {/* System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CogIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total_users.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ServerIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Tenants</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.active_tenants}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
                              <CircleStackIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Database Size</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.database_size}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">System Load</p>
              <p className="text-2xl font-semibold text-gray-900">{(stats.system_load * 100).toFixed(1)}%</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health */}
        <Card className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
            <ShieldCheckIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {Object.entries(healthStatus).map(([service, status]) => (
              <div key={service} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center">
                  {getHealthIcon(status)}
                  <span className="ml-2 text-sm font-medium capitalize">{service}</span>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getHealthColor(status)}`}>
                  {status}
                </span>
              </div>
            ))}
          </div>
        </Card>

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

        {/* System Resources */}
        <Card className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">System Resources</h3>
            <ChartBarIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Memory Usage</span>
                <span className="text-gray-900">{stats.memory_usage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    stats.memory_usage > 80 ? 'bg-red-500' : stats.memory_usage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${stats.memory_usage}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Disk Usage</span>
                <span className="text-gray-900">{stats.disk_usage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    stats.disk_usage > 80 ? 'bg-red-500' : stats.disk_usage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${stats.disk_usage}%` }}
                ></div>
              </div>
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm text-gray-600">Storage Used: {stats.storage_used}</p>
              <p className="text-sm text-gray-600">Uptime: {stats.uptime}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center p-3 rounded-lg border">
              <div className={`p-2 rounded-lg ${getActivityColor(activity.status)}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-500">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActivityColor(activity.status)}`}>
                {activity.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Core;
