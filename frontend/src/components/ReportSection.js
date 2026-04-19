// src/components/ReportSection.js
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { submitReport } from '../utils/api';
import { useWeather } from '../context/WeatherContext';
import './ReportSection.css';

const ANIMALS = [
  { value: 'dog', label: '🐕 Dog' },
  { value: 'cat', label: '🐱 Cat' },
  { value: 'cow', label: '🐄 Cow' },
  { value: 'bird', label: '🐦 Bird' },
  { value: 'monkey', label: '🐒 Monkey' },
  { value: 'bull', label: '🐂 Bull' },
  { value: 'other', label: '🐾 Other' },
];

const SEVERITY_COLORS = { critical: '#ef4444', moderate: '#f59e0b', safe: '#22c55e' };

export default function ReportSection() {
  const { reports, loadReports } = useWeather();
  const [form, setForm] = useState({
    animal: 'dog', location: '', severity: 'critical',
    count: 1, description: '', reportedBy: '',
  });
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleLocate = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        set('location', `GPS: ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
        set('lat', lat); set('lon', lon);
        toast.success('📡 Location captured!');
      },
      () => toast.error('Could not get location')
    );
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) { setFileName(file.name); toast.success('📸 Photo attached!'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.location.trim()) return toast.error('Please enter a location');
    setSubmitting(true);
    try {
      const result = await submitReport({
        animal: form.animal,
        animalLabel: ANIMALS.find(a => a.value === form.animal)?.label || form.animal,
        location: form.location,
        lat: form.lat || null,
        lon: form.lon || null,
        severity: form.severity,
        count: form.count,
        description: form.description,
        reportedBy: form.reportedBy || 'Anonymous',
      });
      toast.success(`✅ Report ${result.report?.id} submitted & added to map!`);
      setForm({ animal: 'dog', location: '', severity: 'critical', count: 1, description: '', reportedBy: '' });
      setFileName('');
      await loadReports();
    } catch (err) {
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section" id="report">
      <div className="section-tag">📍 Citizen Reporting</div>
      <h2 className="section-title">
        Report a Distressed Animal
        <span className="report-count-badge">{reports.length}</span>
      </h2>
      <p className="section-sub">
        Your report is geo-stamped, timestamped, and added to the live map instantly for NGO response.
      </p>

      <div className="report-layout">
        {/* Form */}
        <div className="card report-form-card">
          <form onSubmit={handleSubmit}>
            <div className="report-grid">
              <div className="form-group">
                <label>Animal Type</label>
                <select value={form.animal} onChange={e => set('animal', e.target.value)}>
                  {ANIMALS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Location / Area</label>
                <div className="location-input-row">
                  <input
                    type="text"
                    value={form.location}
                    onChange={e => set('location', e.target.value)}
                    placeholder="e.g. Connaught Place, Block A"
                    required
                  />
                  <button type="button" className="locate-btn" onClick={handleLocate} title="Use GPS">📡</button>
                </div>
              </div>
              <div className="form-group">
                <label>Severity</label>
                <select value={form.severity} onChange={e => set('severity', e.target.value)}>
                  <option value="critical">🔴 Critical – Immediate help needed</option>
                  <option value="moderate">🟡 Moderate – Showing heat stress</option>
                  <option value="safe">🟢 Low – Precautionary report</option>
                </select>
              </div>
              <div className="form-group">
                <label>Number of Animals</label>
                <input type="number" min="1" value={form.count} onChange={e => set('count', parseInt(e.target.value))} />
              </div>
              <div className="form-group full-col">
                <label>What did you observe?</label>
                <textarea
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Describe the animal's condition, behaviour, surroundings..."
                />
              </div>
              <div className="form-group">
                <label>Photo (Optional)</label>
                <div className="upload-zone" onClick={() => document.getElementById('photo-upload').click()}>
                  <input id="photo-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
                  <div className="upload-icon-big">📸</div>
                  <div className="upload-text">{fileName || 'Click to upload photo'}</div>
                  <div className="upload-sub">JPG, PNG up to 10MB</div>
                </div>
              </div>
              <div className="form-group">
                <label>Your Name (Optional)</label>
                <input type="text" value={form.reportedBy} onChange={e => set('reportedBy', e.target.value)} placeholder="Anonymous" />
                <div className="form-note">Reports are anonymous by default. Shared with NGOs only.</div>
              </div>
            </div>

            <div className="report-actions">
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? '⏳ Submitting...' : '📍 Submit & Add to Map'}
              </button>
              <button type="button" className="btn-outline" onClick={handleLocate}>
                📡 Use My GPS Location
              </button>
            </div>
          </form>
        </div>

        {/* Recent Reports */}
        <div className="recent-reports">
          <div className="card-title" style={{ marginBottom: 12 }}>📋 Live Report Feed</div>
          {reports.length === 0 ? (
            <div style={{ color: 'var(--text3)', fontSize: 13 }}>No reports yet.</div>
          ) : (
            reports.slice(0, 10).map(r => (
              <div
                key={r.id}
                className="report-item fade-in"
                style={{ borderLeftColor: SEVERITY_COLORS[r.severity] || '#888' }}
              >
                <div className="report-item-icon">
                  {ANIMALS.find(a => a.value === r.animal)?.label?.split(' ')[0] || '🐾'}
                </div>
                <div className="report-item-body">
                  <div className="report-item-title">
                    {r.animalLabel || r.animal} · {r.location}
                  </div>
                  <div className="report-item-meta">
                    {r.count} animal{r.count > 1 ? 's' : ''} ·{' '}
                    {new Date(r.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    {r.verified && <span className="verified-tag">✓ Verified</span>}
                  </div>
                </div>
                <div className={`risk-badge risk-${r.severity} report-badge`}>
                  {r.severity?.toUpperCase()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
