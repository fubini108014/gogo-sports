import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Club } from '../types';
import { apiGetClub } from '../services/api';

export const useClubProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    clubs, activities, user,
    handleActivityClick, handleJoinClub, handleLeaveClub, addToast,
  } = useAppContext();

  const [fetchedClub, setFetchedClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(false);

  const clubFromContext = clubs.find(c => c.id === id);
  const club = clubFromContext ?? fetchedClub;

  useEffect(() => {
    if (!clubFromContext && id) {
      setLoading(true);
      apiGetClub(id)
        .then(c => setFetchedClub(c))
        .catch(() => setFetchedClub(null))
        .finally(() => setLoading(false));
    }
  }, [id, clubFromContext]);

  const handleBack = () => navigate(-1);

  return {
    club,
    activities,
    user,
    loading,
    handleActivityClick,
    handleJoinClub,
    handleLeaveClub,
    addToast,
    handleBack,
    setFetchedClub,
    navigate,
  };
};
