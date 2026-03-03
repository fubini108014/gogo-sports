import React, { useState } from 'react';
import { X } from 'lucide-react';
import SportCategoryPicker from './SportCategoryPicker';

interface SportCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelected?: string[];
  onConfirm: (selectedTags: string[]) => void;
  title?: string;
  maxSelections?: number;
}

const SportCategoryModal: React.FC<SportCategoryModalProps> = ({
  isOpen,
  onClose,
  initialSelected = [],
  onConfirm,
  title = '選擇運動項目',
  maxSelections = 5
}) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(initialSelected);

  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      }
      if (prev.length >= maxSelections) return prev;
      return [...prev, tag];
    });
  };

  const handleConfirm = () => {
    onConfirm(selectedTags);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" 
        onClick={onClose}
      ></div>

      {/* Centered Modal Container */}
      <div className="bg-white dark:bg-gray-800 w-full max-w-2xl h-[85vh] md:h-[600px] rounded-[32px] shadow-2xl relative z-10 overflow-hidden animate-slide-up flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 z-20">
          <div>
            <h3 className="font-black text-gray-900 dark:text-white text-xl tracking-tight">
              {title}
            </h3>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">
              Select up to {maxSelections} categories
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all active:scale-90"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content Area (Double Column Picker) */}
        <div className="flex-1 overflow-hidden">
          <SportCategoryPicker 
            selectedSubCategories={selectedTags}
            onToggleSubCategory={handleToggleTag}
            maxSelections={maxSelections}
          />
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-300 font-black text-sm rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-[2] px-6 py-4 font-black text-sm rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
              selectedTags.length > 0
              ? 'bg-primary text-white shadow-orange-200 dark:shadow-none hover:bg-orange-600'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
            disabled={selectedTags.length === 0}
          >
            確認選擇 ({selectedTags.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default SportCategoryModal;
