import type { Exercise } from '@/types/user';

/**
 * Sustituye un ejercicio de la sesión por una alternativa elegida por el usuario
 * ("¿No encuentras este ejercicio?"). Se conserva la prescripción del slot
 * (series, descanso, rol) y la lista de alternativas original, para que la
 * elección quede marcada y se pueda volver al ejercicio original.
 */
export function swapExercise(original: Exercise, replacement: Exercise): Exercise {
  const originalName = original.swappedFrom ?? original.name;
  const sameUnit = (replacement.repUnit ?? 'reps') === (original.repUnit ?? 'reps');
  return {
    ...replacement,
    sets: original.sets,
    restSeconds: original.restSeconds,
    // Si cambia la unidad (reps ↔ segundos) se usa el objetivo de la alternativa.
    reps: sameUnit ? original.reps : Array.from({ length: original.sets }, (_, i) => replacement.reps[i] ?? replacement.reps[0] ?? 10),
    repRange: sameUnit ? original.repRange : replacement.repRange,
    rirTarget: original.rirTarget ?? replacement.rirTarget,
    slotFunction: original.slotFunction ?? replacement.slotFunction,
    slotRole: original.slotRole ?? replacement.slotRole,
    essential: original.essential,
    priority: original.priority,
    alternatives: original.alternatives,
    swappedFrom: replacement.name === originalName ? undefined : originalName,
    reasonCodes: [...(replacement.reasonCodes ?? []), 'USER_ALTERNATIVE'],
  };
}

/**
 * Resuelve el nombre de una alternativa a un Exercise del catálogo; si no
 * existe, crea uno con el nombre para que la interfaz no se bloquee.
 */
export function resolveAlternative(
  current: Exercise,
  name: string,
  getExerciseByName: (name: string) => Exercise | undefined,
): Exercise {
  return getExerciseByName(name) ?? {
    ...current,
    id: `alt-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name,
    libraryId: undefined,
    imageUrl: undefined,
    variations: [],
    instructions: `Mantén la técnica adecuada para: ${name}`,
  };
}

/** Opciones a mostrar: el ejercicio original (si se cambió) y sus alternativas. */
export function alternativeOptions(ex: Exercise): string[] {
  const list = ex.swappedFrom ? [ex.swappedFrom, ...(ex.alternatives ?? [])] : [...(ex.alternatives ?? [])];
  return list.filter((n, i) => list.indexOf(n) === i);
}
