import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ActivityCard from '../components/activity/ActivityCard';
import HomeSearchBar from '../components/home/HomeSearchBar';
import HomeSelectedTags from '../components/home/HomeSelectedTags';
import ExploreTagsSection from '../components/home/ExploreTagsSection';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    activities, clubs, handleActivityClick, handleClubClick,
    isMapOpen, setIsMapOpen,
    isCategoryOpen, setIsCategoryOpen,
    homeLocations, homeMainCategories, homeSubCategories,
    toggleHomeLocation, toggleHomeMainCategory,
    exploreTags, setIsExploreManagerOpen,
  } = useAppContext();

  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (type: 'activities' | 'clubs') => {
    if (type === 'activities') {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (homeMainCategories.length && !homeMainCategories.includes('所有運動')) {
        params.set('mainCategories', homeMainCategories.join(','));
      }
      if (homeSubCategories.length) params.set('subCategories', homeSubCategories.join(','));
      if (homeLocations.length && !homeLocations.includes('全台灣')) {
        params.set('cities', homeLocations.join(','));
      }
      navigate(`/activities?${params.toString()}`);
    } else {
      navigate(`/${type}`, {
        state: {
          searchTerm: searchQuery,
          mainCategories: homeMainCategories,
          subCategories: homeSubCategories,
          locations: homeLocations,
        }
      });
    }
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
            找尋你的<span className="text-primary">運動圈</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
            Explore activities & clubs in Taiwan
          </p>
        </div>

        <HomeSearchBar
          isMapOpen={isMapOpen}
          isCategoryOpen={isCategoryOpen}
          onToggleMap={() => { setIsMapOpen(!isMapOpen); setIsCategoryOpen(false); }}
          onToggleCategory={() => { setIsCategoryOpen(!isCategoryOpen); setIsMapOpen(false); }}
          locationLabel={formatLocationLabel()}
          categoryLabel={formatCategoryLabel()}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onSearch={handleSearch}
        />

        {!isMapOpen && !isCategoryOpen && (
          <HomeSelectedTags
            locations={homeLocations}
            mainCategories={homeMainCategories}
            onRemoveLocation={toggleHomeLocation}
            onRemoveCategory={toggleHomeMainCategory}
          />
        )}
      </div>

      {/* --- Rest of Content --- */}
      <div className="space-y-12 relative z-10">

        {/* Quick Discovery */}
        <ExploreTagsSection
          tags={exploreTags}
          onManage={() => setIsExploreManagerOpen(true)}
        />

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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {activities.slice(0, 8).map(activity => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onClick={() => handleActivityClick(activity)}
                variant="compact"
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
