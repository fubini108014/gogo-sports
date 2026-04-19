import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, MoreVertical, Image, Smile, CornerUpLeft, X, Users } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { apiGetMessages, apiSendMessage, apiGetConversations, ChatMessage } from '../services/api';
import LockedPage from '../components/ui/LockedPage';

const FALLBACK_AVATAR = 'https://picsum.photos/id/64/100/100';

const ConversationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAppContext();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [sending, setSending] = useState(false);
  const [chatName, setChatName] = useState('');
  const [chatAvatar, setChatAvatar] = useState<string | null>(null);
  const [isGroup, setIsGroup] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!user) return;
    if (!id) return;
    loadInitial();
    loadConversationMeta();
  }, [user, id]);

  const loadConversationMeta = useCallback(async () => {
    if (!id) return;
    try {
      const convs = await apiGetConversations();
      const conv = convs.find(c => c.id === id);
      if (conv) {
        setChatName(conv.name);
        setChatAvatar(conv.avatar);
        setIsGroup(conv.isGroup);
      }
    } catch {}
  }, [id]);

  const loadInitial = useCallback(async () => {
    if (!id) return;
    try {
      const { data, hasMore: more } = await apiGetMessages(id);
      setMessages(data);
      setHasMore(more);
    } catch {
      // conversation not found or no access
    } finally {
      setLoading(false);
      loadedRef.current = true;
    }
  }, [id]);

  // Scroll to bottom on initial load and new messages
  useEffect(() => {
    if (!loading) {
      bottomRef.current?.scrollIntoView({ behavior: loadedRef.current ? 'smooth' : 'instant' });
    }
  }, [messages, loading]);

  // Poll for new messages every 5 s
  useEffect(() => {
    if (!user || !id) return;
    const interval = setInterval(async () => {
      try {
        const { data } = await apiGetMessages(id);
        setMessages(data);
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [user, id]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || sending || !id) return;
    setSending(true);

    // Optimistic insert
    const optimistic: ChatMessage = {
      id: `tmp-${Date.now()}`,
      conversationId: id,
      senderId: user!.id,
      content,
      createdAt: new Date().toISOString(),
      sender: { id: user!.id, name: user!.name, avatar: user!.avatar ?? null },
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            content: replyingTo.content,
            sender: { id: replyingTo.sender.id, name: replyingTo.sender.name },
          }
        : null,
    };

    setMessages(prev => [...prev, optimistic]);
    setInput('');
    setReplyingTo(null);

    try {
      const saved = await apiSendMessage(id, content, replyingTo?.id);
      // Replace optimistic with real message
      setMessages(prev => prev.map(m => m.id === optimistic.id ? saved : m));
    } catch {
      // Rollback optimistic
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      setInput(content);
    } finally {
      setSending(false);
    }
  };

  const isMe = (senderId: string) => senderId === user?.id;

  if (!user) {
    return <LockedPage title="登入後查看訊息" description="與活動夥伴、社團成員直接傳訊息" />;
  }

  if (!loading && messages.length === 0 && !chatName) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-400 dark:text-gray-500">
        找不到此對話
      </div>
    );
  }

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
          {chatAvatar ? (
            <img src={chatAvatar} alt={chatName} className="w-10 h-10 rounded-xl object-cover" loading="lazy" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              {isGroup ? <Users size={20} className="text-gray-500" /> : (
                <span className="text-lg font-bold text-gray-500">{chatName?.[0] ?? '?'}</span>
              )}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-gray-900 dark:text-white text-base truncate">{chatName || '載入中...'}</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {isGroup ? '群組對話' : '私人訊息'}
          </p>
        </div>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400 transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          // Skeleton
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`flex items-end gap-2 animate-pulse ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
              <div className={`h-10 rounded-2xl bg-gray-200 dark:bg-gray-700 ${i % 2 === 0 ? 'w-48' : 'w-32'}`} />
            </div>
          ))
        ) : (
          <>
            {hasMore && (
              <button
                className="w-full text-center text-xs text-primary py-2 hover:underline"
                onClick={async () => {
                  const oldest = messages[0]?.createdAt;
                  if (!oldest || !id) return;
                  const { data, hasMore: more } = await apiGetMessages(id, oldest);
                  setMessages(prev => [...data, ...prev]);
                  setHasMore(more);
                }}
              >
                載入更多訊息
              </button>
            )}
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
                      src={msg.sender.avatar ?? FALLBACK_AVATAR}
                      alt={msg.sender.name}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0 mb-1"
                      loading="lazy"
                    />
                  )}

                  <div className={`flex flex-col max-w-[72%] ${mine ? 'items-end' : 'items-start'}`}>
                    {/* Sender name in group */}
                    {isGroup && !mine && (
                      <span className="text-[11px] text-gray-400 dark:text-gray-500 px-1 mb-0.5 font-medium">
                        {msg.sender.name}
                      </span>
                    )}

                    {/* Reply preview */}
                    {msg.replyTo && (
                      <div className="flex items-start gap-1.5 bg-gray-200/60 dark:bg-gray-700/60 rounded-xl px-3 py-1.5 mb-1 border-l-2 border-primary max-w-full">
                        <CornerUpLeft size={12} className="text-primary mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-primary block">{msg.replyTo.sender.name}</span>
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
                      <button
                        onClick={() => { setReplyingTo(msg); inputRef.current?.focus(); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 hover:text-primary"
                        title="回覆"
                      >
                        <CornerUpLeft size={14} />
                      </button>
                    </div>

                    <span className="text-[10px] text-gray-400 dark:text-gray-500 px-1 mt-0.5">
                      {new Date(msg.createdAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 pb-safe">
        {/* Reply preview */}
        {replyingTo && (
          <div className="flex items-center gap-2 pt-2 pb-1 border-b border-gray-100 dark:border-gray-700 mb-2">
            <CornerUpLeft size={14} className="text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-bold text-primary">{replyingTo.sender.name}</span>
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
            disabled={!input.trim() || sending}
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
