import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getHistory, deleteSession } from '../data/store';
import { formatDate, formatDuration } from '../utils/helpers';

export default function History() {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleDelete = (e, id) => {
    e.stopPropagation();
    deleteSession(id);
    setHistory(getHistory());
  };

  const typeIcon = (type) => type === 'tennis' ? '🎾' : '🏋️';
  const typeColor = (type) => type === 'tennis' ? 'var(--green)' : 'var(--blue-bright)';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 'calc(20px + var(--safe-top)) 20px 16px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <h1 style={{ fontSize: '28px' }}>Histórico</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{history.length} treinos registrados</p>
      </div>

      <div className="scroll-container" style={{ flex: 1, padding: '16px', paddingBottom: 'calc(80px + var(--safe-bottom))' }}>
        {history.length === 0 ? (
          <div className="empty-state">
            <span className="icon">📋</span>
            <p>Nenhum treino registrado.<br />Complete seu primeiro treino!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {history.map((session, i) => (
              <div
                key={session.id}
                className="card"
                onClick={() => navigate(`/history/${session.id}`)}
                style={{
                  cursor: 'pointer',
                  padding: '16px',
                  animation: `fadeIn 0.3s ease ${i * 0.05}s both`,
                  borderLeft: `3px solid ${typeColor(session.type)}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ fontSize: '28px', flexShrink: 0 }}>{typeIcon(session.type)}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-body)' }}>
                        {session.workoutName || 'Treino'}
                      </h3>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      {formatDate(session.date)} · {formatDuration(session.duration * 60)}
                    </div>
                    {session.exercises && session.exercises.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {session.exercises.slice(0, 4).map((ex, j) => (
                          <span key={j} className="badge badge-blue" style={{ fontSize: '11px' }}>
                            {ex.name}
                            {ex.weight > 0 && ` ${ex.weight}kg`}
                          </span>
                        ))}
                        {session.exercises.length > 4 && (
                          <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontSize: '11px' }}>
                            +{session.exercises.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                    {session.notes && (
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', fontStyle: 'italic' }}>
                        "{session.notes}"
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, session.id)}
                    style={{
                      background: 'none', border: 'none',
                      color: 'var(--text-muted)', cursor: 'pointer',
                      fontSize: '16px', padding: '4px',
                      flexShrink: 0,
                    }}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
