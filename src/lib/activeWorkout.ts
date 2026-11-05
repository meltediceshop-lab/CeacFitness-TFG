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

/** Segundos transcurridos desde el inicio real del entreno. */
export function elapsedSince(startedAt: number): number {
  return Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
}
