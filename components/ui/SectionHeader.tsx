import React from 'react';
import { ChevronRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionLabel,
  onAction,
  icon,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-2">
        {icon && <div className="text-primary">{icon}</div>}
        <div>
          <h2 className="text-lg font-black text-gray-900 dark:text-white leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-1 text-primary hover:underline text-xs font-bold"
        >
          {actionLabel}
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
};

export default SectionHeader;
