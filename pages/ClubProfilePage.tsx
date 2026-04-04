import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ClubProfile from '../components/club/ClubProfile';
import { Club } from '../types';
import { apiGetClub } from '../services/api';

const ClubProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    clubs, activities, user,
    handleActivityClick, handleJoinClub, handleLeaveClub, addToast,
  } = useAppContext();

  const [fetchedClub, setFetchedClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(false);

  const clubFromContext = clubs.find(c => c.id === id);

  useEffect(() => {
    if (!clubFromContext && id) {
      setLoading(true);
      apiGetClub(id)
        .then(c => setFetchedClub(c))
        .catch(() => setFetchedClub(null))
        .finally(() => setLoading(false));
    }
  }, [id, clubFromContext]);

  const club = clubFromContext ?? fetchedClub;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!club) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <p className="text-gray-500 dark:text-gray-400 text-lg font-bold mb-2">找不到此社團</p>
        <button
          onClick={() => navigate('/clubs')}
          className="text-primary font-bold hover:underline text-sm"
        >
          返回社團列表
        </button>
      </div>
    );
  }

  return (
    <ClubProfile
      club={club}
      activities={activities}
      onBack={() => navigate(-1)}
      onActivityClick={handleActivityClick}
      joinedClubIds={user.joinedClubIds}
      managedClubIds={user.managedClubIds}
      onJoinClub={handleJoinClub}
      onLeaveClub={handleLeaveClub}
      onToast={addToast}
      onClubUpdated={updated => setFetchedClub(updated)}
    />
  );
};

export default ClubProfilePage;
