'use client';

import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { Home, MessageCircle, Apple, Users } from 'lucide-react';
import type { AppScreen } from '@/types/user';

const TABS = [
  { id: 'dashboard' as AppScreen, label: 'Inicio', icon: Home },
  { id: 'chat' as AppScreen, label: 'Coach', icon: MessageCircle },
  { id: 'nutrition' as AppScreen, label: 'Nutrición', icon: Apple },
  { id: 'community' as AppScreen, label: 'Comunidad', icon: Users },
];

const COMM_NOTIF_KEY = 'fitk-comm-notif';

// Cada pantalla monta su propia barra: se recuerda la pestaña anterior para
// que la burbuja se deslice desde ella (solo en horizontal, sin medir el layout).
let lastIndex = -1;

export function BottomNav({ active }: { active: AppScreen }) {
  const { setScreen } = useApp();
  const [commDot, setCommDot] = useState(false);

  useEffect(() => {
    // Show dot if there's a pending notification stored
    setCommDot(localStorage.getItem(COMM_NOTIF_KEY) === 'true');
  }, [active]);

  const index = TABS.findIndex(t => t.id === active);
  const from = lastIndex >= 0 ? lastIndex : index;
  const pillRef = useRef<HTMLDivElement>(null);
  // Deslizamiento con una transición CSS: se fija la posición de partida y,
  // en el mismo fotograma, se manda a la pestaña nueva. Solo se mueve en horizontal.
  useLayoutEffect(() => {
    const el = pillRef.current;
    if (!el || index < 0) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.style.transition = 'none';
    el.style.transform = `translateX(${(reduce ? index : from) * 100}%)`;
    void el.offsetWidth;
    el.style.transition = reduce ? 'none' : 'transform 380ms cubic-bezier(0.3, 1.2, 0.5, 1)';
    el.style.transform = `translateX(${index * 100}%)`;
    lastIndex = index;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return (
    <div
      className="fixed inset-x-4 z-40"
      style={{ bottom: 'max(1.25rem, calc(env(safe-area-inset-bottom) + 0.5rem))' }}
    >
      <nav className="relative max-w-md mx-auto rounded-full nav-glass p-1.5 grid grid-cols-4" aria-label="Navegación principal">
        {index >= 0 && (
          <div
            ref={pillRef}
            aria-hidden
            className="absolute top-1.5 bottom-1.5 left-1.5 rounded-full nav-pill will-change-transform"
            style={{ width: 'calc((100% - 0.75rem) / 4)', transform: `translateX(${from * 100}%)` }}
          />
        )}
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          const showDot = id === 'community' && commDot && !isActive;
          return (
            <button
              key={id}
              onClick={() => setScreen(id)}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex flex-col items-center justify-center gap-0.5 h-[52px] rounded-full min-w-0 active:scale-[0.96] transition-transform"
            >
              <div className="relative z-10">
                <Icon
                  strokeWidth={isActive ? 2.4 : 2}
                  className={`w-[22px] h-[22px] flex-shrink-0 transition-colors ${isActive ? 'text-emerald-700 dark:text-emerald-300' : 'text-[#44403c] dark:text-[#e7e5e4]'}`}
                />
                {showDot && (
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#fff] dark:border-zinc-900"
                  />
                )}
              </div>
              <span className={`relative z-10 text-[10px] leading-none truncate transition-colors ${isActive ? 'text-emerald-700 dark:text-emerald-300 font-semibold' : 'text-[#44403c] dark:text-[#e7e5e4] font-medium'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}