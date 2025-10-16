import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileBottomNav from '../UI/MobileBottomNav';
import SkipLink from '../UI/SkipLink';
import { useResponsive } from '../../hooks/useResponsive';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  hideSidebar?: boolean;
  showMobileNav?: boolean;
}

/**
 * 100% Responsive Layout Component
 * Automatically adapts for Mobile, Tablet, and Desktop
 */
const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  hideSidebar = false,
  showMobileNav = true
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isMobile, isTablet } = useResponsive();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar on route change (mobile/tablet)
  React.useEffect(() => {
    if (isMobile || isTablet) {
      setSidebarOpen(false);
    }
  }, [children, isMobile, isTablet]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 overflow-hidden">
      <SkipLink />
      
      {/* Mobile/Tablet overlay for sidebar */}
      <AnimatePresence>
        {sidebarOpen && !hideSidebar && (isMobile || isTablet) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar - Responsive */}
      {!hideSidebar && (
        <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} />
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header - Sticky on mobile */}
        <div className="sticky top-0 z-20">
          <Header onSidebarToggle={toggleSidebar} />
        </div>

        {/* Main content with padding for mobile bottom nav */}
        <main 
          id="main-content" 
          className={`
            flex-1 overflow-y-auto thin-scrollbar
            ${showMobileNav && !hideSidebar ? 'pb-16 lg:pb-0' : ''}
          `}
          tabIndex={-1}
        >
          <div className="container-responsive min-h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={(children as any)?.key || 'page'}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="w-full h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        {showMobileNav && !hideSidebar && (
          <MobileBottomNav />
        )}
      </div>
    </div>
  );
};

export default ResponsiveLayout;

