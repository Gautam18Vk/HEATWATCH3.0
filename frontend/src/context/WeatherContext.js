// src/context/WeatherContext.js
// Works fully on Vercel — no backend required
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchWeather, fetchAlerts, fetchReports, fetchReportStats, fetchAllZones, generateAlertsFromZones } from '../utils/api';
import toast from 'react-hot-toast';

const WeatherContext = createContext(null);

export function WeatherProvider({ children }) {
  const [weather, setWeather]         = useState(null);
  const [ahsi, setAhsi]               = useState(null);
  const [forecast, setForecast]       = useState([]);
  const [zoneRisk, setZoneRisk]       = useState('moderate');
  const [alerts, setAlerts]           = useState([]);
  const [zones, setZones]             = useState([]);
  const [reports, setReports]         = useState([]);
  const [reportStats, setReportStats] = useState(null);
  const [location, setLocation]       = useState({ lat: 28.6139, lon: 77.2090, city: 'New Delhi' });
  const [loading, setLoading]         = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError]             = useState(null);

  // Load main weather + AHSI
  const loadWeather = useCallback(async (loc) => {
    const target = loc || location;
    try {
      setError(null);
      const data = await fetchWeather({ lat: target.lat, lon: target.lon, city: target.city });
      setWeather(data.weather);
      setAhsi(data.ahsi);
      setForecast(data.forecast || []);
      setZoneRisk(data.zoneRisk || 'moderate');
      setLastUpdated(new Date());
    } catch (err) {
      setError('Weather unavailable — check your connection');
      console.error('Weather error:', err.message);
    }
  }, [location]);

  // Load zone data + generate alerts from it (works without backend)
  const loadZonesAndAlerts = useCallback(async () => {
    try {
      const { zones: zoneData } = await fetchAllZones();
      setZones(zoneData || []);
      const generatedAlerts = generateAlertsFromZones(zoneData || []);
      setAlerts(generatedAlerts);
    } catch (err) {
      console.error('Zones/alerts error:', err.message);
      // Try dedicated alerts endpoint as fallback
      try {
        const data = await fetchAlerts();
        setAlerts(data.alerts || []);
      } catch (_) {}
    }
  }, []);

  // Load reports
  const loadReports = useCallback(async () => {
    try {
      const [reportsData, statsData] = await Promise.all([fetchReports(30), fetchReportStats()]);
      setReports(reportsData.reports || []);
      setReportStats(statsData);
    } catch (err) {
      console.error('Reports error:', err.message);
    }
  }, []);

  // Initial load — all three in parallel
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadWeather(), loadZonesAndAlerts(), loadReports()]);
      setLoading(false);
    };
    init();
  }, []);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      loadWeather();
      loadZonesAndAlerts();
      loadReports();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadWeather, loadZonesAndAlerts, loadReports]);

  const updateLocation = useCallback(async (newLoc) => {
    setLocation(newLoc);
    setLoading(true);
    await loadWeather(newLoc);
    setLoading(false);
    toast.success(`📍 Location: ${newLoc.city}`);
  }, [loadWeather]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadWeather(), loadZonesAndAlerts(), loadReports()]);
    setLoading(false);
    toast.success('🔄 Data refreshed with live weather!');
  }, [loadWeather, loadZonesAndAlerts, loadReports]);

  return (
    <WeatherContext.Provider value={{
      weather, ahsi, forecast, zoneRisk,
      alerts, zones, reports, reportStats,
      location, loading, lastUpdated, error,
      updateLocation, refreshAll, loadReports,
    }}>
      {children}
    </WeatherContext.Provider>
  );
}

export const useWeather = () => {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error('useWeather must be inside WeatherProvider');
  return ctx;
};
