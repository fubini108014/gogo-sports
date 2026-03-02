import React, { useState, useEffect, useRef } from 'react';
import { Activity } from '../types';
import ActivityCard from './ActivityCard';
import { ActivityCardSkeleton } from './Skeleton';
import { Filter, Loader2 } from 'lucide-react';

interface ActivityListProps {
  activities: Activity[];
  onActivityClick: (activity: Activity) => void;
  searchTerm?: string;
}

const ActivityList: React.FC<ActivityListProps> = ({ 
  activities, 
  onActivityClick, 
  searchTerm = '' 
}) => {
  // Skeleton loading state (simulate initial load)
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  // Pagination state
  const [displayCount, setDisplayCount] = useState(6);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const observerTarget = useRef(null);

  useEffect(() => {
    setDisplayCount(6);
  }, [activities, searchTerm]);

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    if (isLoading) return;

    const observer = new IntersectionObserver(
      entries => {
        const target = entries[0];
        if (target.isIntersecting && activities.length > displayCount && !isMoreLoading) {
          console.log('Sentinel intersected, loading more...');
          loadMore();
        }
      },
      { 
        root: null, // use the browser viewport
        rootMargin: '200px', // trigger 200px before reaching the bottom
        threshold: 0.01 
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
      observer.disconnect();
    };
  }, [activities.length, displayCount, isMoreLoading, isLoading]);

  const loadMore = () => {
    if (isMoreLoading) return;
    setIsMoreLoading(true);
    // Simulate network delay
    setTimeout(() => {
      setDisplayCount(prev => Math.min(prev + 6, activities.length));
      setIsMoreLoading(false);
    }, 600);
  };

  return (
    <div className="animate-fade-in pb-10">
      {/* Activity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <ActivityCardSkeleton key={i} />)
        ) : activities.length > 0 ? (
          activities.slice(0, displayCount).map(activity => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onClick={() => onActivityClick(activity)}
              searchQuery={searchTerm}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-20">
             <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
               <Filter size={24} className="text-gray-400 dark:text-gray-500" />
             </div>
             <p className="text-gray-500 dark:text-gray-400 text-sm">沒有符合條件的活動</p>
          </div>
        )}
      </div>

      {/* Infinite Scroll Sentinel - Added min-height to ensure detection */}
      {!isLoading && activities.length > displayCount && (
        <div 
          ref={observerTarget} 
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

      {/* End of results hint */}
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
