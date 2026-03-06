import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const tabs = [
  { path: '/', icon: '🏠', label: 'Início' },
  { path: '/history', icon: '📋', label: 'Histórico' },
  { path: '/stats', icon: '📊', label: 'Stats' },
  { path: '/workouts', icon: '⚙️', label: 'Treinos' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide nav during active workout
  if (location.pathname.startsWith('/workout/')) return null;

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(13,17,23,0.95)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      paddingBottom: 'var(--safe-bottom)',
      zIndex: 50,
    }}>
      {tabs.map(tab => {
        const active = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              padding: '10px 8px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: active ? 'var(--blue-bright)' : 'var(--text-muted)',
              transition: 'color 0.2s',
            }}
          >
            <span style={{ fontSize: '22px' }}>{tab.icon}</span>
            <span style={{
              fontSize: '10px',
              fontWeight: active ? 700 : 500,
              fontFamily: 'var(--font-body)',
              letterSpacing: '0.02em',
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
