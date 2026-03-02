import React from 'react';
import { Notification, NotificationType } from '../types';
import { Bell, ChevronLeft, CheckCheck, Info, MessageCircle, Calendar, UserPlus } from 'lucide-react';

interface NotificationListProps {
  notifications: Notification[];
  onBack: () => void;
  onMarkAllRead: () => void;
  onNotificationClick: (id: string) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onBack,
  onMarkAllRead,
  onNotificationClick
}) => {

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SYSTEM:
        return <Info size={20} className="text-gray-500 dark:text-gray-400" />;
      case NotificationType.ACTIVITY:
        return <Calendar size={20} className="text-primary" />;
      case NotificationType.INTERACTION:
        return <MessageCircle size={20} className="text-blue-500" />;
      case NotificationType.INVITE:
        return <UserPlus size={20} className="text-green-500" />;
      default:
        return <Bell size={20} className="text-gray-500 dark:text-gray-400" />;
    }
  };

  const getBgColor = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SYSTEM: return 'bg-gray-100 dark:bg-gray-700';
      case NotificationType.ACTIVITY: return 'bg-orange-50 dark:bg-orange-900/30';
      case NotificationType.INTERACTION: return 'bg-blue-50 dark:bg-blue-900/30';
      case NotificationType.INVITE: return 'bg-green-50 dark:bg-green-900/30';
      default: return 'bg-gray-50 dark:bg-gray-900';
    }
  };

  return (
    <div className="animate-fade-in pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-4 sticky top-0 z-30 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center shadow-sm">
         <div className="flex items-center gap-2">
           <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
              <ChevronLeft size={24} className="text-gray-900 dark:text-white"/>
           </button>
           <h1 className="font-bold text-xl text-gray-900 dark:text-white">通知中心</h1>
         </div>
         <button
           onClick={onMarkAllRead}
           className="text-xs font-bold text-primary flex items-center gap-1 hover:bg-orange-50 dark:hover:bg-orange-900/30 px-2 py-1 rounded-lg transition-colors"
         >
            <CheckCheck size={14} /> 全部已讀
         </button>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-gray-800 min-h-[calc(100vh-70px)]">
        {notifications.length > 0 ? (
          notifications.map(item => (
            <div
              key={item.id}
              onClick={() => onNotificationClick(item.id)}
              className={`p-4 border-b border-gray-50 dark:border-gray-700 flex gap-4 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${!item.isRead ? 'bg-orange-50/30 dark:bg-orange-900/10' : 'bg-white dark:bg-gray-800'}`}
            >
               <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getBgColor(item.type)}`}>
                  {getIcon(item.type)}
               </div>
               <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                     <h4 className={`text-sm ${!item.isRead ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-200'}`}>
                       {item.title}
                     </h4>
                     <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap ml-2">{item.time}</span>
                  </div>
                  <p className={`text-sm leading-relaxed line-clamp-2 ${!item.isRead ? 'text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                    {item.content}
                  </p>
               </div>
               {!item.isRead && (
                 <div className="flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-primary rounded-full shadow-sm"></div>
                 </div>
               )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
             <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mb-4">
                <Bell size={32} className="text-gray-300 dark:text-gray-600" />
             </div>
             <p className="font-medium">目前沒有新通知</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationList;
