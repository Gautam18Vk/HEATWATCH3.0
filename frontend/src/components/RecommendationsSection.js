// src/components/RecommendationsSection.js
import React from 'react';
import { useWeather } from '../context/WeatherContext';
import './RecommendationsSection.css';

const ALL_RECS = [
  { icon:'💧', title:'Deploy Water Stations', text:'Install ceramic/steel water bowls at 200m intervals in critical zones. Refill every 4 hours. Depth >5cm for cows.', priority:'urgent' },
  { icon:'🏕', title:'Emergency Shade Units', text:'Use tarpaulins or bamboo near open areas where animals gather between 11am–4pm. Reduces ground temp by 12°C.', priority:'urgent' },
  { icon:'🌳', title:'Tree Cover Mapping', text:'Areas with <15% canopy face 8–12°C higher ground temps. Priority tree planting in Rohini and CP zones.', priority:'high' },
  { icon:'📢', title:'Community Mobilization', text:'Inform residents via local groups to place water outside homes. 1 bowl per household = dense neighbourhood coverage.', priority:'high' },
  { icon:'🏥', title:'NGO Coordination', text:'Alert Wildlife SOS (9871963535), SPCA Delhi, PETA India for ground response and rescue van deployment.', priority:'high' },
  { icon:'📱', title:'Expand Citizen Reporting', text:'Each report triangulates high-risk zones faster for NGO deployment. Share HeatWatch with your community.', priority:'medium' },
];

export default function RecommendationsSection() {
  const { zoneRisk } = useWeather();
  const recs = zoneRisk === 'safe' ? ALL_RECS.slice(3) : ALL_RECS;

  return (
    <section className="section" id="recs">
      <div className="section-tag">💡 Smart Recommendations</div>
      <h2 className="section-title">Suggested Actions</h2>
      <p className="section-sub">Priority action plan based on current heat risk levels across monitored zones.</p>
      <div className="rec-grid">
        {recs.map(r => (
          <div key={r.title} className="rec-card card">
            <div className="rec-icon">{r.icon}</div>
            <div className="rec-title">{r.title}</div>
            <div className="rec-text">{r.text}</div>
            <div className={`rec-priority priority-${r.priority}`}>{r.priority.toUpperCase()}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
