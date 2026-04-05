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
}

const ActivityList: React.FC<ActivityListProps> = ({
  activities,
  onActivityClick,
  searchTerm = '',
  isLoading: externalLoading,
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

  let lastDate = '';

  return (
    <div className="animate-fade-in pb-10">
      {/* Activity Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6 sm:gap-x-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <ActivityCardSkeleton key={i} variant="compact" />)
        ) : activities.length > 0 ? (
          activities.slice(0, displayCount).map((activity, index) => {
            const currentDate = activity.date;
            const showDivider = currentDate !== lastDate;
            lastDate = currentDate;

            return (
              <React.Fragment key={activity.id}>
                {showDivider && (
                  <div className="col-span-full flex items-center gap-4 pt-8 pb-4">
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800"></div>
                    <span className="flex-shrink-0 text-[11px] font-black text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-900 px-4 py-1.5 rounded-full border border-gray-100 dark:border-gray-800 shadow-sm tracking-widest uppercase">
                      {formatDividerDate(currentDate)}
                    </span>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800"></div>
                  </div>
                )}
                <ActivityCard
                  activity={activity}
                  onClick={() => onActivityClick(activity)}
                  searchQuery={searchTerm}
                  variant="compact"
                />
              </React.Fragment>
            );
          })
        ) : (
          <div className="col-span-full text-center py-20">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <Filter size={24} className="text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">沒有符合條件的活動</p>
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
