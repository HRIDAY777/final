import React, { useEffect, useState } from 'react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface Assignment {
  id: string;
  title: string;
  description: string;
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
  due_date: string;
  max_marks: number;
  weightage: number;
  is_submitted: boolean;
  created_at: string;
  updated_at: string;
  submissions_count: number;
  graded_count: number;
  overdue_count: number;
}

interface Submission {
  id: string;
  student: {
    id: string;
    user: {
      first_name: string;
      last_name: string;
    };
  };
  content: string;
  attachment: string;
  submitted_at: string;
  graded_at: string;
  marks_obtained: number;
  feedback: string;
  is_late: boolean;
}

const Assignments: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  const [formData, setFormData] = useState({
    course: '',
    title: '',
    description: '',
    due_date: '',
    max_marks: 100,
    weightage: 10
  });

  const [gradeData, setGradeData] = useState({
    marks_obtained: 0,
    feedback: ''
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockAssignments: Assignment[] = [
      {
        id: '1',
        title: 'Mathematics Assignment #1',
        description: 'Complete exercises 1-20 from Chapter 3. Show all work and calculations.',
        course: {
          id: '1',
          subject: { name: 'Mathematics' },
          class_enrolled: { name: 'Class 10', section: 'A' }
        },
        due_date: '2024-01-20T23:59:00Z',
        max_marks: 100,
        weightage: 15,
        is_submitted: false,
        created_at: '2024-01-10T10:00:00Z',
        updated_at: '2024-01-10T10:00:00Z',
        submissions_count: 25,
        graded_count: 20,
        overdue_count: 5
      },
      {
        id: '2',
        title: 'Science Project Report',
        description: 'Write a comprehensive report on renewable energy sources with diagrams and references.',
        course: {
          id: '2',
          subject: { name: 'Science' },
          class_enrolled: { name: 'Class 9', section: 'B' }
        },
        due_date: '2024-01-25T23:59:00Z',
        max_marks: 150,
        weightage: 20,
        is_submitted: false,
        created_at: '2024-01-12T14:30:00Z',
        updated_at: '2024-01-12T14:30:00Z',
        submissions_count: 30,
        graded_count: 25,
        overdue_count: 5
      },
      {
        id: '3',
        title: 'English Essay',
        description: 'Write a 1000-word essay on the theme of friendship in literature.',
        course: {
          id: '3',
          subject: { name: 'English' },
          class_enrolled: { name: 'Class 11', section: 'A' }
        },
        due_date: '2024-01-18T23:59:00Z',
        max_marks: 80,
        weightage: 12,
        is_submitted: false,
        created_at: '2024-01-08T09:15:00Z',
        updated_at: '2024-01-08T09:15:00Z',
        submissions_count: 28,
        graded_count: 28,
        overdue_count: 0
      }
    ];

    const mockSubmissions: Submission[] = [
      {
        id: '1',
        student: {
          id: '1',
          user: { first_name: 'John', last_name: 'Doe' }
        },
        content: 'Completed all exercises with detailed calculations...',
        attachment: 'assignment1_john_doe.pdf',
        submitted_at: '2024-01-19T15:30:00Z',
        graded_at: '2024-01-20T10:00:00Z',
        marks_obtained: 85,
        feedback: 'Good work! Clear calculations and correct answers.',
        is_late: false
      },
      {
        id: '2',
        student: {
          id: '2',
          user: { first_name: 'Jane', last_name: 'Smith' }
        },
        content: 'Here is my project report on renewable energy...',
        attachment: 'science_project_jane_smith.docx',
        submitted_at: '2024-01-26T10:15:00Z',
        graded_at: '',
        marks_obtained: 0,
        feedback: '',
        is_late: true
      }
    ];

    setTimeout(() => {
      setAssignments(mockAssignments);
      setSubmissions(mockSubmissions);
      setLoading(false);
    }, 1000);
  }, []);

  // Function to fetch assignments from API
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const data = await apiService.get<Assignment[]>('/assignments/');
      setAssignments(data || []);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
      toast.error('Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch submissions for an assignment
  const fetchSubmissions = async (assignmentId?: string) => {
    try {
      const url = assignmentId ? `/assignment-submissions/?assignment=${assignmentId}` : '/assignment-submissions/';
      const data = await apiService.get<Submission[]>(url);
      setSubmissions(data || []);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
      toast.error('Failed to fetch submissions');
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'overdue' && new Date(assignment.due_date) < new Date()) ||
                         (statusFilter === 'upcoming' && new Date(assignment.due_date) > new Date());
    const matchesCourse = courseFilter === 'all' || assignment.course.subject.name === courseFilter;
    
    return matchesSearch && matchesStatus && matchesCourse;
  });

  const courses = [...new Set(assignments.map(a => a.course.subject.name))];

  const stats = {
    total: assignments.length,
    overdue: assignments.filter(a => new Date(a.due_date) < new Date()).length,
    upcoming: assignments.filter(a => new Date(a.due_date) > new Date()).length,
    totalSubmissions: assignments.reduce((sum, a) => sum + a.submissions_count, 0),
    totalGraded: assignments.reduce((sum, a) => sum + a.graded_count, 0),
    pendingGrading: assignments.reduce((sum, a) => sum + (a.submissions_count - a.graded_count), 0)
  };

  const handleCreateAssignment = () => {
    setFormData({
      course: '',
      title: '',
      description: '',
      due_date: '',
      max_marks: 100,
      weightage: 10
    });
    setEditingAssignment(null);
    setShowCreateModal(true);
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setFormData({
      course: assignment.course.id,
      title: assignment.title,
      description: assignment.description,
      due_date: assignment.due_date.slice(0, 16), // Format for datetime-local
      max_marks: assignment.max_marks,
      weightage: assignment.weightage
    });
    setEditingAssignment(assignment);
    setSelectedAssignment(assignment);
    setShowEditModal(true);
  };

  const handleViewSubmissions = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowSubmissions(true);
  };

  const handleGradeSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setGradeData({
      marks_obtained: submission.marks_obtained || 0,
      feedback: submission.feedback || ''
    });
    setShowGradeModal(true);
  };

  const handleSaveAssignment = async () => {
    try {
      if (editingAssignment) {
        await apiService.put(`/assignments/${editingAssignment.id}/`, formData);
        toast.success('Assignment updated successfully');
      } else {
        await apiService.post('/assignments/', formData);
        toast.success('Assignment created successfully');
      }
      fetchAssignments();
      setShowCreateModal(false);
      setShowEditModal(false);
      setEditingAssignment(null);
    } catch (error) {
      console.error('Failed to save assignment:', error);
      toast.error('Failed to save assignment');
    }
  };

  const handleSaveGrade = async () => {
    try {
      if (selectedSubmission) {
        await apiService.put(`/assignment-submissions/${selectedSubmission.id}/`, gradeData);
        toast.success('Grade saved successfully');
        fetchSubmissions();
      }
      setShowGradeModal(false);
    } catch (error) {
      console.error('Failed to save grade:', error);
      toast.error('Failed to save grade');
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await apiService.delete(`/assignments/${id}/`);
        toast.success('Assignment deleted successfully');
        fetchAssignments();
      } catch (error) {
        console.error('Failed to delete assignment:', error);
        toast.error('Failed to delete assignment');
      }
    }
  };

  const getStatusBadge = (assignment: Assignment) => {
    const isOverdue = new Date(assignment.due_date) < new Date();
    if (isOverdue) {
      return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Overdue</span>;
    }
    return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>;
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Assignments</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage course assignments, submissions, and grading
          </p>
        </div>
        <Button onClick={handleCreateAssignment} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Create Assignment
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DocumentTextIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Assignments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserGroupIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalSubmissions}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ExclamationTriangleIcon className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.overdue}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ChartBarIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Grading</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.pendingGrading}</p>
            </div>
          </div>
        </Card>
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
                  placeholder="Search assignments..."
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
                <option value="overdue">Overdue</option>
                <option value="upcoming">Upcoming</option>
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

      {/* Assignments Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submissions
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
              {filteredAssignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{assignment.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{assignment.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{assignment.course.subject.name}</div>
                    <div className="text-sm text-gray-500">{assignment.course.class_enrolled.name} {assignment.course.class_enrolled.section}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(assignment.due_date).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(assignment.due_date).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{assignment.submissions_count} submitted</div>
                    <div className="text-sm text-gray-500">{assignment.graded_count} graded</div>
                    {assignment.overdue_count > 0 && (
                      <div className="text-sm text-red-600">{assignment.overdue_count} overdue</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(assignment)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewSubmissions(assignment)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Submissions"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditAssignment(assignment)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit Assignment"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Assignment"
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

      {/* Create/Edit Assignment Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-start justify-center p-4">
          <div className="bg-white rounded-lg shadow-soft w-full max-w-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {showCreateModal ? 'Create Assignment' : 'Edit Assignment'}
              </h3>
              <button onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}>
                <XMarkIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveAssignment(); }} className="space-y-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="datetime-local"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Marks</label>
                  <input
                    type="number"
                    value={formData.max_marks}
                    onChange={(e) => setFormData({ ...formData, max_marks: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weightage (%)</label>
                  <input
                    type="number"
                    value={formData.weightage}
                    onChange={(e) => setFormData({ ...formData, weightage: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="100"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
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
                  {showCreateModal ? 'Create Assignment' : 'Update Assignment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submissions Modal */}
      {showSubmissions && selectedAssignment && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-start justify-center p-4">
          <div className="bg-white rounded-lg shadow-soft w-full max-w-4xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Submissions - {selectedAssignment.title}</h3>
                <p className="text-sm text-gray-600">{selectedAssignment.course.subject.name}</p>
              </div>
              <button onClick={() => setShowSubmissions(false)}>
                <XMarkIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions.map((submission) => (
                    <tr key={submission.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {submission.student.user.first_name} {submission.student.user.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(submission.submitted_at).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(submission.submitted_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {submission.is_late ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Late
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            On Time
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {submission.marks_obtained > 0 ? (
                          <div className="text-sm text-gray-900">
                            {submission.marks_obtained}/{selectedAssignment.max_marks}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Not graded</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleGradeSubmission(submission)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {submission.marks_obtained > 0 ? 'Regrade' : 'Grade'}
                          </button>
                          {submission.attachment && (
                            <button className="text-green-600 hover:text-green-900">
                              <ArrowDownTrayIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Grade Submission Modal */}
      {showGradeModal && selectedSubmission && selectedAssignment && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-start justify-center p-4">
          <div className="bg-white rounded-lg shadow-soft w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Grade Submission</h3>
              <button onClick={() => setShowGradeModal(false)}>
                <XMarkIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Student: {selectedSubmission.student.user.first_name} {selectedSubmission.student.user.last_name}
              </p>
              <p className="text-sm text-gray-600">
                Assignment: {selectedAssignment.title}
              </p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveGrade(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marks Obtained</label>
                <input
                  type="number"
                  value={gradeData.marks_obtained}
                  onChange={(e) => setGradeData({ ...gradeData, marks_obtained: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max={selectedAssignment.max_marks}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Max marks: {selectedAssignment.max_marks}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
                <textarea
                  value={gradeData.feedback}
                  onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Provide feedback to the student..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowGradeModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Save Grade
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;



