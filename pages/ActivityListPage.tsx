import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { SPORTS_HIERARCHY } from '../constants';
import { Activity, DEFAULT_FILTER_STATE } from '../types';
import { apiGetActivities, LEVEL_REVERSE, apiGetActivitySuggestions, ActivitySuggestion } from '../services/api';
import ActivityList from '../components/activity/ActivityList';
import ActivityMap from '../components/activity/ActivityMap';
import CalendarPicker from '../components/ui/CalendarPicker';
import { Search, ChevronLeft, Filter, List as ListIcon, Map as MapIcon, X, RotateCcw } from 'lucide-react';

const ActivityListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { handleActivityClick, isFilterOpen, setIsFilterOpen, advancedFilters, setAdvancedFilters } = useAppContext();
  const initialState = location.state || {};

  // View Mode
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmedSearch, setConfirmedSearch] = useState('');

  // Autocomplete
  const [suggestions, setSuggestions] = useState<ActivitySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Apply initial states from navigation or query string on mount
  useEffect(() => {
    let newFilters = { ...advancedFilters };
    let changed = false;

    // Helper to get array from query string
    const getArrayParam = (key: string) => {
      const val = searchParams.get(key);
      return val ? val.split(',') : null;
    };

    // 1. Search Term
    const qSearch = searchParams.get('search');
    if (qSearch) {
      setSearchTerm(qSearch);
      setConfirmedSearch(qSearch);
    } else if (initialState.searchTerm) {
      setSearchTerm(initialState.searchTerm);
      setConfirmedSearch(initialState.searchTerm);
    }

    // 2. Cities / Locations
    const qCities = getArrayParam('cities');
    if (qCities && qCities.length > 0) {
      newFilters.cities = qCities;
      changed = true;
    } else if (initialState.cities && initialState.cities.length > 0) {
      newFilters.cities = initialState.cities;
      changed = true;
    } else if (initialState.locations && initialState.locations.length > 0) {
      newFilters.cities = initialState.locations;
      changed = true;
    }

    // 3. Categories
    const qMainCats = getArrayParam('mainCategories');
    if (qMainCats && qMainCats.length > 0) {
      newFilters.mainCategories = qMainCats;
      changed = true;
    } else if (initialState.mainCategories && initialState.mainCategories.length > 0) {
      newFilters.mainCategories = initialState.mainCategories;
      changed = true;
    } else if (initialState.mainCategory) {
      newFilters.mainCategories = [initialState.mainCategory];
      changed = true;
    }

    const qSubCats = getArrayParam('subCategories');
    if (qSubCats && qSubCats.length > 0) {
      newFilters.subCategories = qSubCats;
      changed = true;
    } else if (initialState.subCategories && initialState.subCategories.length > 0) {
      newFilters.subCategories = initialState.subCategories;
      changed = true;
    } else if (initialState.subCategory) {
      newFilters.subCategories = [initialState.subCategory];
      changed = true;
    }

    // 4. Levels
    const qLevels = getArrayParam('levels');
    if (qLevels && qLevels.length > 0) {
      newFilters.levels = qLevels;
      changed = true;
    } else if (initialState.levels && initialState.levels.length > 0) {
      newFilters.levels = initialState.levels;
      changed = true;
    }

    // 5. Status / Flags
    if (searchParams.get('isNearlyFull') === 'true') {
      newFilters.isNearlyFull = true;
      changed = true;
    } else if (initialState.isNearlyFull !== undefined) {
      newFilters.isNearlyFull = initialState.isNearlyFull;
      changed = true;
    }

    // 6. Price
    const qMaxPrice = searchParams.get('maxPrice');
    if (qMaxPrice) {
      newFilters.maxPrice = qMaxPrice;
      changed = true;
    } else if (initialState.maxPrice !== undefined) {
      newFilters.maxPrice = String(initialState.maxPrice);
      changed = true;
    }

    const qMinPrice = searchParams.get('minPrice');
    if (qMinPrice) {
      newFilters.minPrice = qMinPrice;
      changed = true;
    } else if (initialState.minPrice !== undefined) {
      newFilters.minPrice = String(initialState.minPrice);
      changed = true;
    }

    if (changed) {
      setAdvancedFilters(newFilters);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync filters back to query string
  useEffect(() => {
    const params = new URLSearchParams();
    if (confirmedSearch) params.set('search', confirmedSearch);
    if (advancedFilters.cities.length > 0 && !advancedFilters.cities.includes('全台灣')) {
      params.set('cities', advancedFilters.cities.join(','));
    }
    if (advancedFilters.mainCategories.length > 0 && !advancedFilters.mainCategories.includes('所有運動')) {
      params.set('mainCategories', advancedFilters.mainCategories.join(','));
    }
    if (advancedFilters.subCategories.length > 0) {
      params.set('subCategories', advancedFilters.subCategories.join(','));
    }
    if (advancedFilters.levels.length > 0) {
      params.set('levels', advancedFilters.levels.join(','));
    }
    if (advancedFilters.isNearlyFull) params.set('isNearlyFull', 'true');
    if (advancedFilters.minPrice) params.set('minPrice', advancedFilters.minPrice);
    if (advancedFilters.maxPrice) params.set('maxPrice', advancedFilters.maxPrice);
    
    const newSearch = params.toString();
    const currentSearch = location.search.startsWith('?') ? location.search.substring(1) : location.search;
    
    if (newSearch !== currentSearch) {
      navigate(`/activities?${newSearch}`, { replace: true, state: location.state });
    }
  }, [confirmedSearch, advancedFilters, navigate, location.search, location.state]);

  // API state
  const [apiActivities, setApiActivities] = useState<Activity[]>([]);
  const [apiTotal, setApiTotal] = useState(0);
  const [apiLoading, setApiLoading] = useState(true);
  const [activeDates, setActiveDates] = useState<string[]>([]);
  const [viewDate, setViewDate] = useState<Date>(new Date());

  // Fetch active dates for calendar dots (ignoring the date filter)
  useEffect(() => {
    // Calculate start and end of the visible month
    const startOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const endOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
    
    const toISO = (d: Date) => {
      const offset = d.getTimezoneOffset();
      const local = new Date(d.getTime() - offset * 60 * 1000);
      return local.toISOString().split('T')[0];
    };

    const params: Record<string, string> = { 
      limit: '100',
      startDate: toISO(startOfMonth),
      endDate: toISO(endOfMonth)
    };

    if (confirmedSearch) params.search = confirmedSearch;
    if (!advancedFilters.cities.includes('全台灣')) {
      params.cities = advancedFilters.cities.join(',');
    }
    if (advancedFilters.minPrice) params.minPrice = advancedFilters.minPrice;
    if (advancedFilters.maxPrice) params.maxPrice = advancedFilters.maxPrice;
    if (advancedFilters.levels.length > 0) {
      params.levels = advancedFilters.levels.map(l => LEVEL_REVERSE[l] ?? l).join(',');
    }
    if (advancedFilters.isNearlyFull) params.isNearlyFull = 'true';

    if (!advancedFilters.mainCategories.includes('所有運動')) {
      if (advancedFilters.subCategories.length > 0) {
        params.tags = advancedFilters.subCategories.join(',');
      } else {
        const subItems: string[] = [];
        advancedFilters.mainCategories.forEach(main => {
          const cat = SPORTS_HIERARCHY.find(c => c.name === main);
          if (cat) subItems.push(...cat.items);
        });
        if (subItems.length > 0) params.tags = subItems.join(',');
      }
    }

    apiGetActivities(params)
      .then(({ data }) => {
        const dates = Array.from(new Set(
          data.map(activity => {
            const date = new Date(activity.date);
            const offset = date.getTimezoneOffset();
            const local = new Date(date.getTime() - offset * 60 * 1000);
            return local.toISOString().split('T')[0];
          })
        ));
        setActiveDates(dates);
      })
      .catch(() => {});
  }, [
    viewDate,
    confirmedSearch,
    advancedFilters.cities,
    advancedFilters.minPrice,
    advancedFilters.maxPrice,
    advancedFilters.levels,
    advancedFilters.isNearlyFull,
    advancedFilters.mainCategories,
    advancedFilters.subCategories
  ]);

  // Fetch from API whenever filters change
  useEffect(() => {
    setApiLoading(true);

    const params: Record<string, string> = { limit: '50' };

    if (confirmedSearch) params.search = confirmedSearch;

    if (!advancedFilters.cities.includes('全台灣')) {
      params.cities = advancedFilters.cities.join(',');
    }
    
    const toISO = (d: Date) => {
      const offset = d.getTimezoneOffset();
      const local = new Date(d.getTime() - offset * 60 * 1000);
      return local.toISOString().split('T')[0];
    };

    if (advancedFilters.date) {
      // Fetch 7 days starting from selected date
      const start = new Date(advancedFilters.date);
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      
      params.startDate = toISO(start);
      params.endDate = toISO(end);
    } else {
      // Default: Today and next 7 days
      const today = new Date();
      const end = new Date();
      end.setDate(today.getDate() + 7);
      
      params.startDate = toISO(today);
      params.endDate = toISO(end);
    }

    if (advancedFilters.minPrice) params.minPrice = advancedFilters.minPrice;
    if (advancedFilters.maxPrice) params.maxPrice = advancedFilters.maxPrice;
    if (advancedFilters.levels.length > 0) {
      params.levels = advancedFilters.levels.map(l => LEVEL_REVERSE[l] ?? l).join(',');
    }
    if (advancedFilters.isNearlyFull) params.isNearlyFull = 'true';

    // Sport category → tags
    if (!advancedFilters.mainCategories.includes('所有運動')) {
      if (advancedFilters.subCategories.length > 0) {
        params.tags = advancedFilters.subCategories.join(',');
      } else {
        const subItems: string[] = [];
        advancedFilters.mainCategories.forEach(main => {
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
  }, [confirmedSearch, advancedFilters]);

  // Calculate active filter count (excluding date as it's now primary)
  const activeFilterCount = [
    !advancedFilters.cities.includes('全台灣'),
    !!advancedFilters.minPrice,
    !!advancedFilters.maxPrice,
    advancedFilters.levels.length > 0,
    advancedFilters.isNearlyFull,
    !advancedFilters.mainCategories.includes('所有運動'),
    advancedFilters.subCategories.length > 0,
  ].filter(Boolean).length;

  const todayStr = new Date().toISOString().split('T')[0];

  const handleResetFilters = () => {
    setSearchTerm('');
    setConfirmedSearch('');
    
    // Reset to today starting 7 days
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const local = new Date(today.getTime() - offset * 60 * 1000);
    const dateStr = local.toISOString().split('T')[0];
    
    setAdvancedFilters({ ...DEFAULT_FILTER_STATE, date: dateStr });
  };

  // 500ms debounce: auto-trigger search while user is typing
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setConfirmedSearch(searchTerm);
    }, 500);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchTerm]);

  // Autocomplete: fetch suggestions with 200ms debounce
  useEffect(() => {
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    if (!searchTerm.trim()) { setSuggestions([]); setShowSuggestions(false); return; }
    suggestTimer.current = setTimeout(async () => {
      const results = await apiGetActivitySuggestions(searchTerm);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    }, 200);
    return () => { if (suggestTimer.current) clearTimeout(suggestTimer.current); };
  }, [searchTerm]);

  const handleSearchTrigger = () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    setConfirmedSearch(searchTerm);
    setShowSuggestions(false);
  };

  const applySuggestion = (value: string) => {
    setSearchTerm(value);
    setConfirmedSearch(value);
    setShowSuggestions(false);
  };

  const handleCheckNextWeek = () => {
    const baseDate = advancedFilters.date ? new Date(advancedFilters.date) : new Date();
    const nextWeek = new Date(baseDate);
    nextWeek.setDate(baseDate.getDate() + 7);
    
    const toISO = (d: Date) => {
      const offset = d.getTimezoneOffset();
      const local = new Date(d.getTime() - offset * 60 * 1000);
      return local.toISOString().split('T')[0];
    };
    
    setAdvancedFilters({ ...advancedFilters, date: toISO(nextWeek) });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchTrigger();
    }
  };

  const handleDateSelect = (date: string) => {
    // Always keep a date selected, just switch if different
    setAdvancedFilters({ ...advancedFilters, date });
  };

  return (
    <div className="animate-fade-in px-4 pt-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
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
      <div className="sticky top-[60px] z-30 -mx-4 px-4 py-3 relative group">
        {/* Background Layer with Shadow and Blur */}
        <div className="absolute inset-0 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm -z-10" />
        
        {/* Bottom Gradient Overlay (Integrated but at the bottom of this stacking context) */}
        <div className="absolute left-0 right-0 -bottom-10 h-10 bg-gradient-to-b from-gray-50/95 via-gray-50/70 to-transparent dark:from-gray-900/95 dark:via-gray-900/70 pointer-events-none -z-10" />

        {/* Search + filter button */}
        <div className="flex gap-2 mb-3 relative z-20">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400 dark:text-gray-500 group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-16 py-3 border border-gray-200 dark:border-gray-600 rounded-xl leading-5 bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all shadow-sm"
              placeholder="搜尋活動、地點、標籤..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              autoComplete="off"
            />
            <button
              onClick={handleSearchTrigger}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
            >
              搜尋
            </button>
            {/* Autocomplete dropdown */}
            {showSuggestions && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
                {suggestions.map((s: ActivitySuggestion, i: number) => (
                  <button
                    key={i}
                    onMouseDown={() => applySuggestion(s.value)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                  >
                    <span className="text-base flex-shrink-0">
                      {s.type === 'title' ? '🏃' : s.type === 'location' ? '📍' : '🏷️'}
                    </span>
                    <span className="text-sm text-gray-800 dark:text-gray-200 truncate">{s.value}</span>
                    <span className="ml-auto text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0">
                      {s.type === 'title' ? '活動' : s.type === 'location' ? '地點' : '標籤'}
                    </span>
                  </button>
                ))}
              </div>
            )}
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

        {/* Calendar Picker (Primary filter) */}
        <div className="mb-2">
          <CalendarPicker
            selectedDate={advancedFilters.date}
            onSelectDate={handleDateSelect}
            onViewDateChange={setViewDate}
            activeDates={activeDates}
            //showViewSwitcher={false}
          />
        </div>

        {/* Filter Summary & View Toggle */}
        <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-800/50 mt-1 gap-3 relative z-10">
          {/* Scrollable container for Chips */}
          <div className="flex-1 flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
            {/* Loading state indicator */}
            {apiLoading && (
              <div className="flex-shrink-0 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium animate-pulse">
                搜尋中...
              </div>
            )}

            {/* Filter Chips */}
            {!isFilterOpen && (
              <div className="flex gap-2 items-center flex-shrink-0">
                {confirmedSearch && (
                  <span className="flex-shrink-0 flex items-center gap-1 text-[10px] bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-bold">
                    關鍵字: {confirmedSearch}
                    <button 
                      onClick={() => {
                        setSearchTerm('');
                        setConfirmedSearch('');
                      }} 
                      className="hover:text-blue-800"
                    >
                      <X size={10} />
                    </button>
                  </span>
                )}
                {advancedFilters.isNearlyFull && (
                  <span className="flex-shrink-0 flex items-center gap-1 text-[10px] bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-bold">
                    🔥 快滿
                    <button onClick={() => setAdvancedFilters({...advancedFilters, isNearlyFull: false})} className="hover:text-orange-800"><X size={10} /></button>
                  </span>
                )}
                
                {/* Categories */}
                {!advancedFilters.mainCategories.includes('所有運動') && advancedFilters.mainCategories.map(cat => (
                  <span key={cat} className="flex-shrink-0 flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">
                    {cat}
                    <button 
                      onClick={() => {
                        const next = advancedFilters.mainCategories.filter(c => c !== cat);
                        setAdvancedFilters({
                          ...advancedFilters, 
                          mainCategories: next.length === 0 ? ['所有運動'] : next,
                          subCategories: [] 
                        });
                      }} 
                      className="hover:text-orange-800"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
                
                {/* Cities */}
                {!advancedFilters.cities.includes('全台灣') && advancedFilters.cities.map(city => (
                  <span key={city} className="flex-shrink-0 flex items-center gap-1 text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full font-bold">
                    {city}
                    <button 
                      onClick={() => {
                        const next = advancedFilters.cities.filter(c => c !== city);
                        setAdvancedFilters({
                          ...advancedFilters,
                          cities: next.length === 0 ? ['全台灣'] : next
                        });
                      }} 
                      className="hover:text-gray-800 dark:hover:text-white"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
                
                {/* Levels */}
                {advancedFilters.levels.map(l => (
                  <span key={l} className="flex-shrink-0 flex items-center gap-1 text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full font-bold">
                    {l}
                    <button 
                      onClick={() => setAdvancedFilters({...advancedFilters, levels: advancedFilters.levels.filter(lv => lv !== l)})} 
                      className="hover:text-gray-800 dark:hover:text-white"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
                
                {/* Price */}
                {(advancedFilters.minPrice || advancedFilters.maxPrice) && (
                  <span className="flex-shrink-0 flex items-center gap-1 text-[10px] bg-green-100 text-green-600 px-3 py-1 rounded-full font-bold">
                    預算: {advancedFilters.minPrice || '0'} - {advancedFilters.maxPrice || '∞'}
                    <button onClick={() => setAdvancedFilters({...advancedFilters, minPrice: '', maxPrice: ''})} className="hover:text-green-800"><X size={10} /></button>
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Clear All / Back to Today Button */}
            {(activeFilterCount > 0 || (advancedFilters.date && advancedFilters.date !== todayStr) || confirmedSearch) && (
              <button 
                onClick={handleResetFilters} 
                className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-[10px] sm:text-xs rounded-xl transition-colors font-bold whitespace-nowrap ${
                  activeFilterCount > 0 || confirmedSearch
                    ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                    : 'text-primary hover:bg-primary/5'
                }`}
                title={activeFilterCount > 0 || confirmedSearch ? '清除全部' : '回到今天'}
              >
                <RotateCcw size={14} />
                <span className="hidden sm:inline">
                  {activeFilterCount > 0 || confirmedSearch ? '清除全部' : '回到今天'}
                </span>
              </button>
            )}

            {/* View Mode Toggle - Fixed on right */}
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                <ListIcon size={14} /> 
                <span className="hidden sm:inline">列表</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${
                  viewMode === 'map'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                <MapIcon size={14} />
                <span className="hidden sm:inline">地圖</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Separate Sticky Gradient Overlay (Lower z-index than pills) */}
      <div className="sticky top-[315px] z-10 -mx-4 h-10 bg-gradient-to-b from-gray-50 via-gray-50/70 to-transparent dark:from-gray-900 dark:via-gray-900/70 pointer-events-none" />

      {/* Content */}
      <div className="mt-2">
        {viewMode === 'list' ? (
          <ActivityList
            activities={apiActivities}
            onActivityClick={handleActivityClick}
            searchTerm={confirmedSearch}
            isLoading={apiLoading}
            onEmptyAction={handleCheckNextWeek}
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
