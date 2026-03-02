import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ChevronLeft, Search, CheckCheck } from 'lucide-react';

const MOCK_CHATS = [
  { id: '1', name: '台北羽球狂熱團', lastMsg: 'Alex: 下週二場地已預約好了喔！', time: '14:20', unread: 3, avatar: 'https://picsum.photos/id/10/100/100', isGroup: true },
  { id: '2', name: 'Sarah Wu', lastMsg: '那明天 19:00 見！', time: '昨天', unread: 0, avatar: 'https://picsum.photos/id/65/100/100', isGroup: false },
  { id: '3', name: '山野行者 Hiking Club', lastMsg: 'David: 這次活動建議穿著防潑水衣物。', time: '昨天', unread: 0, avatar: 'https://picsum.photos/id/12/100/100', isGroup: true },
  { id: '4', name: '阿強', lastMsg: '可以幫忙帶個球嗎？', time: '週六', unread: 1, avatar: 'https://picsum.photos/id/64/100/100', isGroup: false },
];

const MessagesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in px-4 pt-6 pb-24 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-900 dark:text-white" />
          </button>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">我的訊息</h1>
        </div>
        <button className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400">
          <Search size={20} />
        </button>
      </div>

      {/* Chat List */}
      <div className="space-y-1">
        {MOCK_CHATS.map((chat) => (
          <div
            key={chat.id}
            className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white dark:hover:bg-gray-800 transition-all cursor-pointer group border border-transparent hover:border-gray-100 dark:hover:border-gray-700 hover:shadow-sm"
          >
            {/* Avatar */}
            <div className="relative">
              <img src={chat.avatar} alt={chat.name} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white dark:ring-gray-900 shadow-sm" />
              {chat.isGroup && (
                <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1 rounded-lg border-2 border-white dark:border-gray-900">
                  <Users size={10} />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
                  {chat.name}
                </h3>
                <span className="text-[10px] font-bold text-gray-400 uppercase">{chat.time}</span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate pr-4">
                  {chat.lastMsg}
                </p>
                {chat.unread > 0 ? (
                  <span className="bg-primary text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm">
                    {chat.unread}
                  </span>
                ) : (
                  <CheckCheck size={14} className="text-blue-400" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State Help */}
      <div className="mt-12 text-center">
        <p className="text-xs text-gray-400 font-medium">
          在活動或社團頁面點擊「聯絡」即可開始對話
        </p>
      </div>
    </div>
  );
};

// Re-using Users icon from lucide-react via import in actual usage
const Users = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export default MessagesPage;
