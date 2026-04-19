// src/context/WeatherContext.js — Global weather + AHSI state
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchWeather, fetchAlerts, fetchReports, fetchReportStats } from '../utils/api';
import toast from 'react-hot-toast';

const WeatherContext = createContext(null);

export function WeatherProvider({ children }) {
  const [weather, setWeather] = useState(null);
  const [ahsi, setAhsi] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [zoneRisk, setZoneRisk] = useState('moderate');
  const [alerts, setAlerts] = useState([]);
  const [reports, setReports] = useState([]);
  const [reportStats, setReportStats] = useState(null);
  const [location, setLocation] = useState({ lat: 28.6139, lon: 77.2090, city: 'New Delhi' });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const loadWeather = useCallback(async (loc = location) => {
    try {
      setError(null);
      const data = await fetchWeather({ lat: loc.lat, lon: loc.lon, city: loc.city });
      setWeather(data.weather);
      setAhsi(data.ahsi);
      setForecast(data.forecast || []);
      setZoneRisk(data.zoneRisk || 'moderate');
      setLastUpdated(new Date());
    } catch (err) {
      setError('Weather data unavailable — showing mock data');
      console.error('Weather load error:', err);
    }
  }, [location]);

  const loadAlerts = useCallback(async () => {
    try {
      const data = await fetchAlerts();
      setAlerts(data.alerts || []);
    } catch (err) {
      console.error('Alerts load error:', err);
    }
  }, []);

  const loadReports = useCallback(async () => {
    try {
      const [reportsData, statsData] = await Promise.all([
        fetchReports(30),
        fetchReportStats(),
      ]);
      setReports(reportsData.reports || []);
      setReportStats(statsData);
    } catch (err) {
      console.error('Reports load error:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadWeather(), loadAlerts(), loadReports()]);
      setLoading(false);
    };
    init();
  }, []);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      loadWeather();
      loadAlerts();
      loadReports();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadWeather, loadAlerts, loadReports]);

  const updateLocation = useCallback(async (newLocation) => {
    setLocation(newLocation);
    setLoading(true);
    await loadWeather(newLocation);
    setLoading(false);
    toast.success(`📍 Location updated: ${newLocation.city}`);
  }, [loadWeather]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadWeather(), loadAlerts(), loadReports()]);
    setLoading(false);
    toast.success('🔄 Data refreshed!');
  }, [loadWeather, loadAlerts, loadReports]);

  return (
    <WeatherContext.Provider value={{
      weather, ahsi, forecast, zoneRisk, alerts, reports, reportStats,
      location, loading, lastUpdated, error,
      updateLocation, refreshAll, loadReports,
    }}>
      {children}
    </WeatherContext.Provider>
  );
}

export const useWeather = () => {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error('useWeather must be used within WeatherProvider');
  return ctx;
};
