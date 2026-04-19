// src/components/AHSISection.js — Scientific thresholds table
import React from 'react';
import './AHSISection.css';

const SCIENCE = [
  { icon:'🐕', name:'Street Dog', safe:'Below 32°C', moderate:'32–38°C', critical:'Above 38°C', note:'Sweats only through paws. Panting is primary cooling. Brachycephalic breeds (Pug, Bulldog) at higher risk above 36°C.' },
  { icon:'🐱', name:'Street Cat', safe:'Below 33°C', moderate:'33–39°C', critical:'Above 39°C', note:'Grooms with saliva to cool. Dehydrate faster than dogs. Seek dark enclosed spaces in extreme heat.' },
  { icon:'🐄', name:'Cow / Bull', safe:'Below 24°C', moderate:'24–40°C', critical:'Above 40°C', note:'THI (Temp-Humidity Index) >72 causes measurable heat stress. Black coats absorb 15–20% more solar radiation.' },
  { icon:'🐦', name:'Birds', safe:'Below 30°C', moderate:'30–34°C', critical:'Above 34°C', note:'Extremely high surface-area-to-volume ratio. Can dehydrate critically in 20–30 mins. Panting is only cooling mechanism.' },
  { icon:'🐒', name:'Monkey', safe:'Below 35°C', moderate:'35–37°C', critical:'Above 37°C', note:'Behaviourally thermoregulate by seeking shade but lack tree access in dense urban areas.' },
];

export default function AHSISection() {
  return (
    <section className="section" id="ahsi-section">
      <div className="section-tag">🔬 Scientific Analysis</div>
      <h2 className="section-title">Animal Heat Thresholds</h2>
      <p className="section-sub">Temperature tolerance based on veterinary research and field data from Indian urban environments.</p>
      <div className="science-grid">
        {SCIENCE.map(a => (
          <div key={a.name} className="science-card card">
            <div className="sci-animal">{a.icon}</div>
            <div className="sci-name">{a.name}</div>
            <div className="sci-rows">
              <div className="sci-row"><span className="sci-lbl">Safe</span><span className="sci-val safe">{a.safe}</span><div className="sci-bar"><div className="sci-fill" style={{width:'30%',background:'var(--green)'}} /></div></div>
              <div className="sci-row"><span className="sci-lbl">Moderate</span><span className="sci-val mod">{a.moderate}</span><div className="sci-bar"><div className="sci-fill" style={{width:'65%',background:'var(--yellow)'}} /></div></div>
              <div className="sci-row"><span className="sci-lbl">Critical</span><span className="sci-val crit">{a.critical}</span><div className="sci-bar"><div className="sci-fill" style={{width:'100%',background:'var(--red)'}} /></div></div>
            </div>
            <div className="sci-note">{a.note}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
