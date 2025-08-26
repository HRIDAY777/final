import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import {
  CalendarIcon,
  PlusIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon,
  TrophyIcon,
  MusicalNoteIcon,
  HeartIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';

interface EventStats {
  total: number;
  upcoming: number;
  ongoing: number;
  completed: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
}

interface RecentEvent {
  id: string;
  title: string;
  event_type: string;
  start_date: string;
  start_time: string;
  venue: string;
  status: string;
}

const EventsPage: React.FC = () => {
  const [stats, setStats] = useState<EventStats>({
    total: 0,
    upcoming: 0,
    ongoing: 0,
    completed: 0,
    byType: {},
    byStatus: {}
  });
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demonstration
    const mockStats: EventStats = {
      total: 156,
      upcoming: 23,
      ongoing: 3,
      completed: 130,
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
      }
    };

    const mockRecentEvents: RecentEvent[] = [
      {
        id: '1',
        title: 'Annual Sports Meet',
        event_type: 'sports',
        start_date: '2024-01-20',
        start_time: '09:00',
        venue: 'School Ground',
        status: 'upcoming'
      },
      {
        id: '2',
        title: 'Science Fair 2024',
        event_type: 'academic',
        start_date: '2024-01-18',
        start_time: '10:00',
        venue: 'Auditorium',
        status: 'ongoing'
      },
      {
        id: '3',
        title: 'Cultural Night',
        event_type: 'cultural',
        start_date: '2024-01-25',
        start_time: '18:00',
        venue: 'Open Air Theater',
        status: 'upcoming'
      },
      {
        id: '4',
        title: 'Parent-Teacher Meeting',
        event_type: 'academic',
        start_date: '2024-01-15',
        start_time: '14:00',
        venue: 'Classrooms',
        status: 'completed'
      }
    ];

    setTimeout(() => {
      setStats(mockStats);
      setRecentEvents(mockRecentEvents);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Upcoming</span>;
      case 'ongoing':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Ongoing</span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Completed</span>;
      case 'cancelled':
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Cancelled</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">{status}</span>;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events Management</h1>
          <p className="text-gray-600">Manage school events, activities, and schedules</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/events/calendar">
            <Button variant="outline" size="sm">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Calendar View
            </Button>
          </Link>
          <Link to="/events/create">
            <Button size="sm">
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.ongoing}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader title="Quick Actions" />
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/events/list">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <CalendarIcon className="w-6 h-6 text-blue-600" />
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900">All Events</h3>
                    <p className="text-sm text-gray-600">View all events</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/events/create">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <PlusIcon className="w-6 h-6 text-green-600" />
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900">Create Event</h3>
                    <p className="text-sm text-gray-600">Add new event</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/events/calendar">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <CalendarIcon className="w-6 h-6 text-purple-600" />
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900">Calendar</h3>
                    <p className="text-sm text-gray-600">Calendar view</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/events/analytics">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <ChartBarIcon className="w-6 h-6 text-orange-600" />
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900">Analytics</h3>
                    <p className="text-sm text-gray-600">Event insights</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </Card>

      {/* Recent Events */}
      <Card>
        <CardHeader 
          title="Recent Events" 
          right={
            <Link to="/events/list">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          }
        />
        <div className="p-6">
          <div className="space-y-4">
            {recentEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  {getEventTypeIcon(event.event_type)}
                  <div>
                    <h3 className="font-medium text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-600">
                      {event.start_date} at {event.start_time} • {event.venue}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(event.status)}
                  <Link to={`/events/${event.id}`}>
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Event Types Overview */}
      <Card>
        <CardHeader title="Events by Type" />
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-center mb-2">
                  {getEventTypeIcon(type)}
                </div>
                <h3 className="font-medium text-gray-900 capitalize">{type}</h3>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-sm text-gray-600">events</p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EventsPage;
