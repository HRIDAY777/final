import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BellIcon, MagnifyingGlassIcon, UserCircleIcon,
  CogIcon, ArrowRightOnRectangleIcon, ShoppingCartIcon,
  Bars3Icon, SparklesIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../../services/api';
import EduBotModal from '../EduBot/EduBotModal';
import { useAuth } from '../../stores/authStore';
import LanguageSelector from '../UI/LanguageSelector';

interface HeaderProps {
  onSidebarToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSidebarToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [botOpen, setBotOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = async () => {
    try {
      const data: any = await apiService.get('/shop/cart/');
      const count = (data.items || []).reduce((s: number, it: any) => s + (it.quantity || 0), 0);
      setCartCount(count);
    } catch {}
  };

  React.useEffect(() => {
    refreshCart();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <>
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={onSidebarToggle}
            className="p-2 rounded-xl hover:bg-gray-100/80 transition-all duration-200 lg:hidden"
          >
            <Bars3Icon className="w-5 h-5 text-gray-700" />
          </button>

          {/* Search - hidden on mobile, shown on tablet+ */}
          <form onSubmit={handleSearch} className="relative hidden sm:block">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search students, teachers, classes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-64 lg:w-80 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all duration-200"
              />
            </div>
          </form>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Language Selector */}
          <LanguageSelector className="hidden sm:block" />

          {/* EduBot Assistant - hidden on mobile */}
          <button
            onClick={() => setBotOpen(true)}
            className="hidden sm:inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <SparklesIcon className="w-4 h-4 mr-2" />
            AI Assistant
          </button>

          {/* Cart */}
          <Link to="/shop/cart" className="relative p-2.5 rounded-xl hover:bg-gray-100/80 transition-all duration-200">
            <ShoppingCartIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] leading-[18px] text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-center font-medium shadow-lg">{cartCount}</span>
            )}
          </Link>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2.5 rounded-xl hover:bg-gray-100/80 transition-all duration-200 relative"
            >
              <BellIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {/* Notifications dropdown */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200/50 backdrop-blur-md z-50">
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">New student enrolled</p>
                        <p className="text-xs text-gray-600">John Doe has been enrolled in Grade 10A</p>
                        <p className="text-xs text-gray-400 mt-1">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Fee payment received</p>
                        <p className="text-xs text-gray-600">Payment of $500 received from Sarah Smith</p>
                        <p className="text-xs text-gray-400 mt-1">15 minutes ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-100/80 transition-all duration-200"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.first_name?.charAt(0) || 'A'}
                </span>
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">
                {user?.first_name || 'Admin'}
              </span>
            </button>

            {/* Profile dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200/50 backdrop-blur-md z-50">
                <div className="p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user?.first_name?.charAt(0) || 'A'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-xs text-gray-600">{user?.email}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Link
                      to="/accounts/profile"
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <UserCircleIcon className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/accounts/settings"
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <CogIcon className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>

    {/* EduBot Modal */}
    <EduBotModal isOpen={botOpen} onClose={() => setBotOpen(false)} />
    </>
  );
};

export default Header;


