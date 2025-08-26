import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import {
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlusIcon,
  ArrowRightIcon,
  EyeIcon,
  CogIcon,
  BellIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  UsersIcon,
  ArrowTrendingUpIcon,

  DevicePhoneMobileIcon,
  FingerPrintIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  WifiIcon,
  Cog6ToothIcon,
  UserPlusIcon,
  ChartPieIcon,
  LightBulbIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

interface AttendanceStats {
  totalSessions: number;
  todaySessions: number;
  thisWeekSessions: number;
  totalStudents: number;
  averageAttendance: number;
  pendingLeaveRequests: number;
  overdueSessions: number;
  biometricAttendance: number;
  mobileMarked: number;
  aiInsights: number;
}

interface RecentSession {
  id: string;
  course: string;
  date: string;
  time: string;
  attendanceRate: number;
  totalStudents: number;
  presentCount: number;
  biometricCount: number;
  mobileCount: number;
}

interface ClassAttendance {
  className: string;
  totalSessions: number;
  averageRate: number;
  totalStudents: number;
  riskLevel: 'low' | 'medium' | 'high';
  trend: 'improving' | 'declining' | 'stable';
}

interface AIInsight {
  id: string;
  type: 'risk' | 'trend' | 'prediction';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  affectedStudents: number;
  recommendation: string;
}

const AttendancePage: React.FC = () => {
  const [stats, setStats] = useState<AttendanceStats>({
    totalSessions: 0,
    todaySessions: 0,
    thisWeekSessions: 0,
    totalStudents: 0,
    averageAttendance: 0,
    pendingLeaveRequests: 0,
    overdueSessions: 0,
    biometricAttendance: 0,
    mobileMarked: 0,
    aiInsights: 0
  });

  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [classAttendance, setClassAttendance] = useState<ClassAttendance[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    const mockStats: AttendanceStats = {
      totalSessions: 156,
      todaySessions: 8,
      thisWeekSessions: 42,
      totalStudents: 1247,
      averageAttendance: 87.5,
      pendingLeaveRequests: 12,
      overdueSessions: 3,
      biometricAttendance: 892,
      mobileMarked: 234,
      aiInsights: 5
    };

    const mockRecentSessions: RecentSession[] = [
      {
        id: '1',
        course: 'Mathematics - Class 10A',
        date: '2024-01-15',
        time: '09:00 - 10:00',
        attendanceRate: 92.5,
        totalStudents: 32,
        presentCount: 30,
        biometricCount: 25,
        mobileCount: 5
      },
      {
        id: '2',
        course: 'Science - Class 9B',
        date: '2024-01-15',
        time: '10:15 - 11:15',
        attendanceRate: 88.2,
        totalStudents: 28,
        presentCount: 25,
        biometricCount: 20,
        mobileCount: 5
      },
      {
        id: '3',
        course: 'English - Class 11A',
        date: '2024-01-15',
        time: '11:30 - 12:30',
        attendanceRate: 95.0,
        totalStudents: 30,
        presentCount: 29,
        biometricCount: 28,
        mobileCount: 1
      },
      {
        id: '4',
        course: 'History - Class 8C',
        date: '2024-01-15',
        time: '13:00 - 14:00',
        attendanceRate: 85.7,
        totalStudents: 35,
        presentCount: 30,
        biometricCount: 22,
        mobileCount: 8
      },
      {
        id: '5',
        course: 'Physics - Class 12A',
        date: '2024-01-15',
        time: '14:15 - 15:15',
        attendanceRate: 90.0,
        totalStudents: 25,
        presentCount: 23,
        biometricCount: 21,
        mobileCount: 2
      }
    ];

    const mockClassAttendance: ClassAttendance[] = [
      {
        className: 'Class 10A',
        totalSessions: 45,
        averageRate: 92.5,
        totalStudents: 32,
        riskLevel: 'low',
        trend: 'improving'
      },
      {
        className: 'Class 9B',
        totalSessions: 42,
        averageRate: 88.2,
        totalStudents: 28,
        riskLevel: 'medium',
        trend: 'stable'
      },
      {
        className: 'Class 11A',
        totalSessions: 38,
        averageRate: 95.0,
        totalStudents: 30,
        riskLevel: 'low',
        trend: 'improving'
      },
      {
        className: 'Class 8C',
        totalSessions: 40,
        averageRate: 85.7,
        totalStudents: 35,
        riskLevel: 'high',
        trend: 'declining'
      },
      {
        className: 'Class 12A',
        totalSessions: 35,
        averageRate: 90.0,
        totalStudents: 25,
        riskLevel: 'medium',
        trend: 'stable'
      }
    ];

    const mockAIInsights: AIInsight[] = [
      {
        id: '1',
        type: 'risk',
        title: 'High Absenteeism Risk - Class 8C',
        description: 'Class 8C shows declining attendance trend with 15% increase in absences',
        severity: 'high',
        affectedStudents: 5,
        recommendation: 'Schedule parent meetings and implement intervention programs'
      },
      {
        id: '2',
        type: 'prediction',
        title: 'Potential Dropout Risk Detected',
        description: '3 students showing consistent absenteeism patterns',
        severity: 'medium',
        affectedStudents: 3,
        recommendation: 'Early intervention and counseling recommended'
      },
      {
        id: '3',
        type: 'trend',
        title: 'Positive Attendance Improvement',
        description: 'Class 10A and 11A showing 8% improvement in attendance',
        severity: 'low',
        affectedStudents: 62,
        recommendation: 'Continue current engagement strategies'
      },
      {
        id: '4',
        type: 'risk',
        title: 'Late Arrival Pattern Detected',
        description: '12 students consistently arriving 15+ minutes late',
        severity: 'medium',
        affectedStudents: 12,
        recommendation: 'Review transportation and schedule adjustments'
      },
      {
        id: '5',
        type: 'prediction',
        title: 'Exam Performance Correlation',
        description: 'Students with >90% attendance show 25% better exam scores',
        severity: 'low',
        affectedStudents: 156,
        recommendation: 'Highlight attendance-performance correlation to students'
      }
    ];

    setTimeout(() => {
      setStats(mockStats);
      setRecentSessions(mockRecentSessions);
      setClassAttendance(mockClassAttendance);
      setAiInsights(mockAIInsights);
      setLoading(false);
    }, 1000);
  }, []);

  const attendanceModules = [
    {
      title: 'Attendance Sessions',
      description: 'Create and manage class attendance sessions',
      icon: CalendarIcon,
      path: '/attendance/sessions',
      metric: `${stats.totalSessions} Sessions`,
      color: 'bg-blue-500',
      action: 'Manage Sessions'
    },
    {
      title: 'Attendance Records',
      description: 'View and manage individual student attendance',
      icon: DocumentTextIcon,
      path: '/attendance/records',
      metric: `${stats.totalStudents} Students`,
      color: 'bg-green-500',
      action: 'View Records'
    },
    {
      title: 'Guardian Portal',
      description: 'Real-time attendance access for parents/guardians',
      icon: UserPlusIcon,
      path: '/attendance/guardian-portal',
      metric: 'Live Updates',
      color: 'bg-purple-500',
      action: 'Access Portal'
    },
    {
      title: 'AI Analytics',
      description: 'Advanced insights and predictive analytics',
      icon: CpuChipIcon,
      path: '/attendance/ai-analytics',
      metric: `${stats.aiInsights} Insights`,
      color: 'bg-indigo-500',
      action: 'View Analytics'
    },
    {
      title: 'Biometric Integration',
      description: 'Fingerprint, face recognition, and RFID systems',
      icon: FingerPrintIcon,
      path: '/attendance/biometric',
      metric: `${stats.biometricAttendance} Marked`,
      color: 'bg-orange-500',
      action: 'Manage Devices'
    },
    {
      title: 'Mobile Apps',
      description: 'Teacher and parent mobile applications',
      icon: DevicePhoneMobileIcon,
      path: '/attendance/mobile-apps',
      metric: `${stats.mobileMarked} Mobile`,
      color: 'bg-teal-500',
      action: 'Download Apps'
    },
    {
      title: 'Notifications',
      description: 'SMS, email, and push notification system',
      icon: BellIcon,
      path: '/attendance/notifications',
      metric: 'Auto Alerts',
      color: 'bg-red-500',
      action: 'Configure'
    },
    {
      title: 'Leave Requests',
      description: 'Manage student leave applications and approvals',
      icon: DocumentTextIcon,
      path: '/attendance/leave-requests',
      metric: `${stats.pendingLeaveRequests} Pending`,
      color: 'bg-yellow-500',
      action: 'Review Requests'
    },
    {
      title: 'Attendance Reports',
      description: 'Generate and view attendance analytics',
      icon: ChartBarIcon,
      path: '/attendance/reports',
      metric: 'Analytics',
      color: 'bg-pink-500',
      action: 'View Reports'
    },
    {
      title: 'Settings & Rules',
      description: 'Configure attendance system preferences and rules',
      icon: Cog6ToothIcon,
      path: '/attendance/settings',
      metric: 'Custom Rules',
      color: 'bg-gray-500',
      action: 'Configure'
    }
  ];

  const quickActions = [
    {
      title: 'Create New Session',
      description: 'Start a new attendance session',
      icon: PlusIcon,
      action: () => console.log('Create session'),
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'Mark Attendance',
      description: 'Quick attendance marking',
      icon: CheckCircleIcon,
      action: () => console.log('Mark attendance'),
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'Send Notifications',
      description: 'Notify parents about absences',
      icon: BellIcon,
      action: () => console.log('Send notifications'),
      color: 'bg-red-600 hover:bg-red-700'
    },
    {
      title: 'Generate AI Report',
      description: 'Create AI-powered insights report',
      icon: CpuChipIcon,
      action: () => console.log('Generate AI report'),
      color: 'bg-indigo-600 hover:bg-indigo-700'
    }
  ];

  const getRiskLevelBadge = (level: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[level as keyof typeof colors]}`}>
        {level.toUpperCase()} RISK
      </span>
    );
  };

  const getTrendIcon = (trend: string) => {
    const icons = {
      improving: <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />,
      declining: <ArrowTrendingUpIcon className="h-4 w-4 text-red-600 transform rotate-180" />,
      stable: <ChartBarIcon className="h-4 w-4 text-gray-600" />
    };
    return icons[trend as keyof typeof icons];
  };

  const getInsightSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-green-50 border-green-200',
      medium: 'bg-yellow-50 border-yellow-200',
      high: 'bg-red-50 border-red-200'
    };
    return colors[severity as keyof typeof colors];
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Advanced Attendance Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI-powered attendance tracking with biometric integration and real-time guardian notifications
          </p>
        </div>
        <Button onClick={() => console.log('Create session')} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Create Session
        </Button>
      </div>

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalSessions}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <UsersIcon className="h-5 w-5 text-green-600" />
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
              <ArrowTrendingUpIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Attendance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.averageAttendance}%</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FingerPrintIcon className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Biometric</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.biometricAttendance}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <CpuChipIcon className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">AI Insights</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.aiInsights}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <ClockIcon className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Today's Sessions</h3>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-blue-600">{stats.todaySessions}</span>
              <span className="text-sm text-gray-500">sessions</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <DevicePhoneMobileIcon className="h-5 w-5 text-teal-600" />
              <h3 className="font-semibold text-gray-900">Mobile Marked</h3>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-teal-600">{stats.mobileMarked}</span>
              <span className="text-sm text-gray-500">attendance</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <BellIcon className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-gray-900">Pending Leaves</h3>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-red-600">{stats.pendingLeaveRequests}</span>
              <span className="text-sm text-gray-500">requests</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <WifiIcon className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Real-time Sync</h3>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-green-600">Live</span>
              <span className="text-sm text-gray-500">connected</span>
            </div>
          </div>
        </Card>
      </div>

      {/* AI Insights Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CpuChipIcon className="h-5 w-5 text-indigo-600" />
          AI-Powered Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {aiInsights.map((insight) => (
            <Card key={insight.id} className={`border-2 ${getInsightSeverityColor(insight.severity)}`}>
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {insight.type === 'risk' && <ExclamationCircleIcon className="h-5 w-5 text-red-600" />}
                    {insight.type === 'prediction' && <LightBulbIcon className="h-5 w-5 text-yellow-600" />}
                    {insight.type === 'trend' && <ChartPieIcon className="h-5 w-5 text-green-600" />}
                    <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    insight.severity === 'high' ? 'bg-red-100 text-red-800' :
                    insight.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {insight.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span>{insight.affectedStudents} students affected</span>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <p className="text-sm font-medium text-gray-900 mb-1">Recommendation:</p>
                  <p className="text-sm text-gray-600">{insight.recommendation}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Enhanced Attendance Modules */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Advanced Attendance Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {attendanceModules.map((module) => (
            <Card key={module.title} className="hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${module.color}`}>
                    <module.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{module.title}</h3>
                    <p className="text-xs text-gray-600">{module.metric}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-3">{module.description}</p>
                <Link to={module.path}>
                  <Button variant="outline" className="w-full flex items-center justify-center gap-2 text-xs">
                    {module.action}
                    <ArrowRightIcon className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Card key={action.title} className="hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{action.title}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                <Button 
                  onClick={action.action}
                  className={`w-full ${action.color} text-white`}
                >
                  {action.title}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Enhanced Recent Sessions and Class Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sessions with Biometric Data */}
        <Card>
          <CardHeader title="Recent Sessions" right={
            <Link to="/attendance/sessions">
              <Button variant="outline" className="text-sm px-3 py-1">View All</Button>
            </Link>
          } />
          <div className="p-4">
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{session.course}</h4>
                    <p className="text-sm text-gray-600">{session.date} • {session.time}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span>{session.presentCount}/{session.totalStudents} present</span>
                      <span className="flex items-center gap-1">
                        <FingerPrintIcon className="h-3 w-3" />
                        {session.biometricCount} biometric
                      </span>
                      <span className="flex items-center gap-1">
                        <DevicePhoneMobileIcon className="h-3 w-3" />
                        {session.mobileCount} mobile
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-green-600">
                      {session.attendanceRate}%
                    </div>
                    <Button variant="outline" size="sm" className="mt-1">
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Enhanced Class Performance with Risk Analysis */}
        <Card>
          <CardHeader title="Class Performance & Risk Analysis" right={
            <Link to="/attendance/reports">
              <Button variant="outline" size="sm">View Reports</Button>
            </Link>
          } />
          <div className="p-4">
            <div className="space-y-3">
              {classAttendance.map((classData) => (
                <div key={classData.className} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{classData.className}</h4>
                      {getRiskLevelBadge(classData.riskLevel)}
                    </div>
                    <p className="text-sm text-gray-600">
                      {classData.totalSessions} sessions • {classData.totalStudents} students
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {getTrendIcon(classData.trend)}
                      <span className="text-xs text-gray-500 capitalize">{classData.trend} trend</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-blue-600">
                      {classData.averageRate}%
                    </div>
                    <div className="text-sm text-gray-500">avg attendance</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Integration Status */}
      <Card>
        <CardHeader title="System Integration Status" />
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Biometric Devices</p>
                <p className="text-sm text-gray-600">12 devices connected</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">SMS Gateway</p>
                <p className="text-sm text-gray-600">Notifications active</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Mobile Apps</p>
                <p className="text-sm text-gray-600">Teacher & Parent apps</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">AI Engine</p>
                <p className="text-sm text-gray-600">Analytics running</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AttendancePage;
