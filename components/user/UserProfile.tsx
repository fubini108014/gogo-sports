import React, { useState } from 'react';
import { User, Activity, Club } from '../../types';
import ActivityCard from '../activity/ActivityCard';
import ProfileCard from './ProfileCard';
import ClubListItem from '../club/ClubListItem';
import { ChevronLeft, Settings, Users, ShieldCheck, XCircle, LogOut } from 'lucide-react';

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
       <ProfileCard user={user} onSave={onUpdateProfile} />

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
                   <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {upcomingActivities.length > 0 ? upcomingActivities.map(activity => (
                         <div key={activity.id} className="relative">
                           <ActivityCard activity={activity} onClick={() => onActivityClick(activity)} variant="compact" />
                           <button
                             onClick={(e) => {
                               e.stopPropagation();
                               if (window.confirm(`確定要取消「${activity.title}」的報名嗎？`)) {
                                 onCancelRegistration(activity.id);
                               }
                             }}
                             className="absolute top-1 right-1 z-10 flex items-center gap-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                           >
                             <XCircle size={10} /> 取消
                           </button>
                         </div>
                      )) : (
                         <p className="text-gray-400 dark:text-gray-500 text-sm py-4 col-span-full">目前沒有即將參加的活動</p>
                      )}
                   </div>
                </div>

                {pastActivities.length > 0 && (
                   <div className="opacity-75">
                      <h3 className="font-bold text-gray-500 dark:text-gray-400 mb-3 pl-1 border-l-4 border-gray-300">歷史活動 ({pastActivities.length})</h3>
                      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                         {pastActivities.map(activity => (
                            <ActivityCard key={activity.id} activity={activity} onClick={() => onActivityClick(activity)} variant="compact" />
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
                        <ClubListItem key={club.id} club={club} onClick={() => onClubClick(club.id)} variant="managed" />
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
                      <ClubListItem key={club.id} club={club} onClick={() => onClubClick(club.id)} variant="joined" />
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
