import React from 'react';
import { Activity, RegistrationMode, ActivityStatus } from '../types';
import { MapPin, Calendar, User, Zap } from 'lucide-react';

interface ActivityCardProps {
  activity: Activity;
  onClick: () => void;
  searchQuery?: string;
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

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onClick, searchQuery = '' }) => {
  const isLimited = activity.mode === RegistrationMode.LIMITED;
  const totalCount = (activity.currentInternalCount || 0) + activity.currentAppCount;
  const percentage = isLimited && activity.maxParticipants
    ? Math.min((totalCount / activity.maxParticipants) * 100, 100)
    : 0;

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer h-full flex flex-col"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={activity.image}
          alt={activity.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
           <span className="bg-black/60 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-md">
             {activity.level}
           </span>
           {activity.mode === RegistrationMode.OPEN && (
              <span className="bg-secondary text-gray-900 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                 <Zap size={10} fill="currentColor" /> 開放揪團
              </span>
           )}
        </div>
        <div className="absolute bottom-3 right-3">
           <span className="bg-white/90 dark:bg-gray-900/90 backdrop-blur text-primary font-bold text-sm px-3 py-1 rounded-full shadow-sm">
             ${activity.price}
           </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight mb-2 line-clamp-2">
          {highlightText(activity.title, searchQuery)}
        </h3>

        <div className="space-y-2 mb-4 flex-1">
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
            <Calendar size={14} className="mr-2 text-primary" />
            {activity.date} • {activity.time}
          </div>
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
            <MapPin size={14} className="mr-2 text-primary" />
            <span className="line-clamp-1">{highlightText(activity.location, searchQuery)}</span>
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-auto">
          {isLimited ? (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500 dark:text-gray-400 font-medium">報名狀況</span>
                <span className={`font-bold ${totalCount >= (activity.maxParticipants || 0) ? 'text-red-500' : 'text-primary'}`}>
                  {totalCount} / {activity.maxParticipants}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${totalCount >= (activity.maxParticipants || 0) ? 'bg-red-500' : 'bg-primary'}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          ) : (
             <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                       <img src={`https://picsum.photos/seed/${activity.id + i}/50/50`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                   <span className="text-primary font-bold">{totalCount}</span> 人已參加
                </span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
