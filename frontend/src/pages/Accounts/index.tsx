import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';

import {
  UserIcon,
  ShieldCheckIcon,
  CogIcon,
  KeyIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlusIcon,
  ArrowRightIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

const AccountsPage: React.FC = () => {
  const [stats] = useState({
    totalUsers: 1247,
    activeUsers: 1189,
    lockedUsers: 12,
    pendingVerification: 46,
    recentLogins: 89,
    securityAlerts: 3
  });

  const [recentActivities] = useState([
    {
      id: 1,
      type: 'login',
      title: 'Successful Login',
      description: 'User logged in from Chrome on Windows',
      time: '2 minutes ago',
      icon: CheckCircleIcon,
      color: 'text-green-600'
    },
    {
      id: 2,
      type: 'password_change',
      title: 'Password Changed',
      description: 'Password was successfully updated',
      time: '1 hour ago',
      icon: KeyIcon,
      color: 'text-blue-600'
    },
    {
      id: 3,
      type: 'profile_update',
      title: 'Profile Updated',
      description: 'Contact information was modified',
      time: '3 hours ago',
      icon: UserIcon,
      color: 'text-purple-600'
    },
    {
      id: 4,
      type: 'security_alert',
      title: 'Security Alert',
      description: 'Failed login attempt detected',
      time: '1 day ago',
      icon: ExclamationTriangleIcon,
      color: 'text-red-600'
    }
  ]);

  const accountModules = [
    {
      title: 'User Management',
      description: 'Manage all system users and their roles',
      icon: UserGroupIcon,
      path: '/accounts/users',
      metric: `${stats.totalUsers} Users`,
      color: 'bg-blue-500'
    },
    {
      title: 'Profile Settings',
      description: 'Update your personal information and preferences',
      icon: UserIcon,
      path: '/accounts/profile',
      metric: 'Personal Info',
      color: 'bg-green-500'
    },
    {
      title: 'Security Settings',
      description: 'Manage passwords, 2FA, and security preferences',
      icon: ShieldCheckIcon,
      path: '/accounts/security',
      metric: 'Security',
      color: 'bg-red-500'
    },
    {
      title: 'Account Settings',
      description: 'Configure account preferences and notifications',
      icon: CogIcon,
      path: '/accounts/settings',
      metric: 'Preferences',
      color: 'bg-purple-500'
    },
    {
      title: 'Session Management',
      description: 'View and manage active sessions',
      icon: ClockIcon,
      path: '/accounts/sessions',
      metric: `${stats.recentLogins} Active`,
      color: 'bg-orange-500'
    },
    {
      title: 'Audit Logs',
      description: 'View system activity and security logs',
      icon: ChartBarIcon,
      path: '/accounts/audit',
      metric: 'Activity Logs',
      color: 'bg-indigo-500'
    }
  ];

  const quickActions = [
    {
      title: 'Add New User',
      description: 'Create a new user account',
      icon: PlusIcon,
      path: '/accounts/users/create',
      color: 'bg-blue-500'
    },
    {
      title: 'Security Scan',
      description: 'Run security audit on accounts',
      icon: ShieldCheckIcon,
      path: '/accounts/security/scan',
      color: 'bg-red-500'
    },
    {
      title: 'Bulk Operations',
      description: 'Manage multiple users at once',
      icon: UserGroupIcon,
      path: '/accounts/users/bulk',
      color: 'bg-green-500'
    },
    {
      title: 'Export Data',
      description: 'Export user data and reports',
      icon: ChartBarIcon,
      path: '/accounts/export',
      color: 'bg-purple-500'
    }
  ];

  const securityOverview = [
    {
      title: 'Active Users',
      value: stats.activeUsers,
      change: '+12%',
      changeType: 'positive',
      icon: CheckCircleIcon,
      color: 'text-green-600'
    },
    {
      title: 'Locked Accounts',
      value: stats.lockedUsers,
      change: '-3%',
      changeType: 'positive',
      icon: LockClosedIcon,
      color: 'text-red-600'
    },
    {
      title: 'Pending Verification',
      value: stats.pendingVerification,
      change: '+5%',
      changeType: 'negative',
      icon: ExclamationTriangleIcon,
      color: 'text-orange-600'
    },
    {
      title: 'Security Alerts',
      value: stats.securityAlerts,
      change: '-2',
      changeType: 'positive',
      icon: ShieldCheckIcon,
      color: 'text-blue-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Account Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage user accounts, security settings, and system access
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add User
          </Button>
          <Button>
            <ShieldCheckIcon className="h-4 w-4 mr-2" />
            Security Scan
          </Button>
        </div>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {securityOverview.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.title}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{item.value}</p>
                    <span className={`text-xs font-medium ${
                      item.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.change}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Account Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accountModules.map((module) => {
          const Icon = module.icon;
          return (
            <Card key={module.title} className="hover:shadow-lg transition-shadow">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${module.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {module.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {module.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {module.metric}
                  </span>
                  <Link
                    to={module.path}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Open
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader title="Quick Actions" />
            <div className="space-y-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.title}
                    to={action.path}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {action.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {action.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Recent Activities" />
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                      <Icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {activity.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="User Distribution" />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Users</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{stats.totalUsers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Users</span>
              <span className="font-medium text-green-600">{stats.activeUsers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Locked Accounts</span>
              <span className="font-medium text-red-600">{stats.lockedUsers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Pending Verification</span>
              <span className="font-medium text-orange-600">{stats.pendingVerification}</span>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Security Status" />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">2FA Enabled</span>
              <span className="font-medium text-green-600">89%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Strong Passwords</span>
              <span className="font-medium text-green-600">94%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Email Verified</span>
              <span className="font-medium text-green-600">97%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Phone Verified</span>
              <span className="font-medium text-blue-600">76%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AccountsPage;
