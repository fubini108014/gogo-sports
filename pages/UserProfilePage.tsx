import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import UserProfile from '../components/user/UserProfile';

const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    user, activities, clubs, myActivityIds,
    isLoggedIn, setIsAuthModalOpen,
    handleActivityClick, handleClubClick,
    handleCancelRegistration, handleLogout,
    setIsSettingsOpen, handleUpdateProfile,
  } = useAppContext();

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <span className="text-4xl">👤</span>
        </div>
        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">尚未登入</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">登入後可查看你的活動與社團</p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="px-8 py-3 bg-primary text-white font-black rounded-full hover:bg-orange-600 transition-colors"
        >
          立即登入
        </button>
      </div>
    );
  }

  return (
    <UserProfile
      user={user}
      activities={activities}
      clubs={clubs}
      myActivityIds={myActivityIds}
      onBack={() => navigate(-1)}
      onActivityClick={handleActivityClick}
      onClubClick={handleClubClick}
      onCancelRegistration={handleCancelRegistration}
      onOpenSettings={() => setIsSettingsOpen(true)}
      onLogout={handleLogout}
      onUpdateProfile={handleUpdateProfile}
    />
  );
};

export default UserProfilePage;
