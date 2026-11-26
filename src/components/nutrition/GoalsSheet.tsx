'use client';

// «Ajustar objetivos»: calcula las calorías y los macros con los datos de la
// persona (peso, altura, edad, sexo, báscula, actividad y meta) o los deja
// escribir a mano, al 100 %.

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calculator, SlidersHorizontal, Minus, Plus, AlertTriangle, Info } from 'lucide-react';
import type { BiologicalProfile, MacroTargets } from '@/types/user';
import {
  ACTIVITY_LEVELS, ENERGY_GOALS, GOAL_PACES, bmiCategory, computeEnergy,
  type ActivityLevel, type BodyData, type EnergyGoal, type GoalPace,
} from '@/lib/energyCalc';
import { MACRO_COLORS } from '@/lib/nutritionUtils';

const seg = (on: boolean) => `h-9 rounded-lg text-[13px] font-semibold transition-colors ${on ? 'bg-[#fff] dark:bg-[#48484a] text-stone-900 dark:text-white shadow-sm' : 'text-stone-500'}`;
const field = 'w-full h-11 rounded-xl bg-[rgba(118,118,128,0.10)] px-3 text-[15px] text-stone-900 dark:text-white placeholder:text-stone-400 outline-none focus:ring-4 focus:ring-emerald-500/15 tabular-nums';
const lbl = 'text-[11px] font-semibold uppercase tracking-wide text-stone-500 mb-1.5';
const fmt = (n: number) => n.toLocaleString('es-ES');

/** Número de un campo de texto: vacío = sin dato. Acepta coma decimal. */
const parseNum = (s: string): number | undefined => {
  const v = Number(s.replace(',', '.'));
  return s.trim() === '' || !Number.isFinite(v) ? undefined : v;
};
const toStr = (n?: number) => (n == null || !Number.isFinite(n) ? '' : String(n));

function NumField({ id, label, unit, value, onChange, placeholder }: { id: string; label: string; unit: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block min-w-0">
      <span className="block text-[11px] text-stone-500 mb-1 truncate">{label}</span>
      <span className="relative block">
        <input id={id} inputMode="decimal" value={value} placeholder={placeholder} onChange={e => onChange(e.target.value.replace(/[^\d.,]/g, ''))} className={`${field} pr-9`} />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 pointer-events-none">{unit}</span>
      </span>
    </label>
  );
}

function MacroStepper({ id, label, color, value, step, unit, onChange, sub }: { id: string; label: string; color: string; value: number; step: number; unit: string; onChange: (v: number) => void; sub?: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-stone-800 dark:text-white">{label}</p>
        {sub && <p className="text-[11px] text-stone-500">{sub}</p>}
      </div>
      <button type="button" aria-label={`Bajar ${label}`} onClick={() => onChange(Math.max(0, value - step))} className="w-9 h-9 rounded-full bg-[rgba(118,118,128,0.12)] flex items-center justify-center flex-shrink-0">
        <Minus className="w-4 h-4 text-stone-600 dark:text-white/70" />
      </button>
      <span className="relative w-24 flex-shrink-0">
        <input id={id} inputMode="numeric" aria-label={label} value={String(value)} onChange={e => onChange(Math.max(0, Math.round(Number(e.target.value.replace(/\D/g, '')) || 0)))}
          className="w-full h-10 rounded-xl bg-[rgba(118,118,128,0.10)] pl-2 pr-8 text-center text-base font-bold text-stone-900 dark:text-white outline-none focus:ring-4 focus:ring-emerald-500/15 tabular-nums" />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-stone-400 pointer-events-none">{unit}</span>
      </span>
      <button type="button" aria-label={`Subir ${label}`} onClick={() => onChange(value + step)} className="w-9 h-9 rounded-full bg-[rgba(118,118,128,0.12)] flex items-center justify-center flex-shrink-0">
        <Plus className="w-4 h-4 text-stone-600 dark:text-white/70" />
      </button>
    </div>
  );
}

export function GoalsSheet({ initialTargets, initialBody, profile, onSave, onClose }: {
  initialTargets: MacroTargets;
  initialBody: Partial<BodyData>;
  profile: { sex: BiologicalProfile; age: number; weightKg: number; heightCm: number };
  onSave: (targets: MacroTargets, body: BodyData | null, saveWeight: boolean) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<'calc' | 'manual'>('calc');
  // Datos para el cálculo (texto, para poder dejar campos vacíos)
  const [sex, setSex] = useState<BiologicalProfile>(initialBody.sex ?? profile.sex);
  const [age, setAge] = useState(toStr(initialBody.age ?? profile.age));
  const [weight, setWeight] = useState(toStr(initialBody.weightKg ?? profile.weightKg));
  const [height, setHeight] = useState(toStr(initialBody.heightCm ?? profile.heightCm));
  const [fat, setFat] = useState(toStr(initialBody.bodyFatPct));
  const [muscle, setMuscle] = useState(toStr(initialBody.muscleKg));
  const [activity, setActivity] = useState<ActivityLevel>(initialBody.activity ?? 'moderate');
  const [goal, setGoal] = useState<EnergyGoal>(initialBody.goal ?? 'maintain');
  const [pace, setPace] = useState<GoalPace>(initialBody.pace ?? 'normal');
  const [saveWeight, setSaveWeight] = useState(false);
  // Objetivos a mano
  const [manual, setManual] = useState<MacroTargets>(initialTargets);

  const body: BodyData = {
    sex, age: parseNum(age) ?? NaN, weightKg: parseNum(weight) ?? NaN, heightCm: parseNum(height) ?? NaN,
    bodyFatPct: parseNum(fat), muscleKg: parseNum(muscle), activity, goal, pace,
  };
  const result = useMemo(() => computeEnergy(body),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sex, age, weight, height, fat, activity, goal, pace]);
  const weightChanged = (parseNum(weight) ?? 0) > 0 && Math.abs((parseNum(weight) ?? 0) - profile.weightKg) >= 0.1;
  const fatOut = fat.trim() !== '' && !(parseNum(fat)! >= 3 && parseNum(fat)! <= 70);

  const macroKcal = manual.protein * 4 + manual.carbs * 4 + manual.fats * 9;
  const diff = macroKcal - manual.kcal;
  const pct = (g: number, k: number) => (manual.kcal > 0 ? Math.round((g * k / manual.kcal) * 100) : 0);
  const bmiInfo = result?.bmi != null ? bmiCategory(result.bmi) : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[60] flex items-end justify-center" onClick={onClose}>
      <motion.div role="dialog" aria-label="Ajustar objetivos" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="w-full max-w-md glass-modal rounded-t-3xl max-h-[94dvh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-stone-300 dark:bg-white/20 rounded-full mx-auto mt-3 flex-shrink-0" />
        <div className="flex items-start justify-between px-5 pt-3 pb-3 flex-shrink-0">
          <div>
            <h2 className="font-bold text-stone-900 dark:text-white text-xl">Ajustar objetivos</h2>
            <p className="text-sm text-stone-500">Calcúlalos con tus datos o ponlos a tu manera.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="w-9 h-9 rounded-full bg-[rgba(118,118,128,0.12)] flex items-center justify-center flex-shrink-0">
            <X className="w-5 h-5 text-stone-600 dark:text-white/70" />
          </button>
        </div>
        <div className="px-5 pb-3 flex-shrink-0">
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[rgba(118,118,128,0.12)]" role="tablist">
            <button type="button" role="tab" aria-selected={tab === 'calc'} onClick={() => setTab('calc')} className={`${seg(tab === 'calc')} flex items-center justify-center gap-1.5`}><Calculator className="w-4 h-4" /> Calcular</button>
            <button type="button" role="tab" aria-selected={tab === 'manual'} onClick={() => setTab('manual')} className={`${seg(tab === 'manual')} flex items-center justify-center gap-1.5`}><SlidersHorizontal className="w-4 h-4" /> A mano</button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-5 pb-4 space-y-5">
          {tab === 'calc' ? (
            <>
              <div>
                <p className={lbl}>Tus datos</p>
                <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[rgba(118,118,128,0.12)] mb-2.5">
                  <button type="button" aria-pressed={sex === 'male'} onClick={() => setSex('male')} className={seg(sex === 'male')}>Hombre</button>
                  <button type="button" aria-pressed={sex === 'female'} onClick={() => setSex('female')} className={seg(sex === 'female')}>Mujer</button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <NumField id="goal-age" label="Edad" unit="años" value={age} onChange={setAge} />
                  <NumField id="goal-weight" label="Peso" unit="kg" value={weight} onChange={setWeight} />
                  <NumField id="goal-height" label="Altura" unit="cm" value={height} onChange={setHeight} />
                </div>
                {weightChanged && (
                  <label className="mt-2.5 flex items-center gap-2.5 text-sm text-stone-700 dark:text-white/80">
                    <input type="checkbox" checked={saveWeight} onChange={e => setSaveWeight(e.target.checked)} className="w-4 h-4 accent-emerald-500" />
                    Guardar {weight} kg en mis métricas
                  </label>
                )}
              </div>

              <div>
                <p className={lbl}>Báscula (opcional)</p>
                <div className="grid grid-cols-2 gap-2">
                  <NumField id="goal-fat" label="Grasa corporal" unit="%" value={fat} onChange={setFat} placeholder="Ej. 18" />
                  <NumField id="goal-muscle" label="Masa muscular" unit="kg" value={muscle} onChange={setMuscle} placeholder="Ej. 32" />
                </div>
                <p className="text-[11px] text-stone-500 mt-1.5 flex gap-1.5"><Info className="w-3.5 h-3.5 flex-shrink-0 mt-px" />
                  {fatOut ? 'El % de grasa tiene que estar entre 3 y 70.' : 'Si tienes báscula de bioimpedancia, con el % de grasa el cálculo es más preciso. Si no, déjalo vacío.'}
                </p>
              </div>

              <div>
                <p className={lbl}>Actividad</p>
                <div className="space-y-1.5">
                  {ACTIVITY_LEVELS.map(a => (
                    <button key={a.id} type="button" aria-pressed={activity === a.id} onClick={() => setActivity(a.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-colors ${activity === a.id ? 'bg-emerald-500/10 ring-1 ring-emerald-500/50' : 'bg-[rgba(118,118,128,0.08)]'}`}>
                      <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${activity === a.id ? 'border-emerald-500 bg-emerald-500 shadow-[inset_0_0_0_3px_#fff]' : 'border-stone-300 dark:border-white/30'}`} />
                      <span className="min-w-0"><span className="block text-sm font-semibold text-stone-900 dark:text-white">{a.label}</span><span className="block text-xs text-stone-500">{a.hint}</span></span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className={lbl}>Objetivo</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {ENERGY_GOALS.map(g => (
                    <button key={g.id} type="button" aria-pressed={goal === g.id} onClick={() => setGoal(g.id)}
                      className={`h-10 rounded-xl text-sm font-semibold ${goal === g.id ? 'bg-emerald-500 text-white' : 'bg-[rgba(118,118,128,0.10)] text-stone-700 dark:text-white/80'}`}>{g.label}</button>
                  ))}
                </div>
                {goal !== 'maintain' && (
                  <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[rgba(118,118,128,0.12)] mt-2">
                    {GOAL_PACES.map(p => <button key={p.id} type="button" aria-pressed={pace === p.id} onClick={() => setPace(p.id)} className={seg(pace === p.id)}>{p.label}</button>)}
                  </div>
                )}
              </div>

              {/* Resultado */}
              {result ? (
                <div className="rounded-3xl p-4 text-white" style={{ background: 'radial-gradient(120% 120% at 100% 0%, #10b981 0%, #047857 55%, #022c22 100%)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-100/90">Tu objetivo diario</p>
                  <p className="leading-none mt-1"><span className="text-4xl font-bold tabular-nums">{fmt(result.target)}</span><span className="text-sm font-semibold text-emerald-100/90 ml-1">kcal</span></p>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {([['Proteína', result.macros.protein], ['Hidratos', result.macros.carbs], ['Grasas', result.macros.fats]] as const).map(([l, v]) => (
                      <div key={l} className="rounded-xl bg-white/10 px-2.5 py-2">
                        <p className="text-lg font-bold tabular-nums leading-none">{v}<span className="text-xs font-semibold text-white/75 ml-0.5">g</span></p>
                        <p className="text-[11px] text-white/75 mt-1">{l}</p>
                      </div>
                    ))}
                  </div>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3 text-xs">
                    <div className="flex justify-between"><dt className="text-white/75">Metabolismo basal</dt><dd className="font-semibold tabular-nums">{fmt(result.bmr)} kcal</dd></div>
                    <div className="flex justify-between"><dt className="text-white/75">Gasto diario</dt><dd className="font-semibold tabular-nums">{fmt(result.tdee)} kcal</dd></div>
                    {result.bmi != null && bmiInfo && <div className="flex justify-between"><dt className="text-white/75">IMC</dt><dd className="font-semibold tabular-nums">{result.bmi.toFixed(1)} · {bmiInfo.label}</dd></div>}
                    {result.leanKg != null && <div className="flex justify-between"><dt className="text-white/75">Masa magra</dt><dd className="font-semibold tabular-nums">{result.leanKg} kg</dd></div>}
                    {result.ffmi != null && <div className="flex justify-between"><dt className="text-white/75">Índice de masa magra</dt><dd className="font-semibold tabular-nums">{result.ffmi}</dd></div>}
                    {body.muscleKg != null && body.weightKg > 0 && <div className="flex justify-between"><dt className="text-white/75">Músculo</dt><dd className="font-semibold tabular-nums">{Math.round((body.muscleKg / body.weightKg) * 100)}% del peso</dd></div>}
                  </dl>
                  <p className="text-[11px] text-white/65 mt-3">Fórmula {result.formula}. Es una estimación: revisa tu peso cada 2–3 semanas y ajusta.</p>
                  {result.floored && (
                    <p className="text-[11px] mt-2 flex gap-1.5 bg-black/20 rounded-lg px-2.5 py-1.5"><AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-px" />Lo he subido al mínimo recomendado: comer menos que tu metabolismo basal no es buena idea.</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-stone-500 rounded-2xl bg-[rgba(118,118,128,0.08)] p-4">Escribe tu edad, peso y altura para calcular tus objetivos.</p>
              )}
            </>
          ) : (
            <>
              <div className="rounded-2xl bg-[rgba(118,118,128,0.06)] px-3.5 py-1 divide-y divide-black/5 dark:divide-white/10">
                <MacroStepper id="goal-kcal" label="Calorías" color={MACRO_COLORS.kcal} value={manual.kcal} step={50} unit="kcal" onChange={v => setManual(m => ({ ...m, kcal: v }))} />
                <MacroStepper id="goal-protein" label="Proteína" color={MACRO_COLORS.protein} value={manual.protein} step={5} unit="g" sub={`${pct(manual.protein, 4)}% · ${manual.protein * 4} kcal`} onChange={v => setManual(m => ({ ...m, protein: v }))} />
                <MacroStepper id="goal-carbs" label="Hidratos" color={MACRO_COLORS.carbs} value={manual.carbs} step={5} unit="g" sub={`${pct(manual.carbs, 4)}% · ${manual.carbs * 4} kcal`} onChange={v => setManual(m => ({ ...m, carbs: v }))} />
                <MacroStepper id="goal-fats" label="Grasas" color={MACRO_COLORS.fats} value={manual.fats} step={5} unit="g" sub={`${pct(manual.fats, 9)}% · ${manual.fats * 9} kcal`} onChange={v => setManual(m => ({ ...m, fats: v }))} />
              </div>
              <div className={`rounded-2xl p-3.5 ${Math.abs(diff) <= 50 ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
                <p className="text-sm text-stone-800 dark:text-white">
                  Los macros suman <b className="tabular-nums">{fmt(macroKcal)} kcal</b>
                  {Math.abs(diff) <= 50 ? ', cuadran con tus calorías.' : <>, {diff > 0 ? 'son' : 'faltan'} <b className="tabular-nums">{fmt(Math.abs(diff))} kcal</b> {diff > 0 ? 'de más.' : 'para llegar.'}</>}
                </p>
                {Math.abs(diff) > 50 && (
                  <div className="flex gap-2 mt-2.5">
                    <button type="button" onClick={() => setManual(m => ({ ...m, carbs: Math.max(0, Math.round((m.kcal - m.protein * 4 - m.fats * 9) / 4)) }))}
                      className="flex-1 h-9 rounded-full bg-white/70 dark:bg-white/10 text-xs font-semibold text-stone-800 dark:text-white">Cuadrar con los hidratos</button>
                    <button type="button" onClick={() => setManual(m => ({ ...m, kcal: m.protein * 4 + m.carbs * 4 + m.fats * 9 }))}
                      className="flex-1 h-9 rounded-full bg-white/70 dark:bg-white/10 text-xs font-semibold text-stone-800 dark:text-white">Usar {fmt(macroKcal)} kcal</button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] flex-shrink-0 border-t border-black/5 dark:border-white/10 flex gap-2">
          {tab === 'calc' ? (
            <>
              <button type="button" disabled={!result} onClick={() => { if (result) { setManual(result.macros); setTab('manual'); } }}
                className="h-12 px-4 rounded-2xl bg-[rgba(118,118,128,0.12)] text-sm font-semibold text-stone-800 dark:text-white disabled:opacity-40">Retocar</button>
              <button type="button" disabled={!result} onClick={() => result && onSave(result.macros, body, saveWeight && weightChanged)}
                className="flex-1 h-12 rounded-2xl bg-emerald-500 text-white font-semibold disabled:opacity-40">Usar {result ? `${fmt(result.target)} kcal` : 'estos objetivos'}</button>
            </>
          ) : (
            <button type="button" disabled={manual.kcal < 800} onClick={() => onSave(manual, result ? body : null, saveWeight && weightChanged)}
              className="flex-1 h-12 rounded-2xl bg-emerald-500 text-white font-semibold disabled:opacity-40">{manual.kcal < 800 ? 'Mínimo 800 kcal' : 'Guardar objetivos'}</button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
