import React, { useState } from 'react';
import { SPORTS_HIERARCHY } from '../../constants';
import { Check, Search, ChevronRight } from 'lucide-react';

interface SportCategoryPickerProps {
  selectedSubCategories: string[];
  onToggleSubCategory: (tag: string) => void;
  maxSelections?: number;
}

const SportCategoryPicker: React.FC<SportCategoryPickerProps> = ({
  selectedSubCategories,
  onToggleSubCategory,
  maxSelections = 5
}) => {
  const [activeMainCategory, setActiveMainCategory] = useState(SPORTS_HIERARCHY[1].name); // Default to Ball Sports
  const [searchQuery, setSearchQuery] = useState('');

  const currentCategoryData = SPORTS_HIERARCHY.find(c => c.name === activeMainCategory);
  
  // Filter items by search query
  const filteredItems = currentCategoryData?.items.filter(item => 
    item.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 overflow-hidden">
      {/* Search Header */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-700">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
          <input
            type="text"
            placeholder={`在「${activeMainCategory}」中搜尋...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-none rounded-2xl text-sm font-bold outline-none ring-2 ring-transparent focus:ring-primary/20 dark:text-white transition-all"
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Main Categories */}
        <div className="w-[130px] bg-gray-50 dark:bg-gray-900/30 border-r border-gray-100 dark:border-gray-700 overflow-y-auto no-scrollbar">
          {SPORTS_HIERARCHY.filter(c => c.name !== '所有運動').map((cat) => {
            const isActive = activeMainCategory === cat.name;
            const selectedCount = cat.items.filter(item => selectedSubCategories.includes(item)).length;

            return (
              <button
                key={cat.name}
                onClick={() => setActiveMainCategory(cat.name)}
                className={`w-full px-4 py-5 text-left transition-all relative flex flex-col items-center gap-1 ${
                  isActive 
                  ? 'bg-white dark:bg-gray-800' 
                  : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                }`}
              >
                <div className={`text-[13px] font-black tracking-tight leading-tight text-center ${isActive ? 'text-primary' : ''}`}>
                  {cat.name}
                </div>
                {selectedCount > 0 && (
                  <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-primary text-white text-[9px] font-black rounded-full">
                    {selectedCount}
                  </span>
                )}
                {isActive && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-l-full shadow-[0_0_10px_rgba(255,102,0,0.3)]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Pane: Sub Tags Grid */}
        <div className="flex-1 p-5 overflow-y-auto custom-scrollbar bg-white dark:bg-gray-800">
          <div className="grid grid-cols-2 gap-2.5">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const isSelected = selectedSubCategories.includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => onToggleSubCategory(item)}
                    className={`flex flex-col items-start justify-between p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${
                      isSelected
                      ? 'border-primary/50 bg-orange-50/50 dark:bg-orange-900/10'
                      : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between mb-1">
                       <span className={`text-sm font-black transition-colors ${isSelected ? 'text-primary' : 'text-gray-700 dark:text-gray-200 group-hover:text-primary'}`}>
                        {item}
                      </span>
                      {isSelected && (
                        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white scale-110 shadow-lg shadow-orange-200 dark:shadow-none animate-fade-in">
                          <Check size={12} strokeWidth={4} />
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{activeMainCategory}</span>
                    
                    {/* Active Glow Effect */}
                    {isSelected && (
                       <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="col-span-2 py-20 flex flex-col items-center justify-center text-gray-300 dark:text-gray-600">
                <Search size={40} className="mb-3 opacity-20" />
                <p className="text-sm font-bold">找不到相關項目</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


export default SportCategoryPicker;
