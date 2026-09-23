'use client';

import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Dumbbell, Check } from 'lucide-react';

// Sección 7 del Motor Fit-K: para 3-4 días/semana hay dos estructuras
// técnicamente válidas. Ninguna se degrada para "marcar un ganador" — el
// usuario elige la que más le encaje.
export function PlanChoiceScreen() {
  const { planOptions, choosePlanOption } = useApp();

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
                  <p className="font-semibold text-stone-900 mb-3">Opción {i === 0 ? 'A' : 'B'}</p>
                  <div className="space-y-2 mb-4">
                    {sessions.map(s => (
                      <div key={s.id} className="flex items-center justify-between text-sm">
                        <span className="text-stone-700">{s.name}</span>
                        <span className="text-stone-400">{s.targetMuscles} · {s.duration} min</span>
                      </div>
                    ))}
                  </div>
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
