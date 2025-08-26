import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import {
  DocumentTextIcon,
  PlusIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon,
  CalendarIcon,
  UserGroupIcon,
  TrophyIcon,
  CogIcon,
  DocumentMagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface ExamStats {
  totalExams: number;
  activeExams: number;
  upcomingExams: number;
  completedExams: number;
  totalQuestions: number;
  totalResults: number;
  averageScore: number;
  byType: Record<string, number>;
  bySubject: Record<string, number>;
  recentResults: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

const ExamsPage: React.FC = () => {
  const [stats, setStats] = useState<ExamStats>({
    totalExams: 0,
    activeExams: 0,
    upcomingExams: 0,
    completedExams: 0,
    totalQuestions: 0,
    totalResults: 0,
    averageScore: 0,
    byType: {},
    bySubject: {},
    recentResults: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demonstration
    const mockStats: ExamStats = {
      totalExams: 45,
      activeExams: 12,
      upcomingExams: 8,
      completedExams: 25,
      totalQuestions: 1247,
      totalResults: 892,
      averageScore: 78.5,
      byType: {
        'Midterm': 15,
        'Final': 12,
        'Quiz': 8,
        'Assignment': 6,
        'Project': 4
      },
      bySubject: {
        'Mathematics': 12,
        'Science': 10,
        'English': 8,
        'History': 7,
        'Computer Science': 8
      },
      recentResults: 23
    };

    const mockRecentActivity: RecentActivity[] = [
      {
        id: '1',
        type: 'Exam Created',
        description: 'Mathematics Midterm Exam created by Dr. Smith',
        timestamp: '2 hours ago',
        status: 'success'
      },
      {
        id: '2',
        type: 'Results Published',
        description: 'Science Quiz results published for Class 10A',
        timestamp: '4 hours ago',
        status: 'success'
      },
      {
        id: '3',
        type: 'Exam Scheduled',
        description: 'English Final Exam scheduled for December 15th',
        timestamp: '6 hours ago',
        status: 'info'
      },
      {
        id: '4',
        type: 'Low Performance Alert',
        description: 'Class 9B average score below 60% in History',
        timestamp: '1 day ago',
        status: 'warning'
      },
      {
        id: '5',
        type: 'Question Bank Updated',
        description: '50 new questions added to Mathematics bank',
        timestamp: '2 days ago',
        status: 'success'
      }
    ];

    setTimeout(() => {
      setStats(mockStats);
      setRecentActivity(mockRecentActivity);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />;
      case 'info':
        return <ClockIcon className="w-4 h-4 text-blue-600" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exams & Results Management</h1>
          <p className="text-gray-600">Comprehensive examination and grading system</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/exams/exams/create">
            <Button size="sm">
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Exam
            </Button>
          </Link>
          <Link to="/exams/schedules/create">
            <Button size="sm">
              <PlusIcon className="w-4 h-4 mr-2" />
              Schedule Exam
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DocumentTextIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Exams</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalExams.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Exams</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeExams.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingExams.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrophyIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader title="Quick Actions" />
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/exams/exams">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900">Manage Exams</h3>
                    <p className="text-sm text-gray-600">Create and edit exams</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/exams/schedules">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <CalendarIcon className="w-6 h-6 text-green-600" />
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900">Exam Schedules</h3>
                    <p className="text-sm text-gray-600">Schedule and manage</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/exams/questions">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <DocumentMagnifyingGlassIcon className="w-6 h-6 text-purple-600" />
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900">Question Bank</h3>
                    <p className="text-sm text-gray-600">Manage questions</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/exams/results">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <ChartBarIcon className="w-6 h-6 text-orange-600" />
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900">Results & Grades</h3>
                    <p className="text-sm text-gray-600">View and publish</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </Card>

      {/* Alerts and Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Alerts & Notifications" />
          <div className="p-6">
            <div className="space-y-4">
              {stats.upcomingExams > 0 && (
                <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <ClockIcon className="w-5 h-5 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-800">
                      {stats.upcomingExams} upcoming exams scheduled
                    </p>
                    <Link to="/exams/schedules" className="text-xs text-blue-600 hover:underline">
                      View schedules →
                    </Link>
                  </div>
                </div>
              )}

              {stats.recentResults > 0 && (
                <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      {stats.recentResults} new results ready for review
                    </p>
                    <Link to="/exams/results" className="text-xs text-green-600 hover:underline">
                      Review results →
                    </Link>
                  </div>
                </div>
              )}

              {stats.averageScore < 70 && (
                <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-yellow-800">
                      Average score below 70% - review needed
                    </p>
                    <Link to="/exams/analytics" className="text-xs text-yellow-600 hover:underline">
                      View analytics →
                    </Link>
                  </div>
                </div>
              )}

              {stats.upcomingExams === 0 && stats.recentResults === 0 && stats.averageScore >= 70 && (
                <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      All systems operational
                    </p>
                    <p className="text-xs text-green-600">No alerts at this time</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Recent Activity" />
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  {getStatusIcon(activity.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.type}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link to="/exams/activity">
                <Button variant="outline" size="sm">View All Activity</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Exam Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Exams by Type" />
          <div className="p-6">
            <div className="space-y-3">
              {Object.entries(stats.byType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{type}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(count / stats.totalExams) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Exams by Subject" />
          <div className="p-6">
            <div className="space-y-3">
              {Object.entries(stats.bySubject).map(([subject, count]) => (
                <div key={subject} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{subject}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(count / stats.totalExams) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ExamsPage;
