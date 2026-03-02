import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MOCK_ACTIVITIES, MOCK_CLUBS, MOCK_USER, MOCK_NOTIFICATIONS, MOCK_POSTS,
} from '../constants';
import { Activity, Club, Notification, NotificationType, User } from '../types';
import { ToastItem } from '../components/Toast';

interface AppContextType {
  // Data
  activities: Activity[];
  clubs: Club[];
  user: User;
  notifications: Notification[];
  myActivityIds: string[];

  // Toast
  toasts: ToastItem[];
  addToast: (message: string, type?: ToastItem['type']) => void;

  // Dark Mode
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;

  // Registration modal state
  selectedActivity: Activity | null;
  setSelectedActivity: (a: Activity | null) => void;
  isRegistrationOpen: boolean;
  setIsRegistrationOpen: (v: boolean) => void;

  // Handlers
  handleActivityClick: (activity: Activity) => void;
  handleClubClick: (clubId: string) => void;
  handleRegistrationConfirm: () => void;
  handleCancelRegistration: (activityId: string) => void;
  handleJoinClub: (clubId: string) => void;
  handleLeaveClub: (clubId: string) => void;
  handleMarkAllRead: () => void;
  handleNotificationClick: (id: string) => void;
  handleCreatePost: (content: string) => void;
  handleCreateActivity: (data: any) => void;
  handleCreateClub: (data: any) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider');
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  // Data State
  const [activities, setActivities] = useState<Activity[]>(MOCK_ACTIVITIES);
  const [clubs, setClubs] = useState<Club[]>(MOCK_CLUBS);
  const [user, setUser] = useState<User>(MOCK_USER);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [myActivityIds, setMyActivityIds] = useState<string[]>(MOCK_USER.registeredActivityIds);

  // Toast State
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const addToast = (message: string, type: ToastItem['type'] = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  // Dark Mode
  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Registration modal
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  // Navigation helpers
  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
    navigate(`/activities/${activity.id}`);
    window.scrollTo(0, 0);
  };

  const handleClubClick = (clubId: string) => {
    navigate(`/clubs/${clubId}`);
    window.scrollTo(0, 0);
  };

  // Registration
  const handleRegistrationConfirm = () => {
    if (selectedActivity && !myActivityIds.includes(selectedActivity.id)) {
      setMyActivityIds(prev => [...prev, selectedActivity.id]);
      addToast(`已成功報名「${selectedActivity.title}」`, 'success');
    }
    setIsRegistrationOpen(false);
  };

  const handleCancelRegistration = (activityId: string) => {
    const activity = activities.find(a => a.id === activityId);
    setMyActivityIds(prev => prev.filter(id => id !== activityId));
    if (activity) addToast(`已取消「${activity.title}」的報名`, 'info');
  };

  // Club Join / Leave
  const handleJoinClub = (clubId: string) => {
    const club = clubs.find(c => c.id === clubId);
    setUser(prev => ({ ...prev, joinedClubIds: [...prev.joinedClubIds, clubId] }));
    setClubs(prev => prev.map(c => c.id === clubId ? { ...c, membersCount: c.membersCount + 1 } : c));
    if (club) addToast(`已加入「${club.name}」`, 'success');
  };

  const handleLeaveClub = (clubId: string) => {
    const club = clubs.find(c => c.id === clubId);
    setUser(prev => ({ ...prev, joinedClubIds: prev.joinedClubIds.filter(id => id !== clubId) }));
    setClubs(prev => prev.map(c => c.id === clubId ? { ...c, membersCount: c.membersCount - 1 } : c));
    if (club) addToast(`已退出「${club.name}」`, 'info');
  };

  // Notifications
  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = (id: string) => {
    const notification = notifications.find(n => n.id === id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    if (!notification?.linkId) return;

    if (notification.type === NotificationType.ACTIVITY) {
      const activity = activities.find(a => a.id === notification.linkId);
      if (activity) handleActivityClick(activity);
    } else if (notification.type === NotificationType.INVITE) {
      handleClubClick(notification.linkId);
    } else if (notification.type === NotificationType.INTERACTION) {
      const post = MOCK_POSTS.find(p => p.id === notification.linkId);
      if (post) handleClubClick(post.clubId);
    }
  };

  // Create Actions
  const handleCreatePost = (content: string) => {
    console.log('Creating post:', content);
    addToast('貼文發布成功', 'success');
  };

  const handleCreateActivity = (activityData: any) => {
    const newActivity: Activity = { ...activityData, id: `a${Date.now()}` };
    setActivities(prev => [newActivity, ...prev]);
  };

  const handleCreateClub = (clubData: any) => {
    const newClub: Club = { ...clubData, id: `c${Date.now()}` };
    setClubs(prev => [newClub, ...prev]);
    setUser(prev => ({
      ...prev,
      joinedClubIds: [...prev.joinedClubIds, newClub.id],
      managedClubIds: [...prev.managedClubIds, newClub.id],
      isClubAdmin: true,
    }));
  };

  return (
    <AppContext.Provider value={{
      activities, clubs, user, notifications, myActivityIds,
      toasts, addToast,
      darkMode, setDarkMode,
      selectedActivity, setSelectedActivity,
      isRegistrationOpen, setIsRegistrationOpen,
      handleActivityClick, handleClubClick,
      handleRegistrationConfirm, handleCancelRegistration,
      handleJoinClub, handleLeaveClub,
      handleMarkAllRead, handleNotificationClick,
      handleCreatePost, handleCreateActivity, handleCreateClub,
    }}>
      {children}
    </AppContext.Provider>
  );
};
