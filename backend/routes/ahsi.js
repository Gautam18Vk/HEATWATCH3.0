// routes/ahsi.js — AHSI calculation endpoints
const express = require('express');
const router = express.Router();
const { calculateAHSI, calculateAllAHSI } = require('../services/ahsiCalculator');

// POST /api/ahsi/calculate
// Body: { animal, temp, humidity, windSpeed, hasWater, hasShade, canopyCover }
router.post('/calculate', (req, res) => {
  try {
    const { animal = 'all', temp, humidity, windSpeed = 10, hasWater = false, hasShade = false, canopyCover = 0.1 } = req.body;
    if (temp === undefined || humidity === undefined) {
      return res.status(400).json({ error: 'temp and humidity are required' });
    }
    const weather = { temp: parseFloat(temp), humidity: parseFloat(humidity), windSpeed: parseFloat(windSpeed) };
    const exposure = { hasWater, hasShade, canopyCover: parseFloat(canopyCover) };

    if (animal === 'all') {
      return res.json(calculateAllAHSI(weather, exposure));
    }
    res.json(calculateAHSI(animal, weather, exposure));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/ahsi/animals — list all supported animals
router.get('/animals', (req, res) => {
  const { ANIMAL_DATA } = require('../data/animalData');
  const list = Object.entries(ANIMAL_DATA).map(([key, data]) => ({
    key,
    name: data.name,
    icon: data.icon,
    safeTemp: data.safeTemp,
    moderateTemp: data.moderateTemp,
    criticalTemp: data.criticalTemp,
    description: data.description,
  }));
  res.json({ animals: list });
});

module.exports = router;
