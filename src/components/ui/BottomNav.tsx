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
      className="fixed inset-x-4 rounded-full nav-glass px-1.5 py-2 z-40"
      style={{ bottom: 'max(1.25rem, calc(env(safe-area-inset-bottom) + 0.5rem))' }}
    >
      <div className="max-w-md mx-auto flex justify-around">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          const showDot = id === 'community' && commDot && !isActive;
          return (
            <button
              key={id}
              onClick={() => setScreen(id)}
              className="relative flex flex-col items-center gap-0.5 px-4 py-1 min-w-0"
            >
              {isActive && (
                <motion.div
                  layoutId="navActivePill"
                  className="absolute inset-0 rounded-2xl bg-emerald-500/12 dark:bg-emerald-400/15 ring-1 ring-emerald-500/20"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                />
              )}
              <div className="relative">
                <Icon className={`relative z-10 w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-emerald-500' : 'text-stone-400'}`} />
                {showDot && (
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900 z-20"
                  />
                )}
              </div>
              <span className={`relative z-10 text-[10px] leading-tight truncate transition-colors ${isActive ? 'text-emerald-600 font-semibold' : 'text-stone-400'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}