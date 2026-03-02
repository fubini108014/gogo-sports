import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ClubProfile from '../components/ClubProfile';

const ClubProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    clubs, activities, user,
    handleActivityClick, handleJoinClub, handleLeaveClub, addToast,
  } = useAppContext();

  const club = clubs.find(c => c.id === id);

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
    />
  );
};

export default ClubProfilePage;
