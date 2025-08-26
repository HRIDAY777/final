import React, { useState, useEffect } from 'react';
import { 
  AcademicCapIcon, UserIcon, CalendarIcon, PhoneIcon, 
  EnvelopeIcon, MapPinIcon, ClockIcon, CheckCircleIcon,
  BookOpenIcon, CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import DataTable from '../../components/CRUD/DataTable';
import FormBuilder from '../../components/Forms/FormBuilder';
import { apiService } from '../../services/api';

interface Teacher {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  address: string;
  hire_date: string;
  department: string;
  subject: string;
  qualification: string;
  experience_years: number;
  salary: number;
  status: 'active' | 'inactive' | 'retired';
  created_at: string;
}

const Teachers: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Sample data for demo
  const sampleTeachers: Teacher[] = [
    {
      id: 1,
      first_name: 'Dr. Sarah',
      last_name: 'Johnson',
      email: 'sarah.johnson@school.com',
      phone: '+1234567890',
      date_of_birth: '1985-05-15',
      gender: 'Female',
      address: '123 Education St, City, State',
      hire_date: '2020-08-01',
      department: 'Science',
      subject: 'Physics',
      qualification: 'Ph.D. in Physics',
      experience_years: 8,
      salary: 65000,
      status: 'active',
      created_at: '2020-08-01T00:00:00Z'
    },
    {
      id: 2,
      first_name: 'Prof. Michael',
      last_name: 'Chen',
      email: 'michael.chen@school.com',
      phone: '+1234567891',
      date_of_birth: '1980-12-22',
      gender: 'Male',
      address: '456 Academic Ave, City, State',
      hire_date: '2018-09-01',
      department: 'Mathematics',
      subject: 'Advanced Calculus',
      qualification: 'M.Sc. in Mathematics',
      experience_years: 12,
      salary: 70000,
      status: 'active',
      created_at: '2018-09-01T00:00:00Z'
    },
    {
      id: 3,
      first_name: 'Ms. Emily',
      last_name: 'Rodriguez',
      email: 'emily.rodriguez@school.com',
      phone: '+1234567892',
      date_of_birth: '1990-03-08',
      gender: 'Female',
      address: '789 Teaching Rd, City, State',
      hire_date: '2022-01-15',
      department: 'Languages',
      subject: 'English Literature',
      qualification: 'M.A. in English',
      experience_years: 5,
      salary: 55000,
      status: 'active',
      created_at: '2022-01-15T00:00:00Z'
    }
  ];

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      // In real app, this would be: const data = await apiService.get('/teachers/');
      const data = sampleTeachers;
      setTeachers(data);
    } catch (error) {
      console.error('Error loading teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingTeacher(null);
    setShowForm(true);
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setShowForm(true);
  };

  const handleDelete = async (teacher: Teacher) => {
    if (window.confirm(`Are you sure you want to delete ${teacher.first_name} ${teacher.last_name}?`)) {
      try {
        // In real app, this would be: await apiService.delete(`/teachers/${teacher.id}/`);
        setTeachers(prev => prev.filter(t => t.id !== teacher.id));
      } catch (error) {
        console.error('Error deleting teacher:', error);
      }
    }
  };

  const handleView = (teacher: Teacher) => {
    // Navigate to teacher detail page or show modal
    alert(`Viewing details for ${teacher.first_name} ${teacher.last_name}`);
  };

  const handleSubmit = async (formData: any) => {
    try {
      setFormLoading(true);
      
      if (editingTeacher) {
        // Update existing teacher
        // In real app: await apiService.put(`/teachers/${editingTeacher.id}/`, formData);
        setTeachers(prev => prev.map(t => t.id === editingTeacher.id ? { ...t, ...formData } : t));
      } else {
        // Create new teacher
        const newTeacher = { ...formData, id: Date.now(), created_at: new Date().toISOString() };
        // In real app: const data = await apiService.post('/teachers/', formData);
        setTeachers(prev => [...prev, newTeacher]);
      }
      
      setShowForm(false);
      setEditingTeacher(null);
    } catch (error) {
      console.error('Error saving teacher:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value: any, row: Teacher) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
            <AcademicCapIcon className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{row.first_name} {row.last_name}</div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'department',
      label: 'Department & Subject',
      sortable: true,
      render: (value: any, row: Teacher) => (
        <div className="space-y-1">
          <div className="flex items-center">
            <BookOpenIcon className="w-4 h-4 text-blue-600 mr-2" />
            <span className="font-medium">{row.department}</span>
          </div>
          <div className="text-sm text-gray-600">{row.subject}</div>
        </div>
      )
    },
    {
      key: 'qualification',
      label: 'Qualification',
      render: (value: any, row: Teacher) => (
        <div className="space-y-1">
          <div className="text-sm font-medium">{row.qualification}</div>
          <div className="text-sm text-gray-500">{row.experience_years} years experience</div>
        </div>
      )
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (value: any, row: Teacher) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm">
            <PhoneIcon className="w-3 h-3 text-gray-400 mr-1" />
            {row.phone}
          </div>
          <div className="flex items-center text-sm">
            <EnvelopeIcon className="w-3 h-3 text-gray-400 mr-1" />
            {row.email}
          </div>
        </div>
      )
    },
    {
      key: 'hire_date',
      label: 'Hire Date',
      sortable: true,
      render: (value: any, row: Teacher) => (
        <div className="flex items-center">
          <CalendarIcon className="w-4 h-4 text-gray-400 mr-2" />
          <span className="text-sm">{new Date(row.hire_date).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'salary',
      label: 'Salary',
      sortable: true,
      render: (value: any, row: Teacher) => (
        <div className="flex items-center">
          <CurrencyDollarIcon className="w-4 h-4 text-green-600 mr-2" />
          <span className="font-medium">${row.salary.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: any, row: Teacher) => {
        const statusConfig = {
          active: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
          inactive: { color: 'bg-red-100 text-red-800', icon: ClockIcon },
          retired: { color: 'bg-gray-100 text-gray-800', icon: UserIcon }
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
    { name: 'first_name', label: 'First Name', type: 'text' as const, required: true },
    { name: 'last_name', label: 'Last Name', type: 'text' as const, required: true },
    { name: 'email', label: 'Email', type: 'email' as const, required: true },
    { name: 'phone', label: 'Phone', type: 'text' as const, required: true },
    { name: 'date_of_birth', label: 'Date of Birth', type: 'date' as const, required: true },
    { 
      name: 'gender', 
      label: 'Gender', 
      type: 'select' as const, 
      required: true,
      options: [
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' },
        { value: 'Other', label: 'Other' }
      ]
    },
    { name: 'address', label: 'Address', type: 'textarea' as const, required: true },
    { name: 'hire_date', label: 'Hire Date', type: 'date' as const, required: true },
    { name: 'department', label: 'Department', type: 'select' as const, required: true,
      options: [
        { value: 'Science', label: 'Science' },
        { value: 'Mathematics', label: 'Mathematics' },
        { value: 'Languages', label: 'Languages' },
        { value: 'History', label: 'History' },
        { value: 'Arts', label: 'Arts' },
        { value: 'Physical Education', label: 'Physical Education' }
      ]
    },
    { name: 'subject', label: 'Subject', type: 'text' as const, required: true },
    { name: 'qualification', label: 'Qualification', type: 'text' as const, required: true },
    { name: 'experience_years', label: 'Experience (Years)', type: 'number' as const, required: true },
    { name: 'salary', label: 'Salary', type: 'number' as const, required: true },
    { 
      name: 'status', 
      label: 'Status', 
      type: 'select' as const, 
      required: true,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'retired', label: 'Retired' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Teacher Management</h1>
          <p className="text-gray-600">Manage all teacher information, qualifications, and assignments</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <AcademicCapIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Teachers</p>
                <p className="text-2xl font-bold text-gray-900">{teachers.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Teachers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {teachers.filter(t => t.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inactive Teachers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {teachers.filter(t => t.status === 'inactive').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Salary</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${Math.round(teachers.reduce((sum, t) => sum + t.salary, 0) / teachers.length).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        {!showForm && (
          <DataTable
            data={teachers}
            columns={columns}
            title="Teachers"
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
                initialData={editingTeacher || {}}
                onSubmit={handleSubmit}
                onCancel={() => setShowForm(false)}
                title={editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
                submitText={editingTeacher ? 'Update Teacher' : 'Add Teacher'}
                loading={formLoading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Teachers;
