'use client';

import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type {
  User,
  AppScreen,
  UserLevel,
  BeginnerOnboarding,
  AdvancedOnboarding,
  UserProfile,
  EnergyLevel,
  WorkoutSession,
  WeeklySession,
  WeekRecord,
  WorkoutMode,
  Exercise,
  ExerciseVariation,
  ExerciseLog
} from '@/types/user';

// Exercise variations with demonstration GIFs
const EXERCISE_VARIATIONS: Record<string, ExerciseVariation[]> = {
  'sentadilla': [
    { id: 'squat-barbell', name: 'Con barra', type: 'barbell', imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/BARBELL-SQUAT.gif' },
    { id: 'squat-goblet', name: 'Goblet (mancuerna)', type: 'dumbbells', imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Goblet-Squat.gif' },
    { id: 'squat-machine', name: 'En máquina Smith', type: 'machine', imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/09/Smith-Machine-Squat.gif' },
    { id: 'squat-bodyweight', name: 'Sin peso', type: 'bodyweight', imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Bodyweight-Squat.gif' },
  ],
  'press-banca': [
    { id: 'bench-barbell', name: 'Con barra', type: 'barbell', imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bench-Press.gif' },
    { id: 'bench-dumbbell', name: 'Con mancuernas', type: 'dumbbells', imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Press.gif' },
    { id: 'bench-machine', name: 'En máquina', type: 'machine', imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/09/Chest-Press-Machine.gif' },
  ],
  'remo': [
    { id: 'row-barbell', name: 'Con barra', type: 'barbell', imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bent-Over-Row.gif' },
    { id: 'row-dumbbell', name: 'Con mancuerna', type: 'dumbbells', imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Row.gif' },
    { id: 'row-cable', name: 'Con cable', type: 'cable', imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Seated-Cable-Row.gif' },
    { id: 'row-machine', name: 'En máquina', type: 'machine', imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2022/02/Lever-T-Bar-Row.gif' },
  ],
  'press-hombro': [
    { id: 'ohp-barbell', name: 'Con barra', type: 'barbell', imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Shoulder-Press.gif' },
    { id: 'ohp-dumbbell', name: 'Con mancuernas', type: 'dumbbells', imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Shoulder-Press.gif' },
    { id: 'ohp-machine', name: 'En máquina', type: 'machine', imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Lever-Shoulder-Press.gif' },
  ],
  'curl-biceps': [
    { id: 'curl-barbell', name: 'Con barra', type: 'barbell', imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Curl.gif' },
    { id: 'curl-dumbbell', name: 'Con mancuernas', type: 'dumbbells', imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Curl.gif' },
    { id: 'curl-cable', name: 'Con cable', type: 'cable', imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Cable-Curl.gif' },
    { id: 'curl-machine', name: 'En máquina', type: 'machine', imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/09/Lever-Preacher-Curl.gif' },
  ],
  'peso-muerto': [
    { id: 'dl-barbell', name: 'Con barra', type: 'barbell', imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Deadlift.gif' },
    { id: 'dl-dumbbell', name: 'Con mancuernas', type: 'dumbbells', imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Deadlift.gif' },
    { id: 'dl-romanian', name: 'Rumano', type: 'barbell', imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Romanian-Deadlift.gif' },
  ],
  'zancada': [
    { id: 'lunge-bodyweight', name: 'Sin peso', type: 'bodyweight', imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Lunges.gif' },
    { id: 'lunge-dumbbell', name: 'Con mancuernas', type: 'dumbbells', imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lunges.gif' },
    { id: 'lunge-barbell', name: 'Con barra', type: 'barbell', imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Barbell-Lunge.gif' },
  ],
};

// Sample exercises for workouts with variations
const SAMPLE_EXERCISES: Record<string, Exercise[]> = {
  'full-body': [
    {
      id: 'fb1',
      name: 'Sentadilla goblet',
      targetMuscle: 'legs',
      sets: 3,
      reps: [12, 10, 10],
      restSeconds: 90,
      alternatives: ['Sentadilla en máquina', 'Prensa de piernas'],
      instructions: 'Mantén la espalda recta y baja controlado',
      variations: EXERCISE_VARIATIONS['sentadilla'],
      imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Goblet-Squat.gif'
    },
    {
      id: 'fb2',
      name: 'Press de banca con mancuernas',
      targetMuscle: 'chest',
      sets: 3,
      reps: [12, 10, 10],
      restSeconds: 90,
      alternatives: ['Press de banca con barra', 'Press en máquina'],
      instructions: 'Baja hasta que los codos formen 90 grados',
      variations: EXERCISE_VARIATIONS['press-banca'],
      imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Press.gif'
    },
    {
      id: 'fb3',
      name: 'Remo con mancuerna',
      targetMuscle: 'back',
      sets: 3,
      reps: [12, 12, 12],
      restSeconds: 60,
      alternatives: ['Remo en máquina', 'Remo con cable'],
      instructions: 'Aprieta el omóplato arriba',
      variations: EXERCISE_VARIATIONS['remo'],
      imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Row.gif'
    },
    {
      id: 'fb4',
      name: 'Press militar sentado',
      targetMuscle: 'shoulders',
      sets: 3,
      reps: [12, 10, 10],
      restSeconds: 60,
      alternatives: ['Press militar en máquina', 'Elevaciones laterales'],
      instructions: 'No arquees la espalda',
      variations: EXERCISE_VARIATIONS['press-hombro'],
      imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Shoulder-Press.gif'
    },
    {
      id: 'fb5',
      name: 'Plancha',
      targetMuscle: 'core',
      sets: 3,
      reps: [30, 30, 30],
      restSeconds: 45,
      alternatives: ['Plancha lateral', 'Dead bug'],
      instructions: 'Mantén el core apretado, 30 segundos',
      imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Front-Plank.gif'
    },
  ],
  'upper-body': [
    {
      id: 'ub1',
      name: 'Press de banca',
      targetMuscle: 'chest',
      sets: 3,
      reps: [10, 10, 8],
      restSeconds: 90,
      alternatives: ['Press de banca con mancuernas', 'Press en máquina'],
      instructions: 'Baja la barra al pecho controladamente',
      variations: EXERCISE_VARIATIONS['press-banca'],
      imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bench-Press.gif'
    },
    {
      id: 'ub2',
      name: 'Remo con barra',
      targetMuscle: 'back',
      sets: 3,
      reps: [10, 10, 10],
      restSeconds: 90,
      alternatives: ['Remo con mancuerna', 'Remo en máquina'],
      instructions: 'Mantén la espalda recta',
      variations: EXERCISE_VARIATIONS['remo'],
      imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bent-Over-Row.gif'
    },
    {
      id: 'ub3',
      name: 'Press de hombros',
      targetMuscle: 'shoulders',
      sets: 3,
      reps: [12, 10, 10],
      restSeconds: 60,
      alternatives: ['Press Arnold', 'Elevaciones laterales'],
      instructions: 'Controla el movimiento',
      variations: EXERCISE_VARIATIONS['press-hombro'],
      imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Shoulder-Press.gif'
    },
    {
      id: 'ub4',
      name: 'Curl de bíceps',
      targetMuscle: 'arms',
      sets: 2,
      reps: [12, 12],
      restSeconds: 45,
      alternatives: ['Curl martillo', 'Curl en máquina'],
      instructions: 'No balancees el cuerpo',
      variations: EXERCISE_VARIATIONS['curl-biceps'],
      imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Curl.gif'
    },
    {
      id: 'ub5',
      name: 'Face pull',
      targetMuscle: 'shoulders',
      sets: 2,
      reps: [15, 15],
      restSeconds: 45,
      alternatives: ['Band pull apart', 'Remo al cuello'],
      instructions: 'Tira hacia la cara con los codos altos',
      imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Face-Pull.gif'
    },
  ],
  'lower-body': [
    {
      id: 'lb1',
      name: 'Sentadilla',
      targetMuscle: 'legs',
      sets: 3,
      reps: [10, 10, 8],
      restSeconds: 120,
      alternatives: ['Sentadilla goblet', 'Prensa de piernas'],
      instructions: 'Baja hasta que los muslos estén paralelos',
      variations: EXERCISE_VARIATIONS['sentadilla'],
      imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/BARBELL-SQUAT.gif'
    },
    {
      id: 'lb2',
      name: 'Peso muerto rumano',
      targetMuscle: 'legs',
      sets: 3,
      reps: [10, 10, 10],
      restSeconds: 90,
      alternatives: ['Peso muerto con mancuernas', 'Curl femoral'],
      instructions: 'Mantén las piernas ligeramente flexionadas',
      variations: EXERCISE_VARIATIONS['peso-muerto'],
      imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Romanian-Deadlift.gif'
    },
    {
      id: 'lb3',
      name: 'Zancadas',
      targetMuscle: 'legs',
      sets: 3,
      reps: [10, 10, 10],
      restSeconds: 60,
      alternatives: ['Zancadas caminando', 'Step up'],
      instructions: '10 repeticiones por pierna',
      variations: EXERCISE_VARIATIONS['zancada'],
      imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lunges.gif'
    },
    {
      id: 'lb4',
      name: 'Extensión de cuádriceps',
      targetMuscle: 'legs',
      sets: 2,
      reps: [15, 15],
      restSeconds: 45,
      alternatives: ['Sentadilla búlgara', 'Prensa de piernas'],
      instructions: 'Extiende completamente',
      imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/LEG-EXTENSION.gif'
    },
    {
      id: 'lb5',
      name: 'Curl femoral',
      targetMuscle: 'legs',
      sets: 2,
      reps: [15, 15],
      restSeconds: 45,
      alternatives: ['Peso muerto rumano', 'Hip thrust'],
      instructions: 'Contrae arriba',
      imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Leg-Curl.gif'
    },
    {
      id: 'lb6',
      name: 'Elevación de gemelos',
      targetMuscle: 'legs',
      sets: 3,
      reps: [15, 15, 15],
      restSeconds: 30,
      alternatives: ['Gemelos en máquina', 'Gemelos sentado'],
      instructions: 'Sube hasta arriba',
      imageUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Calf-Raise.gif'
    },
  ],
};

// Generate weekly sessions based on user preferences
// startFrom: global session number for the first session of the new week (enables continuous numbering)
// Distribuye N sesiones de lunes(0) a domingo(6) de forma equidistante
function distributeDays(daysPerWeek: number): number[] {
  // Distribución predefinida: prioriza lunes, miércoles, viernes, sábado...
  const PREFERRED: Record<number, number[]> = {
    1: [0],
    2: [0, 3],
    3: [0, 2, 4],
    4: [0, 1, 3, 5],
    5: [0, 1, 2, 4, 5],
    6: [0, 1, 2, 3, 4, 5],
    7: [0, 1, 2, 3, 4, 5, 6],
  };
  return PREFERRED[daysPerWeek] ?? [0, 2, 4].slice(0, daysPerWeek);
}

function generateWeeklySessions(daysPerWeek: number, workoutDuration: string, startFrom = 1, customDays?: number[]): WeeklySession[] {
  const sessionTemplates = [
    { name: 'Full Body', targetMuscles: 'Todo el cuerpo', exercises: SAMPLE_EXERCISES['full-body'] },
    { name: 'Tren Superior', targetMuscles: 'Pecho, espalda, hombros', exercises: SAMPLE_EXERCISES['upper-body'] },
    { name: 'Tren Inferior', targetMuscles: 'Piernas y core', exercises: SAMPLE_EXERCISES['lower-body'] },
    { name: 'Full Body', targetMuscles: 'Todo el cuerpo', exercises: SAMPLE_EXERCISES['full-body'] },
  ];

  const duration = workoutDuration === '30min' ? 30 : workoutDuration === '45min' ? 45 : workoutDuration === '1hour' ? 60 : 45;
  const days = customDays ?? distributeDays(daysPerWeek);

  const sessions: WeeklySession[] = [];
  for (let i = 0; i < daysPerWeek; i++) {
    const template = sessionTemplates[i % sessionTemplates.length];
    sessions.push({
      id: crypto.randomUUID(),
      sessionNumber: startFrom + i,
      name: template.name,
      targetMuscles: template.targetMuscles,
      duration,
      exercises: template.exercises,
      status: i === 0 ? 'available' : 'locked',
      dayOfWeek: days[i] ?? i,
    });
  }

  return sessions;
}

// Check if it's a new week (Sunday or first app open of the week)
function isNewWeek(lastCheckIn?: Date): boolean {
  if (!lastCheckIn) return false;

  const now = new Date();
  const lastCheck = new Date(lastCheckIn);

  // Get Monday of current week
  const currentMonday = new Date(now);
  currentMonday.setDate(now.getDate() - now.getDay() + 1);
  currentMonday.setHours(0, 0, 0, 0);

  // Get Monday of last check-in week
  const lastMonday = new Date(lastCheck);
  lastMonday.setDate(lastCheck.getDate() - lastCheck.getDay() + 1);
  lastMonday.setHours(0, 0, 0, 0);

  return currentMonday > lastMonday;
}

interface AppContextType {
  screen: AppScreen;
  setScreen: (screen: AppScreen) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  userLevel: UserLevel | null;
  setUserLevel: (level: UserLevel | null) => void;
  beginnerOnboarding: Partial<BeginnerOnboarding>;
  setBeginnerOnboarding: (data: Partial<BeginnerOnboarding>) => void;
  advancedOnboarding: Partial<AdvancedOnboarding>;
  setAdvancedOnboarding: (data: Partial<AdvancedOnboarding>) => void;
  userProfile: Partial<UserProfile>;
  setUserProfile: (data: Partial<UserProfile>) => void;
  todayEnergy: EnergyLevel | null;
  setTodayEnergy: (energy: EnergyLevel | null) => void;
  currentSession: WorkoutSession | null;
  setCurrentSession: (session: WorkoutSession | null) => void;
  selectedWeeklySession: WeeklySession | null;
  setSelectedWeeklySession: (session: WeeklySession | null) => void;
  workoutMode: WorkoutMode | null;
  setWorkoutMode: (mode: WorkoutMode | null) => void;
  showWeeklyCheckIn: boolean;
  setShowWeeklyCheckIn: (show: boolean) => void;
  exerciseLogs: ExerciseLog[];
  authLoading: boolean;
  supabaseUserId: string | null;
  isDark: boolean;
  toggleDarkMode: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: (finalProfile?: Partial<UserProfile>) => void;
  completeWeeklySession: (sessionId: string, logs?: ExerciseLog[]) => void;
  moveSession: (sessionId: string, toSessionNumber: number) => void;
  removeSession: (sessionId: string) => void;
  addSessionFromCoach: (workout: import('@/types/user').CoachWorkout) => void;
  handleWeeklyCheckIn: (preference: 'same' | 'change' | 'decide-later') => void;
  /** true cuando todas las sesiones de la semana están completadas y el usuario aún no ha planificado la siguiente */
  weekPlannerPending: boolean;
  /** Genera las sesiones para la próxima semana (para mostrárselas en el planificador antes de confirmar) */
  generateNextWeekPreview: () => WeeklySession[];
  /** Archiva la semana actual y guarda el plan editado para la nueva semana */
  startNewWeekWithPlan: (sessions: WeeklySession[]) => void;
  getExerciseHistory: (exerciseId: string) => ExerciseLog[];
  getExerciseByName: (name: string) => Exercise | undefined;
  getExerciseCatalog: () => Exercise[];
  updateSessionExercises: (sessionId: string, exercises: Exercise[]) => void;
  updateAvatar: (file: File) => Promise<void>;
  resetApp: () => void;
  seedDemoWeeks: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreen] = useState<AppScreen>('auth');
  const [user, setUser] = useState<User | null>(null);
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [beginnerOnboarding, setBeginnerOnboarding] = useState<Partial<BeginnerOnboarding>>({});
  const [advancedOnboarding, setAdvancedOnboarding] = useState<Partial<AdvancedOnboarding>>({});
  const [userProfile, setUserProfile] = useState<Partial<UserProfile>>({});
  const [todayEnergy, setTodayEnergy] = useState<EnergyLevel | null>(null);
  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(null);
  const [selectedWeeklySession, setSelectedWeeklySession] = useState<WeeklySession | null>(null);
  const [workoutMode, setWorkoutMode] = useState<WorkoutMode | null>(null);
  const [showWeeklyCheckIn, setShowWeeklyCheckIn] = useState(false);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const saved = localStorage.getItem('fitmente-dark-mode');
    const dark = saved === 'true';
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  function toggleDarkMode() {
    setIsDark(prev => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('fitmente-dark-mode', String(next));
      return next;
    });
  }

  // On mount: check Supabase session, then load user data
  useEffect(() => {
    async function initAuth() {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setSupabaseUserId(session.user.id);
        await loadUserFromDB(session.user.id);
      } else {
        // Fall back to localStorage for users without account yet
        const savedUser = localStorage.getItem('fitmente-user');
        const savedLogs = localStorage.getItem('fitmente-exercise-logs');

        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser);
            setUser(parsed);
            if (parsed.lastWeeklyCheckIn && isNewWeek(new Date(parsed.lastWeeklyCheckIn))) {
              setShowWeeklyCheckIn(true);
            }
            setScreen('dashboard');
          } catch { /* ignore */ }
        }

        if (savedLogs) {
          try { setExerciseLogs(JSON.parse(savedLogs)); } catch { /* ignore */ }
        }

        setScreen('auth');
      }

      setAuthLoading(false);
    }

    initAuth();

    // Listen for auth state changes (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setSupabaseUserId(session.user.id);
      } else {
        setSupabaseUserId(null);
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadUserFromDB(userId: string) {
    try {
      const [onboardingRes, profileRes, sessionsRes, logsRes, weeklyHistoryRes] = await Promise.all([
        fetch('/api/onboarding'),
        fetch('/api/profile'),
        fetch('/api/sessions/weekly'),
        fetch('/api/history'),
        fetch('/api/history/weekly'),
      ]);

      const [onboardingData, profileData, sessionsData, historyData, weeklyHistoryData] = await Promise.all([
        onboardingRes.json(),
        profileRes.json(),
        sessionsRes.json(),
        logsRes.json(),
        weeklyHistoryRes.json(),
      ]);

      if (onboardingData.data) {
        const ob = onboardingData.data;
        const profile = profileData.data ?? {};
        const sessionExerciseMap: Record<string, Exercise[]> = {
          'Full Body': SAMPLE_EXERCISES['full-body'],
          'Tren Superior': SAMPLE_EXERCISES['upper-body'],
          'Tren Inferior': SAMPLE_EXERCISES['lower-body'],
        };

        // Re-attach variations from local catalog (not stored in DB)
        const allSampleExercises = Object.values(SAMPLE_EXERCISES).flat();
        const enrichWithVariations = (exs: Exercise[]): Exercise[] =>
          exs.map(ex => {
            const ref = allSampleExercises.find(r => r.id === ex.id);
            return ref ? { ...ex, variations: ref.variations, alternatives: ref.alternatives } : ex;
          });

        let weeklySessions: WeeklySession[] = (sessionsData.data ?? []).map((s: Record<string, unknown>) => {
          const dbExercises = s.exercises as Exercise[] | null;
          const baseExercises = dbExercises && dbExercises.length > 0
            ? dbExercises
            : sessionExerciseMap[s.name as string] ?? SAMPLE_EXERCISES['full-body'];
          const exercises = enrichWithVariations(baseExercises);
          return {
            id: s.id as string,
            sessionNumber: s.session_number as number,
            name: s.name as string,
            targetMuscles: s.target_muscles as string,
            duration: s.duration as number,
            exercises,
            status: s.status as 'completed' | 'available' | 'locked',
            completedAt: s.completed_at ? new Date(s.completed_at as string) : undefined,
          };
        });

        // Si no hay sesiones para esta semana, regenerarlas automáticamente
        if (weeklySessions.length === 0) {
          const daysPerWeek = ob.days_per_week as number ?? 3;
          const workoutDuration = ob.workout_duration as string ?? '45min';
          weeklySessions = generateWeeklySessions(daysPerWeek, workoutDuration);
          fetch('/api/sessions/weekly', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(weeklySessions),
          }).catch(() => { /* silently ignore */ });
        }

        // Extract exercise logs from history
        const allLogs: ExerciseLog[] = (historyData.data ?? []).flatMap(
          (ws: Record<string, unknown>) =>
            ((ws.exercise_logs as Record<string, unknown>[]) ?? []).map((l: Record<string, unknown>) => ({
              exerciseId: l.exercise_id as string,
              setNumber: l.set_number as number,
              weight: l.weight as number | undefined,
              reps: l.reps as number,
              timestamp: new Date(l.timestamp as string),
            }))
        );
        setExerciseLogs(allLogs);

        const restoredUser: User = {
          id: userId,
          level: ob.level,
          onboarding: ob.level === 'beginner'
            ? {
                experienceLevel: ob.experience_level,
                goal: ob.beginner_goal,
                daysPerWeek: ob.days_per_week,
                trainingDays: ob.training_days ?? [],
                workoutDuration: ob.workout_duration,
                gymComfort: ob.gym_comfort,
              } as BeginnerOnboarding
            : {
                goal: ob.advanced_goal,
                trainingStyle: ob.training_style,
                daysPerWeek: ob.days_per_week,
                availability: ob.availability,
                priorityMuscle: ob.priority_muscle,
                appTone: ob.app_tone,
              } as AdvancedOnboarding,
          profile: {
            name: profile.name ?? '',
            biologicalProfile: profile.biological_profile ?? 'male',
            weight: profile.weight ?? 0,
            height: profile.height ?? 0,
            ageRange: profile.age_range ?? 'under-25',
            otherSports: profile.other_sports ?? [],
            otherSportsDays: profile.other_sports_days ?? 0,
            injuries: profile.injuries ?? [],
            excludedExercises: profile.excluded_exercises ?? [],
            measurements: profile.measurements ?? {},
            avatarUrl: profile.avatar_url ?? undefined,
          },
          sessions: [],
          weeklySessions,
          createdAt: new Date(ob.created_at),
          currentWeek: 1,
          lastWeeklyCheckIn: new Date(),
          totalCompletedSessions: weeklySessions.filter(s => s.status === 'completed').length,
        };

        // Cargar historial semanal desde Supabase (con migración desde localStorage si hace falta)
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let weeklyHistory: any[] = (weeklyHistoryData?.data ?? []);

          // Migración única: si Supabase está vacío pero hay datos en localStorage, súbelos
          if (weeklyHistory.length === 0) {
            const lsKey = `fitmente-weekly-history-${userId}`;
            const legacyKey = `fitmente-weekly-history-${ob.id}`;
            const stored = localStorage.getItem(lsKey) ?? localStorage.getItem(legacyKey);
            if (stored) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              weeklyHistory = JSON.parse(stored) as any[];
              // Sube el historial heredado a Supabase
              fetch('/api/history/weekly', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(weeklyHistory),
              }).catch(() => { /* ignore */ });
            }
          }

          if (weeklyHistory.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            restoredUser.weeklyHistory = weeklyHistory.map((w: any) => ({
              ...w,
              sessions: (w.sessions ?? []).map((s: any) => ({
                ...s,
                completedAt: s.completedAt ? new Date(s.completedAt) : undefined,
              })),
            }));
            // Ajusta semana actual al número más alto
            const maxWeek = Math.max(...restoredUser.weeklyHistory!.map(w => w.weekNumber), 0);
            if (maxWeek >= restoredUser.currentWeek) restoredUser.currentWeek = maxWeek + 1;
          }
        } catch { /* ignore */ }

        setUser(restoredUser);
        setScreen('dashboard');
      } else {
        // User exists in auth but hasn't completed onboarding
        setScreen('welcome');
      }
    } catch {
      setScreen('welcome');
    }
  }

  // Keep localStorage in sync (fallback / offline support)
  useEffect(() => {
    if (user) {
      localStorage.setItem('fitmente-user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    if (exerciseLogs.length > 0) {
      localStorage.setItem('fitmente-exercise-logs', JSON.stringify(exerciseLogs));
    }
  }, [exerciseLogs]);

  async function login(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Error al iniciar sesión');

    setSupabaseUserId(data.user.id);
    await loadUserFromDB(data.user.id);
  }

  async function register(email: string, password: string) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Error al crear la cuenta');

    setSupabaseUserId(data.user.id);
    setScreen('welcome');
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    resetApp();
  }

  const completeOnboarding = async (finalProfile?: Partial<UserProfile>) => {
    const onboarding = userLevel === 'beginner'
      ? beginnerOnboarding as BeginnerOnboarding
      : advancedOnboarding as AdvancedOnboarding;

    const daysPerWeek = 'daysPerWeek' in onboarding ? onboarding.daysPerWeek : 3;
    const workoutDuration = 'workoutDuration' in onboarding ? onboarding.workoutDuration : '45min';
    const weeklySessions = generateWeeklySessions(daysPerWeek, workoutDuration || '45min');

    // Use finalProfile if provided (avoids React state batching race condition)
    const resolvedProfile = finalProfile ?? userProfile;

    const newUser: User = {
      id: supabaseUserId ?? `user-${Date.now()}`,
      level: userLevel!,
      onboarding,
      profile: resolvedProfile as UserProfile,
      sessions: [],
      weeklySessions,
      createdAt: new Date(),
      currentWeek: 1,
      lastWeeklyCheckIn: new Date(),
    };
    setUser(newUser);

    // Persist to DB if authenticated
    if (supabaseUserId) {
      const payload = userLevel === 'beginner'
        ? {
            level: userLevel,
            experience_level: (onboarding as BeginnerOnboarding).experienceLevel,
            beginner_goal: (onboarding as BeginnerOnboarding).goal,
            days_per_week: daysPerWeek,
            training_days: (onboarding as BeginnerOnboarding).trainingDays,
            workout_duration: (onboarding as BeginnerOnboarding).workoutDuration,
            gym_comfort: (onboarding as BeginnerOnboarding).gymComfort,
            profile: resolvedProfile,
          }
        : {
            level: userLevel,
            advanced_goal: (onboarding as AdvancedOnboarding).goal,
            training_style: (onboarding as AdvancedOnboarding).trainingStyle,
            days_per_week: daysPerWeek,
            availability: (onboarding as AdvancedOnboarding).availability,
            priority_muscle: (onboarding as AdvancedOnboarding).priorityMuscle,
            app_tone: (onboarding as AdvancedOnboarding).appTone,
            profile: resolvedProfile,
          };

      fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(async res => {
          if (!res.ok) console.error('[onboarding] Error al guardar:', await res.json());
          else console.log('[onboarding] Guardado correctamente en DB');
        })
        .catch(err => console.error('[onboarding] Fetch fallido:', err));

      fetch('/api/sessions/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(weeklySessions),
      })
        .then(async res => {
          if (!res.ok) console.error('[sessions] Error al guardar:', await res.json());
          else console.log('[sessions] Sesiones guardadas en DB');
        })
        .catch(err => console.error('[sessions] Fetch fallido:', err));
    }

    setScreen('check-in');
  };

  const completeWeeklySession = async (sessionId: string, logs?: ExerciseLog[]) => {
    if (!user) return;

    const updatedSessions = user.weeklySessions.map(session =>
      session.id === sessionId
        ? { ...session, status: 'completed' as const, completedAt: new Date() }
        : session
    );

    const currentTotal = user.totalCompletedSessions || 0;

    setUser({
      ...user,
      weeklySessions: updatedSessions,
      totalCompletedSessions: currentTotal + 1,
    });

    if (logs && logs.length > 0) {
      setExerciseLogs(prev => [...prev, ...logs]);
    }

    // Persist to DB if authenticated
    if (supabaseUserId) {
      // Mark session as completed
      fetch(`/api/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed', completedAt: new Date().toISOString() }),
      }).catch(() => { /* silently ignore */ });

      // Create workout session record + logs
      if (logs && logs.length > 0) {
        fetch('/api/workouts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            weeklySessionId: sessionId,
            date: new Date().toISOString(),
            energyLevel: todayEnergy,
            completed: true,
            mode: workoutMode,
          }),
        })
          .then(res => res.json())
          .then(data => {
            if (data.data?.id) {
              fetch(`/api/workouts/${data.data.id}/logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(logs),
              }).catch(() => { /* silently ignore */ });
            }
          })
          .catch(() => { /* silently ignore */ });
      }
    }
  };

  const moveSession = (sessionId: string, toSessionNumber: number) => {
    if (!user) return;

    const sessionToMove = user.weeklySessions.find(s => s.id === sessionId);
    if (!sessionToMove) return;

    // Reorder sessions
    const otherSessions = user.weeklySessions.filter(s => s.id !== sessionId);
    const newSessions = [...otherSessions];
    newSessions.splice(toSessionNumber - 1, 0, sessionToMove);

    // Update session numbers
    const updatedSessions = newSessions.map((s, i) => ({
      ...s,
      sessionNumber: i + 1,
    }));

    setUser({
      ...user,
      weeklySessions: updatedSessions,
    });
  };

  const removeSession = (sessionId: string) => {
    if (!user) return;

    const updatedSessions = user.weeklySessions
      .filter(s => s.id !== sessionId)
      .map((s, i) => ({ ...s, sessionNumber: i + 1 }));

    setUser({
      ...user,
      weeklySessions: updatedSessions,
    });
  };

  const addSessionFromCoach = (workout: import('@/types/user').CoachWorkout) => {
    if (!user) return;

    const newSession: WeeklySession = {
      id: crypto.randomUUID(),
      sessionNumber: user.weeklySessions.length + 1,
      name: workout.name,
      targetMuscles: workout.targetMuscles,
      duration: workout.duration,
      exercises: workout.exercises.map((ex, i) => ({
        id: `coach-${Date.now()}-${i}`,
        name: ex.name,
        targetMuscle: 'none' as const,
        sets: ex.sets,
        reps: ex.reps,
        restSeconds: ex.restSeconds,
        instructions: ex.instructions,
        alternatives: [],
        variations: [],
      })),
      status: 'available',
    };

    const updatedSessions = [...user.weeklySessions, newSession];
    setUser({ ...user, weeklySessions: updatedSessions });

    if (supabaseUserId) {
      fetch('/api/sessions/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSessions),
      }).catch(() => {});
    }

    setScreen('dashboard');
  };

  const HISTORY_LS_KEY = supabaseUserId ? `fitmente-weekly-history-${supabaseUserId}` : null;

  // Persiste el historial semanal: Supabase (fuente de verdad) + localStorage (respaldo offline)
  const saveHistoryToLS = (history: WeekRecord[]) => {
    if (HISTORY_LS_KEY) {
      try { localStorage.setItem(HISTORY_LS_KEY, JSON.stringify(history)); } catch { /* ignore */ }
    }
    if (supabaseUserId && history.length > 0) {
      fetch('/api/history/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(history),
      }).catch(() => { /* ignore */ });
    }
  };

  const handleWeeklyCheckIn = (preference: 'same' | 'change' | 'decide-later') => {
    if (!user) return;

    const onboarding = user.onboarding as BeginnerOnboarding;
    const daysPerWeek = onboarding.daysPerWeek || 3;
    const workoutDuration = onboarding.workoutDuration || '45min';

    // Archive the current week before rolling over
    const weekRecord: WeekRecord = {
      weekNumber: user.currentWeek,
      sessions: user.weeklySessions.map(s => ({
        ...s,
        completedAt: s.completedAt ? new Date(s.completedAt) : undefined,
      })),
      startedAt: user.lastWeeklyCheckIn?.toISOString() || new Date().toISOString(),
      closedAt: new Date().toISOString(),
    };
    const updatedHistory = [...(user.weeklyHistory || []), weekRecord];
    saveHistoryToLS(updatedHistory);

    // Calculate starting session number for new week (continuous numbering)
    const lastSessionNum = user.weeklySessions.reduce((max, s) => Math.max(max, s.sessionNumber), 0);
    const nextStartFrom = lastSessionNum + 1;

    if (preference === 'same') {
      const newSessions = generateWeeklySessions(daysPerWeek, workoutDuration, nextStartFrom);
      setUser({
        ...user,
        weeklySessions: newSessions,
        weeklyHistory: updatedHistory,
        currentWeek: user.currentWeek + 1,
        lastWeeklyCheckIn: new Date(),
      });
    } else if (preference === 'decide-later') {
      setUser({
        ...user,
        weeklyHistory: updatedHistory,
        currentWeek: user.currentWeek + 1,
        lastWeeklyCheckIn: new Date(),
      });
    }

    setShowWeeklyCheckIn(false);
  };

  // ── Planificador semanal ──────────────────────────────────────────────────────

  // true cuando TODAS las sesiones de la semana actual están completadas
  const weekPlannerPending = !!(
    user &&
    user.weeklySessions.length > 0 &&
    user.weeklySessions.every(s => s.status === 'completed')
  );

  // Genera una preview de las sesiones de la próxima semana (sin archivar nada)
  const generateNextWeekPreview = (): WeeklySession[] => {
    if (!user) return [];
    const onboarding = user.onboarding as BeginnerOnboarding;
    const daysPerWeek = onboarding.daysPerWeek || 3;
    const workoutDuration = onboarding.workoutDuration || '45min';
    const lastSessionNum = user.weeklySessions.reduce((max, s) => Math.max(max, s.sessionNumber), 0);
    return generateWeeklySessions(daysPerWeek, workoutDuration, lastSessionNum + 1);
  };

  // Archiva la semana actual y guarda el plan confirmado por el usuario
  const startNewWeekWithPlan = (sessions: WeeklySession[]) => {
    if (!user) return;

    const weekRecord: WeekRecord = {
      weekNumber: user.currentWeek,
      sessions: user.weeklySessions.map(s => ({
        ...s,
        completedAt: s.completedAt ? new Date(s.completedAt) : undefined,
      })),
      startedAt: user.lastWeeklyCheckIn?.toISOString() || new Date().toISOString(),
      closedAt: new Date().toISOString(),
    };
    const updatedHistory = [...(user.weeklyHistory || []), weekRecord];
    saveHistoryToLS(updatedHistory);

    // Primera sesión disponible, resto bloqueadas
    const readySessions = sessions.map((s, i) => ({
      ...s,
      status: (i === 0 ? 'available' : 'locked') as import('@/types/user').SessionStatus,
    }));

    setUser({
      ...user,
      weeklySessions: readySessions,
      weeklyHistory: updatedHistory,
      currentWeek: user.currentWeek + 1,
      lastWeeklyCheckIn: new Date(),
    });

    // Persiste en BD
    if (supabaseUserId) {
      fetch('/api/sessions/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(readySessions),
      }).catch(() => {});
    }

    setShowWeeklyCheckIn(false);
  };

  // Siembra 3 semanas de entrenos de demo para comprobar el historial
  const seedDemoWeeks = () => {
    if (!user) return;
    const now = new Date();
    const daysAgo = (d: number) => { const dt = new Date(now); dt.setDate(dt.getDate() - d); return dt; };

    const makeSession = (num: number, name: string, targetMuscles: string, daysBack: number): WeeklySession => ({
      id: crypto.randomUUID(),
      sessionNumber: num,
      name,
      targetMuscles,
      duration: 45,
      exercises: SAMPLE_EXERCISES['full-body'],
      status: 'completed',
      completedAt: daysAgo(daysBack),
    });

    const fakeWeeks: WeekRecord[] = [
      {
        weekNumber: 1,
        startedAt: daysAgo(28).toISOString(),
        closedAt:  daysAgo(21).toISOString(),
        sessions: [
          makeSession(1, 'Full Body', 'Todo el cuerpo', 27),
          makeSession(2, 'Tren Superior', 'Pecho, espalda, hombros', 25),
          makeSession(3, 'Tren Inferior', 'Piernas y core', 23),
        ],
      },
      {
        weekNumber: 2,
        startedAt: daysAgo(21).toISOString(),
        closedAt:  daysAgo(14).toISOString(),
        sessions: [
          makeSession(4, 'Full Body', 'Todo el cuerpo', 20),
          makeSession(5, 'Tren Superior', 'Pecho, espalda, hombros', 18),
          makeSession(6, 'Tren Inferior', 'Piernas y core', 16),
        ],
      },
      {
        weekNumber: 3,
        startedAt: daysAgo(14).toISOString(),
        closedAt:  daysAgo(7).toISOString(),
        sessions: [
          makeSession(7, 'Full Body', 'Todo el cuerpo', 13),
          makeSession(8, 'Tren Superior', 'Pecho, espalda, hombros', 11),
          makeSession(9, 'Tren Inferior', 'Piernas y core', 9),
        ],
      },
    ];

    const updatedHistory = [...fakeWeeks, ...(user.weeklyHistory || [])];
    saveHistoryToLS(updatedHistory);
    setUser({
      ...user,
      weeklyHistory: updatedHistory,
      currentWeek: Math.max(user.currentWeek, 4),
      totalCompletedSessions: (user.totalCompletedSessions || 0) + 9,
    });
  };

  const getExerciseHistory = (exerciseId: string): ExerciseLog[] => {
    return exerciseLogs.filter(log => log.exerciseId === exerciseId);
  };

  const getExerciseByName = (name: string): Exercise | undefined => {
    const allExercisesFlat = Object.values(SAMPLE_EXERCISES).flat();
    return allExercisesFlat.find(ex => ex.name === name);
  };

  // Catálogo único de ejercicios (para añadir/cambiar en una sesión)
  const getExerciseCatalog = (): Exercise[] => {
    const flat = Object.values(SAMPLE_EXERCISES).flat();
    const seen = new Set<string>();
    return flat.filter(ex => {
      if (seen.has(ex.name)) return false;
      seen.add(ex.name);
      return true;
    });
  };

  // Reemplaza los ejercicios de una sesión y persiste
  const updateSessionExercises = (sessionId: string, exercises: Exercise[]) => {
    if (!user) return;
    const updatedSessions = user.weeklySessions.map(s =>
      s.id === sessionId ? { ...s, exercises } : s
    );
    setUser({ ...user, weeklySessions: updatedSessions });
    if (selectedWeeklySession?.id === sessionId) {
      setSelectedWeeklySession({ ...selectedWeeklySession, exercises });
    }
    if (supabaseUserId) {
      fetch('/api/sessions/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSessions),
      }).catch(() => {});
    }
  };

  const resetApp = () => {
    localStorage.removeItem('fitmente-user');
    localStorage.removeItem('fitmente-exercise-logs');
    setUser(null);
    setSupabaseUserId(null);
    setUserLevel(null);
    setBeginnerOnboarding({});
    setAdvancedOnboarding({});
    setUserProfile({});
    setTodayEnergy(null);
    setCurrentSession(null);
    setSelectedWeeklySession(null);
    setWorkoutMode(null);
    setExerciseLogs([]);
    setShowWeeklyCheckIn(false);
    setScreen('auth');
  };

  async function updateAvatar(file: File) {
    if (!user) return;
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/profile/avatar', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.url) {
      setUser({ ...user, profile: { ...user.profile, avatarUrl: data.url } });
    }
  }

  return (
    <AppContext.Provider
      value={{
        screen,
        setScreen,
        user,
        setUser,
        userLevel,
        setUserLevel,
        beginnerOnboarding,
        setBeginnerOnboarding,
        advancedOnboarding,
        setAdvancedOnboarding,
        userProfile,
        setUserProfile,
        todayEnergy,
        setTodayEnergy,
        currentSession,
        setCurrentSession,
        selectedWeeklySession,
        setSelectedWeeklySession,
        workoutMode,
        setWorkoutMode,
        showWeeklyCheckIn,
        setShowWeeklyCheckIn,
        exerciseLogs,
        authLoading,
        supabaseUserId,
        isDark,
        toggleDarkMode,
        login,
        register,
        logout,
        completeOnboarding,
        completeWeeklySession,
        moveSession,
        removeSession,
        addSessionFromCoach,
        handleWeeklyCheckIn,
        weekPlannerPending,
        generateNextWeekPreview,
        startNewWeekWithPlan,
        getExerciseHistory,
        getExerciseByName,
        getExerciseCatalog,
        updateSessionExercises,
        updateAvatar,
        resetApp,
        seedDemoWeeks,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
