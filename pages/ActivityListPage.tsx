import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { SPORTS_HIERARCHY } from '../constants';
import ActivityList from '../components/ActivityList';
import ActivityMap from '../components/ActivityMap';
import { List, Map } from 'lucide-react';

const ActivityListPage: React.FC = () => {
  const navigate = useNavigate();
  const { activities, handleActivityClick } = useAppContext();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  return (
    <div className="relative">
      {/* View mode toggle — only visible on map mode or via header */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-20 flex bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg overflow-hidden">
        <button
          onClick={() => setViewMode('list')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold transition-colors ${
            viewMode === 'list'
              ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <List size={14} /> 列表
        </button>
        <button
          onClick={() => setViewMode('map')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold transition-colors ${
            viewMode === 'map'
              ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Map size={14} /> 地圖
        </button>
      </div>

      {viewMode === 'list' ? (
        <ActivityList
          activities={activities}
          categories={SPORTS_HIERARCHY}
          onActivityClick={handleActivityClick}
          onBack={() => navigate(-1)}
        />
      ) : (
        <div className="px-4 pt-6 pb-24">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900 dark:text-white">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">活動地圖</h1>
          </div>
          <ActivityMap
            activities={activities}
            onActivityClick={handleActivityClick}
            className="h-[calc(100vh-180px)] w-full"
          />
        </div>
      )}
    </div>
  );
};

export default ActivityListPage;
