import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ActivityDetail from '../components/ActivityDetail';
import ActivityMap from '../components/ActivityMap';

const ActivityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activities, clubs, myActivityIds, setSelectedActivity, setIsRegistrationOpen } = useAppContext();

  const activity = activities.find(a => a.id === id);
  const club = activity ? clubs.find(c => c.id === activity.clubId) : undefined;
  const isRegistered = activity ? myActivityIds.includes(activity.id) : false;

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
