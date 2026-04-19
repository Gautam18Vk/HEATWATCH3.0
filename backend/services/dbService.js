// ─────────────────────────────────────────────────────────────
// HeatWatch — Database Service
// Uses Firebase Firestore if configured, otherwise in-memory mock
// ─────────────────────────────────────────────────────────────

const USE_MOCK = process.env.USE_MOCK_DB === 'true' || !process.env.FIREBASE_PROJECT_ID;

// ── In-memory mock store ──────────────────────────────────────
let mockReports = [
  {
    id: 'RPT-001', animal: 'dog', animalLabel: '🐕 Dog', location: 'Connaught Place, Block B',
    lat: 28.6315, lon: 77.2167, severity: 'critical', count: 3,
    description: 'Multiple dogs panting heavily near CP metro exit. No water source nearby.',
    reportedBy: 'Priya S.', timestamp: Date.now() - 1000 * 60 * 8, verified: true,
  },
  {
    id: 'RPT-002', animal: 'bird', animalLabel: '🐦 Birds', location: 'Rohini Sector 9',
    lat: 28.7396, lon: 77.0594, severity: 'critical', count: 12,
    description: 'Pigeons found collapsed near empty water pot. Severe dehydration.',
    reportedBy: 'Rajesh K.', timestamp: Date.now() - 1000 * 60 * 22, verified: true,
  },
  {
    id: 'RPT-003', animal: 'cat', animalLabel: '🐱 Cat', location: 'Karol Bagh Market',
    lat: 28.6500, lon: 77.1900, severity: 'moderate', count: 1,
    description: 'Cat hiding under vegetable cart, excessive drooling.',
    reportedBy: 'Anonymous', timestamp: Date.now() - 1000 * 60 * 35, verified: false,
  },
  {
    id: 'RPT-004', animal: 'cow', animalLabel: '🐄 Cow', location: 'Dwarka Sector 6',
    lat: 28.5921, lon: 77.0458, severity: 'moderate', count: 2,
    description: 'Two cows standing in open sun, no shade, last water source was 3 hours ago.',
    reportedBy: 'Meena D.', timestamp: Date.now() - 1000 * 60 * 48, verified: true,
  },
  {
    id: 'RPT-005', animal: 'dog', animalLabel: '🐕 Dog', location: 'Lajpat Nagar',
    lat: 28.5700, lon: 77.2400, severity: 'safe', count: 4,
    description: 'Pack of dogs near Lajpat Nagar park. Water bowl available. Precautionary report.',
    reportedBy: 'Amit G.', timestamp: Date.now() - 1000 * 60 * 70, verified: true,
  },
];

let reportIdCounter = 6;

// ── Firebase setup (only if configured) ──────────────────────
let db = null;
if (!USE_MOCK) {
  try {
    const admin = require('firebase-admin');
    const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json');
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    }
    db = admin.firestore();
    console.log('✅ Firebase Firestore connected');
  } catch (err) {
    console.error('Firebase init error:', err.message);
    console.log('⚠️  Falling back to in-memory store');
  }
}

// ── Public API ────────────────────────────────────────────────

async function getAllReports(limit = 50) {
  if (db) {
    const snap = await db.collection('reports')
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
  return mockReports.slice(0, limit);
}

async function addReport(reportData) {
  const id = 'RPT-' + String(reportIdCounter++).padStart(3, '0');
  const report = {
    id,
    ...reportData,
    timestamp: Date.now(),
    verified: false,
  };

  if (db) {
    await db.collection('reports').doc(id).set(report);
  } else {
    mockReports.unshift(report);
    if (mockReports.length > 200) mockReports = mockReports.slice(0, 200);
  }
  return report;
}

async function getReportsByZone(lat, lon, radiusKm = 2) {
  const reports = await getAllReports(100);
  return reports.filter(r => {
    if (!r.lat || !r.lon) return false;
    const dist = haversine(lat, lon, r.lat, r.lon);
    return dist <= radiusKm;
  });
}

async function getReportStats() {
  const reports = await getAllReports(200);
  const now = Date.now();
  const last24h = reports.filter(r => now - r.timestamp < 86400000);
  return {
    total: reports.length,
    last24h: last24h.length,
    critical: last24h.filter(r => r.severity === 'critical').length,
    moderate: last24h.filter(r => r.severity === 'moderate').length,
    byAnimal: last24h.reduce((acc, r) => {
      acc[r.animal] = (acc[r.animal] || 0) + 1;
      return acc;
    }, {}),
  };
}

// Haversine distance formula (km)
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

module.exports = { getAllReports, addReport, getReportsByZone, getReportStats };
