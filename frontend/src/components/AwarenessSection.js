// src/components/AwarenessSection.js
import React, { useState } from 'react';
import './AwarenessSection.css';

const TIPS = {
  critical: [
    { emoji:'💧', title:'Place water outside NOW', text:'Keep a bowl of clean, cool water outside your gate. Refill every 2–3 hours. This one act can save a life today.', badge:'🔴 Critical Action' },
    { emoji:'🏠', title:'Create emergency shade', text:'Hang wet cloth to create a shaded corner where animals rest. A 2×2m shade reduces ground temperature by 12°C.', badge:'🔴 Urgent' },
    { emoji:'📞', title:'Call your local NGO', text:'If you see an animal convulsing or unable to stand, call Wildlife SOS: 9871963535 immediately.', badge:'🔴 Emergency' },
    { emoji:'🚗', title:'Check before you start your car', text:'Animals rest under vehicles for shade. Honk gently before starting — give them time to move safely.', badge:'🔴 Important' },
  ],
  moderate: [
    { emoji:'🌊', title:'Keep water in the shade', text:'Water in direct sun heats to 45°C within 30 minutes — too hot to drink. Always place bowls in shaded spots.', badge:'🟡 Recommended' },
    { emoji:'🍉', title:'Offer hydrating foods', text:'Watermelon, cucumber peels, and buttermilk are safe and hydrating for dogs and cows. Leave near water points.', badge:'🟡 Helpful' },
    { emoji:'⏰', title:'Avoid feeding at peak heat', text:'Dry food increases thirst. Avoid feeding animals between 11am–4pm. Early morning and evening is safer.', badge:'🟡 Advisory' },
    { emoji:'📸', title:'Monitor and report', text:'Notice abnormal panting, drooling, confusion? Report immediately through HeatWatch to trigger NGO response.', badge:'🟡 Monitor' },
  ],
  safe: [
    { emoji:'🌱', title:'Maintain water points', text:'Even in safe zones, temperatures can spike rapidly. Preventive water care costs far less than emergency rescue.', badge:'🟢 Preventive' },
    { emoji:'🌳', title:'Advocate for more trees', text:'Low canopy areas become critical in peak summer. Contact your ward office to support street tree planting.', badge:'🟢 Long-term' },
    { emoji:'❤️', title:'Volunteer with NGOs', text:'Join Wildlife SOS or local animal welfare groups. Even safe zones need volunteers during heatwaves.', badge:'🟢 Community' },
    { emoji:'📣', title:'Spread awareness', text:'Share HeatWatch with your RWA or neighbourhood group. Awareness in safe zones today prevents crises tomorrow.', badge:'🟢 Awareness' },
  ],
};

export default function AwarenessSection() {
  const [zone, setZone] = useState('critical');

  return (
    <section className="section" id="awareness">
      <div className="section-tag">💬 Public Awareness</div>
      <h2 className="section-title">How You Can Help</h2>
      <p className="section-sub">Actionable guidance for residents based on your area's current heat risk level.</p>
      <div className="zone-tabs">
        {['critical','moderate','safe'].map(z => (
          <button key={z} className={`zone-tab ${zone === z ? 'active' : ''} tab-${z}`} onClick={() => setZone(z)}>
            {z === 'critical' ? '🔴 Critical Zone' : z === 'moderate' ? '🟡 Moderate Zone' : '🟢 Safe Zone'}
          </button>
        ))}
      </div>
      <div className="tips-grid">
        {TIPS[zone].map(t => (
          <div key={t.title} className="tip-card card">
            <span className="tip-emoji">{t.emoji}</span>
            <div className="tip-title">{t.title}</div>
            <div className="tip-text">{t.text}</div>
            <div className={`tip-badge zone-badge-${zone}`}>{t.badge}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
