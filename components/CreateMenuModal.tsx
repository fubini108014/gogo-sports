import React from 'react';
import { CalendarPlus, Users, PenSquare, X } from 'lucide-react';

interface CreateMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: 'ACTIVITY' | 'CLUB' | 'POST') => void;
}

const CreateMenuModal: React.FC<CreateMenuModalProps> = ({ isOpen, onClose, onSelectAction }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Menu Content */}
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-t-2xl shadow-2xl p-6 pointer-events-auto relative animate-slide-up mb-0 sm:mb-6 sm:rounded-2xl">
         <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">建立新項目</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
               <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
         </div>

         <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => onSelectAction('ACTIVITY')}
              className="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-primary/30 hover:bg-orange-50 transition-all group"
            >
               <div className="w-14 h-14 bg-orange-100 text-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CalendarPlus size={28} />
               </div>
               <span className="font-bold text-gray-700 dark:text-gray-200 text-sm">開團</span>
            </button>

            <button
              onClick={() => onSelectAction('CLUB')}
              className="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-secondary/50 hover:bg-lime-50 transition-all group"
            >
               <div className="w-14 h-14 bg-lime-100 text-lime-700 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users size={28} />
               </div>
               <span className="font-bold text-gray-700 dark:text-gray-200 text-sm">創社</span>
            </button>

            <button
              onClick={() => onSelectAction('POST')}
              className="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 hover:bg-blue-50 transition-all group"
            >
               <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PenSquare size={28} />
               </div>
               <span className="font-bold text-gray-700 dark:text-gray-200 text-sm">發文</span>
            </button>
         </div>

         <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 text-center">
             <p className="text-xs text-gray-400 dark:text-gray-500">選擇上方功能開始您的運動旅程</p>
         </div>
      </div>
    </div>
  );
};

export default CreateMenuModal;
