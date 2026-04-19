// src/components/AlertsSection.js
import React from 'react';
import toast from 'react-hot-toast';
import { useWeather } from '../context/WeatherContext';
import './AlertsSection.css';

export default function AlertsSection() {
  const { alerts, loading } = useWeather();

  return (
    <section className="section" id="alerts">
      <div className="section-tag">🚨 NGO / Municipality Dashboard</div>
      <h2 className="section-title">Active Alert Zones</h2>
      <p className="section-sub">
        Auto-generated alerts for animal welfare organizations and municipal authorities.
      </p>
      {loading && alerts.length === 0 ? (
        <div className="loading-overlay" style={{ marginTop: 20 }}><div className="spinner" /> Loading alerts...</div>
      ) : (
        <div className="alerts-list">
          {alerts.length === 0 && (
            <div className="alert-empty">✅ No active critical alerts at this time</div>
          )}
          {alerts.map(alert => (
            <div key={alert.id} className={`alert-item alert-${alert.risk}`}>
              <div className="alert-left">
                <div className={`alert-risk-pill risk-${alert.risk}`}>
                  <div className={`risk-dot ${alert.risk}`} />
                  {alert.risk?.toUpperCase()}
                </div>
                <div className="alert-title">{alert.message || `${alert.risk?.toUpperCase()} RISK — ${alert.zone}`}</div>
                <div className="alert-meta">
                  {alert.zone} · {alert.area} · {alert.temp}°C · {alert.humidity}% humidity
                </div>
                {alert.criticalAnimals?.length > 0 && (
                  <div className="alert-animals">
                    {alert.criticalAnimals.map((a, i) => <span key={i} className="alert-animal-chip">{a}</span>)}
                  </div>
                )}
                {alert.actions && (
                  <ul className="alert-actions-list">
                    {alert.actions.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                )}
              </div>
              <button
                className="btn-outline btn-sm alert-ack-btn"
                onClick={() => toast.success(`🚨 Alert acknowledged — Response dispatched to ${alert.zone}`)}
              >
                Acknowledge
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
