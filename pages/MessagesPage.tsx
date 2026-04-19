import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Users, ChevronLeft, Search, CheckCheck, Edit, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import LockedPage from '../components/ui/LockedPage';
import {
  apiGetConversations,
  apiGetMe,
  apiStartConversation,
  ConversationSummary,
} from '../services/api';

// ── Types re-exported for ConversationPage ─────────────────────────
export interface Chat {
  id: string;
  name: string;
  lastMsg: string;
  time: string;
  unread: number;
  avatar: string;
  isGroup: boolean;
}

type FilterType = 'all' | 'personal' | 'group';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'personal', label: '個人' },
  { key: 'group', label: '群組' },
];

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '剛剛';
  if (mins < 60) return `${mins}分鐘前`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}小時前`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}天前`;
  return new Date(iso).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' });
}

function mapConversation(c: ConversationSummary): Chat {
  const lastMsgText = c.lastMsg
    ? (c.isGroup ? `${c.lastMsg.senderName}: ${c.lastMsg.content}` : c.lastMsg.content)
    : '尚無訊息';
  return {
    id: c.id,
    name: c.name,
    lastMsg: lastMsgText,
    time: c.lastMsg ? relativeTime(c.lastMsg.createdAt) : '',
    unread: c.unread,
    avatar: c.avatar ?? 'https://picsum.photos/id/10/100/100',
    isGroup: c.isGroup,
  };
}

// ── Contact search (search other users) ───────────────────────────
interface ContactResult {
  id: string;
  name: string;
  avatar: string;
}

const MessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppContext();

  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showNewChat, setShowNewChat] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [contacts, setContacts] = useState<ContactResult[]>([]);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadConversations();
  }, [user]);

  const loadConversations = useCallback(async () => {
    try {
      const data = await apiGetConversations();
      setChats(data.map(mapConversation));
    } catch {
      // keep empty
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll every 10 s for new messages
  useEffect(() => {
    if (!user) return;
    const id = setInterval(loadConversations, 10000);
    return () => clearInterval(id);
  }, [user, loadConversations]);

  // Search contacts via /users?search= (basic approach)
  useEffect(() => {
    if (!contactSearch.trim()) { setContacts([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/v1/users?search=${encodeURIComponent(contactSearch)}&limit=10`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('gogo_access_token')}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setContacts((data.data ?? []).filter((u: any) => u.id !== user?.id));
        }
      } catch {
        setContacts([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [contactSearch, user?.id]);

  const handleStartChat = async (contactId: string) => {
    if (startingChat) return;
    setStartingChat(true);
    try {
      const { id } = await apiStartConversation([contactId]);
      setShowNewChat(false);
      navigate(`/messages/${id}`);
    } catch {
      // ignore
    } finally {
      setStartingChat(false);
    }
  };

  const filtered = chats.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMsg.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || (filter === 'personal' ? !c.isGroup : c.isGroup);
    return matchSearch && matchFilter;
  });

  if (!user) {
    return <LockedPage title="登入後查看訊息" description="與活動夥伴、社團成員直接傳訊息" />;
  }

  return (
    <div className="animate-fade-in pb-24 max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 pt-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <ChevronLeft size={24} className="text-gray-900 dark:text-white" />
            </button>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">我的訊息</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSearch(v => !v)}
              className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Search size={20} />
            </button>
            <button
              onClick={() => { setShowNewChat(true); setContactSearch(''); setContacts([]); }}
              className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Edit size={20} />
            </button>
          </div>
        </div>
        {showSearch && (
          <input
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜尋對話..."
            className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all mb-3"
          />
        )}
        {/* Filter tabs */}
        <div className="flex gap-2">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                filter === f.key
                  ? 'bg-primary text-white shadow-sm shadow-orange-200'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {f.label}
              {f.key !== 'all' && (
                <span className="ml-1 text-[10px] opacity-70">
                  {chats.filter(c => f.key === 'personal' ? !c.isGroup : c.isGroup).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat List */}
      <div className="px-2 pt-2 space-y-0.5">
        {loading ? (
          // Skeleton
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
              <div className="w-14 h-14 rounded-2xl bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-2/3" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500 text-sm">
            {chats.length === 0 ? '還沒有任何對話，點擊右上角開始新對話' : '找不到相關對話'}
          </div>
        ) : (
          filtered.map((chat) => (
            <div
              key={chat.id}
              onClick={() => navigate(`/messages/${chat.id}`)}
              className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer group"
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <img src={chat.avatar} alt={chat.name} className="w-14 h-14 rounded-2xl object-cover shadow-sm" loading="lazy" />
                {chat.isGroup && (
                  <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1 rounded-lg border-2 border-white dark:border-gray-900">
                    <Users size={10} />
                  </div>
                )}
                {chat.unread > 0 && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white dark:border-gray-900" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <h3 className={`font-bold truncate group-hover:text-primary transition-colors ${chat.unread > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {chat.name}
                  </h3>
                  <span className={`text-[11px] whitespace-nowrap ml-2 ${chat.unread > 0 ? 'text-primary font-bold' : 'text-gray-400 dark:text-gray-500'}`}>
                    {chat.time}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className={`text-sm truncate pr-3 ${chat.unread > 0 ? 'text-gray-800 dark:text-gray-200 font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
                    {chat.lastMsg}
                  </p>
                  {chat.unread > 0 ? (
                    <span className="bg-primary text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center flex-shrink-0">
                      {chat.unread}
                    </span>
                  ) : (
                    <CheckCheck size={14} className="text-blue-400 flex-shrink-0" />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Conversation Modal */}
      {showNewChat && createPortal(
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowNewChat(false)} />
          <div className="relative bg-white dark:bg-gray-800 w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">新對話</h2>
              <button
                onClick={() => setShowNewChat(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 py-3 flex-shrink-0">
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-xl px-3 py-2">
                <Search size={16} className="text-gray-400 flex-shrink-0" />
                <input
                  autoFocus
                  value={contactSearch}
                  onChange={e => setContactSearch(e.target.value)}
                  placeholder="搜尋使用者..."
                  className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Contact List */}
            <div className="flex-1 overflow-y-auto px-3 pb-4">
              {!contactSearch.trim() ? (
                <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">輸入姓名搜尋使用者</p>
              ) : contacts.length === 0 ? (
                <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">找不到使用者</p>
              ) : (
                <div className="space-y-1">
                  {contacts.map(contact => (
                    <button
                      key={contact.id}
                      onClick={() => handleStartChat(contact.id)}
                      disabled={startingChat}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left disabled:opacity-60"
                    >
                      <img src={contact.avatar ?? 'https://picsum.photos/id/64/100/100'} alt={contact.name} className="w-11 h-11 rounded-xl object-cover flex-shrink-0" loading="lazy" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{contact.name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">個人</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default MessagesPage;
