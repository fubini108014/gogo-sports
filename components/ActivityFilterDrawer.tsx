import React, { useState, useEffect } from 'react';
import { X, Check, RotateCcw } from 'lucide-react';
import { FilterState, Level } from '../types';

interface ActivityFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: FilterState;
  onApply: (filters: FilterState) => void;
  onReset: () => void;
}

const ActivityFilterDrawer: React.FC<ActivityFilterDrawerProps> = ({ isOpen, onClose, currentFilters, onApply, onReset }) => {
  const [filters, setFilters] = useState<FilterState>(currentFilters);
  const [isVisible, setIsVisible] = useState(false);

  // Synchronize internal state with external when drawer opens
  useEffect(() => {
    if (isOpen) {
      setFilters(currentFilters);
      // Small timeout to trigger transition
      setTimeout(() => setIsVisible(true), 10);
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      document.body.style.overflow = 'auto';
    }
  }, [isOpen, currentFilters]);

  const handleLevelToggle = (level: string) => {
    setFilters(prev => {
      if (prev.levels.includes(level)) {
        return { ...prev, levels: prev.levels.filter(l => l !== level) };
      } else {
        return { ...prev, levels: [...prev.levels, level] };
      }
    });
  };

  const handleCityToggle = (city: string) => {
    setFilters(prev => {
        if (city === '全台灣') return { ...prev, cities: ['全台灣'] };
        
        let nextCities = prev.cities.filter(c => c !== '全台灣');
        if (nextCities.includes(city)) {
            nextCities = nextCities.filter(c => c !== city);
        } else {
            nextCities = [...nextCities, city];
        }
        
        if (nextCities.length === 0) return { ...prev, cities: ['全台灣'] };
        return { ...prev, cities: nextCities };
    });
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleInternalReset = () => {
    const defaultState = {
      cities: ['全台灣'],
      date: '',
      minPrice: '',
      maxPrice: '',
      levels: [],
      isNearlyFull: false
    };
    setFilters(defaultState);
  };

  if (!isOpen && !isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" 
        onClick={onClose}
      ></div>

      {/* Drawer Panel */}
      <div className={`bg-white dark:bg-gray-800 w-full max-w-[340px] shadow-2xl pointer-events-auto relative z-10 flex flex-col h-full transform transition-transform duration-300 ease-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">進階篩選</h3>
            {Object.keys(filters).some(k => JSON.stringify(filters[k as keyof FilterState]) !== JSON.stringify(currentFilters[k as keyof FilterState])) && (
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-7 custom-scrollbar pb-32">

          {/* Special Toggle */}
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-2xl border border-orange-100 dark:border-orange-900/30 flex items-center justify-between">
            <div>
                <p className="font-bold text-orange-700 dark:text-orange-400 text-sm">🔥 即將額滿</p>
                <p className="text-[10px] text-orange-600/70 dark:text-orange-400/70">顯示報名人數 80% 以上的活動</p>
            </div>
            <button 
                onClick={() => setFilters({...filters, isNearlyFull: !filters.isNearlyFull})}
                className={`w-12 h-6 rounded-full transition-colors relative ${filters.isNearlyFull ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${filters.isNearlyFull ? 'right-1' : 'left-1'}`}></div>
            </button>
          </div>

          {/* Region */}
          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">地區 / 城市</label>
            <div className="flex flex-wrap gap-2">
              {['全台灣', '台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市', '新竹市'].map(city => {
                const isSelected = filters.cities.includes(city);
                return (
                  <button
                    key={city}
                    onClick={() => handleCityToggle(city)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                      isSelected
                      ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100'
                      : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {city}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">日期</label>
            <div className="relative group">
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-primary/30 text-gray-700 dark:text-white font-medium transition-all"
              />
            </div>
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">活動程度 (可複選)</label>
            <div className="flex flex-wrap gap-2">
              {Object.values(Level).map(level => {
                const isSelected = filters.levels.includes(level);
                return (
                  <button
                    key={level}
                    onClick={() => handleLevelToggle(level)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                      isSelected
                      ? 'bg-primary/10 text-primary border-primary'
                      : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {isSelected && <Check size={12} strokeWidth={3} />}
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">費用範圍 (TWD)</label>
            <div className="flex items-center gap-2">
               <div className="relative flex-1">
                 <input
                   type="number"
                   placeholder="最低"
                   value={filters.minPrice}
                   onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                   className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 text-sm dark:text-white"
                 />
               </div>
               <span className="text-gray-300">—</span>
               <div className="relative flex-1">
                 <input
                   type="number"
                   placeholder="最高"
                   value={filters.maxPrice}
                   onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                   className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 text-sm dark:text-white"
                 />
               </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-gray-100 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md flex flex-col gap-3">
          <div className="flex gap-3">
              <button
                onClick={handleInternalReset}
                className="p-3 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title="重置"
              >
                <RotateCcw size={20} />
              </button>
              <button
                onClick={handleApply}
                className="flex-1 py-3 bg-gray-900 dark:bg-primary text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all active:scale-95"
              >
                顯示活動結果
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityFilterDrawer;
