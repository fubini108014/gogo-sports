import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { SPORTS_HIERARCHY, SportCategory } from '../constants';
import { ActivityStatus, Level } from '../types';
import ActivityList from '../components/ActivityList';
import ActivityMap from '../components/ActivityMap';
import CategorySelector from '../components/CategorySelector';
import ActivityFilterDrawer from '../components/ActivityFilterDrawer';
import { Search, ChevronLeft, Filter, List as ListIcon, Map as MapIcon } from 'lucide-react';

const ActivityListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activities, handleActivityClick } = useAppContext();
  const initialState = location.state || {};

  // View Mode
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Filter States
  const [searchTerm, setSearchTerm] = useState(initialState.searchTerm || '');
  const [selectedMainCategories, setSelectedMainCategories] = useState<string[]>(
    initialState.mainCategories || (initialState.mainCategory ? [initialState.mainCategory] : ['所有運動'])
  );
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>(
    initialState.subCategories || (initialState.subCategory ? [initialState.subCategory] : [])
  );

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    cities: initialState.locations || (initialState.location ? [initialState.location] : ['全台灣']),
    date: initialState.date || '',
    minPrice: initialState.minPrice || '',
    maxPrice: initialState.maxPrice || initialState.maxPrice === 0 ? String(initialState.maxPrice) : '',
    levels: initialState.levels || [] as string[],
    isNearlyFull: initialState.isNearlyFull || false,
  });

  // Calculate active filter count
  const activeFilterCount = [
    !advancedFilters.cities.includes('全台灣'),
    !!advancedFilters.date,
    !!advancedFilters.minPrice,
    !!advancedFilters.maxPrice,
    advancedFilters.levels.length > 0,
    advancedFilters.isNearlyFull
  ].filter(Boolean).length;

  // Unified Filter Logic
  const filteredActivities = useMemo(() => {
    return activities.filter(a => {
      // 1. Keyword Search
      const matchesSearch =
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      // 2. Multi-Category Filter
      if (!selectedMainCategories.includes('所有運動')) {
        if (selectedSubCategories.length > 0) {
          if (!a.tags.some(tag => selectedSubCategories.includes(tag))) return false;
        } else {
          const allowedSubItems: string[] = [];
          selectedMainCategories.forEach(main => {
            const cat = SPORTS_HIERARCHY.find(c => c.name === main);
            if (cat) allowedSubItems.push(...cat.items);
          });
          
          const matchesAnyMain = a.tags.some(tag => 
            allowedSubItems.some(item => tag.includes(item) || item.includes(tag))
          );
          if (!matchesAnyMain) return false;
        }
      }

      // 3. Advanced Filters
      if (!advancedFilters.cities.includes('全台灣')) {
        const matchesCity = advancedFilters.cities.some(city => a.location.includes(city));
        if (!matchesCity) return false;
      }

      if (advancedFilters.date && a.date !== advancedFilters.date) return false;
      if (advancedFilters.minPrice && a.price < Number(advancedFilters.minPrice)) return false;
      if (advancedFilters.maxPrice && a.price > Number(advancedFilters.maxPrice)) return false;
      if (advancedFilters.levels.length > 0 && !advancedFilters.levels.includes(a.level)) return false;

      if (advancedFilters.isNearlyFull) {
          if (a.status !== ActivityStatus.OPEN) return false;
          if (a.maxParticipants) {
              const ratio = (a.currentAppCount + (a.currentInternalCount || 0)) / a.maxParticipants;
              if (ratio < 0.8) return false;
          } else {
              return false;
          }
      }

      return true;
    });
  }, [activities, searchTerm, selectedMainCategories, selectedSubCategories, advancedFilters]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedMainCategories(['所有運動']);
    setSelectedSubCategories([]);
    setAdvancedFilters({
      cities: ['全台灣'],
      date: '',
      minPrice: '',
      maxPrice: '',
      levels: [],
      isNearlyFull: false,
    });
  };

  const handleMainCategoryToggle = (name: string) => {
    if (name === '所有運動') {
      setSelectedMainCategories(['所有運動']);
      setSelectedSubCategories([]);
      return;
    }

    setSelectedMainCategories(prev => {
      const filtered = prev.filter(i => i !== '所有運動');
      const next = filtered.includes(name) 
        ? filtered.filter(i => i !== name) 
        : [...filtered, name];
      
      return next.length === 0 ? ['所有運動'] : next;
    });
  };

  const handleSubCategoryToggle = (name: string) => {
    setSelectedSubCategories(prev => 
      prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]
    );
  };

  return (
    <div className="animate-fade-in px-4 pt-6 pb-20">
       {/* Header */}
       <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <ChevronLeft size={24} className="text-gray-900 dark:text-white" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {viewMode === 'list' ? '所有活動' : '活動地圖'}
        </h1>
      </div>

      {/* Global Search & Filter Controls (Common to both modes) */}
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

        {/* Unified Category Selector */}
        <CategorySelector 
          selectedMainCategories={selectedMainCategories}
          selectedSubCategories={selectedSubCategories}
          onMainCategoryToggle={handleMainCategoryToggle}
          onSubCategoryToggle={handleSubCategoryToggle}
          variant="compact"
        />
      </div>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 animate-fade-in mt-4">
           {advancedFilters.isNearlyFull && (
             <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-md font-bold flex items-center gap-1">
               🔥 即將額滿
             </span>
           )}
           {!advancedFilters.cities.includes('全台灣') && (
             <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md font-bold">
               {advancedFilters.cities.join(', ')}
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

      {/* Result Count & View Toggle */}
      <div className="flex items-center justify-between mb-4 mt-2">
         <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            共找到 {filteredActivities.length} 個活動
         </div>
         
         <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
           <button
             onClick={() => setViewMode('list')}
             className={`flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${
               viewMode === 'list'
                 ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                 : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
             }`}
           >
             <ListIcon size={12} /> 列表
           </button>
           <button
             onClick={() => setViewMode('map')}
             className={`flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${
               viewMode === 'map'
                 ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                 : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
             }`}
           >
             <MapIcon size={12} /> 地圖
           </button>
         </div>
      </div>

      {/* Content View */}
      {viewMode === 'list' ? (
        <ActivityList
          activities={filteredActivities}
          onActivityClick={handleActivityClick}
          searchTerm={searchTerm}
        />
      ) : (
        <ActivityMap
          activities={filteredActivities}
          onActivityClick={handleActivityClick}
          className="h-[calc(100vh-320px)] w-full rounded-2xl overflow-hidden shadow-inner border border-gray-100 dark:border-gray-800"
        />
      )}

      {/* Advanced Filter Drawer */}
      <ActivityFilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        currentFilters={advancedFilters}
        onApply={setAdvancedFilters}
        onReset={handleResetFilters}
      />
    </div>
  );
};

export default ActivityListPage;
