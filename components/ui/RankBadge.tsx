import React from 'react';
import { ClubMemberRank, CLUB_MEMBER_RANK_META } from '../../types';

interface RankBadgeProps {
  rank: ClubMemberRank;
  /** 'full' shows icon + label; 'icon' shows icon only (for compact use) */
  variant?: 'full' | 'icon';
}

const RankBadge: React.FC<RankBadgeProps> = ({ rank, variant = 'full' }) => {
  const meta = CLUB_MEMBER_RANK_META[rank];
  if (variant === 'icon') {
    return (
      <span title={`${meta.icon} ${meta.label}`} className="text-sm leading-none select-none">
        {meta.icon}
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${meta.color}`}>
      {meta.icon} {meta.label}
    </span>
  );
};

export default RankBadge;
