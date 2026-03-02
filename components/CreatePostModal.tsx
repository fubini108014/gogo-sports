import React, { useState } from 'react';
import { X, Image, Paperclip, Send, Smile } from 'lucide-react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPost: (content: string) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onPost }) => {
  const [content, setContent] = useState('');

  if (!isOpen) return null;

  const handlePost = () => {
    if (!content.trim()) return;
    onPost(content);
    setContent('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">建立社團貼文</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex-1 overflow-y-auto">
          <div className="flex gap-3 mb-4">
             <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                <img src="https://picsum.photos/id/64/200/200" alt="User" className="w-full h-full object-cover"/>
             </div>
             <div className="flex-1">
                <span className="font-bold text-gray-900 dark:text-white text-sm block">Alex Chen</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full mt-0.5 inline-block">管理員</span>
             </div>
          </div>

          <textarea
            className="w-full min-h-[150px] p-0 border-none focus:ring-0 resize-none outline-none text-gray-800 dark:text-white text-lg placeholder:text-gray-400 dark:placeholder-gray-400 bg-transparent dark:bg-transparent"
            placeholder="分享社團的最新消息、活動照片或公告..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus
          ></textarea>
        </div>

        {/* Attachment Options */}
        <div className="px-5 pb-2">
           <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              <button className="flex items-center gap-2 px-3 py-2 bg-orange-50 text-primary rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors">
                 <Image size={18} /> 照片/影片
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                 <Paperclip size={18} /> 檔案
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                 <Smile size={18} /> 表情
              </button>
           </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex justify-end gap-3">
           <button
             onClick={onClose}
             className="px-5 py-2.5 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-200/50 dark:hover:bg-gray-700 rounded-xl transition-colors"
           >
             取消
           </button>
           <button
            onClick={handlePost}
            disabled={!content.trim()}
            className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-orange-200 hover:bg-orange-600 disabled:opacity-50 disabled:shadow-none flex items-center gap-2 transition-all transform active:scale-95"
           >
             <Send size={18} /> 發布
           </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
