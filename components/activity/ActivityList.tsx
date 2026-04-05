import React from 'react';
import { Activity } from '../../types';
import ActivityCard from './ActivityCard';
import { ActivityCardSkeleton } from '../ui/Skeleton';
import { useSkeletonLoading } from '../../hooks/useSkeletonLoading';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { Filter, Loader2 } from 'lucide-react';

interface ActivityListProps {
  activities: Activity[];
  onActivityClick: (activity: Activity) => void;
  searchTerm?: string;
  isLoading?: boolean;
  onEmptyAction?: () => void;
}

const ActivityList: React.FC<ActivityListProps> = ({
  activities,
  onActivityClick,
  searchTerm = '',
  isLoading: externalLoading,
  onEmptyAction,
}) => {
  const isLoading = useSkeletonLoading(externalLoading);
  const { displayCount, isMoreLoading, sentinelRef } = useInfiniteScroll(
    activities.length,
    isLoading
  );

  const formatDividerDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
      const month = d.getMonth() + 1;
      const day = d.getDate();
      const weekDay = weekDays[d.getDay()];
      return `${month}月${day}日 (${weekDay})`;
    } catch (e) {
      return dateStr;
    }
  };

  const lastDateRef = React.useRef<string>('');

  return (
    <div className="animate-fade-in pb-10">
      {/* Activity Grid */}
      <div className="space-y-8">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6 sm:gap-x-6">
            {Array.from({ length: 6 }).map((_, i) => <ActivityCardSkeleton key={i} variant="compact" />)}
          </div>
        ) : activities.length > 0 ? (
          (() => {
            let lastDate = '';
            const groups: { date: string; items: Activity[] }[] = [];
            
            // Group activities by date
            activities.slice(0, displayCount).forEach(activity => {
              if (activity.date !== lastDate) {
                lastDate = activity.date;
                groups.push({ date: lastDate, items: [activity] });
              } else {
                groups[groups.length - 1].items.push(activity);
              }
            });

            return groups.map((group, groupIndex) => (
              <div key={group.date} className="relative">
                {/* Sticky Date Floating Pill */}
                <div className="sticky top-[310px] z-[40] flex justify-center mb-6 pointer-events-none">
                  <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md px-4 py-1.5 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 flex items-center gap-3 pointer-events-auto">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                    <span className="text-xs font-black text-gray-900 dark:text-white tracking-tight">
                      {formatDividerDate(group.date)}
                    </span>
                    {group.date === new Date().toISOString().split('T')[0] && (
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                        Today
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 border-l border-gray-100 dark:border-gray-700 pl-3 ml-1 uppercase tracking-widest">
                      {group.items.length} 
                    </span>
                  </div>
                </div>

                {/* Cards Grid for this date */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6 sm:gap-x-6 px-0 mt-2">
                  {group.items.map((activity) => (
                    <ActivityCard
                      key={activity.id}
                      activity={activity}
                      onClick={() => onActivityClick(activity)}
                      searchQuery={searchTerm}
                      variant="compact"
                    />
                  ))}
                </div>
              </div>
            ));
          })()
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter size={24} className="text-gray-300 dark:text-gray-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-bold">目前 7 天內暫無符合的活動</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 mb-6">要不要看看下週的活動？</p>
            
            {onEmptyAction && (
              <button 
                onClick={onEmptyAction}
                className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark transition-all shadow-md active:scale-95 flex items-center gap-2 mx-auto"
              >
                查看下週 (+7 天)
              </button>
            )}
          </div>
        )}
      </div>

      {/* Infinite Scroll Sentinel */}
      {!isLoading && activities.length > displayCount && (
        <div
          ref={sentinelRef}
          className="flex flex-col items-center justify-center py-16 mt-4 min-h-[100px] w-full"
        >
          <div className="flex items-center gap-2 text-primary font-bold text-sm animate-pulse">
            <Loader2 className="animate-spin" size={20} />
            正在載入更多活動...
          </div>
          <div className="text-[10px] text-gray-400 mt-2 font-bold tracking-widest uppercase">
            Keep scrolling to see {activities.length - displayCount} more
          </div>
        </div>
      )}

      {/* End of results */}
      {!isLoading && activities.length > 0 && activities.length <= displayCount && (
        <div className="py-12 flex flex-col items-center justify-center">
          <div className="w-1.5 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mb-4"></div>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-bold">已顯示所有搜尋結果</p>
        </div>
      )}
    </div>
  );
};

export default ActivityList;
