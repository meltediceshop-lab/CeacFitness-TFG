import type { ExerciseLog, User, WeeklySession } from '@/types/user';
import type { ShareData, ShareWeekDay } from '@/lib/shareCards';
import { formatRepLine } from '@/lib/exerciseFormat';
import { planWeekStart, sameDay, sessionDate, weekStart } from '@/lib/weekCalendar';

const ZONE: Record<string, string> = { chest: 'Pecho', back: 'Espalda', shoulders: 'Hombros', legs: 'Pierna', arms: 'Brazos', core: 'Core', none: 'General' };
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/** Sesiones que se pueden compartir: primero las hechas (la más reciente delante). */
export function shareableSessions(user: User): WeeklySession[] {
  const done = user.weeklySessions.filter(s => s.status === 'completed')
    .sort((a, b) => new Date(b.completedAt ?? 0).getTime() - new Date(a.completedAt ?? 0).getTime());
  return done.length ? done : user.weeklySessions.filter(s => s.status !== 'completed').slice(0, 1);
}

/**
 * Datos reales del usuario para las tarjetas: la sesión elegida, la semana,
 * el ejercicio que más ha progresado y el total de sesiones.
 */
export function buildShareData(
  user: User,
  logs: ExerciseLog[],
  session: WeeklySession | undefined,
  exerciseName: (id: string) => string | undefined,
  canonical: (id: string) => string,
  host: string,
): ShareData {
  const now = new Date();
  const data: ShareData = { userName: user.profile.name || 'Fit K', title: session?.name ?? 'Mi entreno', date: now, host };

  if (session) {
    const done = session.status === 'completed';
    const when = done && session.completedAt ? new Date(session.completedAt) : now;
    // Lo que se entrenó de verdad (entreno parcial o adaptado), si se guardó al completarla.
    const exercises = (done && session.doneExercises?.length ? session.doneExercises : session.exercises).filter(e => !e.skipped);
    data.kicker = done ? 'ENTRENO COMPLETADO' : 'MI PRÓXIMO ENTRENO';
    data.date = when;
    data.minutes = done && session.actualMinutes ? session.actualMinutes : session.duration;
    data.exercises = exercises.length;
    data.sets = exercises.reduce((a, e) => a + e.sets, 0);
    const byZone = new Map<string, number>();
    for (const e of exercises) byZone.set(ZONE[e.targetMuscle] ?? 'General', (byZone.get(ZONE[e.targetMuscle] ?? 'General') ?? 0) + e.sets);
    data.muscles = [...byZone.entries()].map(([label, sets]) => ({ label, sets })).sort((a, b) => b.sets - a.sets);
    // Series registradas ese día en los ejercicios de la sesión
    const ids = new Set(exercises.map(e => canonical(e.id)));
    const dayLogs = logs.filter(l => ids.has(canonical(l.exerciseId)) && dayKey(new Date(l.timestamp)) === dayKey(when));
    const volume = dayLogs.reduce((a, l) => a + (l.weight ?? 0) * (l.reps ?? 0), 0);
    if (done && volume > 0) data.volumeKg = Math.round(volume);
    data.topExercises = exercises.slice(0, 5).map(e => {
      const best = dayLogs.filter(l => canonical(l.exerciseId) === canonical(e.id) && l.weight).sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0))[0];
      return { name: e.name, detail: best ? `${best.weight} kg × ${best.reps}` : `${e.sets} × ${formatRepLine(e)}` };
    });
  }

  // Semana: los mismos 7 días para el calendario y para todas las cifras. Mientras
  // haya sesiones hechas se usa la semana natural (el domingo aún es esta semana);
  // si no hay ninguna, la semana del plan (la nueva que ya se generó el domingo).
  const list = user.weeklySessions;
  const anyDone = list.some(s => s.status === 'completed');
  const monday = anyDone ? weekStart(now) : planWeekStart(now);
  const dated = list.map((s, i) => ({ s, d: sessionDate(s, i, list.length, monday) }));
  const inWeek = (d: Date) => d >= monday && d.getTime() < monday.getTime() + 7 * 86400000;
  const doneThisWeek = dated.filter(x => x.s.status === 'completed' && inWeek(x.d));
  const setsOf = (s: WeeklySession) => (s.doneExercises?.length ? s.doneExercises : s.exercises).filter(e => !e.skipped).reduce((b, e) => b + e.sets, 0);
  const days: ShareWeekDay[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i);
    const here = dated.filter(x => sameDay(x.d, d));
    const doneHere = here.filter(x => x.s.status === 'completed');
    return {
      letter: ['L', 'M', 'X', 'J', 'V', 'S', 'D'][i], date: d.getDate(), planned: here.length > 0, done: doneHere.length > 0, today: sameDay(d, now),
      sets: doneHere.reduce((a, x) => a + setsOf(x.s), 0),
    };
  });
  const doneSessions = list.filter(s => s.status === 'completed');
  if (list.length) {
    const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
    const weekVolume = logs.filter(l => inWeek(new Date(l.timestamp))).reduce((a, l) => a + (l.weight ?? 0) * (l.reps ?? 0), 0);
    data.week = {
      days, done: doneThisWeek.length, total: Math.max(list.length, doneThisWeek.length),
      minutes: doneThisWeek.reduce((a, x) => a + (x.s.actualMinutes ?? x.s.duration ?? 0), 0),
      sets: days.reduce((a, d) => a + d.sets, 0),
      volumeKg: weekVolume > 0 ? Math.round(weekVolume) : undefined,
      range: `${monday.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} – ${sunday.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`,
    };
  }

  // Progreso: el ejercicio cuyo mejor peso más ha subido
  const byExercise = new Map<string, Map<string, { t: number; w: number }>>();
  for (const l of logs) {
    if (!l.weight) continue;
    const t = new Date(l.timestamp); if (Number.isNaN(t.getTime())) continue;
    const id = canonical(l.exerciseId); const perDay = byExercise.get(id) ?? new Map(); byExercise.set(id, perDay);
    const cur = perDay.get(dayKey(t)); if (!cur || l.weight > cur.w) perDay.set(dayKey(t), { t: t.getTime(), w: l.weight });
  }
  let best: { id: string; pts: { t: number; w: number }[]; gain: number } | null = null;
  for (const [id, perDay] of byExercise) {
    const pts = [...perDay.values()].sort((a, b) => a.t - b.t); if (pts.length < 2) continue;
    const gain = pts[pts.length - 1].w - pts[0].w;
    if (!best || gain > best.gain) best = { id, pts, gain };
  }
  if (best) {
    data.progress = {
      exercise: exerciseName(best.id) ?? 'Mi ejercicio', unit: 'kg',
      points: best.pts.slice(-8).map(p => ({ label: new Date(p.t).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }), value: p.w })),
    };
  }

  const total = user.totalCompletedSessions ?? doneSessions.length;
  if (total > 0) data.milestone = { value: String(total), label: total === 1 ? 'sesión completada' : 'sesiones completadas', sub: `Semana ${user.currentWeek} con mi plan de Fit K` };
  return data;
}
