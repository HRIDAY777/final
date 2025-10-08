import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { Button } from '../../components/UI/Button';
import { Badge } from '../../components/UI/Badge';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../../components/UI/Select';

import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusIcon,
  ChartBarIcon,
  UserGroupIcon,
  AcademicCapIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// Simple Input component for this file
const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ 
  className = '', 
  ...props 
}) => (
  <input
    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
    {...props}
  />
);

interface AssignmentStats {
  total_assignments: number;
  active_assignments: number;
  overdue_assignments: number;
  total_submissions: number;
  graded_submissions: number;
  pending_submissions: number;
  average_score: number;
  submissions_by_status: Record<string, number>;
  assignments_by_type: Record<string, number>;
  recent_assignments: Array<{
    id: string;
    title: string;
    assignment_type: string;
    subject_name: string;
    class_name: string;
    due_date: string;
    total_marks: number;
    submission_count: number;
    graded_count: number;
    status: string;
  }>;
  upcoming_deadlines: Array<{
    id: string;
    title: string;
    assignment_type: string;
    subject_name: string;
    class_name: string;
    due_date: string;
    total_marks: number;
    days_remaining: number;
  }>;
}

const Assignments: React.FC = () => {
  const [stats, setStats] = useState<AssignmentStats>({
    total_assignments: 0,
    active_assignments: 0,
    overdue_assignments: 0,
    total_submissions: 0,
    graded_submissions: 0,
    pending_submissions: 0,
    average_score: 0,
    submissions_by_status: {},
    assignments_by_type: {},
    recent_assignments: [],
    upcoming_deadlines: []
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);


  useEffect(() => {
    fetchAssignmentStats();
  }, []);

  const fetchAssignmentStats = async () => {
    try {
      setLoading(true);
      
      // Mock data for now - replace with actual API call
      const mockStats: AssignmentStats = {
        total_assignments: 45,
        active_assignments: 23,
        overdue_assignments: 5,
        total_submissions: 156,
        graded_submissions: 134,
        pending_submissions: 22,
        average_score: 78.5,
        submissions_by_status: {
          'submitted': 89,
          'graded': 134,
          'late': 12,
          'returned': 8
        },
        assignments_by_type: {
          'homework': 18,
          'project': 12,
          'essay': 8,
          'presentation': 4,
          'quiz': 3
        },
        recent_assignments: [
          {
            id: '1',
            title: 'Mathematics Problem Set 5',
            assignment_type: 'homework',
            subject_name: 'Mathematics',
            class_name: 'Class 10A',
            due_date: '2024-01-20T23:59:00Z',
            total_marks: 20,
            submission_count: 28,
            graded_count: 25,
            status: 'active'
          },
          {
            id: '2',
            title: 'Science Lab Report',
            assignment_type: 'project',
            subject_name: 'Physics',
            class_name: 'Class 11B',
            due_date: '2024-01-18T23:59:00Z',
            total_marks: 30,
            submission_count: 22,
            graded_count: 18,
            status: 'active'
          },
          {
            id: '3',
            title: 'English Essay - Shakespeare',
            assignment_type: 'essay',
            subject_name: 'English Literature',
            class_name: 'Class 12A',
            due_date: '2024-01-15T23:59:00Z',
            total_marks: 25,
            submission_count: 30,
            graded_count: 28,
            status: 'completed'
          }
        ],
        upcoming_deadlines: [
          {
            id: '4',
            title: 'History Research Paper',
            assignment_type: 'project',
            subject_name: 'History',
            class_name: 'Class 11A',
            due_date: '2024-01-25T23:59:00Z',
            total_marks: 40,
            days_remaining: 3
          },
          {
            id: '5',
            title: 'Chemistry Quiz',
            assignment_type: 'quiz',
            subject_name: 'Chemistry',
            class_name: 'Class 10B',
            due_date: '2024-01-26T23:59:00Z',
            total_marks: 15,
            days_remaining: 4
          },
          {
            id: '6',
            title: 'Computer Science Programming',
            assignment_type: 'project',
            subject_name: 'Computer Science',
            class_name: 'Class 12B',
            due_date: '2024-01-28T23:59:00Z',
            total_marks: 35,
            days_remaining: 6
          }
        ]
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching assignment stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAssignmentTypeIcon = (type: string) => {
    switch (type) {
      case 'homework':
        return <DocumentTextIcon className="w-5 h-5" />;
      case 'project':
        return <AcademicCapIcon className="w-5 h-5" />;
      case 'essay':
        return <DocumentTextIcon className="w-5 h-5" />;
      case 'presentation':
        return <UserGroupIcon className="w-5 h-5" />;
      case 'quiz':
        return <ChartBarIcon className="w-5 h-5" />;
      default:
        return <DocumentTextIcon className="w-5 h-5" />;
    }
  };

  const getAssignmentTypeColor = (type: string) => {
    switch (type) {
      case 'homework':
        return 'bg-blue-100 text-blue-600';
      case 'project':
        return 'bg-purple-100 text-purple-600';
      case 'essay':
        return 'bg-green-100 text-green-600';
      case 'presentation':
        return 'bg-orange-100 text-orange-600';
      case 'quiz':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'completed':
        return 'text-blue-600 bg-blue-50';
      case 'overdue':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const handleCreateAssignment = () => {
    setShowCreateModal(true);
  };

  const handleGradeSubmissions = () => {
    setShowGradeModal(true);
  };

  const handleExportReports = () => {
    // Simulate export functionality
    const dataStr = JSON.stringify(stats, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'assignments-report.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleViewCalendar = () => {
    // Navigate to calendar view
    window.location.href = '/assignments/calendar';
  };

  const handleViewAllAssignments = () => {
    // Navigate to assignments list
    window.location.href = '/assignments/list';
  };

  const handleAssignmentAction = (action: string, assignmentId: string) => {
    switch (action) {
      case 'view':
        window.location.href = `/assignments/${assignmentId}`;
        break;
      case 'edit':
        window.location.href = `/assignments/${assignmentId}/edit`;
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this assignment?')) {
          console.log('Delete assignment:', assignmentId);
        }
        break;
      case 'duplicate':
        console.log('Duplicate assignment:', assignmentId);
        break;
      case 'grade':
        setShowGradeModal(true);
        break;
    }
  };

  const quickActions = [
    {
      name: 'Create Assignment',
      description: 'Create a new assignment',
      icon: PlusIcon,
      action: handleCreateAssignment
    },
    {
      name: 'Grade Submissions',
      description: 'Grade pending submissions',
      icon: CheckCircleIcon,
      action: handleGradeSubmissions
    },
    {
      name: 'Export Reports',
      description: 'Export assignment reports',
      icon: DocumentArrowDownIcon,
      action: handleExportReports
    },
    {
      name: 'View Calendar',
      description: 'View assignment calendar',
      icon: CalendarIcon,
      action: handleViewCalendar
    }
  ];

  const assignmentTypes = [
    { id: 'all', label: 'All Types' },
    { id: 'homework', label: 'Homework' },
    { id: 'project', label: 'Project' },
    { id: 'essay', label: 'Essay' },
    { id: 'presentation', label: 'Presentation' },
    { id: 'quiz', label: 'Quiz' }
  ];

  const statusOptions = [
    { id: 'all', label: 'All Status' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
    { id: 'overdue', label: 'Overdue' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignments"
        subtitle="Manage academic assignments, submissions, and grading"
        actions={
          <Button onClick={handleCreateAssignment}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Assignment
          </Button>
        }
      />

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select 
              value={selectedType} 
              onValueChange={setSelectedType}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {assignmentTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={selectedStatus} 
              onValueChange={setSelectedStatus}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status.id} value={status.id}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setSelectedType('all');
              setSelectedStatus('all');
            }}>
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DocumentTextIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total_assignments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Assignments</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.active_assignments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Grading</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pending_submissions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.average_score}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader title="Quick Actions" />
          <CardContent>
            <div className="space-y-3">
              {quickActions.map((action) => (
                <button
                  key={action.name}
                  onClick={action.action}
                  className="w-full flex items-center p-3 text-left rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <action.icon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{action.name}</p>
                    <p className="text-xs text-gray-500">{action.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Assignment Types Distribution */}
        <Card className="lg:col-span-1">
          <CardHeader title="Assignment Types" />
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.assignments_by_type).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${getAssignmentTypeColor(type)}`}>
                      {getAssignmentTypeIcon(type)}
                    </div>
                    <span className="ml-2 text-sm font-medium capitalize">{type}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submission Status */}
        <Card className="lg:col-span-1">
          <CardHeader title="Submission Status" />
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.submissions_by_status).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${
                      status === 'graded' ? 'bg-green-500' :
                      status === 'submitted' ? 'bg-blue-500' :
                      status === 'late' ? 'bg-red-500' : 'bg-gray-500'
                    }`}></div>
                    <span className="ml-2 text-sm font-medium capitalize">{status}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Assignments */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Assignments</h3>
          <Button variant="outline" onClick={handleViewAllAssignments}>
            View All
          </Button>
        </div>
        <div className="space-y-3">
          {stats.recent_assignments.map((assignment) => (
            <div key={assignment.id} className="flex items-center p-3 rounded-lg border">
              <div className={`p-2 rounded-lg ${getAssignmentTypeColor(assignment.assignment_type)}`}>
                {getAssignmentTypeIcon(assignment.assignment_type)}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">{assignment.title}</p>
                <p className="text-xs text-gray-500">
                  {assignment.subject_name} • {assignment.class_name} • {assignment.total_marks} marks
                </p>
              </div>
              <div className="text-right mr-3">
                <p className="text-xs text-gray-500">
                  Due: {new Date(assignment.due_date).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-500">
                  {assignment.submission_count} submitted, {assignment.graded_count} graded
                </p>
                <Badge className={getStatusColor(assignment.status)}>
                  {assignment.status}
                </Badge>
              </div>
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleAssignmentAction('view', assignment.id)}
                >
                  <EyeIcon className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleAssignmentAction('edit', assignment.id)}
                >
                  <PencilIcon className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleAssignmentAction('grade', assignment.id)}
                >
                  <CheckCircleIcon className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleAssignmentAction('duplicate', assignment.id)}
                >
                  <DocumentDuplicateIcon className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleAssignmentAction('delete', assignment.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Upcoming Deadlines */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h3>
          <Button variant="outline" onClick={handleViewCalendar}>
            View Calendar
          </Button>
        </div>
        <div className="space-y-3">
          {stats.upcoming_deadlines.map((assignment) => (
            <div key={assignment.id} className="flex items-center p-3 rounded-lg border">
              <div className={`p-2 rounded-lg ${getAssignmentTypeColor(assignment.assignment_type)}`}>
                {getAssignmentTypeIcon(assignment.assignment_type)}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">{assignment.title}</p>
                <p className="text-xs text-gray-500">
                  {assignment.subject_name} • {assignment.class_name} • {assignment.total_marks} marks
                </p>
              </div>
              <div className="text-right mr-3">
                <p className="text-xs text-gray-500">
                  Due: {new Date(assignment.due_date).toLocaleDateString()}
                </p>
                <Badge className={
                  assignment.days_remaining <= 2 ? 'text-red-600 bg-red-50' :
                  assignment.days_remaining <= 5 ? 'text-orange-600 bg-orange-50' :
                  'text-green-600 bg-green-50'
                }>
                  {assignment.days_remaining} days left
                </Badge>
              </div>
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleAssignmentAction('view', assignment.id)}
                >
                  <EyeIcon className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleAssignmentAction('edit', assignment.id)}
                >
                  <PencilIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader title="Create New Assignment" />
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Assignment creation form would go here with fields for title, description, due date, etc.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1">
                  Create Assignment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Grade Submissions Modal */}
      {showGradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader title="Grade Submissions" />
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Grading interface would go here with submission list, grading forms, and feedback options.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowGradeModal(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1">
                  Save Grades
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Assignments;
