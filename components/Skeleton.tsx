import React from 'react';

const Pulse: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
);

export const ActivityCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm h-full flex flex-col">
    {/* Image placeholder */}
    <Pulse className="h-48 w-full rounded-none" />
    <div className="p-4 flex flex-col flex-1 gap-3">
      {/* Title */}
      <Pulse className="h-5 w-4/5 rounded-lg" />
      <Pulse className="h-4 w-2/3 rounded-lg" />
      {/* Meta */}
      <div className="space-y-2 flex-1">
        <Pulse className="h-3 w-1/2 rounded" />
        <Pulse className="h-3 w-2/3 rounded" />
      </div>
      {/* Progress bar */}
      <div className="mt-auto">
        <div className="flex justify-between mb-1">
          <Pulse className="h-3 w-16 rounded" />
          <Pulse className="h-3 w-12 rounded" />
        </div>
        <Pulse className="h-2 w-full rounded-full" />
      </div>
    </div>
  </div>
);

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
