import React, { useState } from 'react';
import { EXERCISE_GIFS } from '../data/store';

const EMOJI_FALLBACKS = {
  'Lat Pulldown': '💪',
  'Leg Extension': '🦵',
  'Hip Adductor': '🏋️',
  'Tríceps na Corda': '💪',
  'Bíceps Curl': '💪',
  'Abdominal': '🔥',
  'Leg Press': '🦵',
  'Seated Leg Curl': '🦵',
  'Hip Abductor': '🏋️',
  'Chest Press': '💪',
};

export default function ExerciseCard({
  exercise,
  exerciseIndex,
  lastWeight,
  completedSets,
  currentSetData,
  onSetComplete,
  onWeightChange,
  onRepsChange,
  isActive,
}) {
  const [showGif, setShowGif] = useState(false);
  const gifUrl = EXERCISE_GIFS[exercise.name];
  const emoji = EMOJI_FALLBACKS[exercise.name] || '💪';
  const totalSets = exercise.sets;
  const done = completedSets >= totalSets;

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid ${isActive ? 'var(--blue)' : done ? 'var(--green)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      transition: 'border-color 0.3s',
      boxShadow: isActive ? 'var(--shadow-glow-blue)' : done ? '0 0 16px rgba(63,185,80,0.1)' : 'none',
    }}>
      {/* Header */}
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => setShowGif(f => !f)}
          style={{
            width: 48, height: 48,
            borderRadius: 12,
            background: done ? 'rgba(63,185,80,0.15)' : 'var(--blue-dim)',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {done ? '✅' : emoji}
        </button>
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 700,
            fontFamily: 'var(--font-body)',
            color: done ? 'var(--green)' : 'var(--text-primary)',
          }}>
            {exercise.name}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {completedSets}/{totalSets} séries · {exercise.reps} reps
          </p>
        </div>
        {/* Sets dots */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {Array.from({ length: totalSets }).map((_, i) => (
            <div key={i} style={{
              width: 10, height: 10, borderRadius: '50%',
              background: i < completedSets ? 'var(--green)' : 'var(--border)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>
      </div>

      {/* GIF */}
      {showGif && (
        <div style={{ padding: '0 16px 12px' }}>
          <div style={{
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
            background: 'var(--bg-secondary)',
            height: 180,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {gifUrl ? (
              <img
                src={gifUrl}
                alt={exercise.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                loading="lazy"
              />
            ) : (
              <div style={{ fontSize: '64px' }}>{emoji}</div>
            )}
          </div>
        </div>
      )}

      {/* Input controls */}
      {!done && (
        <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>
                Carga (kg)
              </label>
              <div className="number-input-group">
                <button className="step-btn" onClick={() => onWeightChange(Math.max(0, (currentSetData.weight || 0) - 2.5))}>−</button>
                <input
                  type="number"
                  value={currentSetData.weight || 0}
                  min="0"
                  step="0.5"
                  onChange={e => onWeightChange(parseFloat(e.target.value) || 0)}
                  style={{ flex: 1 }}
                />
                <button className="step-btn" onClick={() => onWeightChange((currentSetData.weight || 0) + 2.5)}>+</button>
              </div>
              {lastWeight !== undefined && lastWeight > 0 && (
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
                  Última: {lastWeight}kg
                </p>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>
                Reps
              </label>
              <div className="number-input-group">
                <button className="step-btn" onClick={() => onRepsChange(Math.max(1, (currentSetData.reps || exercise.reps) - 1))}>−</button>
                <input
                  type="number"
                  value={currentSetData.reps || exercise.reps}
                  min="1"
                  onChange={e => onRepsChange(parseInt(e.target.value) || 1)}
                  style={{ flex: 1 }}
                />
                <button className="step-btn" onClick={() => onRepsChange((currentSetData.reps || exercise.reps) + 1)}>+</button>
              </div>
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={onSetComplete}
            style={{ width: '100%', fontSize: '16px' }}
          >
            ✓ Concluir Série {completedSets + 1}/{totalSets}
          </button>
        </div>
      )}

      {done && (
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{
            background: 'rgba(63,185,80,0.08)',
            border: '1px solid rgba(63,185,80,0.2)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span style={{ fontSize: '16px' }}>🎯</span>
            <span style={{ fontSize: '13px', color: 'var(--green)', fontWeight: 600 }}>
              Exercício concluído!
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
