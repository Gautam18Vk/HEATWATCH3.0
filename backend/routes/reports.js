// routes/reports.js — Citizen report endpoints
const express = require('express');
const router = express.Router();
const { getAllReports, addReport, getReportsByZone, getReportStats } = require('../services/dbService');

// GET /api/reports
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const reports = await getAllReports(limit);
    res.json({ reports, count: reports.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await getReportStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/zone?lat=28.6&lon=77.2&radius=2
router.get('/zone', async (req, res) => {
  try {
    const { lat, lon, radius = 2 } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' });
    const reports = await getReportsByZone(parseFloat(lat), parseFloat(lon), parseFloat(radius));
    res.json({ reports, count: reports.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reports — Submit new report
router.post('/', async (req, res) => {
  try {
    const { animal, animalLabel, location, lat, lon, severity, count, description, reportedBy } = req.body;
    if (!animal || !location || !severity) {
      return res.status(400).json({ error: 'animal, location, and severity are required' });
    }
    const validSeverities = ['critical', 'moderate', 'safe'];
    if (!validSeverities.includes(severity)) {
      return res.status(400).json({ error: 'severity must be critical, moderate, or safe' });
    }
    const report = await addReport({
      animal, animalLabel: animalLabel || animal,
      location, lat: lat ? parseFloat(lat) : null,
      lon: lon ? parseFloat(lon) : null,
      severity, count: parseInt(count) || 1,
      description: description || '',
      reportedBy: reportedBy || 'Anonymous',
    });
    res.status(201).json({ success: true, report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
