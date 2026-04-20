// src/components/ZoneGrid.js — uses live Open-Meteo zone data
import React from 'react';
import { useWeather } from '../context/WeatherContext';
import './ZoneGrid.css';

export default function ZoneGrid() {
  const { zones, alerts, loading } = useWeather();

  // Prefer zones (has full weather data), fallback to alerts shape
  const items = zones.length > 0 ? zones : alerts;

  return (
    <div className="full-section" id="zones">
      <div className="full-inner">
        <div className="section-tag">🏙 Zone Overview</div>
        <h2 className="section-title">Area-wise Risk Summary</h2>
        {loading && items.length === 0 ? (
          <div className="loading-overlay" style={{ marginTop: 20 }}>
            <div className="spinner" /> Fetching live zone temperatures...
          </div>
        ) : (
          <div className="zone-grid">
            {items.map(z => {
              const risk = z.zoneRisk || z.risk || 'moderate';
              const temp = z.weather?.temp || z.temp;
              const humidity = z.weather?.humidity || z.humidity;
              const name = z.name || z.zone;
              const critAnimals = z.ahsi
                ? Object.values(z.ahsi).filter(a => a.riskLevel === 'critical').map(a => a.animalIcon)
                : (z.criticalAnimals || []);
              const action = z.actions?.[0] || (risk === 'critical' ? 'Immediate response required' : 'Monitor and prepare');

              return (
                <div key={z.id || name} className={`zone-card zone-${risk}`}>
                  <div className="zone-area">{z.area}</div>
                  <div className="zone-name">{name}</div>

                  {/* Live temperature display */}
                  {temp && (
                    <div className="zone-temp-row">
                      <span className="zone-temp">{temp}°C</span>
                      {humidity && <span className="zone-hum">💧 {humidity}%</span>}
                      {z.weather?.weatherIcon && <span className="zone-icon">{z.weather.weatherIcon}</span>}
                    </div>
                  )}

                  {critAnimals.length > 0 && (
                    <div className="zone-animals">
                      {critAnimals.slice(0, 4).map((a, i) => (
                        <span key={i} className="animal-chip">{a}</span>
                      ))}
                    </div>
                  )}

                  <div className={`risk-badge risk-${risk}`} style={{ marginTop: 10, fontSize: 11, padding: '5px 12px' }}>
                    <div className={`risk-dot ${risk}`} />
                    {risk.toUpperCase()}
                  </div>

                  <div className="zone-action"><strong>→</strong> {action}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
