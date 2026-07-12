'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FitKPhilosophyContent } from './FitKPhilosophyContent';

type CoachCard = { card_type: 'first_week' | 'new_week'; week_number: number };

// Tarjeta institucional del Coach, integrada en "Tu semana": solo aparece en
// momentos que de verdad importan (primera semana, nueva semana). Nunca a diario.
export function CoachCardModal({ weekNumber }: { weekNumber: number }) {
  const [pending, setPending] = useState<'first_week' | 'new_week' | null>(null);

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

  return (
    <AnimatePresence>
      {pending && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="glass-modal rounded-2xl p-5 relative border border-emerald-200/50 dark:border-emerald-500/20">
            <button
              onClick={dismiss}
              className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-stone-400" />
            </button>

            <div className="flex items-start gap-3 pr-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>

              <div className="min-w-0">
                {pending === 'first_week' ? (
                  <>
                    <div className="mb-4"><FitKPhilosophyContent /></div>
                    <Button onClick={dismiss} className="w-full py-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-sm font-semibold">
                      Empezar mi primera semana
                    </Button>
                  </>
                ) : (
                  <>
                    <h2 className="text-base font-bold text-stone-900 dark:text-white mb-2">Tu nueva semana ya está lista</h2>
                    <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed mb-4">
                      Seguimos construyendo sobre lo que ya has conseguido.
                    </p>
                    <Button onClick={dismiss} className="w-full py-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-sm font-semibold">
                      Tu Plan
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
