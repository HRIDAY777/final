import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import {
  BellIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  ChartBarIcon,
  UserGroupIcon,
  EyeIcon,
  BookOpenIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';

interface NoticeStats {
  total_notices: number;
  published_notices: number;
  draft_notices: number;
  expired_notices: number;
  urgent_notices: number;
  total_views: number;
  total_reads: number;
  read_rate: number;
  notices_by_category: Record<string, number>;
  notices_by_priority: Record<string, number>;
  recent_notices: Array<{
    id: string;
    title: string;
    category: string;
    priority: string;
    status: string;
    publish_date: string;
    views_count: number;
    read_count: number;
  }>;
}

const NoticesDashboard: React.FC = () => {
  const [stats, setStats] = useState<NoticeStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demonstration
    const mockStats: NoticeStats = {
      total_notices: 156,
      published_notices: 89,
      draft_notices: 45,
      expired_notices: 22,
      urgent_notices: 12,
      total_views: 2847,
      total_reads: 2134,
      read_rate: 75.0,
      notices_by_category: {
        'Academic': 45,
        'Administrative': 32,
        'Events': 28,
        'Emergency': 15,
        'General': 36,
      },
      notices_by_priority: {
        'low': 23,
        'medium': 67,
        'high': 41,
        'urgent': 12,
      },
      recent_notices: [
        {
          id: '1',
          title: 'Mid-term Examination Schedule',
          category: 'Academic',
          priority: 'high',
          status: 'published',
          publish_date: '2024-12-15T10:00:00Z',
          views_count: 234,
          read_count: 189,
        },
        {
          id: '2',
          title: 'School Sports Day Announcement',
          category: 'Events',
          priority: 'medium',
          status: 'published',
          publish_date: '2024-12-14T14:30:00Z',
          views_count: 156,
          read_count: 134,
        },
        {
          id: '3',
          title: 'Library Closure Notice',
          category: 'Administrative',
          priority: 'urgent',
          status: 'published',
          publish_date: '2024-12-14T09:15:00Z',
          views_count: 89,
          read_count: 76,
        },
        {
          id: '4',
          title: 'Parent-Teacher Meeting',
          category: 'Academic',
          priority: 'high',
          status: 'draft',
          publish_date: '2024-12-16T16:00:00Z',
          views_count: 0,
          read_count: 0,
        },
        {
          id: '5',
          title: 'Holiday Schedule Update',
          category: 'Administrative',
          priority: 'medium',
          status: 'published',
          publish_date: '2024-12-13T11:45:00Z',
          views_count: 198,
          read_count: 167,
        },
      ],
    };

    setTimeout(() => {
      setStats(mockStats);
      setLoading(false);
    }, 1000);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-blue-600 bg-blue-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'text-green-600';
      case 'draft':
        return 'text-orange-600';
      case 'archived':
        return 'text-gray-600';
      case 'expired':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
      case 'draft':
        return <ClockIcon className="w-4 h-4 text-orange-600" />;
      case 'archived':
        return <DocumentTextIcon className="w-4 h-4 text-gray-600" />;
      case 'expired':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />;
      default:
        return <DocumentTextIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Notices data not found
          </h3>
          <p className="text-gray-600">Unable to load notices statistics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notices Dashboard</h1>
          <p className="text-gray-600">
            Manage school announcements and communications
          </p>
        </div>
        <div className="flex space-x-3">
          <Button as={Link} to="/notices/create">
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Notice
          </Button>
          <Button variant="outline" as={Link} to="/notices/templates">
            <DocumentTextIcon className="w-4 h-4 mr-2" />
            Templates
          </Button>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BellIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Notices</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.total_notices.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">
                {stats.published_notices} published
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Published Notices
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.published_notices}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600">
                {stats.draft_notices} in draft
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Urgent Notices</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.urgent_notices}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-red-600">
                {stats.expired_notices} expired
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <EyeIcon className="w-8 h-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Read Rate</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.read_rate}%
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-purple-600">
                {stats.total_reads} of {stats.total_views} views
              </span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Notices */}
        <Card>
          <CardHeader title="Recent Notices" />
          <div className="p-6">
            <div className="space-y-4">
              {stats.recent_notices.map((notice) => (
                <div key={notice.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getStatusIcon(notice.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {notice.title}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                          notice.priority
                        )}`}
                      >
                        {notice.priority}
                      </span>
                      <span className="text-sm text-gray-500">
                        {notice.category}
                      </span>
                      <span
                        className={`text-sm ${getStatusColor(notice.status)}`}
                      >
                        {notice.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm text-gray-900">
                      {notice.views_count} views
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(notice.publish_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" as={Link} to="/notices/list" className="w-full">
                View All Notices
              </Button>
            </div>
          </div>
        </Card>

        {/* Notices by Category */}
        <Card>
          <CardHeader title="Notices by Category" />
          <div className="p-6">
            <div className="space-y-4">
              {Object.entries(stats.notices_by_category).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <DocumentTextIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {category}
                      </p>
                      <p className="text-xs text-gray-500">{count} notices</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(count / stats.total_notices) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {Math.round((count / stats.total_notices) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t">
              <Button variant="outline" as={Link} to="/notices/categories" className="w-full">
                Manage Categories
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Notices by Priority */}
      <Card>
        <CardHeader title="Notices by Priority" />
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(stats.notices_by_priority).map(([priority, count]) => (
              <div key={priority} className="text-center">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${getPriorityColor(
                    priority
                  ).replace('text-', 'bg-').replace('bg-', 'bg-').replace('100', '100')}`}
                >
                  <BellIcon className="w-6 h-6" />
                </div>
                <p className="text-lg font-semibold text-gray-900">{count}</p>
                <p className="text-sm text-gray-600 capitalize">{priority}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader title="Quick Actions" />
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button as={Link} to="/notices/create" className="h-20 flex-col">
              <PlusIcon className="w-6 h-6 mb-2" />
              <span>Create Notice</span>
            </Button>
            <Button as={Link} to="/notices/list" variant="outline" className="h-20 flex-col">
              <DocumentTextIcon className="w-6 h-6 mb-2" />
              <span>All Notices</span>
            </Button>
            <Button as={Link} to="/notices/templates" variant="outline" className="h-20 flex-col">
              <BookOpenIcon className="w-6 h-6 mb-2" />
              <span>Templates</span>
            </Button>
            <Button as={Link} to="/notices/analytics" variant="outline" className="h-20 flex-col">
              <ChartBarIcon className="w-6 h-6 mb-2" />
              <span>Analytics</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NoticesDashboard;
