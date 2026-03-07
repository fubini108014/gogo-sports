
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