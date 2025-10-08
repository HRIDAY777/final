import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { FilterBar } from '../../components/UI/FilterBar';
import { Pagination } from '../../components/UI/Pagination';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

interface ExamSchedule {
  id: string;
  exam: {
    id: string;
    title: string;
    exam_type: string;
    subject: {
      name: string;
    };
  };
  start_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  room_number: string;
  max_students: number;
  registered_students: number;
  is_active: boolean;
  instructions: string;
  created_by: {
    id: string;
    name: string;
  };
  created_at: string;
  status: string;
}

const Schedules: React.FC = () => {
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    exam_type: '',
    status: '',
    date_from: '',
    date_to: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSchedule, setSelectedSchedule] = useState<ExamSchedule | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    // Mock data for demonstration
    const mockSchedules: ExamSchedule[] = [
      {
        id: '1',
        exam: {
          id: '1',
          title: 'Mathematics Midterm Exam',
          exam_type: 'midterm',
          subject: { name: 'Mathematics' }
        },
        start_date: '2024-12-15',
        start_time: '09:00',
        end_time: '11:00',
        venue: 'Main Hall',
        room_number: 'A101',
        max_students: 50,
        registered_students: 45,
        is_active: true,
        instructions: 'Bring calculators and writing materials. No electronic devices allowed.',
        created_by: { id: '1', name: 'Dr. Sarah Johnson' },
        created_at: '2024-01-15T10:00:00Z',
        status: 'upcoming'
      },
      {
        id: '2',
        exam: {
          id: '2',
          title: 'Science Quiz - Chapter 5',
          exam_type: 'quiz',
          subject: { name: 'Science' }
        },
        start_date: '2024-12-10',
        start_time: '14:00',
        end_time: '14:45',
        venue: 'Science Lab',
        room_number: 'S201',
        max_students: 30,
        registered_students: 28,
        is_active: true,
        instructions: 'Open book quiz. Bring your textbooks and notes.',
        created_by: { id: '2', name: 'Prof. Michael Brown' },
        created_at: '2024-01-20T14:30:00Z',
        status: 'completed'
      },
      {
        id: '3',
        exam: {
          id: '3',
          title: 'English Literature Final',
          exam_type: 'final',
          subject: { name: 'English' }
        },
        start_date: '2024-12-20',
        start_time: '10:00',
        end_time: '13:00',
        venue: 'Auditorium',
        room_number: 'AUD-01',
        max_students: 100,
        registered_students: 95,
        is_active: true,
        instructions: 'Three-hour examination. Bring pens and writing paper.',
        created_by: { id: '3', name: 'Ms. Emily Davis' },
        created_at: '2024-01-25T09:15:00Z',
        status: 'upcoming'
      },
      {
        id: '4',
        exam: {
          id: '4',
          title: 'Computer Science Project',
          exam_type: 'project',
          subject: { name: 'Computer Science' }
        },
        start_date: '2024-12-18',
        start_time: '15:00',
        end_time: '17:00',
        venue: 'Computer Lab',
        room_number: 'CL101',
        max_students: 25,
        registered_students: 20,
        is_active: true,
        instructions: 'Project presentation and demonstration. Bring your project files.',
        created_by: { id: '4', name: 'Dr. Robert Wilson' },
        created_at: '2024-02-01T11:45:00Z',
        status: 'upcoming'
      },
      {
        id: '5',
        exam: {
          id: '5',
          title: 'History Assignment',
          exam_type: 'assignment',
          subject: { name: 'History' }
        },
        start_date: '2024-12-05',
        start_time: '16:00',
        end_time: '18:00',
        venue: 'Library',
        room_number: 'LIB-02',
        max_students: 40,
        registered_students: 35,
        is_active: false,
        instructions: 'Research assignment submission. Bring printed copies.',
        created_by: { id: '5', name: 'Prof. Lisa Anderson' },
        created_at: '2024-02-05T16:20:00Z',
        status: 'cancelled'
      }
    ];

    setTimeout(() => {
      setSchedules(mockSchedules);
      setTotalPages(1);
      setLoading(false);
    }, 1000);
  }, []);

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

  const getExamTypeBadge = (type: string) => {
    switch (type) {
      case 'midterm':
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Midterm</span>;
      case 'final':
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Final</span>;
      case 'quiz':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Quiz</span>;
      case 'assignment':
        return <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">Assignment</span>;
      case 'project':
        return <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">Project</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">{type}</span>;
    }
  };

  const getCapacityIndicator = (registered: number, max: number) => {
    const percentage = (registered / max) * 100;
    let color = 'bg-green-500';
    if (percentage >= 90) color = 'bg-red-500';
    else if (percentage >= 75) color = 'bg-yellow-500';

    return (
      <div className="flex items-center space-x-2">
        <div className="w-16 bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${color}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="text-xs text-gray-600">{registered}/{max}</span>
      </div>
    );
  };

  const handleDelete = (schedule: ExamSchedule) => {
    setSelectedSchedule(schedule);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedSchedule) {
      setSchedules(schedules.filter(s => s.id !== selectedSchedule.id));
      setShowDeleteModal(false);
      setSelectedSchedule(null);
    }
  };

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.exam.title.toLowerCase().includes(search.toLowerCase()) ||
                         schedule.venue.toLowerCase().includes(search.toLowerCase()) ||
                         schedule.exam.subject.name.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = !filters.exam_type || schedule.exam.exam_type === filters.exam_type;
    const matchesStatus = !filters.status || schedule.status === filters.status;
    
    let matchesDate = true;
    if (filters.date_from) {
      const scheduleDate = new Date(schedule.start_date);
      const fromDate = new Date(filters.date_from);
      matchesDate = matchesDate && scheduleDate >= fromDate;
    }
    if (filters.date_to) {
      const scheduleDate = new Date(schedule.start_date);
      const toDate = new Date(filters.date_to);
      matchesDate = matchesDate && scheduleDate <= toDate;
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesDate;
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
          <h1 className="text-2xl font-bold text-gray-900">Exam Schedules</h1>
          <p className="text-gray-600">Manage and track exam schedules</p>
        </div>
        <Link to="/exams/schedules/create">
          <Button>
            <PlusIcon className="w-4 h-4 mr-2" />
            Schedule Exam
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
              value={filters.exam_type}
              onChange={(e) => setFilters({...filters, exam_type: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Types</option>
              <option value="midterm">Midterm</option>
              <option value="final">Final</option>
              <option value="quiz">Quiz</option>
              <option value="assignment">Assignment</option>
              <option value="project">Project</option>
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
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters({...filters, date_from: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="From Date"
            />
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters({...filters, date_to: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="To Date"
            />
          </div>
        }
      />

      {/* Schedules List */}
      <Card>
        <CardHeader title={`Schedules (${filteredSchedules.length})`} />
        <div className="p-6">
          {filteredSchedules.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No schedules found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
              <Link to="/exams/schedules/create">
                <Button>Schedule Your First Exam</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSchedules.map((schedule) => (
                <div key={schedule.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <CalendarIcon className="w-8 h-8 text-green-600 mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{schedule.exam.title}</h3>
                          {getExamTypeBadge(schedule.exam.exam_type)}
                          {getStatusBadge(schedule.status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-3">
                          <div className="flex items-center space-x-2">
                            <ClockIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              {new Date(schedule.start_date).toLocaleDateString()} {schedule.start_time} - {schedule.end_time}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPinIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              {schedule.venue} - Room {schedule.room_number}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <UserGroupIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              {schedule.exam.subject.name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">
                              Capacity: {schedule.registered_students}/{schedule.max_students}
                            </span>
                          </div>
                        </div>

                        {/* Capacity Indicator */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Student Registration</span>
                          </div>
                          <div className="mt-2">
                            {getCapacityIndicator(schedule.registered_students, schedule.max_students)}
                          </div>
                        </div>

                        {schedule.instructions && (
                          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <strong>Instructions:</strong> {schedule.instructions}
                            </p>
                          </div>
                        )}

                        <div className="text-xs text-gray-500">
                          Scheduled by {schedule.created_by.name} • {new Date(schedule.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Link to={`/exams/schedules/${schedule.id}`}>
                        <Button variant="outline" size="sm">
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link to={`/exams/schedules/${schedule.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(schedule)}
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
          total={schedules.length}
          onPageChange={setPage}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Schedule</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the schedule for &quot;{selectedSchedule.exam.title}&quot;? This action cannot be undone.
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

export default Schedules;


