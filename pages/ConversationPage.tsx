import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, MoreVertical, Phone, Image, Smile, CornerUpLeft, X } from 'lucide-react';
import { MOCK_CHATS } from './MessagesPage';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  time: string;
  replyTo?: { id: string; senderName: string; content: string } | null;
}

// Mock message data per chat
const MOCK_MESSAGES: Record<string, Message[]> = {
  '1': [
    { id: 'm1', senderId: 'alex', senderName: 'Alex', senderAvatar: 'https://picsum.photos/id/11/100/100', content: '大家好，下週二 19:00 有空嗎？', time: '14:00' },
    { id: 'm2', senderId: 'jane', senderName: 'Jane', senderAvatar: 'https://picsum.photos/id/20/100/100', content: '我可以！', time: '14:05' },
    { id: 'm3', senderId: 'alex', senderName: 'Alex', senderAvatar: 'https://picsum.photos/id/11/100/100', content: '太好了，場地已預約好了喔！中正羽球館 3 號場', time: '14:10' },
    { id: 'm4', senderId: 'me', senderName: '我', senderAvatar: 'https://picsum.photos/id/64/100/100', content: '好的，我也會到！需要帶什麼嗎？', time: '14:15' },
    { id: 'm5', senderId: 'alex', senderName: 'Alex', senderAvatar: 'https://picsum.photos/id/11/100/100', content: '下週二場地已預約好了喔！', time: '14:20' },
  ],
  '2': [
    { id: 'm1', senderId: 'sarah', senderName: 'Sarah Wu', senderAvatar: 'https://picsum.photos/id/65/100/100', content: '明天有空一起去打羽球嗎？', time: '昨天 18:30' },
    { id: 'm2', senderId: 'me', senderName: '我', senderAvatar: 'https://picsum.photos/id/64/100/100', content: '可以啊，幾點？', time: '昨天 18:35' },
    { id: 'm3', senderId: 'sarah', senderName: 'Sarah Wu', senderAvatar: 'https://picsum.photos/id/65/100/100', content: '那明天 19:00 見！', time: '昨天 18:40' },
  ],
  '3': [
    { id: 'm1', senderId: 'david', senderName: 'David', senderAvatar: 'https://picsum.photos/id/30/100/100', content: '下週日的行程已確認，預計爬合歡山北峰路線', time: '昨天 10:00' },
    { id: 'm2', senderId: 'me', senderName: '我', senderAvatar: 'https://picsum.photos/id/64/100/100', content: '太期待了！天氣應該不錯', time: '昨天 10:10' },
    { id: 'm3', senderId: 'david', senderName: 'David', senderAvatar: 'https://picsum.photos/id/30/100/100', content: '這次活動建議穿著防潑水衣物。', time: '昨天 10:20' },
  ],
  '4': [
    { id: 'm1', senderId: 'qiang', senderName: '阿強', senderAvatar: 'https://picsum.photos/id/64/100/100', content: '嘿，你週六要去打球嗎？', time: '週六 09:00' },
    { id: 'm2', senderId: 'me', senderName: '我', senderAvatar: 'https://picsum.photos/id/64/100/100', content: '有打算，你呢？', time: '週六 09:05' },
    { id: 'm3', senderId: 'qiang', senderName: '阿強', senderAvatar: 'https://picsum.photos/id/64/100/100', content: '可以幫忙帶個球嗎？', time: '週六 09:10' },
  ],
};

const MY_ID = 'me';

const ConversationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const chat = MOCK_CHATS.find(c => c.id === id);

  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES[id ?? ''] ?? []);
  const [input, setInput] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!chat) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-400 dark:text-gray-500">
        找不到此對話
      </div>
    );
  }

  const handleSend = () => {
    const content = input.trim();
    if (!content) return;

    const newMsg: Message = {
      id: `m${Date.now()}`,
      senderId: MY_ID,
      senderName: '我',
      senderAvatar: 'https://picsum.photos/id/64/100/100',
      content,
      time: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
      replyTo: replyingTo
        ? { id: replyingTo.id, senderName: replyingTo.senderName, content: replyingTo.content }
        : null,
    };

    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setReplyingTo(null);
  };

  const handleReply = (msg: Message) => {
    setReplyingTo(msg);
    inputRef.current?.focus();
    setSwipedId(null);
  };

  const isMe = (senderId: string) => senderId === MY_ID;

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shadow-sm flex-shrink-0 z-10">
        <button
          onClick={() => navigate('/messages')}
          className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <ChevronLeft size={24} className="text-gray-900 dark:text-white" />
        </button>
        <div className="relative flex-shrink-0">
          <img src={chat.avatar} alt={chat.name} className="w-10 h-10 rounded-xl object-cover" />
          {/* Online indicator for DMs */}
          {!chat.isGroup && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-800" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-gray-900 dark:text-white text-base truncate">{chat.name}</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {chat.isGroup ? '群組對話' : '線上中'}
          </p>
        </div>
        <div className="flex gap-1">
          {!chat.isGroup && (
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400 transition-colors">
              <Phone size={20} />
            </button>
          )}
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400 transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => {
          const mine = isMe(msg.senderId);
          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 group ${mine ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar (others only) */}
              {!mine && (
                <img
                  src={msg.senderAvatar}
                  alt={msg.senderName}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 mb-1"
                />
              )}

              <div className={`flex flex-col max-w-[72%] ${mine ? 'items-end' : 'items-start'}`}>
                {/* Sender name in group */}
                {chat.isGroup && !mine && (
                  <span className="text-[11px] text-gray-400 dark:text-gray-500 px-1 mb-0.5 font-medium">
                    {msg.senderName}
                  </span>
                )}

                {/* Reply preview */}
                {msg.replyTo && (
                  <div className={`flex items-start gap-1.5 bg-gray-200/60 dark:bg-gray-700/60 rounded-xl px-3 py-1.5 mb-1 border-l-2 border-primary max-w-full`}>
                    <CornerUpLeft size={12} className="text-primary mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-primary block">{msg.replyTo.senderName}</span>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{msg.replyTo.content}</p>
                    </div>
                  </div>
                )}

                {/* Bubble + reply button */}
                <div className={`flex items-center gap-1.5 ${mine ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                      mine
                        ? 'bg-primary text-white rounded-br-sm'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm rounded-bl-sm border border-gray-100 dark:border-gray-700'
                    }`}
                  >
                    {msg.content}
                  </div>
                  {/* Reply swipe button */}
                  <button
                    onClick={() => handleReply(msg)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 hover:text-primary"
                    title="回覆"
                  >
                    <CornerUpLeft size={14} />
                  </button>
                </div>

                <span className="text-[10px] text-gray-400 dark:text-gray-500 px-1 mt-0.5">{msg.time}</span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 pb-safe">
        {/* Reply preview */}
        {replyingTo && (
          <div className="flex items-center gap-2 pt-2 pb-1 border-b border-gray-100 dark:border-gray-700 mb-2">
            <CornerUpLeft size={14} className="text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-bold text-primary">{replyingTo.senderName}</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{replyingTo.content}</p>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 flex-shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        )}
        <div className="flex items-center gap-2 py-3">
          <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-primary transition-colors flex-shrink-0">
            <Image size={22} />
          </button>
          <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-primary transition-colors flex-shrink-0">
            <Smile size={22} />
          </button>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="輸入訊息..."
            className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2.5 bg-primary text-white rounded-full hover:bg-orange-600 transition-colors disabled:opacity-40 flex-shrink-0 shadow-sm shadow-orange-200"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversationPage;
