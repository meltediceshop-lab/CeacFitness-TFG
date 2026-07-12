'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

type CoachCard = { card_type: 'first_week' | 'new_week'; week_number: number };

// Tarjetas institucionales del Coach: solo aparecen en momentos que de verdad
// importan (primera semana, nueva semana). Nunca a diario.
export function CoachCardModal({ weekNumber }: { weekNumber: number }) {
  const [pending, setPending] = useState<'first_week' | 'new_week' | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const res = await fetch('/api/coach-cards');
        const { data } = await res.json() as { data: CoachCard[] };
        if (cancelled) return;

        const cardType: 'first_week' | 'new_week' = weekNumber === 1 ? 'first_week' : 'new_week';
        const alreadyShown = (data || []).some(c => c.card_type === cardType && c.week_number === weekNumber);
        setPending(alreadyShown ? null : cardType);
      } catch {
        /* si falla la comprobación, no molestamos con la tarjeta */
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }
    check();
    return () => { cancelled = true; };
  }, [weekNumber]);

  async function dismiss() {
    const cardType = pending;
    setPending(null);
    if (!cardType) return;
    try {
      await fetch('/api/coach-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardType, weekNumber }),
      });
    } catch { /* ignore */ }
  }

  if (!loaded || !pending) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-5 z-[70]"
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          className="glass-modal rounded-3xl w-full max-w-sm p-7 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-200">
            <Sparkles className="w-7 h-7 text-white" />
          </div>

          {pending === 'first_week' ? (
            <>
              <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-3">Tu primera semana ya está lista</h2>
              <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed mb-2">
                Esta es tu propuesta para empezar.
              </p>
              <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed mb-4">
                No buscamos el plan perfecto desde el primer día. Preferimos comenzar con algo sencillo e ir adaptándolo contigo conforme entrenes y nos vayamos conociendo.
              </p>
              <p className="text-stone-700 dark:text-stone-200 text-sm font-medium mb-6">
                Lo importante ahora no es hacerlo perfecto.<br />Es empezar.
              </p>
              <Button onClick={dismiss} className="w-full py-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-base font-semibold shadow-lg shadow-emerald-200">
                Empezar mi primera semana
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-3">Tu nueva semana ya está lista</h2>
              <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed mb-6">
                Seguimos construyendo sobre lo que ya has conseguido.
              </p>
              <Button onClick={dismiss} className="w-full py-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-base font-semibold shadow-lg shadow-emerald-200">
                Empezar semana
              </Button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
