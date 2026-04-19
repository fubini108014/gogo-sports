import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { apiRateActivity } from '../../services/api';
import SectionHeader from '../ui/SectionHeader';

interface RatingPanelProps {
  activityId: string;
  initialRating: number | null;
}

const LABELS = ['', '很差', '普通', '還不錯', '很好', '超棒！'];

const RatingPanel: React.FC<RatingPanelProps> = ({ activityId, initialRating }) => {
  const { addToast } = useAppContext();
  const [submitted, setSubmitted] = useState<number | null>(initialRating);
  const [hovered, setHovered] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleRate = async (score: number) => {
    if (loading) return;
    setLoading(true);
    try {
      await apiRateActivity(activityId, score);
      setSubmitted(score);
      addToast('感謝你的評分！', 'success');
    } catch {
      addToast('評分失敗，請稍後再試', 'error');
    } finally {
      setLoading(false);
    }
  };

  const display = hovered || submitted || 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
      <SectionHeader
        title="活動評分"
        icon={<Star size={16} fill="currentColor" className="text-yellow-400" />}
        className="mb-4"
      />

      {submitted ? (
        /* Already rated — show result */
        <div className="flex flex-col items-center py-2 gap-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(n => (
              <Star
                key={n}
                size={28}
                className={n <= submitted ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-600'}
                fill="currentColor"
              />
            ))}
          </div>
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
            你給了 {submitted} 星 — {LABELS[submitted]}
          </p>
          <button
            onClick={() => setSubmitted(null)}
            className="text-xs text-primary hover:underline mt-1"
          >
            修改評分
          </button>
        </div>
      ) : (
        /* Rating input */
        <div className="flex flex-col items-center gap-3 py-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">你覺得這次活動如何？</p>
          <div
            className="flex gap-1"
            onMouseLeave={() => setHovered(0)}
          >
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onMouseEnter={() => setHovered(n)}
                onClick={() => handleRate(n)}
                disabled={loading}
                className="p-1 transition-transform hover:scale-110 active:scale-95 disabled:opacity-50"
                title={LABELS[n]}
              >
                <Star
                  size={32}
                  className={n <= display
                    ? 'text-yellow-400'
                    : 'text-gray-200 dark:text-gray-600'}
                  fill="currentColor"
                />
              </button>
            ))}
          </div>
          {display > 0 && (
            <p className="text-sm font-bold text-yellow-500 h-5 transition-all">
              {LABELS[display]}
            </p>
          )}
          {loading && (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      )}
    </div>
  );
};

export default RatingPanel;
