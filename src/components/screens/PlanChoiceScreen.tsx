'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, ChevronDown, Repeat } from 'lucide-react';
import { formatRepLine } from '@/lib/exerciseFormat';
import { STRUCTURE_COPY } from '@/lib/fitkSpecV1';
import { exerciseBlocks } from '@/components/workout/ExerciseBits';
import type { WeeklySession } from '@/types/user';

const totalSets = (s: WeeklySession) => s.exercises.reduce((a, e) => a + e.sets, 0);

// Para 3 días hay dos estructuras igual de válidas (Word §3): el Motor no
// decide por el usuario, las enseña y el usuario elige.
export function PlanChoiceScreen() {
  const { planOptions, choosePlanOption } = useApp();
  const [detail, setDetail] = useState<number | null>(null);

  if (!planOptions || planOptions.length < 2) return null;

  return (
    <div className="min-h-dvh glass-bg px-5 pt-10 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      <div className="max-w-md mx-auto w-full space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto bg-emerald-100 rounded-2xl flex items-center justify-center mb-3">
            <CalendarDays className="w-7 h-7 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 text-balance">Elige cómo organizar tu semana</h1>
          <p className="text-stone-500 text-balance">
            Con {planOptions[0].length} días hay dos repartos igual de válidos. Escoge el que mejor te encaje.
          </p>
        </motion.div>

        {planOptions.map((sessions, i) => {
          const letter = i === 0 ? 'A' : 'B';
          const split = sessions[0]?.motorTrace?.split ?? '';
          const copy = STRUCTURE_COPY[split];
          const open = detail === i;
          const weekSets = sessions.reduce((a, s) => a + totalSets(s), 0);
          const longest = Math.max(...sessions.map(s => s.duration));
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.08 }}>
              <Card className="p-5 rounded-3xl space-y-4">
                <div className="space-y-1.5">
                  <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:text-emerald-300">
                    Opción {letter}
                  </span>
                  <h2 className="text-xl font-bold text-stone-900">{copy?.title ?? split}</h2>
                  {copy && <p className="text-sm text-stone-500">{copy.summary}</p>}
                </div>

                <ol className="space-y-2">
                  {sessions.map((s, d) => (
                    <li key={s.id} className="flex items-center gap-3 rounded-2xl bg-white/60 dark:bg-white/5 border border-stone-200/70 dark:border-white/10 px-3 py-2.5">
                      <span className="w-8 h-8 rounded-xl bg-emerald-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">{d + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-stone-800 leading-snug">{s.name}</p>
                        <p className="text-xs text-stone-500 tabular-nums">{s.exercises.length} ejercicios · {totalSets(s)} series</p>
                      </div>
                      <span className="text-sm font-semibold text-stone-700 tabular-nums flex-shrink-0">{s.duration} min</span>
                    </li>
                  ))}
                </ol>

                <p className="text-xs text-stone-500 tabular-nums">
                  {weekSets} series a la semana · ninguna sesión pasa de {longest} min
                </p>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-4 pt-1">
                        {sessions.map((s, d) => (
                          <div key={s.id}>
                            <p className="text-xs font-bold uppercase tracking-wide text-stone-500 mb-1.5">Día {d + 1} · {s.name}</p>
                            <ul className="space-y-1">
                              {exerciseBlocks(s.exercises).map(block => (
                                <li key={block.join('-')} className={block.length > 1 ? 'rounded-xl border border-teal-200 dark:border-teal-400/25 bg-teal-50/60 dark:bg-teal-500/10 px-2 py-1' : 'px-2'}>
                                  {block.length > 1 && (
                                    <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-teal-700 dark:text-teal-300">
                                      <Repeat className="w-3 h-3" /> Biserie
                                    </p>
                                  )}
                                  {block.map(idx => {
                                    const e = s.exercises[idx];
                                    return (
                                      <div key={e.id} className="flex items-baseline justify-between gap-3 py-0.5 text-sm">
                                        <span className="text-stone-700">{e.name}</span>
                                        <span className="text-stone-400 text-xs flex-shrink-0 tabular-nums">{e.sets} × {formatRepLine(e)}</span>
                                      </div>
                                    );
                                  })}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setDetail(open ? null : i)}
                    aria-expanded={open}
                    className="flex items-center gap-1 text-sm text-emerald-700 dark:text-emerald-400 font-medium py-2"
                  >
                    {open ? 'Ocultar ejercicios' : 'Ver ejercicios'}
                    <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>
                  <Button onClick={() => choosePlanOption(i)} className="flex-1 h-12 rounded-2xl text-base font-semibold">
                    Elegir opción {letter}
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}

        <p className="text-stone-500 text-sm text-center">Podrás cambiarla más adelante en una revisión.</p>
      </div>
    </div>
  );
}
