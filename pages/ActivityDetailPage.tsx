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
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
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
