'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Loader2, Plus, Minus, ChevronLeft } from 'lucide-react';
import { macrosForQuantity, type FoodItem } from '@/lib/foodDatabase';
import { MEAL_SLOTS, MACRO_COLORS } from '@/lib/nutritionUtils';
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

export function FoodSearchModal({
  defaultSlot,
  onClose,
  onAdd,
}: {
  defaultSlot: MealSlot;
  onClose: () => void;
  onAdd: (log: NewFoodLog) => void;
}) {
  useScrollLock();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [grams, setGrams] = useState(100);
  const [slot, setSlot] = useState<MealSlot>(defaultSlot);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  function pickFood(f: FoodItem) {
    setSelected(f);
    setGrams(f.portionG || 100);
  }

  function confirmAdd() {
    if (!selected) return;
    const m = macrosForQuantity(selected, grams);
    onAdd({ mealSlot: slot, foodName: selected.name, quantityG: grams, ...m });
  }

  const preview = selected ? macrosForQuantity(selected, grams) : null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-end justify-center">
      <motion.div
        initial={{ y: 500 }}
        animate={{ y: 0 }}
        exit={{ y: 500 }}
        transition={{ type: 'spring', damping: 30, stiffness: 320 }}
        className="w-full max-w-md bg-white dark:bg-[#141414] rounded-t-3xl flex flex-col"
        style={{ maxHeight: '88vh' }}
      >
        <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mt-3 mb-2 flex-shrink-0" />

        {!selected ? (
          <>
            {/* Search header */}
            <div className="px-5 pt-2 pb-3 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-stone-900 text-lg">Añadir alimento</h2>
                <button onClick={onClose} className="p-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 transition-colors">
                  <X className="w-4 h-4 text-stone-600" />
                </button>
              </div>
              <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 rounded-xl px-3 py-2.5">
                <Search className="w-4 h-4 text-stone-400 flex-shrink-0" />
                <input
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Busca: pollo, arroz, plátano..."
                  className="flex-1 bg-transparent outline-none text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400"
                />
                {loading && <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />}
              </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto px-5 pb-8">
              {query.trim().length < 2 ? (
                <p className="text-center text-stone-400 text-sm py-10">Escribe al menos 2 letras para buscar.</p>
              ) : results.length === 0 && !loading ? (
                <p className="text-center text-stone-400 text-sm py-10">Sin resultados. Prueba con otro término.</p>
              ) : (
                <div className="space-y-1.5">
                  {results.map(f => (
                    <button
                      key={f.id}
                      onClick={() => pickFood(f)}
                      className="w-full flex items-center justify-between gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-transparent hover:border-emerald-200 transition-colors text-left"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-stone-800 dark:text-stone-100 truncate">{f.name}</p>
                        <p className="text-[11px] text-stone-400">
                          {f.source === 'off' ? 'Open Food Facts' : f.category} · {f.kcal} kcal/100g
                        </p>
                      </div>
                      <Plus className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Quantity step */
          <div className="flex flex-col overflow-y-auto px-5 pb-8">
            <div className="flex items-center gap-2 pt-1 pb-3">
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 transition-colors">
                <ChevronLeft className="w-4 h-4 text-stone-600" />
              </button>
              <h2 className="font-bold text-stone-900 text-base flex-1 truncate">{selected.name}</h2>
            </div>

            {/* Quantity control */}
            <div className="flex items-center justify-center gap-4 my-3">
              <button onClick={() => setGrams(g => Math.max(5, g - 10))} className="w-11 h-11 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center hover:bg-stone-200 transition-colors">
                <Minus className="w-5 h-5 text-stone-600" />
              </button>
              <div className="text-center">
                <input
                  type="number"
                  value={grams}
                  onChange={e => setGrams(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-20 text-center text-3xl font-bold text-stone-900 bg-transparent outline-none"
                />
                <p className="text-xs text-stone-400">gramos</p>
              </div>
              <button onClick={() => setGrams(g => g + 10)} className="w-11 h-11 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center hover:bg-stone-200 transition-colors">
                <Plus className="w-5 h-5 text-stone-600" />
              </button>
            </div>

            {/* Quick portions */}
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {selected.portionG && (
                <button onClick={() => setGrams(selected.portionG!)} className="text-xs px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  1 ración{selected.portionLabel ? ` (${selected.portionLabel})` : ''} · {selected.portionG}g
                </button>
              )}
              {[50, 100, 150, 200].map(g => (
                <button key={g} onClick={() => setGrams(g)} className="text-xs px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                  {g}g
                </button>
              ))}
            </div>

            {/* Macro preview */}
            {preview && (
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { label: 'kcal', value: preview.kcal, color: MACRO_COLORS.kcal },
                  { label: 'Prot', value: `${preview.protein}g`, color: MACRO_COLORS.protein },
                  { label: 'Carb', value: `${preview.carbs}g`, color: MACRO_COLORS.carbs },
                  { label: 'Gras', value: `${preview.fats}g`, color: MACRO_COLORS.fats },
                ].map(m => (
                  <div key={m.label} className="rounded-xl bg-stone-50 dark:bg-stone-800/60 p-2.5 text-center">
                    <p className="text-base font-bold" style={{ color: m.color }}>{m.value}</p>
                    <p className="text-[10px] text-stone-400">{m.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Meal slot selector */}
            <p className="text-xs text-stone-500 mb-2">¿En qué comida?</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {MEAL_SLOTS.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSlot(s.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    slot === s.id
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300'
                  }`}
                >
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>

            <button
              onClick={confirmAdd}
              className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors"
            >
              Añadir al registro
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}