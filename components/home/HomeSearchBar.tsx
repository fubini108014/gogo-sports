import React from 'react';
import { Search, MapPin, RefreshCw, ChevronDown, Users } from 'lucide-react';

interface HomeSearchBarProps {
  isMapOpen: boolean;
  isCategoryOpen: boolean;
  onToggleMap: () => void;
  onToggleCategory: () => void;
  locationLabel: string;
  categoryLabel: string;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearch: (type: 'activities' | 'clubs') => void;
}

const HomeSearchBar: React.FC<HomeSearchBarProps> = ({
  isMapOpen,
  isCategoryOpen,
  onToggleMap,
  onToggleCategory,
  locationLabel,
  categoryLabel,
  searchQuery,
  onSearchQueryChange,
  onSearch,
}) => (
  <div className="relative z-30 max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-700 p-1.5 transition-all duration-500">
    <div className="flex flex-col md:flex-row items-center gap-1 md:h-16">

      {/* Location Button */}
      <button
        onClick={onToggleMap}
        className={`flex-1 w-full md:w-auto flex items-center gap-3 px-6 py-3 md:py-0 h-full rounded-2xl md:rounded-full hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left group ${isMapOpen ? 'bg-slate-50 dark:bg-slate-700/50' : ''}`}
      >
        <div className={`p-2 rounded-full transition-colors ${isMapOpen ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}>
          <MapPin size={18} />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">在哪裡?</span>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{locationLabel}</span>
        </div>
        <ChevronDown size={14} className={`ml-auto text-slate-300 group-hover:text-slate-500 transition-transform ${isMapOpen ? 'rotate-180' : ''}`} />
      </button>

      <div className="hidden md:block w-px h-10 bg-slate-100 dark:bg-slate-700" />

      {/* Category Button */}
      <button
        onClick={onToggleCategory}
        className={`flex-1 w-full md:w-auto flex items-center gap-3 px-6 py-3 md:py-0 h-full rounded-2xl md:rounded-full hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left group ${isCategoryOpen ? 'bg-slate-50 dark:bg-slate-700/50' : ''}`}
      >
        <div className={`p-2 rounded-full transition-colors ${isCategoryOpen ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}>
          <RefreshCw size={18} />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">做什麼?</span>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{categoryLabel}</span>
        </div>
        <ChevronDown size={14} className={`ml-auto text-slate-300 group-hover:text-slate-500 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
      </button>

      <div className="hidden md:block w-px h-10 bg-slate-100 dark:bg-slate-700" />

      {/* Keyword Input */}
      <div className="flex-[1.2] w-full md:w-auto flex items-center gap-3 px-6 h-full rounded-full">
        <Search size={20} className="text-slate-300" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchQueryChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSearch('activities')}
          placeholder="關鍵字搜尋..."
          className="w-full bg-transparent text-sm font-bold text-slate-700 dark:text-slate-200 placeholder-slate-300 focus:outline-none"
        />
      </div>

      {/* Action Buttons */}
      <div className="w-full md:w-auto flex items-center gap-1.5 p-1">
        <button
          onClick={() => onSearch('activities')}
          className="flex-1 md:flex-none px-6 h-12 md:h-13 bg-primary hover:bg-orange-600 text-white font-black text-xs rounded-2xl md:rounded-full shadow-lg shadow-orange-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Search size={14} strokeWidth={3} /> 找活動
        </button>
        <button
          onClick={() => onSearch('clubs')}
          className="flex-1 md:flex-none px-6 h-12 md:h-13 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-black text-xs rounded-2xl md:rounded-full shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Users size={14} /> 找社團
        </button>
      </div>
    </div>
  </div>
);

export default HomeSearchBar;
