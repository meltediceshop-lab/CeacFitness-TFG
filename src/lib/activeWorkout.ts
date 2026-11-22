import type { WeeklySession, WorkoutMode } from '@/types/user';

/**
 * Entreno en curso guardado en el dispositivo: si se cierra la app a mitad
 * de sesión, al volver se reanuda el entreno y el reloj sigue contando desde
 * la hora real de inicio.
 */
export interface ActiveWorkout {
  session: WeeklySession;   // sesión tal como se está entrenando (con alternativas elegidas)
  startedAt: number;        // epoch ms
  mode: WorkoutMode;
  includeWarmup: boolean;
  done?: string[];                       // ejercicios marcados como hechos (modo simple)
  sets?: Record<string, LoggedSet[]>;    // series registradas por ejercicio
  guided?: GuidedProgress;               // por dónde va el modo guiado
}

/** Progreso del modo guiado, para volver al mismo punto si la app se cierra. */
export interface GuidedProgress {
  exerciseIndex: number;
  setIndex: number;
  completed: string[];                   // series hechas ("ejercicio-serie")
  logs: { exerciseId: string; setNumber: number; weight: number; reps: number }[];
  restEndsAt?: number;                   // epoch ms: el descanso sigue contando fuera de la app
  restTotal?: number;                    // segundos del descanso en curso
}

/** Serie registrada en el modo simple (texto tal cual se escribe en los campos). */
export interface LoggedSet {
  weight: string;
  reps: string;
}

const KEY = 'fitmente-active-workout';
const MAX_AGE_MS = 12 * 60 * 60 * 1000; // pasado este tiempo se da por abandonado

export function loadActiveWorkout(): ActiveWorkout | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const active = JSON.parse(raw) as ActiveWorkout;
    if (!active?.session?.id || typeof active.startedAt !== 'number' || Date.now() - active.startedAt > MAX_AGE_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    return active;
  } catch {
    return null;
  }
}

export function saveActiveWorkout(active: ActiveWorkout) {
  try { localStorage.setItem(KEY, JSON.stringify(active)); } catch { /* ignore */ }
}

export function clearActiveWorkout() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

/**
 * Id de la sesión del plan. La versión adaptada por energía tiene id propio
 * (no toca el plan), así que para marcarla como hecha o reanudarla hay que
 * ir a la sesión de la que sale.
 */
export const planSessionId = (session: Pick<WeeklySession, 'id' | 'baseSessionId'>): string =>
  session.baseSessionId ?? session.id;

/**
 * Entreno en curso que se puede reanudar con las sesiones de esta semana.
 * Si su sesión ya no existe o ya está hecha, se descarta.
 */
export function resumableWorkout(sessions: WeeklySession[]): ActiveWorkout | null {
  const active = loadActiveWorkout();
  if (!active) return null;
  const base = sessions.find(s => s.id === planSessionId(active.session));
  if (base && base.status !== 'completed') return active;
  clearActiveWorkout();
  return null;
}

/** Segundos que faltan hasta una hora real (0 si ya ha pasado). */
export function secondsUntil(endsAt: number): number {
  return Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
}

/** Segundos transcurridos desde el inicio real del entreno. */
export function elapsedSince(startedAt: number): number {
  return Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
}
