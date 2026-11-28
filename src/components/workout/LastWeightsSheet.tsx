'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, X } from 'lucide-react';
import { ExercisePreview } from '@/components/workout/ExercisePreview';
import type { Exercise, ExerciseLog } from '@/types/user';

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/** Series del último día en que se registró el ejercicio (null si nunca). */
function lastTime(history: ExerciseLog[]): { date: Date; sets: ExerciseLog[] } | null {
  const logs = history
    .map(l => ({ ...l, timestamp: new Date(l.timestamp) }))
    .filter(l => !Number.isNaN(l.timestamp.getTime()));
  if (!logs.length) return null;
  const latest = logs.reduce((a, b) => (b.timestamp > a.timestamp ? b : a)).timestamp;
  const sets = logs.filter(l => dayKey(l.timestamp) === dayKey(latest)).sort((a, b) => a.setNumber - b.setNumber);
  return { date: latest, sets };
}

function whenLabel(date: Date): string {
  const days = Math.round((new Date().setHours(0, 0, 0, 0) - new Date(date).setHours(0, 0, 0, 0)) / 86400000);
  const day = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' });
  if (days <= 0) return `Hoy · ${day}`;
  if (days === 1) return `Ayer · ${day}`;
  return `Hace ${days} días · ${day}`;
}

/**
 * Botón flotante del entreno: abre una hoja con los pesos y repeticiones de
 * la última vez que se hizo cada ejercicio de la sesión.
 */
export function LastWeightsButton({
  exercises,
  getExerciseHistory,
}: {
  exercises: Exercise[];
  getExerciseHistory: (exerciseId: string) => ExerciseLog[];
}) {
  const [open, setOpen] = useState(false);
  const rows = exercises.map(e => ({ exercise: e, last: lastTime(getExerciseHistory(e.id)) }));
  const withData = rows.filter(r => r.last).length;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ver los pesos de la última vez"
        className="fixed bottom-28 left-5 z-40 h-14 pl-4 pr-5 rounded-full glass-card flex items-center gap-2 text-sm font-semibold text-stone-800"
      >
        <History className="w-5 h-5 text-emerald-600" />
        Última vez
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/50 flex items-end justify-center"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="glass-modal rounded-t-3xl w-full max-w-md max-h-[85dvh] overflow-y-auto no-scrollbar p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto mb-4" />
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-stone-900">Tus pesos de la última vez</h2>
                  <p className="text-sm text-stone-500">
                    {withData ? 'Lo que registraste la última vez que hiciste cada ejercicio.' : 'Aún no tienes series registradas de estos ejercicios.'}
                  </p>
                </div>
                <button onClick={() => setOpen(false)} aria-label="Cerrar" className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
                  <X className="w-5 h-5 text-stone-600" />
                </button>
              </div>

              <ul className="space-y-2">
                {rows.map(({ exercise, last }) => (
                  <li key={exercise.id} className="flex gap-3 rounded-2xl bg-white/60 dark:bg-white/5 border border-stone-200/70 dark:border-white/10 p-3">
                    <ExercisePreview name={exercise.name} muscle={exercise.targetMuscle} className="w-12 h-12 flex-shrink-0" rounded="rounded-xl" animate={false} />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-stone-900 leading-snug">{exercise.name}</p>
                      {last ? (
                        <>
                          <p className="text-xs text-stone-500 mb-1.5 first-letter:uppercase">{whenLabel(last.date)}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {last.sets.map((set, i) => (
                              <span key={i} className="text-xs font-semibold tabular-nums px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 dark:text-emerald-300">
                                {set.weight ? `${set.weight} kg` : '–'} × {set.reps}
                              </span>
                            ))}
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-stone-400">Sin registros todavía</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
