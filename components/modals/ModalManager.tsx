import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { DEFAULT_FILTER_STATE } from '../../types';
import { SPORTS_HIERARCHY } from '../../constants';
import CreateMenuModal from './CreateMenuModal';
import CreatePostModal from './CreatePostModal';
import CreateActivityModal from './CreateActivityModal';
import CreateClubModal from './CreateClubModal';
import RegistrationModal from './RegistrationModal';
import SettingsModal from './SettingsModal';
import ActivityFilterDrawer from '../activity/ActivityFilterDrawer';
import SportCategoryModal from './SportCategoryModal';
import AuthModal from './AuthModal';
import DateSelectModal from './DateSelectModal';
import ExploreTagManagerModal from './ExploreTagManagerModal';
import LocationMapModal from './LocationMapModal';
import Toast from '../ui/Toast';

const ModalManager: React.FC = () => {
  const navigate = useNavigate();
  const {
    activities, user, clubs, toasts,
    isAuthModalOpen, setIsAuthModalOpen,
    handleLogin, handleRegister,
    selectedActivity, isRegistrationOpen, setIsRegistrationOpen,
    isCreateMenuOpen, setIsCreateMenuOpen,
    isPostModalOpen, setIsPostModalOpen,
    isCreateActivityOpen, setIsCreateActivityOpen,
    isCreateClubOpen, setIsCreateClubOpen,
    isSettingsOpen, setIsSettingsOpen,
    isFilterOpen, setIsFilterOpen,
    advancedFilters, setAdvancedFilters,
    isMapOpen, setIsMapOpen,
    isCategoryOpen, setIsCategoryOpen,
    homeLocations, homeSubCategories,
    setHomeLocations, setHomeMainCategories, setHomeSubCategories,
    darkMode, setDarkMode,
    handleRegistrationConfirm,
    handleCreatePost, handleCreateActivity, handleCreateClub, handleUpdateProfile, handleLogout,
    addToast,
    exploreTags, saveExploreTags, isExploreManagerOpen, setIsExploreManagerOpen,
    isDateSelectModalOpen, setIsDateSelectModalOpen, selectedCalendarDate, setSelectedCalendarDate,
    calendarActiveDates,
  } = useAppContext();

  const managedClubs = clubs.filter(c => user.managedClubIds.includes(c.id));

  const handleCreateAction = (action: 'ACTIVITY' | 'CLUB' | 'POST') => {
    setIsCreateMenuOpen(false);
    if (action === 'POST') {
      if (managedClubs.length > 0) {
        navigate(`/clubs/${managedClubs[0].id}`);
        addToast('請在社團頁面中發布貼文', 'info');
      } else {
        setIsPostModalOpen(true);
      }
    } else if (action === 'ACTIVITY') setIsCreateActivityOpen(true);
    else if (action === 'CLUB') setIsCreateClubOpen(true);
  };

  const onCreatePost = (content: string) => {
    handleCreatePost(content);
    setIsPostModalOpen(false);
  };

  return (
    <>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      {selectedActivity && (
        <RegistrationModal
          activity={selectedActivity}
          isOpen={isRegistrationOpen}
          onClose={() => setIsRegistrationOpen(false)}
          onConfirm={handleRegistrationConfirm}
        />
      )}

      <CreateMenuModal
        isOpen={isCreateMenuOpen}
        onClose={() => setIsCreateMenuOpen(false)}
        onSelectAction={handleCreateAction}
      />

      <CreatePostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onPost={onCreatePost}
      />

      <CreateActivityModal
        isOpen={isCreateActivityOpen}
        onClose={() => setIsCreateActivityOpen(false)}
        onCreate={handleCreateActivity}
        managedClubs={managedClubs}
      />

      <CreateClubModal
        isOpen={isCreateClubOpen}
        onClose={() => setIsCreateClubOpen(false)}
        onCreate={handleCreateClub}
      />

      <LocationMapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        selectedLocations={homeLocations}
        onSelect={setHomeLocations}
      />

      <SportCategoryModal
        isOpen={isCategoryOpen}
        onClose={() => setIsCategoryOpen(false)}
        initialSelected={homeSubCategories}
        onConfirm={(selected) => {
          setHomeSubCategories(selected);
          if (selected.length > 0) {
            const derivedMain = SPORTS_HIERARCHY.filter(cat => 
              cat.items.some(item => selected.includes(item))
            ).map(cat => cat.name);
            setHomeMainCategories(derivedMain.length > 0 ? derivedMain : ['所有運動']);
          } else {
            setHomeMainCategories(['所有運動']);
          }
          setIsCategoryOpen(false);
        }}
        title="選擇運動類型"
      />

      <ActivityFilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        currentFilters={advancedFilters}
        onApply={setAdvancedFilters}
        onReset={() => setAdvancedFilters(DEFAULT_FILTER_STATE)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        darkMode={darkMode}
        onDarkModeToggle={() => setDarkMode(!darkMode)}
        user={user}
        onUpdateProfile={handleUpdateProfile}
        onLogout={handleLogout}
      />

      <ExploreTagManagerModal
        isOpen={isExploreManagerOpen}
        onClose={() => setIsExploreManagerOpen(false)}
        exploreTags={exploreTags}
        onSave={saveExploreTags}
      />

      <DateSelectModal
        isOpen={isDateSelectModalOpen}
        onClose={() => setIsDateSelectModalOpen(false)}
        currentDate={selectedCalendarDate}
        onSelectDate={setSelectedCalendarDate}
        activeDates={calendarActiveDates}
      />

      <Toast toasts={toasts} />
    </>
  );
};

export default ModalManager;
