export type UserLevel = 'beginner' | 'advanced';

export type BeginnerGoal =
  | 'energy'
  | 'feel-better'
  | 'strength'
  | 'routine';

export type AdvancedGoal =
  | 'strength'
  | 'physique'
  | 'performance'
  | 'maintain';

export type GymComfort =
  | 'shy'
  | 'insecure'
  | 'depends'
  | 'comfortable';

export type TrainingStyle =
  | 'clear-routine'
  | 'improvise'
  | 'optimize';

export type Availability =
  | 'stable'
  | 'variable'
  | 'depends-work';

export type AppTone =
  | 'demanding'
  | 'flexible';

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'legs'
  | 'arms'
  | 'core'
  | 'none';

export type BiologicalProfile = 'male' | 'female';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening';

export type EnergyLevel = 'very-low' | 'low' | 'normal' | 'high';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

// Workout duration preferences
export type WorkoutDuration = '30min' | '45min' | '1hour' | 'depends';

// Weekly check-in preference (for future implementation)
export type WeeklyCheckInPreference = 'same-as-last-week' | 'change-days' | 'decide-later';

// Session action when user can't train (for future implementation)
export type SessionAction = 'move' | 'remove';

// Age range for profile
export type AgeRange = 'under-25' | '25-34' | '35-44' | '45-54' | '55+';

// Workout mode selection
export type WorkoutMode = 'guided' | 'simple';

// Exercise variation types
export type ExerciseVariationType = 'barbell' | 'dumbbells' | 'machine' | 'cable' | 'bodyweight';

// Start week preference (for weekend onboarding)
export type StartWeekPreference = 'this-week' | 'next-week';

export interface TrainingDay {
  day: DayOfWeek;
  timeOfDay: TimeOfDay;
}

export interface BeginnerOnboarding {
  experienceLevel: 'never' | 'inconsistent';
  goal: BeginnerGoal;
  daysPerWeek: number;
  trainingDays: TrainingDay[];
  workoutDuration: WorkoutDuration;
  gymComfort: GymComfort;
  startWeekPreference?: StartWeekPreference; // For weekend onboarding
}

export interface AdvancedOnboarding {
  goal: AdvancedGoal;
  trainingStyle: TrainingStyle;
  daysPerWeek: number;
  availability: Availability;
  priorityMuscle: MuscleGroup;
  appTone: AppTone;
}

export interface UserProfile {
  name: string;
  biologicalProfile: BiologicalProfile;
  weight: number;
  height: number;
  ageRange: AgeRange; // New field
  otherSports: string[];
  otherSportsDays: number;
  injuries: string[];
  excludedExercises: string[];
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    legs?: number;
  };
}

// Exercise variation with alternatives
export interface ExerciseVariation {
  id: string;
  name: string;
  type: ExerciseVariationType;
  videoUrl?: string;
  imageUrl?: string;
}

export interface Exercise {
  id: string;
  name: string;
  targetMuscle: MuscleGroup;
  sets: number;
  reps: number[];
  restSeconds: number;
  variations?: ExerciseVariation[];
  alternatives?: string[]; // Alternative exercise names
  instructions?: string;
  imageUrl?: string; // GIF demonstration URL
}

export interface ExerciseLog {
  exerciseId: string;
  setNumber: number;
  weight?: number;
  reps: number;
  timestamp: Date;
}

// Weekly session with status
export type SessionStatus = 'completed' | 'available' | 'locked';

export interface WeeklySession {
  id: string;
  sessionNumber: number;
  name: string;
  targetMuscles: string;
  duration: number; // in minutes
  exercises: Exercise[];
  status: SessionStatus;
  completedAt?: Date;
}

export interface WorkoutSession {
  id: string;
  date: Date;
  energyLevel: EnergyLevel;
  exercises: Exercise[];
  logs: ExerciseLog[];
  completed: boolean;
  notes?: string;
  mode?: WorkoutMode; // Track which mode was used
}

export interface User {
  id: string;
  level: UserLevel;
  onboarding: BeginnerOnboarding | AdvancedOnboarding;
  profile: UserProfile;
  sessions: WorkoutSession[];
  weeklySessions: WeeklySession[]; // Current week's sessions
  createdAt: Date;
  currentWeek: number;
  lastWeeklyCheckIn?: Date; // For weekly check-in tracking
  totalCompletedSessions?: number; // Track total sessions for progressive disclosure
  lastWeightUpdate?: Date; // Track when weight was last updated
}

export type AppScreen =
  | 'welcome'
  | 'onboarding-level'
  | 'onboarding-beginner'
  | 'onboarding-advanced'
  | 'profile-setup'
  | 'check-in'
  | 'dashboard'
  | 'workout-preview'
  | 'energy-check'
  | 'workout'
  | 'history'
  | 'chat'
  | 'profile'
  | 'nutrition';

export interface ChatAction {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export const CHAT_ACTIONS: ChatAction[] = [
  { id: 'low-energy', label: 'Hoy tengo poca energía', icon: 'battery-low', description: 'Ajustar la intensidad de hoy' },
  { id: 'cant-train', label: 'Hoy no puedo entrenar', icon: 'calendar-x', description: 'Reorganizar tu semana' },
  { id: 'short-time', label: 'Tengo poco tiempo', icon: 'clock', description: 'Versión corta del entreno' },
  { id: 'cant-exercise', label: 'No puedo hacer este ejercicio', icon: 'x-circle', description: 'Buscar alternativa' },
  { id: 'intensity', label: 'Quiero algo más suave / intenso', icon: 'sliders', description: 'Ajustar dificultad' },
  { id: 'change-day', label: 'Quiero cambiar un día', icon: 'calendar', description: 'Mover tu entreno' },
  { id: 'discomfort', label: 'Tengo una molestia', icon: 'alert-triangle', description: 'Adaptar ejercicios' },
];
