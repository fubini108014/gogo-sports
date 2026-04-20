import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
// @ts-ignore
import 'leaflet.markercluster/dist/MarkerCluster.css';
// @ts-ignore
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { Activity } from '../../types';

// Fix Leaflet default icon path issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

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

function makeClusterIcon(count: number) {
  const size = count < 10 ? 36 : count < 100 ? 42 : 48;
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;
      background:#f97316;
      border:3px solid white;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      color:white;font-weight:700;font-size:${size < 42 ? 13 : 14}px;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
    ">${count}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

interface ClusterLayerProps {
  activities: Activity[];
  onActivityClick?: (activity: Activity) => void;
}

const ClusterLayer: React.FC<ClusterLayerProps> = ({ activities, onActivityClick }) => {
  const map = useMap();
  const groupRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    const group = (L as any).markerClusterGroup({
      iconCreateFunction: (cluster: L.MarkerCluster) =>
        makeClusterIcon(cluster.getChildCount()),
      maxClusterRadius: 60,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      spiderfyOnMaxZoom: true,
    }) as L.MarkerClusterGroup;

    activities.forEach(activity => {
      if (activity.lat == null || activity.lng == null) return;
      const marker = L.marker([activity.lat, activity.lng], { icon: orangeIcon });

      const popup = L.popup({ minWidth: 160 }).setContent(`
        <div style="min-width:160px">
          <p style="font-weight:700;font-size:13px;color:#111827;margin:0 0 4px">${activity.title}</p>
          <p style="font-size:11px;color:#6b7280;margin:0 0 2px">${activity.location}</p>
          <p style="font-size:11px;color:#6b7280;margin:0 0 8px">${activity.date} · ${activity.time}</p>
          ${onActivityClick ? `<button
            data-activity-id="${activity.id}"
            style="width:100%;font-size:12px;font-weight:700;background:#f97316;color:white;border:none;padding:6px 12px;border-radius:8px;cursor:pointer"
          >查看活動</button>` : ''}
        </div>
      `);

      if (onActivityClick) {
        popup.on('add', () => {
          const btn = document.querySelector(`button[data-activity-id="${activity.id}"]`);
          btn?.addEventListener('click', () => onActivityClick(activity));
        });
      }

      marker.bindPopup(popup);
      group.addLayer(marker);
    });

    groupRef.current = group;
    map.addLayer(group);

    const positions = activities
      .filter(a => a.lat != null && a.lng != null)
      .map(a => [a.lat!, a.lng!] as [number, number]);

    if (positions.length === 1) {
      map.setView(positions[0], 15);
    } else if (positions.length > 1) {
      map.fitBounds(positions, { padding: [40, 40] });
    }

    return () => {
      map.removeLayer(group);
    };
  }, [map, activities, onActivityClick]);

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

  const center = [mappable[0].lat!, mappable[0].lng!] as [number, number];

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
        <ClusterLayer activities={mappable} onActivityClick={onActivityClick} />
      </MapContainer>
    </div>
  );
};

export default ActivityMap;
