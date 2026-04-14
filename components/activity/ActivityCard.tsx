import React from 'react';
import { Activity, RegistrationMode } from '../../types';
import { MapPin, Calendar, Zap } from 'lucide-react';
import ParticipantAvatars from '../ui/ParticipantAvatars';

interface ActivityCardProps {
  activity: Activity;
  onClick: () => void;
  searchQuery?: string;
  variant?: 'default' | 'compact';
}

const highlightText = (text: string, query: string) => {
  if (!query.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase()
          ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-700 text-gray-900 dark:text-white rounded px-0.5 not-italic">{part}</mark>
          : part
      )}
    </>
  );
};

const ActivityCard: React.FC<ActivityCardProps> = ({ 
  activity, 
  onClick, 
  searchQuery = '',
  variant = 'default'
}) => {
  const isCompact = variant === 'compact';
  const isLimited = activity.mode === RegistrationMode.LIMITED;
  const totalCount = (activity.currentInternalCount || 0) + activity.currentAppCount;
  const percentage = isLimited && activity.maxParticipants
    ? Math.min((totalCount / activity.maxParticipants) * 100, 100)
    : 0;

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer h-full flex flex-col ${isCompact ? 'rounded-xl' : ''}`}
    >
      <div className={`relative overflow-hidden ${isCompact ? 'h-32' : 'h-48'}`}>
        <img
          src={activity.image}
          alt={activity.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className={`absolute top-2 left-2 flex flex-wrap gap-1.5 ${isCompact ? 'top-2 left-2' : 'top-3 left-3 gap-2'}`}>
           <span className={`bg-black/60 backdrop-blur text-white font-bold rounded-md ${isCompact ? 'text-[8px] px-1.5 py-0.5' : 'text-[10px] px-2 py-1'}`}>
             {activity.level}
           </span>
           {activity.mode === RegistrationMode.OPEN && (
              <span className={`bg-secondary text-gray-900 font-bold rounded-md flex items-center gap-1 ${isCompact ? 'text-[8px] px-1.5 py-0.5' : 'text-[10px] px-2 py-1'}`}>
                 <Zap size={isCompact ? 8 : 10} fill="currentColor" /> 開放揪團
              </span>
           )}
        </div>
        <div className={`absolute bottom-2 right-2 ${isCompact ? 'bottom-2 right-2' : 'bottom-3 right-3'}`}>
           <span className={`bg-white/90 dark:bg-gray-900/90 backdrop-blur text-primary font-bold rounded-full shadow-sm ${isCompact ? 'text-[10px] px-2 py-0.5' : 'text-sm px-3 py-1'}`}>
             ${activity.price}
           </span>
        </div>
      </div>

      <div className={`${isCompact ? 'p-3' : 'p-4'} flex flex-col flex-1`}>
        <h3 className={`font-bold text-gray-900 dark:text-white leading-tight mb-2 line-clamp-2 ${isCompact ? 'text-sm' : 'text-lg'}`}>
          {highlightText(activity.title, searchQuery)}
        </h3>

        <div className={`flex-1 ${isCompact ? 'space-y-1 mb-3' : 'space-y-2 mb-4'}`}>
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
            <Calendar size={isCompact ? 12 : 14} className={`mr-2 text-primary ${isCompact ? 'mr-1.5' : 'mr-2'}`} />
            <span className={isCompact ? 'text-[10px]' : ''}>{activity.date} • {activity.time}</span>
          </div>
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
            <MapPin size={isCompact ? 12 : 14} className={`mr-2 text-primary ${isCompact ? 'mr-1.5' : 'mr-2'}`} />
            <span className={`line-clamp-1 ${isCompact ? 'text-[10px]' : ''}`}>{highlightText(activity.location, searchQuery)}</span>
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-auto">
          {isLimited ? (
            <div>
              <div className={`flex justify-between mb-1 ${isCompact ? 'text-[9px]' : 'text-xs'}`}>
                <span className="text-gray-500 dark:text-gray-400 font-medium">報名狀況</span>
                <span className={`font-bold ${totalCount >= (activity.maxParticipants || 0) ? 'text-red-500' : 'text-primary'}`}>
                  {totalCount} / {activity.maxParticipants}
                </span>
              </div>
              <div className={`w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden ${isCompact ? 'h-1.5' : 'h-2'}`}>
                <div
                  className={`h-full rounded-full ${totalCount >= (activity.maxParticipants || 0) ? 'bg-red-500' : 'bg-primary'}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <ParticipantAvatars
              activityId={activity.id}
              count={totalCount}
              size={isCompact ? 'sm' : 'md'}
              maxDisplay={3}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
