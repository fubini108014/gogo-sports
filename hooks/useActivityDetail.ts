import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Activity, Club } from '../types';
import { apiGetActivity } from '../services/api';

export const useActivityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    activities, 
    clubs, 
    myActivityIds, 
    setSelectedActivity, 
    setIsRegistrationOpen 
  } = useAppContext();

  const [fetchedActivity, setFetchedActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(false);

  const activityFromContext = activities.find(a => a.id === id);
  const activity = activityFromContext ?? fetchedActivity;
  const club = activity ? clubs.find(c => c.id === activity.clubId) : undefined;
  const isRegistered = activity ? myActivityIds.includes(activity.id) : false;

  useEffect(() => {
    if (!activityFromContext && id) {
      setLoading(true);
      apiGetActivity(id)
        .then(a => setFetchedActivity(a))
        .catch(() => setFetchedActivity(null))
        .finally(() => setLoading(false));
    }
  }, [id, activityFromContext]);

  const handleRegisterClick = () => {
    if (activity) {
      setSelectedActivity(activity);
      setIsRegistrationOpen(true);
    }
  };

  const handleBack = () => navigate(-1);
  const handleClubClick = (clubId: string) => navigate(`/clubs/${clubId}`);

  return {
    activity,
    club,
    isRegistered,
    loading,
    handleRegisterClick,
    handleBack,
    handleClubClick,
    navigate,
  };
};
