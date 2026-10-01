import type { Exercise } from '@/types/user';

/**
 * Objetivo de repeticiones/tiempo de un ejercicio, sin el nº de series.
 * Con el Motor v1.8 se muestra el rango (doble progresión: "8-12");
 * los ejercicios antiguos sin rango muestran sus reps como antes.
 */
export function formatRepTarget(ex: Pick<Exercise, 'reps' | 'repRange' | 'repUnit' | 'perSide'>): string {
  const side = ex.perSide ? '/lado' : '';
  if (ex.repRange) {
    const [lo, hi] = ex.repRange;
    const range = lo === hi ? `${lo}` : `${lo}-${hi}`;
    return `${range}${ex.repUnit === 'seconds' ? ' s' : ''}${side}`;
  }
  const reps = ex.reps ?? [];
  if (reps.length === 0) return '';
  return `${reps.every(r => r === reps[0]) ? reps[0] : reps.join('/')}${side}`;
}

/** Unidad para acompañar al objetivo ("reps", "pasos" o nada si ya lleva "s"). */
export function repUnitLabel(ex: Pick<Exercise, 'repUnit'>): string {
  return ex.repUnit === 'seconds' ? '' : ex.repUnit === 'steps' ? ' pasos' : ' reps';
}

/** Objetivo completo con unidad antes del lado: "8-12 reps/lado", "30 s", "10 pasos". */
export function formatRepLine(ex: Pick<Exercise, 'reps' | 'repRange' | 'repUnit' | 'perSide'>): string {
  const target = formatRepTarget({ ...ex, perSide: false });
  if (!target) return '';
  return `${target}${repUnitLabel(ex)}${ex.perSide ? '/lado' : ''}`;
}
