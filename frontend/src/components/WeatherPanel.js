// src/components/WeatherPanel.js
import React, { useState } from 'react';
import { useWeather } from '../context/WeatherContext';
import './WeatherPanel.css';

const WEATHER_ICONS = {
  'clear': '☀️', 'sun': '☀️', 'cloud': '⛅', 'rain': '🌧',
  'storm': '⛈', 'snow': '🌨', 'mist': '🌫', 'haze': '🌫', 'hot': '🌡', 'default': '🌤'
};

function getWeatherIcon(description = '', icon) {
  if (icon) return icon;
  const d = description.toLowerCase();
  for (const [key, val] of Object.entries(WEATHER_ICONS)) {
    if (d.includes(key)) return val;
  }
  return WEATHER_ICONS.default;
}

export default function WeatherPanel() {
  const { weather, zoneRisk, lastUpdated, loading, updateLocation } = useWeather();
  const [cityInput, setCityInput] = useState('');
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!cityInput.trim()) return;
    setSearching(true);
    await updateLocation({ city: cityInput.trim() });
    setCityInput('');
    setSearching(false);
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => updateLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude, city: 'Your Location' }),
      () => {}
    );
  };

  if (loading && !weather) {
    return (
      <div className="card">
        <div className="loading-overlay"><div className="spinner" /> Loading weather...</div>
      </div>
    );
  }

  return (
    <div className="card weather-card">
      <div className="card-title">🌡 Current Weather</div>

      {/* Search bar */}
      <form className="city-search" onSubmit={handleSearch}>
        <input
          type="text"
          value={cityInput}
          onChange={e => setCityInput(e.target.value)}
          placeholder="Search city..."
          className="city-input"
        />
        <button type="submit" className="city-btn" disabled={searching}>
          {searching ? '...' : '🔍'}
        </button>
        <button type="button" className="city-btn" onClick={handleGeolocate} title="Use my location">
          📡
        </button>
      </form>

      {weather && (
        <>
          <div className="weather-main">
            <div>
              <div className="weather-temp">{weather.temp}°C</div>
              <div className="weather-feels">Feels like {weather.feelsLike}°C</div>
              <div className="weather-city">{weather.city}</div>
              <div className="weather-desc">{weather.description}</div>
            </div>
            <div className="weather-icon-big">{getWeatherIcon(weather.description, weather.weatherIcon)}</div>
          </div>

          <div className="weather-stats-grid">
            <div className="w-stat">
              <div className="w-stat-lbl">Humidity</div>
              <div className="w-stat-val humid">{weather.humidity}%</div>
            </div>
            <div className="w-stat">
              <div className="w-stat-lbl">Wind</div>
              <div className="w-stat-val wind">{weather.windSpeed} km/h</div>
            </div>
            <div className="w-stat">
              <div className="w-stat-lbl">UV Index</div>
              <div className="w-stat-val uv">{weather.uvi ?? '—'}</div>
            </div>
            <div className="w-stat">
              <div className="w-stat-lbl">Visibility</div>
              <div className="w-stat-val hot">{weather.visibility} km</div>
            </div>
          </div>

          <div className={`risk-badge risk-${zoneRisk}`} style={{ marginTop: 16 }}>
            <div className={`risk-dot ${zoneRisk}`} />
            {zoneRisk === 'critical' ? 'CRITICAL HEAT RISK ZONE'
              : zoneRisk === 'moderate' ? 'MODERATE HEAT RISK'
              : 'SAFE HEAT LEVEL'}
          </div>

          {lastUpdated && (
            <div className="weather-updated">
              Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST
              {weather.source === 'mock' && ' · Demo Mode'}
            </div>
          )}
        </>
      )}
    </div>
  );
}
