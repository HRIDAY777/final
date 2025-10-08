import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { useAcademicStore } from '../../stores/academicStore';
import {
  AcademicCapIcon,
  UserGroupIcon,
  BookOpenIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ClockIcon,
  PlusIcon,
  ArrowRightIcon,
  ClipboardDocumentListIcon,
  StarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const AcademicsPage: React.FC = () => {
  const {
    classes, classesLoading,
    students, studentsLoading,
    teachers, teachersLoading,
    courses, coursesLoading,
    assignments, assignmentsLoading,
    submissions, submissionsLoading,
    grades, gradesLoading,
    fetchClasses, fetchStudents, fetchTeachers, fetchCourses, fetchAssignments, fetchSubmissions, fetchGrades
  } = useAcademicStore();

  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalAssignments: 0,
    pendingAssignments: 0,
    averageGrade: 0,
    attendanceRate: 0
  });

  const calculateAverageGrade = useCallback(() => {
    if (!grades?.results) return 0;
    const totalPercentage = grades.results.reduce((sum, grade) => sum + grade.percentage, 0);
    return grades.results.length > 0 ? totalPercentage / grades.results.length : 0;
  }, [grades]);

  useEffect(() => {
    // Fetch all academic data
    fetchClasses();
    fetchStudents();
    fetchTeachers();
    fetchCourses();
    fetchAssignments();
    fetchSubmissions();
    fetchGrades();
  }, [fetchClasses, fetchStudents, fetchTeachers, fetchCourses, fetchAssignments, fetchSubmissions, fetchGrades]);

  useEffect(() => {
    // Calculate statistics
    if (classes && students && teachers && courses && assignments && submissions && grades) {
      // Calculate pending assignments based on submissions
      const pendingAssignments = assignments.results?.filter(assignment => {
        // Check if there are any submissions for this assignment
        const assignmentSubmissions = submissions.results?.filter(
          submission => submission.assignment.id === assignment.id
        ) || [];
        // Consider pending if no submissions exist or if some students haven't submitted
        return assignmentSubmissions.length === 0;
      }).length || 0;

      setStats({
        totalClasses: classes.count || 0,
        totalStudents: students.count || 0,
        totalTeachers: teachers.count || 0,
        totalCourses: courses.count || 0,
        totalAssignments: assignments.count || 0,
        pendingAssignments,
        averageGrade: calculateAverageGrade(),
        attendanceRate: 95.2 // Mock data - would come from attendance system
      });
    }
  }, [classes, students, teachers, courses, assignments, submissions, grades, calculateAverageGrade]);

  const recentActivities = [
    {
      id: 1,
      type: 'assignment',
      title: 'New Assignment Posted',
      description: 'Mathematics Assignment #5 posted for Class 10A',
      time: '2 hours ago',
      icon: DocumentTextIcon,
      color: 'text-blue-600'
    },
    {
      id: 2,
      type: 'grade',
      title: 'Grades Updated',
      description: 'Science test grades updated for Class 9B',
      time: '4 hours ago',
      icon: ChartBarIcon,
      color: 'text-green-600'
    },
    {
      id: 3,
      type: 'student',
      title: 'New Student Enrolled',
      description: 'Sarah Johnson enrolled in Class 8A',
      time: '1 day ago',
      icon: UserGroupIcon,
      color: 'text-purple-600'
    },
    {
      id: 4,
      type: 'course',
      title: 'Course Schedule Updated',
      description: 'Physics course schedule modified for Class 11',
      time: '2 days ago',
      icon: CalendarIcon,
      color: 'text-orange-600'
    }
  ];

  const quickActions = [
    {
      title: 'Add New Student',
      description: 'Enroll a new student',
      icon: UserGroupIcon,
      path: '/academics/students',
      color: 'bg-blue-500'
    },
    {
      title: 'Create Assignment',
      description: 'Post a new assignment',
      icon: DocumentTextIcon,
      path: '/academics/assignments',
      color: 'bg-green-500'
    },
    {
      title: 'Add Teacher',
      description: 'Register a new teacher',
      icon: AcademicCapIcon,
      path: '/academics/teachers',
      color: 'bg-purple-500'
    },
    {
      title: 'Create Class',
      description: 'Set up a new class',
      icon: BookOpenIcon,
      path: '/academics/classes',
      color: 'bg-orange-500'
    }
  ];

  const academicModules = [
    {
      title: 'Classes',
      description: 'Manage school classes and sections',
      icon: BookOpenIcon,
      path: '/academics/classes',
      metric: `${stats.totalClasses} Classes`,
      color: 'bg-blue-500'
    },
    {
      title: 'Students',
      description: 'Student profiles and management',
      icon: UserGroupIcon,
      path: '/academics/students',
      metric: `${stats.totalStudents} Students`,
      color: 'bg-green-500'
    },
    {
      title: 'Teachers',
      description: 'Teacher profiles and assignments',
      icon: AcademicCapIcon,
      path: '/academics/teachers',
      metric: `${stats.totalTeachers} Teachers`,
      color: 'bg-purple-500'
    },
    {
      title: 'Subjects',
      description: 'Academic subjects and curriculum',
      icon: ClipboardDocumentListIcon,
      path: '/academics/subjects',
      metric: 'Manage Subjects',
      color: 'bg-orange-500'
    },
    {
      title: 'Courses',
      description: 'Course management and scheduling',
      icon: StarIcon,
      path: '/academics/courses',
      metric: `${stats.totalCourses} Courses`,
      color: 'bg-red-500'
    },
    {
      title: 'Lessons',
      description: 'Lesson planning and content',
      icon: ClockIcon,
      path: '/academics/lessons',
      metric: 'Plan Lessons',
      color: 'bg-indigo-500'
    },
    {
      title: 'Assignments',
      description: 'Homework and project management',
      icon: DocumentTextIcon,
      path: '/academics/assignments',
      metric: `${stats.totalAssignments} Assignments`,
      color: 'bg-pink-500'
    },
    {
      title: 'Grades',
      description: 'Grade management and reporting',
      icon: ChartBarIcon,
      path: '/academics/grades',
      metric: 'Manage Grades',
      color: 'bg-yellow-500'
    }
  ];

  const loading = classesLoading || studentsLoading || teachersLoading || coursesLoading || assignmentsLoading || submissionsLoading || gradesLoading;

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Academics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all academic activities, students, teachers, and courses
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <PlusIcon className="h-4 w-4 mr-2" />
            Quick Add
          </Button>
          <Button>
            <ChartBarIcon className="h-4 w-4 mr-2" />
            View Reports
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpenIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Classes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalClasses}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserGroupIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalStudents}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <AcademicCapIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Teachers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalTeachers}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ChartBarIcon className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Grade</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.averageGrade.toFixed(1)}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Academic Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {academicModules.map((module) => {
          const Icon = module.icon;
          return (
            <Card key={module.title} className="hover:shadow-lg transition-shadow">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${module.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {module.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {module.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {module.metric}
                  </span>
                  <Link
                    to={module.path}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Open
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader title="Quick Actions" />
            <div className="space-y-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.title}
                    to={action.path}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {action.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {action.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Recent Activities" />
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700`}>
                      <Icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {activity.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Assignment Status" />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Assignments</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{stats.totalAssignments}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Pending Submissions</span>
              <span className="font-medium text-red-600">{stats.pendingAssignments}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</span>
              <span className="font-medium text-green-600">
                {stats.totalAssignments > 0 
                  ? ((stats.totalAssignments - stats.pendingAssignments) / stats.totalAssignments * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Academic Performance" />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Average Grade</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{stats.averageGrade.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Attendance Rate</span>
              <span className="font-medium text-green-600">{stats.attendanceRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Courses</span>
              <span className="font-medium text-blue-600">{stats.totalCourses}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AcademicsPage;
