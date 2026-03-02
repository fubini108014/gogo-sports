import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { SPORTS_HIERARCHY, TAIWAN_CITIES } from '../constants';
import ActivityCard from '../components/ActivityCard';
import CategorySelector from '../components/CategorySelector';
import { Search, MapPin, X, Users, ChevronDown, Check, RefreshCw, Map as MapIcon } from 'lucide-react';

// Taiwan SVG Path Data (Internalized for seamless inline map)
const TAIWAN_PATH_DATA = [
  { id: '台北市', d: 'M 162 15 L 175 15 L 178 25 L 170 32 L 160 25 Z' },
  { id: '新北市', d: 'M 155 10 L 185 10 L 195 35 L 185 55 L 155 50 L 145 30 Z' },
  { id: '基隆市', d: 'M 180 8 L 190 8 L 192 15 L 182 18 Z' },
  { id: '桃園市', d: 'M 135 25 L 155 25 L 158 45 L 130 55 L 120 40 Z' },
  { id: '新竹縣', d: 'M 125 50 L 145 50 L 155 75 L 130 85 L 115 70 Z' },
  { id: '新竹市', d: 'M 118 58 L 128 58 L 130 65 L 120 68 Z' },
  { id: '苗栗縣', d: 'M 105 75 L 130 80 L 140 110 L 110 115 L 95 95 Z' },
  { id: '台中市', d: 'M 90 110 L 135 105 L 165 135 L 130 155 L 85 145 Z' },
  { id: '彰化縣', d: 'M 75 145 L 95 145 L 100 175 L 70 175 Z' },
  { id: '南投縣', d: 'M 105 145 L 150 145 L 170 200 L 135 225 L 105 200 Z' },
  { id: '雲林縣', d: 'M 60 175 L 95 175 L 100 205 L 55 205 Z' },
  { id: '嘉義縣', d: 'M 50 205 L 120 210 L 130 245 L 60 255 L 45 235 Z' },
  { id: '嘉義市', d: 'M 75 220 L 85 220 L 87 230 L 77 233 Z' },
  { id: '台南市', d: 'M 40 245 L 110 245 L 115 295 L 45 305 L 30 275 Z' },
  { id: '高雄市', d: 'M 45 305 L 105 295 L 145 345 L 120 395 L 80 410 L 55 385 Z' },
  { id: '屏東縣', d: 'M 90 405 L 130 395 L 145 445 L 125 505 L 100 505 L 85 465 Z' },
  { id: '宜蘭縣', d: 'M 175 45 L 205 50 L 215 100 L 185 120 L 165 85 Z' },
  { id: '花蓮縣', d: 'M 165 120 L 205 120 L 210 280 L 160 280 L 145 200 Z' },
  { id: '台東縣', d: 'M 150 285 L 195 285 L 190 425 L 140 435 L 130 350 Z' },
  { id: '澎湖縣', d: 'M 10 180 L 30 180 L 35 210 L 15 215 Z' },
  { id: '金門縣', d: 'M 5 50 L 25 50 L 25 70 L 5 70 Z' },
  { id: '連江縣', d: 'M 5 10 L 20 10 L 20 20 L 5 20 Z' },
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { activities, clubs, handleActivityClick, handleClubClick } = useAppContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMainCategories, setSelectedMainCategories] = useState<string[]>(['所有運動']);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(['全台灣']);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const getSubCategoriesForSelected = () => {
    const subs: string[] = [];
    selectedMainCategories.forEach(main => {
      const cat = SPORTS_HIERARCHY.find(c => c.name === main);
      if (cat) subs.push(...cat.items);
    });
    return [...new Set(subs)];
  };

  const currentSubCategories = getSubCategoriesForSelected();

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

  const toggleLocation = (loc: string) => {
    if (loc === '全台灣') {
      setSelectedLocations(['全台灣']);
      return;
    }
    
    setSelectedLocations(prev => {
      const filtered = prev.filter(i => i !== '全台灣');
      if (filtered.includes(loc)) {
        const next = filtered.filter(i => i !== loc);
        return next.length === 0 ? ['全台灣'] : next;
      } else {
        return [...filtered, loc];
      }
    });
  };

  const handleSearch = (target: 'activities' | 'clubs') => {
    navigate(`/${target}`, {
      state: {
        searchTerm: searchQuery,
        mainCategories: selectedMainCategories,
        subCategories: selectedSubCategories,
        locations: selectedLocations
      }
    });
  };

  const formatLocationLabel = () => {
    if (selectedLocations.includes('全台灣')) return '全台灣';
    if (selectedLocations.length === 1) return selectedLocations[0];
    return `${selectedLocations[0]} +${selectedLocations.length - 1}`;
  };

  return (
    <div className="animate-fade-in px-4 pt-6 pb-20">

      {/* Compact Hero Search Section */}
      <div className="mb-10 relative">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute top-40 -left-20 w-48 h-48 bg-orange-200/10 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-2xl mx-auto mb-3 px-1 flex flex-col md:flex-row md:items-end justify-between gap-2">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
              找尋你的<span className="text-primary italic">運動圈</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              全台最大的運動社群 ‧ 立即開始探索
            </p>
          </div>
          <div className="hidden md:block text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.2em] mb-1">
            GOGO SPORTS PLATFORM v2.0
          </div>
        </div>

        {/* Integrated Search Bar Wrapper */}
        <div className="max-w-2xl mx-auto relative z-20">
          <div className={`bg-white dark:bg-gray-800 rounded-2xl md:rounded-full p-2 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center gap-1 transition-all duration-300 ${isMapOpen ? 'md:rounded-b-none border-b-transparent shadow-none' : ''}`}>
            
            {/* Location Picker (Drawer Trigger) */}
            <button
              onClick={() => setIsMapOpen(!isMapOpen)}
              className={`w-full md:w-auto min-w-[140px] pl-10 pr-6 py-3 bg-transparent text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-full transition-colors relative flex items-center justify-between group text-left ${isMapOpen ? 'text-primary bg-primary/5' : ''}`}
            >
              <MapPin size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isMapOpen ? 'text-primary' : 'text-gray-400'}`} />
              <span className="truncate mr-2">{formatLocationLabel()}</span>
              <ChevronDown size={14} className={`text-gray-400 group-hover:text-primary transition-transform duration-300 ${isMapOpen ? 'rotate-180 text-primary' : ''}`} />
            </button>

            <div className="hidden md:block w-px h-8 bg-gray-100 dark:bg-gray-700 mx-1"></div>

            {/* Search Input (Flexible) */}
            <div className="relative flex-1 w-full">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setIsMapOpen(false)}
                placeholder="搜尋運動、地點或社團名稱..."
                className="w-full pl-11 pr-11 py-3 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Desktop Compact Split Pill Buttons */}
            <div className="hidden md:flex items-center gap-1.5 ml-4 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-full border border-slate-200 dark:border-slate-700 shadow-inner">
              <button
                onClick={() => handleSearch('activities')}
                className="h-9 px-4 flex items-center justify-center gap-1.5 bg-amber-500 text-white font-black rounded-full shadow-sm hover:bg-amber-600 transition-all active:scale-95 group"
              >
                <Search size={13} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-wider">找活動</span>
              </button>
              
              <button
                onClick={() => handleSearch('clubs')}
                className="h-9 px-4 flex items-center justify-center gap-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-full shadow-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-95 group"
              >
                <Users size={13} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-wider">找社團</span>
              </button>
            </div>
            
            {/* Mobile Search Button Wrapper (Hidden on desktop) */}
            <div className="md:hidden grid grid-cols-2 gap-2 w-full mt-2 p-1">
              <button
                onClick={() => handleSearch('activities')}
                className="flex items-center justify-center gap-2 py-3 bg-primary text-white font-black rounded-xl text-sm"
              >
                找活動
              </button>
              <button
                onClick={() => handleSearch('clubs')}
                className="flex items-center justify-center gap-2 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-black rounded-xl text-sm"
              >
                找社團
              </button>
            </div>
          </div>

          {/* Inline Collapsible Map Panel */}
          {isMapOpen && (
            <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 rounded-b-3xl border border-gray-100 dark:border-gray-700 border-t-0 shadow-[0_20px_40px_rgba(0,0,0,0.1)] overflow-hidden animate-slide-up z-10">
              <div className="p-6 flex flex-col md:flex-row gap-6">
                {/* Left: SVG Map */}
                <div className="flex-1 bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 flex flex-col items-center justify-center relative min-h-[300px]">
                  <div className="absolute top-4 left-4 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <MapIcon size={14} className="text-primary" />
                    地圖快速點選
                  </div>
                  <svg viewBox="0 0 220 520" className="w-full h-full max-h-[300px] drop-shadow-md">
                    {TAIWAN_PATH_DATA.map((item) => {
                      const isSel = selectedLocations.includes(item.id) || selectedLocations.includes('全台灣');
                      return (
                        <path
                          key={item.id}
                          d={item.d}
                          onClick={() => toggleLocation(item.id)}
                          className={`cursor-pointer transition-all duration-300 stroke-[1.5] ${
                            isSel 
                              ? 'fill-primary stroke-white dark:stroke-gray-800 scale-[1.02] filter drop-shadow-sm' 
                              : 'fill-white dark:fill-gray-700 stroke-gray-200 dark:stroke-gray-600 hover:fill-orange-100'
                          }`}
                          style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
                        />
                      );
                    })}
                  </svg>
                </div>

                {/* Right: Quick List & Confirm */}
                <div className="w-full md:w-64 flex flex-col">
                  <div className="flex-1 overflow-y-auto max-h-[300px] no-scrollbar pr-2">
                    <div className="space-y-1">
                      <button
                        onClick={() => setSelectedLocations(['全台灣'])}
                        className={`w-full text-left px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-between ${
                          selectedLocations.includes('全台灣') 
                            ? 'bg-primary text-white shadow-md' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        全台灣
                        {selectedLocations.includes('全台灣') && <Check size={14} />}
                      </button>
                      <div className="h-px bg-gray-100 dark:bg-gray-700 my-2" />
                      <div className="grid grid-cols-2 md:grid-cols-1 gap-1">
                        {TAIWAN_PATH_DATA.map(loc => (
                          <button
                            key={loc.id}
                            onClick={() => toggleLocation(loc.id)}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                              selectedLocations.includes(loc.id) 
                                ? 'bg-orange-50 dark:bg-primary/10 text-primary' 
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500'
                            }`}
                          >
                            {loc.id}
                            {selectedLocations.includes(loc.id) && <Check size={12} />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700 mt-4 space-y-3">
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-black uppercase tracking-widest">
                      <span>已選 {selectedLocations.includes('全台灣') ? '全台' : selectedLocations.length} 區</span>
                      <button onClick={() => setSelectedLocations(['全台灣'])} className="hover:text-primary flex items-center gap-1"><RefreshCw size={10}/> 重設</button>
                    </div>
                    <button
                      onClick={() => setIsMapOpen(false)}
                      className="w-full py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-xl text-sm shadow-lg hover:bg-gray-800 transition-all active:scale-95"
                    >
                      完成選擇
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Unified Category Selector (Hero Mode) */}
        <CategorySelector 
          selectedMainCategories={selectedMainCategories}
          selectedSubCategories={selectedSubCategories}
          onMainCategoryToggle={handleMainCategoryToggle}
          onSubCategoryToggle={handleSubCategoryToggle}
          variant="full"
        />
      </div>

      {/* Quick Discovery Scroll */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4 px-1">
          <h2 className="font-black text-lg text-gray-900 dark:text-white">快速探索</h2>
          <div className="h-[2px] flex-1 bg-gray-100 dark:bg-gray-800 ml-2"></div>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-4 px-4 pb-2">
          {[
            { label: '即將額滿', icon: '🔥', color: 'bg-orange-50 text-orange-600 border-orange-100', filters: { isNearlyFull: true } },
            { label: '新手友善', icon: '🔰', color: 'bg-green-50 text-green-600 border-green-100', filters: { levels: ['新手友善'] } },
            { label: '百元有找', icon: '💰', color: 'bg-blue-50 text-blue-600 border-blue-100', filters: { maxPrice: 100 } },
            { label: '下班時間', icon: '🌙', color: 'bg-indigo-50 text-indigo-600 border-indigo-100', filters: { searchTerm: '下班' } },
            { label: '週末安排', icon: '📅', color: 'bg-rose-50 text-rose-600 border-rose-100', filters: { searchTerm: '週末' } },
            { label: '女生主辦', icon: '👩', color: 'bg-pink-50 text-pink-600 border-pink-100', filters: { searchTerm: '女生主辦' } },
            { label: '性別友善', icon: '🌈', color: 'bg-purple-50 text-purple-600 border-purple-100', filters: { searchTerm: '性別友善' } },
          ].map(tag => (
            <button
              key={tag.label}
              onClick={() => navigate('/activities', { state: tag.filters })}
              className={`flex-shrink-0 w-[84px] h-[84px] flex flex-col items-center justify-center gap-1.5 rounded-2xl border transition-all active:scale-95 shadow-sm hover:shadow-md snap-start ${tag.color}`}
            >
              <span className="text-2xl">{tag.icon}</span>
              <span className="text-[10px] font-black">{tag.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Clubs */}
      <div className="mb-10">
        <div className="flex justify-between items-end mb-4 px-1">
          <div>
            <h2 className="font-black text-xl text-gray-900 dark:text-white">熱門社團</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">目前最活躍的運動圈子</p>
          </div>
          <span
            onClick={() => navigate('/clubs')}
            className="text-xs text-primary font-bold cursor-pointer hover:underline bg-primary/5 px-2 py-1 rounded"
          >
            查看更多
          </span>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {clubs.map(club => (
            <div
              key={club.id}
              onClick={() => handleClubClick(club.id)}
              className="flex-shrink-0 w-64 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-50 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group"
            >
              <img src={club.logo} className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-700 object-cover group-hover:scale-105 transition-transform" alt={club.name} />
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1 group-hover:text-primary transition-colors">{club.name}</h4>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex items-center text-[10px] text-gray-500 dark:text-gray-400">
                    <Users size={10} className="mr-1" /> {club.membersCount}
                  </div>
                  <div className="flex items-center text-[10px] text-yellow-500 font-bold">
                    ★ {club.rating}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Activities */}
      <div className="mb-4">
        <div className="flex justify-between items-end mb-4 px-1">
          <div>
            <h2 className="font-black text-xl text-gray-900 dark:text-white">推薦活動</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">精選近期優質運動團</p>
          </div>
          <span
            onClick={() => navigate('/activities')}
            className="text-xs text-primary font-bold cursor-pointer hover:underline bg-primary/5 px-2 py-1 rounded"
          >
            查看更多
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.slice(0, 6).map(activity => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onClick={() => handleActivityClick(activity)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
