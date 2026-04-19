# 🌡 HeatWatch — Street Animal Heat Protection System

> Hackathon Project · Environment & Sustainability Domain

Real-time heat stress monitoring for street animals (dogs, cats, cows, birds, monkeys) across Indian cities. Powered by live weather data, intelligent AHSI scoring, and citizen reporting.

---

## 🚀 QUICK START (5 minutes)

### Step 1 — Get a FREE OpenWeatherMap API Key
1. Go to https://openweathermap.org/api
2. Click **Sign Up** (free account)
3. Go to **API Keys** tab → copy your key
4. The free tier allows 60 calls/min — more than enough

### Step 2 — Setup Backend
```bash
cd heatwatch/backend
npm install
cp .env.example .env
```
Open `.env` in any text editor and replace:
```
OPENWEATHER_API_KEY=your_openweathermap_api_key_here
```
with your actual key. Keep everything else as-is.

Then start the backend:
```bash
npm run dev
```
You should see: `🌡 HeatWatch API running on http://localhost:5000`

Test it: open http://localhost:5000/api/health in your browser.

### Step 3 — Setup Frontend (new terminal tab)
```bash
cd heatwatch/frontend
npm install
cp .env.example .env
npm start
```
The site opens at http://localhost:3000

---

## ✅ NO API KEY? NO PROBLEM.

The project works fully without any API keys using realistic mock data.
Just leave `.env` files as-is and run both servers — everything simulates perfectly for the demo.

---

## 🔑 API KEYS EXPLAINED

| Key | Where to get | Cost | Required? |
|-----|-------------|------|-----------|
| OpenWeatherMap | openweathermap.org/api | FREE | Optional — mock data fallback |
| Google Maps | console.cloud.google.com | FREE ($200/mo credit) | Optional — Leaflet map works without it |
| Firebase | console.firebase.google.com | FREE | Optional — in-memory DB fallback |

---

## 🗂 PROJECT STRUCTURE

```
heatwatch/
├── backend/
│   ├── server.js              ← Express server entry point
│   ├── .env.example           ← Copy to .env, add your keys
│   ├── routes/
│   │   ├── weather.js         ← GET /api/weather
│   │   ├── ahsi.js            ← POST /api/ahsi/calculate
│   │   ├── reports.js         ← GET/POST /api/reports
│   │   └── alerts.js          ← GET /api/alerts
│   ├── services/
│   │   ├── weatherService.js  ← OpenWeatherMap + mock fallback
│   │   ├── ahsiCalculator.js  ← Heat stress algorithm
│   │   └── dbService.js       ← Firebase + mock DB
│   └── data/
│       └── animalData.js      ← Scientific thresholds for all animals
│
└── frontend/
    ├── public/index.html
    ├── .env.example           ← Copy to .env
    └── src/
        ├── App.js / App.css
        ├── context/
        │   └── WeatherContext.js  ← Global state, auto-refresh
        ├── utils/
        │   └── api.js             ← All API calls
        └── components/
            ├── Navbar.js          ← Fixed nav with live temp
            ├── Ticker.js          ← Live scrolling alerts
            ├── Hero.js            ← Landing section
            ├── Dashboard.js       ← Main dashboard grid
            ├── WeatherPanel.js    ← Live weather + city search
            ├── AHSIPanel.js       ← Per-animal heat stress index
            ├── MapPanel.js        ← Leaflet map with heat zones
            ├── AHSISection.js     ← Scientific thresholds table
            ├── RecommendationsSection.js
            ├── ReportSection.js   ← Citizen report form + live feed
            ├── AlertsSection.js   ← NGO alert dashboard
            ├── ZoneGrid.js        ← Area-wise risk cards
            ├── ForecastSection.js ← 7-day forecast
            ├── AwarenessSection.js← Public tips by zone
            └── Footer.js
```

---

## 🌐 API ENDPOINTS

```
GET  /api/health              → Server status
GET  /api/weather             → Current weather + AHSI for all animals
GET  /api/weather?city=Mumbai → Weather for specific city
GET  /api/weather?lat=&lon=   → Weather for coordinates
GET  /api/weather/zones       → Weather for all Delhi zones
POST /api/ahsi/calculate      → Calculate AHSI (body: {animal, temp, humidity})
GET  /api/reports             → All citizen reports
POST /api/reports             → Submit new report
GET  /api/alerts              → Active alerts for all zones
```

---

## 🔥 FEATURES

- ✅ Real-time weather via OpenWeatherMap API (mock fallback)
- ✅ AHSI score for 5 animals with scientific THI formula
- ✅ Interactive Leaflet map with coloured heat zones
- ✅ Citizen report form with GPS + photo upload
- ✅ NGO alert dashboard with zone-wise risk
- ✅ 7-day heat risk forecast
- ✅ Auto-refresh every 5 minutes
- ✅ City search + geolocation
- ✅ Firebase Firestore (mock fallback)
- ✅ Fully responsive mobile design

---

## 🆘 EMERGENCY CONTACTS

- Wildlife SOS: 9871963535
- SPCA Delhi: 011-2338-0110
- PETA India: 98201-22602
