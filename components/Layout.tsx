import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Bell, Plus, Home, Users, MessageSquare, Compass } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import NavItem from './ui/NavItem';
import ModalManager from './modals/ModalManager';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user, notifications,
    isLoggedIn, setIsAuthModalOpen,
    setIsCreateMenuOpen,
  } = useAppContext();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const navItemsLeft = [
    { icon: Home, label: '首頁', path: '/' },
    { icon: Compass, label: '探索活動', path: '/activities' },
  ];

  const navItemsRight = [
    { icon: Users, label: '探索社團', path: '/clubs' },
    { icon: MessageSquare, label: '訊息', path: '/messages' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-32 font-sans selection:bg-orange-100">

      {/* Global Top Header */}
      <nav className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 py-3 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          {/* Logo Section */}
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-orange-600 rounded-lg flex items-center justify-center text-white font-black italic shadow-orange-200 shadow-sm group-hover:scale-110 transition-transform">
              G
            </div>
            <span className="font-extrabold text-xl tracking-tight text-gray-900 dark:text-white">
              GoGo<span className="text-primary">Sports</span>
            </span>
          </div>

          {/* Right Action Area */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/notifications')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors relative"
            >
              <Bell
                size={22}
                className={location.pathname === '/notifications' ? 'text-primary fill-primary/10' : 'text-gray-500'}
              />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
              )}
            </button>
            
            {isLoggedIn ? (
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 pl-2 pr-1 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group"
              >
                <span className="hidden sm:block text-xs font-bold text-gray-600 dark:text-gray-300 ml-2">
                  {user.name}
                </span>
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm">
                  <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                </div>
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-1.5 bg-primary text-white text-sm font-black rounded-full hover:bg-orange-600 transition-colors"
              >
                登入
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Desktop Floating Island Dock (Visible on md+) */}
      <div className="hidden md:flex fixed bottom-8 left-0 right-0 z-50 justify-center px-6">
        <nav className="flex items-center gap-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-800 px-3 py-2.5 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.15)] ring-1 ring-black/5 animate-slide-up">
          
          {/* Left Items */}
          <div className="flex items-center gap-1">
            {navItemsLeft.map(item => (
              <NavItem
                key={item.path}
                icon={item.icon}
                label={item.label}
                isActive={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                variant="desktop"
              />
            ))}
          </div>

          {/* Center Create Button */}
          <div className="px-2">
            <button
              onClick={() => setIsCreateMenuOpen(true)}
              className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 rounded-full shadow-lg hover:scale-105 transition-transform active:scale-95 font-black text-sm uppercase tracking-wider"
            >
              <Plus size={20} strokeWidth={3} />
              <span>建立</span>
            </button>
          </div>

          {/* Right Items */}
          <div className="flex items-center gap-1">
            {navItemsRight.map(item => (
              <NavItem
                key={item.path}
                icon={item.icon}
                label={item.label}
                isActive={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                variant="desktop"
              />
            ))}
          </div>
        </nav>
      </div>

      {/* Page Content */}
      <main className="max-w-4xl mx-auto md:pb-32">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation (Visible on < md) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-100 dark:border-gray-800 px-2 pb-6 pt-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto flex justify-between items-center">
          
          {/* Left Items */}
          <div className="flex flex-1 justify-around">
            {navItemsLeft.map(item => (
              <NavItem
                key={item.path}
                icon={item.icon}
                label={item.label}
                isActive={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                variant="mobile"
              />
            ))}
          </div>

          {/* Center Create Button */}
          <div className="px-4 -mt-10">
            <button
              onClick={() => setIsCreateMenuOpen(true)}
              className="w-14 h-14 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 border-4 border-white dark:border-gray-900 ring-1 ring-gray-100 dark:ring-gray-800"
            >
              <Plus size={32} strokeWidth={3} />
            </button>
          </div>

          {/* Right Items */}
          <div className="flex flex-1 justify-around">
            {navItemsRight.map(item => (
              <NavItem
                key={item.path}
                icon={item.icon}
                label={item.label}
                isActive={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                variant="mobile"
              />
            ))}
          </div>

        </div>
      </div>

      {/* Unified Modal Management */}
      <ModalManager />
    </div>
  );
};

export default Layout;
