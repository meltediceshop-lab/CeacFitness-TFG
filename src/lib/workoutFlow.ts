import type { Exercise } from '@/types/user';

type Step = Pick<Exercise, 'sets' | 'restSeconds' | 'superset'>;

/** Descanso al pasar de un ejercicio al siguiente, en segundos. */
const BETWEEN_EXERCISES = 90;

/**
 * Índice del compañero de biserie: el ejercicio contiguo con la misma clave.
 * Devuelve -1 si no hay pareja (también si el compañero se quitó de la
 * sesión, por ejemplo al adaptarla por energía).
 */
export function supersetPartner(exercises: Pick<Exercise, 'superset'>[], index: number): number {
  const key = exercises[index]?.superset;
  if (!key) return -1;
  if (exercises[index + 1]?.superset === key) return index + 1;
  if (exercises[index - 1]?.superset === key) return index - 1;
  return -1;
}

export interface GuidedStep {
  exerciseIndex: number;
  setIndex: number;
  /** Descanso antes de esa serie, en segundos (0 = se hace seguida). */
  rest: number;
}

/**
 * Siguiente serie del modo guiado tras completar una. En una biserie se
 * hace una serie de cada ejercicio seguida y se descansa al acabar la
 * ronda. Devuelve null si era la última serie de la sesión.
 */
export function nextGuidedStep(exercises: Step[], exerciseIndex: number, setIndex: number): GuidedStep | null {
  const current = exercises[exerciseIndex];
  const partner = supersetPartner(exercises, exerciseIndex);
  const leave = (from: number): GuidedStep | null =>
    (from < exercises.length - 1 ? { exerciseIndex: from + 1, setIndex: 0, rest: BETWEEN_EXERCISES } : null);

  if (partner === -1) {
    if (setIndex < current.sets - 1) return { exerciseIndex, setIndex: setIndex + 1, rest: current.restSeconds };
    return leave(exerciseIndex);
  }

  const first = Math.min(exerciseIndex, partner);
  const second = Math.max(exerciseIndex, partner);
  const a = exercises[first];
  const b = exercises[second];
  const roundRest = Math.max(a.restSeconds, b.restSeconds);
  if (exerciseIndex === first) {
    // Tras la serie del primero, la misma ronda del segundo sin descanso.
    if (setIndex < b.sets) return { exerciseIndex: second, setIndex, rest: 0 };
    if (setIndex < a.sets - 1) return { exerciseIndex: first, setIndex: setIndex + 1, rest: roundRest };
  } else {
    // Tras la serie del segundo, descanso y nueva ronda.
    if (setIndex + 1 < a.sets) return { exerciseIndex: first, setIndex: setIndex + 1, rest: roundRest };
    if (setIndex + 1 < b.sets) return { exerciseIndex: second, setIndex: setIndex + 1, rest: roundRest };
  }
  return leave(second);
}
