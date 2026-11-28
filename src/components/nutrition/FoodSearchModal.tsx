'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Loader2, Plus, Minus, ChevronLeft, Pencil, Trash2, ScanLine, Zap, Star } from 'lucide-react';
import { macrosForQuantity, type FoodItem, type NutritionLabel } from '@/lib/foodDatabase';
import { MEAL_SLOTS, MACRO_COLORS } from '@/lib/nutritionUtils';
import { labelPer100, loadCustomFoods, saveCustomFoods } from '@/lib/customFoods';
import type { MealSlot } from '@/types/user';
import { useScrollLock } from '@/hooks/useScrollLock';

export interface NewFoodLog {
  mealSlot: MealSlot;
  foodName: string;
  quantityG: number;
  kcal: number;
  protein: number;
  carbs: number;
  fats: number;
}

type View = 'search' | 'quantity' | 'create' | 'quick';

const field = 'w-full h-11 rounded-xl bg-[rgba(118,118,128,0.10)] px-3 text-[15px] text-stone-900 dark:text-white placeholder:text-stone-400 outline-none focus:ring-4 focus:ring-emerald-500/15';
const lbl = 'text-[11px] font-semibold uppercase tracking-wide text-stone-500 mb-1.5';
const seg = (on: boolean) => `h-9 rounded-lg text-[13px] font-semibold ${on ? 'bg-[#fff] dark:bg-[#48484a] text-stone-900 dark:text-white shadow-sm' : 'text-stone-500'}`;
const n = (s: string): number | undefined => { const v = Number(s.replace(',', '.')); return s.trim() === '' || !Number.isFinite(v) || v < 0 ? undefined : v; };
const s1 = (v?: number) => (v == null ? '' : String(v));
const round1 = (v: number) => Math.round(v * 10) / 10;
const round2 = (v: number) => Math.round(v * 100) / 100;

// Filas de la etiqueta, en el orden en que aparecen en los envases.
const LABEL_ROWS: { key: keyof NutritionLabel; label: string; unit: string; sub?: boolean; required?: boolean }[] = [
  { key: 'kcal', label: 'Valor energético', unit: 'kcal', required: true },
  { key: 'fats', label: 'Grasas', unit: 'g', required: true },
  { key: 'saturated', label: 'de las cuales saturadas', unit: 'g', sub: true },
  { key: 'carbs', label: 'Hidratos de carbono', unit: 'g', required: true },
  { key: 'sugars', label: 'de los cuales azúcares', unit: 'g', sub: true },
  { key: 'fiber', label: 'Fibra alimentaria', unit: 'g' },
  { key: 'protein', label: 'Proteínas', unit: 'g', required: true },
  { key: 'salt', label: 'Sal', unit: 'g' },
];

/** Tabla de la etiqueta escalada a los gramos elegidos. */
function LabelTable({ label, grams }: { label: NutritionLabel; grams: number }) {
  const f = grams / 100;
  return (
    <div className="rounded-2xl bg-[rgba(118,118,128,0.06)] px-3.5 py-2 mb-4">
      <div className="flex justify-between text-[11px] font-semibold uppercase tracking-wide text-stone-500 py-1"><span>Información nutricional</span><span>{grams} g</span></div>
      {LABEL_ROWS.filter(r => label[r.key] != null).map(r => (
        <div key={r.key} className={`flex justify-between py-1 text-sm border-t border-black/5 dark:border-white/10 ${r.sub ? 'pl-3 text-stone-500' : 'text-stone-800 dark:text-white'}`}>
          <span>{r.label}</span>
          <span className="tabular-nums font-semibold">{r.key === 'kcal' ? Math.round((label.kcal ?? 0) * f) : r.key === 'salt' ? round2((label.salt ?? 0) * f) : round1((label[r.key] ?? 0) * f)} {r.unit}</span>
        </div>
      ))}
    </div>
  );
}

export function FoodSearchModal({
  uid,
  defaultSlot,
  onClose,
  onAdd,
}: {
  uid: string;
  defaultSlot: MealSlot;
  onClose: () => void;
  onAdd: (log: NewFoodLog) => void;
}) {
  useScrollLock();

  const [view, setView] = useState<View>('search');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [grams, setGrams] = useState(100);
  const [slot, setSlot] = useState<MealSlot>(defaultSlot);
  const [mine, setMine] = useState<FoodItem[]>([]);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Formulario de alimento propio (crear o editar)
  const [editId, setEditId] = useState<string | null>(null);
  const [fName, setFName] = useState('');
  const [fBrand, setFBrand] = useState('');
  const [per, setPer] = useState<'100g' | 'portion'>('100g');
  const [portionG, setPortionG] = useState('');
  const [portionLabel, setPortionLabel] = useState('');
  const [vals, setVals] = useState<Record<keyof NutritionLabel, string>>({ kcal: '', fats: '', saturated: '', carbs: '', sugars: '', fiber: '', protein: '', salt: '' });
  const [formError, setFormError] = useState<string | null>(null);

  // Registro rápido (sin guardar el alimento)
  const [quick, setQuick] = useState({ name: '', kcal: '', protein: '', carbs: '', fats: '' });

  useEffect(() => { setMine(loadCustomFoods(uid)); }, [uid]);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/nutrition/foods?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setResults(data.data || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const norm = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const mineMatches = useMemo(() => {
    const q = norm(query.trim());
    return q.length < 1 ? mine : mine.filter(f => norm(`${f.name} ${f.brand ?? ''}`).includes(q));
  }, [mine, query]);

  function pickFood(f: FoodItem) {
    setSelected(f);
    setGrams(f.portionG || 100);
    setView('quantity');
  }

  function confirmAdd() {
    if (!selected) return;
    const m = macrosForQuantity(selected, grams);
    onAdd({ mealSlot: slot, foodName: selected.brand ? `${selected.name} (${selected.brand})` : selected.name, quantityG: grams, ...m });
  }

  function openCreate(food?: FoodItem) {
    setFormError(null);
    if (food) {
      const l = food.label ?? { kcal: food.kcal, protein: food.protein, carbs: food.carbs, fats: food.fats };
      setEditId(food.id); setFName(food.name); setFBrand(food.brand ?? ''); setPer('100g');
      setPortionG(s1(food.portionG)); setPortionLabel(food.portionLabel ?? '');
      setVals({ kcal: s1(l.kcal), fats: s1(l.fats), saturated: s1(l.saturated), carbs: s1(l.carbs), sugars: s1(l.sugars), fiber: s1(l.fiber), protein: s1(l.protein), salt: s1(l.salt) });
    } else {
      setEditId(null); setFName(query.trim()); setFBrand(''); setPer('100g'); setPortionG(''); setPortionLabel('');
      setVals({ kcal: '', fats: '', saturated: '', carbs: '', sugars: '', fiber: '', protein: '', salt: '' });
    }
    setView('create');
  }

  const kcalCheck = (() => {
    const k = n(vals.kcal), p = n(vals.protein) ?? 0, c = n(vals.carbs) ?? 0, f = n(vals.fats) ?? 0, fib = n(vals.fiber) ?? 0;
    if (k == null) return null;
    const est = p * 4 + c * 4 + f * 9 + fib * 2;
    return est > 0 && Math.abs(est - k) > Math.max(40, k * 0.25) ? Math.round(est) : null;
  })();

  function saveFood() {
    const name = fName.trim();
    const pg = n(portionG);
    const required = { kcal: n(vals.kcal), fats: n(vals.fats), carbs: n(vals.carbs), protein: n(vals.protein) };
    if (!name) { setFormError('Ponle un nombre al alimento.'); return; }
    if (required.kcal == null) { setFormError('Escribe el valor energético (kcal) de la etiqueta.'); return; }
    if (per === 'portion' && !(pg && pg > 0)) { setFormError('Indica cuántos gramos tiene la ración.'); return; }
    const raw: NutritionLabel = {
      kcal: required.kcal, fats: required.fats ?? 0, carbs: required.carbs ?? 0, protein: required.protein ?? 0,
      saturated: n(vals.saturated), sugars: n(vals.sugars), fiber: n(vals.fiber), salt: n(vals.salt),
    };
    const label = labelPer100(raw, per, pg);
    const food: FoodItem = {
      id: editId ?? `custom-${Date.now().toString(36)}`,
      name, brand: fBrand.trim() || undefined, category: 'Mis alimentos', source: 'custom',
      kcal: label.kcal, protein: label.protein, carbs: label.carbs, fats: label.fats, label,
      portionG: pg && pg > 0 ? pg : undefined, portionLabel: portionLabel.trim() || undefined,
    };
    const next = editId ? mine.map(f => (f.id === editId ? food : f)) : [food, ...mine];
    setMine(next); saveCustomFoods(uid, next);
    pickFood(food);
  }

  function deleteFood(id: string) {
    const next = mine.filter(f => f.id !== id);
    setMine(next); saveCustomFoods(uid, next); setConfirmDel(null);
  }

  function addQuick() {
    const kcal = n(quick.kcal);
    if (!quick.name.trim() || kcal == null) return;
    onAdd({ mealSlot: slot, foodName: quick.name.trim(), quantityG: 0, kcal: Math.round(kcal), protein: round1(n(quick.protein) ?? 0), carbs: round1(n(quick.carbs) ?? 0), fats: round1(n(quick.fats) ?? 0) });
  }

  const preview = selected ? macrosForQuantity(selected, grams) : null;

  const SlotPicker = (
    <>
      <p className={lbl}>¿En qué comida?</p>
      <div className="flex flex-wrap gap-2 mb-5">
        {MEAL_SLOTS.map(s => (
          <button key={s.id} type="button" onClick={() => setSlot(s.id)}
            className={`text-xs h-10 px-3.5 rounded-full ${slot === s.id ? 'bg-emerald-500 text-white' : 'bg-[rgba(118,118,128,0.10)] text-stone-600 dark:text-stone-300'}`}>
            {s.emoji} {s.label}
          </button>
        ))}
      </div>
    </>
  );

  const foodRow = (f: FoodItem, own?: boolean) => (
    <div key={f.id} className="flex items-center gap-1 rounded-xl bg-[rgba(118,118,128,0.06)]">
      <button type="button" onClick={() => pickFood(f)} className="flex-1 min-w-0 flex items-center justify-between gap-3 p-3 text-left">
        <span className="min-w-0">
          <span className="block text-sm font-medium text-stone-800 dark:text-stone-100 truncate">{f.name}{f.brand ? <span className="text-stone-400"> · {f.brand}</span> : null}</span>
          <span className="block text-[11px] text-stone-500">
            {own ? 'Mi alimento' : f.source === 'off' ? 'Open Food Facts' : f.category} · {f.kcal} kcal/100 g{f.portionG ? ` · ración ${f.portionG} g` : ''}
          </span>
        </span>
        {!own && <Plus className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
      </button>
      {own && (confirmDel === f.id ? (
        <button type="button" onClick={() => deleteFood(f.id)} className="mr-2 h-8 px-3 rounded-full bg-red-500 text-white text-xs font-semibold">Borrar</button>
      ) : (
        <>
          <button type="button" onClick={() => openCreate(f)} aria-label={`Editar ${f.name}`} className="w-9 h-9 rounded-full flex items-center justify-center text-stone-400"><Pencil className="w-4 h-4" /></button>
          <button type="button" onClick={() => setConfirmDel(f.id)} aria-label={`Borrar ${f.name}`} className="w-9 h-9 mr-1 rounded-full flex items-center justify-center text-stone-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
        </>
      ))}
    </div>
  );

  const header = (title: string, back?: () => void) => (
    <div className="flex items-center gap-2 px-5 pt-1 pb-3 flex-shrink-0">
      {back && (
        <button type="button" onClick={back} aria-label="Volver" className="w-9 h-9 rounded-full bg-[rgba(118,118,128,0.12)] flex items-center justify-center flex-shrink-0">
          <ChevronLeft className="w-5 h-5 text-stone-600 dark:text-white/70" />
        </button>
      )}
      <h2 className="font-bold text-stone-900 dark:text-white text-lg flex-1 truncate">{title}</h2>
      <button type="button" onClick={onClose} aria-label="Cerrar" className="w-9 h-9 rounded-full bg-[rgba(118,118,128,0.12)] flex items-center justify-center flex-shrink-0">
        <X className="w-5 h-5 text-stone-600 dark:text-white/70" />
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-end justify-center" onClick={onClose}>
      <motion.div
        initial={{ y: 500 }} animate={{ y: 0 }} exit={{ y: 500 }}
        transition={{ type: 'spring', damping: 30, stiffness: 320 }}
        className="w-full max-w-md glass-modal rounded-t-3xl flex flex-col"
        style={{ maxHeight: '92dvh' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-stone-300 dark:bg-white/20 rounded-full mx-auto mt-3 mb-2 flex-shrink-0" />

        {view === 'search' && (
          <>
            {header('Añadir alimento')}
            <div className="px-5 pb-3 flex-shrink-0 space-y-2.5">
              <div className="flex items-center gap-2 bg-[rgba(118,118,128,0.12)] rounded-xl px-3 h-11">
                <Search className="w-4 h-4 text-stone-400 flex-shrink-0" />
                <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Busca: pollo, arroz, plátano…"
                  className="bare-input flex-1 bg-transparent outline-none text-[15px] text-stone-800 dark:text-stone-100 placeholder-stone-400" />
                {loading && <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => openCreate()} className="h-10 rounded-full bg-emerald-500 text-white text-sm font-semibold flex items-center justify-center gap-1.5">
                  <ScanLine className="w-4 h-4" /> Crear con su etiqueta
                </button>
                <button type="button" onClick={() => { setQuick(q => ({ ...q, name: query.trim() })); setView('quick'); }} className="h-10 rounded-full bg-[rgba(118,118,128,0.12)] text-sm font-semibold text-stone-800 dark:text-white flex items-center justify-center gap-1.5">
                  <Zap className="w-4 h-4" /> Registro rápido
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-4">
              {mineMatches.length > 0 && (
                <div>
                  <p className={`${lbl} flex items-center gap-1`}><Star className="w-3 h-3" /> Mis alimentos</p>
                  <div className="space-y-1.5">{mineMatches.map(f => foodRow(f, true))}</div>
                </div>
              )}
              {query.trim().length < 2 ? (
                mine.length === 0 && <p className="text-center text-stone-500 text-sm py-8">Escribe al menos 2 letras para buscar, o crea un alimento con la información nutricional de su envase.</p>
              ) : (
                <div>
                  {(results.length > 0 || loading) && <p className={lbl}>Base de datos</p>}
                  {results.length === 0 && !loading ? (
                    <div className="text-center py-6">
                      <p className="text-stone-500 text-sm mb-3">No encuentro «{query.trim()}».</p>
                      <button type="button" onClick={() => openCreate()} className="h-10 px-4 rounded-full bg-[rgba(118,118,128,0.12)] text-stone-800 dark:text-white text-sm font-semibold">Crearlo con su etiqueta</button>
                    </div>
                  ) : (
                    <div className="space-y-1.5">{results.map(f => foodRow(f))}</div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {view === 'quantity' && selected && (
          <>
            {header(selected.name, () => setView('search'))}
            <div className="flex flex-col overflow-y-auto px-5 pb-8">
              <div className="flex items-center justify-center gap-4 my-2">
                <button type="button" aria-label="Menos cantidad" onClick={() => setGrams(g => Math.max(5, g - 10))} className="w-11 h-11 rounded-full bg-[rgba(118,118,128,0.12)] flex items-center justify-center">
                  <Minus className="w-5 h-5 text-stone-600 dark:text-white/70" />
                </button>
                <div className="text-center">
                  <input type="number" inputMode="numeric" aria-label="Gramos" value={grams} onChange={e => setGrams(Math.max(0, parseInt(e.target.value) || 0))}
                    className="bare-input w-24 text-center text-3xl font-bold text-stone-900 dark:text-white bg-transparent outline-none tabular-nums" />
                  <p className="text-xs text-stone-400">gramos</p>
                </div>
                <button type="button" aria-label="Más cantidad" onClick={() => setGrams(g => g + 10)} className="w-11 h-11 rounded-full bg-[rgba(118,118,128,0.12)] flex items-center justify-center">
                  <Plus className="w-5 h-5 text-stone-600 dark:text-white/70" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {selected.portionG && (
                  <>
                    {[0.5, 1, 2].map(m => (
                      <button key={m} type="button" onClick={() => setGrams(Math.round(selected.portionG! * m))} className="text-xs h-10 px-3.5 rounded-full bg-[rgba(118,118,128,0.10)] text-stone-600 dark:text-stone-300">
                        {selected.portionLabel ? `${m === 0.5 ? '½' : m} × ${selected.portionLabel}` : `${m === 0.5 ? '½' : m} ${m === 1 ? 'ración' : 'raciones'}`} · {Math.round(selected.portionG! * m)} g
                      </button>
                    ))}
                  </>
                )}
                {[50, 100, 150, 200].map(g => (
                  <button key={g} type="button" onClick={() => setGrams(g)} className="text-xs h-10 px-3.5 rounded-full bg-[rgba(118,118,128,0.10)] text-stone-600 dark:text-stone-300">{g} g</button>
                ))}
              </div>

              {preview && (
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[
                    { label: 'kcal', value: preview.kcal, color: MACRO_COLORS.kcal },
                    { label: 'Prot', value: `${preview.protein}g`, color: MACRO_COLORS.protein },
                    { label: 'Carb', value: `${preview.carbs}g`, color: MACRO_COLORS.carbs },
                    { label: 'Gras', value: `${preview.fats}g`, color: MACRO_COLORS.fats },
                  ].map(m => (
                    <div key={m.label} className="rounded-xl bg-[rgba(118,118,128,0.08)] p-2.5 text-center">
                      <p className="text-base font-bold tabular-nums" style={{ color: m.color }}>{m.value}</p>
                      <p className="text-[10px] text-stone-500">{m.label}</p>
                    </div>
                  ))}
                </div>
              )}
              {selected.label && <LabelTable label={selected.label} grams={grams} />}

              {SlotPicker}
              <button type="button" onClick={confirmAdd} disabled={grams <= 0} className="w-full h-12 rounded-full bg-emerald-500 text-white font-semibold disabled:opacity-40">Añadir al registro</button>
            </div>
          </>
        )}

        {view === 'create' && (
          <>
            {header(editId ? 'Editar alimento' : 'Nuevo alimento', () => setView('search'))}
            <div className="overflow-y-auto px-5 pb-8 space-y-4">
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <label className="block min-w-0"><span className="block text-[11px] text-stone-500 mb-1">Nombre</span>
                  <input id="food-name" value={fName} maxLength={60} onChange={e => setFName(e.target.value)} placeholder="Ej. Yogur proteico" className={field} />
                </label>
                <label className="block w-32"><span className="block text-[11px] text-stone-500 mb-1">Marca</span>
                  <input id="food-brand" value={fBrand} maxLength={30} onChange={e => setFBrand(e.target.value)} placeholder="Opcional" className={field} />
                </label>
              </div>

              <div>
                <p className={lbl}>Los valores de la etiqueta son</p>
                <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[rgba(118,118,128,0.12)]">
                  <button type="button" aria-pressed={per === '100g'} onClick={() => setPer('100g')} className={seg(per === '100g')}>Por 100 g</button>
                  <button type="button" aria-pressed={per === 'portion'} onClick={() => setPer('portion')} className={seg(per === 'portion')}>Por ración</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="block"><span className="block text-[11px] text-stone-500 mb-1">Ración{per === 'portion' ? '' : ' (opcional)'}</span>
                  <span className="relative block"><input id="food-portion" inputMode="decimal" value={portionG} onChange={e => setPortionG(e.target.value.replace(/[^\d.,]/g, ''))} placeholder="Ej. 125" className={`${field} pr-8`} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">g</span></span>
                </label>
                <label className="block"><span className="block text-[11px] text-stone-500 mb-1">Nombre de la ración</span>
                  <input id="food-portion-label" value={portionLabel} maxLength={24} onChange={e => setPortionLabel(e.target.value)} placeholder="Ej. 1 yogur" className={field} />
                </label>
              </div>

              {/* Etiqueta, como en el envase */}
              <div className="rounded-2xl border-2 border-stone-800/80 dark:border-white/60 px-3.5 py-2.5">
                <div className="flex justify-between items-baseline pb-1.5 border-b-4 border-stone-800/80 dark:border-white/60">
                  <p className="font-black text-stone-900 dark:text-white">Información nutricional</p>
                  <p className="text-xs font-semibold text-stone-500">{per === '100g' ? 'por 100 g' : `por ración${n(portionG) ? ` (${portionG} g)` : ''}`}</p>
                </div>
                {LABEL_ROWS.map(r => (
                  <label key={r.key} className={`flex items-center gap-2 py-1.5 border-b border-stone-300/70 dark:border-white/15 last:border-b-0 ${r.sub ? 'pl-4' : ''}`}>
                    <span className={`flex-1 text-sm ${r.sub ? 'text-stone-500' : 'font-semibold text-stone-800 dark:text-white'}`}>{r.label}{r.required ? '' : ''}</span>
                    {r.key === 'kcal' && n(vals.kcal) != null && <span className="text-[11px] text-stone-400 tabular-nums">{Math.round(n(vals.kcal)! * 4.184)} kJ</span>}
                    <span className="relative w-24">
                      <input id={`food-${r.key}`} inputMode="decimal" aria-label={r.label} value={vals[r.key]} placeholder={r.required ? '0' : '—'}
                        onChange={e => setVals(v => ({ ...v, [r.key]: e.target.value.replace(/[^\d.,]/g, '') }))}
                        className="w-full h-9 rounded-lg bg-[rgba(118,118,128,0.10)] pl-2 pr-9 text-right text-sm font-semibold text-stone-900 dark:text-white outline-none focus:ring-4 focus:ring-emerald-500/15 tabular-nums" />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-stone-400">{r.unit}</span>
                    </span>
                  </label>
                ))}
              </div>
              {kcalCheck != null && (
                <p className="text-xs text-amber-700 dark:text-amber-400 -mt-1">Ojo: con esos macros saldrían unas {kcalCheck} kcal. Revisa que has copiado bien la etiqueta.</p>
              )}
              {formError && <p className="text-sm text-red-500">{formError}</p>}
              <button type="button" onClick={saveFood} className="w-full h-12 rounded-full bg-emerald-500 text-white font-semibold">{editId ? 'Guardar cambios' : 'Guardar y añadir'}</button>
            </div>
          </>
        )}

        {view === 'quick' && (
          <>
            {header('Registro rápido', () => setView('search'))}
            <div className="overflow-y-auto px-5 pb-8 space-y-4">
              <p className="text-sm text-stone-500 -mt-1">Para algo puntual (una comida fuera, un plato casero). No se guarda en «Mis alimentos».</p>
              <label className="block"><span className="block text-[11px] text-stone-500 mb-1">Qué has comido</span>
                <input id="quick-name" value={quick.name} maxLength={60} onChange={e => setQuick(q => ({ ...q, name: e.target.value }))} placeholder="Ej. Menú del día" className={field} />
              </label>
              <div className="grid grid-cols-2 gap-2">
                {([['kcal', 'Calorías', 'kcal'], ['protein', 'Proteína', 'g'], ['carbs', 'Hidratos', 'g'], ['fats', 'Grasas', 'g']] as const).map(([k, l, u]) => (
                  <label key={k} className="block"><span className="block text-[11px] text-stone-500 mb-1">{l}</span>
                    <span className="relative block"><input id={`quick-${k}`} inputMode="decimal" value={quick[k]} placeholder={k === 'kcal' ? 'Obligatorio' : '0'} onChange={e => setQuick(q => ({ ...q, [k]: e.target.value.replace(/[^\d.,]/g, '') }))} className={`${field} pr-10`} />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">{u}</span></span>
                  </label>
                ))}
              </div>
              {SlotPicker}
              <button type="button" onClick={addQuick} disabled={!quick.name.trim() || n(quick.kcal) == null} className="w-full h-12 rounded-full bg-emerald-500 text-white font-semibold disabled:opacity-40">Añadir al registro</button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
