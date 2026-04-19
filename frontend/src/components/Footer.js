// src/components/Footer.js
import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-logo">🌡 Heat<span>Watch</span></div>
        <p>Street Animal Heat Protection System · Environment & Sustainability Hackathon 2025</p>
        <p style={{ fontSize: 12, marginTop: 6 }}>
          Built with ❤️ for street animals of India ·
          Powered by OpenWeatherMap + Firebase + React
        </p>
        <div className="footer-links">
          <a href="#dashboard">Dashboard</a>
          <a href="#ahsi-section">Heat Index</a>
          <a href="#report">Report</a>
          <a href="#awareness">Awareness</a>
        </div>
        <div className="footer-emergency">
          🆘 Animal Emergency? Call <strong>Wildlife SOS: 9871963535</strong> · <strong>SPCA Delhi: 011-2338-0110</strong>
        </div>
      </div>
    </footer>
  );
}
