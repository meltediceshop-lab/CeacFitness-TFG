'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { ClipboardCheck, ChevronRight } from 'lucide-react';

// Invitación a la revisión periódica (cada ~4-6 semanas). Discreta:
// solo aparece cuando toca, y desaparece al completar la revisión.
export function ReviewBanner() {
  const { setScreen } = useApp();
  const [due, setDue] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/review')
      .then(res => res.json())
      .then(data => { if (!cancelled) setDue(!!data.due); })
      .catch(() => { /* si falla, no molestamos */ });
    return () => { cancelled = true; };
  }, []);

  if (!due) return null;

  return (
    <motion.button
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => setScreen('review')}
      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl glass-modal border border-emerald-200/60 dark:border-emerald-500/20 mb-4 text-left active:scale-[0.98] transition-transform"
    >
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
        <ClipboardCheck className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-stone-900 dark:text-white text-sm">Pequeña revisión de progreso</p>
        <p className="text-stone-500 text-xs">Un par de minutos para comprobar que todo va bien</p>
      </div>
      <ChevronRight className="w-4 h-4 text-stone-400 flex-shrink-0" />
    </motion.button>
  );
}
