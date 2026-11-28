'use client';

import { isExtra } from '@/lib/cardioCatalog';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Sparkles, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { ExercisePreview } from '@/components/workout/ExercisePreview';
import { ExercisePickerModal } from '@/components/workout/ExercisePickerModal';
import { formatRepLine } from '@/lib/exerciseFormat';
import { estimateSessionMinutes } from '@/lib/fitkMotor';
import type { Exercise } from '@/types/user';
import { planWeekStart, weekdayIndex } from '@/lib/weekCalendar';

const TUTORIAL_KEY = 'fitk-free-workout-tutorial-seen';

const TUTORIAL_STEPS = [
  { title: 'Eliges tú los ejercicios', text: 'Búscalos por nombre o filtra por grupo muscular.' },
  { title: 'Ajusta las series', text: 'Sube o baja las series de cada ejercicio con − y +.' },
  { title: 'Crea la sesión de hoy', text: 'Aparece en tu calendario y la entrenas como cualquier otra: con descansos y registro de pesos.' },
];

const FOCUS_OPTIONS = [
  { id: 'fullA', label: 'Cuerpo completo' },
  { id: 'torsoA', label: 'Torso' },
  { id: 'legs', label: 'Pierna' },
  { id: 'push', label: 'Empuje' },
  { id: 'pull', label: 'Tirón' },
  { id: 'cardio', label: 'Cardio' },
  { id: 'crossfit', label: 'CrossFit' },
];
const MINUTE_OPTIONS = [30, 45, 60];

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
  const { getExerciseCatalog, addFreeSession, addMotorSession, setSelectedWeeklySession, setScreen, user } = useApp();
  const [chosen, setChosen] = useState<Exercise[]>([]);
  const [picking, setPicking] = useState(false);
  // Sesión preparada por el Coach (la construye el Motor).
  const [place, setPlace] = useState<'gym' | 'outdoor'>('gym');
  const [focus, setFocus] = useState('fullA');
  const [autoMinutes, setAutoMinutes] = useState(45);
  const [autoError, setAutoError] = useState(false);
  // Día de la sesión (0 = lunes): hoy por defecto; se puede dejar para otro día de la semana.
  const todayIdx = weekdayIndex(new Date());
  const [day, setDay] = useState(todayIdx);
  const monday = planWeekStart();
  const weekDays = Array.from({ length: 7 }, (_, i) => { const d = new Date(monday); d.setDate(monday.getDate() + i); return d; });
  const firstAllowed = weekDays.findIndex(d => d >= new Date(new Date().setHours(0, 0, 0, 0)));
  // La primera vez que se abre, el Coach explica para qué sirve este modo.
  const [tutorial, setTutorial] = useState(false);
  useEffect(() => {
    if (!open) return;
    try { setTutorial(localStorage.getItem(TUTORIAL_KEY) !== '1'); } catch { setTutorial(false); }
  }, [open]);
  const finishTutorial = () => {
    try { localStorage.setItem(TUTORIAL_KEY, '1'); } catch { /* sin almacenamiento */ }
    setTutorial(false);
  };

  const catalog = useMemo(
    () => (open ? getExerciseCatalog().filter(e => (e.libraryId || isExtra(e)) && !chosen.some(c => c.id === e.id)) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open, chosen],
  );
  const totalSets = chosen.reduce((a, e) => a + e.sets, 0);
  const minutes = chosen.length
    ? estimateSessionMinutes({ id: 'libre', sessionNumber: 0, name: '', targetMuscles: '', duration: 0, exercises: chosen, status: 'available' })
    : 0;

  const close = () => { setChosen([]); onClose(); };
  const openSession = (session: ReturnType<typeof addFreeSession>) => {
    if (!session) return;
    setChosen([]);
    onClose();
    setSelectedWeeklySession(session);
    setScreen('workout-preview');
  };
  const createAuto = () => {
    const session = addMotorSession({ place, focus, minutes: autoMinutes, day });
    setAutoError(!session);
    openSession(session);
  };
  const create = () => {
    const session = addFreeSession(chosen, undefined, undefined, day);
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
                    <p className="text-sm text-stone-500">Elige los ejercicios y el día.</p>
                  </div>
                  <button onClick={close} aria-label="Cerrar" className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
                    <X className="w-5 h-5 text-stone-600" />
                  </button>
                </div>
              </div>

              {!tutorial && (
                <div className="px-5 pb-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-1.5">Para el día</p>
                  <div className="grid grid-cols-7 gap-1">
                    {weekDays.map((d, i) => {
                      const disabled = i < Math.max(0, firstAllowed);
                      return (
                        <button key={i} type="button" disabled={disabled} onClick={() => setDay(i)} aria-pressed={day === i}
                          className={`lg-keep flex flex-col items-center py-1.5 rounded-xl text-xs font-semibold transition-colors disabled:opacity-30 ${
                            day === i ? 'bg-emerald-500 text-white' : 'bg-[rgba(118,118,128,0.12)] text-stone-600 dark:text-white/70'
                          }`}>
                          <span className="text-[10px] uppercase opacity-80">{['L', 'M', 'X', 'J', 'V', 'S', 'D'][i]}</span>
                          <span className="tabular-nums">{d.getDate()}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {tutorial ? (
                <div className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="rounded-2xl rounded-tl-md bg-emerald-50 px-4 py-3">
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-0.5">Coach</p>
                      <p className="text-sm text-stone-800 leading-relaxed">
                        Este modo es para los días en que quieres entrenar a tu manera, fuera de tu plan. Tu semana no cambia: solo se añade esta sesión. Y si no te apetece elegir, te la preparo yo: de gimnasio o en la calle con barras.
                      </p>
                    </div>
                  </div>
                  <ol className="space-y-2.5">
                    {TUTORIAL_STEPS.map((step, i) => (
                      <motion.li
                        key={step.title}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + i * 0.12 }}
                        className="flex items-start gap-3"
                      >
                        <span className="w-6 h-6 rounded-full bg-[rgba(118,118,128,0.12)] text-stone-700 text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                        <div>
                          <p className="text-sm font-semibold text-stone-900">{step.title}</p>
                          <p className="text-sm text-stone-500">{step.text}</p>
                        </div>
                      </motion.li>
                    ))}
                  </ol>
                  <Button onClick={finishTutorial} className="w-full h-12 rounded-full text-base">Entendido, vamos</Button>
                </div>
              ) : (<>
              <div className="flex-1 overflow-y-auto no-scrollbar px-5 space-y-2">
                {chosen.length === 0 && user && (
                  <div className="rounded-2xl bg-emerald-50 p-3.5 space-y-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                      </div>
                      <p className="text-sm font-semibold text-stone-900">¿Te la preparo yo?</p>
                    </div>
                    <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[rgba(118,118,128,0.12)]">
                      {([['gym', 'Gimnasio'], ['outdoor', 'Calle y barras']] as const).map(([id, label]) => (
                        <button key={id} type="button" onClick={() => setPlace(id)} aria-pressed={place === id}
                          className={`h-8 rounded-lg text-sm font-semibold ${place === id ? 'bg-[#fff] dark:bg-[#48484a] text-stone-900 dark:text-white shadow-sm' : 'text-stone-500'}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                    {place === 'gym' ? (
                      <div className="flex flex-wrap gap-1.5">
                        {FOCUS_OPTIONS.map(f => (
                          <button key={f.id} type="button" onClick={() => setFocus(f.id)} aria-pressed={focus === f.id}
                            className={`h-10 px-3 rounded-full text-xs font-semibold ${focus === f.id ? 'bg-emerald-500 text-white' : 'bg-[rgba(118,118,128,0.12)] text-stone-600'}`}>
                            {f.label}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-stone-600">Cuerpo completo con tu peso: flexiones, dominadas, fondos, zancadas y abdominales colgado.</p>
                    )}
                    <div className="flex items-center gap-1.5">
                      {MINUTE_OPTIONS.map(m => (
                        <button key={m} type="button" onClick={() => setAutoMinutes(m)} aria-pressed={autoMinutes === m}
                          className={`h-10 px-3 rounded-full text-xs font-semibold tabular-nums ${autoMinutes === m ? 'bg-emerald-500 text-white' : 'bg-[rgba(118,118,128,0.12)] text-stone-600'}`}>
                          {m} min
                        </button>
                      ))}
                      <Button onClick={createAuto} className="ml-auto h-10 px-4 rounded-full text-sm">Prepárala</Button>
                    </div>
                    {autoError && <p className="text-xs text-red-600">No he encontrado ejercicios con esas condiciones. Prueba con otro enfoque.</p>}
                  </div>
                )}
                {chosen.length === 0 && user && (
                  <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 pt-1">O elige tú los ejercicios</p>
                )}
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
                        className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center disabled:opacity-30"
                      >
                        <Minus className="w-4 h-4 text-stone-700" />
                      </button>
                      <span className="w-12 text-center leading-tight"><span className="block text-sm font-semibold text-stone-900 tabular-nums">{e.sets}</span><span className="block text-[10px] text-stone-500">{e.sets === 1 ? 'serie' : 'series'}</span></span>
                      <button
                        type="button"
                        aria-label="Añadir una serie"
                        disabled={e.sets >= MAX_SETS}
                        onClick={() => setChosen(list => list.map((x, k) => (k === i ? withSets(x, x.sets + 1) : x)))}
                        className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center disabled:opacity-30"
                      >
                        <Plus className="w-4 h-4 text-stone-700" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Quitar ${e.name}`}
                        onClick={() => setChosen(list => list.filter((_, k) => k !== i))}
                        className="w-9 h-9 -mr-1 rounded-full flex items-center justify-center text-stone-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setPicking(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-[rgba(118,118,128,0.12)] py-4 text-sm font-semibold text-emerald-700 dark:text-emerald-400"
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
                <Button onClick={create} disabled={!chosen.length} className="w-full h-12 rounded-full text-base">
                  {day === todayIdx ? 'Crear sesión de hoy' : `Crear para el ${weekDays[day].toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' })}`}
                </Button>
              </div>
              </>)}
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
