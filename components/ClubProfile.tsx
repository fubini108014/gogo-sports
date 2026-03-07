import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Club, Activity, Post, PostType, CommentItem } from '../types';
import { MapPin, Users, Star, Calendar as CalendarIcon, Image as ImageIcon, ChevronRight, PenSquare, Heart, MessageSquare, ArrowUpDown, ChevronLeft, MoreHorizontal, Send, X, CornerDownRight, AlertTriangle, Edit2 } from 'lucide-react';
import CreatePostModal from './CreatePostModal';
import ClubManageModal from './ClubManageModal';
import { useAppContext } from '../context/AppContext';
import { apiGetClubPosts, apiTogglePostLike, apiCreatePost, apiDeletePost, apiUpdatePost, apiGetPostComments, apiCreateComment, apiDeleteComment } from '../services/api';

interface ClubProfileProps {
  club: Club;
  activities: Activity[];
  onBack: () => void;
  onActivityClick: (activity: Activity) => void;
  joinedClubIds: string[];
  managedClubIds: string[];
  onJoinClub: (clubId: string) => void;
  onLeaveClub: (clubId: string) => void;
  onToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onClubUpdated?: (updated: Club) => void;
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '剛剛';
  if (mins < 60) return `${mins}分鐘前`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}小時前`;
  return `${Math.floor(hrs / 24)}天前`;
}

const ClubProfile: React.FC<ClubProfileProps> = ({ club, activities, onBack, onActivityClick, joinedClubIds, managedClubIds, onJoinClub, onLeaveClub, onToast, onClubUpdated }) => {
  const { user, isLoggedIn } = useAppContext();
  const [activeTab, setActiveTab] = useState<'feed' | 'activities' | 'album'>('feed');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [currentClub, setCurrentClub] = useState<Club>(club);
  const [postFilter, setPostFilter] = useState<PostType | 'ALL'>('ALL');
  const [postSort, setPostSort] = useState<'newest' | 'oldest'>('newest');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [postLikeCounts, setPostLikeCounts] = useState<Record<string, number>>({});
  const [clubPosts, setClubPosts] = useState<Post[]>([]);

  // Comments state
  const [openCommentPostId, setOpenCommentPostId] = useState<string | null>(null);
  const [postComments, setPostComments] = useState<Record<string, CommentItem[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<{ postId: string; commentId: string; name: string } | null>(null);
  const [commentLoading, setCommentLoading] = useState<Record<string, boolean>>({});
  const commentInputRef = useRef<HTMLInputElement>(null);

  // Post action menu state
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);

  // Confirm delete dialog
  const [confirmDeletePostId, setConfirmDeletePostId] = useState<string | null>(null);

  // Edit post state
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Calendar State
  const [calendarView, setCalendarView] = useState<'week' | 'month' | 'year'>('week');
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Sync currentClub if parent passes a new club object
  useEffect(() => { setCurrentClub(club); }, [club]);

  // Filter activities for this club from the passed prop
  const clubActivities = activities.filter(a => a.clubId === currentClub.id);

  // Fetch posts from API
  useEffect(() => {
    apiGetClubPosts(currentClub.id).then(({ data }) => {
      setClubPosts(data);
      const initLiked = new Set(data.filter(p => p.isLiked).map(p => p.id));
      setLikedPosts(initLiked);
    }).catch(() => {});
  }, [currentClub.id]);

  const handlePost = (content: string, images?: string[]) => {
    apiCreatePost(currentClub.id, 'SHARE', content, images)
      .then(newPost => {
        setClubPosts(prev => [newPost, ...prev]);
        onToast('貼文已發布', 'success');
      })
      .catch(() => onToast('發布失敗', 'error'));
    setIsPostModalOpen(false);
  };

  const handleToggleComments = (postId: string) => {
    if (openCommentPostId === postId) {
      setOpenCommentPostId(null);
      setReplyingTo(null);
      return;
    }
    setOpenCommentPostId(postId);
    setReplyingTo(null);
    if (!postComments[postId]) {
      setCommentLoading(prev => ({ ...prev, [postId]: true }));
      apiGetPostComments(currentClub.id, postId)
        .then(comments => setPostComments(prev => ({ ...prev, [postId]: comments })))
        .catch(() => onToast('無法載入留言', 'error'))
        .finally(() => setCommentLoading(prev => ({ ...prev, [postId]: false })));
    }
  };

  const handleSubmitComment = (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;
    if (!isLoggedIn) { onToast('請先登入', 'error'); return; }

    const parentId = replyingTo?.postId === postId ? replyingTo.commentId : undefined;
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    setReplyingTo(null);

    apiCreateComment(currentClub.id, postId, content, parentId)
      .then(newComment => {
        setPostComments(prev => {
          const existing = prev[postId] ?? [];
          if (parentId) {
            return {
              ...prev,
              [postId]: existing.map(c =>
                c.id === parentId
                  ? { ...c, replies: [...(c.replies ?? []), newComment] }
                  : c
              ),
            };
          }
          return { ...prev, [postId]: [...existing, newComment] };
        });
        if (!parentId) {
          setClubPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: p.comments + 1 } : p));
        }
      })
      .catch((err: any) => onToast(err.message || '留言失敗', 'error'));
  };

  const handleDeleteComment = (postId: string, commentId: string, parentId?: string | null) => {
    apiDeleteComment(currentClub.id, postId, commentId)
      .then(() => {
        setPostComments(prev => {
          const existing = prev[postId] ?? [];
          if (parentId) {
            return {
              ...prev,
              [postId]: existing.map(c =>
                c.id === parentId
                  ? { ...c, replies: (c.replies ?? []).filter(r => r.id !== commentId) }
                  : c
              ),
            };
          }
          return { ...prev, [postId]: existing.filter(c => c.id !== commentId) };
        });
        if (!parentId) {
          setClubPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: Math.max(0, p.comments - 1) } : p));
        }
      })
      .catch((err: any) => onToast(err.message || '刪除留言失敗', 'error'));
  };

  const handleClubUpdated = (updated: Club) => {
    setCurrentClub(updated);
    onClubUpdated?.(updated);
  };

  const handleDeletePost = (postId: string) => {
    setOpenMenuPostId(null);
    setConfirmDeletePostId(postId);
  };

  const confirmDeletePost = () => {
    if (!confirmDeletePostId) return;
    const postId = confirmDeletePostId;
    setConfirmDeletePostId(null);
    apiDeletePost(currentClub.id, postId)
      .then(() => {
        setClubPosts(prev => prev.filter(p => p.id !== postId));
        onToast('貼文已刪除', 'info');
      })
      .catch((err: any) => onToast(err.message || '刪除失敗', 'error'));
  };

  const handleEditPost = (post: Post) => {
    setOpenMenuPostId(null);
    setEditingPost(post);
    setEditContent(post.content);
    setTimeout(() => editTextareaRef.current?.focus(), 50);
  };

  const handleSaveEdit = async () => {
    if (!editingPost || !editContent.trim()) return;
    setIsSavingEdit(true);
    try {
      const updated = await apiUpdatePost(currentClub.id, editingPost.id, editContent.trim());
      setClubPosts(prev => prev.map(p => p.id === updated.id ? { ...p, content: updated.content } : p));
      onToast('貼文已更新', 'success');
      setEditingPost(null);
    } catch (err: any) {
      onToast(err.message || '更新失敗', 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const getFilteredAndSortedPosts = () => {
    let result = [...clubPosts];
    if (postFilter !== 'ALL') {
      result = result.filter(p => p.type === postFilter);
    }
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return postSort === 'newest' ? dateB - dateA : dateA - dateB;
    });
    return result;
  };

  const renderFeed = () => {
    const displayPosts = getFilteredAndSortedPosts();

    return (
      <div className="space-y-4">
        {/* Quick Post Input Trigger for Admin */}
        {isLoggedIn && managedClubIds.includes(currentClub.id) && (
          <div
            onClick={() => setIsPostModalOpen(true)}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex gap-3 items-center group"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 object-cover border border-gray-100 dark:border-gray-600"
            />
            <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2.5 text-gray-400 dark:text-gray-400 text-sm font-medium group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors text-left truncate">
              建立社團公告或貼文...
            </div>
            <button className="p-2 bg-primary/10 text-primary rounded-full group-hover:bg-primary/20 transition-colors">
              <PenSquare size={20} />
            </button>
          </div>
        )}

        {/* Sort & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
           {/* Filter Chips */}
           <div className="flex gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
             <button
               onClick={() => setPostFilter('ALL')}
               className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${postFilter === 'ALL' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600'}`}
             >
               全部
             </button>
             {Object.values(PostType).map(type => (
               <button
                 key={type}
                 onClick={() => setPostFilter(type)}
                 className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${postFilter === type ? 'bg-primary text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600'}`}
               >
                 {type}
               </button>
             ))}
           </div>

           {/* Sort Toggle */}
           <button
             onClick={() => setPostSort(prev => prev === 'newest' ? 'oldest' : 'newest')}
             className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ml-auto sm:ml-0"
           >
             <ArrowUpDown size={14} />
             {postSort === 'newest' ? '最新發布' : '最早發布'}
           </button>
        </div>

        {/* Masonry Posts List */}
        {displayPosts.length > 0 ? (
          <div className="columns-1 md:columns-2 gap-4 space-y-4">
            {displayPosts.map(post => (
              <div key={post.id} className="break-inside-avoid mb-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
                 <div className="p-4 pb-2 flex justify-between items-start">
                   <div className="flex gap-3">
                     <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 object-cover ring-2 ring-white dark:ring-gray-800 shadow-sm" />
                     <div>
                       <div className="flex items-center gap-2">
                         <span className="font-bold text-gray-900 dark:text-white text-sm">{post.author.name}</span>
                         {post.author.isAdmin && <span className="text-[10px] bg-gray-900 dark:bg-gray-600 text-white px-1.5 py-0.5 rounded font-bold">Admin</span>}
                       </div>
                       <span className="text-xs text-gray-400 dark:text-gray-500 block mt-0.5">
                         {new Date(post.createdAt).toLocaleDateString()}
                       </span>
                     </div>
                   </div>
                   <div className="flex items-start gap-2">
                     <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider ${
                       post.type === PostType.ANNOUNCEMENT ? 'bg-red-50 text-red-600' :
                       post.type === PostType.SHARE ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                     }`}>
                       {post.type}
                     </span>
                   </div>
                 </div>
                 <div className="px-4 py-2">
                    <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>
                 </div>
                 {post.images && post.images.length > 0 && (
                   <div className={`mt-3 ${post.images.length === 1 ? '' : 'grid grid-cols-2 gap-0.5'}`}>
                     {post.images.map((img, idx) => (
                       <div key={idx} className={`relative overflow-hidden bg-gray-100 dark:bg-gray-700 ${
                          post.images && post.images.length === 3 && idx === 0 ? 'col-span-2' : ''
                       } ${post.images && post.images.length === 1 ? 'h-56' : 'h-32'}`}>
                          <img src={img} alt="Post Attachment" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                       </div>
                     ))}
                   </div>
                 )}
                 <div className="px-4 py-3 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between mt-auto">
                   <div className="flex items-center gap-4">
                      <button
                        onClick={() => {
                          if (!isLoggedIn) return;
                          const isLiked = likedPosts.has(post.id);
                          setLikedPosts(prev => {
                            const next = new Set(prev);
                            isLiked ? next.delete(post.id) : next.add(post.id);
                            return next;
                          });
                          setPostLikeCounts(prev => ({
                            ...prev,
                            [post.id]: (prev[post.id] ?? post.likes) + (isLiked ? -1 : 1),
                          }));
                          apiTogglePostLike(currentClub.id, post.id)
                            .then(({ likes }) => setPostLikeCounts(prev => ({ ...prev, [post.id]: likes })))
                            .catch(() => {});
                        }}
                        className={`flex items-center gap-1.5 text-xs font-bold transition-colors active:scale-90 ${likedPosts.has(post.id) ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400'}`}
                      >
                        <Heart size={18} className={likedPosts.has(post.id) ? 'fill-red-500' : ''} />
                        {postLikeCounts[post.id] ?? post.likes}
                      </button>
                      <button
                        onClick={() => handleToggleComments(post.id)}
                        className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${openCommentPostId === post.id ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400'}`}
                      >
                        <MessageSquare size={18} />
                        {post.comments}
                      </button>
                   </div>
                   {/* Post action menu */}
                   <div className="relative">
                     <button
                       onClick={() => setOpenMenuPostId(openMenuPostId === post.id ? null : post.id)}
                       className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                     >
                       <MoreHorizontal size={18} />
                     </button>
                     {openMenuPostId === post.id && (
                       <>
                         {/* Click outside to close */}
                         <div className="fixed inset-0 z-10" onClick={() => setOpenMenuPostId(null)} />
                         <div className="absolute right-0 top-8 z-20 w-36 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 overflow-hidden">
                           {(user.id === post.author.id || managedClubIds.includes(currentClub.id)) ? (
                             <>
                               <button
                                 onClick={() => handleEditPost(post)}
                                 className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                               >
                                 <Edit2 size={14} /> 編輯貼文
                               </button>
                               <button
                                 onClick={() => handleDeletePost(post.id)}
                                 className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                               >
                                 <AlertTriangle size={14} /> 刪除貼文
                               </button>
                             </>
                           ) : (
                             <button
                               onClick={() => { onToast('已送出檢舉', 'info'); setOpenMenuPostId(null); }}
                               className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                             >
                               🚩 檢舉貼文
                             </button>
                           )}
                         </div>
                       </>
                     )}
                   </div>
                 </div>

                 {/* Comment Section */}
                 {openCommentPostId === post.id && (
                   <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-3 space-y-3">
                     {commentLoading[post.id] ? (
                       <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-2">載入留言中...</p>
                     ) : (postComments[post.id] ?? []).length === 0 ? (
                       <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-2">還沒有留言，來搶頭香！</p>
                     ) : (
                       <div className="space-y-3 max-h-60 overflow-y-auto">
                         {(postComments[post.id] ?? []).map(comment => (
                           <div key={comment.id} className="flex gap-2.5">
                             <img src={comment.author.avatar} alt={comment.author.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                             <div className="flex-1 min-w-0">
                               <div className="bg-gray-50 dark:bg-gray-700/60 rounded-2xl px-3 py-2">
                                 <span className="font-bold text-xs text-gray-900 dark:text-white">{comment.author.name}</span>
                                 <p className="text-sm text-gray-700 dark:text-gray-200 mt-0.5 leading-relaxed">{comment.content}</p>
                               </div>
                               <div className="flex items-center gap-3 mt-1 px-2">
                                 <span className="text-[10px] text-gray-400 dark:text-gray-500">{relativeTime(comment.createdAt)}</span>
                                 {isLoggedIn && (
                                   <button
                                     onClick={() => {
                                       setReplyingTo({ postId: post.id, commentId: comment.id, name: comment.author.name });
                                       setTimeout(() => commentInputRef.current?.focus(), 50);
                                     }}
                                     className="text-[10px] font-bold text-gray-400 dark:text-gray-500 hover:text-primary transition-colors flex items-center gap-0.5"
                                   >
                                     <CornerDownRight size={10} /> 回覆
                                   </button>
                                 )}
                                 {(user.id === comment.author.id || managedClubIds.includes(currentClub.id)) && (
                                   <button
                                     onClick={() => handleDeleteComment(post.id, comment.id, null)}
                                     className="text-[10px] font-bold text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors"
                                   >
                                     刪除
                                   </button>
                                 )}
                               </div>
                               {/* Replies */}
                               {(comment.replies ?? []).length > 0 && (
                                 <div className="mt-2 ml-3 space-y-2 border-l-2 border-gray-100 dark:border-gray-600 pl-3">
                                   {(comment.replies ?? []).map(reply => (
                                     <div key={reply.id} className="flex gap-2">
                                       <img src={reply.author.avatar} alt={reply.author.name} className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-0.5" />
                                       <div className="flex-1 min-w-0">
                                         <div className="bg-gray-50 dark:bg-gray-700/60 rounded-2xl px-3 py-1.5">
                                           <span className="font-bold text-[11px] text-gray-900 dark:text-white">{reply.author.name}</span>
                                           <p className="text-xs text-gray-700 dark:text-gray-200 mt-0.5">{reply.content}</p>
                                         </div>
                                         <div className="flex items-center gap-3 mt-0.5 px-1">
                                           <span className="text-[10px] text-gray-400 dark:text-gray-500">{relativeTime(reply.createdAt)}</span>
                                           {(user.id === reply.author.id || managedClubIds.includes(currentClub.id)) && (
                                             <button
                                               onClick={() => handleDeleteComment(post.id, reply.id, comment.id)}
                                               className="text-[10px] font-bold text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors"
                                             >
                                               刪除
                                             </button>
                                           )}
                                         </div>
                                       </div>
                                     </div>
                                   ))}
                                 </div>
                               )}
                             </div>
                           </div>
                         ))}
                       </div>
                     )}

                     {/* Comment input */}
                     {isLoggedIn ? (
                       <div className="flex gap-2 items-end">
                         <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                         <div className="flex-1">
                           {replyingTo?.postId === post.id && (
                             <div className="flex items-center gap-1 text-[11px] text-primary mb-1 px-1">
                               <CornerDownRight size={11} />
                               <span>回覆 @{replyingTo.name}</span>
                               <button onClick={() => setReplyingTo(null)} className="ml-1 text-gray-400 hover:text-red-500">
                                 <X size={12} />
                               </button>
                             </div>
                           )}
                           <div className="flex gap-1.5">
                             <input
                               ref={commentInputRef}
                               value={commentInputs[post.id] ?? ''}
                               onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                               onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmitComment(post.id); } }}
                               placeholder={replyingTo?.postId === post.id ? `回覆 @${replyingTo.name}...` : '寫下留言...'}
                               className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40"
                             />
                             <button
                               onClick={() => handleSubmitComment(post.id)}
                               disabled={!(commentInputs[post.id]?.trim())}
                               className="p-2 bg-primary text-white rounded-full hover:bg-orange-600 transition-colors disabled:opacity-40 flex-shrink-0"
                             >
                               <Send size={16} />
                             </button>
                           </div>
                         </div>
                       </div>
                     ) : (
                       <p className="text-xs text-center text-gray-400 dark:text-gray-500">請登入後留言</p>
                     )}
                   </div>
                 )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 border-dashed">
            <p className="text-gray-400 dark:text-gray-500 text-sm">此分類尚無貼文</p>
          </div>
        )}
      </div>
    );
  };

  // Calendar Logic
  const handleCalendarNavigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(calendarDate);
    if (calendarView === 'week') {
      newDate.setDate(calendarDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (calendarView === 'month') {
      newDate.setMonth(calendarDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (calendarView === 'year') {
      newDate.setFullYear(calendarDate.getFullYear() + (direction === 'next' ? 1 : -1));
    }
    setCalendarDate(newDate);
  };

  const renderCalendar = () => {
    const currentYear = calendarDate.getFullYear();
    const currentMonth = calendarDate.getMonth(); // 0-indexed

    // Header Label
    let label = '';
    if (calendarView === 'week' || calendarView === 'month') {
      label = `${currentYear}年 ${currentMonth + 1}月`;
    } else {
      label = `${currentYear}年`;
    }

    // Helper to check activity exists on date
    const hasActivity = (d: string) => clubActivities.some(a => a.date === d);

    // Helper to format YYYY-MM-DD
    const formatDate = (date: Date) => {
      const offset = date.getTimezoneOffset();
      const local = new Date(date.getTime() - (offset * 60 * 1000));
      return local.toISOString().split('T')[0];
    };

    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-0">
        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCalendarNavigate('prev')}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg w-32 text-center select-none">
              {label}
            </h3>
            <button
              onClick={() => handleCalendarNavigate('next')}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* View Switcher */}
          <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
             {(['week', 'month', 'year'] as const).map((v) => (
               <button
                 key={v}
                 onClick={() => setCalendarView(v)}
                 className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                   calendarView === v
                   ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                   : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                 }`}
               >
                 {v === 'week' ? '週' : v === 'month' ? '月' : '年'}
               </button>
             ))}
          </div>
        </div>

        {/* Content Views */}

        {/* WEEK VIEW */}
        {calendarView === 'week' && (
          <div className="grid grid-cols-7 gap-1">
             {['日', '一', '二', '三', '四', '五', '六'].map(d => (
               <div key={d} className="text-center text-[10px] text-gray-400 dark:text-gray-500 py-1">{d}</div>
             ))}
             {Array.from({ length: 7 }).map((_, i) => {
                // Calculate start of week (Sunday)
                const startOfWeek = new Date(calendarDate);
                const day = startOfWeek.getDay(); // 0 (Sun) to 6 (Sat)
                startOfWeek.setDate(startOfWeek.getDate() - day);

                const date = new Date(startOfWeek);
                date.setDate(startOfWeek.getDate() + i);

                const dateStr = formatDate(date);
                const isSelected = dateStr === selectedDate;
                const isToday = dateStr === new Date().toISOString().split('T')[0];
                const active = hasActivity(dateStr);

                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`flex flex-col items-center justify-center py-2 rounded-xl transition-all relative ${
                       isSelected ? 'bg-gray-900 dark:bg-gray-600 text-white shadow-md scale-105 z-10' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                     <span className={`text-xs ${isToday && !isSelected ? 'text-primary font-bold' : ''}`}>{date.getDate()}</span>
                     <div className={`mt-1 w-1.5 h-1.5 rounded-full ${active ? (isSelected ? 'bg-primary' : 'bg-primary') : 'bg-transparent'}`}></div>
                  </button>
                );
             })}
          </div>
        )}

        {/* MONTH VIEW */}
        {calendarView === 'month' && (
           <div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['日', '一', '二', '三', '四', '五', '六'].map(d => (
                  <div key={d} className="text-center text-[10px] text-gray-400 dark:text-gray-500">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                 {(() => {
                    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
                    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                    const days = [];

                    // Padding
                    for (let i = 0; i < firstDay; i++) {
                       days.push(<div key={`empty-${i}`} className="h-10"></div>);
                    }

                    // Days
                    for (let i = 1; i <= daysInMonth; i++) {
                       const date = new Date(currentYear, currentMonth, i);
                       const dateStr = formatDate(date);
                       const isSelected = dateStr === selectedDate;
                       const active = hasActivity(dateStr);

                       days.push(
                         <button
                           key={i}
                           onClick={() => setSelectedDate(dateStr)}
                           className={`h-9 flex flex-col items-center justify-center rounded-lg transition-all ${
                             isSelected
                             ? 'bg-gray-900 dark:bg-gray-600 text-white shadow-md'
                             : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                           }`}
                         >
                            <span className="text-xs">{i}</span>
                            {active && <div className={`w-1 h-1 rounded-full mt-0.5 ${isSelected ? 'bg-primary' : 'bg-primary'}`}></div>}
                         </button>
                       );
                    }
                    return days;
                 })()}
              </div>
           </div>
        )}

        {/* YEAR VIEW */}
        {calendarView === 'year' && (
           <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 12 }).map((_, i) => {
                 const monthDate = new Date(currentYear, i, 1);
                 // Check if any activity in this month
                 const hasActivityInMonth = clubActivities.some(a => {
                    const d = new Date(a.date);
                    return d.getFullYear() === currentYear && d.getMonth() === i;
                 });
                 const isCurrentMonth = i === currentMonth;

                 return (
                    <button
                      key={i}
                      onClick={() => {
                         setCalendarDate(new Date(currentYear, i, 1));
                         setCalendarView('month');
                      }}
                      className={`py-3 rounded-xl text-sm font-bold transition-all border relative ${
                         isCurrentMonth
                         ? 'border-gray-900 dark:border-gray-400 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white'
                         : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                       {i + 1}月
                       {hasActivityInMonth && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full"></div>}
                    </button>
                 );
              })}
           </div>
        )}
      </div>
    );
  };

  const selectedDateActivities = clubActivities.filter(a => a.date === selectedDate);
  const otherActivities = clubActivities.filter(a => a.date !== selectedDate);

  return (
    <div className="animate-fade-in pb-20">
      {/* Cover & Header */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
        <img src={`https://picsum.photos/seed/${currentClub.id}/800/300`} className="w-full h-full object-cover" alt="Cover" />
        <button
          onClick={onBack}
          className="absolute top-4 left-4 w-10 h-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
        >
          <span className="font-bold text-xl text-gray-900 dark:text-white">&larr;</span>
        </button>
      </div>

      <div className="px-4 -mt-12 relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div className="flex gap-4">
              <img src={currentClub.logo} alt={currentClub.name} className="w-20 h-20 rounded-xl border-4 border-white dark:border-gray-800 shadow-sm object-cover bg-gray-100 dark:bg-gray-700" />
              <div className="pt-10 sm:pt-0">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight mb-1">{currentClub.name}</h1>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-3">
                  <span className="flex items-center gap-1"><Users size={14} /> {currentClub.membersCount} 成員</span>
                  <span className="flex items-center gap-1 text-yellow-500"><Star size={14} fill="currentColor" /> {currentClub.rating}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {managedClubIds.includes(currentClub.id) ? (
                <>
                  <button
                    onClick={() => setIsPostModalOpen(true)}
                    className="bg-gray-900 dark:bg-gray-600 text-white px-3 py-2 rounded-full text-sm font-bold shadow-md hover:bg-gray-800 dark:hover:bg-gray-500 transition-colors flex items-center gap-1"
                  >
                    <PenSquare size={16} /> <span className="hidden sm:inline">發布</span>
                  </button>
                  <button
                    onClick={() => setIsManageModalOpen(true)}
                    className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-full text-sm font-bold border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    管理社團
                  </button>
                </>
              ) : joinedClubIds.includes(currentClub.id) ? (
                <button
                  onClick={() => onLeaveClub(currentClub.id)}
                  className="px-4 py-2 rounded-full text-sm font-bold border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  退出社團
                </button>
              ) : (
                <button
                  onClick={() => onJoinClub(currentClub.id)}
                  className="bg-primary text-white px-4 py-2 rounded-full text-sm font-bold shadow-md shadow-orange-200 hover:bg-orange-600 transition-colors"
                >
                  加入社團
                </button>
              )}
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {currentClub.description}
          </p>
          <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
            {currentClub.tags.map(tag => (
              <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-md whitespace-nowrap">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-6">
        <div className="flex bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${activeTab === 'feed' ? 'bg-gray-900 dark:bg-gray-600 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            社團動態
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${activeTab === 'activities' ? 'bg-gray-900 dark:bg-gray-600 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            活動日程
          </button>
          <button
            onClick={() => setActiveTab('album')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${activeTab === 'album' ? 'bg-gray-900 dark:bg-gray-600 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            相簿
          </button>
        </div>

        {/* Content */}
        {activeTab === 'feed' && renderFeed()}

        {activeTab === 'activities' && (
          <div className="space-y-6">
            {/* Calendar Component */}
            <div>
               {renderCalendar()}
            </div>

            {/* Selected Date Activities */}
            <div>
               <h4 className="font-bold text-gray-900 dark:text-white mb-3 px-1 border-l-4 border-primary pl-2">
                 {selectedDate} 的活動
               </h4>
               <div className="space-y-3">
                 {selectedDateActivities.length > 0 ? (
                   selectedDateActivities.map(activity => (
                    <div key={activity.id} onClick={() => onActivityClick(activity)} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-primary/30 ring-4 ring-primary/5 shadow-sm flex gap-4 cursor-pointer hover:shadow-md transition-shadow">
                      <div className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                        <img src={activity.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                           <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1 text-lg">{activity.title}</h4>
                           <span className={`text-xs font-bold px-2 py-1 rounded-md whitespace-nowrap ${activity.status === 'FULL' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-primary'}`}>
                             {activity.status === 'FULL' ? '已滿額' : '報名中'}
                           </span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                          <CalendarIcon size={14} className="text-primary" />
                          <span className="font-bold text-gray-700 dark:text-gray-200">{activity.time}</span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                          <MapPin size={14} /> {activity.location}
                        </div>
                      </div>
                    </div>
                   ))
                 ) : (
                   <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-600">
                     <p className="text-gray-500 dark:text-gray-400 font-medium">這天沒有安排活動</p>
                     <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">點擊上方日期查看其他天</p>
                   </div>
                 )}
               </div>
            </div>

            {/* Other Activities */}
            <div>
               <h4 className="font-bold text-gray-900 dark:text-white mb-3 px-1 border-l-4 border-gray-300 dark:border-gray-600 pl-2">
                 其他近期活動
               </h4>
               <div className="space-y-3">
                 {otherActivities.length > 0 ? (
                    otherActivities.map(activity => (
                      <div key={activity.id} onClick={() => onActivityClick(activity)} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex gap-4 opacity-90 hover:opacity-100 hover:shadow-md transition-all cursor-pointer">
                        <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                          <img src={activity.image} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1">{activity.title}</h4>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                            <CalendarIcon size={12} className="text-gray-400 dark:text-gray-500" />
                            <span>{activity.date}</span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                            <MapPin size={12} /> {activity.location}
                          </div>
                        </div>
                        <div className="flex items-center justify-center">
                          <ChevronRight size={20} className="text-gray-300 dark:text-gray-600" />
                        </div>
                      </div>
                    ))
                 ) : (
                    <div className="text-center py-4 text-gray-400 dark:text-gray-500 text-sm">無其他近期活動</div>
                 )}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'album' && (
          <div className="columns-2 gap-4 space-y-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="break-inside-avoid rounded-xl overflow-hidden shadow-sm relative group cursor-pointer">
                <img src={`https://picsum.photos/seed/${i + 100}/400/${i % 2 === 0 ? 500 : 300}`} className="w-full h-auto" alt="Album" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ImageIcon className="text-white" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreatePostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onPost={handlePost}
      />
      <ClubManageModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        club={currentClub}
        onClubUpdated={handleClubUpdated}
        onToast={onToast}
      />

      {/* Confirm Delete Dialog */}
      {confirmDeletePostId && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDeletePostId(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">刪除貼文</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">確定要刪除這則貼文嗎？此動作無法復原。</p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setConfirmDeletePostId(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmDeletePost}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors"
              >
                刪除
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Post Modal */}
      {editingPost && createPortal(
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditingPost(null)} />
          <div className="relative bg-white dark:bg-gray-800 w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">編輯貼文</h2>
              <button
                onClick={() => setEditingPost(null)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            {/* Body */}
            <div className="p-5 flex-1 overflow-y-auto">
              <div className="flex gap-3 mb-4">
                <img src={editingPost.author.avatar} alt={editingPost.author.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                <div>
                  <span className="font-bold text-gray-900 dark:text-white text-sm block">{editingPost.author.name}</span>
                  {editingPost.author.isAdmin && <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full mt-0.5 inline-block">Admin</span>}
                </div>
              </div>
              <textarea
                ref={editTextareaRef}
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                rows={5}
                className="w-full border-none focus:ring-0 resize-none outline-none text-gray-800 dark:text-white text-base placeholder:text-gray-400 dark:placeholder-gray-500 bg-transparent"
                placeholder="貼文內容..."
              />
            </div>
            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex gap-3 flex-shrink-0">
              <button
                onClick={() => setEditingPost(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSavingEdit || !editContent.trim()}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send size={16} />
                {isSavingEdit ? '儲存中...' : '儲存變更'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ClubProfile;
