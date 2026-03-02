import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Bell, Plus, Home, Users, User, Compass } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import CreateMenuModal from './CreateMenuModal';
import CreatePostModal from './CreatePostModal';
import CreateActivityModal from './CreateActivityModal';
import CreateClubModal from './CreateClubModal';
import RegistrationModal from './RegistrationModal';
import Toast from './Toast';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user, clubs, notifications,
    toasts,
    selectedActivity, isRegistrationOpen, setIsRegistrationOpen,
    handleRegistrationConfirm,
    handleCreatePost, handleCreateActivity, handleCreateClub,
  } = useAppContext();

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const managedClubs = clubs.filter(c => user.managedClubIds.includes(c.id));

  // Create modal state (Layout-local)
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isCreateActivityOpen, setIsCreateActivityOpen] = useState(false);
  const [isCreateClubOpen, setIsCreateClubOpen] = useState(false);

  const handleCreateAction = (action: 'ACTIVITY' | 'CLUB' | 'POST') => {
    setIsCreateMenuOpen(false);
    if (action === 'POST') setIsPostModalOpen(true);
    else if (action === 'ACTIVITY') setIsCreateActivityOpen(true);
    else if (action === 'CLUB') setIsCreateClubOpen(true);
  };

  const onCreatePost = (content: string) => {
    handleCreatePost(content);
    setIsPostModalOpen(false);
  };

  const navItemsLeft = [
    { icon: Home, label: '首頁', path: '/' },
    { icon: Compass, label: '探索活動', path: '/activities' },
  ];

  const navItemsRight = [
    { icon: Users, label: '我的社團', path: '/clubs' },
    { icon: User, label: '個人檔案', path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-32 font-sans selection:bg-orange-100">

      {/* Navbar (Top) */}
      <nav className="sticky top-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          {/* Empty div for balance */}
          <div className="w-10"></div>
          
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-orange-600 rounded-lg flex items-center justify-center text-white font-black italic shadow-orange-200 shadow-md">
              G
            </div>
            <span className="font-extrabold text-xl tracking-tight text-gray-900 dark:text-white">
              GoGo<span className="text-primary">Sports</span>
            </span>
          </div>

          <button
            onClick={() => navigate('/notifications')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors relative"
          >
            <Bell
              size={22}
              className={location.pathname === '/notifications' ? 'text-primary fill-primary/10' : 'text-gray-500'}
            />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse" />
            )}
          </button>
        </div>
      </nav>

      {/* Page Content */}
      <main className="max-w-4xl mx-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-100 dark:border-gray-800 px-2 pb-6 pt-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto flex justify-between items-center">
          
          {/* Left Items */}
          <div className="flex flex-1 justify-around">
            {navItemsLeft.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center gap-1 transition-all ${
                    isActive ? 'text-primary' : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-black uppercase tracking-wider">{item.label.substring(0, 2)}</span>
                </button>
              );
            })}
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
            {navItemsRight.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center gap-1 transition-all ${
                    isActive ? 'text-primary' : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-black uppercase tracking-wider">{item.label.substring(0, 2)}</span>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* Modals */}
      {selectedActivity && (
        <RegistrationModal
          activity={selectedActivity}
          isOpen={isRegistrationOpen}
          onClose={() => setIsRegistrationOpen(false)}
          onConfirm={handleRegistrationConfirm}
        />
      )}

      <CreateMenuModal
        isOpen={isCreateMenuOpen}
        onClose={() => setIsCreateMenuOpen(false)}
        onSelectAction={handleCreateAction}
      />

      <CreatePostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onPost={onCreatePost}
      />

      <CreateActivityModal
        isOpen={isCreateActivityOpen}
        onClose={() => setIsCreateActivityOpen(false)}
        onCreate={handleCreateActivity}
        managedClubs={managedClubs}
      />

      <CreateClubModal
        isOpen={isCreateClubOpen}
        onClose={() => setIsCreateClubOpen(false)}
        onCreate={handleCreateClub}
      />

      <Toast toasts={toasts} />
    </div>
  );
};

export default Layout;
