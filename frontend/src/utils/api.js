// ─────────────────────────────────────────────────────────────
// HeatWatch — API Utility
// Tries backend first, falls back to direct Open-Meteo calls
// This way it works on Vercel WITHOUT a backend server
// ─────────────────────────────────────────────────────────────

import axios from 'axios';

const BACKEND = process.env.REACT_APP_API_URL || '';
const OPEN_METEO = 'https://api.open-meteo.com/v1/forecast';
const GEO_API = 'https://geocoding-api.open-meteo.com/v1/search';

// Delhi NCR zones with coordinates
export const DELHI_ZONES = [
  { id: 'cp',       name: 'Connaught Place', area: 'Central Delhi',     lat: 28.6315, lon: 77.2167, canopy: 0.08 },
  { id: 'rohini',   name: 'Rohini Sector 9', area: 'North Delhi',       lat: 28.7396, lon: 77.0594, canopy: 0.12 },
  { id: 'noida18',  name: 'Noida Sector 18', area: 'East Delhi / NCR',  lat: 28.5706, lon: 77.3231, canopy: 0.15 },
  { id: 'dwarka',   name: 'Dwarka Sector 6', area: 'West Delhi',        lat: 28.5921, lon: 77.0458, canopy: 0.20 },
  { id: 'sanjay',   name: 'Sanjay Van',      area: 'South Delhi',       lat: 28.5700, lon: 77.1800, canopy: 0.65 },
  { id: 'ridge',    name: 'Ridge Forest',    area: 'North-West Delhi',  lat: 28.6800, lon: 77.1400, canopy: 0.72 },
];

const WMO = {
  0:'☀️',1:'🌤',2:'⛅',3:'☁️',45:'🌫',51:'🌦',61:'🌧',63:'🌧',65:'🌧',80:'🌦',95:'⛈'
};
function wmoIcon(code) { return WMO[code] || '🌤'; }
function wmoLabel(code) {
  const labels = {0:'Clear sky',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',
    45:'Foggy',51:'Drizzle',61:'Light rain',63:'Moderate rain',65:'Heavy rain',80:'Showers',95:'Thunderstorm'};
  return labels[code] || 'Clear';
}

// ── AHSI Calculation (matches backend logic) ─────────────────
const ANIMAL_THRESHOLDS = {
  dog:    { safe:32, moderate:38, critical:41, humW:0.6, coat:0.4, thi:72 },
  cat:    { safe:33, moderate:39, critical:42, humW:0.5, coat:0.3, thi:75 },
  cow:    { safe:24, moderate:32, critical:40, humW:0.8, coat:0.5, thi:68 },
  bird:   { safe:30, moderate:34, critical:38, humW:0.9, coat:0.1, thi:65 },
  monkey: { safe:35, moderate:37, critical:40, humW:0.5, coat:0.3, thi:78 },
};
const ANIMAL_META = {
  dog:    { icon:'🐕', name:'Street Dog' },
  cat:    { icon:'🐱', name:'Street Cat' },
  cow:    { icon:'🐄', name:'Cow / Bull' },
  bird:   { icon:'🐦', name:'Birds' },
  monkey: { icon:'🐒', name:'Monkey' },
};

function calcTHI(temp, hum) {
  return temp - (0.55 - 0.55 * hum / 100) * (temp - 14.5);
}

function calcAHSI(animalKey, temp, hum, windSpeed = 10, canopy = 0.1) {
  const a = ANIMAL_THRESHOLDS[animalKey];
  const meta = ANIMAL_META[animalKey];

  // Temperature score (0-70)
  let tempScore = 0;
  if (temp > a.safe && temp <= a.moderate) {
    tempScore = ((temp - a.safe) / (a.moderate - a.safe)) * 40;
  } else if (temp > a.moderate) {
    tempScore = 40 + Math.min(30, ((temp - a.moderate) / (a.critical - a.moderate)) * 30);
  }

  // Humidity score (0-20)
  const humScore = hum > 50 ? a.humW * ((hum - 50) / 50) * 20 : 0;

  // Exposure score (0-15)
  let expScore = 10;
  if (canopy > 0.3) expScore -= 3;
  if (windSpeed > 15) expScore -= 2;
  expScore = Math.max(0, expScore);

  // Coat score (0-10)
  const coatScore = a.coat * ((temp - a.safe) / a.critical) * 10;

  // THI bonus (0-15)
  const thi = calcTHI(temp, hum);
  const thiBonus = thi > a.thi ? Math.min(15, (thi - a.thi) * 1.5) : 0;

  const score = Math.min(100, Math.max(0, Math.round(tempScore + humScore + expScore + coatScore + thiBonus)));
  const level = score > 70 ? 'critical' : score > 40 ? 'moderate' : 'safe';

  return {
    animal: animalKey,
    animalName: meta.name,
    animalIcon: meta.icon,
    score, riskLevel: level,
    riskLabel: level === 'critical' ? 'Critical Risk' : level === 'moderate' ? 'Moderate Risk' : 'Safe',
    riskColor: level === 'critical' ? '#ff3b5c' : level === 'moderate' ? '#ffb800' : '#10d97a',
    thresholds: { safe: a.safe, moderate: a.moderate, critical: a.critical },
    breakdown: {
      temperatureScore: Math.round(tempScore),
      humidityScore: Math.round(humScore),
      exposureScore: Math.round(expScore),
      thiBonus: Math.round(thiBonus),
      thi: Math.round(thi * 10) / 10,
      heatIndex: Math.round((temp + hum * 0.06 + 2) * 10) / 10,
    },
    immediateActions: level === 'critical'
      ? ['Place water bowls every 200m immediately', 'Create shade with tarpaulin', 'Alert Wildlife SOS: 9871963535']
      : ['Keep water available', 'Monitor animal behaviour'],
  };
}

function calcAllAHSI(temp, hum, windSpeed, canopy) {
  return Object.keys(ANIMAL_THRESHOLDS).reduce((acc, key) => {
    acc[key] = calcAHSI(key, temp, hum, windSpeed, canopy);
    return acc;
  }, {});
}

function getZoneRisk(ahsi) {
  const scores = Object.values(ahsi).map(a => a.score);
  const critCount = scores.filter(s => s > 70).length;
  const max = Math.max(...scores);
  if (critCount >= 3 || max >= 85) return 'critical';
  if (critCount >= 1 || max >= 55) return 'moderate';
  return 'safe';
}

// ── Direct Open-Meteo fetch (no backend needed) ───────────────
async function fetchOpenMeteo(lat, lon) {
  const res = await axios.get(OPEN_METEO, {
    params: {
      latitude: lat, longitude: lon,
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,cloud_cover,uv_index,visibility,precipitation',
      daily: 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,relative_humidity_2m_max,uv_index_max,sunrise,sunset',
      timezone: 'Asia/Kolkata',
      forecast_days: 7,
    },
    timeout: 8000,
  });
  return res.data;
}

// ── Public API functions ──────────────────────────────────────

/**
 * Fetch weather for a lat/lon — tries backend, falls back to Open-Meteo directly
 */
export async function fetchWeather({ lat = 28.6139, lon = 77.2090, city = 'New Delhi' } = {}) {
  // Try backend first
  if (BACKEND) {
    try {
      const r = await axios.get(`${BACKEND}/weather`, { params: { lat, lon, city }, timeout: 5000 });
      return r.data;
    } catch (_) { /* fall through to direct */ }
  }

  // Direct Open-Meteo call (works on Vercel without backend)
  const data = await fetchOpenMeteo(lat, lon);
  const c = data.current;
  const d = data.daily;

  const weather = {
    city, lat, lon,
    temp: Math.round(c.temperature_2m * 10) / 10,
    feelsLike: Math.round(c.apparent_temperature * 10) / 10,
    humidity: c.relative_humidity_2m,
    windSpeed: Math.round(c.wind_speed_10m * 10) / 10,
    uvi: c.uv_index || 0,
    clouds: c.cloud_cover,
    visibility: c.visibility ? Math.round(c.visibility / 1000 * 10) / 10 : 10,
    description: wmoLabel(c.weather_code),
    weatherIcon: wmoIcon(c.weather_code),
    precipitation: c.precipitation || 0,
    sunrise: d.sunrise?.[0] || null,
    sunset: d.sunset?.[0] || null,
    timestamp: Date.now(),
    source: 'open-meteo',
  };

  const ahsi = calcAllAHSI(weather.temp, weather.humidity, weather.windSpeed, 0.1);
  const zoneRisk = getZoneRisk(ahsi);

  const forecast = d.time.map((date, i) => ({
    day: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : new Date(date).toLocaleDateString('en-IN', { weekday: 'short' }),
    icon: wmoIcon(d.weather_code[i]),
    description: wmoLabel(d.weather_code[i]),
    maxTemp: Math.round(d.temperature_2m_max[i] * 10) / 10,
    minTemp: Math.round(d.temperature_2m_min[i] * 10) / 10,
    humidity: d.relative_humidity_2m_max[i] || 60,
    precipitation: Math.round((d.precipitation_sum[i] || 0) * 10) / 10,
    uvi: d.uv_index_max[i] || 0,
  }));

  return { weather, ahsi, zoneRisk, forecast };
}

/**
 * Fetch all zones directly from Open-Meteo — works on Vercel
 */
export async function fetchAllZones() {
  // Try backend first
  if (BACKEND) {
    try {
      const r = await axios.get(`${BACKEND}/weather/zones`, { timeout: 5000 });
      return r.data;
    } catch (_) { /* fall through */ }
  }

  // Fetch all 6 zones in parallel directly from Open-Meteo
  const zoneResults = await Promise.all(
    DELHI_ZONES.map(async (zone) => {
      try {
        const data = await fetchOpenMeteo(zone.lat, zone.lon);
        const c = data.current;
        const weather = {
          temp: Math.round(c.temperature_2m * 10) / 10,
          feelsLike: Math.round(c.apparent_temperature * 10) / 10,
          humidity: c.relative_humidity_2m,
          windSpeed: Math.round(c.wind_speed_10m * 10) / 10,
          description: wmoLabel(c.weather_code),
          weatherIcon: wmoIcon(c.weather_code),
          source: 'open-meteo',
        };
        const ahsi = calcAllAHSI(weather.temp, weather.humidity, weather.windSpeed, zone.canopy);
        const zoneRisk = getZoneRisk(ahsi);
        return { ...zone, weather, ahsi, zoneRisk };
      } catch (_) {
        // individual zone fallback
        return { ...zone, weather: { temp: 38, humidity: 55 }, ahsi: {}, zoneRisk: 'moderate' };
      }
    })
  );

  return { zones: zoneResults };
}

/**
 * Generate alerts from zone data
 */
export function generateAlertsFromZones(zones) {
  return zones
    .filter(z => z.zoneRisk !== 'safe')
    .map(z => {
      const critAnimals = z.ahsi
        ? Object.values(z.ahsi).filter(a => a.riskLevel === 'critical').map(a => `${a.animalIcon} ${a.animalName}`)
        : [];
      return {
        id: `ALERT-${z.id?.toUpperCase()}`,
        zone: z.name,
        area: z.area,
        risk: z.zoneRisk,
        temp: z.weather?.temp,
        humidity: z.weather?.humidity,
        criticalAnimals: critAnimals,
        message: z.zoneRisk === 'critical'
          ? `🚨 HIGH HEAT RISK in ${z.name} — ${z.weather?.temp}°C. Immediate ground response required.`
          : `⚠️ MODERATE HEAT RISK in ${z.name} — ${z.weather?.temp}°C. Preventive action advised.`,
        actions: z.zoneRisk === 'critical'
          ? ['Deploy water bowls immediately', 'Set up shade structures', 'Alert Wildlife SOS (9871963535)', 'Send rescue van to zone']
          : ['Place water bowls', 'Increase monitoring frequency', 'Alert nearby volunteers'],
        timestamp: Date.now(),
      };
    })
    .sort((a, b) => (a.risk === 'critical' ? -1 : 1));
}

/**
 * Fetch reports from backend (or return mock if no backend)
 */
export async function fetchReports(limit = 50) {
  if (BACKEND) {
    try {
      const r = await axios.get(`${BACKEND}/reports`, { params: { limit }, timeout: 5000 });
      return r.data;
    } catch (_) {}
  }
  return { reports: MOCK_REPORTS, count: MOCK_REPORTS.length };
}

export async function fetchReportStats() {
  if (BACKEND) {
    try {
      const r = await axios.get(`${BACKEND}/reports/stats`, { timeout: 5000 });
      return r.data;
    } catch (_) {}
  }
  return { last24h: 47, critical: 12, moderate: 23, total: 47, byAnimal: { dog: 18, cat: 9, bird: 12, cow: 6, monkey: 2 } };
}

export async function submitReport(reportData) {
  if (BACKEND) {
    try {
      const r = await axios.post(`${BACKEND}/reports`, reportData, { timeout: 5000 });
      return r.data;
    } catch (_) {}
  }
  // Mock submit — still works on Vercel
  const id = 'RPT-' + Math.floor(Math.random() * 900 + 100);
  return { success: true, report: { id, ...reportData, timestamp: Date.now(), verified: false } };
}

export async function fetchAlerts() {
  if (BACKEND) {
    try {
      const r = await axios.get(`${BACKEND}/alerts`, { timeout: 5000 });
      return r.data;
    } catch (_) {}
  }
  // Generate live alerts from Open-Meteo zone data
  const { zones } = await fetchAllZones();
  const alerts = generateAlertsFromZones(zones);
  return { alerts, count: alerts.length };
}

export async function healthCheck() {
  if (!BACKEND) return { status: 'frontend-only' };
  try {
    const r = await axios.get(`${BACKEND}/health`, { timeout: 3000 });
    return r.data;
  } catch (_) {
    return { status: 'offline' };
  }
}

// Mock reports for when backend is offline
const MOCK_REPORTS = [
  { id:'RPT-001', animal:'dog', animalLabel:'🐕 Dog', location:'Connaught Place, Block B', lat:28.6315, lon:77.2167, severity:'critical', count:3, description:'Dogs panting heavily near CP metro exit.', reportedBy:'Priya S.', timestamp: Date.now()-480000, verified:true },
  { id:'RPT-002', animal:'bird', animalLabel:'🐦 Birds', location:'Rohini Sector 9', lat:28.7396, lon:77.0594, severity:'critical', count:12, description:'Pigeons found collapsed near empty water pot.', reportedBy:'Rajesh K.', timestamp: Date.now()-1320000, verified:true },
  { id:'RPT-003', animal:'cat', animalLabel:'🐱 Cat', location:'Karol Bagh Market', lat:28.6500, lon:77.1900, severity:'moderate', count:1, description:'Cat hiding under vegetable cart, excessive drooling.', reportedBy:'Anonymous', timestamp: Date.now()-2100000, verified:false },
  { id:'RPT-004', animal:'cow', animalLabel:'🐄 Cow', location:'Dwarka Sector 6', lat:28.5921, lon:77.0458, severity:'moderate', count:2, description:'Two cows standing in open sun, no shade.', reportedBy:'Meena D.', timestamp: Date.now()-2880000, verified:true },
  { id:'RPT-005', animal:'dog', animalLabel:'🐕 Dog', location:'Lajpat Nagar', lat:28.5700, lon:77.2400, severity:'safe', count:4, description:'Dogs near park. Water bowl available.', reportedBy:'Amit G.', timestamp: Date.now()-4200000, verified:true },
];

export default { fetchWeather, fetchAllZones, fetchAlerts, fetchReports, fetchReportStats, submitReport, healthCheck };
