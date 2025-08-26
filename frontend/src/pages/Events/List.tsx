import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { FilterBar } from '../../components/UI/FilterBar';
import { Pagination } from '../../components/UI/Pagination';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
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

interface Event {
  id: string;
  title: string;
  description: string;
  event_type: string;
  status: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  address: string;
  organizer: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  target_audience: string;
  max_participants: number;
  is_public: boolean;
  requires_registration: boolean;
  registration_deadline: string | null;
  created_at: string;
}

const EventsList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    event_type: '',
    status: '',
    is_public: '',
    requires_registration: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    // Mock data for demonstration
    const mockEvents: Event[] = [
      {
        id: '1',
        title: 'Annual Sports Meet',
        description: 'Annual sports competition for all students',
        event_type: 'sports',
        status: 'upcoming',
        start_date: '2024-01-20',
        end_date: '2024-01-22',
        start_time: '09:00',
        end_time: '17:00',
        venue: 'School Ground',
        address: 'Main Campus, Sports Complex',
        organizer: 'Physical Education Department',
        contact_person: 'Mr. John Smith',
        contact_email: 'sports@school.edu',
        contact_phone: '+1234567890',
        target_audience: 'All Students',
        max_participants: 500,
        is_public: true,
        requires_registration: true,
        registration_deadline: '2024-01-15T23:59:59Z',
        created_at: '2024-01-01T10:00:00Z'
      },
      {
        id: '2',
        title: 'Science Fair 2024',
        description: 'Annual science exhibition showcasing student projects',
        event_type: 'academic',
        status: 'ongoing',
        start_date: '2024-01-18',
        end_date: '2024-01-19',
        start_time: '10:00',
        end_time: '16:00',
        venue: 'Auditorium',
        address: 'Main Building, First Floor',
        organizer: 'Science Department',
        contact_person: 'Dr. Sarah Johnson',
        contact_email: 'science@school.edu',
        contact_phone: '+1234567891',
        target_audience: 'Students and Parents',
        max_participants: 200,
        is_public: true,
        requires_registration: false,
        registration_deadline: null,
        created_at: '2024-01-05T14:30:00Z'
      },
      {
        id: '3',
        title: 'Cultural Night',
        description: 'Annual cultural celebration with performances',
        event_type: 'cultural',
        status: 'upcoming',
        start_date: '2024-01-25',
        end_date: '2024-01-25',
        start_time: '18:00',
        end_time: '22:00',
        venue: 'Open Air Theater',
        address: 'Campus Amphitheater',
        organizer: 'Cultural Committee',
        contact_person: 'Ms. Maria Garcia',
        contact_email: 'cultural@school.edu',
        contact_phone: '+1234567892',
        target_audience: 'Students, Staff, and Parents',
        max_participants: 300,
        is_public: true,
        requires_registration: true,
        registration_deadline: '2024-01-20T23:59:59Z',
        created_at: '2024-01-10T09:15:00Z'
      },
      {
        id: '4',
        title: 'Parent-Teacher Meeting',
        description: 'Quarterly parent-teacher conference',
        event_type: 'academic',
        status: 'completed',
        start_date: '2024-01-15',
        end_date: '2024-01-15',
        start_time: '14:00',
        end_time: '18:00',
        venue: 'Classrooms',
        address: 'Academic Building',
        organizer: 'Administration',
        contact_person: 'Mrs. Lisa Brown',
        contact_email: 'admin@school.edu',
        contact_phone: '+1234567893',
        target_audience: 'Parents and Teachers',
        max_participants: 150,
        is_public: false,
        requires_registration: true,
        registration_deadline: '2024-01-10T23:59:59Z',
        created_at: '2024-01-02T11:45:00Z'
      }
    ];

    setTimeout(() => {
      setEvents(mockEvents);
      setTotalPages(1);
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

  const handleDelete = (event: Event) => {
    setSelectedEvent(event);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedEvent) {
      setEvents(events.filter(e => e.id !== selectedEvent.id));
      setShowDeleteModal(false);
      setSelectedEvent(null);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase()) ||
                         event.description.toLowerCase().includes(search.toLowerCase()) ||
                         event.organizer.toLowerCase().includes(search.toLowerCase()) ||
                         event.venue.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = !filters.event_type || event.event_type === filters.event_type;
    const matchesStatus = !filters.status || event.status === filters.status;
    const matchesPublic = filters.is_public === '' || 
                         (filters.is_public === 'true' ? event.is_public : !event.is_public);
    const matchesRegistration = filters.requires_registration === '' || 
                               (filters.requires_registration === 'true' ? event.requires_registration : !event.requires_registration);
    
    return matchesSearch && matchesType && matchesStatus && matchesPublic && matchesRegistration;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
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
          <h1 className="text-2xl font-bold text-gray-900">All Events</h1>
          <p className="text-gray-600">Manage and view all school events</p>
        </div>
        <Link to="/events/create">
          <Button>
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        right={
          <div className="flex gap-2">
            <select
              value={filters.event_type}
              onChange={(e) => setFilters({...filters, event_type: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Types</option>
              <option value="academic">Academic</option>
              <option value="sports">Sports</option>
              <option value="cultural">Cultural</option>
              <option value="social">Social</option>
              <option value="other">Other</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        }
      />

      {/* Events List */}
      <Card>
        <CardHeader title={`Events (${filteredEvents.length})`} />
        <div className="p-6">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
              <Link to="/events/create">
                <Button>Create Your First Event</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <div key={event.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {getEventTypeIcon(event.event_type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                          {getStatusBadge(event.status)}
                          {event.is_public ? (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Public</span>
                          ) : (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Private</span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{event.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              {event.start_date} - {event.end_date}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <ClockIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              {event.start_time} - {event.end_time}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPinIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{event.venue}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <UserIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{event.organizer}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Link to={`/events/${event.id}`}>
                        <Button variant="outline" size="sm">
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link to={`/events/${event.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(event)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          page={page}
          pageSize={10}
          total={events.length}
          onPageChange={setPage}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Event</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{selectedEvent.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsList;
