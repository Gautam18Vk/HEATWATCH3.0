// routes/weather.js — Weather endpoints
const express = require('express');
const router = express.Router();
const { getWeather, getWeatherByCity, getMockForecast } = require('../services/weatherService');
const { calculateAllAHSI, getZoneRisk } = require('../services/ahsiCalculator');
const { DELHI_ZONES } = require('../data/animalData');

// GET /api/weather?lat=28.6&lon=77.2
// GET /api/weather?city=New Delhi
router.get('/', async (req, res) => {
  try {
    const { lat, lon, city } = req.query;
    let weather;
    if (lat && lon) {
      weather = await getWeather(parseFloat(lat), parseFloat(lon), city || 'Your Location');
    } else if (city) {
      weather = await getWeatherByCity(city);
    } else {
      weather = await getWeather(
        parseFloat(process.env.DEFAULT_LAT || 28.6139),
        parseFloat(process.env.DEFAULT_LON || 77.2090),
        process.env.DEFAULT_CITY || 'New Delhi'
      );
    }

    // Calculate AHSI for all animals with this weather
    const ahsiAll = calculateAllAHSI({
      temp: weather.temp,
      humidity: weather.humidity,
      windSpeed: weather.windSpeed,
      cloudCover: weather.clouds,
    });

    const forecast = weather.forecast || getMockForecast(weather.temp);

    res.json({
      weather,
      ahsi: ahsiAll,
      zoneRisk: getZoneRisk(ahsiAll),
      forecast,
    });
  } catch (err) {
    console.error('Weather route error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/weather/zones — weather for all Delhi zones
router.get('/zones', async (req, res) => {
  try {
    const zoneData = await Promise.all(
      DELHI_ZONES.map(async (zone) => {
        const weather = await getWeather(zone.lat, zone.lon, zone.name);
        const ahsi = calculateAllAHSI(
          { temp: weather.temp, humidity: weather.humidity, windSpeed: weather.windSpeed },
          { canopyCover: zone.canopyCover }
        );
        return {
          ...zone,
          weather,
          ahsi,
          zoneRisk: getZoneRisk(ahsi),
        };
      })
    );
    res.json({ zones: zoneData, timestamp: Date.now() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
