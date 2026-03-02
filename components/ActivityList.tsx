import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Activity, ActivityStatus } from '../types';
import { SportCategory } from '../constants';
import ActivityCard from './ActivityCard';
import ActivityFilterModal from './ActivityFilterModal';
import { ActivityCardSkeleton } from './Skeleton';
import { Search, ChevronLeft, Filter, X } from 'lucide-react';

interface ActivityListProps {
  activities: Activity[];
  categories: SportCategory[];
  onActivityClick: (activity: Activity) => void;
  onBack: () => void;
}

const ActivityList: React.FC<ActivityListProps> = ({ activities, categories, onActivityClick, onBack }) => {
  const location = useLocation();
  const initialState = location.state || {};

  const [searchTerm, setSearchTerm] = useState(initialState.searchTerm || '');
  const [mainCategory, setMainCategory] = useState(initialState.mainCategory || '所有運動');
  const [subCategory, setSubCategory] = useState<string | null>(initialState.subCategory || null);

  // Advanced Filters State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    city: initialState.location || '全台灣',
    date: initialState.date || '',
    minPrice: initialState.minPrice || '',
    maxPrice: initialState.maxPrice || initialState.maxPrice === 0 ? String(initialState.maxPrice) : '',
    levels: initialState.levels || [] as string[],
    isNearlyFull: initialState.isNearlyFull || false,
  });

  // Calculate active filter count for the badge
  const activeFilterCount = [
    advancedFilters.city !== '全台灣',
    !!advancedFilters.date,
    !!advancedFilters.minPrice,
    !!advancedFilters.maxPrice,
    advancedFilters.levels.length > 0,
    advancedFilters.isNearlyFull
  ].filter(Boolean).length;

  // Filter Logic
  const filteredActivities = activities.filter(a => {
    // 1. Keyword Search
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    // 2. Category Filter
    if (mainCategory !== '所有運動') {
      const categoryObj = categories.find(c => c.name === mainCategory);
      if (categoryObj) {
         if (subCategory) {
           if (!a.tags.some(tag => tag === subCategory)) return false;
         } else {
           const matchesMain = a.tags.some(tag => categoryObj.items.includes(tag) || categoryObj.items.some(item => tag.includes(item)));
           if (!matchesMain) return false;
         }
      }
    }

    // 3. Advanced Filters
    // City
    if (advancedFilters.city !== '全台灣' && !a.location.includes(advancedFilters.city)) return false;

    // Date
    if (advancedFilters.date && a.date !== advancedFilters.date) return false;

    // Price
    if (advancedFilters.minPrice && a.price < Number(advancedFilters.minPrice)) return false;
    if (advancedFilters.maxPrice && a.price > Number(advancedFilters.maxPrice)) return false;

    // Level
    if (advancedFilters.levels.length > 0 && !advancedFilters.levels.includes(a.level)) return false;

    // "Nearly Full" Logic
    if (advancedFilters.isNearlyFull) {
        if (a.status !== ActivityStatus.OPEN) return false;
        if (a.maxParticipants) {
            const ratio = (a.currentAppCount + (a.currentInternalCount || 0)) / a.maxParticipants;
            if (ratio < 0.8) return false;
        } else {
            return false; // Open mode activities don't have "nearly full" logic
        }
    }

    return true;
  });

  // Skeleton loading state (simulate initial load)
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  // Load More state — reset when filters change
  const [displayCount, setDisplayCount] = useState(6);
  useEffect(() => {
    setDisplayCount(6);
  }, [searchTerm, mainCategory, subCategory, advancedFilters]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setMainCategory('所有運動');
    setSubCategory(null);
    setAdvancedFilters({
      city: '全台灣',
      date: '',
      minPrice: '',
      maxPrice: '',
      levels: [],
      isNearlyFull: false,
    });
  };

  const currentSubCategories = categories.find(c => c.name === mainCategory)?.items || [];

  return (
    <div className="animate-fade-in px-4 pt-6 pb-20">
       {/* Header */}
       <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <ChevronLeft size={24} className="text-gray-900 dark:text-white" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">所有活動</h1>
      </div>

      {/* Search & Filter Controls */}
      <div className="sticky top-0 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-sm z-20 -mx-4 px-4 pb-2">
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-600 rounded-xl leading-5 bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
              placeholder="搜尋活動..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsFilterOpen(true)}
            className={`p-3 rounded-xl border transition-all relative ${
              activeFilterCount > 0
              ? 'bg-gray-900 text-white border-gray-900 shadow-md'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
             <Filter size={20} />
             {activeFilterCount > 0 && (
               <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                 {activeFilterCount}
               </span>
             )}
          </button>
        </div>

        {/* Level 1: Main Categories */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 mb-2">
            {categories.map(cat => (
            <button
                key={cat.name}
                onClick={() => {
                setMainCategory(cat.name);
                setSubCategory(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                mainCategory === cat.name
                ? 'bg-gray-900 text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                }`}
            >
                {cat.name}
            </button>
            ))}
        </div>

        {/* Level 2: Sub Categories */}
        {currentSubCategories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
                onClick={() => setSubCategory(null)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all border whitespace-nowrap ${
                    subCategory === null
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                >
                全部
            </button>
            {currentSubCategories.map(item => (
                <button
                key={item}
                onClick={() => setSubCategory(item === subCategory ? null : item)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all border whitespace-nowrap ${
                    subCategory === item
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                >
                {item}
                </button>
            ))}
            </div>
        )}
      </div>

      {/* Applied Filter Chips (Active Filters Visual Feedback) */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 animate-fade-in">
           {advancedFilters.isNearlyFull && (
             <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-md font-bold flex items-center gap-1">
               🔥 即將額滿
             </span>
           )}
           {advancedFilters.city !== '全台灣' && (
             <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md font-bold">
               {advancedFilters.city}
             </span>
           )}
           {advancedFilters.date && (
             <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md font-bold">
               {advancedFilters.date}
             </span>
           )}
           {(advancedFilters.minPrice || advancedFilters.maxPrice) && (
             <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md font-bold">
               ${advancedFilters.minPrice || '0'} - ${advancedFilters.maxPrice || '∞'}
             </span>
           )}
           {advancedFilters.levels.map(l => (
             <span key={l} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md font-bold">
               {l}
             </span>
           ))}
           <button
             onClick={handleResetFilters}
             className="text-xs text-red-500 font-bold px-1 hover:underline"
           >
             重置
           </button>
        </div>
      )}

      {/* Result Count */}
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 mt-2">
         共找到 {filteredActivities.length} 個活動
      </div>

      {/* Activity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <ActivityCardSkeleton key={i} />)
        ) : filteredActivities.length > 0 ? (
          filteredActivities.slice(0, displayCount).map(activity => (
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
             <button
                onClick={handleResetFilters}
                className="mt-2 text-primary font-bold text-sm hover:underline"
             >
                清除所有篩選
             </button>
          </div>
        )}
      </div>

      {/* Load More */}
      {!isLoading && filteredActivities.length > displayCount && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setDisplayCount(prev => prev + 6)}
            className="px-8 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md transition-all text-sm"
          >
            載入更多（還有 {filteredActivities.length - displayCount} 個）
          </button>
        </div>
      )}

      {/* Advanced Filter Modal */}
      <ActivityFilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        currentFilters={advancedFilters}
        onApply={setAdvancedFilters}
        onReset={() => setAdvancedFilters({
          city: '全台灣',
          date: '',
          minPrice: '',
          maxPrice: '',
          levels: [],
          isNearlyFull: false,
        })}
      />
    </div>
  );
};

export default ActivityList;
