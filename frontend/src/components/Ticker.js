// src/components/Ticker.js
import React, { useMemo } from 'react';
import { useWeather } from '../context/WeatherContext';
import './Ticker.css';

export default function Ticker() {
  const { weather, ahsi, reportStats, zoneRisk } = useWeather();

  const items = useMemo(() => {
    const base = [
      { text: '🌡 HeatWatch is LIVE — Real-time street animal heat protection system', color: '#f97316' },
      { text: '🐕 Dogs + 🐱 Cats + 🐄 Cows + 🐦 Birds + 🐒 Monkeys — All monitored 24/7', color: '#3b82f6' },
      { text: '🆘 Animal in distress? Call Wildlife SOS: 9871963535', color: '#ef4444' },
      { text: '💧 Place a bowl of water outside your home — Save a life today', color: '#14b8a6' },
    ];

    if (weather) {
      base.unshift({ text: `🌡 ${weather.city}: ${weather.temp}°C | Feels like ${weather.feelsLike}°C | Humidity ${weather.humidity}%`, color: '#f97316' });
      base.push({ text: `☀️ UV Index: ${weather.uvi} | Wind: ${weather.windSpeed} km/h | Visibility: ${weather.visibility} km`, color: '#f59e0b' });
    }

    if (zoneRisk === 'critical') {
      base.unshift({ text: `🔴 CRITICAL HEAT ALERT — Extreme conditions detected. Immediate action required!`, color: '#ef4444' });
    }

    if (reportStats) {
      base.push({ text: `📍 ${reportStats.last24h || 0} citizen reports in last 24 hours · ${reportStats.critical || 0} critical`, color: '#a78bfa' });
    }

    if (ahsi) {
      const birdScore = ahsi.bird?.score;
      if (birdScore > 80) base.push({ text: `🐦 BIRD ALERT: Score ${birdScore}/100 — Place elevated water bowls near trees NOW`, color: '#ef4444' });
    }

    // Duplicate for seamless loop
    return [...base, ...base];
  }, [weather, ahsi, reportStats, zoneRisk]);

  return (
    <div className="ticker-wrap">
      <div className="ticker-label">LIVE</div>
      <div className="ticker-scroll">
        <div className="ticker-inner">
          {items.map((item, i) => (
            <span key={i} className="ticker-item">
              <span className="ticker-dot" style={{ background: item.color }} />
              {item.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
