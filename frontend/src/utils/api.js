// src/utils/api.js — Centralised API calls to HeatWatch backend
import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE,
  timeout: 10000,
});

// ── Weather ────────────────────────────────────────────────────
export const fetchWeather = ({ lat, lon, city } = {}) => {
  const params = {};
  if (lat && lon) { params.lat = lat; params.lon = lon; }
  if (city) params.city = city;
  return api.get('/weather', { params }).then(r => r.data);
};

export const fetchAllZones = () =>
  api.get('/weather/zones').then(r => r.data);

// ── AHSI ───────────────────────────────────────────────────────
export const calculateAHSI = (body) =>
  api.post('/ahsi/calculate', body).then(r => r.data);

export const fetchAnimals = () =>
  api.get('/ahsi/animals').then(r => r.data);

// ── Reports ────────────────────────────────────────────────────
export const fetchReports = (limit = 50) =>
  api.get('/reports', { params: { limit } }).then(r => r.data);

export const fetchReportStats = () =>
  api.get('/reports/stats').then(r => r.data);

export const submitReport = (reportData) =>
  api.post('/reports', reportData).then(r => r.data);

// ── Alerts ─────────────────────────────────────────────────────
export const fetchAlerts = () =>
  api.get('/alerts').then(r => r.data);

// ── Health ─────────────────────────────────────────────────────
export const healthCheck = () =>
  api.get('/health').then(r => r.data);

export default api;
