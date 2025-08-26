import React, { useState, useEffect } from 'react';
import { 
  AcademicCapIcon, CalendarIcon, ClockIcon, CheckCircleIcon,
  XCircleIcon, ExclamationTriangleIcon, ChartBarIcon,
  DocumentTextIcon, UserIcon
} from '@heroicons/react/24/outline';
import DataTable from '../../components/CRUD/DataTable';
import FormBuilder from '../../components/Forms/FormBuilder';
import { apiService } from '../../services/api';

interface Exam {
  id: number;
  title: string;
  subject: string;
  exam_type: 'midterm' | 'final' | 'quiz' | 'assignment';
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  total_marks: number;
  passing_marks: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  room: string;
  teacher_name: string;
  description: string;
  created_at: string;
}

const Exams: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Sample data for demo
  const sampleExams: Exam[] = [
    {
      id: 1,
      title: 'Mathematics Midterm',
      subject: 'Advanced Calculus',
      exam_type: 'midterm',
      date: '2024-02-15',
      start_time: '09:00',
      end_time: '11:00',
      duration_minutes: 120,
      total_marks: 100,
      passing_marks: 40,
      status: 'upcoming',
      room: 'Room 101',
      teacher_name: 'Dr. Sarah Johnson',
      description: 'Covers chapters 1-5 of Advanced Calculus',
      created_at: '2024-01-15T00:00:00Z'
    },
    {
      id: 2,
      title: 'Physics Quiz',
      subject: 'Physics',
      exam_type: 'quiz',
      date: '2024-02-10',
      start_time: '14:00',
      end_time: '15:00',
      duration_minutes: 60,
      total_marks: 50,
      passing_marks: 25,
      status: 'completed',
      room: 'Room 205',
      teacher_name: 'Prof. Michael Chen',
      description: 'Quick assessment on mechanics',
      created_at: '2024-01-10T00:00:00Z'
    },
    {
      id: 3,
      title: 'English Literature Final',
      subject: 'English Literature',
      exam_type: 'final',
      date: '2024-03-20',
      start_time: '10:00',
      end_time: '13:00',
      duration_minutes: 180,
      total_marks: 150,
      passing_marks: 60,
      status: 'upcoming',
      room: 'Room 301',
      teacher_name: 'Ms. Emily Rodriguez',
      description: 'Comprehensive final examination',
      created_at: '2024-01-20T00:00:00Z'
    }
  ];

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      // In real app, this would be: const data = await apiService.get('/exams/');
      const data = sampleExams;
      setExams(data);
    } catch (error) {
      console.error('Error loading exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingExam(null);
    setShowForm(true);
  };

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam);
    setShowForm(true);
  };

  const handleDelete = async (exam: Exam) => {
    if (window.confirm(`Are you sure you want to delete ${exam.title}?`)) {
      try {
        // In real app, this would be: await apiService.delete(`/exams/${exam.id}/`);
        setExams(prev => prev.filter(e => e.id !== exam.id));
      } catch (error) {
        console.error('Error deleting exam:', error);
      }
    }
  };

  const handleView = (exam: Exam) => {
    // Navigate to exam detail page or show modal
    alert(`Viewing details for ${exam.title}`);
  };

  const handleSubmit = async (formData: any) => {
    try {
      setFormLoading(true);
      
      if (editingExam) {
        // Update existing exam
        // In real app: await apiService.put(`/exams/${editingExam.id}/`, formData);
        setExams(prev => prev.map(e => e.id === editingExam.id ? { ...e, ...formData } : e));
      } else {
        // Create new exam
        const newExam = { ...formData, id: Date.now(), created_at: new Date().toISOString() };
        // In real app: const data = await apiService.post('/exams/', formData);
        setExams(prev => [...prev, newExam]);
      }
      
      setShowForm(false);
      setEditingExam(null);
    } catch (error) {
      console.error('Error saving exam:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Exam',
      sortable: true,
      render: (value: any, row: Exam) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <DocumentTextIcon className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{row.title}</div>
            <div className="text-sm text-gray-500">{row.subject}</div>
          </div>
        </div>
      )
    },
    {
      key: 'exam_type',
      label: 'Type',
      sortable: true,
      render: (value: any, row: Exam) => {
        const typeConfig = {
          midterm: { color: 'bg-yellow-100 text-yellow-800', label: 'Midterm' },
          final: { color: 'bg-red-100 text-red-800', label: 'Final' },
          quiz: { color: 'bg-green-100 text-green-800', label: 'Quiz' },
          assignment: { color: 'bg-purple-100 text-purple-800', label: 'Assignment' }
        };
        
        const config = typeConfig[row.exam_type];
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            {config.label}
          </span>
        );
      }
    },
    {
      key: 'date',
      label: 'Date & Time',
      sortable: true,
      render: (value: any, row: Exam) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm">
            <CalendarIcon className="w-3 h-3 text-gray-400 mr-1" />
            {new Date(row.date).toLocaleDateString()}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <ClockIcon className="w-3 h-3 mr-1" />
            {row.start_time} - {row.end_time}
          </div>
        </div>
      )
    },
    {
      key: 'marks',
      label: 'Marks',
      render: (value: any, row: Exam) => (
        <div className="space-y-1">
          <div className="text-sm font-medium">Total: {row.total_marks}</div>
          <div className="text-sm text-gray-500">Pass: {row.passing_marks}</div>
        </div>
      )
    },
    {
      key: 'teacher',
      label: 'Teacher',
      render: (value: any, row: Exam) => (
        <div className="flex items-center">
          <UserIcon className="w-4 h-4 text-green-600 mr-2" />
          <span className="text-sm">{row.teacher_name}</span>
        </div>
      )
    },
    {
      key: 'room',
      label: 'Room',
      render: (value: any, row: Exam) => (
        <span className="text-sm font-medium">{row.room}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: any, row: Exam) => {
        const statusConfig = {
          upcoming: { color: 'bg-blue-100 text-blue-800', icon: ClockIcon },
          ongoing: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
          completed: { color: 'bg-gray-100 text-gray-800', icon: CheckCircleIcon },
          cancelled: { color: 'bg-red-100 text-red-800', icon: XCircleIcon }
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
    }
  ];

  const formFields = [
    { name: 'title', label: 'Exam Title', type: 'text' as const, required: true },
    { name: 'subject', label: 'Subject', type: 'text' as const, required: true },
    { 
      name: 'exam_type', 
      label: 'Exam Type', 
      type: 'select' as const, 
      required: true,
      options: [
        { value: 'midterm', label: 'Midterm' },
        { value: 'final', label: 'Final' },
        { value: 'quiz', label: 'Quiz' },
        { value: 'assignment', label: 'Assignment' }
      ]
    },
    { name: 'date', label: 'Date', type: 'date' as const, required: true },
    { name: 'start_time', label: 'Start Time', type: 'time' as const, required: true },
    { name: 'end_time', label: 'End Time', type: 'time' as const, required: true },
    { name: 'duration_minutes', label: 'Duration (minutes)', type: 'number' as const, required: true },
    { name: 'total_marks', label: 'Total Marks', type: 'number' as const, required: true },
    { name: 'passing_marks', label: 'Passing Marks', type: 'number' as const, required: true },
    { name: 'room', label: 'Room', type: 'text' as const, required: true },
    { name: 'teacher_name', label: 'Teacher', type: 'text' as const, required: true },
    { 
      name: 'status', 
      label: 'Status', 
      type: 'select' as const, 
      required: true,
      options: [
        { value: 'upcoming', label: 'Upcoming' },
        { value: 'ongoing', label: 'Ongoing' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }
      ]
    },
    { name: 'description', label: 'Description', type: 'textarea' as const }
  ];

  // Calculate statistics
  const totalExams = exams.length;
  const upcomingExams = exams.filter(e => e.status === 'upcoming').length;
  const completedExams = exams.filter(e => e.status === 'completed').length;
  const ongoingExams = exams.filter(e => e.status === 'ongoing').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Exam Management</h1>
          <p className="text-gray-600">Manage all examinations, schedules, and results</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Exams</p>
                <p className="text-2xl font-bold text-gray-900">{totalExams}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingExams}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedExams}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ongoing</p>
                <p className="text-2xl font-bold text-gray-900">{ongoingExams}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        {!showForm && (
          <DataTable
            data={exams}
            columns={columns}
            title="Exams"
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
                initialData={editingExam || {}}
                onSubmit={handleSubmit}
                onCancel={() => setShowForm(false)}
                title={editingExam ? 'Edit Exam' : 'Add New Exam'}
                submitText={editingExam ? 'Update Exam' : 'Add Exam'}
                loading={formLoading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Exams;


