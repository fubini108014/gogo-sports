import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Bell, Plus, Home, Users, MessageSquare, Compass, Check } from 'lucide-react';
import { TAIWAN_PATH_DATA, SPORTS_HIERARCHY } from '../constants';
import { useAppContext } from '../context/AppContext';
import CreateMenuModal from './CreateMenuModal';
import CreatePostModal from './CreatePostModal';
import CreateActivityModal from './CreateActivityModal';
import CreateClubModal from './CreateClubModal';
import RegistrationModal from './RegistrationModal';
import SettingsModal from './SettingsModal';
import ActivityFilterDrawer from './ActivityFilterDrawer';
import SportCategoryModal from './SportCategoryModal';
import Toast from './Toast';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user, clubs, notifications,
    toasts,
    selectedActivity, isRegistrationOpen, setIsRegistrationOpen,
    isSettingsOpen, setIsSettingsOpen,
    isFilterOpen, setIsFilterOpen,
    advancedFilters, setAdvancedFilters,
    isMapOpen, setIsMapOpen,
    isCategoryOpen, setIsCategoryOpen,
    homeLocations, homeMainCategories, homeSubCategories,
    toggleHomeLocation, toggleHomeMainCategory, toggleHomeSubCategory,
    setHomeSubCategories,
    darkMode, setDarkMode,
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
          </div>
        </div>
      </nav>

      {/* Desktop Floating Island Dock (Visible on md+) */}
      <div className="hidden md:flex fixed bottom-8 left-0 right-0 z-50 justify-center px-6">
        <nav className="flex items-center gap-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-800 px-3 py-2.5 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.15)] ring-1 ring-black/5 animate-slide-up">
          
          {/* Left Items */}
          <div className="flex items-center gap-1">
            {navItemsLeft.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    isActive ? 'text-primary font-bold bg-primary/5' : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-sm uppercase tracking-wide font-black">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Center Create Button (Now integrated into dock center) */}
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
            {navItemsRight.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    isActive ? 'text-primary font-bold bg-primary/5' : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-sm uppercase tracking-wide font-black">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Page Content */}
      <main className="max-w-4xl mx-auto md:pb-32 px-4 py-6">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation (Visible on < md) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-100 dark:border-gray-800 px-2 pb-6 pt-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
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

      {/* Home Location Modal */}
      {isMapOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMapOpen(false)} />
          <div className="relative z-10 w-full md:w-[700px] bg-white dark:bg-slate-800 rounded-t-[32px] md:rounded-3xl max-h-[85vh] md:max-h-[80vh] flex flex-col shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-slide-up">
            <div className="flex justify-center pt-3 pb-1 md:hidden flex-shrink-0">
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
            </div>
            <div className="overflow-y-auto flex-1">
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 flex justify-center">
                  <svg viewBox="0 0 220 520" className="w-full h-full max-h-[280px] md:max-h-[380px]">
                    {TAIWAN_PATH_DATA.map((item) => {
                      const isSel = homeLocations.includes(item.id) || homeLocations.includes('全台灣');
                      return (
                        <path
                          key={item.id}
                          d={item.d}
                          onClick={() => toggleHomeLocation(item.id)}
                          className={`cursor-pointer transition-all duration-300 stroke-[1.5] ${isSel ? 'fill-primary stroke-white scale-[1.02]' : 'fill-white dark:fill-slate-700 stroke-slate-200 dark:stroke-slate-600 hover:fill-orange-50'}`}
                          style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
                        />
                      );
                    })}
                  </svg>
                </div>
                <div className="flex flex-col md:h-[380px]">
                  <h3 className="font-black text-sm text-slate-900 dark:text-white mb-3 hidden md:block">選擇地區</h3>
                  <div className="flex-1 overflow-y-auto pr-2 no-scrollbar">
                    <button onClick={() => toggleHomeLocation('全台灣')} className={`w-full text-left px-4 py-2 rounded-xl text-sm font-bold mb-2 flex justify-between items-center ${homeLocations.includes('全台灣') ? 'bg-primary text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                      全台灣 {homeLocations.includes('全台灣') && <Check size={14} />}
                    </button>
                    <div className="grid grid-cols-2 gap-1">
                      {TAIWAN_PATH_DATA.map(loc => (
                        <button key={loc.id} onClick={() => toggleHomeLocation(loc.id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold text-left flex justify-between items-center ${homeLocations.includes(loc.id) ? 'bg-orange-50 dark:bg-primary/10 text-primary' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                          {loc.id} {homeLocations.includes(loc.id) && <Check size={12} />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => setIsMapOpen(false)} className="mt-4 w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-xl text-sm">確認選擇</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Home Category Sidebar */}
      <SportCategoryModal
        isOpen={isCategoryOpen}
        onClose={() => setIsCategoryOpen(false)}
        initialSelected={homeSubCategories}
        onConfirm={(selected) => {
          setHomeSubCategories(selected);
          
          // Derive main categories from selected sub-categories
          if (selected.length > 0) {
            const derivedMain = SPORTS_HIERARCHY.filter(cat => 
              cat.items.some(item => selected.includes(item))
            ).map(cat => cat.name);
            setHomeMainCategories(derivedMain.length > 0 ? derivedMain : ['所有運動']);
          } else {
            setHomeMainCategories(['所有運動']);
          }
          
          setIsCategoryOpen(false);
        }}
        title="選擇運動類型"
      />

      <ActivityFilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        currentFilters={advancedFilters}
        onApply={setAdvancedFilters}
        onReset={() => setAdvancedFilters({ cities: ['全台灣'], date: '', minPrice: '', maxPrice: '', levels: [], isNearlyFull: false })}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        darkMode={darkMode}
        onDarkModeToggle={() => setDarkMode(!darkMode)}
      />

      <Toast toasts={toasts} />
    </div>
  );
};

export default Layout;
