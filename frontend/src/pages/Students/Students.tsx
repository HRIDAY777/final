import React, { useState, useEffect, useCallback } from 'react';
import { 
  UserIcon, AcademicCapIcon, CalendarIcon, PhoneIcon, 
  EnvelopeIcon, ClockIcon, CheckCircleIcon 
} from '@heroicons/react/24/outline';
import DataTable from '../../components/CRUD/DataTable';
import FormBuilder from '../../components/Forms/FormBuilder';

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  address: string;
  enrollment_date: string;
  grade: string;
  section: string;
  parent_name: string;
  parent_phone: string;
  status: 'active' | 'inactive' | 'graduated';
  created_at: string;
}

// Sample data for demo
const sampleStudents: Student[] = [
  {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@school.com',
    phone: '+1234567890',
    date_of_birth: '2005-03-15',
    gender: 'Male',
    address: '123 Main St, City, State',
    enrollment_date: '2023-09-01',
    grade: '10',
    section: 'A',
    parent_name: 'Jane Doe',
    parent_phone: '+1234567891',
    status: 'active',
    created_at: '2023-09-01T00:00:00Z'
  },
  {
    id: 2,
    first_name: 'Sarah',
    last_name: 'Smith',
    email: 'sarah.smith@school.com',
    phone: '+1234567892',
    date_of_birth: '2006-07-22',
    gender: 'Female',
    address: '456 Oak Ave, City, State',
    enrollment_date: '2023-09-01',
    grade: '9',
    section: 'B',
    parent_name: 'Mike Smith',
    parent_phone: '+1234567893',
    status: 'active',
    created_at: '2023-09-01T00:00:00Z'
  },
  {
    id: 3,
    first_name: 'Michael',
    last_name: 'Johnson',
    email: 'michael.johnson@school.com',
    phone: '+1234567894',
    date_of_birth: '2004-11-08',
    gender: 'Male',
    address: '789 Pine Rd, City, State',
    enrollment_date: '2023-09-01',
    grade: '11',
    section: 'C',
    parent_name: 'Lisa Johnson',
    parent_phone: '+1234567895',
    status: 'active',
    created_at: '2023-09-01T00:00:00Z'
  }
];

const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      // In real app, this would be: const data = await apiService.get('/students/');
      const data = sampleStudents;
      setStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleAdd = () => {
    setEditingStudent(null);
    setShowForm(true);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleDelete = async (student: Student) => {
    if (window.confirm(`Are you sure you want to delete ${student.first_name} ${student.last_name}?`)) {
      try {
        // In real app, this would be: await apiService.delete(`/students/${student.id}/`);
        setStudents(prev => prev.filter(s => s.id !== student.id));
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  const handleView = (student: Student) => {
    // Navigate to student detail page or show modal
    alert(`Viewing details for ${student.first_name} ${student.last_name}`);
  };

  const handleSubmit = async (formData: any) => {
    try {
      setFormLoading(true);
      
      if (editingStudent) {
        // Update existing student
        // In real app: await apiService.put(`/students/${editingStudent.id}/`, formData);
        setStudents(prev => prev.map(s => s.id === editingStudent.id ? { ...s, ...formData } : s));
      } else {
        // Create new student
        const newStudent = { ...formData, id: Date.now(), created_at: new Date().toISOString() };
        // In real app: const data = await apiService.post('/students/', formData);
        setStudents(prev => [...prev, newStudent]);
      }
      
      setShowForm(false);
      setEditingStudent(null);
    } catch (error) {
      console.error('Error saving student:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value: any, row: Student) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <UserIcon className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{row.first_name} {row.last_name}</div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'grade',
      label: 'Grade & Section',
      sortable: true,
      render: (value: any, row: Student) => (
        <div className="flex items-center">
          <AcademicCapIcon className="w-4 h-4 text-green-600 mr-2" />
          <span className="font-medium">Grade {row.grade} - {row.section}</span>
        </div>
      )
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (value: any, row: Student) => (
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
      key: 'parent',
      label: 'Parent',
      render: (value: any, row: Student) => (
        <div className="space-y-1">
          <div className="text-sm font-medium">{row.parent_name}</div>
          <div className="flex items-center text-sm text-gray-500">
            <PhoneIcon className="w-3 h-3 mr-1" />
            {row.parent_phone}
          </div>
        </div>
      )
    },
    {
      key: 'enrollment_date',
      label: 'Enrollment Date',
      sortable: true,
      render: (value: any, row: Student) => (
        <div className="flex items-center">
          <CalendarIcon className="w-4 h-4 text-gray-400 mr-2" />
          <span className="text-sm">{new Date(row.enrollment_date).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: any, row: Student) => {
        const statusConfig = {
          active: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
          inactive: { color: 'bg-red-100 text-red-800', icon: ClockIcon },
          graduated: { color: 'bg-blue-100 text-blue-800', icon: AcademicCapIcon }
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
    { name: 'grade', label: 'Grade', type: 'select' as const, required: true,
      options: [
        { value: '9', label: 'Grade 9' },
        { value: '10', label: 'Grade 10' },
        { value: '11', label: 'Grade 11' },
        { value: '12', label: 'Grade 12' }
      ]
    },
    { name: 'section', label: 'Section', type: 'select' as const, required: true,
      options: [
        { value: 'A', label: 'Section A' },
        { value: 'B', label: 'Section B' },
        { value: 'C', label: 'Section C' },
        { value: 'D', label: 'Section D' }
      ]
    },
    { name: 'parent_name', label: 'Parent Name', type: 'text' as const, required: true },
    { name: 'parent_phone', label: 'Parent Phone', type: 'text' as const, required: true },
    { 
      name: 'status', 
      label: 'Status', 
      type: 'select' as const, 
      required: true,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'graduated', label: 'Graduated' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Management</h1>
          <p className="text-gray-600">Manage all student information, enrollment, and academic records</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{students.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {students.filter(s => s.status === 'active').length}
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
                <p className="text-sm font-medium text-gray-600">Inactive Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {students.filter(s => s.status === 'inactive').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <AcademicCapIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Graduated</p>
                <p className="text-2xl font-bold text-gray-900">
                  {students.filter(s => s.status === 'graduated').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        {!showForm && (
          <DataTable
            data={students}
            columns={columns}
            title="Students"
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
                initialData={editingStudent || {}}
                onSubmit={handleSubmit}
                onCancel={() => setShowForm(false)}
                title={editingStudent ? 'Edit Student' : 'Add New Student'}
                submitText={editingStudent ? 'Update Student' : 'Add Student'}
                loading={formLoading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Students;
