'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  TrendingUp,
  CalendarCheck,
  Scale,
  Flame,
  Check,
} from 'lucide-react';

// ─── Preguntas de escala ─────────────────────────────────────────────
const SCALE_STEPS: {
  key: 'strength' | 'energy' | 'recovery' | 'sleep' | 'stress' | 'motivation';
  title: string;
  subtitle?: string;
  options: string[];
}[] = [
  { key: 'strength',   title: '¿Cómo sientes tu evolución en fuerza?',                          options: ['Mucho mejor', 'Algo mejor', 'Igual', 'Peor'] },
  { key: 'energy',     title: '¿Cómo te has sentido durante los entrenamientos?',               subtitle: 'Estas últimas semanas', options: ['Alta', 'Normal', 'Baja', 'Muy baja'] },
  { key: 'recovery',   title: '¿Cómo recuperas entre sesiones?',                                options: ['Muy bien', 'Bien', 'Normal', 'Mal', 'Muy mal'] },
  { key: 'sleep',      title: '¿Cómo has dormido últimamente?',                                 options: ['Muy bien', 'Bien', 'Normal', 'Mal', 'Muy mal'] },
  { key: 'stress',     title: '¿Cómo ha sido tu nivel de estrés?',                              options: ['Muy bajo', 'Bajo', 'Normal', 'Alto', 'Muy alto'] },
  { key: 'motivation', title: '¿Cómo te encuentras respecto al entrenamiento?',                 options: ['Muy motivado', 'Motivado', 'Normal', 'Me está costando', 'Muy desmotivado'] },
];

const GOAL_OPTIONS: { id: string; label: string }[] = [
  { id: 'energy',      label: 'Ganar energía' },
  { id: 'feel-better', label: 'Sentirme mejor' },
  { id: 'strength',    label: 'Ganar fuerza' },
  { id: 'routine',     label: 'Crear una rutina constante' },
  { id: 'physique',    label: 'Mejorar mi físico' },
  { id: 'performance', label: 'Rendimiento deportivo' },
  { id: 'maintain',    label: 'Mantener mi forma' },
  { id: 'lose-weight', label: 'Perder peso' },
  { id: 'lose-fat',    label: 'Perder grasa sin perder músculo' },
  { id: 'recomp',      label: 'Recomposición corporal' },
];

const MEASUREMENT_FIELDS: { key: 'waist' | 'chest' | 'arms' | 'thighs' | 'calves'; label: string }[] = [
  { key: 'waist',  label: 'Cintura (cm)' },
  { key: 'chest',  label: 'Pecho (cm)' },
  { key: 'arms',   label: 'Brazo (cm)' },
  { key: 'thighs', label: 'Muslo (cm)' },
  { key: 'calves', label: 'Gemelo (cm)' },
];

// intro → goal → weight → measurements → 6 escalas → availability → discomfort → result
type Phase = 'intro' | 'goal' | 'weight' | 'measurements' | 'scales' | 'availability' | 'discomfort' | 'submitting' | 'result';

interface Evolution {
  weightPrev: number | null;
  weightNow: number | null;
  completedSessions: number;
  plannedSessions: number;
  attendancePct: number;
  weeksTrained: number;
}

export function ReviewScreen() {
  const { user, setScreen } = useApp();

  const [phase, setPhase] = useState<Phase>('intro');
  const [scaleIndex, setScaleIndex] = useState(0);

  const [goal, setGoal] = useState<'same' | 'change'>('same');
  const [newGoal, setNewGoal] = useState<string | null>(null);
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [weight, setWeight] = useState('');
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [scales, setScales] = useState<Record<string, string>>({});
  const [availability, setAvailability] = useState<'same' | 'change'>('same');
  const [showDaysPicker, setShowDaysPicker] = useState(false);
  const [newDays, setNewDays] = useState<number | null>(null);
  const [hasDiscomfort, setHasDiscomfort] = useState<boolean | null>(null);
  const [discomfort, setDiscomfort] = useState('');

  const [result, setResult] = useState<{ coachMessage: string; evolution: Evolution } | null>(null);
  const [error, setError] = useState('');

  if (!user) return null;

  const totalSteps = 6 + SCALE_STEPS.length; // goal, weight, measurements, escalas, availability, discomfort
  const currentStep =
    phase === 'goal' ? 1 :
    phase === 'weight' ? 2 :
    phase === 'measurements' ? 3 :
    phase === 'scales' ? 4 + scaleIndex :
    phase === 'availability' ? 4 + SCALE_STEPS.length :
    phase === 'discomfort' ? 5 + SCALE_STEPS.length : 0;

  async function submit(finalDiscomfort: string) {
    setPhase('submitting');
    setError('');
    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal,
          newGoal: goal === 'change' ? newGoal : undefined,
          weight: weight ? parseFloat(weight) : undefined,
          measurements: Object.fromEntries(
            Object.entries(measurements)
              .filter(([, v]) => v.trim() !== '')
              .map(([k, v]) => [k, parseFloat(v)])
          ),
          strength: scales.strength,
          energy: scales.energy,
          recovery: scales.recovery,
          sleep: scales.sleep,
          stress: scales.stress,
          motivation: scales.motivation,
          availability,
          newDaysPerWeek: availability === 'change' ? newDays : undefined,
          discomfort: finalDiscomfort || undefined,
        }),
      });
      if (!res.ok) throw new Error('bad status');
      const data = await res.json();
      setResult({ coachMessage: data.coachMessage, evolution: data.evolution });
      setPhase('result');
    } catch {
      setError('No se pudo guardar la revisión. Inténtalo de nuevo.');
      setPhase('discomfort');
    }
  }

  const OptionButton = ({ label, onClick, selected }: { label: string; onClick: () => void; selected?: boolean }) => (
    <button
      onClick={onClick}
      className={`w-full px-5 py-4 rounded-2xl text-left font-medium transition-all ${
        selected
          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
          : 'glass-card text-stone-800 dark:text-stone-100 hover:ring-1 hover:ring-emerald-400/40'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-dvh glass-bg flex flex-col">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 flex items-center gap-3">
        {phase !== 'result' && phase !== 'submitting' && (
          <button onClick={() => setScreen('dashboard')} className="p-2 rounded-xl glass-btn shadow-sm">
            <ArrowLeft className="w-5 h-5 text-stone-600" />
          </button>
        )}
        <div className="flex-1">
          <h1 className="text-xl font-bold text-stone-900">Revisión</h1>
          {phase !== 'intro' && phase !== 'result' && phase !== 'submitting' && (
            <div className="h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full mt-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 px-6 pb-10 overflow-y-auto">
        <AnimatePresence mode="wait">

          {/* ── Intro ── */}
          {phase === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="flex flex-col items-center text-center pt-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-200">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <p className="text-stone-700 dark:text-stone-200 leading-relaxed max-w-sm mb-8">
                Llevamos varias semanas entrenando juntos. Me gustaría hacer una pequeña revisión para comprobar cómo estás y asegurarme de que el plan sigue siendo el adecuado para ti. Solo tardaremos un par de minutos.
              </p>
              <Button onClick={() => setPhase('goal')} className="w-full max-w-sm py-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-base font-semibold shadow-lg shadow-emerald-200">
                Empezar
              </Button>
              <button onClick={() => setScreen('dashboard')} className="mt-4 text-stone-400 text-sm">Ahora no</button>
            </motion.div>
          )}

          {/* ── 1. Objetivo ── */}
          {phase === 'goal' && (
            <motion.div key="goal" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="space-y-3 pt-4">
              <h2 className="text-lg font-semibold text-stone-900 mb-4">¿Sigues teniendo el mismo objetivo?</h2>
              {!showGoalPicker ? (
                <>
                  <OptionButton label="Sí, el mismo" onClick={() => { setGoal('same'); setPhase('weight'); }} />
                  <OptionButton label="Quiero cambiarlo" onClick={() => { setGoal('change'); setShowGoalPicker(true); }} />
                </>
              ) : (
                <>
                  <p className="text-stone-500 text-sm mb-2">¿Cuál es tu nuevo objetivo?</p>
                  {GOAL_OPTIONS.map(g => (
                    <OptionButton key={g.id} label={g.label} selected={newGoal === g.id}
                      onClick={() => { setNewGoal(g.id); setPhase('weight'); }} />
                  ))}
                </>
              )}
            </motion.div>
          )}

          {/* ── 2. Peso ── */}
          {phase === 'weight' && (
            <motion.div key="weight" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="pt-4">
              <h2 className="text-lg font-semibold text-stone-900 mb-1">¿Cuál es tu peso actual?</h2>
              <p className="text-stone-400 text-sm mb-5">Nos ayuda a seguir tu evolución</p>
              <div className="glass-card rounded-2xl flex items-center gap-2 p-2 mb-6 max-w-xs">
                <input
                  type="number" inputMode="decimal" value={weight}
                  onChange={e => setWeight(e.target.value)}
                  placeholder={user.profile.weight ? String(user.profile.weight) : 'Ej: 72.5'}
                  className="flex-1 bg-transparent px-3 py-3 text-2xl font-bold text-stone-900 dark:text-white outline-none w-full"
                />
                <span className="text-stone-400 font-medium pr-3">kg</span>
              </div>
              <Button disabled={!weight.trim()} onClick={() => setPhase('measurements')}
                className="w-full py-5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 font-semibold disabled:opacity-40">
                Continuar
              </Button>
            </motion.div>
          )}

          {/* ── 3. Medidas (opcional) ── */}
          {phase === 'measurements' && (
            <motion.div key="meas" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="pt-4">
              <h2 className="text-lg font-semibold text-stone-900 mb-1">¿Quieres añadir alguna medida?</h2>
              <p className="text-stone-400 text-sm mb-5">Totalmente opcional — rellena solo las que quieras</p>
              <div className="space-y-3 mb-6">
                {MEASUREMENT_FIELDS.map(f => (
                  <div key={f.key} className="glass-card rounded-2xl flex items-center p-2">
                    <span className="text-stone-500 text-sm px-3 w-32 flex-shrink-0">{f.label}</span>
                    <input
                      type="number" inputMode="decimal"
                      value={measurements[f.key] ?? ''}
                      onChange={e => setMeasurements(prev => ({ ...prev, [f.key]: e.target.value }))}
                      className="flex-1 bg-transparent px-2 py-2.5 text-stone-900 dark:text-white outline-none min-w-0"
                    />
                  </div>
                ))}
              </div>
              <Button onClick={() => { setScaleIndex(0); setPhase('scales'); }}
                className="w-full py-5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 font-semibold">
                Continuar
              </Button>
            </motion.div>
          )}

          {/* ── 4-9. Escalas ── */}
          {phase === 'scales' && (
            <motion.div key={`scale-${scaleIndex}`} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="space-y-3 pt-4">
              <h2 className="text-lg font-semibold text-stone-900">{SCALE_STEPS[scaleIndex].title}</h2>
              {SCALE_STEPS[scaleIndex].subtitle && (
                <p className="text-stone-400 text-sm">{SCALE_STEPS[scaleIndex].subtitle}</p>
              )}
              <div className="space-y-3 pt-2">
                {SCALE_STEPS[scaleIndex].options.map(opt => (
                  <OptionButton key={opt} label={opt} onClick={() => {
                    setScales(prev => ({ ...prev, [SCALE_STEPS[scaleIndex].key]: opt }));
                    if (scaleIndex < SCALE_STEPS.length - 1) setScaleIndex(scaleIndex + 1);
                    else setPhase('availability');
                  }} />
                ))}
              </div>
            </motion.div>
          )}

          {/* ── 10. Disponibilidad ── */}
          {phase === 'availability' && (
            <motion.div key="avail" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="space-y-3 pt-4">
              <h2 className="text-lg font-semibold text-stone-900 mb-4">¿Sigues pudiendo entrenar los mismos días?</h2>
              {!showDaysPicker ? (
                <>
                  <OptionButton label="Sí, sin cambios" onClick={() => { setAvailability('same'); setPhase('discomfort'); }} />
                  <OptionButton label="No, ha cambiado" onClick={() => { setAvailability('change'); setShowDaysPicker(true); }} />
                </>
              ) : (
                <>
                  <p className="text-stone-500 text-sm mb-2">¿Cuántos días a la semana puedes entrenar ahora?</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7].map(d => (
                      <button key={d}
                        onClick={() => { setNewDays(d); setPhase('discomfort'); }}
                        className={`py-4 rounded-2xl font-bold text-lg transition-all ${
                          newDays === d ? 'bg-emerald-500 text-white' : 'glass-card text-stone-800 dark:text-stone-100'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ── 11. Molestias ── */}
          {phase === 'discomfort' && (
            <motion.div key="disc" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="space-y-3 pt-4">
              <h2 className="text-lg font-semibold text-stone-900 mb-4">¿Has tenido alguna molestia o lesión estas semanas?</h2>
              {hasDiscomfort === null ? (
                <>
                  <OptionButton label="No, todo bien" onClick={() => { setHasDiscomfort(false); submit(''); }} />
                  <OptionButton label="Sí, he notado algo" onClick={() => setHasDiscomfort(true)} />
                </>
              ) : (
                <>
                  <p className="text-stone-500 text-sm mb-2">Cuéntame brevemente qué has notado</p>
                  <textarea
                    value={discomfort}
                    onChange={e => setDiscomfort(e.target.value)}
                    rows={4}
                    placeholder="Ej: molestia en el hombro derecho al hacer press…"
                    className="w-full glass-input rounded-2xl px-4 py-3 text-stone-900 dark:text-white outline-none resize-none"
                  />
                  <Button disabled={!discomfort.trim()} onClick={() => submit(discomfort)}
                    className="w-full py-5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 font-semibold disabled:opacity-40">
                    Finalizar revisión
                  </Button>
                </>
              )}
              {error && <p className="text-red-500 text-sm text-center pt-2">{error}</p>}
            </motion.div>
          )}

          {/* ── Procesando ── */}
          {phase === 'submitting' && (
            <motion.div key="sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center pt-24 text-center">
              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
              <p className="text-stone-600 dark:text-stone-300 font-medium">Analizando tu evolución…</p>
              <p className="text-stone-400 text-sm mt-1">El Coach está revisando tus datos</p>
            </motion.div>
          )}

          {/* ── Tu evolución ── */}
          {phase === 'result' && result && (
            <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-200">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-stone-900">Tu evolución</h2>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="glass-card rounded-2xl p-4 text-center">
                  <Scale className="w-5 h-5 text-emerald-500 mx-auto mb-1.5" />
                  <p className="text-xl font-bold text-stone-900">
                    {result.evolution.weightNow ?? '—'} kg
                  </p>
                  <p className="text-stone-400 text-xs">
                    {result.evolution.weightPrev != null && result.evolution.weightNow != null
                      ? `${result.evolution.weightNow - result.evolution.weightPrev > 0 ? '+' : ''}${(result.evolution.weightNow - result.evolution.weightPrev).toFixed(1)} kg desde la última vez`
                      : 'Peso actual'}
                  </p>
                </div>
                <div className="glass-card rounded-2xl p-4 text-center">
                  <CalendarCheck className="w-5 h-5 text-emerald-500 mx-auto mb-1.5" />
                  <p className="text-xl font-bold text-stone-900">{result.evolution.completedSessions}</p>
                  <p className="text-stone-400 text-xs">entrenos completados</p>
                </div>
                <div className="glass-card rounded-2xl p-4 text-center">
                  <Check className="w-5 h-5 text-emerald-500 mx-auto mb-1.5" />
                  <p className="text-xl font-bold text-stone-900">{result.evolution.attendancePct}%</p>
                  <p className="text-stone-400 text-xs">asistencia</p>
                </div>
                <div className="glass-card rounded-2xl p-4 text-center">
                  <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1.5" />
                  <p className="text-xl font-bold text-stone-900">{result.evolution.weeksTrained}</p>
                  <p className="text-stone-400 text-xs">semanas entrenando</p>
                </div>
              </div>

              {/* Mensaje del Coach */}
              <div className="glass-modal rounded-2xl p-5 mb-6 border border-emerald-200/50 dark:border-emerald-500/20">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-stone-700 dark:text-stone-200 text-sm leading-relaxed">
                    {result.coachMessage}
                  </p>
                </div>
              </div>

              <Button onClick={() => setScreen('dashboard')}
                className="w-full py-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-base font-semibold shadow-lg shadow-emerald-200">
                Volver al inicio
              </Button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
