import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SPORTS_HIERARCHY } from '../constants';
import { Activity, Club, FilterState, DEFAULT_FILTER_STATE, Notification, NotificationType, User } from '../types';
import { ToastItem } from '../components/Toast';
import {
  getToken, clearTokens,
  apiLogin, apiRegister, apiLogout, apiGetMe,
  apiGetActivities, apiRegisterActivity, apiCancelRegistration, apiCreateActivity,
  apiGetClubs, apiJoinClub, apiLeaveClub, apiCreateClub,
  apiGetNotifications, apiMarkNotificationRead, apiMarkAllNotificationsRead,
  apiUpdateProfile,
} from '../services/api';

const GUEST_USER: User = {
  id: '',
  name: '未登入',
  avatar: 'https://picsum.photos/id/64/200/200',
  isClubAdmin: false,
  registeredActivityIds: [],
  joinedClubIds: [],
  managedClubIds: [],
};

interface AppContextType {
  // Data
  activities: Activity[];
  clubs: Club[];
  user: User;
  notifications: Notification[];
  myActivityIds: string[];
  activitiesLoading: boolean;
  clubsLoading: boolean;

  // Auth
  isLoggedIn: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (v: boolean) => void;
  handleLogin: (email: string, password: string) => Promise<void>;
  handleLogout: () => Promise<void>;
  handleRegister: (name: string, email: string, password: string, phone?: string) => Promise<void>;

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

  // Settings modal state
  isSettingsOpen: boolean;
  setIsSettingsOpen: (v: boolean) => void;

  // Activity filter state
  isFilterOpen: boolean;
  setIsFilterOpen: (v: boolean) => void;
  advancedFilters: FilterState;
  setAdvancedFilters: (f: FilterState) => void;

  // Home search modal state
  isMapOpen: boolean;
  setIsMapOpen: (v: boolean) => void;
  isCategoryOpen: boolean;
  setIsCategoryOpen: (v: boolean) => void;
  homeLocations: string[];
  homeMainCategories: string[];
  homeSubCategories: string[];
  setHomeMainCategories: (cats: string[]) => void;
  setHomeSubCategories: (cats: string[]) => void;
  toggleHomeLocation: (loc: string) => void;
  toggleHomeMainCategory: (name: string) => void;
  toggleHomeSubCategory: (name: string) => void;

  // Handlers
  handleActivityClick: (activity: Activity) => void;
  handleClubClick: (clubId: string) => void;
  handleRegistrationConfirm: (group?: string) => void;
  handleCancelRegistration: (activityId: string) => void;
  handleJoinClub: (clubId: string) => void;
  handleLeaveClub: (clubId: string) => void;
  handleMarkAllRead: () => void;
  handleNotificationClick: (id: string) => void;
  handleCreatePost: (content: string) => void;
  handleCreateActivity: (data: any) => Promise<void>;
  handleCreateClub: (data: any) => Promise<void>;
  handleUpdateProfile: (data: { name?: string; bio?: string; phone?: string }) => Promise<void>;
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
  const [activities, setActivities] = useState<Activity[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [user, setUser] = useState<User>(GUEST_USER);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [myActivityIds, setMyActivityIds] = useState<string[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [clubsLoading, setClubsLoading] = useState(true);

  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Toast State
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastCounter = useRef(0);
  const addToast = (message: string, type: ToastItem['type'] = 'success') => {
    const id = `toast-${++toastCounter.current}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  // Dark Mode (persisted to localStorage)
  const [darkMode, setDarkModeState] = useState(() => localStorage.getItem('gogo_dark_mode') === 'true');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);
  const setDarkMode = (v: boolean) => {
    localStorage.setItem('gogo_dark_mode', String(v));
    setDarkModeState(v);
  };

  // Registration modal
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  // Settings modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Activity filter
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);

  // Home search modals
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [homeLocations, setHomeLocations] = useState<string[]>(['全台灣']);
  const [homeMainCategories, setHomeMainCategories] = useState<string[]>(['所有運動']);
  const [homeSubCategories, setHomeSubCategories] = useState<string[]>([]);

  // ── Bootstrap: load data on mount ────────────────────────────────
  useEffect(() => {
    // Load activities
    apiGetActivities({ limit: '50' })
      .then(({ data }) => setActivities(data))
      .catch(() => addToast('無法載入活動資料', 'error'))
      .finally(() => setActivitiesLoading(false));

    // Load clubs
    apiGetClubs({ limit: '50' })
      .then(({ data }) => setClubs(data))
      .catch(() => addToast('無法載入社團資料', 'error'))
      .finally(() => setClubsLoading(false));

    // If token exists, load current user
    if (getToken()) {
      apiGetMe()
        .then(u => {
          setUser(u);
          setMyActivityIds(u.registeredActivityIds);
          setIsLoggedIn(true);
          return apiGetNotifications();
        })
        .then(({ data }) => setNotifications(data))
        .catch(() => {
          // Token expired or invalid
          clearTokens();
        });
    }
  }, []);

  // ── Auth ─────────────────────────────────────────────────────────
  const handleLogin = async (email: string, password: string) => {
    const u = await apiLogin(email, password);
    setUser(u);
    setMyActivityIds(u.registeredActivityIds);
    setIsLoggedIn(true);
    addToast(`歡迎回來，${u.name}！`, 'success');
    // Load notifications after login
    apiGetNotifications()
      .then(({ data }) => setNotifications(data))
      .catch(() => {});
    // Re-load clubs to get isJoined state
    apiGetClubs({ limit: '50' }).then(({ data }) => setClubs(data)).catch(() => {});
  };

  const handleRegister = async (name: string, email: string, password: string, phone?: string) => {
    const u = await apiRegister(name, email, password, phone);
    setUser(u);
    setMyActivityIds([]);
    setIsLoggedIn(true);
    addToast(`帳號建立成功，歡迎加入 GoGo Sports！`, 'success');
  };

  const handleLogout = async () => {
    await apiLogout();
    setUser(GUEST_USER);
    setMyActivityIds([]);
    setNotifications([]);
    setIsLoggedIn(false);
    addToast('已登出', 'info');
    // Reload clubs without auth (no isJoined info needed)
    apiGetClubs({ limit: '50' }).then(({ data }) => setClubs(data)).catch(() => {});
  };

  // ── Auth guard helper ─────────────────────────────────────────────
  const requireAuth = (): boolean => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      return false;
    }
    return true;
  };

  // ── Home location / category toggles ─────────────────────────────
  const toggleHomeLocation = (loc: string) => {
    if (loc === '全台灣') { setHomeLocations(['全台灣']); return; }
    setHomeLocations(prev => {
      const filtered = prev.filter(i => i !== '全台灣');
      const next = filtered.includes(loc) ? filtered.filter(i => i !== loc) : [...filtered, loc];
      return next.length === 0 ? ['全台灣'] : next;
    });
  };

  const toggleHomeMainCategory = (name: string) => {
    if (name === '所有運動') { setHomeMainCategories(['所有運動']); setHomeSubCategories([]); return; }
    setHomeMainCategories(prev => {
      const filtered = prev.filter(i => i !== '所有運動');
      const next = filtered.includes(name) ? filtered.filter(i => i !== name) : [...filtered, name];
      if (next.length === 0) { setHomeSubCategories([]); return ['所有運動']; }
      return next;
    });
  };

  const toggleHomeSubCategory = (name: string) => {
    setHomeSubCategories(prev => prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]);
  };

  // ── Navigation ────────────────────────────────────────────────────
  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
    navigate(`/activities/${activity.id}`);
    window.scrollTo(0, 0);
  };

  const handleClubClick = (clubId: string) => {
    navigate(`/clubs/${clubId}`);
    window.scrollTo(0, 0);
  };

  // ── Registration ──────────────────────────────────────────────────
  const handleRegistrationConfirm = (group?: string) => {
    if (!selectedActivity) return;
    if (!requireAuth()) return;

    apiRegisterActivity(selectedActivity.id, group)
      .then(() => {
        setMyActivityIds(prev => [...prev, selectedActivity.id]);
        setUser(prev => ({
          ...prev,
          registeredActivityIds: [...prev.registeredActivityIds, selectedActivity.id],
        }));
        addToast(`已成功報名「${selectedActivity.title}」`, 'success');
      })
      .catch((err: any) => {
        addToast(err.message || '報名失敗', 'error');
      });

    setIsRegistrationOpen(false);
  };

  const handleCancelRegistration = (activityId: string) => {
    if (!requireAuth()) return;
    const activity = activities.find(a => a.id === activityId);

    apiCancelRegistration(activityId)
      .then(() => {
        setMyActivityIds(prev => prev.filter(id => id !== activityId));
        setUser(prev => ({
          ...prev,
          registeredActivityIds: prev.registeredActivityIds.filter(id => id !== activityId),
        }));
        if (activity) addToast(`已取消「${activity.title}」的報名`, 'info');
      })
      .catch((err: any) => {
        addToast(err.message || '取消報名失敗', 'error');
      });
  };

  // ── Club ──────────────────────────────────────────────────────────
  const handleJoinClub = (clubId: string) => {
    if (!requireAuth()) return;
    const club = clubs.find(c => c.id === clubId);

    apiJoinClub(clubId)
      .then(({ membersCount }) => {
        setUser(prev => ({ ...prev, joinedClubIds: [...prev.joinedClubIds, clubId] }));
        setClubs(prev => prev.map(c => c.id === clubId ? { ...c, membersCount } : c));
        if (club) addToast(`已加入「${club.name}」`, 'success');
      })
      .catch((err: any) => {
        addToast(err.message || '加入社團失敗', 'error');
      });
  };

  const handleLeaveClub = (clubId: string) => {
    if (!requireAuth()) return;
    const club = clubs.find(c => c.id === clubId);

    apiLeaveClub(clubId)
      .then(({ membersCount }) => {
        setUser(prev => ({ ...prev, joinedClubIds: prev.joinedClubIds.filter(id => id !== clubId) }));
        setClubs(prev => prev.map(c => c.id === clubId ? { ...c, membersCount } : c));
        if (club) addToast(`已退出「${club.name}」`, 'info');
      })
      .catch((err: any) => {
        addToast(err.message || '退出社團失敗', 'error');
      });
  };

  // ── Notifications ─────────────────────────────────────────────────
  const handleMarkAllRead = () => {
    if (!isLoggedIn) return;
    apiMarkAllNotificationsRead()
      .then(() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true }))))
      .catch(() => {});
  };

  const handleNotificationClick = (id: string) => {
    const notification = notifications.find(n => n.id === id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    if (isLoggedIn) {
      apiMarkNotificationRead(id).catch(() => {});
    }
    if (!notification?.linkId) return;

    if (notification.type === NotificationType.ACTIVITY) {
      const activity = activities.find(a => a.id === notification.linkId);
      if (activity) handleActivityClick(activity);
    } else if (notification.type === NotificationType.INVITE) {
      handleClubClick(notification.linkId);
    } else if (notification.type === NotificationType.INTERACTION) {
      // linkId for INTERACTION is a clubId
      if (notification.linkId) handleClubClick(notification.linkId);
    }
  };

  // ── Create ────────────────────────────────────────────────────────
  const handleCreatePost = (content: string) => {
    if (!requireAuth()) return;
    addToast('貼文發布成功', 'success');
  };

  const handleCreateActivity = async (activityData: any): Promise<void> => {
    if (!requireAuth()) throw new Error('unauthenticated');

    try {
      const newActivity = await apiCreateActivity(activityData);
      setActivities(prev => [newActivity, ...prev]);
      addToast('活動建立成功！', 'success');
    } catch (err: any) {
      if (err.message !== 'unauthenticated') {
        addToast(err.message || '建立活動失敗', 'error');
      }
      throw err;
    }
  };

  const handleUpdateProfile = async (data: { name?: string; bio?: string; phone?: string }) => {
    const updated = await apiUpdateProfile(data);
    setUser(prev => ({ ...prev, name: updated.name, avatar: updated.avatar }));
    addToast('個人資料已更新', 'success');
  };

  const handleCreateClub = async (clubData: any): Promise<void> => {
    if (!requireAuth()) throw new Error('unauthenticated');

    try {
      const newClub = await apiCreateClub(clubData);
      setClubs(prev => [newClub, ...prev]);
      setUser(prev => ({
        ...prev,
        joinedClubIds: [...prev.joinedClubIds, newClub.id],
        managedClubIds: [...prev.managedClubIds, newClub.id],
        isClubAdmin: true,
      }));
      addToast('社團建立成功！', 'success');
    } catch (err: any) {
      if (err.message !== 'unauthenticated') {
        addToast(err.message || '建立社團失敗', 'error');
      }
      throw err;
    }
  };

  return (
    <AppContext.Provider value={{
      activities, clubs, user, notifications, myActivityIds,
      activitiesLoading, clubsLoading,
      isLoggedIn, isAuthModalOpen, setIsAuthModalOpen,
      handleLogin, handleLogout, handleRegister,
      toasts, addToast,
      darkMode, setDarkMode,
      selectedActivity, setSelectedActivity,
      isRegistrationOpen, setIsRegistrationOpen,
      isSettingsOpen, setIsSettingsOpen,
      isFilterOpen, setIsFilterOpen,
      advancedFilters, setAdvancedFilters,
      isMapOpen, setIsMapOpen,
      isCategoryOpen, setIsCategoryOpen,
      homeLocations, homeMainCategories, homeSubCategories,
      setHomeMainCategories, setHomeSubCategories,
      toggleHomeLocation, toggleHomeMainCategory, toggleHomeSubCategory,
      handleActivityClick, handleClubClick,
      handleRegistrationConfirm, handleCancelRegistration,
      handleJoinClub, handleLeaveClub,
      handleMarkAllRead, handleNotificationClick,
      handleCreatePost, handleCreateActivity, handleCreateClub, handleUpdateProfile,
    }}>
      {children}
    </AppContext.Provider>
  );
};
