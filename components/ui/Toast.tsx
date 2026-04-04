import React from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastProps {
  toasts: ToastItem[];
}

const Toast: React.FC<ToastProps> = ({ toasts }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-24 left-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map(toast => {
        const styles = {
          success: 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900',
          error:   'bg-red-600 text-white',
          info:    'bg-blue-600 text-white',
        }[toast.type];

        const Icon = {
          success: CheckCircle,
          error:   XCircle,
          info:    Info,
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={`animate-toast-in flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl text-sm font-bold max-w-xs text-center ${styles}`}
          >
            <Icon size={16} className="flex-shrink-0" />
            <span>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;
