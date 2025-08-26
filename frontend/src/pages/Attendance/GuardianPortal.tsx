import React, { useEffect, useState } from 'react';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import {
  UserIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  BellIcon,
  ChartBarIcon,
  EyeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  AcademicCapIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon
} from '@heroicons/react/24/outline';

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  class: string;
  section: string;
  photo?: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused' | 'half_day';
  subject: string;
  teacher: string;
  time: string;
  remarks?: string;
}

interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  attendancePercentage: number;
  currentStreak: number;
  bestStreak: number;
  trend: 'improving' | 'declining' | 'stable';
}

interface Notification {
  id: string;
  type: 'absence' | 'late' | 'achievement' | 'general';
  title: string;
  message: string;
  date: string;
  isRead: boolean;
}

const GuardianPortal: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'notifications'>('overview');

  // Mock data for demonstration
  useEffect(() => {
    const mockStudents: Student[] = [
      {
        id: '1',
        name: 'Ahmed Khan',
        rollNumber: '10A001',
        class: 'Class 10',
        section: 'A',
        guardianName: 'Mohammed Khan',
        guardianPhone: '+880 1712-345678',
        guardianEmail: 'mohammed.khan@email.com'
      },
      {
        id: '2',
        name: 'Fatima Rahman',
        rollNumber: '8B015',
        class: 'Class 8',
        section: 'B',
        guardianName: 'Abdul Rahman',
        guardianPhone: '+880 1812-345678',
        guardianEmail: 'abdul.rahman@email.com'
      }
    ];

    const mockAttendanceRecords: AttendanceRecord[] = [
      {
        id: '1',
        date: '2024-01-15',
        status: 'present',
        subject: 'Mathematics',
        teacher: 'Ms. Sarah Johnson',
        time: '09:00 - 10:00'
      },
      {
        id: '2',
        date: '2024-01-15',
        status: 'late',
        subject: 'Science',
        teacher: 'Mr. Michael Brown',
        time: '10:15 - 11:15',
        remarks: 'Arrived 15 minutes late'
      },
      {
        id: '3',
        date: '2024-01-14',
        status: 'present',
        subject: 'English',
        teacher: 'Ms. Emily Davis',
        time: '11:30 - 12:30'
      },
      {
        id: '4',
        date: '2024-01-14',
        status: 'absent',
        subject: 'History',
        teacher: 'Mr. Robert Wilson',
        time: '13:00 - 14:00',
        remarks: 'Medical appointment'
      },
      {
        id: '5',
        date: '2024-01-13',
        status: 'present',
        subject: 'Physics',
        teacher: 'Dr. James Miller',
        time: '14:15 - 15:15'
      }
    ];

    const mockAttendanceStats: AttendanceStats = {
      totalDays: 45,
      presentDays: 38,
      absentDays: 4,
      lateDays: 2,
      excusedDays: 1,
      attendancePercentage: 84.4,
      currentStreak: 5,
      bestStreak: 12,
      trend: 'improving'
    };

    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'absence',
        title: 'Absence Alert',
        message: 'Ahmed was absent from History class on January 14, 2024',
        date: '2024-01-14T10:30:00Z',
        isRead: false
      },
      {
        id: '2',
        type: 'late',
        title: 'Late Arrival',
        message: 'Ahmed arrived 15 minutes late to Science class',
        date: '2024-01-15T10:20:00Z',
        isRead: true
      },
      {
        id: '3',
        type: 'achievement',
        title: 'Perfect Attendance Week',
        message: 'Congratulations! Ahmed had perfect attendance this week',
        date: '2024-01-12T16:00:00Z',
        isRead: true
      }
    ];

    setTimeout(() => {
      setStudents(mockStudents);
      setSelectedStudent(mockStudents[0]);
      setAttendanceRecords(mockAttendanceRecords);
      setAttendanceStats(mockAttendanceStats);
      setNotifications(mockNotifications);
      setLoading(false);
    }, 1000);
  }, []);

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

  const getNotificationIcon = (type: string) => {
    const icons = {
      absence: <XCircleIcon className="h-5 w-5 text-red-600" />,
      late: <ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />,
      achievement: <CheckCircleIcon className="h-5 w-5 text-green-600" />,
      general: <BellIcon className="h-5 w-5 text-blue-600" />
    };
    return icons[type as keyof typeof icons];
  };

  const getTrendIcon = (trend: string) => {
    const icons = {
      improving: <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />,
      declining: <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />,
      stable: <MinusIcon className="h-5 w-5 text-gray-600" />
    };
    return icons[trend as keyof typeof icons];
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Guardian Portal</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time attendance monitoring for your children
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <PhoneIcon className="h-4 w-4" />
            Contact School
          </Button>
          <Button className="flex items-center gap-2">
            <BellIcon className="h-4 w-4" />
            Notification Settings
          </Button>
        </div>
      </div>

      {/* Student Selection */}
      <Card>
        <CardHeader title="Select Student" />
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {students.map((student) => (
              <div
                key={student.id}
                onClick={() => handleStudentSelect(student)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  selectedStudent?.id === student.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{student.name}</h3>
                    <p className="text-sm text-gray-600">
                      {student.class} {student.section} • Roll: {student.rollNumber}
                    </p>
                  </div>
                  {selectedStudent?.id === student.id && (
                    <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {selectedStudent && (
        <>
          {/* Student Info */}
          <Card>
            <CardHeader title="Student Information" />
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Student Name</p>
                    <p className="font-medium text-gray-900">{selectedStudent.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Class & Section</p>
                    <p className="font-medium text-gray-900">{selectedStudent.class} {selectedStudent.section}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Guardian Phone</p>
                    <p className="font-medium text-gray-900">{selectedStudent.guardianPhone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Guardian Email</p>
                    <p className="font-medium text-gray-900">{selectedStudent.guardianEmail}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: ChartBarIcon },
                { id: 'details', label: 'Attendance Details', icon: CalendarIcon },
                { id: 'notifications', label: 'Notifications', icon: BellIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && attendanceStats && (
            <div className="space-y-6">
              {/* Attendance Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Attendance Rate</p>
                        <p className="text-2xl font-bold text-gray-900">{attendanceStats.attendancePercentage}%</p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <CalendarIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Days</p>
                        <p className="text-2xl font-bold text-gray-900">{attendanceStats.totalDays}</p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-4">
                                         <div className="flex items-center gap-3">
                       <div className="p-2 bg-purple-100 rounded-lg">
                         <ArrowTrendingUpIcon className="h-5 w-5 text-purple-600" />
                       </div>
                      <div>
                        <p className="text-sm text-gray-600">Current Streak</p>
                        <p className="text-2xl font-bold text-gray-900">{attendanceStats.currentStreak} days</p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <ChartBarIcon className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Best Streak</p>
                        <p className="text-2xl font-bold text-gray-900">{attendanceStats.bestStreak} days</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Detailed Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader title="Attendance Breakdown" />
                  <div className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Present Days</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${(attendanceStats.presentDays / attendanceStats.totalDays) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{attendanceStats.presentDays}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Absent Days</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-red-600 h-2 rounded-full" 
                              style={{ width: `${(attendanceStats.absentDays / attendanceStats.totalDays) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{attendanceStats.absentDays}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Late Days</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-amber-600 h-2 rounded-full" 
                              style={{ width: `${(attendanceStats.lateDays / attendanceStats.totalDays) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{attendanceStats.lateDays}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <CardHeader title="Attendance Trend" />
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      {getTrendIcon(attendanceStats.trend)}
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{attendanceStats.trend} Trend</p>
                        <p className="text-sm text-gray-600">Based on last 30 days</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Current Month</span>
                        <span className="font-medium">{attendanceStats.attendancePercentage}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Previous Month</span>
                        <span className="font-medium">82.1%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Change</span>
                        <span className="font-medium text-green-600">+2.3%</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <Card>
              <CardHeader title="Recent Attendance Records" />
              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendanceRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(record.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.subject}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.time}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(record.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.teacher}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.remarks || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader title="Notifications" />
              <div className="p-4">
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border rounded-lg ${
                        notification.isRead ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-gray-900">{notification.title}</h4>
                            <span className="text-xs text-gray-500">
                              {new Date(notification.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{notification.message}</p>
                        </div>
                        {!notification.isRead && (
                          <button
                            onClick={() => markNotificationAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default GuardianPortal;
