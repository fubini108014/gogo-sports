import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import NotificationList from '../components/user/NotificationList';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, isLoggedIn, setIsAuthModalOpen, handleMarkAllRead, handleNotificationClick } = useAppContext();

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="text-5xl mb-4">🔔</div>
        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">登入後查看通知</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">活動提醒、社團邀請都在這裡</p>
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
    <NotificationList
      notifications={notifications}
      onBack={() => navigate(-1)}
      onMarkAllRead={handleMarkAllRead}
      onNotificationClick={handleNotificationClick}
    />
  );
};

export default NotificationsPage;
