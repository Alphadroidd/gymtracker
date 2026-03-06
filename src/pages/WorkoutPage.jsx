import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWorkouts, saveSession, getLastWeights } from '../data/store';
import { generateId, formatDuration, vibrate } from '../utils/helpers';
import ExerciseCard from '../components/ExerciseCard';
import RestTimer from '../components/RestTimer';

export default function WorkoutPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [completedSets, setCompletedSets] = useState({}); // { exerciseId: count }
  const [setData, setSetData] = useState({}); // { exerciseId: { weight, reps } }
  const [showRest, setShowRest] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [lastWeights, setLastWeights] = useState({});
  const [completedAnimation, setCompletedAnimation] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const workouts = getWorkouts();
    const found = workouts.find(w => w.id === id);
    setWorkout(found);
    setLastWeights(getLastWeights());

    // Init set data from last weights
    const lw = getLastWeights();
    if (found) {
      const initialSetData = {};
      found.exercises.forEach(ex => {
        initialSetData[ex.id] = {
          weight: lw[ex.name]?.weight || ex.weight || 0,
          reps: ex.reps,
        };
      });
      setSetData(initialSetData);
    }
  }, [id]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleSetComplete = useCallback((exercise) => {
    const newCount = (completedSets[exercise.id] || 0) + 1;
    setCompletedSets(prev => ({ ...prev, [exercise.id]: newCount }));

    vibrate([50, 30, 100]);
    setCompletedAnimation(exercise.id);
    setTimeout(() => setCompletedAnimation(null), 600);

    // Move to next exercise if all sets done
    if (newCount >= exercise.sets) {
      const idx = workout.exercises.findIndex(e => e.id === exercise.id);
      if (idx < workout.exercises.length - 1) {
        setTimeout(() => setCurrentExercise(idx + 1), 400);
      }
    }

    setShowRest(true);
    // Scroll to rest timer
    setTimeout(() => {
      document.getElementById('rest-timer')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }, [completedSets, workout]);

  const handleFinish = () => {
    const durationMinutes = Math.ceil(elapsed / 60);
    const session = {
      id: generateId(),
      workoutId: workout.id,
      workoutName: workout.name,
      type: 'gym',
      date: new Date().toISOString(),
      duration: durationMinutes,
      exercises: workout.exercises.map(ex => ({
        name: ex.name,
        sets: ex.sets,
        completedSets: completedSets[ex.id] || 0,
        weight: setData[ex.id]?.weight || 0,
        reps: setData[ex.id]?.reps || ex.reps,
      })),
    };
    saveSession(session);
    navigate('/history', { state: { newSession: session.id } });
  };

  const totalSets = workout?.exercises.reduce((acc, ex) => acc + ex.sets, 0) || 0;
  const doneSets = Object.values(completedSets).reduce((acc, v) => acc + v, 0);
  const progress = totalSets > 0 ? doneSets / totalSets : 0;
  const allDone = workout?.exercises.every(ex => (completedSets[ex.id] || 0) >= ex.sets);

  if (!workout) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ fontSize: '32px' }}>⏳</div>
    </div>
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      {/* Top bar */}
      <div style={{
        padding: 'calc(16px + var(--safe-top)) 20px 12px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <button
            onClick={() => setShowFinishModal(true)}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '20px', padding: '4px' }}
          >
            ←
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '22px', color: 'var(--text-primary)' }}>{workout.name}</h1>
          </div>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 12px',
            fontFamily: 'var(--font-display)',
            fontSize: '22px',
            color: 'var(--blue-bright)',
            letterSpacing: '0.04em',
          }}>
            {formatDuration(elapsed)}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="progress-bar" style={{ flex: 1 }}>
            <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0 }}>
            {doneSets}/{totalSets} séries
          </span>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="scroll-container" style={{ flex: 1, padding: '16px 16px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {workout.exercises.map((exercise, i) => (
            <div key={exercise.id} style={{ animation: i === currentExercise ? 'glow 2s infinite' : 'none' }}>
              <ExerciseCard
                exercise={exercise}
                exerciseIndex={i}
                lastWeight={lastWeights[exercise.name]?.weight}
                completedSets={completedSets[exercise.id] || 0}
                currentSetData={setData[exercise.id] || { weight: 0, reps: exercise.reps }}
                isActive={i === currentExercise && (completedSets[exercise.id] || 0) < exercise.sets}
                onSetComplete={() => handleSetComplete(exercise)}
                onWeightChange={(w) => setSetData(prev => ({
                  ...prev,
                  [exercise.id]: { ...prev[exercise.id], weight: w }
                }))}
                onRepsChange={(r) => setSetData(prev => ({
                  ...prev,
                  [exercise.id]: { ...prev[exercise.id], reps: r }
                }))}
              />
            </div>
          ))}

          {/* Rest Timer */}
          {showRest && (
            <div id="rest-timer" style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--blue)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-glow-blue)',
            }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--blue-bright)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  ⏸ Descanso
                </p>
              </div>
              <RestTimer
                onComplete={() => {
                  setShowRest(false);
                  vibrate([200, 100, 200]);
                }}
                onDismiss={() => setShowRest(false)}
              />
            </div>
          )}

          {/* Finish button */}
          {allDone && (
            <button
              className="btn btn-success"
              onClick={handleFinish}
              style={{ width: '100%', fontSize: '18px', minHeight: 60, animation: 'pulse 2s infinite' }}
            >
              🏆 Finalizar Treino
            </button>
          )}

          {!allDone && doneSets > 0 && (
            <button
              className="btn btn-ghost"
              onClick={() => setShowFinishModal(true)}
              style={{ width: '100%', fontSize: '14px' }}
            >
              Encerrar treino antecipado
            </button>
          )}
        </div>
      </div>

      {/* Finish modal */}
      {showFinishModal && (
        <div className="modal-overlay" onClick={() => setShowFinishModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Encerrar Treino?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
              Tempo: {formatDuration(elapsed)} · {doneSets}/{totalSets} séries concluídas
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="btn btn-success" onClick={handleFinish}>
                💾 Salvar e Finalizar
              </button>
              <button className="btn btn-danger" onClick={() => navigate('/')}>
                🗑️ Descartar Treino
              </button>
              <button className="btn btn-ghost" onClick={() => setShowFinishModal(false)}>
                Continuar Treinando
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
