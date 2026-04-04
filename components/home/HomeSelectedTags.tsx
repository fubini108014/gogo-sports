import React from 'react';
import { X } from 'lucide-react';

interface HomeSelectedTagsProps {
  locations: string[];
  mainCategories: string[];
  onRemoveLocation: (loc: string) => void;
  onRemoveCategory: (cat: string) => void;
}

const HomeSelectedTags: React.FC<HomeSelectedTagsProps> = ({
  locations,
  mainCategories,
  onRemoveLocation,
  onRemoveCategory,
}) => {
  const hasLocationTags = locations.some(l => l !== '全台灣');
  const hasCategoryTags = mainCategories.some(c => c !== '所有運動');

  if (!hasLocationTags && !hasCategoryTags) return null;

  return (
    <div className="flex flex-wrap justify-center gap-2 mt-4 animate-fade-in px-4">
      {locations.filter(l => l !== '全台灣').map(loc => (
        <span
          key={loc}
          onClick={() => onRemoveLocation(loc)}
          className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-[9px] font-black text-slate-500 rounded-md cursor-pointer hover:bg-red-50 hover:text-red-500 transition-colors flex items-center gap-1"
        >
          📍 {loc} <X size={8} />
        </span>
      ))}
      {mainCategories.filter(c => c !== '所有運動').map(cat => (
        <span
          key={cat}
          onClick={() => onRemoveCategory(cat)}
          className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-[9px] font-black text-slate-500 rounded-md cursor-pointer hover:bg-red-50 hover:text-red-500 transition-colors flex items-center gap-1"
        >
          🏷️ {cat} <X size={8} />
        </span>
      ))}
    </div>
  );
};

export default HomeSelectedTags;
