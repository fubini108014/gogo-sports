import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { apiJoinByToken } from '../services/api';

const JoinByTokenPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isLoggedIn, setIsAuthModalOpen, addToast } = useAppContext();

  const [status, setStatus] = useState<'joining' | 'error'>('joining');
  const [errorMsg, setErrorMsg] = useState('');
  const hasJoined = useRef(false);

  const doJoin = async (t: string) => {
    if (hasJoined.current) return;
    hasJoined.current = true;
    try {
      const res = await apiJoinByToken(t);
      addToast(`已加入「${res.club.name}」！`, 'success');
      navigate(`/clubs/${res.club.id}`, { replace: true });
    } catch (err: any) {
      if (err.message?.includes('已加入')) {
        addToast('您已是此社團成員', 'info');
        // Try to navigate to club — we don't have the id here, fall back to clubs list
        navigate('/clubs', { replace: true });
      } else {
        setStatus('error');
        setErrorMsg(err.message || '加入失敗，請稍後再試');
      }
    }
  };

  // Attempt to join once logged in
  useEffect(() => {
    if (!token) return;
    if (isLoggedIn) {
      doJoin(token);
    } else {
      // Not logged in — open auth modal; joining will be triggered after login
      setIsAuthModalOpen(true);
    }
  }, [isLoggedIn, token]);

  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 bg-[#f8fafc] dark:bg-gray-900">
        <p className="text-red-500 font-bold text-lg">{errorMsg}</p>
        <button
          onClick={() => navigate('/clubs')}
          className="px-5 py-2 rounded-xl bg-primary text-white font-bold text-sm hover:bg-orange-600 transition-colors"
        >
          前往社團列表
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-6 bg-[#f8fafc] dark:bg-gray-900">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-600 dark:text-gray-400 text-sm">
        {isLoggedIn ? '正在加入社團...' : '請先登入以繼續加入社團'}
      </p>
    </div>
  );
};

export default JoinByTokenPage;
