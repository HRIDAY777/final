import React, { useEffect, useState } from 'react';
import { 
  UsersIcon, AcademicCapIcon, ClockIcon, DocumentTextIcon,
  ChartBarIcon, ArrowTrendingUpIcon, ExclamationTriangleIcon, CheckCircleIcon,
  BuildingLibraryIcon, BanknotesIcon, TruckIcon, HomeModernIcon,
  BriefcaseIcon, CalendarDaysIcon, EyeIcon, PlusIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useAuth } from '../../stores/authStore';
import { useClasses } from '../../stores/academicStore';
import { useAttendanceSessions } from '../../stores/attendanceStore';
import { useExams } from '../../stores/examStore';
import { useTranslation } from '../../utils/i18n';

interface StatCard {
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  gradient: string;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

const Dashboard: React.FC = () => {
  const { t, formatCurrency } = useTranslation();
  const { user } = useAuth();
  const { classes, fetchClasses } = useClasses();
  const { sessions, fetchSessions } = useAttendanceSessions();
  const { exams, fetchExams } = useExams();
  
  const [stats, setStats] = useState<StatCard[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  
  type ModuleCard = {
    key: string;
    title: string;
    description: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>; 
    metric?: string;
    gradient: string;
  };

  useEffect(() => {
    // Fetch data for dashboard
    fetchClasses();
    fetchSessions();
    fetchExams();
  }, [fetchClasses, fetchSessions, fetchExams]);

  useEffect(() => {
    // Calculate stats based on fetched data
    const calculatedStats: StatCard[] = [
      {
        title: t('dashboard.total_students'),
        value: classes?.results?.length ? classes.results.reduce((acc, cls) => acc + (cls.current_student_count || 0), 0) : 0,
        change: '+12%',
        changeType: 'positive',
        icon: UsersIcon,
        color: 'bg-blue-500',
        gradient: 'from-blue-500 to-blue-600',
      },
      {
        title: t('dashboard.total_teachers'),
        value: '24',
        change: '+5%',
        changeType: 'positive',
        icon: AcademicCapIcon,
        color: 'bg-green-500',
        gradient: 'from-green-500 to-green-600',
      },
      {
        title: t('dashboard.attendance_rate'),
        value: '94.2%',
        change: '+2.1%',
        changeType: 'positive',
        icon: ClockIcon,
        color: 'bg-yellow-500',
        gradient: 'from-yellow-500 to-yellow-600',
      },
      {
        title: t('dashboard.active_exams'),
        value: exams?.results?.length || 0,
        change: '+3',
        changeType: 'positive',
        icon: DocumentTextIcon,
        color: 'bg-purple-500',
        gradient: 'from-purple-500 to-purple-600',
      },
    ];

    setStats(calculatedStats);
  }, [classes, exams, t]);

  useEffect(() => {
    // Mock recent activities
    const activities: RecentActivity[] = [
      {
        id: '1',
        type: 'attendance',
        title: t('dashboard.activity.attendance_completed'),
        description: t('dashboard.activity.all_students_present'),
        time: t('time.2_minutes_ago'),
        status: 'success',
      },
      {
        id: '2',
        type: 'exam',
        title: t('dashboard.activity.exam_scheduled'),
        description: t('dashboard.activity.math_exam_tomorrow'),
        time: t('time.15_minutes_ago'),
        status: 'info',
      },
      {
        id: '3',
        type: 'fee',
        title: t('dashboard.activity.fee_payment_received'),
        description: t('dashboard.activity.payment_received_from'),
        time: t('time.1_hour_ago'),
        status: 'success',
      },
      {
        id: '4',
        type: 'library',
        title: t('dashboard.activity.book_returned'),
        description: t('dashboard.activity.physics_textbook_returned'),
        time: t('time.2_hours_ago'),
        status: 'success',
      },
    ];

    setRecentActivities(activities);
  }, [t]);

  const moduleCards: ModuleCard[] = [
    {
      key: 'students',
      title: t('nav.students'),
      description: t('dashboard.module.students_description'),
      path: '/students',
      icon: UsersIcon,
      metric: `${classes?.results?.length ? classes.results.reduce((acc, cls) => acc + (cls.current_student_count || 0), 0) : 0} ${t('nav.students')}`,
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      key: 'teachers',
      title: t('nav.teachers'),
      description: t('dashboard.module.teachers_description'),
      path: '/teachers',
      icon: AcademicCapIcon,
      metric: `24 ${t('nav.teachers')}`,
      gradient: 'from-green-500 to-emerald-600',
    },
    {
      key: 'academics',
      title: t('nav.academics'),
      description: t('dashboard.module.academics_description'),
      path: '/academics',
      icon: BuildingLibraryIcon,
      metric: `${classes?.results?.length || 0} ${t('nav.classes')}`,
      gradient: 'from-purple-500 to-violet-600',
    },
    {
      key: 'attendance',
      title: t('nav.attendance'),
      description: t('dashboard.module.attendance_description'),
      path: '/attendance',
      icon: ClockIcon,
      metric: `${sessions?.results?.length || 0} ${t('attendance.sessions')}`,
      gradient: 'from-yellow-500 to-orange-600',
    },
    {
      key: 'exams',
      title: t('nav.exams'),
      description: t('dashboard.module.exams_description'),
      path: '/exams',
      icon: DocumentTextIcon,
      metric: `${exams?.results?.length || 0} ${t('common.active')}`,
      gradient: 'from-red-500 to-pink-600',
    },
    {
      key: 'finance',
      title: t('nav.finance'),
      description: t('dashboard.module.finance_description'),
      path: '/finance',
      icon: BanknotesIcon,
      metric: `${formatCurrency(45230, 'BDT')} ${t('finance.revenue')}`,
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      key: 'library',
      title: t('nav.library'),
      description: t('dashboard.module.library_description'),
      path: '/library',
      icon: BuildingLibraryIcon,
      metric: `1,250 ${t('library.books')}`,
      gradient: 'from-indigo-500 to-blue-600',
    },
    {
      key: 'transport',
      title: t('nav.transport'),
      description: t('dashboard.module.transport_description'),
      path: '/transport',
      icon: TruckIcon,
      metric: `12 ${t('transport.routes')}`,
      gradient: 'from-cyan-500 to-blue-600',
    },
    {
      key: 'hostel',
      title: t('nav.hostel'),
      description: t('dashboard.module.hostel_description'),
      path: '/hostel',
      icon: HomeModernIcon,
      metric: `150 ${t('hostel.rooms')}`,
      gradient: 'from-violet-500 to-purple-600',
    },
    {
      key: 'hr',
      title: t('nav.hr'),
      description: t('dashboard.module.hr_description'),
      path: '/hr',
      icon: BriefcaseIcon,
      metric: `45 ${t('hr.staff')}`,
      gradient: 'from-orange-500 to-red-600',
    },
    {
      key: 'timetable',
      title: t('nav.timetable'),
      description: t('dashboard.module.timetable_description'),
      path: '/timetable',
      icon: CalendarDaysIcon,
      metric: `8 ${t('timetable.periods_per_day')}`,
      gradient: 'from-teal-500 to-green-600',
    },
    {
      key: 'analytics',
      title: t('nav.analytics'),
      description: t('dashboard.module.analytics_description'),
      path: '/analytics',
      icon: ChartBarIcon,
      metric: `15 ${t('analytics.reports')}`,
      gradient: 'from-pink-500 to-rose-600',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      case 'info':
        return <DocumentTextIcon className="w-5 h-5 text-blue-500" />;
      default:
        return <CheckCircleIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t('dashboard.welcome_back')}, {user?.first_name || 'Admin'}! 👋
          </h1>
          <p className="text-lg text-gray-600">
            {t('dashboard.whats_happening_today')}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full -translate-y-16 translate-x-16`}></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      <ArrowTrendingUpIcon className={`w-4 h-4 ${
                        stat.changeType === 'positive' ? 'text-green-500' : 
                        stat.changeType === 'negative' ? 'text-red-500' : 'text-gray-500'
                      }`} />
                      <span className={`text-sm font-medium ml-1 ${
                        stat.changeType === 'positive' ? 'text-green-600' : 
                        stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient}`}>
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Module Cards */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.quick_access')}</h2>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <EyeIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <PlusIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {moduleCards.map((module) => (
                  <Link
                    key={module.key}
                    to={module.path}
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${module.gradient} opacity-10 rounded-full -translate-y-12 translate-x-12 group-hover:opacity-20 transition-opacity`}></div>
                    <div className="relative">
                      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${module.gradient} mb-4`}>
                        <module.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                        {module.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {module.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                          {module.metric}
                        </span>
                        <div className="w-6 h-6 rounded-full bg-gray-200 group-hover:bg-gray-300 transition-colors flex items-center justify-center">
                          <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.recent_activities')}</h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  {t('common.view_all')}
                </button>
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(activity.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

