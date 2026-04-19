import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import UserProfile from '../components/user/UserProfile';
import LockedPage from '../components/ui/LockedPage';

const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    user, activities, clubs, myActivityIds,
    isLoggedIn, setIsAuthModalOpen,
    activitiesLoading, clubsLoading,
    handleActivityClick, handleClubClick,
    handleCancelRegistration, handleLogout,
    setIsSettingsOpen, handleUpdateProfile,
  } = useAppContext();

  if (!isLoggedIn) {
    return <LockedPage title="查看個人資料需要登入" description="登入後可管理你的活動報名、社團及個人設定" />;
  }

  if (activitiesLoading || clubsLoading) {
    return (
      <div className="animate-pulse pb-20">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
        {/* Avatar + name */}
        <div className="flex flex-col items-center pt-8 pb-6 px-4 gap-3">
          <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-3 w-48 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
        {/* Stats row */}
        <div className="flex justify-around px-4 py-4 border-t border-gray-100 dark:border-gray-700">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="h-6 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-12 bg-gray-100 dark:bg-gray-800 rounded" />
            </div>
          ))}
        </div>
        {/* Tab bar */}
        <div className="flex border-b border-gray-100 dark:border-gray-700 px-4 gap-4 pt-2">
          <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-8 w-20 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
        {/* Activity cards */}
        <div className="px-4 pt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
          ))}
        </div>
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
