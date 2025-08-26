import React, { useEffect, useState } from 'react';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ClockIcon,
  CalendarIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlayIcon,
  StopIcon
} from '@heroicons/react/24/outline';

interface Session {
  id: string;
  course: {
    id: string;
    subject: {
      name: string;
    };
    class_enrolled: {
      name: string;
      section: string;
    };
  };
  date: string;
  start_time: string;
  end_time: string;
  session_type: string;
  is_active: boolean;
  created_by: {
    user: {
      first_name: string;
      last_name: string;
    };
  };
  created_at: string;
  total_students: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  attendance_percentage: number;
}

const Sessions: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const [formData, setFormData] = useState({
    course: '',
    date: '',
    start_time: '',
    end_time: '',
    session_type: 'regular'
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockSessions: Session[] = [
      {
        id: '1',
        course: {
          id: '1',
          subject: { name: 'Mathematics' },
          class_enrolled: { name: 'Class 10', section: 'A' }
        },
        date: '2024-01-15',
        start_time: '09:00',
        end_time: '10:00',
        session_type: 'regular',
        is_active: true,
        created_by: {
          user: { first_name: 'John', last_name: 'Smith' }
        },
        created_at: '2024-01-15T08:30:00Z',
        total_students: 32,
        present_count: 30,
        absent_count: 1,
        late_count: 1,
        attendance_percentage: 93.75
      },
      {
        id: '2',
        course: {
          id: '2',
          subject: { name: 'Science' },
          class_enrolled: { name: 'Class 9', section: 'B' }
        },
        date: '2024-01-15',
        start_time: '10:15',
        end_time: '11:15',
        session_type: 'practical',
        is_active: false,
        created_by: {
          user: { first_name: 'Sarah', last_name: 'Johnson' }
        },
        created_at: '2024-01-15T09:45:00Z',
        total_students: 28,
        present_count: 25,
        absent_count: 2,
        late_count: 1,
        attendance_percentage: 89.29
      },
      {
        id: '3',
        course: {
          id: '3',
          subject: { name: 'English' },
          class_enrolled: { name: 'Class 11', section: 'A' }
        },
        date: '2024-01-15',
        start_time: '11:30',
        end_time: '12:30',
        session_type: 'regular',
        is_active: true,
        created_by: {
          user: { first_name: 'Michael', last_name: 'Brown' }
        },
        created_at: '2024-01-15T11:00:00Z',
        total_students: 30,
        present_count: 29,
        absent_count: 0,
        late_count: 1,
        attendance_percentage: 96.67
      }
    ];

    setTimeout(() => {
      setSessions(mockSessions);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.course.subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.course.class_enrolled.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && session.is_active) ||
                         (statusFilter === 'inactive' && !session.is_active);
    const matchesCourse = courseFilter === 'all' || session.course.subject.name === courseFilter;
    
    return matchesSearch && matchesStatus && matchesCourse;
  });

  const courses = [...new Set(sessions.map(s => s.course.subject.name))];

  const sessionTypes = [
    { value: 'regular', label: 'Regular Class' },
    { value: 'exam', label: 'Examination' },
    { value: 'practical', label: 'Practical' },
    { value: 'lab', label: 'Laboratory' },
    { value: 'field_trip', label: 'Field Trip' },
    { value: 'other', label: 'Other' }
  ];

  const handleCreateSession = () => {
    setFormData({
      course: '',
      date: '',
      start_time: '',
      end_time: '',
      session_type: 'regular'
    });
    setShowCreateModal(true);
  };

  const handleEditSession = (session: Session) => {
    setFormData({
      course: session.course.id,
      date: session.date,
      start_time: session.start_time,
      end_time: session.end_time,
      session_type: session.session_type
    });
    setSelectedSession(session);
    setShowEditModal(true);
  };

  const handleSaveSession = () => {
    // TODO: Implement API call
    console.log('Saving session:', formData);
    setShowCreateModal(false);
    setShowEditModal(false);
  };

  const handleDeleteSession = (id: string) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      // TODO: Implement API call
      console.log('Deleting session:', id);
    }
  };

  const handleToggleSession = (session: Session) => {
    // TODO: Implement API call
    console.log('Toggling session:', session.id, !session.is_active);
  };

  const getStatusBadge = (session: Session) => {
    if (session.is_active) {
      return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>;
    }
    return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">Ended</span>;
  };

  const getSessionTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      regular: 'bg-blue-100 text-blue-800',
      exam: 'bg-red-100 text-red-800',
      practical: 'bg-purple-100 text-purple-800',
      lab: 'bg-orange-100 text-orange-800',
      field_trip: 'bg-green-100 text-green-800',
      other: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[type] || colors.other}`}>
        {sessionTypes.find(t => t.value === type)?.label || type}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Attendance Sessions</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage class attendance sessions
          </p>
        </div>
        <Button onClick={handleCreateSession} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Create Session
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search sessions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Ended</option>
              </select>
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Courses</option>
                {courses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Sessions Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Session Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course & Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {getSessionTypeBadge(session.session_type)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Created by {session.created_by.user.first_name} {session.created_by.user.last_name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{session.course.subject.name}</div>
                    <div className="text-sm text-gray-500">{session.course.class_enrolled.name} {session.course.class_enrolled.section}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(session.date).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {session.start_time} - {session.end_time}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{session.attendance_percentage}%</div>
                    <div className="text-sm text-gray-500">
                      {session.present_count}/{session.total_students} present
                    </div>
                    {session.late_count > 0 && (
                      <div className="text-sm text-orange-600">{session.late_count} late</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(session)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleSession(session)}
                        className={`text-sm px-2 py-1 rounded ${
                          session.is_active 
                            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                        title={session.is_active ? 'End Session' : 'Start Session'}
                      >
                        {session.is_active ? <StopIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleEditSession(session)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit Session"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSession(session.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Session"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create/Edit Session Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-start justify-center p-4">
          <div className="bg-white rounded-lg shadow-soft w-full max-w-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {showCreateModal ? 'Create Session' : 'Edit Session'}
              </h3>
              <button onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}>
                <XMarkIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveSession(); }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                  <select
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.map(course => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Session Type</label>
                  <select
                    value={formData.session_type}
                    onChange={(e) => setFormData({ ...formData, session_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {sessionTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {showCreateModal ? 'Create Session' : 'Update Session'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sessions;


