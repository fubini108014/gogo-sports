import React from 'react';
import { Lock } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

interface LockedPageProps {
  title?: string;
  description?: string;
}

const LockedPage: React.FC<LockedPageProps> = ({
  title = '需要登入',
  description = '請登入後繼續',
}) => {
  const { setIsAuthModalOpen } = useAppContext();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6 select-none">
      {/* Lock illustration */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-950/20 flex items-center justify-center shadow-inner">
          <Lock size={40} className="text-primary" strokeWidth={1.5} />
        </div>
        {/* Decorative rings */}
        <div className="absolute inset-0 rounded-3xl border-2 border-orange-200 dark:border-orange-900/40 scale-110 opacity-40" />
        <div className="absolute inset-0 rounded-3xl border border-orange-100 dark:border-orange-900/20 scale-125 opacity-20" />
      </div>

      <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
        {title}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-xs leading-relaxed">
        {description}
      </p>

      <button
        onClick={() => setIsAuthModalOpen(true)}
        className="px-10 py-3 bg-primary text-white font-black rounded-full hover:bg-orange-600 active:scale-95 transition-all shadow-lg shadow-orange-200 dark:shadow-none"
      >
        立即登入
      </button>

      <p className="mt-4 text-xs text-gray-400 dark:text-gray-600">
        還沒有帳號？登入頁面可免費註冊
      </p>
    </div>
  );
};

export default LockedPage;
