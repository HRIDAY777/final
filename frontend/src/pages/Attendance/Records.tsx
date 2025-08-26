import React, { useEffect, useState } from 'react';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface AttendanceRecord {
  id: string;
  session: {
    id: string;
    course: {
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
  };
  student: {
    id: string;
    user: {
      first_name: string;
      last_name: string;
    };
    roll_number: string;
  };
  status: 'present' | 'absent' | 'late' | 'excused' | 'half_day';
  arrival_time?: string;
  departure_time?: string;
  remarks: string;
  marked_by: {
    user: {
      first_name: string;
      last_name: string;
    };
  };
  marked_at: string;
}

const Records: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    const mockRecords: AttendanceRecord[] = [
      {
        id: '1',
        session: {
          id: '1',
          course: {
            subject: { name: 'Mathematics' },
            class_enrolled: { name: 'Class 10', section: 'A' }
          },
          date: '2024-01-15',
          start_time: '09:00',
          end_time: '10:00'
        },
        student: {
          id: '1',
          user: { first_name: 'John', last_name: 'Doe' },
          roll_number: '10A001'
        },
        status: 'present',
        arrival_time: '08:55',
        departure_time: '10:00',
        remarks: '',
        marked_by: {
          user: { first_name: 'Sarah', last_name: 'Johnson' }
        },
        marked_at: '2024-01-15T09:05:00Z'
      },
      {
        id: '2',
        session: {
          id: '1',
          course: {
            subject: { name: 'Mathematics' },
            class_enrolled: { name: 'Class 10', section: 'A' }
          },
          date: '2024-01-15',
          start_time: '09:00',
          end_time: '10:00'
        },
        student: {
          id: '2',
          user: { first_name: 'Jane', last_name: 'Smith' },
          roll_number: '10A002'
        },
        status: 'late',
        arrival_time: '09:15',
        departure_time: '10:00',
        remarks: 'Traffic delay',
        marked_by: {
          user: { first_name: 'Sarah', last_name: 'Johnson' }
        },
        marked_at: '2024-01-15T09:15:00Z'
      },
      {
        id: '3',
        session: {
          id: '1',
          course: {
            subject: { name: 'Mathematics' },
            class_enrolled: { name: 'Class 10', section: 'A' }
          },
          date: '2024-01-15',
          start_time: '09:00',
          end_time: '10:00'
        },
        student: {
          id: '3',
          user: { first_name: 'Mike', last_name: 'Wilson' },
          roll_number: '10A003'
        },
        status: 'absent',
        arrival_time: '',
        departure_time: '',
        remarks: 'No excuse provided',
        marked_by: {
          user: { first_name: 'Sarah', last_name: 'Johnson' }
        },
        marked_at: '2024-01-15T09:30:00Z'
      },
      {
        id: '4',
        session: {
          id: '2',
          course: {
            subject: { name: 'Science' },
            class_enrolled: { name: 'Class 9', section: 'B' }
          },
          date: '2024-01-15',
          start_time: '10:15',
          end_time: '11:15'
        },
        student: {
          id: '4',
          user: { first_name: 'Emily', last_name: 'Brown' },
          roll_number: '9B001'
        },
        status: 'excused',
        arrival_time: '',
        departure_time: '',
        remarks: 'Medical appointment',
        marked_by: {
          user: { first_name: 'Michael', last_name: 'Davis' }
        },
        marked_at: '2024-01-15T10:20:00Z'
      }
    ];

    setTimeout(() => {
      setRecords(mockRecords);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.student.user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.student.user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.student.roll_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesDate = !dateFilter || record.session.date === dateFilter;
    const matchesCourse = courseFilter === 'all' || record.session.course.subject.name === courseFilter;
    
    return matchesSearch && matchesStatus && matchesDate && matchesCourse;
  });

  const courses = [...new Set(records.map(r => r.session.course.subject.name))];
  const dates = [...new Set(records.map(r => r.session.date))];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'present', label: 'Present' },
    { value: 'absent', label: 'Absent' },
    { value: 'late', label: 'Late' },
    { value: 'excused', label: 'Excused' },
    { value: 'half_day', label: 'Half Day' }
  ];

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-amber-100 text-amber-800',
      excused: 'bg-blue-100 text-blue-800',
      half_day: 'bg-purple-100 text-purple-800'
    };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const handleViewDetails = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setShowDetailsModal(true);
  };

  const handleExportRecords = () => {
    // TODO: Implement export functionality
    console.log('Exporting records...');
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Attendance Records</h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage individual student attendance records
          </p>
        </div>
        <Button onClick={handleExportRecords} className="flex items-center gap-2">
          <ArrowDownTrayIcon className="h-4 w-4" />
          Export Records
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
                  placeholder="Search by student name or roll number..."
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
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Dates</option>
                {dates.map(date => (
                  <option key={date} value={date}>{new Date(date).toLocaleDateString()}</option>
                ))}
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

      {/* Records Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Session Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marked By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {record.student.user.first_name} {record.student.user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Roll: {record.student.roll_number}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{record.session.course.subject.name}</div>
                    <div className="text-sm text-gray-500">
                      {record.session.course.class_enrolled.name} {record.session.course.class_enrolled.section}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(record.session.date).toLocaleDateString()} • {record.session.start_time} - {record.session.end_time}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(record.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {record.arrival_time ? (
                      <div className="text-sm text-gray-900">
                        Arrival: {record.arrival_time}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">No arrival time</div>
                    )}
                    {record.departure_time && (
                      <div className="text-sm text-gray-500">
                        Departure: {record.departure_time}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {record.marked_by.user.first_name} {record.marked_by.user.last_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(record.marked_at).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(record)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit Record"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Record Details Modal */}
      {showDetailsModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-start justify-center p-4">
          <div className="bg-white rounded-lg shadow-soft w-full max-w-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Attendance Record Details</h3>
              <button onClick={() => setShowDetailsModal(false)}>
                <XCircleIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Student Information</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm"><span className="font-medium">Name:</span> {selectedRecord.student.user.first_name} {selectedRecord.student.user.last_name}</p>
                    <p className="text-sm"><span className="font-medium">Roll Number:</span> {selectedRecord.student.roll_number}</p>
                    <p className="text-sm"><span className="font-medium">Student ID:</span> {selectedRecord.student.id}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Session Information</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm"><span className="font-medium">Course:</span> {selectedRecord.session.course.subject.name}</p>
                    <p className="text-sm"><span className="font-medium">Class:</span> {selectedRecord.session.course.class_enrolled.name} {selectedRecord.session.course.class_enrolled.section}</p>
                    <p className="text-sm"><span className="font-medium">Date:</span> {new Date(selectedRecord.session.date).toLocaleDateString()}</p>
                    <p className="text-sm"><span className="font-medium">Time:</span> {selectedRecord.session.start_time} - {selectedRecord.session.end_time}</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Attendance Details</h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">Status:</span>
                    {getStatusBadge(selectedRecord.status)}
                  </div>
                  {selectedRecord.arrival_time && (
                    <p className="text-sm"><span className="font-medium">Arrival Time:</span> {selectedRecord.arrival_time}</p>
                  )}
                  {selectedRecord.departure_time && (
                    <p className="text-sm"><span className="font-medium">Departure Time:</span> {selectedRecord.departure_time}</p>
                  )}
                  {selectedRecord.remarks && (
                    <p className="text-sm"><span className="font-medium">Remarks:</span> {selectedRecord.remarks}</p>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Record Information</h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm"><span className="font-medium">Marked By:</span> {selectedRecord.marked_by.user.first_name} {selectedRecord.marked_by.user.last_name}</p>
                  <p className="text-sm"><span className="font-medium">Marked At:</span> {new Date(selectedRecord.marked_at).toLocaleString()}</p>
                  <p className="text-sm"><span className="font-medium">Record ID:</span> {selectedRecord.id}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </Button>
              <Button>
                Edit Record
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Records;


