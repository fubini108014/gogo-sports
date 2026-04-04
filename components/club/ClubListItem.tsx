import React from 'react';
import { Club } from '../../types';
import { ChevronRight, ShieldCheck } from 'lucide-react';

interface ClubListItemProps {
  club: Club;
  onClick: () => void;
  variant: 'managed' | 'joined';
}

const ClubListItem: React.FC<ClubListItemProps> = ({ club, onClick, variant }) => (
  <div
    onClick={onClick}
    className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
  >
    <img src={club.logo} className="w-14 h-14 rounded-lg object-cover bg-gray-100 dark:bg-gray-700" alt={club.name} />
    <div className="flex-1">
      <h4 className="font-bold text-gray-900 dark:text-white">{club.name}</h4>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex gap-3">
        <span>{club.membersCount} 成員</span>
        <span>★ {club.rating}</span>
      </div>
    </div>
    {variant === 'managed' ? (
      <div className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
        <ShieldCheck size={12} /> 社長
      </div>
    ) : (
      <ChevronRight size={20} className="text-gray-300 dark:text-gray-500" />
    )}
  </div>
);

export default ClubListItem;
