
export interface FilterState {
  cities: string[];
  date: string;
  minPrice: string;
  maxPrice: string;
  levels: string[];
  isNearlyFull: boolean;
}

export const DEFAULT_FILTER_STATE: FilterState = {
  cities: ['全台灣'],
  date: '',
  minPrice: '',
  maxPrice: '',
  levels: [],
  isNearlyFull: false,
};

export enum RegistrationMode {
  LIMITED = 'LIMITED', // Badminton, Basketball (Fixed spots)
  OPEN = 'OPEN',       // Hiking, Running (Flexible)
}

export enum ActivityStatus {
  OPEN = 'OPEN',
  FULL = 'FULL',
  CANCELLED = 'CANCELLED',
  ENDED = 'ENDED',
}

export enum Level {
  BEGINNER = '新手友善',
  INTERMEDIATE = '中階',
  ADVANCED = '高階',
  PRO = '專業',
}

export enum PostType {
  ANNOUNCEMENT = '公告',
  SHARE = '閒聊',
  PHOTO = '相簿',
}

export enum NotificationType {
  SYSTEM = 'SYSTEM',
  ACTIVITY = 'ACTIVITY',
  INTERACTION = 'INTERACTION',
  INVITE = 'INVITE',
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  time: string;
  isRead: boolean;
  linkId?: string; // ID to navigate to (Activity ID, Club ID, etc.)
}

export interface Club {
  id: string;
  name: string;
  logo: string;
  rating: number;
  membersCount: number;
  description: string;
  tags: string[];
}

export interface Activity {
  id: string;
  clubId: string;
  title: string;
  date: string;
  time: string;
  location: string;
  price: number;
  mode: RegistrationMode;
  status: ActivityStatus;
  
  // For Limited Mode
  maxParticipants?: number;
  currentInternalCount?: number; // Reserved via Line/FB
  currentAppCount: number;
  
  // For Open Mode
  groups?: string[]; // e.g. ["5分速", "6分速", "快樂組"]
  
  level: Level;
  image: string;
  description: string;
  tags: string[];
  lat?: number;
  lng?: number;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  isClubAdmin: boolean;
  registeredActivityIds: string[];
  joinedClubIds: string[];
  managedClubIds: string[];
}

// ── Explore Tags ──────────────────────────────────────────────────

export interface ExploreTagFilters {
  searchTerm?: string;
  cities?: string[];
  mainCategories?: string[];
  subCategories?: string[];
  // Legacy (system tags only)
  isNearlyFull?: boolean;
  levels?: string[];
  maxPrice?: number;
  minPrice?: number;
}

export type ExploreColorKey = 'orange' | 'green' | 'blue' | 'indigo' | 'rose' | 'purple' | 'teal' | 'yellow';

export const EXPLORE_COLOR_MAP: Record<ExploreColorKey, { card: string; dot: string }> = {
  orange: { card: 'text-orange-600 bg-orange-50 border-orange-100 dark:bg-orange-950/20 dark:border-orange-900/50 dark:text-orange-400', dot: 'bg-orange-400' },
  green:  { card: 'text-green-600 bg-green-50 border-green-100 dark:bg-green-950/20 dark:border-green-900/50 dark:text-green-400',   dot: 'bg-green-400' },
  blue:   { card: 'text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/50 dark:text-blue-400',         dot: 'bg-blue-400' },
  indigo: { card: 'text-indigo-600 bg-indigo-50 border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/50 dark:text-indigo-400', dot: 'bg-indigo-400' },
  rose:   { card: 'text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400',         dot: 'bg-rose-400' },
  purple: { card: 'text-purple-600 bg-purple-50 border-purple-100 dark:bg-purple-950/20 dark:border-purple-900/50 dark:text-purple-400', dot: 'bg-purple-400' },
  teal:   { card: 'text-teal-600 bg-teal-50 border-teal-100 dark:bg-teal-950/20 dark:border-teal-900/50 dark:text-teal-400',         dot: 'bg-teal-400' },
  yellow: { card: 'text-yellow-600 bg-yellow-50 border-yellow-100 dark:bg-yellow-950/20 dark:border-yellow-900/50 dark:text-yellow-400', dot: 'bg-yellow-400' },
};

export interface ExploreTag {
  id: string;
  label: string;
  icon: string;
  colorKey: ExploreColorKey;
  filters: ExploreTagFilters;
  isSystem: boolean;
  enabled: boolean;
}

export const DEFAULT_EXPLORE_TAGS: ExploreTag[] = [
  { id: 'sys_nearlyfull', label: '即將額滿', icon: '🔥', colorKey: 'orange', filters: { isNearlyFull: true },              isSystem: true, enabled: true  },
  { id: 'sys_beginner',   label: '新手友善', icon: '🔰', colorKey: 'green',  filters: { levels: ['新手友善'] },             isSystem: true, enabled: true  },
  { id: 'sys_budget',     label: '百元有找', icon: '💰', colorKey: 'blue',   filters: { maxPrice: 100 },                    isSystem: true, enabled: true  },
  { id: 'sys_afterwork',  label: '下班運動', icon: '🌙', colorKey: 'indigo', filters: { searchTerm: '下班' },               isSystem: true, enabled: true  },
  { id: 'sys_weekend',    label: '週末限定', icon: '📅', colorKey: 'rose',   filters: { searchTerm: '週末' },               isSystem: true, enabled: true  },
  { id: 'sys_free',       label: '免費活動', icon: '🆓', colorKey: 'teal',   filters: { maxPrice: 0 },                      isSystem: true, enabled: false },
  { id: 'sys_pro',        label: '高手切磋', icon: '🏆', colorKey: 'purple', filters: { levels: ['高階', '專業'] },          isSystem: true, enabled: false },
];

export interface CommentItem {
  id: string;
  postId: string;
  parentId?: string | null;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  createdAt: string;
  replies?: CommentItem[];
}

export interface ClubMember {
  id: string;
  name: string;
  avatar: string;
  email: string;
  joinedAt: string;
}

export interface Post {
  id: string;
  clubId: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    isAdmin: boolean;
  };
  type: PostType;
  content: string;
  images?: string[];
  createdAt: string;
  likes: number;
  comments: number;
}