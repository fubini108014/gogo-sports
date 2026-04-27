import {
  Activity, Club, Notification, NotificationType,
  Level, RegistrationMode, ActivityStatus, PostType, User, Post, CommentItem, ClubMember,
  ExploreTag, calcClubMemberRank,
} from '../types';

const API_BASE = 'http://localhost:3000/v1';

// ── Token helpers ──────────────────────────────────────────────────
export const getToken = () => localStorage.getItem('gogo_access_token');
export const getRefreshToken = () => localStorage.getItem('gogo_refresh_token');
export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem('gogo_access_token', access);
  localStorage.setItem('gogo_refresh_token', refresh);
};
export const clearTokens = () => {
  localStorage.removeItem('gogo_access_token');
  localStorage.removeItem('gogo_refresh_token');
};

// ── Base fetch (with auto token refresh on 401) ─────────────────────
async function apiFetch<T>(path: string, options: RequestInit = {}, _isRetry = false): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  if (res.status === 204) return undefined as T;

  // Auto-refresh on 401 (only once)
  if (res.status === 401 && !_isRetry) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (refreshRes.ok) {
          const { accessToken } = await refreshRes.json();
          setTokens(accessToken, refreshToken);
          return apiFetch<T>(path, options, true);
        }
      } catch {}
      clearTokens();
    }
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message ?? '請求失敗');
  }
  return data;
}

// ── Mappers ────────────────────────────────────────────────────────
const LEVEL_MAP: Record<string, Level> = {
  BEGINNER: Level.BEGINNER,
  INTERMEDIATE: Level.INTERMEDIATE,
  ADVANCED: Level.ADVANCED,
  PRO: Level.PRO,
};

// Reverse: Chinese display value → API English key
const LEVEL_REVERSE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(LEVEL_MAP).map(([k, v]) => [v, k])
);

const POST_TYPE_MAP: Record<string, PostType> = {
  ANNOUNCEMENT: PostType.ANNOUNCEMENT,
  SHARE: PostType.SHARE,
  PHOTO: PostType.PHOTO,
};

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '剛剛';
  if (mins < 60) return `${mins}分鐘前`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}小時前`;
  const days = Math.floor(hrs / 24);
  return `${days}天前`;
}

function mapActivity(a: any): Activity {
  return {
    id: a.id,
    clubId: a.clubId,
    hostId: a.hostId ?? '',
    approvalMode: (a.approvalMode ?? 'AUTO') as 'AUTO' | 'MANUAL',
    title: a.title,
    date: typeof a.date === 'string' ? a.date.split('T')[0] : a.date,
    time: a.time,
    location: a.location,
    price: a.price,
    mode: a.mode as RegistrationMode,
    status: a.status as ActivityStatus,
    maxParticipants: a.maxParticipants ?? undefined,
    currentInternalCount: a.currentInternalCount ?? 0,
    currentAppCount: a.currentAppCount ?? 0,
    groups: a.groups?.length ? a.groups : undefined,
    level: LEVEL_MAP[a.level] ?? Level.BEGINNER,
    image: a.image ?? 'https://picsum.photos/id/1/600/400',
    description: a.description,
    tags: a.tags ?? [],
    lat: a.lat ?? undefined,
    lng: a.lng ?? undefined,
    myRating: a.myRating ?? null,
    canRate: a.canRate ?? false,
  };
}

function mapClub(c: any): Club {
  return {
    id: c.id,
    name: c.name,
    logo: c.logo ?? 'https://picsum.photos/id/1/200/200',
    rating: c.rating ?? 0,
    membersCount: c.membersCount ?? 0,
    description: c.description,
    tags: c.tags ?? [],
  };
}

function mapNotification(n: any): Notification {
  return {
    id: n.id,
    type: n.type as NotificationType,
    title: n.title,
    content: n.content,
    time: relativeTime(n.createdAt),
    isRead: n.isRead,
    linkId: n.linkId ?? undefined,
  };
}

// Deterministic mock activityCount from an id string (avoids re-randomising on each render)
function mockActivityCount(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % 28; // 0–27, covers all four tiers
}

function mapPost(p: any): Post {
  const activityCount = p.author.activityCount ?? mockActivityCount(p.author.id);
  return {
    id: p.id,
    clubId: p.clubId,
    author: {
      id: p.author.id,
      name: p.author.name,
      avatar: p.author.avatar ?? 'https://picsum.photos/id/64/200/200',
      isAdmin: p.author.isAdmin ?? false,
      rank: p.author.rank ?? calcClubMemberRank(activityCount),
    },
    type: POST_TYPE_MAP[p.type] ?? PostType.SHARE,
    content: p.content,
    images: p.images?.length ? p.images : undefined,
    createdAt: p.createdAt,
    likes: p.likes ?? 0,
    comments: p.comments ?? 0,
  };
}

export function mapUser(u: any): User {
  return {
    id: u.id,
    name: u.name,
    avatar: u.avatar ?? 'https://picsum.photos/id/64/200/200',
    bio: u.bio ?? undefined,
    phone: u.phone ?? undefined,
    isClubAdmin: u.isClubAdmin ?? false,
    registeredActivityIds: u.registeredActivityIds ?? [],
    joinedClubIds: u.joinedClubIds ?? [],
    managedClubIds: u.managedClubIds ?? [],
  };
}

// ── Auth ──────────────────────────────────────────────────────────
async function apiFetchAuth(path: string, body: object): Promise<User> {
  const data = await apiFetch<any>(path, { method: 'POST', body: JSON.stringify(body) });
  setTokens(data.accessToken, data.refreshToken);
  return mapUser(data.user);
}

export async function apiLogin(email: string, password: string): Promise<User> {
  return apiFetchAuth('/auth/login', { email, password });
}

export async function apiRegister(
  name: string, email: string, password: string, phone?: string
): Promise<User> {
  return apiFetchAuth('/auth/register', { name, email, password, ...(phone ? { phone } : {}) });
}

export async function apiLogout(): Promise<void> {
  const refreshToken = getRefreshToken();
  await apiFetch('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  }).catch(() => {});
  clearTokens();
}

export async function apiLineLogin(idToken: string): Promise<User> {
  return apiFetchAuth('/auth/line', { idToken });
}

// ── User ──────────────────────────────────────────────────────────
export async function apiGetMe(): Promise<User> {
  const data = await apiFetch<any>('/users/me');
  return mapUser(data);
}

// ── Activities ────────────────────────────────────────────────────
export async function apiGetActivities(
  params?: Record<string, string>
): Promise<{ data: Activity[]; total: number }> {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  const res = await apiFetch<any>(`/activities${qs}`);
  return {
    data: res.data.map(mapActivity),
    total: res.pagination.total,
  };
}

export async function apiGetActivity(id: string): Promise<Activity & { isRegistered: boolean }> {
  const data = await apiFetch<any>(`/activities/${id}`);
  return { ...mapActivity(data), isRegistered: data.isRegistered ?? false };
}

export async function apiRegisterActivity(id: string, group?: string): Promise<void> {
  await apiFetch(`/activities/${id}/register`, {
    method: 'POST',
    body: JSON.stringify({ group: group || null }),
  });
}

export async function apiCancelRegistration(id: string): Promise<void> {
  await apiFetch(`/activities/${id}/register`, { method: 'DELETE' });
}

export async function apiCreateActivity(data: any): Promise<Activity> {
  const payload = {
    ...data,
    level: LEVEL_REVERSE_MAP[data.level] ?? data.level,
  };
  const res = await apiFetch<any>('/activities', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return mapActivity(res);
}

// ── Clubs ─────────────────────────────────────────────────────────
export async function apiGetClubs(
  params?: Record<string, string>
): Promise<{ data: Club[]; total: number }> {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  const res = await apiFetch<any>(`/clubs${qs}`);
  return {
    data: res.data.map(mapClub),
    total: res.pagination.total,
  };
}

export async function apiGetClub(
  id: string
): Promise<Club & { isJoined: boolean; isAdmin: boolean }> {
  const data = await apiFetch<any>(`/clubs/${id}`);
  return { ...mapClub(data), isJoined: data.isJoined ?? false, isAdmin: data.isAdmin ?? false };
}

export async function apiJoinClub(id: string): Promise<{ membersCount: number }> {
  return apiFetch(`/clubs/${id}/join`, { method: 'POST' });
}

export async function apiLeaveClub(id: string): Promise<{ membersCount: number }> {
  return apiFetch(`/clubs/${id}/join`, { method: 'DELETE' });
}

export async function apiCreateClub(data: any): Promise<Club & { isAdmin: boolean }> {
  const res = await apiFetch<any>('/clubs', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return { ...mapClub(res), isAdmin: true };
}

export async function apiGetClubActivities(clubId: string): Promise<Activity[]> {
  const res = await apiFetch<any>(`/clubs/${clubId}/activities`);
  return res.data.map(mapActivity);
}

// ── Posts ─────────────────────────────────────────────────────────
export async function apiGetClubPosts(
  clubId: string,
  params?: Record<string, string>
): Promise<{ data: (Post & { isLiked: boolean })[] }> {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  const res = await apiFetch<any>(`/clubs/${clubId}/posts${qs}`);
  return {
    data: res.data.map((p: any) => ({ ...mapPost(p), isLiked: p.isLiked ?? false })),
  };
}

export async function apiCreatePost(
  clubId: string,
  type: string,
  content: string,
  images?: string[]
): Promise<Post & { isLiked: boolean }> {
  const res = await apiFetch<any>(`/clubs/${clubId}/posts`, {
    method: 'POST',
    body: JSON.stringify({ type, content, images: images ?? [] }),
  });
  return { ...mapPost(res), isLiked: false };
}

export async function apiDeletePost(clubId: string, postId: string): Promise<void> {
  await apiFetch(`/clubs/${clubId}/posts/${postId}`, { method: 'DELETE' });
}

export async function apiUploadFile(file: File): Promise<string> {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message ?? '上傳失敗');
  return data.url as string;
}

export async function apiUpdatePost(clubId: string, postId: string, content: string): Promise<Post> {
  const res = await apiFetch<any>(`/clubs/${clubId}/posts/${postId}`, {
    method: 'PATCH',
    body: JSON.stringify({ content }),
  });
  return mapPost(res);
}

export async function apiTogglePostLike(
  clubId: string,
  postId: string
): Promise<{ isLiked: boolean; likes: number }> {
  return apiFetch(`/clubs/${clubId}/posts/${postId}/like`, { method: 'POST' });
}

// ── Comments ──────────────────────────────────────────────────────
function mapComment(c: any): CommentItem {
  return {
    id: c.id,
    postId: c.postId,
    parentId: c.parentId ?? null,
    author: {
      id: c.author.id,
      name: c.author.name,
      avatar: c.author.avatar ?? 'https://picsum.photos/id/64/200/200',
    },
    content: c.content,
    createdAt: c.createdAt,
    replies: c.replies ? c.replies.map(mapComment) : undefined,
  };
}

export async function apiGetPostComments(
  clubId: string,
  postId: string,
): Promise<CommentItem[]> {
  const res = await apiFetch<any>(`/clubs/${clubId}/posts/${postId}/comments?limit=50`);
  return res.data.map(mapComment);
}

export async function apiCreateComment(
  clubId: string,
  postId: string,
  content: string,
  parentId?: string,
): Promise<CommentItem> {
  const res = await apiFetch<any>(`/clubs/${clubId}/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content, ...(parentId ? { parentId } : {}) }),
  });
  return mapComment(res);
}

export async function apiDeleteComment(
  clubId: string,
  postId: string,
  commentId: string,
): Promise<void> {
  await apiFetch(`/clubs/${clubId}/posts/${postId}/comments/${commentId}`, { method: 'DELETE' });
}

// ── Club management ────────────────────────────────────────────────
export async function apiUpdateClub(id: string, data: {
  name?: string;
  description?: string;
  tags?: string[];
  city?: string;
  logo?: string;
}): Promise<Club> {
  const res = await apiFetch<any>(`/clubs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return mapClub(res);
}

export async function apiGetClubMembers(clubId: string): Promise<ClubMember[]> {
  const res = await apiFetch<any>(`/clubs/${clubId}/members`);
  return (res.data as any[]).map((m) => {
    const activityCount = m.activityCount ?? mockActivityCount(m.id);
    return {
      ...m,
      activityCount,
      rank: m.rank ?? calcClubMemberRank(activityCount),
    } as ClubMember;
  });
}

export async function apiRemoveClubMember(clubId: string, memberId: string): Promise<void> {
  await apiFetch(`/clubs/${clubId}/members/${memberId}`, { method: 'DELETE' });
}

export interface ClubInviteLink {
  id: string;
  clubId: string;
  token: string;
  expiresAt: string;
  requireApproval: boolean;
  createdAt: string;
}

export async function apiCreateInviteLink(
  clubId: string,
  expiresInDays = 7
): Promise<ClubInviteLink> {
  return apiFetch(`/clubs/${clubId}/invite-links`, {
    method: 'POST',
    body: JSON.stringify({ expiresInDays }),
  });
}

export async function apiGetInviteLinks(clubId: string): Promise<ClubInviteLink[]> {
  const res = await apiFetch<{ data: ClubInviteLink[] }>(`/clubs/${clubId}/invite-links`);
  return res.data;
}

export async function apiJoinByToken(
  token: string
): Promise<{ message: string; club: Club & { membersCount: number } }> {
  const res = await apiFetch<any>(`/clubs/join-by-token/${token}`, { method: 'POST' });
  return { message: res.message, club: mapClub(res.club) as Club & { membersCount: number } };
}

// ── Notifications ─────────────────────────────────────────────────
export async function apiGetNotifications(): Promise<{
  data: Notification[];
  unreadCount: number;
}> {
  const res = await apiFetch<any>('/notifications');
  return {
    data: res.data.map(mapNotification),
    unreadCount: res.unreadCount ?? 0,
  };
}

export async function apiMarkNotificationRead(id: string): Promise<void> {
  await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
}

export async function apiMarkAllNotificationsRead(): Promise<void> {
  await apiFetch('/notifications/read-all', { method: 'PATCH' });
}

// ── Level reverse map (Chinese display → API English) ──────────────
export const LEVEL_REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(LEVEL_MAP).map(([k, v]) => [v, k])
);

// ── User profile ───────────────────────────────────────────────────
export async function apiUpdateProfile(data: {
  name?: string;
  bio?: string;
  phone?: string;
}): Promise<User> {
  const u = await apiFetch<any>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return mapUser(u);
}

// ── Explore Tags (User Preferences) ───────────────────────────────
export async function apiGetExploreTags(): Promise<ExploreTag[] | null> {
  try {
    return await apiFetch<ExploreTag[]>('/users/me/explore-tags');
  } catch {
    return null;
  }
}

export async function apiSaveExploreTags(tags: ExploreTag[]): Promise<void> {
  await apiFetch('/users/me/explore-tags', {
    method: 'PUT',
    body: JSON.stringify(tags),
  });
}

// ── Activity Suggestions ───────────────────────────────────────────
export interface ActivitySuggestion {
  type: 'title' | 'location' | 'tag';
  value: string;
}

export async function apiGetActivitySuggestions(q: string): Promise<ActivitySuggestion[]> {
  if (!q.trim()) return [];
  try {
    const res = await apiFetch<{ data: ActivitySuggestion[] }>(
      `/activities/suggestions?q=${encodeURIComponent(q)}`
    );
    return res.data;
  } catch {
    return [];
  }
}

// ── Activity management ────────────────────────────────────────────
export async function apiDeleteActivity(id: string): Promise<void> {
  await apiFetch(`/activities/${id}`, { method: 'DELETE' });
}

export interface ParticipantRegistration {
  id: string;           // registration id
  userId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITLISTED' | 'CANCELLED' | 'ABSENT';
  group?: string;
  transport?: string;
  createdAt: string;
  user: { id: string; name: string; avatar: string | null };
}

export async function apiGetActivityParticipants(id: string): Promise<ParticipantRegistration[]> {
  const data = await apiFetch<{ data: ParticipantRegistration[] }>(`/activities/${id}/participants`);
  return data.data;
}

export async function apiReviewRegistration(
  activityId: string,
  regId: string,
  status: 'APPROVED' | 'REJECTED' | 'WAITLISTED'
): Promise<void> {
  await apiFetch(`/activities/${activityId}/registrations/${regId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function apiRateActivity(
  activityId: string,
  score: number,
  comment?: string
): Promise<void> {
  await apiFetch(`/activities/${activityId}/rate`, {
    method: 'POST',
    body: JSON.stringify({ score, comment }),
  });
}

export async function apiBroadcastActivity(
  activityId: string,
  message: string
): Promise<{ sent: number }> {
  return apiFetch(`/activities/${activityId}/broadcast`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}
