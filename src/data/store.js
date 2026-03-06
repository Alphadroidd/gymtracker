// Default exercise GIFs from exercisedb/public sources
export const EXERCISE_GIFS = {
  'Lat Pulldown': 'https://media.giphy.com/media/l0HlQ7LRalQqdWfao/giphy.gif',
  'Leg Extension': 'https://media.giphy.com/media/3ohs4gSs2RpKLSVqKk/giphy.gif',
  'Hip Adductor': 'https://media.giphy.com/media/xUA7bdpTBZfQJrNVlu/giphy.gif',
  'Tríceps na Corda': 'https://media.giphy.com/media/l0HlHFRbmaZtBRhXG/giphy.gif',
  'Bíceps Curl': 'https://media.giphy.com/media/3oEjI6bNGzjVPMSN9u/giphy.gif',
  'Abdominal': 'https://media.giphy.com/media/1qfKN8Dt0CRdCRxz9q/giphy.gif',
  'Leg Press': 'https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif',
  'Seated Leg Curl': 'https://media.giphy.com/media/3o7TKSx0g7RqRnVqKQ/giphy.gif',
  'Hip Abductor': 'https://media.giphy.com/media/xUA7bdVBDLAbKCCxKU/giphy.gif',
  'Chest Press': 'https://media.giphy.com/media/l0HlAgJTVaAPFKFqw/giphy.gif',
};

export const DEFAULT_WORKOUTS = [
  {
    id: 'workout-a',
    name: 'Treino A',
    color: '#4d94ff',
    exercises: [
      { id: 'e1', name: 'Lat Pulldown', sets: 3, reps: 10, weight: 0 },
      { id: 'e2', name: 'Leg Extension', sets: 3, reps: 10, weight: 0 },
      { id: 'e3', name: 'Hip Adductor', sets: 3, reps: 10, weight: 0 },
      { id: 'e4', name: 'Tríceps na Corda', sets: 3, reps: 10, weight: 0 },
      { id: 'e5', name: 'Bíceps Curl', sets: 3, reps: 10, weight: 0 },
      { id: 'e6', name: 'Abdominal', sets: 3, reps: 15, weight: 0 },
    ]
  },
  {
    id: 'workout-b',
    name: 'Treino B',
    color: '#ff7b00',
    exercises: [
      { id: 'e7', name: 'Leg Press', sets: 3, reps: 10, weight: 0 },
      { id: 'e8', name: 'Seated Leg Curl', sets: 3, reps: 10, weight: 0 },
      { id: 'e9', name: 'Hip Abductor', sets: 3, reps: 10, weight: 0 },
      { id: 'e10', name: 'Chest Press', sets: 3, reps: 10, weight: 0 },
      { id: 'e11', name: 'Abdominal', sets: 3, reps: 15, weight: 0 },
    ]
  }
];

// Storage helpers
const KEYS = {
  WORKOUTS: 'gt_workouts',
  HISTORY: 'gt_history',
  INITIALIZED: 'gt_initialized',
  WEIGHT_HISTORY: 'gt_weight_history',
};

export function initializeData() {
  if (!localStorage.getItem(KEYS.INITIALIZED)) {
    localStorage.setItem(KEYS.WORKOUTS, JSON.stringify(DEFAULT_WORKOUTS));
    localStorage.setItem(KEYS.HISTORY, JSON.stringify([]));
    localStorage.setItem(KEYS.WEIGHT_HISTORY, JSON.stringify({}));
    localStorage.setItem(KEYS.INITIALIZED, 'true');
  }
}

export function getWorkouts() {
  const data = localStorage.getItem(KEYS.WORKOUTS);
  return data ? JSON.parse(data) : [];
}

export function saveWorkouts(workouts) {
  localStorage.setItem(KEYS.WORKOUTS, JSON.stringify(workouts));
}

export function getHistory() {
  const data = localStorage.getItem(KEYS.HISTORY);
  return data ? JSON.parse(data) : [];
}

export function saveSession(session) {
  const history = getHistory();
  history.unshift(session);
  localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));

  // Update weight history for each exercise
  const weightHistory = getWeightHistory();
  if (session.exercises) {
    session.exercises.forEach(ex => {
      if (!weightHistory[ex.name]) weightHistory[ex.name] = [];
      weightHistory[ex.name].push({
        date: session.date,
        weight: ex.weight,
        reps: ex.reps,
        sets: ex.completedSets || ex.sets,
      });
    });
  }
  localStorage.setItem(KEYS.WEIGHT_HISTORY, JSON.stringify(weightHistory));
}

export function getWeightHistory() {
  const data = localStorage.getItem(KEYS.WEIGHT_HISTORY);
  return data ? JSON.parse(data) : {};
}

export function getLastWeights() {
  const history = getHistory();
  const lastWeights = {};
  history.forEach(session => {
    if (session.exercises) {
      session.exercises.forEach(ex => {
        if (!lastWeights[ex.name]) {
          lastWeights[ex.name] = { weight: ex.weight, date: session.date };
        }
      });
    }
  });
  return lastWeights;
}

export function exportData() {
  return {
    workouts: getWorkouts(),
    history: getHistory(),
    weightHistory: getWeightHistory(),
    exportedAt: new Date().toISOString(),
  };
}

export function importData(data) {
  if (data.workouts) localStorage.setItem(KEYS.WORKOUTS, JSON.stringify(data.workouts));
  if (data.history) localStorage.setItem(KEYS.HISTORY, JSON.stringify(data.history));
  if (data.weightHistory) localStorage.setItem(KEYS.WEIGHT_HISTORY, JSON.stringify(data.weightHistory));
  localStorage.setItem(KEYS.INITIALIZED, 'true');
}

export function deleteSession(id) {
  const history = getHistory().filter(s => s.id !== id);
  localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
}

export function getWeekStats() {
  const history = getHistory();
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const weekSessions = history.filter(s => new Date(s.date) >= weekStart);
  const totalMinutes = weekSessions.reduce((acc, s) => acc + (s.duration || 0), 0);

  return {
    sessions: weekSessions.length,
    totalMinutes,
    sessions_data: weekSessions,
  };
}
