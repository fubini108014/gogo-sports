import React, { useState } from 'react';
import { Activity, RegistrationMode, ActivityStatus } from '../types';
import { X, CheckCircle, Car, AlertCircle, Info, ChevronRight, User as UserIcon } from 'lucide-react';

interface RegistrationModalProps {
  activity: Activity;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (group?: string) => void;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({ activity, isOpen, onClose, onConfirm }) => {
  const [step, setStep] = useState(1);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [transportation, setTransportation] = useState<string>('');
  const [formData, setFormData] = useState({
    realName: '',
    phone: '',
    emergencyContact: '',
    emergencyPhone: ''
  });

  if (!isOpen) return null;

  const isLimited = activity.mode === RegistrationMode.LIMITED;
  const totalParticipants = (activity.currentInternalCount || 0) + activity.currentAppCount;
  const isFull = isLimited && activity.maxParticipants ? totalParticipants >= activity.maxParticipants : false;

  // Logic for external quota display
  const availableSpots = isLimited && activity.maxParticipants
    ? activity.maxParticipants - totalParticipants
    : 999;

  const handleNext = () => {
    if (step === 1) {
      if (!isLimited && activity.groups && !selectedGroup) return; // Validation for group selection
    }
    setStep(step + 1);
  };

  const handleSubmit = () => {
    onConfirm(selectedGroup || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={onClose}></div>

      <div className="bg-white dark:bg-gray-800 w-full max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl pointer-events-auto transform transition-transform animate-slide-up sm:animate-fade-in overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">活動報名</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1 max-w-[200px]">{activity.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Progress Stepper */}
        {step < 3 && (
          <div className="bg-gray-50 dark:bg-gray-900 px-8 py-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between relative">
              {/* Background Line */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full -z-0"></div>

              {/* Active Line (Dynamic width) */}
              <div
                className="absolute top-1/2 left-0 h-1 bg-primary rounded-full -z-0 transition-all duration-500 ease-out"
                style={{ width: step === 1 ? '0%' : '100%' }}
              ></div>

              {/* Step 1 Indicator */}
              <div className={`relative z-10 flex flex-col items-center gap-1 transition-colors ${step >= 1 ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${step >= 1 ? 'bg-primary border-primary text-white shadow-md scale-110' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'}`}>
                  1
                </div>
                <span className="text-[10px] font-bold bg-gray-50 dark:bg-gray-900 dark:text-gray-300 px-1">選擇方案</span>
              </div>

              {/* Step 2 Indicator */}
              <div className={`relative z-10 flex flex-col items-center gap-1 transition-colors ${step >= 2 ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${step >= 2 ? 'bg-primary border-primary text-white shadow-md scale-110' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'}`}>
                  2
                </div>
                <span className="text-[10px] font-bold bg-gray-50 dark:bg-gray-900 dark:text-gray-300 px-1">填寫資料</span>
              </div>

               {/* Step 3 Indicator (Ghost for visual balance) */}
               <div className={`relative z-10 flex flex-col items-center gap-1 transition-colors text-gray-400 dark:text-gray-500`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500`}>
                  3
                </div>
                <span className="text-[10px] font-bold bg-gray-50 dark:bg-gray-900 dark:text-gray-300 px-1">完成</span>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">

          {/* Step 1: Selection & Logistics */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              {/* Info Alert */}
              <div className={`p-4 rounded-xl border flex gap-3 ${isFull ? 'bg-red-50 border-red-100 text-red-700' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 text-blue-700 dark:text-blue-300'}`}>
                {isFull ? <AlertCircle size={20} className="flex-shrink-0" /> : <Info size={20} className="flex-shrink-0" />}
                <div className="text-sm leading-relaxed">
                  {isFull
                    ? `目前名額已滿，您將登記為「候補第 ${totalParticipants - (activity.maxParticipants || 0) + 1} 順位」。`
                    : isLimited
                      ? `目前剩餘 ${availableSpots} 個名額 (已扣除外部預留)。`
                      : `本活動採開放報名，目前已有 ${totalParticipants} 人參加！`
                  }
                </div>
              </div>

              {/* Group Selection (For Open Mode or if groups exist) */}
              {(activity.groups && activity.groups.length > 0) ? (
                <div>
                  <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">選擇組別</label>
                  <div className="grid grid-cols-1 gap-2">
                    {activity.groups.map(group => (
                      <label key={group} className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all group ${selectedGroup === group ? 'border-primary bg-orange-50' : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${selectedGroup === group ? 'border-primary' : 'border-gray-300 dark:border-gray-600'}`}>
                          {selectedGroup === group && <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>}
                        </div>
                        <input
                          type="radio"
                          name="group"
                          value={group}
                          checked={selectedGroup === group}
                          onChange={(e) => setSelectedGroup(e.target.value)}
                          className="hidden"
                        />
                        <span className={`font-bold ${selectedGroup === group ? 'text-primary' : 'text-gray-700 dark:text-gray-200'}`}>{group}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">此活動不需分組，直接點擊下一步。</span>
                </div>
              )}

              {/* Transportation (For Open/Outdoor) */}
              {(!isLimited || activity.tags.includes('登山') || activity.tags.includes('戶外')) && (
                 <div>
                  <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                    <Car size={18} /> 交通方式 (共乘統計)
                  </label>
                  <div className="relative">
                    <select
                      className="w-full p-3 pl-4 border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none bg-white appearance-none font-medium text-gray-700"
                      value={transportation}
                      onChange={(e) => setTransportation(e.target.value)}
                    >
                      <option value="">請選擇...</option>
                      <option value="driver">我是車手 (可載人)</option>
                      <option value="passenger">我是乘客 (需要車位)</option>
                      <option value="self">自行前往</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500">
                      <ChevronRight size={16} className="rotate-90" />
                    </div>
                  </div>

                  {transportation === 'driver' && (
                    <div className="mt-3 animate-fade-in">
                       <input
                         type="number"
                         placeholder="包含您自己，總共可載幾人？"
                         className="w-full p-3 border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none"
                       />
                    </div>
                  )}
                  {transportation === 'passenger' && (
                     <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-2 rounded-lg flex items-center gap-2 animate-fade-in">
                        <Info size={14} /> 系統將依據居住區域協助配對，請留意通知。
                     </div>
                  )}
                 </div>
              )}
            </div>
          )}

          {/* Step 2: Personal Info & Insurance */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl flex gap-3">
                <UserIcon size={20} className="text-yellow-600 flex-shrink-0" />
                <div className="text-xs text-yellow-800 leading-relaxed">
                  為了辦理保險與緊急聯繫，請務必填寫<span className="font-bold">真實姓名</span>。您的個資僅供主揪與系統管理員查看，並受到嚴格保護。
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">真實姓名</label>
                  <input
                    type="text"
                    value={formData.realName}
                    onChange={e => setFormData({...formData, realName: e.target.value})}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 border border-gray-200 rounded-xl focus:bg-white dark:focus:bg-gray-600 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                    placeholder="例如：王小明"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5">聯絡電話</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 border border-gray-200 rounded-xl focus:bg-white dark:focus:bg-gray-600 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                    placeholder="09xx-xxx-xxx"
                  />
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-700 mt-2">
                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">緊急聯絡人資訊</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">姓名</label>
                          <input
                            type="text"
                            value={formData.emergencyContact}
                            onChange={e => setFormData({...formData, emergencyContact: e.target.value})}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 border border-gray-200 rounded-xl focus:bg-white dark:focus:bg-gray-600 focus:border-primary outline-none transition-colors text-sm"
                            placeholder="聯絡人姓名"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">電話</label>
                          <input
                            type="tel"
                            value={formData.emergencyPhone}
                            onChange={e => setFormData({...formData, emergencyPhone: e.target.value})}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 border border-gray-200 rounded-xl focus:bg-white dark:focus:bg-gray-600 focus:border-primary outline-none transition-colors text-sm"
                            placeholder="聯絡人電話"
                          />
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center py-6 animate-fade-in h-full flex flex-col justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm animate-bounce-small">
                <CheckCircle size={40} className="text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">報名成功！</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 px-4 leading-relaxed">
                已將您加入活動名單。請留意 Line 通知，活動前 24 小時將發送行前提醒。
              </p>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-5 text-left space-y-3 border border-gray-100 dark:border-gray-700 shadow-sm mx-2">
                 <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-600 border-dashed">
                    <span className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">活動名稱</span>
                    <span className="font-bold text-gray-900 dark:text-white text-sm text-right line-clamp-1 pl-4">{activity.title}</span>
                 </div>
                 <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-600 border-dashed">
                    <span className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">日期</span>
                    <span className="font-bold text-gray-900 dark:text-white text-sm">{activity.date}</span>
                 </div>
                 {!isLimited && selectedGroup && (
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">組別</span>
                        <span className="font-bold text-primary text-sm bg-orange-50 px-2 py-0.5 rounded">{selectedGroup}</span>
                    </div>
                 )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-4 border-t border-gray-50 dark:border-gray-700 bg-white dark:bg-gray-800">
          {step === 1 && (
             <button
              onClick={handleNext}
              disabled={(!isLimited && activity.groups && activity.groups.length > 0 && !selectedGroup)}
              className="w-full py-3.5 bg-gray-900 dark:bg-gray-700 text-white font-bold rounded-xl shadow-lg hover:bg-gray-800 dark:hover:bg-gray-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:shadow-none transition-all flex items-center justify-center gap-2 group"
             >
               下一步 <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
             </button>
          )}
          {step === 2 && (
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all"
              >
                上一步
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-[2] py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all active:scale-95"
              >
                確認報名
              </button>
            </div>
          )}
          {step === 3 && (
            <button
              onClick={handleSubmit}
              className="w-full py-3.5 bg-gray-900 dark:bg-gray-700 text-white font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors shadow-lg"
            >
              完成並關閉
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationModal;
