import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Club } from '../types';
import { SPORTS_HIERARCHY } from '../constants';
import { ClubCardSkeleton } from './Skeleton';
import { Search, ChevronLeft, Users, Star, Filter, ArrowUpDown, XCircle } from 'lucide-react';

interface ClubListProps {
  clubs: Club[];
  onClubClick: (clubId: string) => void;
  onBack: () => void;
}

type SortOption = 'RATING' | 'MEMBERS' | 'NAME';

const ClubList: React.FC<ClubListProps> = ({ clubs, onClubClick, onBack }) => {
  const location = useLocation();
  const initialState = location.state || {};

  const [searchTerm, setSearchTerm] = useState(initialState.searchTerm || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialState.mainCategory || '所有運動');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(initialState.subCategory || null);
  const [sortBy, setSortBy] = useState<SortOption>('MEMBERS');

  const currentSubCategories = useMemo(() => {
    return SPORTS_HIERARCHY.find(c => c.name === selectedCategory)?.items || [];
  }, [selectedCategory]);

  const filteredAndSortedClubs = useMemo(() => {
    let result = clubs;

    // 1. Filter by Category & Sub-Category
    if (selectedCategory !== '所有運動') {
      if (selectedSubCategory) {
        // Precise filter: Club tags must include the specific sub-category
        result = result.filter(club => club.tags.includes(selectedSubCategory));
      } else {
        // Broad filter: Club tags must match ANY item in the main category
        const category = SPORTS_HIERARCHY.find(c => c.name === selectedCategory);
        if (category) {
          result = result.filter(club =>
            club.tags.some(tag =>
              category.items.some(item => tag.includes(item) || item.includes(tag))
            )
          );
        }
      }
    }

    // 2. Filter by Search Term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(club =>
        club.name.toLowerCase().includes(term) ||
        club.tags.some(tag => tag.toLowerCase().includes(term)) ||
        club.description.toLowerCase().includes(term)
      );
    }

    // 3. Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'RATING':
          return b.rating - a.rating;
        case 'MEMBERS':
          return b.membersCount - a.membersCount;
        case 'NAME':
          return a.name.localeCompare(b.name, 'zh-TW');
        default:
          return 0;
      }
    });

    return result;
  }, [clubs, searchTerm, selectedCategory, selectedSubCategory, sortBy]);

  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const handleReset = () => {
    setSearchTerm('');
    setSelectedCategory('所有運動');
    setSelectedSubCategory(null);
    setSortBy('MEMBERS');
  };

  return (
    <div className="animate-fade-in min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">

      {/* Sticky Header Section */}
      <div className="sticky top-0 z-30 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-md pt-6 pb-2 px-4 shadow-sm border-b border-gray-100/50 dark:border-gray-700">
        {/* Top Bar */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-700 dark:text-gray-200"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">探索社團</h1>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-gray-600 rounded-xl leading-5 bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/50 transition-all shadow-sm text-sm"
            placeholder="搜尋社團名稱、關鍵字..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XCircle size={16} fill="currentColor" className="text-gray-200 dark:text-gray-600" />
            </button>
          )}
        </div>

        {/* Controls Row: Category Filter & Sort */}
        <div className="space-y-3">
           {/* Level 1: Main Category Chips */}
           <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
             {SPORTS_HIERARCHY.map((cat) => (
               <button
                 key={cat.name}
                 onClick={() => {
                    setSelectedCategory(cat.name);
                    setSelectedSubCategory(null);
                 }}
                 className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 border ${
                   selectedCategory === cat.name
                   ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                   : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                 }`}
               >
                 {cat.name}
               </button>
             ))}
           </div>

           {/* Level 2: Sub Category Chips */}
           {currentSubCategories.length > 0 && (
             <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1 animate-fade-in">
                <button
                   onClick={() => setSelectedSubCategory(null)}
                   className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex-shrink-0 ${
                     selectedSubCategory === null
                     ? 'bg-primary/10 text-primary border-primary/20'
                     : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                   }`}
                 >
                   全部{selectedCategory}
                 </button>
                {currentSubCategories.map(item => (
                  <button
                    key={item}
                    onClick={() => setSelectedSubCategory(item === selectedSubCategory ? null : item)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex-shrink-0 ${
                      selectedSubCategory === item
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {item}
                  </button>
                ))}
             </div>
           )}

           {/* Sort & Count Row */}
           <div className="flex justify-between items-center px-1">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                共找到 <span className="text-primary font-bold">{filteredAndSortedClubs.length}</span> 個社團
              </span>

              <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-600 shadow-sm">
                <button
                  onClick={() => setSortBy('MEMBERS')}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${sortBy === 'MEMBERS' ? 'bg-primary/10 text-primary' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
                >
                  熱門
                </button>
                <div className="w-[1px] bg-gray-200 dark:bg-gray-600 mx-1 my-1"></div>
                <button
                  onClick={() => setSortBy('RATING')}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${sortBy === 'RATING' ? 'bg-primary/10 text-primary' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
                >
                  評價
                </button>
              </div>
           </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="px-4 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <ClubCardSkeleton key={i} />)
          ) : filteredAndSortedClubs.length > 0 ? (
            filteredAndSortedClubs.map(club => (
              <div
                key={club.id}
                onClick={() => onClubClick(club.id)}
                className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer flex gap-4 items-start group"
              >
                <div className="relative">
                  <img src={club.logo} className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl bg-gray-100 dark:bg-gray-700 object-cover flex-shrink-0 ring-1 ring-gray-100 dark:ring-gray-700" alt={club.name} />
                  {club.rating >= 4.8 && (
                    <div className="absolute -top-2 -left-2 bg-yellow-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                      推薦
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                     <h4 className="font-bold text-gray-900 dark:text-white text-base truncate pr-2 group-hover:text-primary transition-colors">{club.name}</h4>
                     <div className="flex items-center text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 px-1.5 py-0.5 rounded-md">
                        <Star size={10} className="text-yellow-400 mr-0.5 fill-current" /> {club.rating}
                     </div>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2 leading-relaxed h-8">
                    {club.description}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50 dark:border-gray-700">
                     <div className="flex items-center text-xs text-gray-400 dark:text-gray-500">
                       <Users size={12} className="mr-1" />
                       <span className="font-semibold text-gray-600 dark:text-gray-300 mr-0.5">{club.membersCount}</span> 成員
                     </div>
                     <div className="flex gap-1 overflow-hidden">
                       {club.tags.slice(0, 2).map(tag => (
                         <span key={tag} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] rounded font-medium whitespace-nowrap">
                           #{tag}
                         </span>
                       ))}
                       {club.tags.length > 2 && (
                         <span className="px-1.5 py-0.5 bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-500 text-[10px] rounded font-medium">
                           +{club.tags.length - 2}
                         </span>
                       )}
                     </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mb-4 border border-gray-100 dark:border-gray-700">
                 <Filter size={32} className="text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">沒有找到符合的社團</h3>

              <div className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
                 {searchTerm && (
                   <div className="mb-1">
                     關鍵字：「<span className="font-bold text-gray-700 dark:text-gray-200">{searchTerm}</span>」
                   </div>
                 )}
                 {selectedCategory !== '所有運動' && (
                    <div className="mb-1">
                      分類：「<span className="font-bold text-gray-700 dark:text-gray-200">{selectedSubCategory || selectedCategory}</span>」
                    </div>
                 )}
                 <div className="mt-2">
                   試試看減少篩選條件，或是清除設定重新搜尋。
                 </div>
              </div>

              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-gray-800 transition-all text-sm active:scale-95"
              >
                清除所有篩選
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClubList;
