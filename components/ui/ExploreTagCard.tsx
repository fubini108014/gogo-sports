import React from 'react';
import { ExploreColorKey, EXPLORE_COLOR_MAP } from '../../types';

interface ExploreTagCardProps {
  icon: string;
  label: string;
  colorKey: ExploreColorKey;
  subtitle?: string;
  onClick?: () => void;
  className?: string;
}

const ExploreTagCard: React.FC<ExploreTagCardProps> = ({ icon, label, colorKey, subtitle, onClick, className = '' }) => {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      {...(onClick ? { onClick } : {})}
      className={`flex-shrink-0 px-5 py-3 rounded-2xl border flex flex-col items-center gap-3 shadow-sm ${EXPLORE_COLOR_MAP[colorKey].card} ${onClick ? 'transition-all hover:scale-[1.02] active:scale-95' : ''} ${className}`}
    >
      <span className="text-xl">{icon}</span>
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-xs font-black whitespace-nowrap">{label}</span>
        {subtitle && <span className="text-[9px] opacity-60 whitespace-nowrap">{subtitle}</span>}
      </div>
    </Tag>
  );
};

export default ExploreTagCard;
