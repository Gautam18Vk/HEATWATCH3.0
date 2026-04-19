// src/components/ZoneGrid.js
import React from 'react';
import { useWeather } from '../context/WeatherContext';
import './ZoneGrid.css';

export default function ZoneGrid() {
  const { alerts } = useWeather();
  const zones = alerts.length > 0 ? alerts : FALLBACK_ZONES;

  return (
    <div className="full-section" id="zones">
      <div className="full-inner">
        <div className="section-tag">🏙 Zone Overview</div>
        <h2 className="section-title">Area-wise Risk Summary</h2>
        <div className="zone-grid">
          {zones.map(z => (
            <div key={z.id || z.zone} className={`zone-card zone-${z.risk || z.zoneRisk}`}>
              <div className="zone-area">{z.area || 'Delhi NCR'}</div>
              <div className="zone-name">{z.zone || z.name}</div>
              {z.criticalAnimals?.length > 0 && (
                <div className="zone-animals">
                  {z.criticalAnimals.map((a, i) => <span key={i} className="animal-chip">{a}</span>)}
                </div>
              )}
              <div className={`risk-badge risk-${z.risk || z.zoneRisk}`} style={{ marginTop: 10 }}>
                <div className={`risk-dot ${z.risk || z.zoneRisk}`} />
                {(z.risk || z.zoneRisk)?.toUpperCase()}
                {z.temp && ` · ${z.temp}°C`}
              </div>
              {z.actions?.[0] && (
                <div className="zone-action"><strong>→</strong> {z.actions[0]}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const FALLBACK_ZONES = [
  { zone: 'Connaught Place', area: 'Central Delhi', risk: 'critical', temp: 42, criticalAnimals: ['🐕 Dog', '🐱 Cat'], actions: ['Deploy water bowls — Immediate'] },
  { zone: 'Rohini Sector 9', area: 'North Delhi', risk: 'critical', temp: 43, criticalAnimals: ['🐕 Dog', '🐄 Cow'], actions: ['Water supply van required'] },
  { zone: 'Noida Sector 18', area: 'East Delhi', risk: 'moderate', temp: 40, criticalAnimals: ['🐕 Dog'], actions: ['Monitor and prepare response'] },
  { zone: 'Dwarka Sector 6', area: 'West Delhi', risk: 'moderate', temp: 39, criticalAnimals: ['🐦 Birds'], actions: ['Set up water stations'] },
  { zone: 'Sanjay Van', area: 'South Delhi', risk: 'safe', temp: 36, criticalAnimals: [], actions: ['Continue monitoring'] },
  { zone: 'Ridge Forest Belt', area: 'North-West Delhi', risk: 'safe', temp: 35, criticalAnimals: [], actions: ['Maintain water points'] },
];
