'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Dumbbell, Check, ChevronDown } from 'lucide-react';
import { formatRepLine } from '@/lib/exerciseFormat';

// Sección 7 del Motor Fit-K: para 3-4 días/semana hay dos estructuras
// técnicamente válidas. Ninguna se degrada para "marcar un ganador" — el
// usuario elige la que más le encaje.
export function PlanChoiceScreen() {
  const { planOptions, choosePlanOption } = useApp();
  const [detail, setDetail] = useState<number | null>(null);

  if (!planOptions || planOptions.length < 2) return null;

  return (
    <div className="min-h-dvh glass-bg flex flex-col px-6 py-10">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto bg-emerald-100 rounded-2xl flex items-center justify-center mb-2">
              <Dumbbell className="w-7 h-7 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-stone-900">Elige tu estructura</h2>
            <p className="text-stone-500">
              Con tus días de entrenamiento hay dos formas igual de válidas de organizar la semana.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {planOptions.map((sessions, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.08 }}>
                <Card className="glass-card p-5 rounded-2xl border-2 border-transparent hover:border-emerald-200 transition-all">
                  <p className="font-semibold text-stone-900">Opción {i === 0 ? 'A' : 'B'}</p>
                  {sessions[0]?.motorTrace?.split && (
                    <p className="text-sm text-emerald-700 mb-3">{sessions[0].motorTrace.split}</p>
                  )}
                  <div className="space-y-2 mb-3">
                    {sessions.map(s => (
                      <div key={s.id}>
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="text-stone-700 font-medium">{s.name}</span>
                          <span className="text-stone-400 flex-shrink-0">{s.exercises.length} ejercicios · {s.duration} min</span>
                        </div>
                        {detail === i && (
                          <ul className="mt-1.5 mb-2 space-y-1 border-l-2 border-emerald-100 pl-3">
                            {s.exercises.map(e => (
                              <li key={e.id} className="flex items-baseline justify-between gap-3 text-xs">
                                <span className="text-stone-600">{e.name}</span>
                                <span className="text-stone-400 flex-shrink-0">{e.sets} × {formatRepLine(e)}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setDetail(detail === i ? null : i)}
                    aria-expanded={detail === i}
                    className="flex items-center gap-1 text-sm text-emerald-700 font-medium mb-4"
                  >
                    {detail === i ? 'Ocultar ejercicios' : 'Ver ejercicios'}
                    <ChevronDown className={`w-4 h-4 transition-transform ${detail === i ? 'rotate-180' : ''}`} />
                  </button>
                  <Button
                    onClick={() => choosePlanOption(i)}
                    className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Elegir esta
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>

          <p className="text-stone-400 text-sm text-center pt-2">
            No hay una opción mejor que otra — puedes cambiarla más adelante en una revisión.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
