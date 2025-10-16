import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  AcademicCapIcon,
  ClockIcon,
  DocumentTextIcon,
  UserIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  AcademicCapIcon as AcademicCapIconSolid,
  ClockIcon as ClockIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  UserIcon as UserIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid
} from '@heroicons/react/24/solid';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  iconSolid: React.ComponentType<{ className?: string }>;
}

/**
 * Mobile Bottom Navigation Bar
 * Only visible on mobile/tablet devices (< 1024px)
 */
const MobileBottomNav: React.FC = () => {
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: HomeIcon,
      iconSolid: HomeIconSolid
    },
    {
      name: 'Students',
      path: '/students',
      icon: UserIcon,
      iconSolid: UserIconSolid
    },
    {
      name: 'Attendance',
      path: '/attendance',
      icon: ClockIcon,
      iconSolid: ClockIconSolid
    },
    {
      name: 'Exams',
      path: '/exams',
      icon: DocumentTextIcon,
      iconSolid: DocumentTextIconSolid
    },
    {
      name: 'More',
      path: '/settings',
      icon: Cog6ToothIcon,
      iconSolid: Cog6ToothIconSolid
    }
  ];

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 safe-area-bottom">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = active ? item.iconSolid : item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center justify-center gap-1
                transition-all duration-200
                ${active 
                  ? 'text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;

