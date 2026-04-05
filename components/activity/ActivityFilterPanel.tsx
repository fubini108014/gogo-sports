import React, { useState, useEffect } from 'react';
import { X, Check, RotateCcw } from 'lucide-react';
import { Level } from '../../types';
import RangeSlider from '../ui/RangeSlider';

interface FilterState {
  cities: string[];
  date: string;
  minPrice: string;
  maxPrice: string;
  levels: string[];
  isNearlyFull: boolean;
}

interface ActivityFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: FilterState;
  onApply: (filters: FilterState) => void;
  onReset: () => void;
}

const ActivityFilterPanel: React.FC<ActivityFilterPanelProps> = ({ isOpen, onClose, currentFilters, onApply, onReset }) => {
  const [filters, setFilters] = useState<FilterState>(currentFilters);

  // Synchronize internal state with external when panel opens
  useEffect(() => {
    if (isOpen) {
      setFilters(currentFilters);
      // Prevent body scroll when open on mobile
      if (window.innerWidth < 768) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
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

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Backdrop - Only visible on small screens */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Main Panel - Responsive Positioning */}
      <div className={`
        fixed inset-x-0 bottom-0 z-[70] 
        md:absolute md:inset-x-0 md:top-full md:bottom-auto md:mt-2 md:z-50
        bg-white dark:bg-gray-800 
        rounded-t-[32px] md:rounded-2xl 
        border-t md:border border-gray-100 dark:border-gray-700 
        shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-[0_20px_40px_rgba(0,0,0,0.12)] 
        flex flex-col max-h-[85vh] md:max-h-[70vh]
        animate-slide-up md:animate-slide-up origin-bottom md:origin-top
      `}>
        
        {/* Mobile Drag Handle */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
            <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-7 custom-scrollbar pb-32 md:pb-6">
          
          <div className="flex items-center justify-between">
              <h4 className="font-black text-sm md:text-xs uppercase tracking-[0.2em] text-gray-900 dark:text-white md:text-gray-400">進階篩選</h4>
              <button onClick={onClose} className="p-2 md:p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-400">
                  <X size={20} className="md:w-4 md:h-4" />
              </button>
          </div>

          {/* Region Section */}
          <div className="space-y-4">
            <label className="block text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">地區範圍</label>
            <div className="flex flex-wrap gap-2 md:gap-1.5">
              {['全台灣', '台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市'].map(city => {
                const isSelected = filters.cities.includes(city);
                return (
                  <button
                    key={city}
                    onClick={() => handleCityToggle(city)}
                    className={`px-4 py-2.5 md:px-3 md:py-1.5 rounded-xl md:rounded-lg text-xs font-bold border transition-all ${
                      isSelected
                      ? 'bg-primary text-white border-primary shadow-md shadow-orange-200'
                      : 'bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-800 hover:border-gray-300'
                    }`}
                  >
                    {city}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Special Toggle - Highlighted for mobile */}
          <div 
              onClick={() => setFilters({...filters, isNearlyFull: !filters.isNearlyFull})}
              className={`cursor-pointer p-5 md:p-4 rounded-2xl border transition-all flex items-center justify-between ${
                  filters.isNearlyFull 
                  ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-900/30' 
                  : 'bg-gray-50 border-gray-100 dark:bg-gray-900 dark:border-gray-800'
              }`}
          >
              <div className="flex items-center gap-3">
                  <span className="text-2xl">🔥</span>
                  <div>
                      <p className={`text-sm md:text-xs font-black ${filters.isNearlyFull ? 'text-orange-700 dark:text-orange-400' : 'text-gray-500'}`}>即將額滿活動</p>
                      <p className="text-[11px] md:text-[10px] text-gray-400 font-medium">顯示報名超過 80% 的場次</p>
                  </div>
              </div>
              <div className={`w-12 h-6 md:w-10 md:h-5 rounded-full relative transition-colors ${filters.isNearlyFull ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  <div className={`absolute top-1 w-4 h-4 md:w-3 md:h-3 bg-white rounded-full transition-all ${filters.isNearlyFull ? 'right-1' : 'left-1'}`}></div>
              </div>
          </div>

          {/* Date & Level Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6">
            {/* Date */}
            <div className="space-y-3">
              <label className="block text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">指定日期</label>
              <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                  className="w-full p-4 md:p-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-bold dark:text-white transition-all"
              />
            </div>

            {/* Level */}
            <div className="space-y-3">
              <label className="block text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">程度要求</label>
              <div className="flex flex-wrap gap-2 md:gap-1.5">
                {Object.values(Level).map(level => {
                  const isSelected = filters.levels.includes(level);
                  return (
                    <button
                      key={level}
                      onClick={() => handleLevelToggle(level)}
                      className={`px-4 py-2.5 md:px-3 md:py-1.5 rounded-xl md:rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                        isSelected
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                        : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {isSelected && <Check size={14} className="md:w-3 md:h-3" />}
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
              <label className="block text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">費用預算 (TWD)</label>
              <div className="pt-2">
                <RangeSlider 
                  min={0}
                  max={2000}
                  step={50}
                  minVal={filters.minPrice === '' ? 0 : parseInt(filters.minPrice)}
                  maxVal={filters.maxPrice === '' ? 2000 : parseInt(filters.maxPrice)}
                  onChange={({ min, max }) => {
                    setFilters({ 
                      ...filters, 
                      minPrice: min === 0 ? '' : min.toString(), 
                      maxPrice: max === 2000 ? '' : max.toString() 
                    });
                  }}
                />
              </div>
          </div>

        </div>

        {/* Footer Actions - Sticky on mobile */}
        <div className="p-5 md:p-4 bg-white/95 dark:bg-gray-800/95 md:bg-gray-50/50 md:dark:bg-gray-900/50 backdrop-blur-md md:backdrop-blur-none border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-4 absolute bottom-0 left-0 right-0 md:relative">
          <button
            onClick={handleInternalReset}
            className="flex items-center gap-1.5 px-2 py-2 text-xs font-bold text-gray-500 hover:text-red-500 transition-colors"
          >
            <RotateCcw size={14} /> <span className="hidden sm:inline">重設所有條件</span><span className="sm:hidden">重設</span>
          </button>
          <div className="flex gap-2">
              <button
                  onClick={onClose}
                  className="px-5 py-3 md:py-2.5 text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                  取消
              </button>
              <button
                  onClick={handleApply}
                  className="px-8 py-3 md:py-2.5 bg-primary text-white text-xs font-black rounded-xl shadow-lg shadow-orange-200 dark:shadow-none hover:bg-orange-600 transition-all active:scale-95"
              >
                  套用篩選
              </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ActivityFilterPanel;
