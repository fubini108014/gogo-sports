import React, { useState, useEffect } from 'react';
import { RegistrationMode, Level, ActivityStatus, Club } from '../../types';
import { X, Calendar, MapPin, DollarSign, Users, Target, Info, ChevronRight, CheckCircle } from 'lucide-react';

interface CreateActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (activityData: any) => Promise<void>;
  managedClubs: Club[];
}

const CreateActivityModal: React.FC<CreateActivityModalProps> = ({ isOpen, onClose, onCreate, managedClubs }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    clubId: managedClubs[0]?.id || '',
    title: '',
    date: '',
    time: '',
    location: '',
    city: '台北市',
    price: '',
    mode: RegistrationMode.LIMITED,
    level: Level.INTERMEDIATE,
    description: '',
    maxParticipants: '',
    groups: '', // Comma separated string for input
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync clubId when managedClubs loads (fixes race condition on initial mount)
  useEffect(() => {
    if (managedClubs.length > 0 && !formData.clubId) {
      setFormData(prev => ({ ...prev, clubId: managedClubs[0].id }));
    }
  }, [managedClubs]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.title || !formData.date || !formData.clubId || isSubmitting) return;

    const newActivity = {
      clubId: formData.clubId,
      title: formData.title,
      date: formData.date,
      time: formData.time,
      location: formData.location,
      city: formData.city,
      price: Number(formData.price) || 0,
      mode: formData.mode,
      level: formData.level,
      description: formData.description,
      maxParticipants: formData.mode === RegistrationMode.LIMITED ? (Number(formData.maxParticipants) || undefined) : undefined,
      groups: formData.mode === RegistrationMode.OPEN && formData.groups
        ? formData.groups.split(',').map((g: string) => g.trim()).filter(Boolean)
        : undefined,
      tags: [formData.mode === RegistrationMode.OPEN ? '戶外' : '室內'],
    };

    setIsSubmitting(true);
    try {
      await onCreate(newActivity);
      setStep(3); // Success step — only on API success
    } catch {
      // Error toast already shown by handleCreateActivity
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setFormData({
      clubId: managedClubs[0]?.id || '',
      title: '',
      date: '',
      time: '',
      location: '',
      city: '台北市',
      price: '',
      mode: RegistrationMode.LIMITED,
      level: Level.INTERMEDIATE,
      description: '',
      maxParticipants: '',
      groups: '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={handleClose}></div>

      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">
            {step === 3 ? '開團成功' : '建立新活動'}
          </h3>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {step === 1 && (
            <div className="space-y-5">
               {/* Club Selection */}
               <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">發起社團</label>
                  <select
                    name="clubId"
                    value={formData.clubId}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {managedClubs.map(club => (
                      <option key={club.id} value={club.id}>{club.name}</option>
                    ))}
                  </select>
               </div>

               {/* Title */}
               <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">活動標題</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="例如：週二羽球歡樂場"
                    className="w-full p-3 border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 rounded-xl outline-none focus:ring-2 focus:ring-primary/50"
                  />
               </div>

               {/* Mode Selection */}
               <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">報名模式</label>
                  <div className="grid grid-cols-2 gap-3">
                     <button
                       type="button"
                       onClick={() => setFormData(prev => ({ ...prev, mode: RegistrationMode.LIMITED }))}
                       className={`p-3 rounded-xl border-2 text-left transition-all ${
                         formData.mode === RegistrationMode.LIMITED
                         ? 'border-primary bg-orange-50'
                         : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600'
                       }`}
                     >
                       <div className="font-bold text-gray-900 dark:text-white mb-1">限制人數</div>
                       <div className="text-xs text-gray-500 dark:text-gray-400">適合球類、課程。需設定人數上限，額滿自動候補。</div>
                     </button>
                     <button
                       type="button"
                       onClick={() => setFormData(prev => ({ ...prev, mode: RegistrationMode.OPEN }))}
                       className={`p-3 rounded-xl border-2 text-left transition-all ${
                         formData.mode === RegistrationMode.OPEN
                         ? 'border-secondary bg-lime-50'
                         : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600'
                       }`}
                     >
                       <div className="font-bold text-gray-900 dark:text-white mb-1">開放報名</div>
                       <div className="text-xs text-gray-500 dark:text-gray-400">適合登山、路跑。無硬性人數上限，可設分組。</div>
                     </button>
                  </div>
               </div>

               {/* Mode Specific Fields */}
               <div className="animate-fade-in bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                  {formData.mode === RegistrationMode.LIMITED ? (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">人數限制</label>
                      <input
                        type="number"
                        name="maxParticipants"
                        value={formData.maxParticipants}
                        onChange={handleChange}
                        placeholder="例如：16"
                        className="w-full p-2 border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 rounded-lg outline-none focus:border-primary"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">活動分組 (選填)</label>
                      <input
                        type="text"
                        name="groups"
                        value={formData.groups}
                        onChange={handleChange}
                        placeholder="例如：休閒組, 挑戰組 (以逗號分隔)"
                        className="w-full p-2 border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 rounded-lg outline-none focus:border-primary"
                      />
                    </div>
                  )}
               </div>

               {/* Basic Info Grid */}
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">日期</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="w-full pl-10 p-3 border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 rounded-xl outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">時間</label>
                    <input
                      type="text"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      placeholder="19:00 - 21:00"
                      className="w-full p-3 border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 rounded-xl outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
               </div>

               <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">地點</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="請輸入地點或場館名稱"
                        className="w-full pl-10 p-3 border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 rounded-xl outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">城市</label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-primary/50 bg-white dark:bg-gray-700"
                    >
                      {['台北市','新北市','桃園市','台中市','台南市','高雄市','新竹市','基隆市','嘉義市','宜蘭縣','苗栗縣','彰化縣','南投縣','雲林縣','嘉義縣','屏東縣','花蓮縣','台東縣','澎湖縣','金門縣','連江縣'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">費用 (每人)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="0"
                        className="w-full pl-10 p-3 border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 rounded-xl outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">程度要求</label>
                    <select
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 rounded-xl outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                    >
                      {Object.values(Level).map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
               </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
               <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">詳細說明</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="請詳細說明活動內容、注意事項、裝備要求等..."
                    className="w-full p-4 h-48 border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 rounded-xl outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  ></textarea>
               </div>

               <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex gap-3 text-blue-700 dark:text-blue-300 text-sm">
                  <Info className="flex-shrink-0" size={20} />
                  <p>發布後，系統將自動通知社團成員。若選擇「限制人數」模式，系統將自動處理候補排序。</p>
               </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center justify-center h-full py-8 text-center animate-fade-in">
               <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce-small">
                 <CheckCircle size={40} className="text-green-600" />
               </div>
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">活動發布成功！</h2>
               <p className="text-gray-500 dark:text-gray-400 mb-8">您的活動已經上架，快去分享給朋友吧。</p>
               <button
                 onClick={handleClose}
                 className="px-8 py-3 bg-gray-900 dark:bg-gray-700 text-white font-bold rounded-xl shadow-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
               >
                 關閉
               </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {step < 3 && (
          <div className="p-5 border-t border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex gap-3">
             {step === 2 && (
               <button
                 onClick={() => setStep(1)}
                 className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
               >
                 上一步
               </button>
             )}
             <button
               onClick={step === 1 ? () => setStep(2) : handleSubmit}
               className="flex-1 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-orange-200 hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
             >
               {step === 1 ? '下一步' : '確認發布'}
               {step === 1 && <ChevronRight size={18} />}
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateActivityModal;
