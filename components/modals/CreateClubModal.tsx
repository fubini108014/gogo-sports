import React, { useState } from 'react';
import { X, Upload, CheckCircle } from 'lucide-react';
import { SPORTS_HIERARCHY } from '../../constants';

interface CreateClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (clubData: any) => Promise<void>;
}

const CreateClubModal: React.FC<CreateClubModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: SPORTS_HIERARCHY[1].name, // Default to Ball Sports
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!formData.name || isSubmitting) return;
    if (formData.description.length < 10) return;

    setIsSubmitting(true);
    const newClub = {
      name: formData.name,
      description: formData.description,
      tags: [formData.category],
      logo: `https://picsum.photos/seed/${encodeURIComponent(formData.name)}/200/200`,
    };

    try {
      await onCreate(newClub);
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setFormData({ name: '', description: '', category: SPORTS_HIERARCHY[1].name });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={handleClose}></div>

      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-fade-in">
        {isSuccess ? (
           <div className="p-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                 <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">社團創立成功！</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">您現在是「{formData.name}」的社長了。<br/>開始邀請朋友加入吧！</p>
              <button
                onClick={handleClose}
                className="px-6 py-2.5 bg-gray-900 dark:bg-gray-700 text-white font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
              >
                前往社團
              </button>
           </div>
        ) : (
          <>
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">創立新社團</h3>
              <button onClick={handleClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-center mb-2">
                 <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                    <Upload size={24} />
                    <span className="text-xs mt-1">上傳 Logo</span>
                 </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">社團名稱</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="例如：台北週末登山團"
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-primary/50 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">主要類別</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-primary/50 bg-white dark:bg-gray-700 dark:text-white"
                >
                  {SPORTS_HIERARCHY.filter(c => c.name !== '所有運動').map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                  社團簡介 <span className="text-xs font-normal text-gray-400">(至少 10 字)</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="簡單介紹一下社團的宗旨與活動風格..."
                  className={`w-full p-3 h-32 border rounded-xl outline-none focus:ring-2 focus:ring-primary/50 resize-none dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 ${
                    formData.description.length > 0 && formData.description.length < 10
                      ? 'border-red-300 dark:border-red-700'
                      : 'border-gray-200 dark:border-gray-600'
                  }`}
                ></textarea>
                {formData.description.length > 0 && formData.description.length < 10 && (
                  <p className="text-xs text-red-500 mt-1">還需要 {10 - formData.description.length} 個字</p>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex justify-end gap-3">
               <button
                 onClick={handleClose}
                 className="px-5 py-2.5 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-200/50 dark:hover:bg-gray-700 rounded-xl transition-colors"
               >
                 取消
               </button>
               <button
                onClick={handleSubmit}
                disabled={!formData.name || formData.description.length < 10 || isSubmitting}
                className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-orange-200 hover:bg-orange-600 disabled:opacity-50 disabled:shadow-none transition-all"
               >
                 {isSubmitting ? '建立中...' : '立即創社'}
               </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CreateClubModal;
