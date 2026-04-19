// src/components/Dashboard.js
import React, { useState } from 'react';
import { useWeather } from '../context/WeatherContext';
import WeatherPanel from './WeatherPanel';
import AHSIPanel from './AHSIPanel';
import MapPanel from './MapPanel';
import './Dashboard.css';

export default function Dashboard() {
  return (
    <section className="section" id="dashboard">
      <div className="section-tag">📊 Live Dashboard</div>
      <h2 className="section-title">Real-Time Heat Risk Monitor</h2>
      <p className="section-sub">
        Live weather conditions, heat stress indices, and interactive zone map — updated automatically.
      </p>
      <div className="dashboard-grid">
        <div className="dashboard-left">
          <WeatherPanel />
          <AHSIPanel />
        </div>
        <MapPanel />
      </div>
    </section>
  );
}
