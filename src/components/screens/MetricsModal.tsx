'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ArrowUp, ArrowDown, Minus, Plus, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LineChart, SparkLine } from '@/components/metrics/LineChart';
import type { BodyMeasurementRecord } from '@/types/user';

// ─── Medidas: qué es cada una y cómo medirla ──────────────────────────────────
const MEASURES = [
  { id: 'chest',    label: 'Pecho',     how: 'Por la parte más ancha, bajo las axilas' },
  { id: 'waist',    label: 'Cintura',   how: 'A la altura del ombligo, sin meter tripa' },
  { id: 'hips',     label: 'Cadera',    how: 'Por la parte más ancha de la cadera' },
  { id: 'glutes',   label: 'Glúteo',    how: 'Por el punto más saliente del glúteo' },
  { id: 'arms',     label: 'Brazo',     how: 'Brazo relajado, a mitad entre hombro y codo' },
  { id: 'forearms', label: 'Antebrazo', how: 'Por la parte más ancha' },
  { id: 'thighs',   label: 'Muslo',     how: 'A mitad del muslo, de pie' },
  { id: 'calves',   label: 'Gemelo',    how: 'Por la parte más ancha' },
] as const;
type MeasureId = typeof MEASURES[number]['id'];

const fmt = (n: number, d = 1) => n.toLocaleString('es-ES', { maximumFractionDigits: d });
const shortDate = (d: Date | string) => new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

interface MetricsModalProps {
  gender: 'male' | 'female';
  currentWeight: number;
  /** Altura en cm: permite calcular el IMC y la relación cintura/altura. */
  height?: number;
  lastRecord: BodyMeasurementRecord | null;
  history?: BodyMeasurementRecord[];
  onSave: (data: { weight?: number; record: BodyMeasurementRecord }) => void;
  onClose: () => void;
}

/** Cambio entre el primer y el último valor de una serie. */
function Delta({ value, unit }: { value: number | null; unit: string }) {
  if (value === null) return null;
  const flat = Math.abs(value) < 0.05;
  const Icon = flat ? Minus : value > 0 ? ArrowUp : ArrowDown;
  return (
    <span className="inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums px-1.5 py-0.5 rounded-md bg-[rgba(118,118,128,0.12)] text-stone-600 dark:text-white/70">
      <Icon className="w-3 h-3" />
      {flat ? 'Igual' : `${value > 0 ? '+' : '−'}${fmt(Math.abs(value))} ${unit}`}
    </span>
  );
}

export function MetricsModal({ currentWeight, height, lastRecord, history = [], onSave, onClose }: MetricsModalProps) {
  // Antiguo → reciente
  const chrono = useMemo(
    () => [...history].sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()),
    [history],
  );
  const [tab, setTab] = useState<'summary' | 'register'>(chrono.length ? 'summary' : 'register');
  const [saved, setSaved] = useState(false);

  const series = (id: MeasureId | 'weight') =>
    chrono
      .map(r => ({ date: new Date(r.recordedAt), value: (r as unknown as Record<string, number | undefined>)[id] }))
      .filter((p): p is { date: Date; value: number } => typeof p.value === 'number');
  const deltaOf = (s: { value: number }[]) => (s.length >= 2 ? s[s.length - 1].value - s[0].value : null);

  const weightSeries = series('weight');
  const weightNow = weightSeries.at(-1)?.value ?? currentWeight;
  const latest = (id: MeasureId) => series(id).at(-1)?.value;

  // Indicadores orientativos
  const bmi = height && weightNow ? weightNow / (height / 100) ** 2 : null;
  const bmiZone = bmi === null ? null : bmi < 18.5 ? 'Bajo' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Alto' : 'Muy alto';
  const waistNow = latest('waist');
  const whtr = height && waistNow ? waistNow / height : null;
  const whtrZone = whtr === null ? null : whtr < 0.5 ? 'Recomendable' : whtr < 0.6 ? 'Algo alto' : 'Alto';

  // Formulario
  const [weightDraft, setWeightDraft] = useState(weightNow ? String(weightNow) : '');
  const [draft, setDraft] = useState<Record<MeasureId, string>>(
    () => Object.fromEntries(MEASURES.map(m => [m.id, ''])) as Record<MeasureId, string>,
  );
  const stepWeight = (d: number) => {
    const base = parseFloat(weightDraft.replace(',', '.')) || weightNow || 70;
    setWeightDraft(String(Math.max(30, Math.round((base + d) * 10) / 10)));
  };
  const num = (v: string) => (v.trim() ? parseFloat(v.replace(',', '.')) : undefined);

  const handleSave = () => {
    const weight = num(weightDraft);
    const record: BodyMeasurementRecord = {
      weight,
      ...Object.fromEntries(MEASURES.map(m => [m.id, num(draft[m.id])])),
      recordedAt: new Date(),
    } as BodyMeasurementRecord;
    onSave({ weight, record });
    setSaved(true);
    setTimeout(onClose, 1100);
  };
  const filled = MEASURES.filter(m => draft[m.id].trim()).length + (weightDraft.trim() ? 1 : 0);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="glass-modal w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[94dvh] overflow-hidden flex flex-col"
      >
        <div className="px-5 pt-3 flex-shrink-0">
          <div className="w-10 h-1 bg-stone-300 dark:bg-white/20 rounded-full mx-auto mb-4" />
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-stone-900">Tus medidas</h2>
              <p className="text-stone-500 text-sm">
                {lastRecord ? `Último registro: ${shortDate(lastRecord.recordedAt)}` : 'Aún no has registrado medidas'}
              </p>
            </div>
            <button onClick={onClose} aria-label="Cerrar" className="w-9 h-9 rounded-full bg-[rgba(118,118,128,0.12)] flex items-center justify-center flex-shrink-0">
              <X className="w-5 h-5 text-stone-600 dark:text-white/70" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[rgba(118,118,128,0.12)] mt-4 mb-3">
            {([['summary', 'Resumen'], ['register', 'Registrar']] as const).map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} aria-pressed={tab === id}
                className={`h-8 rounded-lg text-sm font-semibold ${tab === id ? 'bg-[#fff] dark:bg-[#48484a] text-stone-900 dark:text-white shadow-sm' : 'text-stone-500'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto no-scrollbar flex-1 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {tab === 'summary' ? (
            <div className="space-y-4">
              {/* Peso */}
              <section className="rounded-2xl bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Peso</p>
                    <p className="text-4xl font-semibold text-stone-900 tabular-nums leading-tight">
                      {weightNow ? fmt(weightNow) : '—'}<span className="text-lg text-stone-400 ml-1">kg</span>
                    </p>
                  </div>
                  {weightSeries.length >= 2 && (
                    <div className="text-right">
                      <Delta value={deltaOf(weightSeries)} unit="kg" />
                      <p className="text-[11px] text-stone-400 mt-1">desde el {shortDate(weightSeries[0].date)}</p>
                    </div>
                  )}
                </div>
                {weightSeries.length >= 2 ? (
                  <div className="mt-3">
                    <LineChart data={weightSeries.map(p => ({ date: p.date.toISOString().slice(0, 10), value: p.value }))} unit=" kg" height={130} />
                  </div>
                ) : (
                  <p className="text-xs text-stone-500 mt-2">Con dos registros de peso verás aquí tu evolución.</p>
                )}
              </section>

              {/* Indicadores */}
              {(bmi !== null || whtr !== null) && (
                <section className="grid grid-cols-2 gap-3">
                  {bmi !== null && (
                    <div className="rounded-2xl bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10 p-3.5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">IMC</p>
                      <p className="text-2xl font-semibold text-stone-900 tabular-nums">{fmt(bmi)}</p>
                      <p className="text-xs text-stone-500">{bmiZone} · orientativo</p>
                    </div>
                  )}
                  <div className="rounded-2xl bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10 p-3.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Cintura / altura</p>
                    {whtr !== null ? (
                      <>
                        <p className="text-2xl font-semibold text-stone-900 tabular-nums">{fmt(whtr, 2)}</p>
                        <p className={`text-xs ${whtr < 0.5 ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-500'}`}>{whtrZone} · ideal &lt; 0,5</p>
                      </>
                    ) : (
                      <p className="text-xs text-stone-500 mt-1">Registra la cintura para verlo. Ideal por debajo de 0,5.</p>
                    )}
                  </div>
                </section>
              )}

              {/* Medidas */}
              <section>
                <p className="text-sm font-semibold text-stone-900 mb-2">Medidas</p>
                <div className="grid grid-cols-2 gap-3">
                  {MEASURES.map(m => {
                    const s = series(m.id);
                    const now = s.at(-1)?.value;
                    return (
                      <div key={m.id} className="rounded-2xl bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10 p-3">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-medium text-stone-500">{m.label}</p>
                          <Delta value={deltaOf(s)} unit="cm" />
                        </div>
                        <p className="text-xl font-semibold text-stone-900 tabular-nums mt-0.5">
                          {now !== undefined ? fmt(now) : '—'}{now !== undefined && <span className="text-xs text-stone-400 ml-0.5">cm</span>}
                        </p>
                        {s.length >= 2 ? <SparkLine data={s} height={28} /> : <p className="text-[11px] text-stone-400 h-7 flex items-end">{now === undefined ? 'Sin registrar' : '1 registro'}</p>}
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Historial */}
              {chrono.length > 0 && (
                <section>
                  <p className="text-sm font-semibold text-stone-900 mb-2">Historial</p>
                  <div className="rounded-2xl bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10 divide-y divide-black/5 dark:divide-white/10">
                    {[...chrono].reverse().slice(0, 10).map((r, i) => {
                      const count = MEASURES.filter(m => (r as unknown as Record<string, unknown>)[m.id] != null).length;
                      return (
                        <div key={r.id ?? i} className="flex items-center justify-between px-3.5 py-2.5 text-sm">
                          <span className="text-stone-700">{new Date(r.recordedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          <span className="text-stone-500 tabular-nums">
                            {r.weight != null ? `${fmt(r.weight)} kg` : ''}{r.weight != null && count ? ' · ' : ''}{count ? `${count} medidas` : ''}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              <Button onClick={() => setTab('register')} className="w-full h-12 rounded-full text-base">Registrar medidas de hoy</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2.5 rounded-2xl bg-emerald-50 p-3">
                <Ruler className="w-4 h-4 text-emerald-700 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-stone-700 leading-relaxed">
                  Mídete por la mañana, antes de desayunar y con la cinta sin apretar. Con una vez cada 2–4 semanas es suficiente. Rellena solo lo que quieras.
                </p>
              </div>

              {/* Peso con − / + */}
              <div className="rounded-2xl bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10 p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-stone-900">Peso</p>
                  <p className="text-xs text-stone-500">{weightSeries.length ? `Último: ${fmt(weightSeries.at(-1)!.value)} kg` : 'En kg'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" aria-label="Restar 0,1 kg" onClick={() => stepWeight(-0.1)} className="w-9 h-9 rounded-full bg-[rgba(118,118,128,0.12)] flex items-center justify-center">
                    <Minus className="w-4 h-4 text-stone-700" />
                  </button>
                  <input
                    id="m-weight"
                    inputMode="decimal"
                    value={weightDraft}
                    onChange={e => setWeightDraft(e.target.value)}
                    className="w-20 h-10 rounded-xl bg-[rgba(118,118,128,0.10)] text-center text-lg font-semibold text-stone-900 tabular-nums outline-none focus:ring-4 focus:ring-emerald-500/15"
                  />
                  <button type="button" aria-label="Sumar 0,1 kg" onClick={() => stepWeight(0.1)} className="w-9 h-9 rounded-full bg-[rgba(118,118,128,0.12)] flex items-center justify-center">
                    <Plus className="w-4 h-4 text-stone-700" />
                  </button>
                </div>
              </div>

              {/* Medidas en lista */}
              <div className="rounded-2xl bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10 divide-y divide-black/5 dark:divide-white/10">
                {MEASURES.map(m => {
                  const last = latest(m.id);
                  return (
                    <label key={m.id} htmlFor={`m-${m.id}`} className="flex items-center justify-between gap-3 px-4 py-3">
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-stone-900">{m.label}</span>
                        <span className="block text-xs text-stone-500">{m.how}</span>
                      </span>
                      <span className="flex items-center gap-1.5 flex-shrink-0">
                        <input
                          id={`m-${m.id}`}
                          inputMode="decimal"
                          value={draft[m.id]}
                          placeholder={last !== undefined ? fmt(last) : '—'}
                          onChange={e => setDraft(d => ({ ...d, [m.id]: e.target.value }))}
                          className="w-16 h-9 rounded-lg bg-[rgba(118,118,128,0.10)] text-right px-2 text-base font-semibold text-stone-900 tabular-nums placeholder:text-stone-400 placeholder:font-normal outline-none focus:ring-4 focus:ring-emerald-500/15"
                        />
                        <span className="text-xs text-stone-400 w-5">cm</span>
                      </span>
                    </label>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                {saved ? (
                  <motion.div key="ok" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center justify-center gap-2 h-12 bg-emerald-50 rounded-full text-emerald-700 dark:text-emerald-400 font-semibold">
                    <Check className="w-5 h-5" /> Guardado
                  </motion.div>
                ) : (
                  <motion.div key="btn">
                    <Button onClick={handleSave} disabled={!filled} className="w-full h-12 rounded-full text-base">
                      Guardar {filled ? `(${filled})` : ''}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
