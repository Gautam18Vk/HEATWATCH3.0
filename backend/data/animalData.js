// ─────────────────────────────────────────────────────────────
// HeatWatch — Animal Heat Stress Data & Thresholds
// Scientific thresholds based on veterinary research for
// street animals in Indian urban environments
// ─────────────────────────────────────────────────────────────

const ANIMAL_DATA = {
  dog: {
    name: 'Street Dog',
    icon: '🐕',
    // Thermoregulation: sweats only through paws + panting
    safeTemp: 32,        // °C — Below this is safe
    moderateTemp: 38,    // °C — Moderate risk starts here
    criticalTemp: 41,    // °C — Critical core body temp
    // Humidity multiplier: dogs are heavily affected by humidity
    humidityWeight: 0.6,
    // Base coat insulation factor (0=short, 1=thick)
    coatFactor: 0.4,
    // Critical THI (Temperature Humidity Index) threshold
    criticalTHI: 72,
    waterNeedLiters: 0.5, // per day per animal in heat
    description: 'Sweats only through paws. Panting is primary cooling. Brachycephalic breeds at extreme risk above 38°C.',
    immediateActions: [
      'Place water bowl every 200m in area',
      'Create shade with tarpaulin or cloth',
      'Alert Wildlife SOS: 9871963535',
      'Wet paws and belly — never pour cold water on full body'
    ]
  },
  cat: {
    name: 'Street Cat',
    icon: '🐱',
    safeTemp: 33,
    moderateTemp: 39,
    criticalTemp: 42,
    humidityWeight: 0.5,
    coatFactor: 0.3,
    criticalTHI: 75,
    waterNeedLiters: 0.2,
    description: 'Grooms with saliva to cool. Dehydrate faster than dogs. Seek dark enclosed spaces in heat.',
    immediateActions: [
      'Place shallow water trays near bushes',
      'Leave gaps under walls for access to shade',
      'Provide wet food — increases hydration',
      'Check under car hoods before starting engine'
    ]
  },
  cow: {
    name: 'Street Cow / Bull',
    icon: '🐄',
    safeTemp: 24,
    moderateTemp: 32,
    criticalTemp: 40,
    humidityWeight: 0.8, // Cows are very humidity sensitive
    coatFactor: 0.5,
    criticalTHI: 68,     // Lower THI threshold — cows stressed at lower values
    waterNeedLiters: 60, // Cows need up to 60L/day in heat
    description: 'THI (Temp-Humidity Index) >72 causes measurable heat stress. Black coats absorb 15–20% more solar radiation.',
    immediateActions: [
      'Provide large trough with 60L+ of water',
      'Block direct afternoon sun — use shade net',
      'Sprinkle water on body — evaporative cooling',
      'Contact Gaushala / municipal cattle shelter'
    ]
  },
  bird: {
    name: 'Birds (Sparrows, Pigeons, Crows)',
    icon: '🐦',
    safeTemp: 30,
    moderateTemp: 34,
    criticalTemp: 38,
    humidityWeight: 0.9, // Extremely sensitive
    coatFactor: 0.1,
    criticalTHI: 65,
    waterNeedLiters: 0.05,
    description: 'Extremely high surface-area-to-volume ratio. Can dehydrate critically in 20–30 mins. Panting only cooling mechanism.',
    immediateActions: [
      'Place water in elevated bowls near trees',
      'Use wide shallow dishes — 2–3cm depth',
      'Change water every 2 hours to prevent heating',
      'Leave wet cloth strips for birds to perch on'
    ]
  },
  monkey: {
    name: 'Rhesus Macaque (Monkey)',
    icon: '🐒',
    safeTemp: 35,
    moderateTemp: 37,
    criticalTemp: 40,
    humidityWeight: 0.5,
    coatFactor: 0.3,
    criticalTHI: 78,
    waterNeedLiters: 1.5,
    description: 'Behaviourally thermoregulate by seeking shade. Urban groups lack tree access. Social conflict rises in heat stress.',
    immediateActions: [
      'Place water sources near trees / elevated areas',
      'Avoid feeding in direct sun — they will wait',
      'Do not corner or trap — stress worsens heat impact',
      'Alert forest department if troop in distress'
    ]
  }
};

// Risk level thresholds for AHSI score
const RISK_LEVELS = {
  safe: { min: 0, max: 40, label: 'Safe', color: '#22c55e', emoji: '🟢' },
  moderate: { min: 41, max: 70, label: 'Moderate Risk', color: '#f59e0b', emoji: '🟡' },
  critical: { min: 71, max: 100, label: 'Critical Risk', color: '#ef4444', emoji: '🔴' }
};

// Delhi zones with base coordinates
const DELHI_ZONES = [
  { id: 'cp', name: 'Connaught Place', area: 'Central Delhi', lat: 28.6315, lon: 77.2167, canopyCover: 0.08 },
  { id: 'rohini', name: 'Rohini Sector 9', area: 'North Delhi', lat: 28.7396, lon: 77.0594, canopyCover: 0.12 },
  { id: 'noida18', name: 'Noida Sector 18', area: 'East Delhi / NCR', lat: 28.5706, lon: 77.3231, canopyCover: 0.15 },
  { id: 'dwarka', name: 'Dwarka Sector 6', area: 'West Delhi', lat: 28.5921, lon: 77.0458, canopyCover: 0.20 },
  { id: 'sanjayvan', name: 'Sanjay Van', area: 'South Delhi', lat: 28.5700, lon: 77.1800, canopyCover: 0.65 },
  { id: 'ridge', name: 'Ridge Forest Belt', area: 'North-West Delhi', lat: 28.6800, lon: 77.1400, canopyCover: 0.72 },
];

module.exports = { ANIMAL_DATA, RISK_LEVELS, DELHI_ZONES };
