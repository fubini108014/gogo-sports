import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Users, ChevronLeft, Search, CheckCheck, Edit, X } from 'lucide-react';

// Mock contacts for new conversation
const MOCK_CONTACTS = [
  { id: 'c1', name: 'Kevin Lin', avatar: 'https://picsum.photos/id/70/100/100', isGroup: false },
  { id: 'c2', name: '台北跑步聯盟', avatar: 'https://picsum.photos/id/15/100/100', isGroup: true },
  { id: 'c3', name: 'Wendy Chen', avatar: 'https://picsum.photos/id/46/100/100', isGroup: false },
  { id: 'c4', name: '週末籃球團', avatar: 'https://picsum.photos/id/22/100/100', isGroup: true },
  { id: 'c5', name: 'Jason Wu', avatar: 'https://picsum.photos/id/33/100/100', isGroup: false },
];

export interface Chat {
  id: string;
  name: string;
  lastMsg: string;
  time: string;
  unread: number;
  avatar: string;
  isGroup: boolean;
}

export const MOCK_CHATS: Chat[] = [
  { id: '1', name: '台北羽球狂熱團', lastMsg: 'Alex: 下週二場地已預約好了喔！', time: '14:20', unread: 3, avatar: 'https://picsum.photos/id/10/100/100', isGroup: true },
  { id: '2', name: 'Sarah Wu', lastMsg: '那明天 19:00 見！', time: '昨天', unread: 0, avatar: 'https://picsum.photos/id/65/100/100', isGroup: false },
  { id: '3', name: '山野行者 Hiking Club', lastMsg: 'David: 這次活動建議穿著防潑水衣物。', time: '昨天', unread: 0, avatar: 'https://picsum.photos/id/12/100/100', isGroup: true },
  { id: '4', name: '阿強', lastMsg: '可以幫忙帶個球嗎？', time: '週六', unread: 1, avatar: 'https://picsum.photos/id/64/100/100', isGroup: false },
];

type FilterType = 'all' | 'personal' | 'group';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'personal', label: '個人' },
  { key: 'group', label: '群組' },
];

const MessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showNewChat, setShowNewChat] = useState(false);
  const [contactSearch, setContactSearch] = useState('');

  const filteredContacts = MOCK_CONTACTS.filter(c =>
    c.name.toLowerCase().includes(contactSearch.toLowerCase())
  );

  const filtered = MOCK_CHATS.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMsg.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || (filter === 'personal' ? !c.isGroup : c.isGroup);
    return matchSearch && matchFilter;
  });

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
              onClick={() => { setShowNewChat(true); setContactSearch(''); }}
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
                  {MOCK_CHATS.filter(c => f.key === 'personal' ? !c.isGroup : c.isGroup).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat List */}
      <div className="px-2 pt-2 space-y-0.5">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500 text-sm">找不到相關對話</div>
        ) : (
          filtered.map((chat) => (
            <div
              key={chat.id}
              onClick={() => navigate(`/messages/${chat.id}`)}
              className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer group"
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <img src={chat.avatar} alt={chat.name} className="w-14 h-14 rounded-2xl object-cover shadow-sm" />
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
                  placeholder="搜尋聯絡人..."
                  className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Contact List */}
            <div className="flex-1 overflow-y-auto px-3 pb-4">
              {filteredContacts.length === 0 ? (
                <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">找不到聯絡人</p>
              ) : (
                <div className="space-y-1">
                  {filteredContacts.map(contact => (
                    <button
                      key={contact.id}
                      onClick={() => {
                        setShowNewChat(false);
                        navigate(`/messages/${contact.id}`);
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <div className="relative flex-shrink-0">
                        <img src={contact.avatar} alt={contact.name} className="w-11 h-11 rounded-xl object-cover" />
                        {contact.isGroup && (
                          <div className="absolute -bottom-0.5 -right-0.5 bg-primary text-white p-0.5 rounded-md border-2 border-white dark:border-gray-800">
                            <Users size={8} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{contact.name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{contact.isGroup ? '群組' : '個人'}</p>
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
