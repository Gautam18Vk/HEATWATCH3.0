// ─────────────────────────────────────────────────────────────
// HeatWatch — AHSI Calculation Engine
// Animal Heat Stress Index scoring algorithm
// ─────────────────────────────────────────────────────────────

const { ANIMAL_DATA, RISK_LEVELS } = require('../data/animalData');

/**
 * Calculate Temperature-Humidity Index (THI)
 * Industry standard formula used in livestock research
 * THI = T - (0.55 - 0.55 * RH/100) * (T - 14.5)
 */
function calculateTHI(tempC, humidity) {
  const T = tempC;
  const RH = humidity;
  return T - (0.55 - 0.55 * (RH / 100)) * (T - 14.5);
}

/**
 * Calculate heat index (feels-like) using Rothfusz equation
 * More accurate than simple formulas at high temps + humidity
 */
function calculateHeatIndex(tempC, humidity) {
  const T = (tempC * 9/5) + 32; // convert to °F for standard formula
  const RH = humidity;
  let HI = 0.5 * (T + 61.0 + ((T - 68.0) * 1.2) + (RH * 0.094));
  if (HI >= 80) {
    HI = -42.379 + 2.04901523 * T + 10.14333127 * RH
      - 0.22475541 * T * RH - 0.00683783 * T * T
      - 0.05481717 * RH * RH + 0.00122874 * T * T * RH
      + 0.00085282 * T * RH * RH - 0.00000199 * T * T * RH * RH;
    if (RH < 13 && T >= 80 && T <= 112) {
      HI -= ((13 - RH) / 4) * Math.sqrt((17 - Math.abs(T - 95.0)) / 17);
    }
    if (RH > 85 && T >= 80 && T <= 87) {
      HI += ((RH - 85) / 10) * ((87 - T) / 5);
    }
  }
  return ((HI - 32) * 5) / 9; // back to °C
}

/**
 * Main AHSI Score Calculator
 * Returns a score 0–100 and risk classification
 * 
 * Formula: 
 * BaseScore = normalize(temp relative to animal's critical threshold)
 * HumidityPenalty = humidityWeight * normalize(humidity above 50%)
 * ExposurePenalty = 0–20 based on shade/water availability
 * CoatPenalty = coatFactor * (temp - safeTemp) / criticalTemp
 * AHSI = min(100, BaseScore + HumidityPenalty + ExposurePenalty + CoatPenalty)
 */
function calculateAHSI(animalKey, weatherData, exposureData = {}) {
  const animal = ANIMAL_DATA[animalKey];
  if (!animal) throw new Error(`Unknown animal: ${animalKey}`);

  const { temp, humidity, windSpeed = 10, cloudCover = 0 } = weatherData;
  const { hasWater = false, hasShade = false, canopyCover = 0.1 } = exposureData;

  // 1. Temperature component (0–60 points)
  let tempScore = 0;
  if (temp <= animal.safeTemp) {
    tempScore = 0;
  } else if (temp <= animal.moderateTemp) {
    // Linear scale from 0 to 40 between safeTemp and moderateTemp
    tempScore = ((temp - animal.safeTemp) / (animal.moderateTemp - animal.safeTemp)) * 40;
  } else {
    // Linear scale from 40 to 70 between moderate and critical
    tempScore = 40 + ((temp - animal.moderateTemp) / (animal.criticalTemp - animal.moderateTemp)) * 30;
    tempScore = Math.min(tempScore, 70);
  }

  // 2. Humidity component (0–20 points)
  let humScore = 0;
  if (humidity > 50) {
    humScore = animal.humidityWeight * ((humidity - 50) / 50) * 20;
  }

  // 3. Exposure / environment component (0–15 points)
  let exposureScore = 10; // base exposure penalty
  if (hasShade) exposureScore -= 4;
  if (hasWater) exposureScore -= 4;
  if (canopyCover > 0.3) exposureScore -= 3;
  if (windSpeed > 15) exposureScore -= 2;
  if (cloudCover > 50) exposureScore -= 2;
  exposureScore = Math.max(0, exposureScore);

  // 4. Coat/body factor (0–10 points)
  const coatScore = animal.coatFactor * ((temp - animal.safeTemp) / animal.criticalTemp) * 10;

  // 5. THI check — override if THI exceeds animal's critical threshold
  const thi = calculateTHI(temp, humidity);
  let thiBonus = 0;
  if (thi > animal.criticalTHI) {
    thiBonus = Math.min(15, (thi - animal.criticalTHI) * 1.5);
  }

  // Final score
  const rawScore = tempScore + humScore + exposureScore + coatScore + thiBonus;
  const score = Math.min(100, Math.max(0, Math.round(rawScore)));

  // Determine risk level
  let riskLevel = 'safe';
  if (score > 70) riskLevel = 'critical';
  else if (score > 40) riskLevel = 'moderate';

  return {
    animal: animalKey,
    animalName: animal.name,
    animalIcon: animal.icon,
    score,
    riskLevel,
    riskLabel: RISK_LEVELS[riskLevel].label,
    riskColor: RISK_LEVELS[riskLevel].color,
    riskEmoji: RISK_LEVELS[riskLevel].emoji,
    breakdown: {
      temperatureScore: Math.round(tempScore),
      humidityScore: Math.round(humScore),
      exposureScore: Math.round(exposureScore),
      coatScore: Math.round(coatScore),
      thiBonus: Math.round(thiBonus),
      thi: Math.round(thi * 10) / 10,
      heatIndex: Math.round(calculateHeatIndex(temp, humidity) * 10) / 10,
    },
    thresholds: {
      safe: animal.safeTemp,
      moderate: animal.moderateTemp,
      critical: animal.criticalTemp,
    },
    waterNeed: animal.waterNeedLiters,
    immediateActions: score > 70 ? animal.immediateActions : animal.immediateActions.slice(0, 2),
    description: animal.description,
  };
}

/**
 * Calculate AHSI for all animals at once
 */
function calculateAllAHSI(weatherData, exposureData = {}) {
  const animalKeys = ['dog', 'cat', 'cow', 'bird', 'monkey'];
  return animalKeys.reduce((acc, key) => {
    acc[key] = calculateAHSI(key, weatherData, exposureData);
    return acc;
  }, {});
}

/**
 * Determine overall zone risk level based on all animals
 */
function getZoneRisk(allAHSI) {
  const scores = Object.values(allAHSI).map(a => a.score);
  const maxScore = Math.max(...scores);
  const criticalCount = scores.filter(s => s > 70).length;

  if (criticalCount >= 3 || maxScore >= 85) return 'critical';
  if (criticalCount >= 1 || maxScore >= 55) return 'moderate';
  return 'safe';
}

module.exports = { calculateAHSI, calculateAllAHSI, calculateTHI, calculateHeatIndex, getZoneRisk };
