import React, { useState, useEffect } from 'react';
import { getHistory, getWeightHistory, getWeekStats } from '../data/store';
import { formatMinutes, formatDuration, getBestWeight } from '../utils/helpers';

export default function Stats() {
  const [weekStats, setWeekStats] = useState({ sessions: 0, totalMinutes: 0 });
  const [history, setHistory] = useState([]);
  const [weightHistory, setWeightHistory] = useState({});
  const [selectedExercise, setSelectedExercise] = useState(null);

  useEffect(() => {
    const hist = getHistory();
    const wh = getWeightHistory();
    setWeekStats(getWeekStats());
    setHistory(hist);
    setWeightHistory(wh);
    const exercises = Object.keys(wh);
    if (exercises.length > 0) setSelectedExercise(exercises[0]);
  }, []);

  // Top exercises
  const exerciseCounts = {};
  history.forEach(session => {
    if (session.exercises) {
      session.exercises.forEach(ex => {
        exerciseCounts[ex.name] = (exerciseCounts[ex.name] || 0) + (ex.completedSets || ex.sets);
      });
    }
  });
  const topExercises = Object.entries(exerciseCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Monthly workouts
  const now = new Date();
  const thisMonthSessions = history.filter(s => {
    const d = new Date(s.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalHours = history.reduce((acc, s) => acc + (s.duration || 0), 0);

  // Weight chart data for selected exercise
  const chartData = selectedExercise ? (weightHistory[selectedExercise] || []).slice(-10) : [];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 'calc(20px + var(--safe-top)) 20px 16px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <h1 style={{ fontSize: '28px' }}>Estatísticas</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Sua evolução</p>
      </div>

      <div className="scroll-container" style={{ flex: 1, padding: '16px', paddingBottom: 'calc(80px + var(--safe-bottom))' }}>
        {/* Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          <StatCard label="Treinos esta semana" value={weekStats.sessions} unit="" color="var(--blue-bright)" icon="📅" />
          <StatCard label="Tempo esta semana" value={formatMinutes(weekStats.totalMinutes)} unit="" color="var(--orange)" icon="⏱️" />
          <StatCard label="Treinos este mês" value={thisMonthSessions.length} unit="" color="var(--green)" icon="📆" />
          <StatCard label="Total de horas" value={Math.round(totalHours / 60 * 10) / 10} unit="h" color="#a371f7" icon="🏆" />
        </div>

        {/* Top exercises */}
        {topExercises.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
              Exercícios mais realizados
            </h2>
            <div className="card">
              {topExercises.map(([name, count], i) => {
                const maxCount = topExercises[0][1];
                return (
                  <div key={name} style={{ marginBottom: i < topExercises.length - 1 ? '12px' : 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>{name}</span>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{count} séries</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${(count / maxCount) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Weight evolution */}
        {Object.keys(weightHistory).length > 0 && (
          <div>
            <h2 style={{ fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
              Evolução de Carga
            </h2>
            <select
              value={selectedExercise || ''}
              onChange={e => setSelectedExercise(e.target.value)}
              style={{ marginBottom: '12px' }}
            >
              {Object.keys(weightHistory).map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>

            {chartData.length > 0 && (
              <div className="card">
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontFamily: 'var(--font-display)', color: 'var(--blue-bright)' }}>
                      {chartData[chartData.length - 1]?.weight || 0}kg
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Última carga</div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontFamily: 'var(--font-display)', color: 'var(--orange)' }}>
                      {getBestWeight(weightHistory[selectedExercise])}kg
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Melhor carga</div>
                  </div>
                </div>

                {/* Mini bar chart */}
                {chartData.length > 1 && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '80px' }}>
                      {chartData.map((entry, i) => {
                        const maxW = Math.max(...chartData.map(d => d.weight || 0));
                        const h = maxW > 0 ? ((entry.weight || 0) / maxW) * 100 : 10;
                        return (
                          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', height: '100%', justifyContent: 'flex-end' }}>
                            <div style={{
                              width: '100%',
                              height: `${h}%`,
                              background: i === chartData.length - 1
                                ? 'linear-gradient(180deg, var(--blue), var(--blue-dim))'
                                : 'var(--border)',
                              borderRadius: '3px 3px 0 0',
                              transition: 'height 0.5s ease',
                            }} />
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {new Date(chartData[0]?.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {new Date(chartData[chartData.length - 1]?.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {history.length === 0 && (
          <div className="empty-state">
            <span className="icon">📊</span>
            <p>Complete treinos para ver suas estatísticas!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, unit, color, icon }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
      <div style={{ fontSize: '24px', marginBottom: '4px' }}>{icon}</div>
      <div style={{ fontSize: '26px', fontFamily: 'var(--font-display)', color, lineHeight: 1 }}>
        {value}{unit}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.3 }}>{label}</div>
    </div>
  );
}
