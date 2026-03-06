import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { initializeData } from './data/store';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import WorkoutPage from './pages/WorkoutPage';
import History from './pages/History';
import SessionDetail from './pages/SessionDetail';
import Stats from './pages/Stats';
import Workouts from './pages/Workouts';
import Tennis from './pages/Tennis';

export default function App() {
  useEffect(() => {
    initializeData();
  }, []);

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/workout/:id" element={<WorkoutPage />} />
          <Route path="/history" element={<History />} />
          <Route path="/history/:id" element={<SessionDetail />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/tennis" element={<Tennis />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  );
}
