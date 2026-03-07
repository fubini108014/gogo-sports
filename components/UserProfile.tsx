import React, { useState } from 'react';
import { User, Activity, Club } from '../types';
import ActivityCard from './ActivityCard';
import { ChevronLeft, Settings, Users, ShieldCheck, ChevronRight, XCircle, LogOut, Pencil, Check, X } from 'lucide-react';

interface UserProfileProps {
  user: User;
  activities: Activity[];
  clubs: Club[];
  myActivityIds: string[];
  onBack: () => void;
  onActivityClick: (activity: Activity) => void;
  onClubClick: (clubId: string) => void;
  onCancelRegistration: (activityId: string) => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  onUpdateProfile: (data: { name?: string }) => Promise<void>;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, activities, clubs, myActivityIds, onBack, onActivityClick, onClubClick, onCancelRegistration, onOpenSettings, onLogout, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState<'activities' | 'clubs'>('activities');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editSaving, setEditSaving] = useState(false);

  const handleSaveProfile = async () => {
    if (!editName.trim() || editName.trim() === user.name) { setIsEditing(false); return; }
    setEditSaving(true);
    try {
      await onUpdateProfile({ name: editName.trim() });
      setIsEditing(false);
    } finally {
      setEditSaving(false);
    }
  };

  const myActivities = activities.filter(a => myActivityIds.includes(a.id));

  // Sort: Upcoming first
  const upcomingActivities = myActivities.filter(a => new Date(a.date) >= new Date()).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const pastActivities = myActivities.filter(a => new Date(a.date) < new Date()).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filter Clubs
  const managedClubs = clubs.filter(c => user.managedClubIds.includes(c.id));
  const joinedClubs = clubs.filter(c => user.joinedClubIds.includes(c.id) && !user.managedClubIds.includes(c.id));

  return (
    <div className="animate-fade-in pb-20">
       {/* Header */}
       <div className="bg-white dark:bg-gray-800 p-4 sticky top-0 z-10 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
         <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <ChevronLeft size={24} className="text-gray-900 dark:text-white"/>
         </button>
         <h1 className="font-bold text-lg">我的個人檔案</h1>
         <div className="flex items-center gap-1">
           <button
             onClick={onOpenSettings}
             className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400"
           >
             <Settings size={20} />
           </button>
           <button
             onClick={onLogout}
             className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors text-gray-500 dark:text-gray-400 hover:text-red-500"
             title="登出"
           >
             <LogOut size={20} />
           </button>
         </div>
       </div>

       {/* Profile Card */}
       <div className="px-4 py-6 bg-white dark:bg-gray-800 mb-2">
         <div className="flex items-center gap-4">
            <img src={user.avatar} className="w-20 h-20 rounded-full object-cover border-4 border-gray-50 dark:border-gray-700" alt={user.name} />
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSaveProfile(); if (e.key === 'Escape') setIsEditing(false); }}
                    className="flex-1 text-lg font-bold border-b-2 border-primary bg-transparent text-gray-900 dark:text-white outline-none min-w-0"
                    maxLength={50}
                  />
                  <button onClick={handleSaveProfile} disabled={editSaving} className="p-1 text-green-500 hover:text-green-600 disabled:opacity-50">
                    <Check size={18} />
                  </button>
                  <button onClick={() => { setIsEditing(false); setEditName(user.name); }} className="p-1 text-gray-400 hover:text-gray-600">
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">{user.name}</h2>
                  <button onClick={() => { setEditName(user.name); setIsEditing(true); }} className="p-1 text-gray-400 hover:text-primary transition-colors flex-shrink-0">
                    <Pencil size={14} />
                  </button>
                </div>
              )}
              <div className="flex gap-2 mt-2">
                <span className="text-xs bg-orange-50 text-primary px-2 py-1 rounded-lg font-bold">一般會員</span>
                {user.isClubAdmin && <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-lg font-bold">社團管理員</span>}
              </div>
            </div>
         </div>
       </div>

       {/* Tabs */}
       <div className="flex border-b border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 sticky top-[60px] z-10">
          <button
            onClick={() => setActiveTab('activities')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'activities' ? 'border-primary text-primary' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
          >
             我的活動
          </button>
          <button
             onClick={() => setActiveTab('clubs')}
             className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'clubs' ? 'border-primary text-primary' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
          >
             我的社團
          </button>
       </div>

       {/* Content */}
       <div className="p-4">
          {activeTab === 'activities' && (
             <div className="space-y-6">
                <div>
                   <h3 className="font-bold text-gray-900 dark:text-white mb-3 pl-1 border-l-4 border-primary">即將參加 ({upcomingActivities.length})</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {upcomingActivities.length > 0 ? upcomingActivities.map(activity => (
                         <div key={activity.id} className="relative">
                           <ActivityCard activity={activity} onClick={() => onActivityClick(activity)} />
                           <button
                             onClick={(e) => {
                               e.stopPropagation();
                               if (window.confirm(`確定要取消「${activity.title}」的報名嗎？`)) {
                                 onCancelRegistration(activity.id);
                               }
                             }}
                             className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 text-xs font-bold px-2 py-1 rounded-full shadow hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                           >
                             <XCircle size={12} /> 取消報名
                           </button>
                         </div>
                      )) : (
                         <p className="text-gray-400 dark:text-gray-500 text-sm py-4">目前沒有即將參加的活動</p>
                      )}
                   </div>
                </div>

                {pastActivities.length > 0 && (
                   <div className="opacity-75">
                      <h3 className="font-bold text-gray-500 dark:text-gray-400 mb-3 pl-1 border-l-4 border-gray-300">歷史活動 ({pastActivities.length})</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {pastActivities.map(activity => (
                            <ActivityCard key={activity.id} activity={activity} onClick={() => onActivityClick(activity)} />
                         ))}
                      </div>
                   </div>
                )}
             </div>
          )}

          {activeTab === 'clubs' && (
             <div className="space-y-6">
                {managedClubs.length > 0 && (
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-3 pl-1 border-l-4 border-gray-900 dark:border-gray-200 flex items-center gap-2">
                       我管理的社團 <ShieldCheck size={16} />
                    </h3>
                    <div className="space-y-3">
                      {managedClubs.map(club => (
                        <div
                          key={club.id}
                          onClick={() => onClubClick(club.id)}
                          className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm flex items-center gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                           <img src={club.logo} className="w-14 h-14 rounded-lg object-cover bg-gray-100 dark:bg-gray-700" />
                           <div className="flex-1">
                              <h4 className="font-bold text-gray-900 dark:text-white">{club.name}</h4>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex gap-3">
                                 <span>{club.membersCount} 成員</span>
                                 <span>★ {club.rating}</span>
                              </div>
                           </div>
                           <div className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded text-xs font-bold">
                              社長
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                   <h3 className="font-bold text-gray-900 dark:text-white mb-3 pl-1 border-l-4 border-primary flex items-center gap-2">
                      我加入的社團 <Users size={16} />
                   </h3>
                   <div className="space-y-3">
                      {joinedClubs.length > 0 ? joinedClubs.map(club => (
                        <div
                          key={club.id}
                          onClick={() => onClubClick(club.id)}
                          className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                           <img src={club.logo} className="w-14 h-14 rounded-lg object-cover bg-gray-100 dark:bg-gray-700" />
                           <div className="flex-1">
                              <h4 className="font-bold text-gray-900 dark:text-white">{club.name}</h4>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex gap-3">
                                 <span>{club.membersCount} 成員</span>
                                 <span>★ {club.rating}</span>
                              </div>
                           </div>
                           <ChevronRight size={20} className="text-gray-300 dark:text-gray-500" />
                        </div>
                      )) : (
                         <p className="text-gray-400 dark:text-gray-500 text-sm py-4">尚未加入任何社團</p>
                      )}
                   </div>
                </div>
             </div>
          )}
       </div>

    </div>
  );
};

export default UserProfile;
