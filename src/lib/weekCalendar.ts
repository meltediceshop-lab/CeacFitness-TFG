import type { WeeklySession } from '@/types/user';

/** Reparto por defecto de los días (0 = lunes) cuando el usuario no los eligió. */
export const DEFAULT_DAYS: Record<number, number[]> = {
  1: [0], 2: [0, 3], 3: [0, 2, 4], 4: [0, 1, 3, 4], 5: [0, 1, 2, 3, 4], 6: [0, 1, 2, 3, 4, 5], 7: [0, 1, 2, 3, 4, 5, 6],
};

export const defaultDay = (index: number, count: number): number =>
  DEFAULT_DAYS[Math.min(7, Math.max(1, count))]?.[index] ?? Math.min(6, index);

/** Día de la semana con lunes = 0. */
export const weekdayIndex = (d: Date): number => (d.getDay() + 6) % 7;

/**
 * Lunes de la semana del plan. El domingo ya se generan y se muestran las
 * sesiones de la semana siguiente, así que ese día la semana es la que empieza mañana.
 */
export function planWeekStart(d = new Date(), offset = 0): Date {
  const start = weekStart(d);
  if (weekdayIndex(d) === 6) start.setDate(start.getDate() + 7);
  start.setDate(start.getDate() + offset * 7);
  return start;
}

/** Lunes a las 00:00 de la semana de esa fecha. */
export function weekStart(d = new Date()): Date {
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - weekdayIndex(start));
  return start;
}

export const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/**
 * Fecha de una sesión en la semana: la del día en que se hizo si ya está
 * hecha (aunque fuera otro día del previsto) y, si no, el día elegido.
 */
export function sessionDate(session: WeeklySession, index: number, count: number, today = new Date()): Date {
  if (session.status === 'completed' && session.completedAt) {
    const done = new Date(session.completedAt);
    if (!Number.isNaN(done.getTime())) return done;
  }
  const date = planWeekStart(today);
  date.setDate(date.getDate() + (session.dayOfWeek ?? defaultDay(index, count)));
  return date;
}

/** "Hoy", "Mañana", "Ayer" o nada. */
export function relativeDay(date: Date, today = new Date()): string | null {
  const t = new Date(today); t.setHours(0, 0, 0, 0);
  const d = new Date(date); d.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - t.getTime()) / 86400000);
  return diff === 0 ? 'Hoy' : diff === 1 ? 'Mañana' : diff === -1 ? 'Ayer' : null;
}
