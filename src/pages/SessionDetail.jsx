import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getHistory } from '../data/store';
import { formatDate, formatDuration } from '../utils/helpers';

export default function SessionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);

  useEffect(() => {
    const history = getHistory();
    setSession(history.find(s => s.id === id));
  }, [id]);

  if (!session) return null;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 'calc(16px + var(--safe-top)) 20px 16px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '16px', marginBottom: '8px', fontFamily: 'var(--font-body)' }}>
          ← Voltar
        </button>
        <h1 style={{ fontSize: '26px' }}>{session.workoutName || 'Treino'}</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          {new Date(session.date).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="scroll-container" style={{ flex: 1, padding: '16px', paddingBottom: 'calc(20px + var(--safe-bottom))' }}>
        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontFamily: 'var(--font-display)', color: 'var(--blue-bright)' }}>
              {formatDuration(session.duration * 60)}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Duração</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontFamily: 'var(--font-display)', color: 'var(--orange)' }}>
              {session.exercises?.length || '-'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Exercícios</div>
          </div>
        </div>

        {/* Exercises */}
        {session.exercises && session.exercises.length > 0 && (
          <div>
            <h2 style={{ fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
              Exercícios
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {session.exercises.map((ex, i) => (
                <div key={i} className="card" style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px' }}>{ex.name}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {ex.completedSets || ex.sets} séries × {ex.reps} reps
                      </div>
                    </div>
                    {ex.weight > 0 && (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '20px', fontFamily: 'var(--font-display)', color: 'var(--blue-bright)' }}>
                          {ex.weight}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>kg</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {session.notes && (
          <div style={{ marginTop: '20px' }}>
            <h2 style={{ fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Observações</h2>
            <div className="card">
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{session.notes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
