import { estimateSessionMinutes } from '@/lib/fitkMotor';
import { findExtraExercise, fitToMinutes, outdoorExtras } from '@/lib/cardioCatalog';
import { ALL_EQUIPMENT, SESSION_FOCUS, durationFromMinutes, generateFocusSession, motorCatalog, type MotorInput } from '@/lib/fitkMotor';
import { formatRepLine } from '@/lib/exerciseFormat';
import { libraryById } from '@/lib/fitkLibrary';
import type { CoachWorkout } from '@/types/user';

// Peso corporal / parque: lo que suele haber al aire libre.
const OUTDOOR_EQUIPMENT = ['dominadas', 'paralelas'];

/**
 * El Coach acompaña, el Motor decide (ARCH-COACH-001): convierte la petición
 * del modelo en una sesión construida por el Motor con el perfil del usuario.
 */
export function buildMotorWorkout(
  base: MotorInput,
  args: { focus?: string; minutes?: number; equipment?: string[]; avoidExercises?: string[]; extras?: string[] },
  mode?: string,
): { workout: CoachWorkout | null; toolResult: string } {
  const focus = args.focus && SESSION_FOCUS[args.focus] ? args.focus : 'fullA';
  const equipment = args.equipment?.filter(e => (ALL_EQUIPMENT as readonly string[]).includes(e));
  const input: MotorInput = {
    ...base,
    workoutDuration: args.minutes ? durationFromMinutes(args.minutes) : base.workoutDuration,
    availableEquipment: equipment && (equipment.length || args.equipment?.length === 0)
      ? equipment
      : mode === 'outdoor' ? OUTDOOR_EQUIPMENT : base.availableEquipment,
    excludedExercises: [...(base.excludedExercises ?? []), ...(args.avoidExercises ?? [])],
  };
  const result = generateFocusSession(input, focus, args.extras ?? []);
  const session = result?.sessions[0];
  if (!session) {
    return { workout: null, toolResult: 'El Motor no encontró ejercicios válidos con esas condiciones (lesiones, exclusiones o equipo). Explícaselo al usuario y pregúntale qué material tiene.' };
  }
  const workout: CoachWorkout = {
    name: session.name,
    targetMuscles: session.targetMuscles,
    duration: session.motorTrace?.estimatedMinutes ?? session.duration,
    exercises: session.exercises.map(e => ({
      name: e.name,
      sets: e.sets,
      reps: e.reps,
      restSeconds: e.restSeconds,
      instructions: e.instructions,
      repLabel: formatRepLine(e),
    })),
    session,
  };
  const lines = session.exercises.map(e =>
    `- ${e.name}: ${e.sets} series x ${formatRepLine(e)}${e.rirTarget ? `, RIR ${e.rirTarget.join('-')}` : ''}${e.suggestedWeightKg ? `, ~${e.suggestedWeightKg} kg` : ''}`);
  // Músculos que trabaja de verdad la sesión (principal de cada ficha), para
  // que el texto del Coach no prometa grupos que el Motor no ha incluido.
  const muscles = [...new Set(session.exercises
    .map(e => (e.libraryId ? libraryById.get(e.libraryId)?.primaryMuscle : undefined))
    .filter((m): m is string => !!m))];
  const warnings = result.warnings.length ? `\nAvisos del Motor: ${result.warnings.join('; ')}` : '';
  return {
    workout,
    toolResult: `Sesión creada por el Motor: ${session.name} (~${workout.duration} min).\n${lines.join('\n')}\nMúsculos que trabaja (solo estos): ${muscles.join(', ')}.${warnings}\nEl usuario ya ve la sesión completa en la tarjeta. Responde en 2-4 frases de texto plano: qué le has preparado y por qué encaja con lo que pidió (nombra solo los músculos de la lista anterior), y anímale a guardarla con el botón. NO enumeres los ejercicios, ni tablas, ni listas, ni cambies nada de la dosis.`,
  };
}

/** gpt-oss tiende a usar Markdown; la app muestra texto plano. */
export function toPlainText(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/(^|\s)\*(\S[^*]*?)\*(?=\s|[.,;:!?]|$)/g, '$1$2')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*]\s+/gm, '• ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^[ \t]*\|?[ \t:|-]*-{3,}[ \t:|-]*$/gm, '') // separadores de tablas Markdown
    .replace(/^[ \t]*\|[ \t]*|[ \t]*\|[ \t]*$/gm, '')
    .replace(/[ \t]*\|[ \t]*/g, ' · ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Sesión de calle con barras (dominadas y paralelas): la Biblioteca tiene
 * pocos ejercicios de peso corporal, así que se juntan los que el Motor
 * elige para cada enfoque en una sola sesión de cuerpo completo.
 */
export function buildOutdoorSession(base: MotorInput, minutes: number): import('@/types/user').Exercise[] {
  const seen = new Set<string>();
  const exercises: import('@/types/user').Exercise[] = [];
  for (const focus of ['torsoA', 'legs', 'push', 'pull', 'fullA']) {
    const session = buildMotorWorkout(base, { focus, minutes }, 'outdoor').workout?.session;
    for (const e of session?.exercises ?? []) {
      const key = e.libraryId ?? e.name;
      if (!seen.has(key)) { seen.add(key); exercises.push(e); }
    }
  }
  // Variedad (cambia cada día): barras, saltos y calistenia alternados con los de la
  // Biblioteca, y un final de cardio si queda tiempo. Se añade mientras quepa.
  const extras = outdoorExtras({ minutes: 60, advanced: base.level === 'advanced' }).filter(e => !seen.has(e.name));
  const finisher = extras.find(e => e.slotFunction === 'cardio');
  const funcs = extras.filter(e => e !== finisher);
  const order: import('@/types/user').Exercise[] = [];
  for (let i = 0; i < Math.max(exercises.length, funcs.length); i++) {
    if (exercises[i]) order.push(exercises[i]);
    if (funcs[i]) order.push(funcs[i]);
  }
  const fits = (l: import('@/types/user').Exercise[]) =>
    estimateSessionMinutes({ id: 'x', sessionNumber: 0, name: '', targetMuscles: '', duration: 0, exercises: l, status: 'available' }) <= minutes + 2;
  const chosen: import('@/types/user').Exercise[] = [];
  for (const e of order) if (chosen.length < 3 || fits([...chosen, e])) chosen.push(e);
  if (finisher && fits([...chosen, finisher])) chosen.push(finisher);
  return fitToMinutes(chosen, minutes);
}

const norm = (t: string) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

/**
 * Ejercicio de la Biblioteca que mejor encaja con lo que escribe el usuario
 * («dominadas», «press de banca», «curl de bíceps»…), con la dosis del Motor.
 * Si no hay ninguno claro, devuelve los más parecidos para sugerirlos.
 */
export function findLibraryExercise(query: string): { exercise: import('@/types/user').Exercise | null; similar: string[] } {
  const q = norm(query);
  const STOP = new Set(['con', 'del', 'los', 'las', 'una', 'unas', 'unos', 'para', 'por', 'sin', 'que']);
  const words = q.split(' ').filter(w => w.length > 2 && !STOP.has(w)).map(w => w.replace(/(es|s)$/, ''));
  const catalog = motorCatalog();
  const scored = catalog.map(e => {
    const n = norm(e.name);
    let score = n === q ? 100 : n.startsWith(q) ? 60 : n.includes(q) ? 40 : 0;
    score += words.filter(w => n.includes(w)).length * 10;
    return { e, score: score - n.length / 100 };
  }).filter(x => x.score > 5).sort((a, b) => b.score - a.score);
  const best = scored[0];
  const confident = best && (best.score >= 40 || (words.length > 0 && best.score >= words.length * 10 - 1));
  // Cardio, saltos, barras y CrossFit no están en la Biblioteca: se buscan aparte.
  const extra = findExtraExercise(query);
  if (extra.exercise && (!confident || extra.score >= 80 || extra.score > (best?.score ?? 0))) {
    return { exercise: extra.exercise, similar: [...extra.similar, ...scored.slice(0, 2).map(x => x.e.name)].slice(0, 4) };
  }
  const similar = [...scored.slice(0, 4).map(x => x.e.name), ...extra.similar];
  return { exercise: confident ? best.e : null, similar: [...new Set(similar)].slice(0, 4) };
}
