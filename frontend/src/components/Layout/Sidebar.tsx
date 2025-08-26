import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, AcademicCapIcon, ClockIcon, 
  DocumentTextIcon, BookOpenIcon, CreditCardIcon, 
  ChartBarIcon, CogIcon, BellIcon, UserIcon, 
  ChevronLeftIcon, ChevronRightIcon, BuildingStorefrontIcon, PlayCircleIcon,
  XMarkIcon, CalendarIcon, CubeIcon, TruckIcon, BuildingOfficeIcon, HomeModernIcon,
  ServerIcon, SparklesIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../stores/authStore';
import { useTranslation } from '../../utils/i18n';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { name: string; path: string }[];
}

const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const sidebarItems: SidebarItem[] = [
    {
      name: t('nav.dashboard'),
      path: '/dashboard',
      icon: HomeIcon,
    },
    {
      name: t('nav.academics'),
      path: '/academics',
      icon: AcademicCapIcon,
      children: [
        { name: t('nav.classes'), path: '/academics/classes' },
        { name: t('nav.subjects'), path: '/academics/subjects' },
        { name: t('nav.teachers'), path: '/academics/teachers' },
        { name: t('academics.courses'), path: '/academics/courses' },
        { name: t('academics.lessons'), path: '/academics/lessons' },
        { name: t('academics.grades'), path: '/academics/grades' },
      ],
    },
    {
      name: t('nav.students'),
      path: '/students',
      icon: UserIcon,
      children: [
        { name: t('nav.dashboard'), path: '/students' },
        { name: t('students.all_students'), path: '/students/list' },
        { name: t('students.add_student'), path: '/students/create' },
      ],
    },
    {
      name: t('nav.teachers'),
      path: '/teachers',
      icon: AcademicCapIcon,
      children: [
        { name: t('nav.dashboard'), path: '/teachers' },
        { name: t('teachers.all_teachers'), path: '/teachers/list' },
        { name: t('teachers.add_teacher'), path: '/teachers/create' },
      ],
    },
    {
      name: t('nav.attendance'),
      path: '/attendance',
      icon: ClockIcon,
      children: [
        { name: t('attendance.sessions'), path: '/attendance/sessions' },
        { name: t('attendance.records'), path: '/attendance/records' },
        { name: t('attendance.guardian_portal'), path: '/attendance/guardian-portal' },
        { name: t('attendance.ai_analytics'), path: '/attendance/ai-analytics' },
        { name: t('attendance.biometric_integration'), path: '/attendance/biometric-integration' },
        { name: t('attendance.leave_requests'), path: '/attendance/leave-requests' },
        { name: t('attendance.reports'), path: '/attendance/reports' },
        { name: t('nav.settings'), path: '/attendance/settings' },
      ],
    },
    {
      name: t('nav.exams'),
      path: '/exams',
      icon: DocumentTextIcon,
      children: [
        { name: t('nav.exams'), path: '/exams/exams' },
        { name: t('exams.schedules'), path: '/exams/schedules' },
        { name: t('exams.questions'), path: '/exams/questions' },
        { name: t('exams.results'), path: '/exams/results' },
        { name: t('exams.quizzes'), path: '/exams/quizzes' },
        { name: t('nav.settings'), path: '/exams/settings' },
      ],
    },
    {
      name: t('nav.finance'),
      path: '/finance',
      icon: CreditCardIcon,
      children: [
        { name: t('nav.dashboard'), path: '/finance' },
        { name: t('finance.billing'), path: '/finance/billing' },
        { name: t('finance.fees'), path: '/finance/fees' },
        { name: t('finance.invoices'), path: '/finance/invoices' },
        { name: t('finance.payments'), path: '/finance/payments' },
        { name: t('finance.plans'), path: '/finance/plans' },
        { name: t('finance.reports'), path: '/finance/reports' },
        { name: t('nav.settings'), path: '/finance/settings' },
      ],
    },
    {
      name: t('nav.library'),
      path: '/library',
      icon: BookOpenIcon,
      children: [
        { name: t('library.books'), path: '/library/books' },
        { name: t('library.borrowings'), path: '/library/borrowings' },
        { name: t('library.reservations'), path: '/library/reservations' },
        { name: t('library.categories'), path: '/library/categories' },
        { name: t('library.authors'), path: '/library/authors' },
        { name: t('library.fines'), path: '/library/fines' },
      ],
    },
    {
      name: t('nav.transport'),
      path: '/transport',
      icon: TruckIcon,
      children: [
        { name: t('transport.routes'), path: '/transport/routes' },
        { name: t('transport.drivers'), path: '/transport/drivers' },
        { name: t('transport.vehicles'), path: '/transport/vehicles' },
      ],
    },
    {
      name: t('nav.hostel'),
      path: '/hostel',
      icon: HomeModernIcon,
      children: [
        { name: t('hostel.rooms'), path: '/hostel/rooms' },
      ],
    },
    {
      name: t('nav.hr'),
      path: '/hr',
      icon: BuildingOfficeIcon,
      children: [
        { name: t('hr.payroll'), path: '/hr/payroll' },
      ],
    },
    {
      name: t('nav.timetable'),
      path: '/timetable',
      icon: CalendarIcon,
      children: [
        { name: t('timetable.schedules'), path: '/timetable/schedules' },
      ],
    },
    {
      name: t('nav.analytics'),
      path: '/analytics',
      icon: ChartBarIcon,
    },
    {
      name: t('nav.ai_tools'),
      path: '/ai-tools',
      icon: SparklesIcon,
    },
    {
      name: t('nav.settings'),
      path: '/settings',
      icon: CogIcon,
    },
  ];

  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleItem = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isChildActive = (children: { name: string; path: string }[]) => {
    return children.some(child => isActive(child.path));
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white/90 backdrop-blur-md border-r border-gray-200/50 shadow-xl
        transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">EU</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">EduCore Ultra</h1>
              <p className="text-xs text-gray-600">School Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100/80 transition-colors lg:hidden"
          >
            <XMarkIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedItems.includes(item.name);
            const isItemActive = isActive(item.path);
            const isAnyChildActive = hasChildren && isChildActive(item.children!);

            return (
              <div key={item.name}>
                <button
                  onClick={() => hasChildren ? toggleItem(item.name) : undefined}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200
                    ${isItemActive || isAnyChildActive 
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200/50' 
                      : 'text-gray-700 hover:bg-gray-50/80'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className={`w-5 h-5 ${isItemActive || isAnyChildActive ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  {hasChildren && (
                    <ChevronRightIcon 
                      className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} 
                    />
                  )}
                </button>

                {/* Children */}
                {hasChildren && isExpanded && (
                  <div className="mt-2 ml-4 space-y-1">
                    {item.children!.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={`
                          block px-4 py-2.5 rounded-lg text-sm transition-all duration-200
                          ${isActive(child.path)
                            ? 'bg-blue-100/80 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-900'
                          }
                        `}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200/50">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50/50">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.first_name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-600 truncate">
                {user?.user_type || 'Administrator'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;


