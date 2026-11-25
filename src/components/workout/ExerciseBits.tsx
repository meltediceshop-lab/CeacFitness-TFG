'use client';

import { Repeat, Timer } from 'lucide-react';
import { exerciseInfo, showsInstructions } from '@/lib/exerciseInfo';
import { formatRepLine, formatRest } from '@/lib/exerciseFormat';
import type { Exercise } from '@/types/user';

/** Músculos principales (marcados) y secundarios de un ejercicio. */
export function MuscleTags({ exercise, size = 'sm' }: { exercise: Exercise; size?: 'xs' | 'sm' }) {
  const info = exerciseInfo(exercise);
  const text = size === 'xs' ? 'text-[11px]' : 'text-xs';
  if (!info) {
    return showsInstructions(exercise)
      ? <p className={`${text} text-stone-500 line-clamp-2`}>{exercise.instructions}</p>
      : null;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {info.primary.map(m => (
        <span key={m} className={`${text} font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300`}>{m}</span>
      ))}
      {info.secondary.map(m => (
        <span key={m} className={`${text} px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 dark:bg-white/10 dark:text-white/60`}>{m}</span>
      ))}
    </div>
  );
}

/** Pastillas de series × reps y descanso. */
export function DoseChips({ exercise, rest = true }: { exercise: Exercise; rest?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold tabular-nums">
      <span className="px-2 py-0.5 rounded-lg bg-stone-900/5 dark:bg-white/10 text-stone-700 dark:text-white/80">
        {exercise.sets} × {formatRepLine(exercise)}
      </span>
      {rest && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-stone-900/5 dark:bg-white/10 text-stone-500 dark:text-white/60">
          <Timer className="w-3 h-3" /> {formatRest(exercise.restSeconds)}
        </span>
      )}
    </div>
  );
}

/** Contenedor de una biserie: dos ejercicios seguidos y un solo descanso. */
export function SupersetGroup({ children, rest }: { children: React.ReactNode; rest?: number }) {
  return (
    <div className="rounded-3xl border border-teal-200/80 dark:border-teal-400/25 bg-teal-50/60 dark:bg-teal-500/[0.07] p-2 space-y-2">
      <div className="flex items-center justify-between gap-2 px-2 pt-1">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-teal-700 dark:text-teal-300">
          <Repeat className="w-3.5 h-3.5" /> Biserie
        </span>
        <span className="text-[11px] text-teal-700/80 dark:text-teal-300/80 text-right">
          Una serie de cada seguida{rest ? ` · descanso ${formatRest(rest)} al acabar la ronda` : ''}
        </span>
      </div>
      {children}
    </div>
  );
}

/** Agrupa la lista en bloques: ejercicios sueltos o parejas de biserie. */
export function exerciseBlocks(exercises: Pick<Exercise, 'superset'>[]): number[][] {
  const blocks: number[][] = [];
  for (let i = 0; i < exercises.length; i++) {
    const key = exercises[i].superset;
    if (key && exercises[i + 1]?.superset === key) { blocks.push([i, i + 1]); i++; }
    else blocks.push([i]);
  }
  return blocks;
}
