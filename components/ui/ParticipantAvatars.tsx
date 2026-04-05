import React from 'react';

interface ParticipantAvatarsProps {
  activityId: string;
  count: number;
  size?: 'sm' | 'md' | 'lg';
  maxDisplay?: number;
  className?: string;
}

const ParticipantAvatars: React.FC<ParticipantAvatarsProps> = ({
  activityId,
  count,
  size = 'md',
  maxDisplay = 4,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5 -space-x-1.5 border-2',
    md: 'w-6 h-6 -space-x-2 border-2',
    lg: 'w-7 h-7 -space-x-2 border-2',
  };

  const imgSize = size === 'sm' ? 'w-5 h-5' : size === 'md' ? 'w-6 h-6' : 'w-7 h-7';
  const spacing = size === 'sm' ? '-space-x-1.5' : '-space-x-2';

  const displayCount = Math.min(count, maxDisplay);
  const avatars = Array.from({ length: displayCount }, (_, i) => i + 1);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`flex ${spacing}`}>
        {avatars.map((i) => (
          <div
            key={i}
            className={`${imgSize} rounded-full border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 overflow-hidden border-2 flex-shrink-0`}
          >
            <img
              src={`https://picsum.photos/seed/${activityId + i}/50/50`}
              className="w-full h-full object-cover"
              alt=""
              loading="lazy"
            />
          </div>
        ))}
      </div>
      {count > 0 && (
        <span className={`${size === 'sm' ? 'text-[9px]' : 'text-xs'} text-gray-600 dark:text-gray-300 font-medium`}>
          <span className="text-primary font-black">{count}</span> 人已參加
        </span>
      )}
    </div>
  );
};

export default ParticipantAvatars;
