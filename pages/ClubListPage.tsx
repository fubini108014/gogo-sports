import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ClubList from '../components/ClubList';

const ClubListPage: React.FC = () => {
  const navigate = useNavigate();
  const { clubs, handleClubClick } = useAppContext();

  return (
    <ClubList
      clubs={clubs}
      onClubClick={handleClubClick}
      onBack={() => navigate(-1)}
    />
  );
};

export default ClubListPage;
