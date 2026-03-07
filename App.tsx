import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ActivityListPage from './pages/ActivityListPage';
import ActivityDetailPage from './pages/ActivityDetailPage';
import ClubListPage from './pages/ClubListPage';
import ClubProfilePage from './pages/ClubProfilePage';
import UserProfilePage from './pages/UserProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import MessagesPage from './pages/MessagesPage';
import ConversationPage from './pages/ConversationPage';

const App: React.FC = () => (
  <AppProvider>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="activities" element={<ActivityListPage />} />
        <Route path="activities/:id" element={<ActivityDetailPage />} />
        <Route path="clubs" element={<ClubListPage />} />
        <Route path="clubs/:id" element={<ClubProfilePage />} />
        <Route path="profile" element={<UserProfilePage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="messages" element={<MessagesPage />} />
      </Route>
      {/* Full-screen conversation — no layout wrapper */}
      <Route path="/messages/:id" element={<ConversationPage />} />
    </Routes>
  </AppProvider>
);

export default App;
