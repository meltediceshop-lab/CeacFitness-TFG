'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { ExercisePreview } from '@/components/workout/ExercisePreview';
import { ExercisePickerModal } from '@/components/workout/ExercisePickerModal';
import { formatRepLine } from '@/lib/exerciseFormat';
import { estimateSessionMinutes } from '@/lib/fitkMotor';
import type { Exercise } from '@/types/user';

const MIN_SETS = 1;
const MAX_SETS = 8;

/** Cambia las series de un ejercicio manteniendo el objetivo de repeticiones. */
function withSets(e: Exercise, sets: number): Exercise {
  const reps = Array.from({ length: sets }, (_, i) => e.reps[i] ?? e.reps[e.reps.length - 1] ?? 10);
  return { ...e, sets, reps };
}

/**
 * Entrenamiento libre: el usuario elige los ejercicios y las series; la sesión
 * se añade a hoy y se abre su vista previa para empezar.
 */
export function FreeWorkoutSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { getExerciseCatalog, addFreeSession, setSelectedWeeklySession, setScreen } = useApp();
  const [chosen, setChosen] = useState<Exercise[]>([]);
  const [picking, setPicking] = useState(false);

  const catalog = useMemo(
    () => (open ? getExerciseCatalog().filter(e => e.libraryId && !chosen.some(c => c.id === e.id)) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open, chosen],
  );
  const totalSets = chosen.reduce((a, e) => a + e.sets, 0);
  const minutes = chosen.length
    ? estimateSessionMinutes({ id: 'libre', sessionNumber: 0, name: '', targetMuscles: '', duration: 0, exercises: chosen, status: 'available' })
    : 0;

  const close = () => { setChosen([]); onClose(); };
  const create = () => {
    const session = addFreeSession(chosen);
    if (!session) return;
    setChosen([]);
    onClose();
    setSelectedWeeklySession(session);
    setScreen('workout-preview');
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 flex items-end justify-center"
            onClick={close}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="glass-modal rounded-t-3xl w-full max-w-md max-h-[88dvh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-5 pb-3">
                <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto mb-4" />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-stone-900">Entrenamiento libre</h2>
                    <p className="text-sm text-stone-500">Elige los ejercicios que quieras hacer hoy.</p>
                  </div>
                  <button onClick={close} aria-label="Cerrar" className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
                    <X className="w-5 h-5 text-stone-600" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar px-5 space-y-2">
                {chosen.map((e, i) => (
                  <div key={e.id} className="flex items-center gap-3 rounded-2xl bg-white/70 dark:bg-white/5 border border-stone-200/70 dark:border-white/10 p-2.5">
                    <ExercisePreview name={e.name} muscle={e.targetMuscle} className="w-12 h-12 flex-shrink-0" rounded="rounded-xl" animate={false} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-stone-900 leading-snug">{e.name}</p>
                      <p className="text-xs text-stone-500">{formatRepLine(e)}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        aria-label="Quitar una serie"
                        disabled={e.sets <= MIN_SETS}
                        onClick={() => setChosen(list => list.map((x, k) => (k === i ? withSets(x, x.sets - 1) : x)))}
                        className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center disabled:opacity-30"
                      >
                        <Minus className="w-4 h-4 text-stone-700" />
                      </button>
                      <span className="w-14 text-center leading-tight"><span className="block text-sm font-semibold text-stone-900 tabular-nums">{e.sets}</span><span className="block text-[10px] text-stone-500">{e.sets === 1 ? 'serie' : 'series'}</span></span>
                      <button
                        type="button"
                        aria-label="Añadir una serie"
                        disabled={e.sets >= MAX_SETS}
                        onClick={() => setChosen(list => list.map((x, k) => (k === i ? withSets(x, x.sets + 1) : x)))}
                        className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center disabled:opacity-30"
                      >
                        <Plus className="w-4 h-4 text-stone-700" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Quitar ${e.name}`}
                        onClick={() => setChosen(list => list.filter((_, k) => k !== i))}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setPicking(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-stone-300 dark:border-white/15 py-4 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:border-emerald-400 transition-colors"
                >
                  <Plus className="w-4 h-4" /> {chosen.length ? 'Añadir otro ejercicio' : 'Añadir ejercicio'}
                </button>
              </div>

              <div className="p-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-2">
                {chosen.length > 0 && (
                  <p className="text-xs text-stone-500 text-center tabular-nums">
                    {chosen.length} {chosen.length === 1 ? 'ejercicio' : 'ejercicios'} · {totalSets} series · unos {minutes} min
                  </p>
                )}
                <Button onClick={create} disabled={!chosen.length} className="w-full h-12 rounded-2xl text-base">
                  Crear sesión de hoy
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {picking && (
          <ExercisePickerModal
            catalog={catalog}
            title="Añadir ejercicio"
            onPick={e => { setChosen(list => [...list, e]); setPicking(false); }}
            onClose={() => setPicking(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
