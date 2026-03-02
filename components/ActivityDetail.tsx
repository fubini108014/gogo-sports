import React from 'react';
import { Activity, Club, RegistrationMode, ActivityStatus } from '../types';
import { ChevronLeft, MapPin, Calendar, Clock, DollarSign, Users, Zap, CheckCircle, Tag } from 'lucide-react';

interface ActivityDetailProps {
  activity: Activity;
  club: Club | undefined;
  isRegistered: boolean;
  onBack: () => void;
  onRegisterClick: () => void;
  onClubClick: (clubId: string) => void;
}

const ActivityDetail: React.FC<ActivityDetailProps> = ({
  activity,
  club,
  isRegistered,
  onBack,
  onRegisterClick,
  onClubClick,
}) => {
  const isLimited = activity.mode === RegistrationMode.LIMITED;
  const totalCount = (activity.currentInternalCount || 0) + activity.currentAppCount;
  const percentage = isLimited && activity.maxParticipants
    ? Math.min((totalCount / activity.maxParticipants) * 100, 100)
    : 0;
  const isFull = activity.status === ActivityStatus.FULL;
  const isCancelled = activity.status === ActivityStatus.CANCELLED;
  const isEnded = activity.status === ActivityStatus.ENDED;

  const statusBadge = () => {
    if (isFull) return { label: '已額滿', color: 'bg-red-500 text-white' };
    if (isCancelled) return { label: '已取消', color: 'bg-gray-500 text-white' };
    if (isEnded) return { label: '已結束', color: 'bg-gray-400 text-white' };
    return { label: '報名中', color: 'bg-green-500 text-white' };
  };

  const { label: statusLabel, color: statusColor } = statusBadge();

  const canRegister = !isRegistered && !isFull && !isCancelled && !isEnded;

  return (
    <div className="animate-fade-in bg-gray-50 dark:bg-gray-900 min-h-screen pb-32">
      {/* Hero Image */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={activity.image}
          alt={activity.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
        >
          <ChevronLeft size={22} />
        </button>

        {/* Top Badges */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor}`}>
            {statusLabel}
          </span>
        </div>

        {/* Bottom overlay info */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex gap-2 mb-2">
            <span className="bg-black/60 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-md">
              {activity.level}
            </span>
            {activity.mode === RegistrationMode.OPEN && (
              <span className="bg-secondary text-gray-900 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                <Zap size={10} fill="currentColor" /> 開放揪團
              </span>
            )}
          </div>
          <h1 className="text-white font-black text-xl md:text-2xl leading-tight drop-shadow-md">
            {activity.title}
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-5 space-y-4">

        {/* Club Info Card */}
        {club && (
          <div
            onClick={() => onClubClick(club.id)}
            className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
          >
            <img src={club.logo} className="w-12 h-12 rounded-full object-cover bg-gray-100 dark:bg-gray-700" alt={club.name} />
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">主辦社團</p>
              <p className="font-bold text-gray-900 dark:text-white">{club.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-yellow-500 font-bold">★ {club.rating}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{club.membersCount} 成員</span>
              </div>
            </div>
            <ChevronLeft size={18} className="text-gray-400 dark:text-gray-500 rotate-180" />
          </div>
        )}

        {/* Info Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Calendar size={15} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">日期</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{activity.date}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Clock size={15} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">時間</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{activity.time}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <DollarSign size={15} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">費用</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">NT$ {activity.price}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin size={15} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">地點</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2">{activity.location}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Registration Status */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Users size={16} className="text-primary" />
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">報名狀況</h3>
          </div>

          {isLimited ? (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500 dark:text-gray-400">已報名</span>
                <span className={`font-black text-lg ${isFull ? 'text-red-500' : 'text-primary'}`}>
                  {totalCount}
                  <span className="text-xs font-normal text-gray-400 dark:text-gray-500"> / {activity.maxParticipants}</span>
                </span>
              </div>
              <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${isFull ? 'bg-red-500' : 'bg-primary'}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              {activity.currentInternalCount && activity.currentInternalCount > 0 && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                  含 {activity.currentInternalCount} 人透過 Line/FB 預留
                </p>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <img src={`https://picsum.photos/seed/${activity.id + i}/50/50`} className="w-full h-full object-cover" alt="" />
                    </div>
                  ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  已有 <span className="text-primary font-black">{totalCount}</span> 人參加
                </span>
              </div>
              {activity.groups && activity.groups.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">可選組別</p>
                  <div className="flex flex-wrap gap-2">
                    {activity.groups.map(group => (
                      <span
                        key={group}
                        className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold border border-primary/20"
                      >
                        {group}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3">活動說明</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
            {activity.description}
          </p>
        </div>

        {/* Tags */}
        {activity.tags.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Tag size={15} className="text-gray-400 dark:text-gray-500" />
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">標籤</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {activity.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-bold"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 py-4 shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">活動費用</p>
            <p className="text-xl font-black text-gray-900 dark:text-white">
              NT$ {activity.price}
              <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">/ 人</span>
            </p>
          </div>

          {isRegistered ? (
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-6 py-3 rounded-2xl border border-green-200 dark:border-green-800 font-bold">
              <CheckCircle size={18} />
              已報名
            </div>
          ) : (
            <button
              onClick={canRegister ? onRegisterClick : undefined}
              disabled={!canRegister}
              className={`px-8 py-3 rounded-2xl font-bold text-sm transition-all ${
                canRegister
                  ? 'bg-primary text-white hover:bg-orange-600 active:scale-95 shadow-lg shadow-orange-200 dark:shadow-orange-900/30'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              {isFull ? '已額滿' : isCancelled ? '已取消' : isEnded ? '已結束' : '立即報名'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityDetail;
