import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveSession } from '../data/store';
import { generateId } from '../utils/helpers';

export default function Tennis() {
  const navigate = useNavigate();
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const session = {
      id: generateId(),
      type: 'tennis',
      workoutName: 'Tênis 🎾',
      date: new Date(date + 'T12:00:00').toISOString(),
      duration,
      notes,
    };
    saveSession(session);
    setSaved(true);
    setTimeout(() => navigate('/history'), 1000);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 'calc(16px + var(--safe-top)) 20px 16px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '8px', fontFamily: 'var(--font-body)', fontSize: '14px' }}>
          ← Voltar
        </button>
        <h1 style={{ fontSize: '28px' }}>🎾 Registrar Tênis</h1>
      </div>

      <div className="scroll-container" style={{ flex: 1, padding: '20px', paddingBottom: 'calc(20px + var(--safe-bottom))' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Data
            </label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>

          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Duração (minutos)
            </label>
            <div className="number-input-group">
              <button className="step-btn" onClick={() => setDuration(d => Math.max(15, d - 15))}>−</button>
              <input
                type="number"
                value={duration}
                onChange={e => setDuration(parseInt(e.target.value) || 0)}
                min="1"
                style={{ flex: 1 }}
              />
              <button className="step-btn" onClick={() => setDuration(d => d + 15)}>+</button>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              {[30, 45, 60, 90, 120].map(t => (
                <button
                  key={t}
                  onClick={() => setDuration(t)}
                  className="btn btn-ghost"
                  style={{
                    flex: 1, fontSize: '12px', minHeight: 36, padding: '6px',
                    borderColor: duration === t ? 'var(--green)' : 'var(--border)',
                    color: duration === t ? 'var(--green)' : 'var(--text-muted)',
                  }}
                >
                  {t}min
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Observações
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Como foi o jogo? Com quem jogou? Resultado..."
              rows={4}
              style={{ resize: 'vertical' }}
            />
          </div>

          <button
            className={`btn ${saved ? 'btn-success' : 'btn-primary'}`}
            onClick={handleSave}
            disabled={saved}
            style={{ width: '100%', fontSize: '17px', minHeight: 56 }}
          >
            {saved ? '✅ Salvo!' : '💾 Salvar Treino de Tênis'}
          </button>
        </div>
      </div>
    </div>
  );
}
