import React from 'react';
import { SPORTS_HIERARCHY } from '../../constants';
import { X } from 'lucide-react';

interface CategorySelectorProps {
  selectedMainCategories: string[];
  selectedSubCategories: string[];
  onMainCategoryToggle: (name: string) => void;
  onSubCategoryToggle: (name: string) => void;
  variant?: 'compact' | 'full';
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedMainCategories,
  selectedSubCategories,
  onMainCategoryToggle,
  onSubCategoryToggle,
  variant = 'compact'
}) => {
  const getSubCategoriesForSelected = () => {
    const subs: string[] = [];
    selectedMainCategories.forEach(main => {
      const cat = SPORTS_HIERARCHY.find(c => c.name === main);
      if (cat) subs.push(...cat.items);
    });
    return [...new Set(subs)];
  };

  const currentSubCategories = getSubCategoriesForSelected();

  return (
    <div className={`w-full ${variant === 'full' ? 'max-w-2xl mx-auto mt-6' : ''}`}>
      {/* Main Categories */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 py-1">
        {SPORTS_HIERARCHY.map(cat => (
          <button
            key={cat.name}
            onClick={() => onMainCategoryToggle(cat.name)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 border flex items-center gap-1.5 ${
              selectedMainCategories.includes(cat.name)
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            {cat.name}
            {selectedMainCategories.includes(cat.name) && cat.name !== '所有運動' && <X size={10} />}
          </button>
        ))}
      </div>

      {/* Sub Categories (Tags) */}
      {currentSubCategories.length > 0 && (
        <div className={`flex flex-wrap gap-1.5 mt-4 animate-fade-in ${variant === 'full' ? 'justify-center' : 'justify-start'}`}>
          {currentSubCategories.map(item => (
            <button
              key={item}
              onClick={() => onSubCategoryToggle(item)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all border ${
                selectedSubCategories.includes(item)
                  ? 'bg-primary/10 text-primary border-primary/20 ring-1 ring-primary/10'
                  : 'bg-transparent text-gray-400 border-transparent hover:text-gray-600 dark:hover:text-gray-200'
              }`}
            >
              {selectedSubCategories.includes(item) ? `✓ ${item}` : `#${item}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategorySelector;
