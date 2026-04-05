import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExploreTag } from '../../types';
import { Settings2 } from 'lucide-react';
import ExploreTagCard from '../ui/ExploreTagCard';

interface ExploreTagsSectionProps {
  tags: ExploreTag[];
  onManage: () => void;
}

const ExploreTagsSection: React.FC<ExploreTagsSectionProps> = ({ tags, onManage }) => {
  const navigate = useNavigate();
  const activeTags = tags.filter(t => t.enabled);

  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="font-black text-lg text-slate-900 dark:text-white flex-shrink-0">探索精選</h2>
        <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
        <button
          onClick={onManage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400 flex-shrink-0"
        >
          <Settings2 size={13} />
          <span className="text-[10px] font-black uppercase tracking-wider">管理</span>
        </button>
      </div>

      {activeTags.length === 0 ? (
        <button
          onClick={onManage}
          className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-400 hover:text-primary hover:border-primary transition-colors"
        >
          點擊「管理」新增探索標籤
        </button>
      ) : (
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
          {activeTags.map(tag => (
            <ExploreTagCard
              key={tag.id}
              icon={tag.icon}
              label={tag.label}
              colorKey={tag.colorKey}
              onClick={() => {
                const params = new URLSearchParams();
                if (tag.filters.searchTerm) params.set('search', tag.filters.searchTerm);
                if (tag.filters.cities?.length) params.set('cities', tag.filters.cities.join(','));
                if (tag.filters.mainCategories?.length) params.set('mainCategories', tag.filters.mainCategories.join(','));
                if (tag.filters.subCategories?.length) params.set('subCategories', tag.filters.subCategories.join(','));
                if (tag.filters.levels?.length) params.set('levels', tag.filters.levels.join(','));
                if (tag.filters.isNearlyFull) params.set('isNearlyFull', 'true');
                if (tag.filters.minPrice !== undefined) params.set('minPrice', String(tag.filters.minPrice));
                if (tag.filters.maxPrice !== undefined) params.set('maxPrice', String(tag.filters.maxPrice));
                
                navigate(`/activities?${params.toString()}`);
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default ExploreTagsSection;
