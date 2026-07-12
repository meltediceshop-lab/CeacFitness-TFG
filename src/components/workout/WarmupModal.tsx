'use client';

import { motion } from 'framer-motion';
import { X, Flame } from 'lucide-react';
import { ExercisePreview } from '@/components/workout/ExercisePreview';
import { WARMUP_EXERCISES } from '@/lib/warmupExercises';

export function WarmupModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="glass-modal rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-6 pt-6 pb-4">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center flex-shrink-0">
            <Flame className="w-5 h-5 text-orange-500" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-stone-900 dark:text-white">Calentamiento</h2>
            <p className="text-stone-400 text-xs">5 minutos antes de empezar</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-stone-100 dark:bg-white/10 hover:bg-stone-200 transition-colors flex-shrink-0">
            <X className="w-5 h-5 text-stone-600 dark:text-white/70" />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-3">
          {WARMUP_EXERCISES.map((step, i) => (
            <div key={step.name} className="flex items-center gap-3 glass-card rounded-2xl p-3">
              <div className="relative flex-shrink-0">
                <ExercisePreview name={step.name} muscle={step.targetMuscle} className="w-16 h-16" rounded="rounded-xl" />
                <span className="absolute -top-1.5 -left-1.5 w-6 h-6 bg-orange-500 text-white text-xs font-bold rounded-lg flex items-center justify-center shadow">
                  {i + 1}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-stone-900 dark:text-white text-sm">{step.name}</p>
                <p className="text-orange-600 dark:text-orange-400 text-xs font-medium mb-1">{step.duration}</p>
                <p className="text-stone-500 text-xs leading-snug">{step.instructions}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
