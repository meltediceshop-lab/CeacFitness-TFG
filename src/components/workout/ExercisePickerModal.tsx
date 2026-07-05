'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Search, Plus } from 'lucide-react';
import type { Exercise } from '@/types/user';
import { ExercisePreview } from './ExercisePreview';
import { useScrollLock } from '@/hooks/useScrollLock';

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

const MUSCLE_LABELS: Record<string, string> = {
  chest: 'Pecho', back: 'Espalda', shoulders: 'Hombros',
  legs: 'Piernas', arms: 'Brazos', core: 'Core', none: 'General',
};

export function ExercisePickerModal({
  catalog,
  title,
  onPick,
  onClose,
}: {
  catalog: Exercise[];
  title: string;
  onPick: (exercise: Exercise) => void;
  onClose: () => void;
}) {
  useScrollLock();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return catalog;
    return catalog.filter(e =>
      normalize(e.name).includes(q) || normalize(MUSCLE_LABELS[e.targetMuscle] || '').includes(q)
    );
  }, [catalog, query]);

  return (
    <div className="fixed inset-0 bg-black/60 z-[70] flex items-end justify-center">
      <motion.div
        initial={{ y: 500 }}
        animate={{ y: 0 }}
        exit={{ y: 500 }}
        transition={{ type: 'spring', damping: 30, stiffness: 320 }}
        className="w-full max-w-md bg-white dark:bg-[#141414] rounded-t-3xl flex flex-col"
        style={{ maxHeight: '85vh' }}
      >
        <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mt-3 mb-2 flex-shrink-0" />
        <div className="px-5 pt-2 pb-3 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-stone-900 text-lg">{title}</h2>
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
              placeholder="Buscar ejercicio o músculo..."
              className="flex-1 bg-transparent outline-none text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-8">
          {filtered.length === 0 ? (
            <p className="text-center text-stone-400 text-sm py-10">Sin resultados.</p>
          ) : (
            <div className="space-y-1.5">
              {filtered.map(ex => (
                <button
                  key={ex.id}
                  onClick={() => onPick(ex)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-transparent hover:border-emerald-200 transition-colors text-left"
                >
                  <ExercisePreview name={ex.name} muscle={ex.targetMuscle} className="w-14 h-14 flex-shrink-0" rounded="rounded-lg" animate={false} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-stone-800 dark:text-stone-100 truncate">{ex.name}</p>
                    <p className="text-[11px] text-stone-400">{MUSCLE_LABELS[ex.targetMuscle] || 'General'} · {ex.sets}×{ex.reps[0] ?? ''}</p>
                  </div>
                  <Plus className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}