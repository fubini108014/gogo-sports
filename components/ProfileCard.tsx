import React, { useState } from 'react';
import { User } from '../types';
import { Pencil, Check, X } from 'lucide-react';

interface ProfileCardProps {
  user: User;
  onSave: (data: { name: string }) => Promise<void>;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!editName.trim() || editName.trim() === user.name) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      await onSave({ name: editName.trim() });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="px-4 py-6 bg-white dark:bg-gray-800 mb-2">
      <div className="flex items-center gap-4">
        <img
          src={user.avatar}
          className="w-20 h-20 rounded-full object-cover border-4 border-gray-50 dark:border-gray-700"
          alt={user.name}
        />
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') setIsEditing(false);
                }}
                className="flex-1 text-lg font-bold border-b-2 border-primary bg-transparent text-gray-900 dark:text-white outline-none min-w-0"
                maxLength={50}
              />
              <button onClick={handleSave} disabled={isSaving} className="p-1 text-green-500 hover:text-green-600 disabled:opacity-50">
                <Check size={18} />
              </button>
              <button onClick={() => { setIsEditing(false); setEditName(user.name); }} className="p-1 text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">{user.name}</h2>
              <button
                onClick={() => { setEditName(user.name); setIsEditing(true); }}
                className="p-1 text-gray-400 hover:text-primary transition-colors flex-shrink-0"
              >
                <Pencil size={14} />
              </button>
            </div>
          )}
          <div className="flex gap-2 mt-2">
            <span className="text-xs bg-orange-50 text-primary px-2 py-1 rounded-lg font-bold">一般會員</span>
            {user.isClubAdmin && (
              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-lg font-bold">
                社團管理員
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
