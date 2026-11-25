'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, TrendingUp, X } from 'lucide-react';
import { ExercisePreview } from '@/components/workout/ExercisePreview';
import { MuscleTags } from '@/components/workout/ExerciseBits';
import { Button } from '@/components/ui/button';
import { exerciseInfo } from '@/lib/exerciseInfo';
import { formatRepTarget, formatRest, repUnitLabel } from '@/lib/exerciseFormat';
import { alternativeOptions } from '@/lib/exerciseSwap';
import type { Exercise } from '@/types/user';

/**
 * Ficha de un ejercicio (vista previa y entreno): series, repeticiones,
 * descanso, músculos y las alternativas para cambiarlo si la máquina está
 * ocupada o no la hay.
 */
export function ExerciseDetailSheet({
  exercise,
  lastWeight,
  onClose,
  onChooseAlternative,
  zIndex = 'z-50',
}: {
  exercise: Exercise | null;
  lastWeight?: number | null;
  onClose: () => void;
  onChooseAlternative: (name: string) => void;
  zIndex?: string;
}) {
  return (
    <AnimatePresence>
      {exercise && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center sm:p-4 ${zIndex}`}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="glass-modal rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[92dvh] overflow-y-auto no-scrollbar"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative">
              <ExercisePreview name={exercise.name} muscle={exercise.targetMuscle} className="w-full h-56" rounded="rounded-t-3xl" />
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur flex items-center justify-center shadow-sm"
              >
                <X className="w-5 h-5 text-stone-700 dark:text-white" />
              </button>
            </div>

            <div className="p-5 space-y-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <div className="space-y-2">
                {exerciseInfo(exercise) && (
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">{exerciseInfo(exercise)!.pattern}</p>
                )}
                <h2 className="text-xl font-bold text-stone-900 leading-tight text-balance">{exercise.name}</h2>
                <MuscleTags exercise={exercise} />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { value: String(exercise.sets), label: 'Series' },
                  { value: formatRepTarget(exercise), label: repUnitLabel(exercise).trim() || 'Tiempo' },
                  { value: formatRest(exercise.restSeconds), label: 'Descanso' },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl bg-emerald-50 py-3 px-1">
                    <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums leading-tight">{s.value}</p>
                    <p className="text-[11px] uppercase tracking-wide text-stone-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {lastWeight ? (
                <div className="flex items-center gap-3 rounded-2xl bg-stone-50 p-3">
                  <TrendingUp className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <p className="text-sm text-stone-700">La última vez usaste <strong className="text-stone-900">{lastWeight} kg</strong></p>
                </div>
              ) : null}

              {alternativeOptions(exercise).length > 0 && (
                <div className="space-y-2">
                  <div>
                    <h3 className="font-semibold text-stone-900">¿No encuentras este ejercicio?</h3>
                    <p className="text-stone-500 text-sm">Cámbialo por una de estas alternativas:</p>
                  </div>
                  {alternativeOptions(exercise).map(alt => {
                    const selected = alt === exercise.name;
                    return (
                      <button
                        key={alt}
                        type="button"
                        onClick={() => onChooseAlternative(alt)}
                        aria-pressed={selected}
                        className={`w-full flex items-center gap-3 p-2 pr-3 text-left rounded-2xl border transition-colors ${
                          selected
                            ? 'bg-emerald-50 border-emerald-400 dark:border-emerald-500/60'
                            : 'bg-white/60 dark:bg-white/5 border-stone-200 hover:border-emerald-300'
                        }`}
                      >
                        <ExercisePreview name={alt} muscle={exercise.targetMuscle} className="w-12 h-12 flex-shrink-0" rounded="rounded-xl" animate={false} />
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-medium text-stone-800">{alt}</span>
                          {alt === exercise.swappedFrom && <span className="block text-xs text-stone-400">Ejercicio original</span>}
                        </span>
                        {selected && <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}

              <Button onClick={onClose} className="w-full h-12 rounded-2xl text-base font-semibold">Entendido</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
