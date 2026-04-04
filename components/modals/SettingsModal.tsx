import React, { useState } from 'react';
import { X, User, Bell, Lock, Shield, HelpCircle, LogOut, ChevronRight, Moon } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onDarkModeToggle: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, darkMode, onDarkModeToggle }) => {
  const [notifications, setNotifications] = useState(true);

  if (!isOpen) return null;

  const SettingItem = ({ icon: Icon, title, subtitle, onClick, rightElement }: any) => (
    <div
      onClick={onClick}
      className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-700 transition-colors cursor-pointer border-b border-gray-50 dark:border-gray-700 last:border-0"
    >
      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-gray-900 dark:text-white text-sm">{title}</h4>
        {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {rightElement || <ChevronRight size={18} className="text-gray-400 dark:text-gray-500" />}
    </div>
  );

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <div
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      className={`w-11 h-6 rounded-full flex items-center transition-colors p-1 cursor-pointer ${checked ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
    >
      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">設定</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">

          <div className="px-5 py-3 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-900/50">
            帳號設定
          </div>
          <div>
            <SettingItem icon={User} title="編輯個人檔案" subtitle="修改頭像、暱稱與簡介" />
            <SettingItem icon={Lock} title="帳號安全" subtitle="修改密碼、綁定手機" />
            <SettingItem icon={Shield} title="隱私設定" subtitle="管理誰可以看到您的活動記錄" />
          </div>

          <div className="px-5 py-3 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-900/50 mt-2">
            應用程式偏好
          </div>
          <div>
            <SettingItem
              icon={Bell}
              title="推播通知"
              subtitle="活動提醒、社團公告"
              rightElement={<Toggle checked={notifications} onChange={() => setNotifications(!notifications)} />}
            />
            <SettingItem
              icon={Moon}
              title="深色模式"
              subtitle="減輕眼睛疲勞"
              rightElement={<Toggle checked={darkMode} onChange={onDarkModeToggle} />}
            />
          </div>

          <div className="px-5 py-3 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-900/50 mt-2">
            其他
          </div>
          <div>
            <SettingItem icon={HelpCircle} title="幫助中心" subtitle="常見問題與客服" />
            <div className="p-4 mt-2">
               <button className="w-full py-3 border border-gray-200 dark:border-gray-600 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-100 dark:hover:border-red-800 transition-colors flex items-center justify-center gap-2">
                 <LogOut size={18} /> 登出帳號
               </button>
               <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-4">GoGo Sports v1.2.0</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
