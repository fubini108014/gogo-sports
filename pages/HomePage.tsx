import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ActivityCard from '../components/ActivityCard';
import { Search, MapPin, X, Users, ChevronDown, RefreshCw } from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    activities, clubs, handleActivityClick, handleClubClick,
    isMapOpen, setIsMapOpen,
    isCategoryOpen, setIsCategoryOpen,
    homeLocations, homeMainCategories, homeSubCategories,
    toggleHomeLocation, toggleHomeMainCategory,
  } = useAppContext();

  const [searchType, setSearchType] = useState<'activities' | 'clubs'>('activities');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    navigate(`/${searchType}`, {
      state: {
        searchTerm: searchQuery,
        mainCategories: homeMainCategories,
        subCategories: homeSubCategories,
        locations: homeLocations,
      }
    });
  };

  const formatLocationLabel = () => {
    if (homeLocations.includes('全台灣')) return '全台灣';
    return homeLocations.length === 1 ? homeLocations[0] : `${homeLocations[0]} +${homeLocations.length - 1}`;
  };

  const formatCategoryLabel = () => {
    if (homeMainCategories.includes('所有運動')) return '所有運動';
    const total = homeMainCategories.length + homeSubCategories.length;
    return total === 1 ? (homeMainCategories[0] || homeSubCategories[0]) : `${homeMainCategories[0]} +${total - 1}`;
  };

  return (
    <div className="animate-fade-in px-4 pt-4 pb-20 max-w-5xl mx-auto">

      {/* --- Hero Section --- */}
      <div className="relative mb-8 pt-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            找尋你的<span className={searchType === 'activities' ? 'text-primary' : 'text-indigo-500'}>運動圈</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
            Explore activities & clubs in Taiwan
          </p>
        </div>

        {/* --- Floating Island Search --- */}
        <div className="relative z-30 max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-700 p-1.5 transition-all duration-500">

          <div className="flex flex-col md:flex-row items-center gap-1 md:h-16">

            {/* Location Button */}
            <button
              onClick={() => { setIsMapOpen(!isMapOpen); setIsCategoryOpen(false); }}
              className={`flex-1 w-full md:w-auto flex items-center gap-3 px-6 py-3 md:py-0 h-full rounded-2xl md:rounded-full hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left group ${isMapOpen ? 'bg-slate-50 dark:bg-slate-700/50' : ''}`}
            >
              <div className={`p-2 rounded-full transition-colors ${isMapOpen ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}>
                <MapPin size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">在哪裡?</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{formatLocationLabel()}</span>
              </div>
              <ChevronDown size={14} className={`ml-auto text-slate-300 group-hover:text-slate-500 transition-transform ${isMapOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className="hidden md:block w-px h-10 bg-slate-100 dark:bg-slate-700"></div>

            {/* Category Button */}
            <button
              onClick={() => { setIsCategoryOpen(!isCategoryOpen); setIsMapOpen(false); }}
              className={`flex-1 w-full md:w-auto flex items-center gap-3 px-6 py-3 md:py-0 h-full rounded-2xl md:rounded-full hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left group ${isCategoryOpen ? 'bg-slate-50 dark:bg-slate-700/50' : ''}`}
            >
              <div className={`p-2 rounded-full transition-colors ${isCategoryOpen ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}>
                <RefreshCw size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">做什麼?</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{formatCategoryLabel()}</span>
              </div>
              <ChevronDown size={14} className={`ml-auto text-slate-300 group-hover:text-slate-500 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className="hidden md:block w-px h-10 bg-slate-100 dark:bg-slate-700"></div>

            {/* Keyword Input */}
            <div className="flex-[1.2] w-full md:w-auto flex items-center gap-3 px-6 h-full rounded-full">
              <Search size={20} className="text-slate-300" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="關鍵字搜尋..."
                className="w-full bg-transparent text-sm font-bold text-slate-700 dark:text-slate-200 placeholder-slate-300 focus:outline-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="w-full md:w-auto flex items-center gap-1.5 p-1">
              <button
                onClick={() => { setSearchType('activities'); handleSearch(); }}
                className="flex-1 md:flex-none px-6 h-12 md:h-13 bg-primary hover:bg-orange-600 text-white font-black text-xs rounded-2xl md:rounded-full shadow-lg shadow-orange-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Search size={14} strokeWidth={3} /> 找活動
              </button>
              <button
                onClick={() => { setSearchType('clubs'); handleSearch(); }}
                className="flex-1 md:flex-none px-6 h-12 md:h-13 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-black text-xs rounded-2xl md:rounded-full shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Users size={14} /> 找社團
              </button>
            </div>
          </div>
        </div>

        {/* Selected Tags Summary */}
        {!isMapOpen && !isCategoryOpen && (
          <div className="flex flex-wrap justify-center gap-2 mt-4 animate-fade-in px-4">
            {homeLocations.filter(l => l !== '全台灣').map(loc => (
              <span key={loc} onClick={() => toggleHomeLocation(loc)} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-[9px] font-black text-slate-500 rounded-md cursor-pointer hover:bg-red-50 hover:text-red-500 transition-colors flex items-center gap-1">📍 {loc} <X size={8}/></span>
            ))}
            {homeMainCategories.filter(c => c !== '所有運動').map(cat => (
              <span key={cat} onClick={() => toggleHomeMainCategory(cat)} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-[9px] font-black text-slate-500 rounded-md cursor-pointer hover:bg-red-50 hover:text-red-500 transition-colors flex items-center gap-1">🏷️ {cat} <X size={8}/></span>
            ))}
          </div>
        )}
      </div>

      {/* --- Rest of Content --- */}
      <div className="space-y-12 relative z-10">

        {/* Quick Discovery */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-lg text-slate-900 dark:text-white">探索精選</h2>
            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800 mx-4"></div>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
            {[
              { label: '即將額滿', icon: '🔥', color: 'text-orange-600 bg-orange-50 border-orange-100', filters: { isNearlyFull: true } },
              { label: '新手友善', icon: '🔰', color: 'text-green-600 bg-green-50 border-green-100', filters: { levels: ['新手友善'] } },
              { label: '百元有找', icon: '💰', color: 'text-blue-600 bg-blue-50 border-blue-100', filters: { maxPrice: 100 } },
              { label: '下班運動', icon: '🌙', color: 'text-indigo-600 bg-indigo-50 border-indigo-100', filters: { searchTerm: '下班' } },
              { label: '週末限定', icon: '📅', color: 'text-rose-600 bg-rose-50 border-rose-100', filters: { searchTerm: '週末' } },
            ].map(tag => (
              <button
                key={tag.label}
                onClick={() => navigate('/activities', { state: tag.filters })}
                className={`flex-shrink-0 px-5 py-3 rounded-2xl border flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-sm ${tag.color}`}
              >
                <span className="text-xl">{tag.icon}</span>
                <span className="text-xs font-black whitespace-nowrap">{tag.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Featured Clubs */}
        <section>
          <div className="flex justify-between items-center mb-6 px-1">
            <h2 className="font-black text-xl text-slate-900 dark:text-white">熱門社團</h2>
            <button onClick={() => navigate('/clubs')} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {clubs.slice(0, 3).map(club => (
              <div
                key={club.id}
                onClick={() => handleClubClick(club.id)}
                className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-50 dark:border-slate-700 hover:shadow-xl transition-all cursor-pointer group"
              >
                <img src={club.logo} className="w-12 h-12 rounded-xl object-cover group-hover:rotate-3 transition-transform" alt={club.name} />
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">{club.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">★ {club.rating} ‧ {club.membersCount} 位成員</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Activities */}
        <section>
          <div className="flex justify-between items-center mb-6 px-1">
            <h2 className="font-black text-xl text-slate-900 dark:text-white">推薦活動</h2>
            <button onClick={() => navigate('/activities')} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Explore</button>
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
        </section>
      </div>
    </div>
  );
};

export default HomePage;
