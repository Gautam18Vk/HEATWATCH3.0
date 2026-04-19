// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { useWeather } from '../context/WeatherContext';
import './Navbar.css';

export default function Navbar() {
  const { weather, zoneRisk, refreshAll, loading } = useWeather();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <div className="logo-icon">🌡</div>
        <span>Heat<span className="dot">Watch</span></span>
      </div>

      <div className="nav-links">
        {['dashboard','ahsi-section','report','alerts','awareness'].map((id, i) => (
          <button key={id} className="nav-link" onClick={() => scrollTo(id)}>
            {['Dashboard','Heat Index','Report','Alerts','Awareness'][i]}
          </button>
        ))}
      </div>

      <div className="nav-right">
        {weather && (
          <div className={`nav-temp risk-${zoneRisk}`}>
            <div className={`risk-dot ${zoneRisk}`} />
            {weather.temp}°C · {zoneRisk.toUpperCase()}
          </div>
        )}
        <button className="nav-refresh" onClick={refreshAll} disabled={loading} title="Refresh data">
          <span className={loading ? 'spin' : ''}>🔄</span>
        </button>
        <button className="btn-primary btn-sm" onClick={() => scrollTo('report')}>
          Report Animal
        </button>
      </div>
    </nav>
  );
}
