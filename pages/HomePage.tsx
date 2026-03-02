import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { SPORTS_HIERARCHY, TAIWAN_CITIES } from '../constants';
import ActivityCard from '../components/ActivityCard';
import { Search, Filter, MapPin, X, Users } from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { activities, clubs, handleActivityClick, handleClubClick } = useAppContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [mainCategory, setMainCategory] = useState(SPORTS_HIERARCHY[0].name);
  const [subCategory, setSubCategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState('全台灣');

  const currentSubCategories = SPORTS_HIERARCHY.find(c => c.name === mainCategory)?.items || [];

  const handleSearch = (target: 'activities' | 'clubs') => {
    navigate(`/${target}`, {
      state: {
        searchTerm: searchQuery,
        mainCategory,
        subCategory,
        location: selectedLocation
      }
    });
  };

  return (
    <div className="animate-fade-in px-4 pt-8 pb-20">

      {/* Hero Search Panel */}
      <div className="mb-10 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full -ml-12 -mb-12 blur-xl"></div>

        <div className="relative z-10">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">找尋你的運動圈</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">輸入關鍵字或選擇分類，立即開始探索</p>

          {/* Search Input */}
          <div className="relative mb-6">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="想找什麼運動？（如：羽球、慢跑...）"
              className="w-full pl-11 pr-11 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-xl text-base text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Location Filter */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3 text-gray-400 dark:text-gray-500 px-1">
              <MapPin size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">選擇地點</span>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {TAIWAN_CITIES.map(city => (
                <button
                  key={city}
                  onClick={() => setSelectedLocation(city)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border flex-shrink-0 ${
                    selectedLocation === city
                      ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100 shadow-md scale-105'
                      : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Category Chips */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3 text-gray-400 dark:text-gray-500 px-1">
              <Filter size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">運動分類</span>
            </div>
            <div className="flex overflow-x-auto no-scrollbar gap-2 mb-3">
              {SPORTS_HIERARCHY.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => { setMainCategory(cat.name); setSubCategory(null); }}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                    mainCategory === cat.name
                      ? 'bg-primary text-white shadow-lg shadow-orange-200 dark:shadow-none scale-105'
                      : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {currentSubCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 animate-fade-in mt-2">
                <button
                  onClick={() => setSubCategory(null)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    subCategory === null
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  全部{mainCategory}
                </button>
                {currentSubCategories.map(item => (
                  <button
                    key={item}
                    onClick={() => setSubCategory(item === subCategory ? null : item)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      subCategory === item
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleSearch('activities')}
              className="flex items-center justify-center gap-2 py-4 bg-primary text-white font-black rounded-2xl shadow-lg shadow-orange-100 dark:shadow-none hover:bg-orange-600 active:scale-95 transition-all text-lg"
            >
              <Search size={20} /> 找活動
            </button>
            <button
              onClick={() => handleSearch('clubs')}
              className="flex items-center justify-center gap-2 py-4 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-black rounded-2xl shadow-lg shadow-gray-200 dark:shadow-none hover:bg-gray-800 dark:hover:bg-white active:scale-95 transition-all text-lg"
            >
              <Users size={20} /> 找社團
            </button>
          </div>
        </div>
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
