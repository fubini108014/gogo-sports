import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import NotificationList from '../components/user/NotificationList';
import LockedPage from '../components/ui/LockedPage';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, notificationsLoading, isLoggedIn, setIsAuthModalOpen, handleMarkAllRead, handleNotificationClick } = useAppContext();

  if (!isLoggedIn) {
    return <LockedPage title="登入後查看通知" description="活動提醒、報名審核結果、社團邀請都在這裡" />;
  }

  return (
    <NotificationList
      notifications={notifications}
      isLoading={notificationsLoading}
      onBack={() => navigate(-1)}
      onMarkAllRead={handleMarkAllRead}
      onNotificationClick={handleNotificationClick}
    />
  );
};

export default NotificationsPage;
