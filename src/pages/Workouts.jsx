import React, { useState, useEffect } from 'react';
import { getWorkouts, saveWorkouts, exportData, importData } from '../data/store';
import { generateId } from '../utils/helpers';

const EXERCISE_SUGGESTIONS = [
  'Lat Pulldown', 'Leg Extension', 'Hip Adductor', 'Tríceps na Corda', 'Bíceps Curl',
  'Abdominal', 'Leg Press', 'Seated Leg Curl', 'Hip Abductor', 'Chest Press',
  'Shoulder Press', 'Lateral Raise', 'Supino', 'Remada', 'Agachamento',
  'Extensão Lombar', 'Calf Raise', 'Pec Deck', 'Pullover', 'Face Pull',
];

export default function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWorkoutName, setNewWorkoutName] = useState('');

  useEffect(() => { setWorkouts(getWorkouts()); }, []);

  const save = (updated) => {
    setWorkouts(updated);
    saveWorkouts(updated);
  };

  const createWorkout = () => {
    if (!newWorkoutName.trim()) return;
    const newWorkout = { id: generateId(), name: newWorkoutName.trim(), exercises: [] };
    save([...workouts, newWorkout]);
    setNewWorkoutName('');
    setShowAddModal(false);
    setEditingWorkout(newWorkout.id);
  };

  const duplicateWorkout = (workout) => {
    const copy = {
      ...workout,
      id: generateId(),
      name: workout.name + ' (cópia)',
      exercises: workout.exercises.map(e => ({ ...e, id: generateId() })),
    };
    save([...workouts, copy]);
  };

  const deleteWorkout = (id) => {
    save(workouts.filter(w => w.id !== id));
  };

  const addExercise = (workoutId) => {
    save(workouts.map(w => w.id === workoutId ? {
      ...w,
      exercises: [...w.exercises, { id: generateId(), name: '', sets: 3, reps: 10, weight: 0 }]
    } : w));
  };

  const updateExercise = (workoutId, exId, field, value) => {
    save(workouts.map(w => w.id === workoutId ? {
      ...w,
      exercises: w.exercises.map(e => e.id === exId ? { ...e, [field]: value } : e)
    } : w));
  };

  const removeExercise = (workoutId, exId) => {
    save(workouts.map(w => w.id === workoutId ? {
      ...w,
      exercises: w.exercises.filter(e => e.id !== exId)
    } : w));
  };

  const editingW = workouts.find(w => w.id === editingWorkout);

  if (editingWorkout && editingW) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 'calc(16px + var(--safe-top)) 20px 16px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <button onClick={() => setEditingWorkout(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '8px', fontFamily: 'var(--font-body)', fontSize: '14px' }}>
            ← Voltar
          </button>
          <input
            value={editingW.name}
            onChange={e => save(workouts.map(w => w.id === editingW.id ? { ...w, name: e.target.value } : w))}
            style={{ fontSize: '22px', fontWeight: 700, background: 'none', border: 'none', color: 'var(--text-primary)', width: '100%', fontFamily: 'var(--font-body)', outline: 'none' }}
          />
        </div>

        <div className="scroll-container" style={{ flex: 1, padding: '16px', paddingBottom: 'calc(80px + var(--safe-bottom))' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {editingW.exercises.map((ex, i) => (
              <div key={ex.id} className="card" style={{ padding: '14px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', alignItems: 'center' }}>
                  <input
                    value={ex.name}
                    onChange={e => updateExercise(editingW.id, ex.id, 'name', e.target.value)}
                    placeholder="Nome do exercício"
                    list="exercise-suggestions"
                    style={{ flex: 1, fontWeight: 600 }}
                  />
                  <button
                    onClick={() => removeExercise(editingW.id, ex.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '18px', flexShrink: 0 }}
                  >
                    ✕
                  </button>
                </div>
                <datalist id="exercise-suggestions">
                  {EXERCISE_SUGGESTIONS.map(s => <option key={s} value={s} />)}
                </datalist>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Séries</label>
                    <input type="number" value={ex.sets} min="1" onChange={e => updateExercise(editingW.id, ex.id, 'sets', parseInt(e.target.value) || 1)} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Reps</label>
                    <input type="number" value={ex.reps} min="1" onChange={e => updateExercise(editingW.id, ex.id, 'reps', parseInt(e.target.value) || 1)} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            className="btn btn-secondary"
            onClick={() => addExercise(editingW.id)}
            style={{ width: '100%', marginTop: '12px' }}
          >
            + Adicionar Exercício
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 'calc(20px + var(--safe-top)) 20px 16px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <h1 style={{ fontSize: '28px' }}>Treinos</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Gerencie seus treinos</p>
      </div>

      <div className="scroll-container" style={{ flex: 1, padding: '16px', paddingBottom: 'calc(80px + var(--safe-bottom))' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {workouts.map((w, i) => (
            <div key={w.id} className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <span style={{ fontSize: '28px' }}>{i === 0 ? '💪' : i === 1 ? '🔥' : '⚡'}</span>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, fontFamily: 'var(--font-body)' }}>{w.name}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{w.exercises.length} exercícios</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-primary" style={{ flex: 1, fontSize: '13px', minHeight: 40 }} onClick={() => setEditingWorkout(w.id)}>
                  ✏️ Editar
                </button>
                <button className="btn btn-ghost" style={{ flex: 1, fontSize: '13px', minHeight: 40 }} onClick={() => duplicateWorkout(w)}>
                  📋 Copiar
                </button>
                <button className="btn btn-danger" style={{ width: 44, minHeight: 40, padding: '8px' }} onClick={() => deleteWorkout(w.id)}>
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddModal(true)} style={{ width: '100%' }}>
          + Criar Novo Treino
        </button>

        {/* Backup section */}
        <div style={{ marginTop: '24px' }}>
          <h2 style={{ fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
            Backup
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-ghost"
              style={{ flex: 1, fontSize: '13px' }}
              onClick={() => {
                const data = exportData();
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `gymtracker-backup-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
              }}
            >
              📤 Exportar
            </button>
            <label className="btn btn-ghost" style={{ flex: 1, fontSize: '13px', cursor: 'pointer' }}>
              📥 Importar
              <input
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    try {
                      importData(JSON.parse(ev.target.result));
                      setWorkouts(getWorkouts());
                      alert('Dados importados com sucesso!');
                    } catch {
                      alert('Erro ao importar arquivo.');
                    }
                  };
                  reader.readAsText(file);
                }}
              />
            </label>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2 style={{ fontSize: '22px', marginBottom: '16px' }}>Novo Treino</h2>
            <input
              value={newWorkoutName}
              onChange={e => setNewWorkoutName(e.target.value)}
              placeholder="Nome do treino (ex: Treino C)"
              onKeyDown={e => e.key === 'Enter' && createWorkout()}
              autoFocus
              style={{ marginBottom: '14px' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={createWorkout}>
                Criar Treino
              </button>
              <button className="btn btn-ghost" onClick={() => setShowAddModal(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
