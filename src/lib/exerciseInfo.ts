import { libraryById, muscleByCode, resolveLibraryId } from '@/lib/fitkLibrary';
import type { Exercise } from '@/types/user';

export interface ExerciseInfo {
  pattern: string;
  primary: string[];
  secondary: string[];
}

/**
 * Músculos que trabaja un ejercicio, sacados de la Matriz muscular de su
 * ficha (P = principal, S = secundario). Sustituye en pantalla a las notas
 * internas de la Biblioteca, que no están escritas para el usuario.
 * Devuelve null si el ejercicio no viene de la Biblioteca.
 */
export function exerciseInfo(ex: Pick<Exercise, 'libraryId'>): ExerciseInfo | null {
  if (!ex.libraryId) return null;
  const lib = libraryById.get(resolveLibraryId(ex.libraryId));
  if (!lib) return null;
  const names = (level: string) => {
    const list = lib.muscles.filter(m => m.level === level).map(m => muscleByCode.get(m.code)?.name ?? m.code);
    return list.filter((n, i) => list.indexOf(n) === i);
  };
  const primary = names('P');
  // Como mucho cuatro etiquetas en total para que la tarjeta no se llene.
  const secondary = names('S').filter(n => !primary.includes(n)).slice(0, Math.max(1, 4 - primary.length));
  return { pattern: lib.movementPattern, primary, secondary };
}

/** Texto descriptivo que se puede enseñar: músculos si es de la Biblioteca, instrucciones si no. */
export function showsInstructions(ex: Pick<Exercise, 'libraryId' | 'instructions'>): boolean {
  return !ex.libraryId && !!ex.instructions;
}
