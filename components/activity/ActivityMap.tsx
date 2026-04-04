import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Activity } from '../../types';

// Fix Leaflet default icon path issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom orange marker for primary color
const orangeIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:28px;height:28px;
    background:#f97316;
    border:3px solid white;
    border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    box-shadow:0 2px 8px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -30],
});

// Sub-component: auto-fit map bounds to all markers
const FitBounds: React.FC<{ positions: [number, number][] }> = ({ positions }) => {
  const map = useMap();
  useEffect(() => {
    if (positions.length === 0) return;
    if (positions.length === 1) {
      map.setView(positions[0], 15);
    } else {
      map.fitBounds(positions, { padding: [40, 40] });
    }
  }, [map, positions]);
  return null;
};

interface ActivityMapProps {
  activities: Activity[];
  onActivityClick?: (activity: Activity) => void;
  className?: string;
}

const ActivityMap: React.FC<ActivityMapProps> = ({
  activities,
  onActivityClick,
  className = 'h-64',
}) => {
  const mappable = activities.filter(a => a.lat != null && a.lng != null);

  if (mappable.length === 0) {
    return (
      <div className={`${className} bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center`}>
        <p className="text-gray-400 dark:text-gray-500 text-sm">無地圖資料</p>
      </div>
    );
  }

  const positions = mappable.map(a => [a.lat!, a.lng!] as [number, number]);
  const center = positions[0];

  return (
    <div className={`${className} overflow-hidden rounded-2xl z-0`}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds positions={positions} />
        {mappable.map(activity => (
          <Marker
            key={activity.id}
            position={[activity.lat!, activity.lng!]}
            icon={orangeIcon}
          >
            <Popup>
              <div className="min-w-[160px]">
                <p className="font-bold text-sm text-gray-900 mb-1">{activity.title}</p>
                <p className="text-xs text-gray-500 mb-2">{activity.location}</p>
                <p className="text-xs text-gray-500 mb-2">{activity.date} · {activity.time}</p>
                {onActivityClick && (
                  <button
                    onClick={() => onActivityClick(activity)}
                    className="w-full text-xs font-bold bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    查看活動
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ActivityMap;
