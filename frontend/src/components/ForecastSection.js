// src/components/ForecastSection.js
import React from 'react';
import { useWeather } from '../context/WeatherContext';
import './ForecastSection.css';

const RISK_EMOJI = { critical: '🔴', moderate: '🟡', safe: '🟢' };

function getRisk(temp, humidity) {
  const thi = temp - (0.55 - 0.55 * humidity / 100) * (temp - 14.5);
  if (temp > 40 || thi > 80) return 'critical';
  if (temp > 35 || thi > 70) return 'moderate';
  return 'safe';
}

export default function ForecastSection() {
  const { forecast, weather } = useWeather();

  const days = forecast.length > 0 ? forecast : MOCK_FORECAST(weather?.temp || 40);

  return (
    <section className="section" id="forecast">
      <div className="section-tag">📅 3-Day Forecast</div>
      <h2 className="section-title">Predicted Heat Risk</h2>
      <p className="section-sub">Forward-looking risk forecast using temperature and humidity trend analysis.</p>
      <div className="forecast-row">
        {days.map((d, i) => {
          const risk = getRisk(d.maxTemp || d.temp, d.humidity);
          return (
            <div key={i} className="forecast-card">
              <div className="fc-day">{d.day}</div>
              <div className="fc-icon">{d.icon || '☀️'}</div>
              <div className="fc-temp">{d.maxTemp || d.temp}°C</div>
              {d.minTemp && <div className="fc-min">{d.minTemp}°C min</div>}
              <div className="fc-hum">{d.humidity}% 💧</div>
              <div className={`fc-risk risk-${risk}`}>{RISK_EMOJI[risk]} {risk.toUpperCase()}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function MOCK_FORECAST(base) {
  const days = ['Today','Tomorrow','Day After','Thu','Fri','Sat','Sun'];
  const icons = ['☀️','🌤','⛅','🌦','🌧','⛅','☀️'];
  return days.map((day, i) => ({
    day, icon: icons[i],
    maxTemp: Math.round(base - i * 0.5 + (Math.random() * 2 - 1)),
    minTemp: Math.round(base - i * 0.5 - 6),
    humidity: Math.round(55 + i * 3),
  }));
}
