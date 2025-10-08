import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import SkipLink from '../UI/SkipLink';

interface LayoutProps {
  children: React.ReactNode;
  hideSidebar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, hideSidebar = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default to closed on mobile

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <SkipLink />
      
      {/* Mobile overlay for sidebar */}
      {sidebarOpen && !hideSidebar && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      {!hideSidebar && (
        <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <Header onSidebarToggle={toggleSidebar} />

        {/* Main content area with animated route transitions */}
        <main id="main-content" className="flex-1 overflow-y-auto thin-scrollbar" tabIndex={-1}>
          <div className="container-responsive">
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
      </div>
    </div>
  );
};

export default Layout;


