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
function generateWeeklySessions(daysPerWeek: number, workoutDuration: string): WeeklySession[] {
  const sessionTemplates = [
    { name: 'Full Body', targetMuscles: 'Todo el cuerpo', exercises: SAMPLE_EXERCISES['full-body'] },
    { name: 'Tren Superior', targetMuscles: 'Pecho, espalda, hombros', exercises: SAMPLE_EXERCISES['upper-body'] },
    { name: 'Tren Inferior', targetMuscles: 'Piernas y core', exercises: SAMPLE_EXERCISES['lower-body'] },
    { name: 'Full Body', targetMuscles: 'Todo el cuerpo', exercises: SAMPLE_EXERCISES['full-body'] },
  ];

  const duration = workoutDuration === '30min' ? 30 : workoutDuration === '45min' ? 45 : workoutDuration === '1hour' ? 60 : 45;

  const sessions: WeeklySession[] = [];
  for (let i = 0; i < daysPerWeek; i++) {
    const template = sessionTemplates[i % sessionTemplates.length];
    sessions.push({
      id: crypto.randomUUID(),
      sessionNumber: i + 1,
      name: template.name,
      targetMuscles: template.targetMuscles,
      duration,
      exercises: template.exercises,
      status: 'available',
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
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: (finalProfile?: Partial<UserProfile>) => void;
  completeWeeklySession: (sessionId: string, logs?: ExerciseLog[]) => void;
  moveSession: (sessionId: string, toSessionNumber: number) => void;
  removeSession: (sessionId: string) => void;
  handleWeeklyCheckIn: (preference: 'same' | 'change' | 'decide-later') => void;
  getExerciseHistory: (exerciseId: string) => ExerciseLog[];
  getExerciseByName: (name: string) => Exercise | undefined;
  resetApp: () => void;
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

  const supabase = createClient();

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
      const [onboardingRes, profileRes, sessionsRes, logsRes] = await Promise.all([
        fetch('/api/onboarding'),
        fetch('/api/profile'),
        fetch('/api/sessions/weekly'),
        fetch('/api/history'),
      ]);

      const [onboardingData, profileData, sessionsData, historyData] = await Promise.all([
        onboardingRes.json(),
        profileRes.json(),
        sessionsRes.json(),
        logsRes.json(),
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

        const weeklySessions: WeeklySession[] = (sessionsData.data ?? []).map((s: Record<string, unknown>) => {
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
          },
          sessions: [],
          weeklySessions,
          createdAt: new Date(ob.created_at),
          currentWeek: 1,
          lastWeeklyCheckIn: new Date(),
          totalCompletedSessions: weeklySessions.filter(s => s.status === 'completed').length,
        };

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

  const handleWeeklyCheckIn = (preference: 'same' | 'change' | 'decide-later') => {
    if (!user) return;

    const onboarding = user.onboarding as BeginnerOnboarding;
    const daysPerWeek = onboarding.daysPerWeek || 3;
    const workoutDuration = onboarding.workoutDuration || '45min';

    if (preference === 'same') {
      // Generate new sessions for the week
      const newSessions = generateWeeklySessions(daysPerWeek, workoutDuration);
      setUser({
        ...user,
        weeklySessions: newSessions,
        currentWeek: user.currentWeek + 1,
        lastWeeklyCheckIn: new Date(),
      });
    } else if (preference === 'decide-later') {
      // Just mark the check-in as done
      setUser({
        ...user,
        currentWeek: user.currentWeek + 1,
        lastWeeklyCheckIn: new Date(),
      });
    }
    // If 'change', the user will go to a different flow (not implemented yet)

    setShowWeeklyCheckIn(false);
  };

  const getExerciseHistory = (exerciseId: string): ExerciseLog[] => {
    return exerciseLogs.filter(log => log.exerciseId === exerciseId);
  };

  const getExerciseByName = (name: string): Exercise | undefined => {
    const allExercisesFlat = Object.values(SAMPLE_EXERCISES).flat();
    return allExercisesFlat.find(ex => ex.name === name);
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
        login,
        register,
        logout,
        completeOnboarding,
        completeWeeklySession,
        moveSession,
        removeSession,
        handleWeeklyCheckIn,
        getExerciseHistory,
        getExerciseByName,
        resetApp,
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
