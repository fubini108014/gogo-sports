import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ActivityDetail from '../components/ActivityDetail';
import ActivityMap from '../components/ActivityMap';
import { Activity } from '../types';
import { apiGetActivity } from '../services/api';

const ActivityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activities, clubs, myActivityIds, setSelectedActivity, setIsRegistrationOpen } = useAppContext();

  const [fetchedActivity, setFetchedActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(false);

  const activityFromContext = activities.find(a => a.id === id);

  useEffect(() => {
    if (!activityFromContext && id) {
      setLoading(true);
      apiGetActivity(id)
        .then(a => setFetchedActivity(a))
        .catch(() => setFetchedActivity(null))
        .finally(() => setLoading(false));
    }
  }, [id, activityFromContext]);

  const activity = activityFromContext ?? fetchedActivity;
  const club = activity ? clubs.find(c => c.id === activity.clubId) : undefined;
  const isRegistered = activity ? myActivityIds.includes(activity.id) : false;

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

  const handleRegisterClick = () => {
    setSelectedActivity(activity);
    setIsRegistrationOpen(true);
  };

  return (
    <div>
      <ActivityDetail
        activity={activity}
        club={club}
        isRegistered={isRegistered}
        onBack={() => navigate(-1)}
        onRegisterClick={handleRegisterClick}
        onClubClick={(clubId) => navigate(`/clubs/${clubId}`)}
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
