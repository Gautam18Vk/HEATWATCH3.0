// ─────────────────────────────────────────────────────────────
// HeatWatch — Weather Service (Open-Meteo)
// 100% FREE · No API key needed · No signup required
// Docs: https://open-meteo.com/en/docs
// ─────────────────────────────────────────────────────────────

const axios = require('axios');

const BASE = 'https://api.open-meteo.com/v1/forecast';
const GEO_BASE = 'https://geocoding-api.open-meteo.com/v1/search';

// WMO weather code → human label + emoji
const WMO_CODES = {
  0:  { label: 'Clear sky',     icon: '☀️' },
  1:  { label: 'Mainly clear',  icon: '🌤' },
  2:  { label: 'Partly cloudy', icon: '⛅' },
  3:  { label: 'Overcast',      icon: '☁️' },
  45: { label: 'Foggy',         icon: '🌫' },
  51: { label: 'Light drizzle', icon: '🌦' },
  61: { label: 'Slight rain',   icon: '🌧' },
  63: { label: 'Moderate rain', icon: '🌧' },
  65: { label: 'Heavy rain',    icon: '🌧' },
  80: { label: 'Rain showers',  icon: '🌦' },
  95: { label: 'Thunderstorm',  icon: '⛈' },
};

function getWMO(code) {
  return WMO_CODES[code] || { label: 'Clear', icon: '🌤' };
}

// Geocode city name using Open-Meteo geocoding API (also free, no key)
async function geocodeCity(cityName) {
  const res = await axios.get(GEO_BASE, {
    params: { name: cityName, count: 1, language: 'en', format: 'json' },
    timeout: 6000,
  });
  const results = res.data.results;
  if (!results || results.length === 0) throw new Error('City not found: ' + cityName);
  const { latitude, longitude, name, country } = results[0];
  return { lat: latitude, lon: longitude, city: name + ', ' + country };
}

// Fetch live weather + 7-day forecast from Open-Meteo
async function fetchFromOpenMeteo(lat, lon, cityName) {
  const res = await axios.get(BASE, {
    params: {
      latitude: lat,
      longitude: lon,
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,cloud_cover,surface_pressure,uv_index,visibility,precipitation',
      daily: 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,uv_index_max,relative_humidity_2m_max,sunrise,sunset',
      timezone: 'Asia/Kolkata',
      forecast_days: 7,
    },
    timeout: 8000,
  });

  const c = res.data.current;
  const d = res.data.daily;
  const wmo = getWMO(c.weather_code);

  const weather = {
    city: cityName || 'Your Location',
    lat, lon,
    temp: Math.round(c.temperature_2m * 10) / 10,
    feelsLike: Math.round(c.apparent_temperature * 10) / 10,
    humidity: c.relative_humidity_2m,
    windSpeed: Math.round(c.wind_speed_10m * 10) / 10,
    windDeg: c.wind_direction_10m,
    pressure: Math.round(c.surface_pressure),
    uvi: c.uv_index || 0,
    clouds: c.cloud_cover,
    visibility: c.visibility ? Math.round(c.visibility / 1000 * 10) / 10 : 10,
    description: wmo.label,
    weatherIcon: wmo.icon,
    precipitation: c.precipitation || 0,
    sunrise: d.sunrise ? d.sunrise[0] : null,
    sunset: d.sunset ? d.sunset[0] : null,
    timestamp: Date.now(),
    source: 'open-meteo',
  };

  const forecast = d.time.map(function(date, i) {
    const dayWmo = getWMO(d.weather_code[i]);
    const dateObj = new Date(date);
    const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dateObj.toLocaleDateString('en-IN', { weekday: 'short' });
    return {
      day: dayLabel,
      date: date,
      icon: dayWmo.icon,
      description: dayWmo.label,
      maxTemp: Math.round(d.temperature_2m_max[i] * 10) / 10,
      minTemp: Math.round(d.temperature_2m_min[i] * 10) / 10,
      humidity: d.relative_humidity_2m_max[i] || 60,
      precipitation: Math.round((d.precipitation_sum[i] || 0) * 10) / 10,
      uvi: d.uv_index_max[i] || 0,
    };
  });

  return { weather, forecast };
}

// Fallback mock data if Open-Meteo is unreachable
function generateMockWeather(lat, lon, city) {
  city = city || 'New Delhi';
  const hour = new Date().getHours();
  const diurnal = Math.sin((hour - 6) * Math.PI / 12);
  const temp = Math.round((38 + diurnal * 6 + (Math.random() * 2 - 1)) * 10) / 10;
  const humidity = Math.round(48 + Math.random() * 20);
  return {
    city: city, lat: lat, lon: lon,
    temp: temp,
    feelsLike: Math.round((temp + humidity * 0.08 + 2) * 10) / 10,
    humidity: humidity,
    windSpeed: Math.round((8 + Math.random() * 14) * 10) / 10,
    windDeg: Math.round(Math.random() * 360),
    pressure: Math.round(995 + Math.random() * 10),
    uvi: hour >= 7 && hour <= 18 ? Math.round(8 + diurnal * 4) : 0,
    clouds: Math.round(Math.random() * 30),
    visibility: Math.round((3 + Math.random() * 6) * 10) / 10,
    description: temp > 40 ? 'Heatwave conditions' : 'Very hot and sunny',
    weatherIcon: temp > 40 ? '🌡' : '☀️',
    precipitation: 0,
    timestamp: Date.now(),
    source: 'mock',
  };
}

function getMockForecast(baseTemp) {
  baseTemp = baseTemp || 40;
  var days = ['Today', 'Tomorrow', 'Day After', 'Thu', 'Fri', 'Sat', 'Sun'];
  var icons = ['☀️', '🌤', '⛅', '🌦', '🌧', '⛅', '☀️'];
  return days.map(function(day, i) {
    return {
      day: day, icon: icons[i],
      maxTemp: Math.round(baseTemp - i * 0.5 + (Math.random() * 2 - 1)),
      minTemp: Math.round(baseTemp - i * 0.5 - 6),
      humidity: Math.round(55 + i * 3),
      precipitation: i >= 3 ? Math.round(Math.random() * 8) : 0,
      uvi: Math.max(0, 10 - i),
      description: icons[i] === '🌧' ? 'Rain showers' : 'Sunny',
    };
  });
}

// ── Public exports ────────────────────────────────────────────

async function getWeather(lat, lon, city) {
  try {
    var result = await fetchFromOpenMeteo(lat, lon, city);
    return Object.assign({}, result.weather, { forecast: result.forecast });
  } catch (err) {
    console.error('Open-Meteo error:', err.message, '- using mock data');
    var mock = generateMockWeather(lat, lon, city);
    return Object.assign({}, mock, { forecast: getMockForecast(mock.temp) });
  }
}

async function getWeatherByCity(cityName) {
  try {
    var loc = await geocodeCity(cityName);
    return await getWeather(loc.lat, loc.lon, loc.city);
  } catch (err) {
    console.error('Geocoding error:', err.message, '- using mock data');
    var mock = generateMockWeather(28.6139, 77.2090, cityName);
    return Object.assign({}, mock, { forecast: getMockForecast(mock.temp) });
  }
}

module.exports = { getWeather, getWeatherByCity, getMockForecast: getMockForecast };
