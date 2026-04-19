// src/components/MapPanel.js
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useWeather } from '../context/WeatherContext';
import { fetchAllZones } from '../utils/api';
import './MapPanel.css';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const RISK_COLORS = {
  critical: { color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.18 },
  moderate: { color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.15 },
  safe: { color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.12 },
};

const ANIMAL_FILTERS = ['all', 'dog', 'cat', 'cow', 'bird'];
const ANIMAL_LABELS = { all: 'All Animals', dog: '🐕 Dogs', cat: '🐱 Cats', cow: '🐄 Cows', bird: '🐦 Birds' };

function createReportIcon(severity) {
  const colors = { critical: '#ef4444', moderate: '#f59e0b', safe: '#22c55e' };
  const color = colors[severity] || colors.moderate;
  return L.divIcon({
    html: `<div style="
      width:12px;height:12px;border-radius:50%;
      background:${color};border:2px solid #fff;
      box-shadow:0 0 8px ${color}88;
    "></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    className: '',
  });
}

// Fly to user location
function FlyTo({ center }) {
  const map = useMap();
  useEffect(() => { map.flyTo(center, 12, { duration: 1.5 }); }, [center]);
  return null;
}

export default function MapPanel() {
  const { reports, location } = useWeather();
  const [zones, setZones] = useState([]);
  const [filter, setFilter] = useState('all');
  const [zonesLoading, setZonesLoading] = useState(true);
  const center = [location.lat || 28.6139, location.lon || 77.2090];

  useEffect(() => {
    fetchAllZones()
      .then(d => setZones(d.zones || []))
      .catch(() => setZones(FALLBACK_ZONES))
      .finally(() => setZonesLoading(false));
  }, []);

  const filteredReports = filter === 'all'
    ? reports
    : reports.filter(r => r.animal === filter);

  return (
    <div className="map-panel card">
      <div className="map-header">
        <div className="card-title">🗺 Live Heat Zone Map</div>
        <div className="map-filter-row">
          {ANIMAL_FILTERS.map(f => (
            <button
              key={f}
              className={`map-filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {ANIMAL_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="map-wrap">
        <MapContainer
          center={center}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='© OpenStreetMap © CARTO'
            maxZoom={19}
          />
          <FlyTo center={center} />

          {/* Zone circles */}
          {zones.map(zone => (
            <Circle
              key={zone.id}
              center={[zone.lat, zone.lon]}
              radius={2200}
              pathOptions={RISK_COLORS[zone.zoneRisk] || RISK_COLORS.moderate}
            >
              <Popup>
                <div className="map-popup">
                  <strong>{zone.name}</strong>
                  <div className={`popup-risk risk-${zone.zoneRisk}`}>
                    {zone.zoneRisk?.toUpperCase()}
                  </div>
                  <div>Temp: {zone.weather?.temp}°C</div>
                  <div>Humidity: {zone.weather?.humidity}%</div>
                  {zone.ahsi?.dog && <div>Dog AHSI: {zone.ahsi.dog.score}/100</div>}
                </div>
              </Popup>
            </Circle>
          ))}

          {/* Report pins */}
          {filteredReports.filter(r => r.lat && r.lon).map(r => (
            <Marker key={r.id} position={[r.lat, r.lon]} icon={createReportIcon(r.severity)}>
              <Popup>
                <div className="map-popup">
                  <strong>{r.animalLabel || r.animal}</strong>
                  <div>{r.location}</div>
                  <div className={`popup-risk risk-${r.severity}`}>{r.severity?.toUpperCase()}</div>
                  <div style={{ fontSize: 11, marginTop: 4 }}>{r.description?.slice(0, 80)}...</div>
                  <div style={{ fontSize: 10, color: '#8a95a8', marginTop: 4 }}>
                    {new Date(r.timestamp).toLocaleTimeString('en-IN')}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Legend overlay */}
        <div className="map-legend">
          {Object.entries(RISK_COLORS).map(([level, style]) => (
            <div key={level} className="legend-item">
              <div className="legend-dot" style={{ background: style.color }} />
              <span>{level.charAt(0).toUpperCase() + level.slice(1)}</span>
            </div>
          ))}
          <div className="legend-item">
            <div className="legend-dot" style={{ background: '#fff', border: '2px solid #888' }} />
            <span>Reports</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fallback zones if API is unreachable
const FALLBACK_ZONES = [
  { id: 'cp', name: 'Connaught Place', lat: 28.6315, lon: 77.2167, zoneRisk: 'critical', weather: { temp: 42, humidity: 58 } },
  { id: 'rohini', name: 'Rohini', lat: 28.7396, lon: 77.0594, zoneRisk: 'critical', weather: { temp: 43, humidity: 60 } },
  { id: 'noida18', name: 'Noida Sec 18', lat: 28.5706, lon: 77.3231, zoneRisk: 'moderate', weather: { temp: 40, humidity: 62 } },
  { id: 'dwarka', name: 'Dwarka', lat: 28.5921, lon: 77.0458, zoneRisk: 'moderate', weather: { temp: 39, humidity: 61 } },
  { id: 'sanjayvan', name: 'Sanjay Van', lat: 28.5700, lon: 77.1800, zoneRisk: 'safe', weather: { temp: 36, humidity: 55 } },
  { id: 'ridge', name: 'Ridge Forest', lat: 28.6800, lon: 77.1400, zoneRisk: 'safe', weather: { temp: 35, humidity: 52 } },
];
