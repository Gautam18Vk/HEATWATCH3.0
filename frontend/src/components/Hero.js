// src/components/Hero.js
import React from 'react';
import { useWeather } from '../context/WeatherContext';
import './Hero.css';

export default function Hero() {
  const { weather, reportStats, loading } = useWeather();

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="hero">
      <div className="hero-orb orb1" />
      <div className="hero-orb orb2" />
      <div className="hero-orb orb3" />

      <div className="hero-inner">
        <div className="hero-badge">
          <div className="badge-dot" />
          Live Monitoring Active ·{' '}
          {weather ? `${weather.city}` : 'Delhi NCR Region'}
          {weather?.source === 'mock' && <span className="mock-tag">DEMO</span>}
        </div>

        <h1>
          <span className="heat">Heat</span>
          <span className="watch">Watch</span>
          <br />
          Protect Street Animals
          <br />
          from Extreme Heat
        </h1>

        <p className="hero-sub">
          Real-time heat stress monitoring for dogs, cats, cows, birds and other
          street animals across Indian cities. Intelligent risk detection powered
          by live weather data and citizen reports.
        </p>

        <div className="hero-actions">
          <button className="btn-primary" onClick={() => scrollTo('dashboard')}>
            🗺 View Live Dashboard
          </button>
          <button className="btn-outline" onClick={() => scrollTo('report')}>
            📍 Report Distressed Animal
          </button>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <div className="stat-num">
              {loading ? '—' : (reportStats?.last24h ?? 47)}
            </div>
            <div className="stat-label">Reports Today</div>
          </div>
          <div className="hero-stat">
            <div className="stat-num">12</div>
            <div className="stat-label">Critical Zones</div>
          </div>
          <div className="hero-stat">
            <div className="stat-num" style={{ color: 'var(--accent)' }}>
              {weather ? `${weather.temp}°C` : '—'}
            </div>
            <div className="stat-label">Heat Index</div>
          </div>
          <div className="hero-stat">
            <div className="stat-num">5</div>
            <div className="stat-label">Species Monitored</div>
          </div>
        </div>
      </div>
    </div>
  );
}
