// src/App.js
import React from 'react';
import { Toaster } from 'react-hot-toast';
import { WeatherProvider } from './context/WeatherContext';
import Navbar from './components/Navbar';
import Ticker from './components/Ticker';
import Hero from './components/Hero';
import Dashboard from './components/Dashboard';
import AHSISection from './components/AHSISection';
import RecommendationsSection from './components/RecommendationsSection';
import ReportSection from './components/ReportSection';
import AlertsSection from './components/AlertsSection';
import ZoneGrid from './components/ZoneGrid';
import ForecastSection from './components/ForecastSection';
import AwarenessSection from './components/AwarenessSection';
import Footer from './components/Footer';
import './App.css';

export default function App() {
  return (
    <WeatherProvider>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#182236',
            color: '#e8edf5',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '12px',
            fontSize: '13px',
          },
        }}
      />
      <Navbar />
      <Ticker />
      <main>
        <Hero />
        <div className="divider" />
        <Dashboard />
        <div className="divider" />
        <AHSISection />
        <div className="divider" />
        <RecommendationsSection />
        <div className="divider" />
        <ReportSection />
        <div className="divider" />
        <AlertsSection />
        <div className="divider" />
        <ZoneGrid />
        <div className="divider" />
        <ForecastSection />
        <div className="divider" />
        <AwarenessSection />
      </main>
      <Footer />
    </WeatherProvider>
  );
}
