import React, { useState } from 'react';
import { X, User, Bell, Lock, Shield, HelpCircle, LogOut, ChevronRight, Moon, ChevronLeft, Save } from 'lucide-react';
import { User as UserType } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onDarkModeToggle: () => void;
  user: UserType;
  onUpdateProfile: (data: { name?: string; bio?: string; phone?: string }) => Promise<void>;
  onLogout: () => Promise<void>;
}

type View = 'main' | 'editProfile';

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen, onClose, darkMode, onDarkModeToggle, user, onUpdateProfile, onLogout,
}) => {
  const [view, setView] = useState<View>('main');
  const [notifications, setNotifications] = useState(true);

  // Edit profile form state
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio ?? '');
  const [phone, setPhone] = useState(user.phone ?? '');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleOpenEdit = () => {
    setName(user.name);
    setBio(user.bio ?? '');
    setPhone(user.phone ?? '');
    setView('editProfile');
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await onUpdateProfile({ name: name.trim() || undefined, bio: bio.trim() || undefined, phone: phone.trim() || undefined });
      setView('main');
    } finally {
      setSaving(false);
    }
  };

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
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 flex-shrink-0">
          {view === 'editProfile' ? (
            <button onClick={() => setView('main')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400 transition-colors">
              <ChevronLeft size={20} />
            </button>
          ) : (
            <div className="w-9" />
          )}
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">
            {view === 'editProfile' ? '編輯個人檔案' : '設定'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">

          {view === 'main' && (
            <>
              <div className="px-5 py-3 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-900/50">
                帳號設定
              </div>
              <div>
                <SettingItem icon={User} title="編輯個人檔案" subtitle="修改暱稱、手機與簡介" onClick={handleOpenEdit} />
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
                  <button
                    onClick={onLogout}
                    className="w-full py-3 border border-gray-200 dark:border-gray-600 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-100 dark:hover:border-red-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut size={18} /> 登出帳號
                  </button>
                  <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-4">GoGo Sports v1.2.0</p>
                </div>
              </div>
            </>
          )}

          {view === 'editProfile' && (
            <div className="p-5 space-y-5">
              {/* Avatar preview */}
              <div className="flex justify-center">
                <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-md" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">暱稱</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  maxLength={50}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">手機號碼</label>
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="09xxxxxxxx"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">個人簡介</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  maxLength={200}
                  rows={3}
                  placeholder="介紹自己..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
                <p className="text-right text-[10px] text-gray-400 mt-1">{bio.length}/200</p>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={saving || !name.trim()}
                className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save size={16} />
                {saving ? '儲存中...' : '儲存變更'}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
