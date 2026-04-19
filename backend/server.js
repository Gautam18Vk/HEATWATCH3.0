// ─────────────────────────────────────────────────────────────
// HeatWatch Backend — server.js
// Express API server for weather, AHSI calculation, and reports
// ─────────────────────────────────────────────────────────────

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const weatherRoutes = require('./routes/weather');
const ahsiRoutes = require('./routes/ahsi');
const reportRoutes = require('./routes/reports');
const alertRoutes = require('./routes/alerts');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Request logger ────────────────────────────────────────────
app.use((req, res, next) => {
  const time = new Date().toLocaleTimeString('en-IN');
  console.log(`[${time}] ${req.method} ${req.path}`);
  next();
});

// ── Routes ────────────────────────────────────────────────────
app.use('/api/weather', weatherRoutes);
app.use('/api/ahsi',    ahsiRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/alerts',  alertRoutes);

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'HeatWatch API is running 🌡',
    timestamp: new Date().toISOString(),
    env: {
      weatherApi: !!process.env.OPENWEATHER_API_KEY && process.env.OPENWEATHER_API_KEY !== 'your_openweathermap_api_key_here',
      firebase: process.env.USE_MOCK_DB !== 'true',
    }
  });
});

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Error handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`\n🌡  HeatWatch API running on http://localhost:${PORT}`);
  console.log(`📊  Health check: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
