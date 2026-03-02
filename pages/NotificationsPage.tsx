import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import NotificationList from '../components/NotificationList';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, handleMarkAllRead, handleNotificationClick } = useAppContext();

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
