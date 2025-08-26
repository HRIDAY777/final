import React, { useEffect, useState } from 'react';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import {
  ChartBarIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  AcademicCapIcon,
  TrophyIcon,
  MusicalNoteIcon,
  HeartIcon,
  CubeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface EventAnalytics {
  total: number;
  upcoming: number;
  ongoing: number;
  completed: number;
  cancelled: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  byMonth: Record<string, number>;
  attendance: {
    average: number;
    total: number;
    trend: 'up' | 'down' | 'stable';
  };
  popularVenues: Array<{
    venue: string;
    count: number;
    percentage: number;
  }>;
  topOrganizers: Array<{
    organizer: string;
    count: number;
    percentage: number;
  }>;
  recentTrends: Array<{
    month: string;
    events: number;
    attendance: number;
  }>;
}

const EventsAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    // Mock data for demonstration
    const mockAnalytics: EventAnalytics = {
      total: 156,
      upcoming: 23,
      ongoing: 3,
      completed: 130,
      cancelled: 0,
      byType: {
        academic: 45,
        sports: 38,
        cultural: 32,
        social: 28,
        other: 13
      },
      byStatus: {
        upcoming: 23,
        ongoing: 3,
        completed: 130,
        cancelled: 0
      },
      byMonth: {
        'Jan': 12,
        'Feb': 15,
        'Mar': 18,
        'Apr': 14,
        'May': 20,
        'Jun': 16,
        'Jul': 8,
        'Aug': 10,
        'Sep': 22,
        'Oct': 19,
        'Nov': 17,
        'Dec': 15
      },
      attendance: {
        average: 85,
        total: 13260,
        trend: 'up'
      },
      popularVenues: [
        { venue: 'Auditorium', count: 25, percentage: 16 },
        { venue: 'School Ground', count: 22, percentage: 14 },
        { venue: 'Open Air Theater', count: 18, percentage: 12 },
        { venue: 'Classrooms', count: 15, percentage: 10 },
        { venue: 'Library', count: 12, percentage: 8 }
      ],
      topOrganizers: [
        { organizer: 'Science Department', count: 18, percentage: 12 },
        { organizer: 'Physical Education', count: 15, percentage: 10 },
        { organizer: 'Cultural Committee', count: 12, percentage: 8 },
        { organizer: 'Administration', count: 10, percentage: 6 },
        { organizer: 'Student Council', count: 8, percentage: 5 }
      ],
      recentTrends: [
        { month: 'Oct', events: 19, attendance: 85 },
        { month: 'Nov', events: 17, attendance: 87 },
        { month: 'Dec', events: 15, attendance: 82 },
        { month: 'Jan', events: 12, attendance: 88 }
      ]
    };

    setTimeout(() => {
      setAnalytics(mockAnalytics);
      setLoading(false);
    }, 1000);
  }, []);

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'academic':
        return <AcademicCapIcon className="w-5 h-5 text-blue-600" />;
      case 'sports':
        return <TrophyIcon className="w-5 h-5 text-green-600" />;
      case 'cultural':
        return <MusicalNoteIcon className="w-5 h-5 text-yellow-600" />;
      case 'social':
        return <HeartIcon className="w-5 h-5 text-red-600" />;
      default:
        return <CubeIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
              return <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />;
    case 'down':
      return <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />;
      default:
        return <ChartBarIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events Analytics</h1>
          <p className="text-gray-600">Comprehensive insights and statistics</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <Button variant="outline">
            <ChartBarIcon className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.total}</p>
                <p className="text-xs text-gray-500">All time</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.upcoming}</p>
                <p className="text-xs text-gray-500">Next 30 days</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ongoing</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.ongoing}</p>
                <p className="text-xs text-gray-500">Currently active</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.completed}</p>
                <p className="text-xs text-gray-500">Successfully held</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Attendance Overview */}
      <Card>
        <CardHeader title="Attendance Overview" />
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {analytics.attendance.average}%
              </div>
              <div className="text-sm text-gray-600 mb-2">Average Attendance</div>
              <div className="flex items-center justify-center space-x-1">
                {getTrendIcon(analytics.attendance.trend)}
                <span className="text-xs text-green-600">+2.5% from last month</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {analytics.attendance.total.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Attendees</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {Math.round(analytics.attendance.total / analytics.total)}
              </div>
              <div className="text-sm text-gray-600">Avg per Event</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Events by Type and Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Events by Type" />
          <div className="p-6">
            <div className="space-y-4">
              {Object.entries(analytics.byType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getEventTypeIcon(type)}
                    <span className="font-medium capitalize">{type}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(count / analytics.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Events by Status" />
          <div className="p-6">
            <div className="space-y-4">
              {Object.entries(analytics.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      status === 'upcoming' ? 'bg-blue-500' :
                      status === 'ongoing' ? 'bg-green-500' :
                      status === 'completed' ? 'bg-gray-500' :
                      'bg-red-500'
                    }`}></div>
                    <span className="font-medium capitalize">{status}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          status === 'upcoming' ? 'bg-blue-600' :
                          status === 'ongoing' ? 'bg-green-600' :
                          status === 'completed' ? 'bg-gray-600' :
                          'bg-red-600'
                        }`}
                        style={{ width: `${(count / analytics.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Popular Venues and Organizers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Popular Venues" />
          <div className="p-6">
            <div className="space-y-4">
              {analytics.popularVenues.map((venue, index) => (
                <div key={venue.venue} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <span className="font-medium">{venue.venue}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${venue.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {venue.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Top Organizers" />
          <div className="p-6">
            <div className="space-y-4">
              {analytics.topOrganizers.map((organizer, index) => (
                <div key={organizer.organizer} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-green-600">{index + 1}</span>
                    </div>
                    <span className="font-medium">{organizer.organizer}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${organizer.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {organizer.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Trends */}
      <Card>
        <CardHeader title="Recent Trends" />
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {analytics.recentTrends.map((trend) => (
              <div key={trend.month} className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-lg font-semibold text-gray-900 mb-2">{trend.month}</div>
                <div className="space-y-2">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{trend.events}</div>
                    <div className="text-xs text-gray-600">Events</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-green-600">{trend.attendance}%</div>
                    <div className="text-xs text-gray-600">Attendance</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EventsAnalytics;
