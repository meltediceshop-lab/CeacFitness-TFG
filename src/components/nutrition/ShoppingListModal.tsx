'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Check, ShoppingCart } from 'lucide-react';
import type { NutritionPlan } from '@/types/user';
import { useScrollLock } from '@/hooks/useScrollLock';

const STORAGE_KEY = 'fitmente-shopping-checked';

export function ShoppingListModal({ plan, onClose }: { plan: NutritionPlan; onClose: () => void }) {
  // Reúne y deduplica los alimentos de ejemplo del plan
  const items = useMemo(() => {
    const all = plan.meals.flatMap(m => m.examples || []);
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const raw of all) {
      const key = raw.trim().toLowerCase();
      if (key && !seen.has(key)) { seen.add(key); unique.push(raw.trim()); }
    }
    return unique;
  }, [plan]);

  useScrollLock();

  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setChecked(new Set(JSON.parse(saved))); } catch { /* ignore */ }
    }
  }, []);

  function toggle(item: string) {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item); else next.add(item);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }

  const doneCount = items.filter(i => checked.has(i)).length;

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-end justify-center">
      <motion.div
        initial={{ y: 500 }}
        animate={{ y: 0 }}
        exit={{ y: 500 }}
        transition={{ type: 'spring', damping: 30, stiffness: 320 }}
        className="w-full max-w-md bg-white dark:bg-[#141414] rounded-t-3xl flex flex-col"
        style={{ maxHeight: '85vh' }}
      >
        <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mt-3 mb-2 flex-shrink-0" />
        <div className="px-5 pt-2 pb-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-bold text-stone-900 text-base">Lista de la compra</h2>
              <p className="text-xs text-stone-400">{doneCount}/{items.length} en el carro</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 transition-colors">
            <X className="w-4 h-4 text-stone-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-8">
          {items.length === 0 ? (
            <p className="text-center text-stone-400 text-sm py-10">Tu plan no tiene alimentos de ejemplo todavía.</p>
          ) : (
            <div className="space-y-1.5">
              {items.map(item => {
                const isChecked = checked.has(item);
                return (
                  <button
                    key={item}
                    onClick={() => toggle(item)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
                      isChecked
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                        : 'bg-stone-50 dark:bg-stone-800/60 border-transparent hover:border-stone-200'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                      isChecked ? 'border-emerald-500 bg-emerald-500' : 'border-stone-300 dark:border-stone-600'
                    }`}>
                      {isChecked && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-sm ${isChecked ? 'text-stone-400 line-through' : 'text-stone-700 dark:text-stone-200'}`}>
                      {item}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}