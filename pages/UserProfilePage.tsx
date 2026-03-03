import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import UserProfile from '../components/UserProfile';

const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    user, activities, clubs, myActivityIds,
    handleActivityClick, handleClubClick,
    handleCancelRegistration,
    setIsSettingsOpen,
  } = useAppContext();

  return (
    <UserProfile
      user={user}
      activities={activities}
      clubs={clubs}
      myActivityIds={myActivityIds}
      onBack={() => navigate(-1)}
      onActivityClick={handleActivityClick}
      onClubClick={handleClubClick}
      onCancelRegistration={handleCancelRegistration}
      onOpenSettings={() => setIsSettingsOpen(true)}
    />
  );
};

export default UserProfilePage;
