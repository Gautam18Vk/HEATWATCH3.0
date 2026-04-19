// src/components/AHSIPanel.js
import React, { useState } from 'react';
import { useWeather } from '../context/WeatherContext';
import './AHSIPanel.css';

const ANIMALS = [
  { key: 'dog', label: '🐕 Dog' },
  { key: 'cat', label: '🐱 Cat' },
  { key: 'cow', label: '🐄 Cow' },
  { key: 'bird', label: '🐦 Bird' },
  { key: 'monkey', label: '🐒 Monkey' },
];

export default function AHSIPanel() {
  const { ahsi, loading } = useWeather();
  const [selected, setSelected] = useState('dog');

  if (loading && !ahsi) return (
    <div className="card">
      <div className="loading-overlay"><div className="spinner" /> Calculating AHSI...</div>
    </div>
  );

  const data = ahsi?.[selected];
  if (!data) return null;

  const barColor = data.riskLevel === 'critical'
    ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
    : data.riskLevel === 'moderate'
    ? 'linear-gradient(90deg, #22c55e, #f59e0b)'
    : 'linear-gradient(90deg, #22c55e, #14b8a6)';

  return (
    <div className="card ahsi-card">
      <div className="card-title">🐾 Animal Heat Stress Index (AHSI)</div>

      <div className="ahsi-tabs">
        {ANIMALS.map(a => (
          <button
            key={a.key}
            className={`ahsi-tab ${selected === a.key ? 'active' : ''}`}
            onClick={() => setSelected(a.key)}
          >
            {a.label}
          </button>
        ))}
      </div>

      <div className="ahsi-score-row">
        <div className="ahsi-animal-icon">{data.animalIcon}</div>
        <div>
          <div className={`ahsi-score ${data.riskLevel}`}>{data.score}</div>
          <div className="ahsi-level">{data.riskLabel}</div>
        </div>
        <div className="ahsi-gauge-right">
          <div className="ahsi-gauge-label">RISK SCORE</div>
          <div className="ahsi-gauge-val" style={{ color: data.riskColor }}>
            {data.score} / 100
          </div>
        </div>
      </div>

      <div className="ahsi-bar">
        <div className="ahsi-bar-fill" style={{ width: `${data.score}%`, background: barColor }} />
      </div>

      <div className="ahsi-details-grid">
        <div className="ahsi-detail">
          <div className="ahsi-detail-val" style={{ color: 'var(--accent)' }}>
            {data.thresholds?.critical}°C
          </div>
          <div className="ahsi-detail-lbl">Critical Threshold</div>
        </div>
        <div className="ahsi-detail">
          <div className="ahsi-detail-val" style={{ color: 'var(--blue)' }}>
            {data.breakdown?.thi ?? '—'}
          </div>
          <div className="ahsi-detail-lbl">THI Score</div>
        </div>
        <div className="ahsi-detail">
          <div className="ahsi-detail-val" style={{ color: 'var(--teal)' }}>
            {data.breakdown?.heatIndex ?? '—'}°C
          </div>
          <div className="ahsi-detail-lbl">Heat Index</div>
        </div>
      </div>

      {/* Score breakdown */}
      {data.breakdown && (
        <div className="ahsi-breakdown">
          {[
            { lbl: 'Temperature', val: data.breakdown.temperatureScore, max: 70 },
            { lbl: 'Humidity', val: data.breakdown.humidityScore, max: 20 },
            { lbl: 'Exposure', val: data.breakdown.exposureScore, max: 15 },
            { lbl: 'THI Bonus', val: data.breakdown.thiBonus, max: 15 },
          ].map(b => (
            <div key={b.lbl} className="breakdown-row">
              <span className="breakdown-lbl">{b.lbl}</span>
              <div className="breakdown-bar">
                <div className="breakdown-fill" style={{ width: `${(b.val / b.max) * 100}%` }} />
              </div>
              <span className="breakdown-val">{b.val}</span>
            </div>
          ))}
        </div>
      )}

      <div className={`ahsi-rec ahsi-rec-${data.riskLevel}`}>
        {data.immediateActions?.[0] && (
          <>
            {data.riskLevel === 'critical' ? '⚠️' : data.riskLevel === 'moderate' ? '⚡' : '✅'}
            {' '}{data.immediateActions[0]}
          </>
        )}
      </div>
    </div>
  );
}
