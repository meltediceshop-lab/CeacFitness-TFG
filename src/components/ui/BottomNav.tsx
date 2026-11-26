'use client';

import { useState, useEffect } from 'react';
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

export function BottomNav({ active }: { active: AppScreen }) {
  const { setScreen } = useApp();
  const [commDot, setCommDot] = useState(false);

  useEffect(() => {
    // Show dot if there's a pending notification stored
    setCommDot(localStorage.getItem(COMM_NOTIF_KEY) === 'true');
  }, [active]);

  return (
    <div
      className="fixed inset-x-4 z-40"
      style={{ bottom: 'max(1.25rem, calc(env(safe-area-inset-bottom) + 0.5rem))' }}
    >
      <nav className="max-w-md mx-auto rounded-full nav-glass p-1.5 grid grid-cols-4 gap-1" aria-label="Navegación principal">
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
              {isActive && (
                <motion.div
                  layoutId="navActivePill"
                  className="absolute inset-0 rounded-full nav-pill"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <div className="relative z-10">
                <Icon
                  strokeWidth={isActive ? 2.4 : 2}
                  className={`w-[22px] h-[22px] flex-shrink-0 transition-colors ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-500 dark:text-white/55'}`}
                />
                {showDot && (
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#fff] dark:border-zinc-900"
                  />
                )}
              </div>
              <span className={`relative z-10 text-[10px] leading-none truncate transition-colors ${isActive ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-stone-500 dark:text-white/55 font-medium'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}