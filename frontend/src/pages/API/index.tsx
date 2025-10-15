import React, { useState } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { Button } from '../../components/UI/Button';
import { Badge } from '../../components/UI/Badge';

import { 
  CodeBracketIcon, 
  DocumentTextIcon, 
  ServerIcon, 
  GlobeAltIcon,
  LockClosedIcon,
  UserIcon,
  AcademicCapIcon,
  ClockIcon,
  DocumentCheckIcon,
  ChartBarIcon,
  BellIcon,
  CogIcon,
  ClipboardDocumentIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  category: string;
  requiresAuth: boolean;
  example?: {
    request?: any;
    response?: any;
  } | undefined;
}

const APIDocumentation: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const apiEndpoints: APIEndpoint[] = [
    // Authentication
    {
      method: 'POST',
      path: '/auth/login/',
      description: 'Authenticate user and get access tokens',
      category: 'Authentication',
      requiresAuth: false,
      example: {
        request: { email: 'user@example.com', password: 'password123' },
        response: { access: 'token', refresh: 'refresh_token' }
      }
    },
    {
      method: 'POST',
      path: '/auth/register/',
      description: 'Register a new user account',
      category: 'Authentication',
      requiresAuth: false
    },
    {
      method: 'POST',
      path: '/auth/refresh/',
      description: 'Refresh access token using refresh token',
      category: 'Authentication',
      requiresAuth: false
    },
    {
      method: 'GET',
      path: '/auth/profile/',
      description: 'Get current user profile',
      category: 'Authentication',
      requiresAuth: true
    },
    {
      method: 'PATCH',
      path: '/auth/profile/',
      description: 'Update current user profile',
      category: 'Authentication',
      requiresAuth: true
    },

    // Academic Management
    {
      method: 'GET',
      path: '/academics/classes/',
      description: 'Get list of classes with pagination',
      category: 'Academic Management',
      requiresAuth: true
    },
    {
      method: 'POST',
      path: '/academics/classes/',
      description: 'Create a new class',
      category: 'Academic Management',
      requiresAuth: true
    },
    {
      method: 'GET',
      path: '/academics/classes/{id}/',
      description: 'Get specific class details',
      category: 'Academic Management',
      requiresAuth: true
    },
    {
      method: 'PUT',
      path: '/academics/classes/{id}/',
      description: 'Update class information',
      category: 'Academic Management',
      requiresAuth: true
    },
    {
      method: 'DELETE',
      path: '/academics/classes/{id}/',
      description: 'Delete a class',
      category: 'Academic Management',
      requiresAuth: true
    },
    {
      method: 'GET',
      path: '/academics/classes/{id}/students/',
      description: 'Get students enrolled in a class',
      category: 'Academic Management',
      requiresAuth: true
    },
    {
      method: 'GET',
      path: '/academics/classes/{id}/performance_summary/',
      description: 'Get class performance summary',
      category: 'Academic Management',
      requiresAuth: true
    },

    // Students
    {
      method: 'GET',
      path: '/academics/students/',
      description: 'Get list of students with pagination',
      category: 'Student Management',
      requiresAuth: true
    },
    {
      method: 'POST',
      path: '/academics/students/',
      description: 'Create a new student',
      category: 'Student Management',
      requiresAuth: true
    },
    {
      method: 'GET',
      path: '/academics/students/{id}/',
      description: 'Get specific student details',
      category: 'Student Management',
      requiresAuth: true
    },
    {
      method: 'PUT',
      path: '/academics/students/{id}/',
      description: 'Update student information',
      category: 'Student Management',
      requiresAuth: true
    },
    {
      method: 'DELETE',
      path: '/academics/students/{id}/',
      description: 'Delete a student',
      category: 'Student Management',
      requiresAuth: true
    },
    {
      method: 'GET',
      path: '/academics/students/{id}/grades/',
      description: 'Get student grades',
      category: 'Student Management',
      requiresAuth: true
    },
    {
      method: 'GET',
      path: '/academics/students/{id}/performance_summary/',
      description: 'Get student performance summary',
      category: 'Student Management',
      requiresAuth: true
    },

    // Teachers
    {
      method: 'GET',
      path: '/academics/teachers/',
      description: 'Get list of teachers with pagination',
      category: 'Teacher Management',
      requiresAuth: true
    },
    {
      method: 'POST',
      path: '/academics/teachers/',
      description: 'Create a new teacher',
      category: 'Teacher Management',
      requiresAuth: true
    },
    {
      method: 'GET',
      path: '/academics/teachers/{id}/',
      description: 'Get specific teacher details',
      category: 'Teacher Management',
      requiresAuth: true
    },
    {
      method: 'PUT',
      path: '/academics/teachers/{id}/',
      description: 'Update teacher information',
      category: 'Teacher Management',
      requiresAuth: true
    },
    {
      method: 'DELETE',
      path: '/academics/teachers/{id}/',
      description: 'Delete a teacher',
      category: 'Teacher Management',
      requiresAuth: true
    },
    {
      method: 'GET',
      path: '/academics/teachers/{id}/courses/',
      description: 'Get teacher courses',
      category: 'Teacher Management',
      requiresAuth: true
    },
    {
      method: 'GET',
      path: '/academics/teachers/{id}/performance_summary/',
      description: 'Get teacher performance summary',
      category: 'Teacher Management',
      requiresAuth: true
    },

    // Subjects
    {
      method: 'GET',
      path: '/academics/subjects/',
      description: 'Get list of subjects with pagination',
      category: 'Subject Management',
      requiresAuth: true
    },
    {
      method: 'POST',
      path: '/academics/subjects/',
      description: 'Create a new subject',
      category: 'Subject Management',
      requiresAuth: true
    },
    {
      method: 'GET',
      path: '/academics/subjects/{id}/',
      description: 'Get specific subject details',
      category: 'Subject Management',
      requiresAuth: true
    },
    {
      method: 'PUT',
      path: '/academics/subjects/{id}/',
      description: 'Update subject information',
      category: 'Subject Management',
      requiresAuth: true
    },
    {
      method: 'DELETE',
      path: '/academics/subjects/{id}/',
      description: 'Delete a subject',
      category: 'Subject Management',
      requiresAuth: true
    },

    // Courses
    {
      method: 'GET',
      path: '/academics/courses/',
      description: 'Get list of courses with pagination',
      category: 'Course Management',
      requiresAuth: true
    },
    {
      method: 'POST',
      path: '/academics/courses/',
      description: 'Create a new course',
      category: 'Course Management',
      requiresAuth: true
    },
    {
      method: 'GET',
      path: '/academics/courses/{id}/',
      description: 'Get specific course details',
      category: 'Course Management',
      requiresAuth: true
    },
    {
      method: 'PUT',
      path: '/academics/courses/{id}/',
      description: 'Update course information',
      category: 'Course Management',
      requiresAuth: true
    },
    {
      method: 'DELETE',
      path: '/academics/courses/{id}/',
      description: 'Delete a course',
      category: 'Course Management',
      requiresAuth: true
    },
    {
      method: 'GET',
      path: '/academics/courses/{id}/lessons/',
      description: 'Get course lessons',
      category: 'Course Management',
      requiresAuth: true
    },
    {
      method: 'GET',
      path: '/academics/courses/{id}/assignments/',
      description: 'Get course assignments',
      category: 'Course Management',
      requiresAuth: true
    },

    // Attendance
    {
      method: 'GET',
      path: '/attendance/sessions/',
      description: 'Get list of attendance sessions',
      category: 'Attendance Management',
      requiresAuth: true
    },
    {
      method: 'POST',
      path: '/attendance/sessions/',
      description: 'Create a new attendance session',
      category: 'Attendance Management',
      requiresAuth: true
    },
    {
      method: 'POST',
      path: '/attendance/sessions/{id}/bulk_mark_attendance/',
      description: 'Bulk mark attendance for a session',
      category: 'Attendance Management',
      requiresAuth: true
    },
    {
      method: 'GET',
      path: '/attendance/records/',
      description: 'Get attendance records',
      category: 'Attendance Management',
      requiresAuth: true
    },
    {
      method: 'GET',
      path: '/attendance/leave-requests/',
      description: 'Get leave requests',
      category: 'Attendance Management',
      requiresAuth: true
    },
    {
      method: 'POST',
      path: '/attendance/leave-requests/{id}/approve/',
      description: 'Approve a leave request',
      category: 'Attendance Management',
      requiresAuth: true
    },
    {
      method: 'POST',
      path: '/attendance/leave-requests/{id}/reject/',
      description: 'Reject a leave request',
      category: 'Attendance Management',
      requiresAuth: true
    },
    {
      method: 'GET',
      path: '/attendance/analytics/student/{id}/attendance_summary/',
      description: 'Get student attendance summary',
      category: 'Attendance Management',
      requiresAuth: true
    },
    {
      method: 'GET',
      path: '/attendance/analytics/class/{id}/attendance_summary/',
      description: 'Get class attendance summary',
      category: 'Attendance Management',
      requiresAuth: true
    },

    // Exams
    {
      method: 'GET',
      path: '/exams/exams/',
      description: 'Get list of exams',
      category: 'Exam Management',
      requiresAuth: true
    },
    {
      method: 'POST',
      path: '/exams/exams/',
      description: 'Create a new exam',
      category: 'Exam Management',
      requiresAuth: true
    },
    {
      method: 'POST',
      path: '/exams/exams/{id}/bulk_add_questions/',
      description: 'Bulk add questions to an exam',
      category: 'Exam Management',
      requiresAuth: true
    },
    {
      method: 'GET',
      path: '/exams/schedules/',
      description: 'Get exam schedules',
      category: 'Exam Management',
      requiresAuth: true
    },
    {
      method: 'GET',
      path: '/exams/questions/',
      description: 'Get exam questions',
      category: 'Exam Management',
      requiresAuth: true
    },
    {
      method: 'GET',
      path: '/exams/results/',
      description: 'Get exam results',
      category: 'Exam Management',
      requiresAuth: true
    },
    {
      method: 'POST',
      path: '/exams/results/{id}/submit_exam/',
      description: 'Submit exam answers',
      category: 'Exam Management',
      requiresAuth: true
    },
    {
      method: 'POST',
      path: '/exams/results/{id}/grade_exam/',
      description: 'Grade an exam',
      category: 'Exam Management',
      requiresAuth: true
    },
    {
      method: 'GET',
      path: '/exams/analytics/dashboard_summary/',
      description: 'Get exam dashboard summary',
      category: 'Exam Management',
      requiresAuth: true
    },
    {
      method: 'GET',
      path: '/exams/analytics/student/{id}/performance/',
      description: 'Get student exam performance',
      category: 'Exam Management',
      requiresAuth: true
    },

    // Dashboard
    {
      method: 'GET',
      path: '/dashboard/stats/',
      description: 'Get dashboard statistics',
      category: 'Dashboard',
      requiresAuth: true
    },
    {
      method: 'GET',
      path: '/dashboard/attendance-chart/',
      description: 'Get attendance chart data',
      category: 'Dashboard',
      requiresAuth: true
    },
    {
      method: 'GET',
      path: '/dashboard/performance-chart/',
      description: 'Get performance chart data',
      category: 'Dashboard',
      requiresAuth: true
    },
    {
      method: 'GET',
      path: '/dashboard/recent-activities/',
      description: 'Get recent activities',
      category: 'Dashboard',
      requiresAuth: true
    },
    {
      method: 'GET',
      path: '/dashboard/upcoming-events/',
      description: 'Get upcoming events',
      category: 'Dashboard',
      requiresAuth: true
    },

    // Notifications
    {
      method: 'GET',
      path: '/notifications/',
      description: 'Get user notifications',
      category: 'Notifications',
      requiresAuth: true
    },
    {
      method: 'PATCH',
      path: '/notifications/{id}/mark-read/',
      description: 'Mark notification as read',
      category: 'Notifications',
      requiresAuth: true
    },
    {
      method: 'POST',
      path: '/notifications/mark-all-read/',
      description: 'Mark all notifications as read',
      category: 'Notifications',
      requiresAuth: true
    },
    {
      method: 'DELETE',
      path: '/notifications/{id}/',
      description: 'Delete a notification',
      category: 'Notifications',
      requiresAuth: true
    }
  ];

  const categories = [
    { id: 'Authentication', icon: LockClosedIcon, color: 'bg-red-500' },
    { id: 'Academic Management', icon: AcademicCapIcon, color: 'bg-blue-500' },
    { id: 'Student Management', icon: UserIcon, color: 'bg-green-500' },
    { id: 'Teacher Management', icon: AcademicCapIcon, color: 'bg-purple-500' },
    { id: 'Subject Management', icon: DocumentTextIcon, color: 'bg-indigo-500' },
    { id: 'Course Management', icon: DocumentTextIcon, color: 'bg-pink-500' },
    { id: 'Attendance Management', icon: ClockIcon, color: 'bg-yellow-500' },
    { id: 'Exam Management', icon: DocumentCheckIcon, color: 'bg-orange-500' },
    { id: 'Dashboard', icon: ChartBarIcon, color: 'bg-teal-500' },
    { id: 'Notifications', icon: BellIcon, color: 'bg-gray-500' }
  ];

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800';
      case 'POST': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'PATCH': return 'bg-orange-100 text-orange-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.icon : CogIcon;
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.color : 'bg-gray-500';
  };

  const filteredEndpoints = selectedEndpoint 
    ? apiEndpoints.filter(ep => ep.category === selectedEndpoint.category)
    : apiEndpoints;

  return (
    <div className="space-y-6">
      <Card>
        <PageHeader 
          title="API Documentation" 
          subtitle="Complete API reference for EduCore Ultra"
          actions={
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => window.open('/api/docs', '_blank')}>
                <DocumentTextIcon className="w-4 h-4 mr-2" />
                OpenAPI Spec
              </Button>
              <Button variant="outline" onClick={() => window.open('/api/redoc', '_blank')}>
                <CodeBracketIcon className="w-4 h-4 mr-2" />
                ReDoc
              </Button>
            </div>
          }
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Categories */}
        <div className="lg:col-span-1">
          <Card>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const count = apiEndpoints.filter(ep => ep.category === category.id).length;
                  return (
                    <button
                      key={category.id}
                      onClick={() => {
                        const firstEndpoint = apiEndpoints.find(ep => ep.category === category.id) || apiEndpoints[0] || null;
                        setSelectedEndpoint(firstEndpoint);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-200 hover:bg-gray-50 ${
                        selectedEndpoint?.category === category.id ? 'bg-blue-50 border border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${category.color}`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium text-gray-900">{category.id}</span>
                      </div>
                      <Badge variant="secondary">{count}</Badge>
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content - API Endpoints */}
        <div className="lg:col-span-3">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedEndpoint ? selectedEndpoint.category : 'All Endpoints'}
                  </h2>
                  <p className="text-gray-600">
                    {filteredEndpoints.length} endpoints available
                  </p>
                </div>
                {selectedEndpoint && (
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedEndpoint(null)}
                  >
                    Show All
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {filteredEndpoints.map((endpoint, index) => {
                  const Icon = getCategoryIcon(endpoint.category);
                  const categoryColor = getCategoryColor(endpoint.category);
                  const fullUrl = `http://localhost:8000/api${endpoint.path}`;
                  
                  return (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className={getMethodColor(endpoint.method)}>
                              {endpoint.method}
                            </Badge>
                            <div className={`w-6 h-6 rounded flex items-center justify-center ${categoryColor}`}>
                              <Icon className="w-3 h-3 text-white" />
                            </div>
                            <code className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                              {endpoint.path}
                            </code>
                            {endpoint.requiresAuth && (
                              <Badge variant="outline" className="text-xs">
                                Auth Required
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{endpoint.description}</p>
                          
                          {endpoint.example && (
                            <div className="space-y-2">
                              {endpoint.example.request && (
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium text-gray-700">Request Example:</span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => copyToClipboard(JSON.stringify(endpoint.example?.request, null, 2), `req-${index}`)}
                                    >
                                      {copiedEndpoint === `req-${index}` ? (
                                        <ClipboardDocumentIcon className="w-3 h-3" />
                                      ) : (
                                        <ClipboardDocumentIcon className="w-3 h-3" />
                                      )}
                                    </Button>
                                  </div>
                                  <pre className="text-xs bg-gray-50 p-2 rounded border overflow-x-auto">
                                    {JSON.stringify(endpoint.example.request, null, 2)}
                                  </pre>
                                </div>
                              )}
                              
                              {endpoint.example.response && (
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium text-gray-700">Response Example:</span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => copyToClipboard(JSON.stringify(endpoint.example?.response, null, 2), `res-${index}`)}
                                    >
                                      {copiedEndpoint === `res-${index}` ? (
                                        <ClipboardDocumentIcon className="w-3 h-3" />
                                      ) : (
                                        <ClipboardDocumentIcon className="w-3 h-3" />
                                      )}
                                    </Button>
                                  </div>
                                  <pre className="text-xs bg-gray-50 p-2 rounded border overflow-x-auto">
                                    {JSON.stringify(endpoint.example.response, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(fullUrl, `url-${index}`)}
                          >
                            {copiedEndpoint === `url-${index}` ? 'Copied!' : 'Copy URL'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`http://localhost:8000/api${endpoint.path}`, '_blank')}
                          >
                            <PlayIcon className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* API Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <ServerIcon className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Base URL</h3>
            </div>
            <code className="text-sm font-mono text-gray-900 bg-gray-100 px-3 py-2 rounded block">
              http://localhost:8000/api
            </code>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <LockClosedIcon className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Authentication</h3>
            </div>
            <p className="text-gray-600 text-sm mb-2">Bearer Token Authentication</p>
            <code className="text-xs font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded block">
              Authorization: Bearer &lt;token&gt;
            </code>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <GlobeAltIcon className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Content Type</h3>
            </div>
            <p className="text-gray-600 text-sm mb-2">All requests and responses use JSON</p>
            <code className="text-xs font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded block">
              Content-Type: application/json
            </code>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default APIDocumentation;
