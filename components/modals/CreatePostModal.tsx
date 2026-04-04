import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Image, Paperclip, Send, Smile, XCircle, Loader2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { apiUploadFile } from '../../services/api';

const EMOJI_LIST = [
  '😀','😂','🥰','😎','🤔','👍','👏','🙌','🎉','🔥',
  '💪','🏃','🏸','⛹️','🚴','🏊','🧗','🎯','🏆','⭐',
  '❤️','🧡','💛','💚','💙','🟠','✅','📢','📸','🌟',
];

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPost: (content: string, images?: string[]) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onPost }) => {
  const { user, addToast } = useAppContext();
  const [content, setContent] = useState('');
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!isOpen) return null;

  const handlePost = async () => {
    if (!content.trim() && files.length === 0) return;
    setIsPosting(true);
    try {
      let imageUrls: string[] = [];
      if (files.length > 0) {
        imageUrls = await Promise.all(files.map(f => apiUploadFile(f)));
      }
      onPost(content, imageUrls.length > 0 ? imageUrls : undefined);
      setContent('');
      setPreviews([]);
      setFiles([]);
      setShowEmoji(false);
    } catch (err: any) {
      addToast(err.message || '圖片上傳失敗', 'error');
    } finally {
      setIsPosting(false);
    }
  };

  const handleClose = () => {
    setContent('');
    setPreviews([]);
    setFiles([]);
    setShowEmoji(false);
    onClose();
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    const remaining = 4 - files.length;
    const toAdd = selected.slice(0, remaining);
    toAdd.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = ev => {
        setPreviews(prev => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
    setFiles(prev => [...prev, ...toAdd]);
    // reset so same file can be re-selected
    e.target.value = '';
  };

  const removeImage = (idx: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== idx));
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const insertEmoji = (emoji: string) => {
    const ta = textareaRef.current;
    if (!ta) {
      setContent(prev => prev + emoji);
      return;
    }
    const start = ta.selectionStart ?? content.length;
    const end = ta.selectionEnd ?? content.length;
    const next = content.slice(0, start) + emoji + content.slice(end);
    setContent(next);
    // restore cursor
    requestAnimationFrame(() => {
      ta.selectionStart = ta.selectionEnd = start + emoji.length;
      ta.focus();
    });
  };

  const canPost = content.trim().length > 0 || files.length > 0;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="bg-white dark:bg-gray-800 w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-fade-in flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">建立社團貼文</h3>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex-1 overflow-y-auto">
          {/* Author */}
          <div className="flex gap-3 mb-4">
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
            <div>
              <span className="font-bold text-gray-900 dark:text-white text-sm block">{user.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full mt-0.5 inline-block">管理員</span>
            </div>
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            className="w-full min-h-[120px] p-0 border-none focus:ring-0 resize-none outline-none text-gray-800 dark:text-white text-base placeholder:text-gray-400 dark:placeholder-gray-500 bg-transparent"
            placeholder="分享社團的最新消息、活動照片或公告..."
            value={content}
            onChange={e => setContent(e.target.value)}
            autoFocus
          />

          {/* Image previews */}
          {previews.length > 0 && (
            <div className={`mt-3 grid gap-2 ${previews.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {previews.map((src, idx) => (
                <div key={idx} className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 aspect-square">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80 transition-colors"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              ))}
              {previews.length < 4 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:border-primary hover:text-primary transition-colors text-sm font-medium"
                >
                  + 新增
                </button>
              )}
            </div>
          )}

          {/* Emoji picker */}
          {showEmoji && (
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
              <div className="grid grid-cols-10 gap-1">
                {EMOJI_LIST.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => insertEmoji(emoji)}
                    className="text-xl hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg p-1 transition-colors leading-none"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="px-5 pb-2 flex-shrink-0">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => { fileInputRef.current?.click(); setShowEmoji(false); }}
              disabled={files.length >= 4}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                files.length > 0
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'bg-orange-50 dark:bg-orange-900/20 text-primary hover:bg-orange-100 dark:hover:bg-orange-900/30'
              } disabled:opacity-40`}
            >
              <Image size={18} />
              照片/影片
              {files.length > 0 && <span className="bg-primary text-white text-[10px] font-black px-1.5 rounded-full">{files.length}</span>}
            </button>
            <button
              className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
              onClick={() => addToast('檔案上傳功能即將推出', 'info')}
            >
              <Paperclip size={18} /> 檔案
            </button>
            <button
              onClick={() => setShowEmoji(v => !v)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                showEmoji
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <Smile size={18} /> 表情
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 flex justify-end gap-3 flex-shrink-0">
          <button
            onClick={handleClose}
            className="px-5 py-2.5 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-200/50 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            取消
          </button>
          <button
            onClick={handlePost}
            disabled={!canPost || isPosting}
            className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-orange-200 hover:bg-orange-600 disabled:opacity-40 disabled:shadow-none flex items-center gap-2 transition-all active:scale-95"
          >
            {isPosting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            {isPosting ? (files.length > 0 ? '上傳中...' : '發布中...') : '發布'}
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={handleImageSelect}
      />
    </div>,
    document.body
  );
};

export default CreatePostModal;
