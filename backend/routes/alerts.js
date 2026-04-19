// routes/alerts.js — Auto-generated alert endpoints
const express = require('express');
const router = express.Router();
const { getWeather } = require('../services/weatherService');
const { calculateAllAHSI, getZoneRisk } = require('../services/ahsiCalculator');
const { DELHI_ZONES } = require('../data/animalData');
const { getReportStats } = require('../services/dbService');

// GET /api/alerts — Get active alerts for all zones
router.get('/', async (req, res) => {
  try {
    const stats = await getReportStats();
    const alerts = [];

    // Generate alerts for each zone based on weather + reports
    for (const zone of DELHI_ZONES) {
      const weather = await getWeather(zone.lat, zone.lon, zone.name);
      const ahsi = calculateAllAHSI(
        { temp: weather.temp, humidity: weather.humidity, windSpeed: weather.windSpeed },
        { canopyCover: zone.canopyCover }
      );
      const risk = getZoneRisk(ahsi);
      const criticalAnimals = Object.entries(ahsi)
        .filter(([, data]) => data.riskLevel === 'critical')
        .map(([, data]) => data.animalIcon + ' ' + data.animalName);

      if (risk !== 'safe') {
        alerts.push({
          id: `ALERT-${zone.id.toUpperCase()}`,
          zone: zone.name,
          area: zone.area,
          risk,
          temp: weather.temp,
          humidity: weather.humidity,
          criticalAnimals,
          message: generateAlertMessage(zone.name, risk, criticalAnimals, weather.temp),
          actions: getAlertActions(risk),
          timestamp: Date.now(),
        });
      }
    }

    // Sort: critical first
    alerts.sort((a, b) => (a.risk === 'critical' ? -1 : 1));
    res.json({ alerts, stats, count: alerts.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function generateAlertMessage(zone, risk, animals, temp) {
  if (risk === 'critical') {
    return `🚨 HIGH HEAT RISK in ${zone} — Temperature ${temp}°C. ${animals.join(', ')} at critical risk. Immediate ground response required.`;
  }
  return `⚠️ MODERATE HEAT RISK in ${zone} — Temperature ${temp}°C. Monitor ${animals.join(', ')}. Preventive action advised.`;
}

function getAlertActions(risk) {
  if (risk === 'critical') {
    return ['Deploy water bowls immediately', 'Set up shade structures', 'Alert Wildlife SOS (9871963535)', 'Send rescue van to zone'];
  }
  return ['Place water bowls', 'Increase monitoring frequency', 'Alert nearby volunteers'];
}

module.exports = router;
