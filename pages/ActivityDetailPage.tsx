import React from 'react';
import ActivityDetail from '../components/activity/ActivityDetail';
import ActivityMap from '../components/activity/ActivityMap';
import { useActivityDetail } from '../hooks/useActivityDetail';

const ActivityDetailPage: React.FC = () => {
  const {
    activity,
    club,
    isRegistered,
    loading,
    handleRegisterClick,
    handleBack,
    handleClubClick,
    navigate,
  } = useActivityDetail();

  if (loading) {
    return (
      <div className="animate-pulse max-w-4xl mx-auto">
        {/* Hero image */}
        <div className="h-56 sm:h-72 bg-gray-200 dark:bg-gray-700 w-full" />
        <div className="px-4 py-5 space-y-4">
          {/* Title */}
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4" />
          {/* Tags row */}
          <div className="flex gap-2">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-14" />
          </div>
          {/* Info rows */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-xl flex-shrink-0" />
              <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
          {/* Host card */}
          <div className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl mt-2">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          </div>
          {/* Description */}
          <div className="space-y-2 pt-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <p className="text-gray-500 dark:text-gray-400 text-lg font-bold mb-2">找不到此活動</p>
        <button
          onClick={() => navigate('/activities')}
          className="text-primary font-bold hover:underline text-sm"
        >
          返回活動列表
        </button>
      </div>
    );
  }

  return (
    <div>
      <ActivityDetail
        activity={activity}
        club={club}
        isRegistered={isRegistered}
        onBack={handleBack}
        onRegisterClick={handleRegisterClick}
        onClubClick={handleClubClick}
      />
      {/* Map section rendered below ActivityDetail */}
      {activity.lat != null && activity.lng != null && (
        <div className="max-w-4xl mx-auto px-4 pb-36">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3">活動地點</h3>
            <ActivityMap
              activities={[activity]}
              className="h-48 w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityDetailPage;
