import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Level } from '../types';
import { TAIWAN_CITIES } from '../constants';

interface FilterState {
  city: string;
  date: string;
  minPrice: string;
  maxPrice: string;
  levels: string[];
}

interface ActivityFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: FilterState;
  onApply: (filters: FilterState) => void;
  onReset: () => void;
}

const ActivityFilterModal: React.FC<ActivityFilterModalProps> = ({ isOpen, onClose, currentFilters, onApply, onReset }) => {
  const [filters, setFilters] = useState<FilterState>(currentFilters);

  if (!isOpen) return null;

  const handleLevelToggle = (level: string) => {
    setFilters(prev => {
      if (prev.levels.includes(level)) {
        return { ...prev, levels: prev.levels.filter(l => l !== level) };
      } else {
        return { ...prev, levels: [...prev.levels, level] };
      }
    });
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleInternalReset = () => {
    const defaultState = {
      city: '全台灣',
      date: '',
      minPrice: '',
      maxPrice: '',
      levels: []
    };
    setFilters(defaultState);
    // Don't call parent onReset immediately, wait for Apply
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={onClose}></div>

      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl pointer-events-auto relative z-10 flex flex-col max-h-[85vh] animate-slide-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">進階篩選</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

          {/* Region */}
          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">地區 / 城市</label>
            <div className="relative">
              <select
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-primary/50 appearance-none font-medium text-gray-700 dark:text-white"
              >
                {TAIWAN_CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500">▼</div>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">日期</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-primary/50 text-gray-700 dark:text-white dark:placeholder-gray-400 font-medium"
            />
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
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all flex items-center gap-1.5 ${
                      isSelected
                      ? 'bg-primary text-white border-primary shadow-md shadow-orange-100'
                      : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {isSelected && <Check size={14} strokeWidth={3} />}
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">費用範圍 (TWD)</label>
            <div className="flex items-center gap-3">
               <div className="relative flex-1">
                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-bold">$</span>
                 <input
                   type="number"
                   placeholder="最低"
                   value={filters.minPrice}
                   onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                   className="w-full p-3 pl-7 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-primary/50 font-medium dark:text-white dark:placeholder-gray-400"
                 />
               </div>
               <span className="text-gray-400 dark:text-gray-500 font-bold">-</span>
               <div className="relative flex-1">
                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-bold">$</span>
                 <input
                   type="number"
                   placeholder="最高"
                   value={filters.maxPrice}
                   onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                   className="w-full p-3 pl-7 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-primary/50 font-medium dark:text-white dark:placeholder-gray-400"
                 />
               </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-50 dark:border-gray-700 bg-white dark:bg-gray-800 flex gap-3">
          <button
            onClick={handleInternalReset}
            className="px-6 py-3.5 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            重置
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3.5 bg-gray-900 dark:bg-gray-700 text-white font-bold rounded-xl shadow-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-all active:scale-95"
          >
            顯示篩選結果
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityFilterModal;
