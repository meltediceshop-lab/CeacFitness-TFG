export type UserLevel = 'beginner' | 'advanced';

export type BeginnerGoal =
  | 'energy'
  | 'feel-better'
  | 'strength'
  | 'routine'
  | 'lose-weight'
  | 'lose-fat'
  | 'recomp';

export type AdvancedGoal =
  | 'strength'
  | 'physique'
  | 'performance'
  | 'maintain'
  | 'lose-weight'
  | 'lose-fat'
  | 'recomp';

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

export type MeasurementReminderFrequency =
  | 'weekly'
  | '2weeks'
  | '3weeks'
  | 'monthly'
  | '3sessions'
  | '5sessions';

export type ClockStyle = 'digital' | 'analog';

export interface BodyMeasurementRecord {
  id?: string;
  weight?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  glutes?: number;
  arms?: number;
  forearms?: number;
  thighs?: number;
  calves?: number;
  photoUrl?: string;
  recordedAt: Date;
}

export interface UserProfile {
  name: string;
  biologicalProfile: BiologicalProfile;
  avatarUrl?: string;
  weight: number;
  height: number;
  ageRange: AgeRange;
  otherSports: string[];
  otherSportsDays: number;
  injuries: string[];
  excludedExercises: string[];
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
  };
  measurementHistory?: BodyMeasurementRecord[];
  reminderFrequency?: MeasurementReminderFrequency;
  clockStyle?: ClockStyle;
  clockStyleChosen?: boolean;
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
  /** Día de la semana: 0=lunes … 6=domingo */
  dayOfWeek?: number;
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

export interface WeekRecord {
  weekNumber: number;
  sessions: WeeklySession[];
  startedAt: string;  // ISO
  closedAt: string;   // ISO
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
  lastWeeklyCheckIn?: Date;
  totalCompletedSessions?: number;
  lastWeightUpdate?: Date;
  weeklyHistory?: WeekRecord[];
}

export type AppScreen =
  | 'auth'
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
  | 'nutrition'
  | 'weekly-checkin'
  | 'community'
  | 'review';

// ── Community ─────────────────────────────────────────────────────
export interface CommunityPost {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  type: 'note' | 'workout';
  content?: string;
  workoutName?: string;
  workoutDuration?: number;
  workoutExercises?: number;
  photoUrl?: string;
  createdAt: string;
  myReaction?: string | null;
  reactionCount: number;
  commentCount: number;
  comments?: CommunityComment[];
  milestone?: string; // Etiqueta celebratoria opcional (ej: "Constancia 🔥"), sin comparación
  isDemo?: boolean;   // Publicación de ejemplo (interactiva solo en local)
}

export type CommunityFilter = 'all' | 'note' | 'workout';

export interface CommunityComment {
  id: string;
  postId: string;
  userId: string;
  displayName: string;
  content: string;
  createdAt: string;
}

export type CommunityReactionType = 'identify' | 'bravo' | 'keep-going' | 'fire' | 'same';

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

// ── AI Chat ─────────────────────────────────────────────────────────
export interface CoachWorkout {
  name: string;
  targetMuscles: string;
  duration: number;
  exercises: Array<{
    name: string;
    sets: number;
    reps: number[];
    restSeconds: number;
    instructions?: string;
  }>;
}

export interface CoachNutritionPlan {
  goal: string;
  dailyCalories: number;
  macros: { protein: number; carbs: number; fats: number };
  meals: Array<{ name: string; time: string; foods: string[]; calories: number }>;
  guidelines: string[];
  preWorkout?: string;
  postWorkout?: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  workout?: CoachWorkout;
  nutritionPlan?: CoachNutritionPlan;
}

// ── Nutrition ────────────────────────────────────────────────────────
export type NutritionGoal = 'lose-fat' | 'gain-muscle' | 'maintain' | 'performance';
export type DietType = 'omnivore' | 'vegetarian' | 'vegan' | 'other';
export type CookingFrequency = 'home' | 'outside' | 'mixed';

export interface NutritionProfile {
  goal: NutritionGoal;
  allergies: string[];
  dietType: DietType;
  dislikedFoods: string;
  mealsPerDay: number;
  cookingFrequency: CookingFrequency;
  budget: 'low' | 'medium' | 'high';
  trainingTime: 'morning' | 'afternoon' | 'evening';
  supplements: string;
  medicalConditions: string;
  completedAt: string;
}

export interface NutritionMeal {
  name: string;
  time: string;
  description: string;
  examples: string[];
}

export interface NutritionPlan {
  dailyCalories: number;
  macros: {
    protein: string;
    carbs: string;
    fats: string;
  };
  meals: NutritionMeal[];
  guidelines: string[];
  supplements?: string[];
  preWorkout: string;
  postWorkout: string;
  generatedAt: string;
}

// ── Seguimiento diario ───────────────────────────────────────────────
export type MealSlot = 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'other';

export interface NutritionLogEntry {
  id: string;
  mealSlot: MealSlot;
  foodName: string;
  quantityG?: number;
  kcal: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface MacroTargets {
  kcal: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface WeekDaySummary {
  date: string;
  kcal: number;
  protein: number;
  carbs: number;
  fats: number;
  water: number;
  waterGoal: number;
  entries: number;
}
