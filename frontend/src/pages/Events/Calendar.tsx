import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  AcademicCapIcon,
  TrophyIcon,
  MusicalNoteIcon,
  HeartIcon,
  CubeIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  event_type: string;
  status: string;
  venue: string;
  color: string;
}

const EventsCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    // Mock data for demonstration
    const mockEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Annual Sports Meet',
        start: '2024-01-20T09:00:00',
        end: '2024-01-22T17:00:00',
        event_type: 'sports',
        status: 'upcoming',
        venue: 'School Ground',
        color: '#10B981'
      },
      {
        id: '2',
        title: 'Science Fair 2024',
        start: '2024-01-18T10:00:00',
        end: '2024-01-19T16:00:00',
        event_type: 'academic',
        status: 'ongoing',
        venue: 'Auditorium',
        color: '#3B82F6'
      },
      {
        id: '3',
        title: 'Cultural Night',
        start: '2024-01-25T18:00:00',
        end: '2024-01-25T22:00:00',
        event_type: 'cultural',
        status: 'upcoming',
        venue: 'Open Air Theater',
        color: '#F59E0B'
      },
      {
        id: '4',
        title: 'Parent-Teacher Meeting',
        start: '2024-01-15T14:00:00',
        end: '2024-01-15T18:00:00',
        event_type: 'academic',
        status: 'completed',
        venue: 'Classrooms',
        color: '#3B82F6'
      }
    ];

    setTimeout(() => {
      setEvents(mockEvents);
      setLoading(false);
    }, 1000);
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventStart = event.start.split('T')[0];
      const eventEnd = event.end.split('T')[0];
      return dateStr >= eventStart && dateStr <= eventEnd;
    });
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'academic':
        return <AcademicCapIcon className="w-4 h-4 text-blue-600" />;
      case 'sports':
        return <TrophyIcon className="w-4 h-4 text-green-600" />;
      case 'cultural':
        return <MusicalNoteIcon className="w-4 h-4 text-yellow-600" />;
      case 'social':
        return <HeartIcon className="w-4 h-4 text-red-600" />;
      default:
        return <CubeIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <span className="px-1 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">Upcoming</span>;
      case 'ongoing':
        return <span className="px-1 py-0.5 text-xs bg-green-100 text-green-800 rounded">Ongoing</span>;
      case 'completed':
        return <span className="px-1 py-0.5 text-xs bg-gray-100 text-gray-800 rounded">Completed</span>;
      case 'cancelled':
        return <span className="px-1 py-0.5 text-xs bg-red-100 text-red-800 rounded">Cancelled</span>;
      default:
        return <span className="px-1 py-0.5 text-xs bg-gray-100 text-gray-800 rounded">{status}</span>;
    }
  };

  const formatTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const calendarDays = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="h-32 bg-gray-50"></div>);
  }

  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayEvents = getEventsForDate(date);
    const isToday = date.toDateString() === new Date().toDateString();
    const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

    calendarDays.push(
      <div
        key={day}
        className={`h-32 border border-gray-200 p-2 cursor-pointer transition-colors ${
          isToday ? 'bg-blue-50 border-blue-300' : ''
        } ${isSelected ? 'bg-yellow-50 border-yellow-300' : ''} hover:bg-gray-50`}
        onClick={() => setSelectedDate(date)}
      >
        <div className="flex justify-between items-start mb-1">
          <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
            {day}
          </span>
          {dayEvents.length > 0 && (
            <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded-full">
              {dayEvents.length}
            </span>
          )}
        </div>
        <div className="space-y-1">
          {dayEvents.slice(0, 2).map((event) => (
            <div
              key={event.id}
              className="text-xs p-1 rounded cursor-pointer hover:bg-white"
              style={{ backgroundColor: `${event.color}20`, borderLeft: `3px solid ${event.color}` }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedEvent(event);
              }}
            >
              <div className="font-medium truncate">{event.title}</div>
              <div className="text-gray-600">{formatTime(event.start)}</div>
            </div>
          ))}
          {dayEvents.length > 2 && (
            <div className="text-xs text-gray-500 text-center">
              +{dayEvents.length - 2} more
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-7 gap-1">
            {[...Array(35)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">Events Calendar</h1>
          <p className="text-gray-600">View and manage events in calendar format</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={goToToday}>
            Today
          </Button>
          <Link to="/events/create">
            <Button>
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </Link>
        </div>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                <ChevronLeftIcon className="w-4 h-4" />
              </Button>
              <h2 className="text-xl font-semibold text-gray-900">{monthName}</h2>
              <Button variant="outline" size="sm" onClick={goToNextMonth}>
                <ChevronRightIcon className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-600 rounded"></div>
                <span>Academic</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-600 rounded"></div>
                <span>Sports</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-600 rounded"></div>
                <span>Cultural</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-600 rounded"></div>
                <span>Social</span>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day Headers */}
            {dayNames.map(day => (
              <div key={day} className="h-10 flex items-center justify-center text-sm font-medium text-gray-500 bg-gray-50">
                {day}
              </div>
            ))}
            
            {/* Calendar Days */}
            {calendarDays}
          </div>
        </div>
      </Card>

      {/* Selected Date Events */}
      {selectedDate && (
        <Card>
          <CardHeader title={`Events for ${formatDate(selectedDate)}`} />
          <div className="p-6">
            {getEventsForDate(selectedDate).length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events scheduled</h3>
                <p className="text-gray-600 mb-4">This day is free of events</p>
                <Link to="/events/create">
                  <Button>Create Event</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {getEventsForDate(selectedDate).map((event) => (
                  <div key={event.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    {getEventTypeIcon(event.event_type)}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{event.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center space-x-1">
                          <ClockIcon className="w-4 h-4" />
                          <span>{formatTime(event.start)} - {formatTime(event.end)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MapPinIcon className="w-4 h-4" />
                          <span>{event.venue}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(event.status)}
                      <Link to={`/events/${event.id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getEventTypeIcon(selectedEvent.event_type)}
                <h3 className="text-lg font-semibold text-gray-900">{selectedEvent.title}</h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedEvent(null)}
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">
                  {formatTime(selectedEvent.start)} - {formatTime(selectedEvent.end)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPinIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{selectedEvent.venue}</span>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(selectedEvent.status)}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setSelectedEvent(null)}
              >
                Close
              </Button>
              <Link to={`/events/${selectedEvent.id}`}>
                <Button>View Details</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsCalendar;
