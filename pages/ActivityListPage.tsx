import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { SPORTS_HIERARCHY } from '../constants';
import { Activity, DEFAULT_FILTER_STATE } from '../types';
import { apiGetActivities, LEVEL_REVERSE } from '../services/api';
import ActivityList from '../components/activity/ActivityList';
import ActivityMap from '../components/activity/ActivityMap';
import CategorySelector from '../components/home/CategorySelector';
import { Search, ChevronLeft, Filter, List as ListIcon, Map as MapIcon, X } from 'lucide-react';

const ActivityListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleActivityClick, isFilterOpen, setIsFilterOpen, advancedFilters, setAdvancedFilters } = useAppContext();
  const initialState = location.state || {};

  // View Mode
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Filter States
  const [searchTerm, setSearchTerm] = useState(initialState.searchTerm || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [selectedMainCategories, setSelectedMainCategories] = useState<string[]>(
    initialState.mainCategories || (initialState.mainCategory ? [initialState.mainCategory] : ['所有運動'])
  );
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>(
    initialState.subCategories || (initialState.subCategory ? [initialState.subCategory] : [])
  );

  // Apply cities from explore tag state on mount
  useEffect(() => {
    if (initialState.cities && initialState.cities.length > 0) {
      setAdvancedFilters({ ...advancedFilters, cities: initialState.cities });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // API state
  const [apiActivities, setApiActivities] = useState<Activity[]>([]);
  const [apiTotal, setApiTotal] = useState(0);
  const [apiLoading, setApiLoading] = useState(true);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Fetch from API whenever filters change
  useEffect(() => {
    setApiLoading(true);

    const params: Record<string, string> = { limit: '50' };

    if (debouncedSearch) params.search = debouncedSearch;

    if (!advancedFilters.cities.includes('全台灣')) {
      params.cities = advancedFilters.cities.join(',');
    }
    if (advancedFilters.date) params.date = advancedFilters.date;
    if (advancedFilters.minPrice) params.minPrice = advancedFilters.minPrice;
    if (advancedFilters.maxPrice) params.maxPrice = advancedFilters.maxPrice;
    if (advancedFilters.levels.length > 0) {
      params.levels = advancedFilters.levels.map(l => LEVEL_REVERSE[l] ?? l).join(',');
    }
    if (advancedFilters.isNearlyFull) params.isNearlyFull = 'true';

    // Sport category → tags
    if (!selectedMainCategories.includes('所有運動')) {
      if (selectedSubCategories.length > 0) {
        params.tags = selectedSubCategories.join(',');
      } else {
        const subItems: string[] = [];
        selectedMainCategories.forEach(main => {
          const cat = SPORTS_HIERARCHY.find(c => c.name === main);
          if (cat) subItems.push(...cat.items);
        });
        if (subItems.length > 0) params.tags = subItems.join(',');
      }
    }

    apiGetActivities(params)
      .then(({ data, total }) => {
        setApiActivities(data);
        setApiTotal(total);
      })
      .catch(() => {})
      .finally(() => setApiLoading(false));
  }, [debouncedSearch, selectedMainCategories, selectedSubCategories, advancedFilters]);

  // Calculate active filter count
  const activeFilterCount = [
    !advancedFilters.cities.includes('全台灣'),
    !!advancedFilters.date,
    !!advancedFilters.minPrice,
    !!advancedFilters.maxPrice,
    advancedFilters.levels.length > 0,
    advancedFilters.isNearlyFull,
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedMainCategories(['所有運動']);
    setSelectedSubCategories([]);
    setAdvancedFilters(DEFAULT_FILTER_STATE);
  };

  const handleMainCategoryToggle = (name: string) => {
    if (name === '所有運動') {
      setSelectedMainCategories(['所有運動']);
      setSelectedSubCategories([]);
      return;
    }
    setSelectedMainCategories(prev => {
      const filtered = prev.filter(i => i !== '所有運動');
      const next = filtered.includes(name) ? filtered.filter(i => i !== name) : [...filtered, name];
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
          {viewMode === 'list' ? '探索活動' : '活動地圖'}
        </h1>
      </div>

      {/* Sticky filter bar */}
      <div className="sticky top-[60px] z-30 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-md -mx-4 px-4 py-3 border-b border-gray-100 dark:border-gray-800 shadow-sm">
        {/* Search + filter button */}
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-600 rounded-xl leading-5 bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all shadow-sm"
              placeholder="搜尋活動、地點、標籤..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`px-4 rounded-xl border transition-all flex items-center gap-2 relative ${
              activeFilterCount > 0 || isFilterOpen
                ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-400'
            }`}
          >
            {isFilterOpen ? <X size={18} /> : <Filter size={18} />}
            <span className="text-xs font-black uppercase tracking-wider hidden sm:inline">進階篩選</span>
            {activeFilterCount > 0 && !isFilterOpen && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Category selector */}
        <div className="mb-2">
          <CategorySelector
            selectedMainCategories={selectedMainCategories}
            selectedSubCategories={selectedSubCategories}
            onMainCategoryToggle={handleMainCategoryToggle}
            onSubCategoryToggle={handleSubCategoryToggle}
            variant="compact"
          />
        </div>

        {/* Count + view toggle */}
        <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-800/50 mt-1">
          <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
            {apiLoading ? (
              <span>搜尋中...</span>
            ) : (
              <span>共找到 <span className="text-primary font-bold">{apiTotal}</span> 個活動</span>
            )}
            {(activeFilterCount > 0 || !selectedMainCategories.includes('所有運動')) && (
              <>
                <div className="h-3 w-px bg-gray-200 dark:bg-gray-700 mx-1" />
                <button onClick={handleResetFilters} className="text-red-500 hover:underline">重設</button>
              </>
            )}
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

        {/* Active filter chips */}
        {activeFilterCount > 0 && !isFilterOpen && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 pt-1 animate-fade-in">
            {advancedFilters.isNearlyFull && (
              <span className="flex-shrink-0 text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded font-bold">🔥 快滿</span>
            )}
            {!advancedFilters.cities.includes('全台灣') && (
              <span className="flex-shrink-0 text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded font-bold">
                {advancedFilters.cities[0]}{advancedFilters.cities.length > 1 ? `+${advancedFilters.cities.length - 1}` : ''}
              </span>
            )}
            {advancedFilters.date && (
              <span className="flex-shrink-0 text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded font-bold">
                {advancedFilters.date}
              </span>
            )}
            {advancedFilters.levels.map(l => (
              <span key={l} className="flex-shrink-0 text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded font-bold">{l}</span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mt-6">
        {viewMode === 'list' ? (
          <ActivityList
            activities={apiActivities}
            onActivityClick={handleActivityClick}
            searchTerm={debouncedSearch}
            isLoading={apiLoading}
          />
        ) : (
          <ActivityMap
            activities={apiActivities}
            onActivityClick={handleActivityClick}
            className="h-[calc(100vh-320px)] w-full rounded-2xl overflow-hidden shadow-inner border border-gray-100 dark:border-gray-800"
          />
        )}
      </div>
    </div>
  );
};

export default ActivityListPage;
