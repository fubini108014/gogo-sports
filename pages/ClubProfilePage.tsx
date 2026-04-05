import React from 'react';
import ClubProfile from '../components/club/ClubProfile';
import { useClubProfile } from '../hooks/useClubProfile';

const ClubProfilePage: React.FC = () => {
  const {
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
  } = useClubProfile();

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
      onBack={handleBack}
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
