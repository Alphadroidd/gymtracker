import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWorkouts, getHistory, getWeekStats } from '../data/store';
import { formatDate, formatDuration, formatMinutes } from '../utils/helpers';

export default function Home() {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [recentHistory, setRecentHistory] = useState([]);
  const [weekStats, setWeekStats] = useState({ sessions: 0, totalMinutes: 0 });

  useEffect(() => {
    setWorkouts(getWorkouts());
    setRecentHistory(getHistory().slice(0, 3));
    setWeekStats(getWeekStats());
  }, []);

  const workoutColors = ['var(--blue)', 'var(--orange)', '#a371f7', '#3fb950'];

  return (
    <div className="scroll-container" style={{ height: '100%', paddingBottom: 'calc(70px + var(--safe-bottom))' }}>
      {/* Header */}
      <div style={{
        padding: 'calc(20px + var(--safe-top)) 20px 0',
        background: 'linear-gradient(180deg, rgba(77,148,255,0.08) 0%, transparent 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <div>
            <h1 style={{ fontSize: '32px', color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
              GymTracker
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Seu diário de treino pessoal
            </p>
          </div>
          <div style={{
            width: 48, height: 48,
            borderRadius: 16,
            background: 'var(--blue-dim)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px',
          }}>
            🏋️
          </div>
        </div>

        {/* Week stats strip */}
        <div style={{
          display: 'flex',
          gap: '12px',
          margin: '16px 0',
          padding: '14px 16px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontFamily: 'var(--font-display)', color: 'var(--blue-bright)' }}>
              {weekStats.sessions}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Treinos na semana</div>
          </div>
          <div style={{ width: 1, background: 'var(--border)' }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontFamily: 'var(--font-display)', color: 'var(--orange)' }}>
              {weekStats.totalMinutes > 0 ? formatMinutes(weekStats.totalMinutes) : '0min'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tempo total</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '20px' }}>
        
        {/* Workout buttons */}
        <div>
          <h2 style={{ fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
            Iniciar Treino
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {workouts.map((w, i) => (
              <button
                key={w.id}
                className="btn"
                onClick={() => navigate(`/workout/${w.id}`)}
                style={{
                  background: `linear-gradient(135deg, ${workoutColors[i % workoutColors.length]}22, ${workoutColors[i % workoutColors.length]}11)`,
                  border: `1px solid ${workoutColors[i % workoutColors.length]}44`,
                  color: 'var(--text-primary)',
                  justifyContent: 'flex-start',
                  gap: '14px',
                  padding: '16px',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <span style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: `${workoutColors[i % workoutColors.length]}22`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', flexShrink: 0,
                }}>
                  {i === 0 ? '💪' : i === 1 ? '🔥' : '⚡'}
                </span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: '17px' }}>{w.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {w.exercises?.length || 0} exercícios
                  </div>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: '20px', color: workoutColors[i % workoutColors.length] }}>→</span>
              </button>
            ))}

            {/* Tennis */}
            <button
              className="btn"
              onClick={() => navigate('/tennis')}
              style={{
                background: 'linear-gradient(135deg, rgba(63,185,80,0.12), rgba(63,185,80,0.06))',
                border: '1px solid rgba(63,185,80,0.3)',
                color: 'var(--text-primary)',
                justifyContent: 'flex-start',
                gap: '14px',
                padding: '16px',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <span style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'rgba(63,185,80,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', flexShrink: 0,
              }}>
                🎾
              </span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: '17px' }}>Registrar Tênis</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Duração e observações</div>
              </div>
              <span style={{ marginLeft: 'auto', fontSize: '20px', color: 'var(--green)' }}>→</span>
            </button>
          </div>
        </div>

        {/* Recent history */}
        {recentHistory.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Últimos Treinos
              </h2>
              <button
                onClick={() => navigate('/history')}
                style={{ fontSize: '13px', color: 'var(--blue-bright)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
              >
                Ver todos →
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentHistory.map(session => (
                <div
                  key={session.id}
                  className="card"
                  onClick={() => navigate(`/history/${session.id}`)}
                  style={{ cursor: 'pointer', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}
                >
                  <span style={{ fontSize: '24px' }}>
                    {session.type === 'tennis' ? '🎾' : '🏋️'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>{session.workoutName || 'Treino'}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {formatDate(session.date)} · {formatDuration(session.duration * 60)}
                    </div>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '16px' }}>›</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {recentHistory.length === 0 && (
          <div className="empty-state">
            <span className="icon">💪</span>
            <p>Nenhum treino registrado ainda.<br />Inicie seu primeiro treino!</p>
          </div>
        )}
      </div>
    </div>
  );
}
