import React from 'react';

const Pulse: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
);

export const ActivityCardSkeleton: React.FC<{ variant?: 'default' | 'compact' }> = ({ variant = 'default' }) => {
  const isCompact = variant === 'compact';
  return (
    <div className={`bg-white dark:bg-gray-800 overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm h-full flex flex-col ${isCompact ? 'rounded-xl' : 'rounded-2xl'}`}>
      {/* Image placeholder */}
      <Pulse className={`${isCompact ? 'h-32' : 'h-48'} w-full rounded-none`} />
      <div className={`${isCompact ? 'p-3' : 'p-4'} flex flex-col flex-1 gap-3`}>
        {/* Title */}
        <Pulse className={`${isCompact ? 'h-4' : 'h-5'} w-4/5 rounded-lg`} />
        <Pulse className={`${isCompact ? 'h-3' : 'h-4'} w-2/3 rounded-lg`} />
        {/* Meta */}
        <div className={`flex-1 ${isCompact ? 'space-y-1' : 'space-y-2'}`}>
          <Pulse className={`${isCompact ? 'h-2' : 'h-3'} w-1/2 rounded`} />
          <Pulse className={`${isCompact ? 'h-2' : 'h-3'} w-2/3 rounded`} />
        </div>
        {/* Progress bar */}
        <div className="mt-auto">
          <div className="flex justify-between mb-1">
            <Pulse className={`${isCompact ? 'h-2' : 'h-3'} w-16 rounded`} />
            <Pulse className={`${isCompact ? 'h-2' : 'h-3'} w-12 rounded`} />
          </div>
          <Pulse className={`${isCompact ? 'h-1.5' : 'h-2'} w-full rounded-full`} />
        </div>
      </div>
    </div>
  );
};

export const ClubCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex gap-4 items-start">
    {/* Logo */}
    <Pulse className="w-20 h-20 rounded-xl flex-shrink-0" />
    <div className="flex-1 space-y-2">
      {/* Name + rating row */}
      <div className="flex justify-between items-start">
        <Pulse className="h-4 w-2/3 rounded" />
        <Pulse className="h-4 w-10 rounded" />
      </div>
      {/* Description */}
      <Pulse className="h-3 w-full rounded" />
      <Pulse className="h-3 w-4/5 rounded" />
      {/* Members + tags */}
      <div className="flex justify-between items-center pt-2">
        <Pulse className="h-3 w-16 rounded" />
        <div className="flex gap-1">
          <Pulse className="h-4 w-12 rounded" />
          <Pulse className="h-4 w-12 rounded" />
        </div>
      </div>
    </div>
  </div>
);
