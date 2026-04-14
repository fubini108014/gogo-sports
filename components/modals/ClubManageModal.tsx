import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Users, Settings, Trash2, Tag, Link, Copy, Check, Plus } from 'lucide-react';
import { Club, ClubMember } from '../../types';
import { apiUpdateClub, apiGetClubMembers, apiRemoveClubMember, apiCreateInviteLink, apiGetInviteLinks, ClubInviteLink } from '../../services/api';
import RankBadge from '../ui/RankBadge';

interface ClubManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  club: Club;
  onClubUpdated: (updated: Club) => void;
  onToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ClubManageModal: React.FC<ClubManageModalProps> = ({ isOpen, onClose, club, onClubUpdated, onToast }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'members' | 'invite'>('info');

  // Info form state
  const [name, setName] = useState(club.name);
  const [description, setDescription] = useState(club.description);
  const [tagsInput, setTagsInput] = useState(club.tags.join(', '));
  const [isSaving, setIsSaving] = useState(false);

  // Members state
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Invite links state
  const [inviteLinks, setInviteLinks] = useState<ClubInviteLink[]>([]);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(club.name);
      setDescription(club.description);
      setTagsInput(club.tags.join(', '));
    }
  }, [isOpen, club]);

  useEffect(() => {
    if (isOpen && activeTab === 'members') {
      setMembersLoading(true);
      apiGetClubMembers(club.id)
        .then(setMembers)
        .catch(() => onToast('無法載入成員列表', 'error'))
        .finally(() => setMembersLoading(false));
    }
  }, [isOpen, activeTab, club.id]);

  useEffect(() => {
    if (isOpen && activeTab === 'invite') {
      setInviteLoading(true);
      apiGetInviteLinks(club.id)
        .then(setInviteLinks)
        .catch(() => onToast('無法載入邀請連結', 'error'))
        .finally(() => setInviteLoading(false));
    }
  }, [isOpen, activeTab, club.id]);

  const handleSaveInfo = async () => {
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    setIsSaving(true);
    try {
      const updated = await apiUpdateClub(club.id, { name, description, tags });
      onClubUpdated(updated);
      onToast('社團資訊已更新', 'success');
    } catch (err: any) {
      onToast(err.message || '更新失敗', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateInviteLink = async () => {
    setIsCreatingLink(true);
    try {
      const link = await apiCreateInviteLink(club.id);
      setInviteLinks(prev => [link, ...prev]);
      onToast('邀請連結已建立', 'success');
    } catch (err: any) {
      onToast(err.message || '建立失敗', 'error');
    } finally {
      setIsCreatingLink(false);
    }
  };

  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}/join/${token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    });
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`確定要移除成員「${memberName}」？`)) return;
    setRemovingId(memberId);
    try {
      await apiRemoveClubMember(club.id, memberId);
      setMembers(prev => prev.filter(m => m.id !== memberId));
      onToast(`已移除成員「${memberName}」`, 'info');
    } catch (err: any) {
      onToast(err.message || '移除失敗', 'error');
    } finally {
      setRemovingId(null);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">管理社團</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-colors border-b-2 ${
              activeTab === 'info'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <Settings size={16} /> 基本資訊
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-colors border-b-2 ${
              activeTab === 'members'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <Users size={16} /> 成員管理
          </button>
          <button
            onClick={() => setActiveTab('invite')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-colors border-b-2 ${
              activeTab === 'invite'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <Link size={16} /> 邀請連結
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">社團名稱</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">社團簡介</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  <span className="flex items-center gap-1"><Tag size={14} /> 標籤（用逗號分隔）</span>
                </label>
                <input
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                  placeholder="例：羽球, 週末, 新手友善"
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tagsInput.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-md font-medium">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'invite' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">產生邀請連結，分享給想加入的成員（有效期 7 天）</p>
                <button
                  onClick={handleCreateInviteLink}
                  disabled={isCreatingLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex-shrink-0 ml-3"
                >
                  <Plus size={14} /> {isCreatingLink ? '建立中...' : '新增連結'}
                </button>
              </div>

              {inviteLoading ? (
                <div className="space-y-3">
                  {[1, 2].map(i => (
                    <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : inviteLinks.length === 0 ? (
                <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">尚無邀請連結</p>
              ) : (
                <div className="space-y-2">
                  {inviteLinks.map(link => {
                    const url = `${window.location.origin}/join/${link.token}`;
                    const expiresDate = new Date(link.expiresAt).toLocaleDateString('zh-TW');
                    return (
                      <div key={link.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-mono text-gray-700 dark:text-gray-300 truncate">{url}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">到期：{expiresDate}</p>
                        </div>
                        <button
                          onClick={() => handleCopyLink(link.token)}
                          className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary hover:bg-primary/10 transition-colors flex-shrink-0"
                          title="複製連結"
                        >
                          {copiedToken === link.token ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'members' && (
            <div>
              {membersLoading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                      <div className="flex-1 space-y-1">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : members.length === 0 ? (
                <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">尚無成員</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">共 {members.length} 位成員</p>
                  {members.map(member => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover bg-gray-200 dark:bg-gray-600"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{member.name}</p>
                          <RankBadge rank={member.rank} />
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{member.email}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveMember(member.id, member.name)}
                        disabled={removingId === member.id}
                        className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                        title="移除成員"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'info' && (
          <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex gap-3 flex-shrink-0">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSaveInfo}
              disabled={isSaving || !name.trim() || !description.trim()}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {isSaving ? '儲存中...' : '儲存變更'}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ClubManageModal;
