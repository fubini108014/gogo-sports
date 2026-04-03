import React from 'react';
import { LucideIcon } from 'lucide-react';

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  onClick: () => void;
  variant: 'desktop' | 'mobile';
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, isActive, onClick, variant }) => {
  if (variant === 'desktop') {
    return (
      <button
        onClick={onClick}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all hover:bg-gray-100 dark:hover:bg-gray-800 ${
          isActive ? 'text-primary font-bold bg-primary/5' : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
        <span className="text-sm uppercase tracking-wide font-black">{label}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all ${
        isActive ? 'text-primary' : 'text-gray-400 dark:text-gray-500'
      }`}
    >
      <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
      <span className="text-[10px] font-black uppercase tracking-wider">{label.substring(0, 2)}</span>
    </button>
  );
};

export default NavItem;
