'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { FitKPhilosophyContent } from './FitKPhilosophyContent';

// Acceso permanente y discreto a la explicación de la filosofía de Fit-K.
// Nunca desaparece ni genera notificaciones: solo queda ahí por si alguien
// quiere volver a leerla.
export function WelcomeGuideAccess() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 text-xs font-medium transition-colors"
      >
        <Sparkles className="w-3 h-3" />
        Tu tabla
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-end justify-center z-[70]"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="glass-modal w-full max-w-md rounded-t-3xl p-6 pb-8"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-stone-300 dark:bg-white/20 rounded-full mx-auto mb-5" />

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <FitKPhilosophyContent />
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-white/10 transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4 text-stone-400" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
