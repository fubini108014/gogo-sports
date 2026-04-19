import React, { useEffect, useState, useCallback } from 'react';
import { Users, Check, X, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import {
  apiGetActivityParticipants,
  apiReviewRegistration,
  ParticipantRegistration,
} from '../../services/api';
import SectionHeader from '../ui/SectionHeader';

interface ParticipantsPanelProps {
  activityId: string;
  approvalMode: 'AUTO' | 'MANUAL';
}

const AVATAR_FALLBACK = 'https://api.dicebear.com/7.x/thumbs/svg?seed=';

const statusLabel: Record<ParticipantRegistration['status'], string> = {
  APPROVED: '已錄取',
  PENDING: '待審核',
  WAITLISTED: '候補中',
  REJECTED: '已拒絕',
  CANCELLED: '已取消',
  ABSENT: '缺席',
};

const statusColor: Record<ParticipantRegistration['status'], string> = {
  APPROVED: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
  PENDING: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
  WAITLISTED: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
  REJECTED: 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
  CANCELLED: 'text-gray-400 bg-gray-50 dark:bg-gray-800',
  ABSENT: 'text-gray-400 bg-gray-50 dark:bg-gray-800',
};

const ParticipantsPanel: React.FC<ParticipantsPanelProps> = ({ activityId, approvalMode }) => {
  const { addToast } = useAppContext();
  const [regs, setRegs] = useState<ParticipantRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  const fetchParticipants = useCallback(async () => {
    try {
      const data = await apiGetActivityParticipants(activityId);
      setRegs(data);
    } catch {
      addToast('無法載入報名者名單', 'error');
    } finally {
      setLoading(false);
    }
  }, [activityId]);

  useEffect(() => { fetchParticipants(); }, [fetchParticipants]);

  const handleReview = async (regId: string, status: 'APPROVED' | 'REJECTED' | 'WAITLISTED') => {
    setActionLoading(regId + status);
    try {
      await apiReviewRegistration(activityId, regId, status);
      const messages = { APPROVED: '已錄取', REJECTED: '已拒絕', WAITLISTED: '已移入候補' };
      addToast(messages[status], 'success');
      await fetchParticipants();
    } catch {
      addToast('操作失敗，請稍後再試', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  type GroupKey = ParticipantRegistration['status'];
  const groups: { key: GroupKey; label: string; items: ParticipantRegistration[] }[] = (
    [
      { key: 'APPROVED'   as GroupKey, label: '已錄取', items: regs.filter(r => r.status === 'APPROVED') },
      { key: 'PENDING'    as GroupKey, label: '待審核', items: regs.filter(r => r.status === 'PENDING') },
      { key: 'WAITLISTED' as GroupKey, label: '候補中', items: regs.filter(r => r.status === 'WAITLISTED') },
      { key: 'REJECTED'   as GroupKey, label: '已拒絕', items: regs.filter(r => r.status === 'REJECTED') },
    ] as { key: GroupKey; label: string; items: ParticipantRegistration[] }[]
  ).filter(g => g.items.length > 0);

  const total = regs.filter(r => !['CANCELLED', 'ABSENT'].includes(r.status)).length;
  const pendingCount = regs.filter(r => r.status === 'PENDING').length;

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
              <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center justify-between px-4 pt-4 pb-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <SectionHeader
            title="報名者名單"
            icon={<Users size={16} />}
            className="pointer-events-none"
          />
          <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">
            共 {total} 人
          </span>
          {pendingCount > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full">
              {pendingCount} 待審
            </span>
          )}
        </div>
        {collapsed
          ? <ChevronDown size={16} className="text-gray-400" />
          : <ChevronUp size={16} className="text-gray-400" />
        }
      </button>

      {!collapsed && (
        <div className="px-4 pb-4 space-y-5">
          {total === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
              目前尚無報名者
            </p>
          ) : (
            groups.map(({ key, label, items }) => (
              <div key={key}>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  {label}（{items.length}）
                </p>
                <div className="space-y-2">
                  {items.map(reg => (
                    <div
                      key={reg.id}
                      className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0"
                    >
                      {/* Avatar */}
                      <img
                        src={reg.user.avatar ?? `${AVATAR_FALLBACK}${reg.userId}`}
                        alt={reg.user.name}
                        className="w-9 h-9 rounded-full object-cover flex-shrink-0 bg-gray-100 dark:bg-gray-700"
                        loading="lazy"
                      />

                      {/* Name + meta */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {reg.user.name}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {reg.group && (
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">
                              {reg.group}
                            </span>
                          )}
                          <span className="text-[10px] text-gray-400 dark:text-gray-500">
                            {new Date(reg.createdAt).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      {/* Status badge or action buttons */}
                      {key === 'PENDING' && approvalMode === 'MANUAL' ? (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {/* Approve */}
                          <button
                            onClick={() => handleReview(reg.id, 'APPROVED')}
                            disabled={!!actionLoading}
                            title="錄取"
                            className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800/50 flex items-center justify-center transition-colors disabled:opacity-50"
                          >
                            {actionLoading === reg.id + 'APPROVED'
                              ? <div className="w-3.5 h-3.5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                              : <Check size={14} strokeWidth={2.5} />
                            }
                          </button>
                          {/* Waitlist */}
                          <button
                            onClick={() => handleReview(reg.id, 'WAITLISTED')}
                            disabled={!!actionLoading}
                            title="移至候補"
                            className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/50 flex items-center justify-center transition-colors disabled:opacity-50"
                          >
                            {actionLoading === reg.id + 'WAITLISTED'
                              ? <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                              : <Clock size={13} strokeWidth={2.5} />
                            }
                          </button>
                          {/* Reject */}
                          <button
                            onClick={() => handleReview(reg.id, 'REJECTED')}
                            disabled={!!actionLoading}
                            title="拒絕"
                            className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/50 flex items-center justify-center transition-colors disabled:opacity-50"
                          >
                            {actionLoading === reg.id + 'REJECTED'
                              ? <div className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                              : <X size={14} strokeWidth={2.5} />
                            }
                          </button>
                        </div>
                      ) : (
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${statusColor[key]}`}>
                          {statusLabel[key]}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ParticipantsPanel;
