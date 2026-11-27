'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, Repeat, TrendingUp, X } from 'lucide-react';
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
                className="absolute top-3 right-3 w-9 h-9 rounded-full lg-glass lg-blur flex items-center justify-center"
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

              {alternativeOptions(exercise).filter(n => n !== exercise.name).length > 0 && (() => {
                // El ejercicio actual primero y después sus variantes.
                const options = [exercise.name, ...alternativeOptions(exercise).filter(n => n !== exercise.name)];
                return (
                  <section className="space-y-3" aria-label="Variantes">
                    <div className="flex items-start gap-3">
                      <span className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 flex items-center justify-center flex-shrink-0">
                        <Repeat className="w-4 h-4" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-stone-900 dark:text-white leading-tight">Variantes <span className="text-stone-400 font-medium">· {options.length - 1}</span></h3>
                        <p className="text-stone-500 text-xs mt-0.5">Si la máquina está ocupada o no la hay, cámbialo. Se mantienen las series y el descanso.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      {options.map(alt => {
                        const selected = alt === exercise.name;
                        const original = alt === (exercise.swappedFrom ?? exercise.name) && !!exercise.swappedFrom;
                        return (
                          <button
                            key={alt}
                            type="button"
                            onClick={() => !selected && onChooseAlternative(alt)}
                            aria-pressed={selected}
                            className={`group relative text-left rounded-2xl overflow-hidden transition-all active:scale-[0.98] ${
                              selected
                                ? 'ring-2 ring-emerald-500 bg-emerald-500/[0.06]'
                                : 'ring-1 ring-black/[0.06] dark:ring-white/10 bg-white/70 dark:bg-white/[0.04]'
                            }`}
                          >
                            <div className="relative">
                              <ExercisePreview name={alt} muscle={exercise.targetMuscle} className="w-full aspect-[4/3]" rounded="rounded-none" animate={false} />
                              <span className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/35 to-transparent pointer-events-none" />
                              {selected ? (
                                <span className="absolute top-2 right-2 h-6 px-2 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 shadow">
                                  <Check className="w-3 h-3" strokeWidth={3} /> Actual
                                </span>
                              ) : original ? (
                                <span className="absolute top-2 right-2 h-6 px-2 rounded-full bg-white/90 dark:bg-black/60 text-stone-700 dark:text-white text-[10px] font-bold flex items-center shadow">Original</span>
                              ) : null}
                            </div>
                            <div className="px-2.5 py-2">
                              <p className="text-[13px] font-semibold text-stone-900 dark:text-white leading-snug line-clamp-2">{alt}</p>
                              {!selected && <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold mt-0.5">Cambiar a esta</p>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                );
              })()}

              <Button onClick={onClose} className="w-full h-12 rounded-full text-base font-semibold">Entendido</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
