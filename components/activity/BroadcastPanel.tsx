import React, { useState } from 'react';
import { Megaphone } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { apiBroadcastActivity } from '../../services/api';
import SectionHeader from '../ui/SectionHeader';

interface BroadcastPanelProps {
  activityId: string;
}

const BroadcastPanel: React.FC<BroadcastPanelProps> = ({ activityId }) => {
  const { addToast } = useAppContext();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      const { sent } = await apiBroadcastActivity(activityId, message.trim());
      addToast(sent > 0 ? `已發送通知給 ${sent} 位參與者` : '目前沒有可通知的參與者', sent > 0 ? 'success' : 'info');
      setMessage('');
    } catch {
      addToast('發送失敗，請稍後再試', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-6 px-4">
      <SectionHeader
        icon={<Megaphone size={18} />}
        title="廣播通知"
        subtitle="單向發送給所有已報名（錄取／待審）的參與者"
        className="mb-3"
      />
      <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-4 space-y-3">
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          maxLength={200}
          rows={3}
          placeholder="例如：因天雨取消，改期另行通知..."
          className="w-full px-3 py-2 rounded-xl border border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">{message.length}/200</span>
          <button
            onClick={handleSend}
            disabled={!message.trim() || sending}
            className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {sending ? '發送中...' : '發送通知'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BroadcastPanel;
