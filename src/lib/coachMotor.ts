import { ALL_EQUIPMENT, SESSION_FOCUS, durationFromMinutes, generateFocusSession, type MotorInput } from '@/lib/fitkMotor';
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
  args: { focus?: string; minutes?: number; equipment?: string[]; avoidExercises?: string[] },
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
  const result = generateFocusSession(input, focus);
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
