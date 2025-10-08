import React, { useEffect, useState } from 'react';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  UserGroupIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  CogIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

interface Class {
  id: string;
  name: string;
  section: string;
  academic_year: string;
  capacity: number;
  current_student_count: number;
  is_active: boolean;
  class_teacher?: string;
  room_number?: string;
  schedule?: string;
  subjects: string[];
  created_at: string;
  updated_at: string;
}



interface ClassStats {
  totalClasses: number;
  activeClasses: number;
  totalStudents: number;
  averageClassSize: number;
  subjectsPerClass: number;
  occupancyRate: number;
}

const Classes: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [capacityFilter, setCapacityFilter] = useState('all');
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockClasses: Class[] = [
      {
        id: '1',
        name: 'Class 10',
        section: 'A',
        academic_year: '2024-2025',
        capacity: 35,
        current_student_count: 32,
        is_active: true,
        class_teacher: 'Sarah Johnson',
        room_number: '101',
        schedule: 'Mon-Fri 8:00 AM - 2:30 PM',
        subjects: ['Mathematics', 'Science', 'English', 'History'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z'
      },
      {
        id: '2',
        name: 'Class 10',
        section: 'B',
        academic_year: '2024-2025',
        capacity: 35,
        current_student_count: 28,
        is_active: true,
        class_teacher: 'Michael Brown',
        room_number: '102',
        schedule: 'Mon-Fri 8:00 AM - 2:30 PM',
        subjects: ['Mathematics', 'Science', 'English', 'History'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z'
      },
      {
        id: '3',
        name: 'Class 9',
        section: 'A',
        academic_year: '2024-2025',
        capacity: 40,
        current_student_count: 38,
        is_active: true,
        class_teacher: 'Emily Davis',
        room_number: '201',
        schedule: 'Mon-Fri 8:00 AM - 2:30 PM',
        subjects: ['Mathematics', 'Science', 'English', 'Geography'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z'
      },
      {
        id: '4',
        name: 'Class 8',
        section: 'A',
        academic_year: '2024-2025',
        capacity: 35,
        current_student_count: 30,
        is_active: true,
        class_teacher: 'David Wilson',
        room_number: '301',
        schedule: 'Mon-Fri 8:00 AM - 2:30 PM',
        subjects: ['Mathematics', 'Science', 'English', 'Social Studies'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z'
      },
      {
        id: '5',
        name: 'Class 7',
        section: 'B',
        academic_year: '2024-2025',
        capacity: 35,
        current_student_count: 25,
        is_active: false,
        class_teacher: 'Lisa Anderson',
        room_number: '302',
        schedule: 'Mon-Fri 8:00 AM - 2:30 PM',
        subjects: ['Mathematics', 'Science', 'English', 'Social Studies'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z'
      }
    ];

    setTimeout(() => {
      setClasses(mockClasses);
      setLoading(false);
    }, 1000);
  }, []);

  const [newClass, setNewClass] = useState({
    name: '',
    section: '',
    academic_year: '2024-2025',
    capacity: 35,
    class_teacher: '',
    room_number: '',
    schedule: '',
    subjects: [] as string[]
  });

  const [editClass, setEditClass] = useState({
    id: '',
    name: '',
    section: '',
    academic_year: '',
    capacity: 35,
    class_teacher: '',
    room_number: '',
    schedule: '',
    subjects: [] as string[],
    is_active: true
  });

  // Calculate statistics
  const stats: ClassStats = {
    totalClasses: classes.length,
    activeClasses: classes.filter(c => c.is_active).length,
    totalStudents: classes.reduce((sum, c) => sum + c.current_student_count, 0),
    averageClassSize: classes.length > 0 ? Math.round(classes.reduce((sum, c) => sum + c.current_student_count, 0) / classes.length) : 0,
    subjectsPerClass: classes.length > 0 ? Math.round(classes.reduce((sum, c) => sum + c.subjects.length, 0) / classes.length) : 0,
    occupancyRate: classes.length > 0 ? Math.round((classes.reduce((sum, c) => sum + c.current_student_count, 0) / classes.reduce((sum, c) => sum + c.capacity, 0)) * 100) : 0
  };

  // Filter classes based on search and filters
  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cls.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cls.class_teacher?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cls.room_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = selectedYear === 'all' || cls.academic_year === selectedYear;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && cls.is_active) ||
                         (statusFilter === 'inactive' && !cls.is_active);
    const matchesCapacity = capacityFilter === 'all' ||
                           (capacityFilter === 'full' && cls.current_student_count >= cls.capacity) ||
                           (capacityFilter === 'available' && cls.current_student_count < cls.capacity);
    
    return matchesSearch && matchesYear && matchesStatus && matchesCapacity;
  });

  const academicYears = [...new Set(classes.map(cls => cls.academic_year))];

  const handleCreateClass = () => {
    const newClassData: Class = {
      id: Date.now().toString(),
      ...newClass,
      current_student_count: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setClasses([...classes, newClassData]);
    setNewClass({
      name: '',
      section: '',
      academic_year: '2024-2025',
      capacity: 35,
      class_teacher: '',
      room_number: '',
      schedule: '',
      subjects: []
    });
    setIsCreateModalOpen(false);
  };

  const handleEditClass = () => {
    const updatedClasses = classes.map(cls => 
      cls.id === editClass.id ? { ...cls, ...editClass, updated_at: new Date().toISOString() } : cls
    );
    setClasses(updatedClasses);
    setIsEditModalOpen(false);
  };

  const handleDeleteClass = (id: string) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      setClasses(classes.filter(cls => cls.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    setClasses(classes.map(cls => 
      cls.id === id ? { ...cls, is_active: !cls.is_active, updated_at: new Date().toISOString() } : cls
    ));
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
        isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const getCapacityStatus = (current: number, capacity: number) => {
    const percentage = (current / capacity) * 100;
    if (percentage >= 100) {
      return <span className="text-red-600 font-medium">Full</span>;
    } else if (percentage >= 80) {
      return <span className="text-yellow-600 font-medium">Nearly Full</span>;
    } else {
      return <span className="text-green-600 font-medium">Available</span>;
    }
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Class Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage school classes, sections, and student enrollment
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Add Class
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Classes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalClasses}</p>
                <p className="text-sm text-gray-500 mt-1">{stats.activeClasses} active</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <AcademicCapIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                <p className="text-sm text-gray-500 mt-1">Avg: {stats.averageClassSize} per class</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <UserGroupIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.occupancyRate}%</p>
                <p className="text-sm text-gray-500 mt-1">Class capacity utilization</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Subjects per Class</p>
                <p className="text-2xl font-bold text-gray-900">{stats.subjectsPerClass}</p>
                <p className="text-sm text-gray-500 mt-1">Average subjects</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <CogIcon className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader title="Search & Filters" />
        <div className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search classes, teachers, or rooms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2"
              >
                <FunnelIcon className="h-4 w-4" />
                Filters
                {showAdvancedFilters ? (
                  <ChevronUpIcon className="h-4 w-4" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Years</option>
                    {academicYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <select
                    value={capacityFilter}
                    onChange={(e) => setCapacityFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Classes</option>
                    <option value="available">Available Spots</option>
                    <option value="full">Full Capacity</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Classes Table */}
      <Card>
        <CardHeader title={`Classes (${filteredClasses.length})`} />
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher & Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Students
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subjects
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
                {filteredClasses.map((cls) => (
                  <tr key={cls.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{cls.name} - {cls.section}</div>
                        <div className="text-sm text-gray-500">{cls.academic_year}</div>
                        <div className="text-xs text-gray-400">{cls.schedule}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900">{cls.class_teacher || 'Not Assigned'}</div>
                        <div className="text-sm text-gray-500">Room {cls.room_number || 'TBD'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {cls.current_student_count} / {cls.capacity}
                        </div>
                        <div className="text-sm text-gray-500">
                          {getCapacityStatus(cls.current_student_count, cls.capacity)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {cls.subjects.slice(0, 2).map((subject, index) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {subject}
                          </span>
                        ))}
                        {cls.subjects.length > 2 && (
                          <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                            +{cls.subjects.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(cls.is_active)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedClass(cls);
                            setIsDetailsModalOpen(true);
                          }}
                          className="flex items-center gap-1"
                        >
                          <EyeIcon className="h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditClass({
                              id: cls.id,
                              name: cls.name,
                              section: cls.section,
                              academic_year: cls.academic_year,
                              capacity: cls.capacity,
                              class_teacher: cls.class_teacher || '',
                              room_number: cls.room_number || '',
                              schedule: cls.schedule || '',
                              subjects: cls.subjects,
                              is_active: cls.is_active
                            });
                            setIsEditModalOpen(true);
                          }}
                          className="flex items-center gap-1"
                        >
                          <PencilIcon className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleToggleStatus(cls.id)}
                          className={`flex items-center gap-1 ${
                            cls.is_active ? 'text-red-600' : 'text-green-600'
                          }`}
                        >
                          {cls.is_active ? (
                            <XCircleIcon className="h-4 w-4" />
                          ) : (
                            <CheckCircleIcon className="h-4 w-4" />
                          )}
                          {cls.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleDeleteClass(cls.id)}
                          className="flex items-center gap-1 text-red-600"
                        >
                          <TrashIcon className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredClasses.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <AcademicCapIcon className="h-12 w-12" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No classes found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || selectedYear !== 'all' || statusFilter !== 'all' || capacityFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating a new class.'
                }
              </p>
              {!searchQuery && selectedYear === 'all' && statusFilter === 'all' && capacityFilter === 'all' && (
                <div className="mt-6">
                  <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
                    <PlusIcon className="h-4 w-4" />
                    Add Class
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Create Class Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Create New Class</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                  <input
                    type="text"
                    value={newClass.name}
                    onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Class 10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                  <input
                    type="text"
                    value={newClass.section}
                    onChange={(e) => setNewClass({ ...newClass, section: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., A"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                <input
                  type="text"
                  value={newClass.academic_year}
                  onChange={(e) => setNewClass({ ...newClass, academic_year: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2024-2025"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={newClass.capacity}
                    onChange={(e) => setNewClass({ ...newClass, capacity: parseInt(e.target.value) || 35 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                  <input
                    type="text"
                    value={newClass.room_number}
                    onChange={(e) => setNewClass({ ...newClass, room_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 101"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class Teacher</label>
                <input
                  type="text"
                  value={newClass.class_teacher}
                  onChange={(e) => setNewClass({ ...newClass, class_teacher: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Sarah Johnson"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
                <input
                  type="text"
                  value={newClass.schedule}
                  onChange={(e) => setNewClass({ ...newClass, schedule: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Mon-Fri 8:00 AM - 2:30 PM"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateClass}>
                Create Class
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Class</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                  <input
                    type="text"
                    value={editClass.name}
                    onChange={(e) => setEditClass({ ...editClass, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                  <input
                    type="text"
                    value={editClass.section}
                    onChange={(e) => setEditClass({ ...editClass, section: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                <input
                  type="text"
                  value={editClass.academic_year}
                  onChange={(e) => setEditClass({ ...editClass, academic_year: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={editClass.capacity}
                    onChange={(e) => setEditClass({ ...editClass, capacity: parseInt(e.target.value) || 35 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                  <input
                    type="text"
                    value={editClass.room_number}
                    onChange={(e) => setEditClass({ ...editClass, room_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class Teacher</label>
                <input
                  type="text"
                  value={editClass.class_teacher}
                  onChange={(e) => setEditClass({ ...editClass, class_teacher: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
                <input
                  type="text"
                  value={editClass.schedule}
                  onChange={(e) => setEditClass({ ...editClass, schedule: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={editClass.is_active}
                  onChange={(e) => setEditClass({ ...editClass, is_active: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Active Class
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleEditClass}>
                Update Class
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Class Details Modal */}
      {isDetailsModalOpen && selectedClass && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Class Details</h3>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Basic Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Class:</span>
                      <span className="text-sm font-medium text-gray-900 ml-2">{selectedClass.name} - {selectedClass.section}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Academic Year:</span>
                      <span className="text-sm font-medium text-gray-900 ml-2">{selectedClass.academic_year}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Status:</span>
                      <span className="ml-2">{getStatusBadge(selectedClass.is_active)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Capacity & Enrollment</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Students:</span>
                      <span className="text-sm font-medium text-gray-900 ml-2">{selectedClass.current_student_count} / {selectedClass.capacity}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Occupancy:</span>
                      <span className="text-sm font-medium text-gray-900 ml-2">{Math.round((selectedClass.current_student_count / selectedClass.capacity) * 100)}%</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Available:</span>
                      <span className="text-sm font-medium text-gray-900 ml-2">{selectedClass.capacity - selectedClass.current_student_count} spots</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Teacher & Schedule */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Teacher & Location</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Class Teacher:</span>
                      <span className="text-sm font-medium text-gray-900 ml-2">{selectedClass.class_teacher || 'Not Assigned'}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Room Number:</span>
                      <span className="text-sm font-medium text-gray-900 ml-2">{selectedClass.room_number || 'TBD'}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Schedule</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Timing:</span>
                      <span className="text-sm font-medium text-gray-900 ml-2">{selectedClass.schedule || 'Not Set'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subjects */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Subjects ({selectedClass.subjects.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedClass.subjects.map((subject, index) => (
                    <span key={index} className="inline-flex px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    setEditClass({
                      id: selectedClass.id,
                      name: selectedClass.name,
                      section: selectedClass.section,
                      academic_year: selectedClass.academic_year,
                      capacity: selectedClass.capacity,
                      class_teacher: selectedClass.class_teacher || '',
                      room_number: selectedClass.room_number || '',
                      schedule: selectedClass.schedule || '',
                      subjects: selectedClass.subjects,
                      is_active: selectedClass.is_active
                    });
                    setIsEditModalOpen(true);
                  }}
                >
                  Edit Class
                </Button>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;



