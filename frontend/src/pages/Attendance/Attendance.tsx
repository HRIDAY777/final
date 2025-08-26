import React, { useState, useEffect } from 'react';
import { 
  ClockIcon, UserIcon, CalendarIcon, CheckCircleIcon,
  XCircleIcon, ExclamationTriangleIcon, ChartBarIcon,
  AcademicCapIcon, BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import DataTable from '../../components/CRUD/DataTable';
import FormBuilder from '../../components/Forms/FormBuilder';
import { apiService } from '../../services/api';

interface Attendance {
  id: number;
  student_id: number;
  student_name: string;
  class_name: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  check_in_time: string;
  check_out_time: string;
  notes: string;
  teacher_name: string;
  created_at: string;
}

const Attendance: React.FC = () => {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Sample data for demo
  const sampleAttendance: Attendance[] = [
    {
      id: 1,
      student_id: 1,
      student_name: 'John Doe',
      class_name: 'Grade 10-A',
      date: '2024-01-15',
      status: 'present',
      check_in_time: '08:00',
      check_out_time: '15:30',
      notes: 'On time',
      teacher_name: 'Dr. Sarah Johnson',
      created_at: '2024-01-15T08:00:00Z'
    },
    {
      id: 2,
      student_id: 2,
      student_name: 'Sarah Smith',
      class_name: 'Grade 9-B',
      date: '2024-01-15',
      status: 'late',
      check_in_time: '08:15',
      check_out_time: '15:30',
      notes: 'Traffic delay',
      teacher_name: 'Prof. Michael Chen',
      created_at: '2024-01-15T08:15:00Z'
    },
    {
      id: 3,
      student_id: 3,
      student_name: 'Michael Johnson',
      class_name: 'Grade 11-C',
      date: '2024-01-15',
      status: 'absent',
      check_in_time: '',
      check_out_time: '',
      notes: 'Sick leave',
      teacher_name: 'Ms. Emily Rodriguez',
      created_at: '2024-01-15T00:00:00Z'
    }
  ];

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      // In real app, this would be: const data = await apiService.get('/attendance/');
      const data = sampleAttendance;
      setAttendance(data);
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingAttendance(null);
    setShowForm(true);
  };

  const handleEdit = (attendance: Attendance) => {
    setEditingAttendance(attendance);
    setShowForm(true);
  };

  const handleDelete = async (attendance: Attendance) => {
    if (window.confirm(`Are you sure you want to delete this attendance record?`)) {
      try {
        // In real app, this would be: await apiService.delete(`/attendance/${attendance.id}/`);
        setAttendance(prev => prev.filter(a => a.id !== attendance.id));
      } catch (error) {
        console.error('Error deleting attendance:', error);
      }
    }
  };

  const handleView = (attendance: Attendance) => {
    // Navigate to attendance detail page or show modal
    alert(`Viewing attendance for ${attendance.student_name} on ${attendance.date}`);
  };

  const handleSubmit = async (formData: any) => {
    try {
      setFormLoading(true);
      
      if (editingAttendance) {
        // Update existing attendance
        // In real app: await apiService.put(`/attendance/${editingAttendance.id}/`, formData);
        setAttendance(prev => prev.map(a => a.id === editingAttendance.id ? { ...a, ...formData } : a));
      } else {
        // Create new attendance
        const newAttendance = { ...formData, id: Date.now(), created_at: new Date().toISOString() };
        // In real app: const data = await apiService.post('/attendance/', formData);
        setAttendance(prev => [...prev, newAttendance]);
      }
      
      setShowForm(false);
      setEditingAttendance(null);
    } catch (error) {
      console.error('Error saving attendance:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const columns = [
    {
      key: 'student',
      label: 'Student',
      sortable: true,
      render: (value: any, row: Attendance) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <UserIcon className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{row.student_name}</div>
            <div className="text-sm text-gray-500">{row.class_name}</div>
          </div>
        </div>
      )
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (value: any, row: Attendance) => (
        <div className="flex items-center">
          <CalendarIcon className="w-4 h-4 text-gray-400 mr-2" />
          <span className="text-sm">{new Date(row.date).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: any, row: Attendance) => {
        const statusConfig = {
          present: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
          absent: { color: 'bg-red-100 text-red-800', icon: XCircleIcon },
          late: { color: 'bg-yellow-100 text-yellow-800', icon: ExclamationTriangleIcon },
          excused: { color: 'bg-blue-100 text-blue-800', icon: ClockIcon }
        };
        
        const config = statusConfig[row.status];
        const Icon = config.icon;
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            <Icon className="w-3 h-3 mr-1" />
            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          </span>
        );
      }
    },
    {
      key: 'time',
      label: 'Time',
      render: (value: any, row: Attendance) => (
        <div className="space-y-1">
          {row.check_in_time && (
            <div className="flex items-center text-sm">
              <ClockIcon className="w-3 h-3 text-gray-400 mr-1" />
              In: {row.check_in_time}
            </div>
          )}
          {row.check_out_time && (
            <div className="flex items-center text-sm">
              <ClockIcon className="w-3 h-3 text-gray-400 mr-1" />
              Out: {row.check_out_time}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'teacher',
      label: 'Teacher',
      render: (value: any, row: Attendance) => (
        <div className="flex items-center">
          <AcademicCapIcon className="w-4 h-4 text-green-600 mr-2" />
          <span className="text-sm">{row.teacher_name}</span>
        </div>
      )
    },
    {
      key: 'notes',
      label: 'Notes',
      render: (value: any, row: Attendance) => (
        <div className="text-sm text-gray-600 max-w-xs truncate">
          {row.notes || 'No notes'}
        </div>
      )
    }
  ];

  const formFields = [
    { 
      name: 'student_name', 
      label: 'Student Name', 
      type: 'select' as const, 
      required: true,
      options: [
        { value: 'John Doe', label: 'John Doe (Grade 10-A)' },
        { value: 'Sarah Smith', label: 'Sarah Smith (Grade 9-B)' },
        { value: 'Michael Johnson', label: 'Michael Johnson (Grade 11-C)' }
      ]
    },
    { name: 'class_name', label: 'Class', type: 'text' as const, required: true },
    { name: 'date', label: 'Date', type: 'date' as const, required: true },
    { 
      name: 'status', 
      label: 'Status', 
      type: 'select' as const, 
      required: true,
      options: [
        { value: 'present', label: 'Present' },
        { value: 'absent', label: 'Absent' },
        { value: 'late', label: 'Late' },
        { value: 'excused', label: 'Excused' }
      ]
    },
    { name: 'check_in_time', label: 'Check-in Time', type: 'time' as const },
    { name: 'check_out_time', label: 'Check-out Time', type: 'time' as const },
    { name: 'teacher_name', label: 'Teacher', type: 'text' as const, required: true },
    { name: 'notes', label: 'Notes', type: 'textarea' as const }
  ];

  // Calculate statistics
  const totalRecords = attendance.length;
  const presentCount = attendance.filter(a => a.status === 'present').length;
  const absentCount = attendance.filter(a => a.status === 'absent').length;
  const lateCount = attendance.filter(a => a.status === 'late').length;
  const attendanceRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-yellow-50 to-orange-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance Management</h1>
          <p className="text-gray-600">Track and manage student attendance records</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{totalRecords}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Present</p>
                <p className="text-2xl font-bold text-gray-900">{presentCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Absent</p>
                <p className="text-2xl font-bold text-gray-900">{absentCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Late</p>
                <p className="text-2xl font-bold text-gray-900">{lateCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-gray-900">{attendanceRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        {!showForm && (
          <DataTable
            data={attendance}
            columns={columns}
            title="Attendance Records"
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            loading={loading}
          />
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <FormBuilder
                fields={formFields}
                initialData={editingAttendance || {}}
                onSubmit={handleSubmit}
                onCancel={() => setShowForm(false)}
                title={editingAttendance ? 'Edit Attendance' : 'Add New Attendance Record'}
                submitText={editingAttendance ? 'Update Attendance' : 'Add Attendance'}
                loading={formLoading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
