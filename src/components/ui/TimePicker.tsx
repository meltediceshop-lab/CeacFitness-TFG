'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Clock } from 'lucide-react';

/**
 * Selector de minutos con efecto vidrio (estilo menú contextual de iOS):
 * una pastilla translúcida que abre un menú flotante con las opciones.
 */
export function TimePicker({
  value,
  options,
  onChange,
  label = 'Tiempo de la sesión',
}: {
  value: number;
  options: number[];
  onChange: (minutes: number) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  // El menú flota fuera de las listas con scroll (portal) junto al botón;
  // si no cabe debajo, se abre hacia arriba.
  const [pos, setPos] = useState<{ right: number; top?: number; bottom?: number }>({ right: 16 });
  const place = () => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const right = Math.max(8, window.innerWidth - r.right);
    setPos(r.bottom + 280 > window.innerHeight ? { right, bottom: window.innerHeight - r.top + 6 } : { right, top: r.bottom + 6 });
  };
  const list = [...new Set([...options, value])].sort((a, b) => a - b);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!ref.current?.contains(t) && !menuRef.current?.contains(t)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', esc); };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${value} min`}
        onClick={() => { place(); setOpen(o => !o); }}
        className="glass-btn h-10 pl-3 pr-2.5 rounded-full flex items-center gap-1.5 text-sm font-semibold text-stone-800 dark:text-white tabular-nums"
      >
        <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        {value} min
        <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {typeof document !== 'undefined' && createPortal(
      <AnimatePresence>
        {open && (
          <motion.ul
            ref={menuRef}
            role="listbox"
            data-scroll-lock
            aria-label={label}
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ type: 'spring', damping: 26, stiffness: 420 }}
            style={{ ...pos, transformOrigin: pos.bottom !== undefined ? 'bottom right' : 'top right' }}
            className="glass-modal fixed z-[200] w-36 rounded-2xl p-1.5 max-h-64 overflow-y-auto no-scrollbar"
          >
            {list.map(m => {
              const selected = m === value;
              return (
                <li key={m}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => { onChange(m); setOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 h-10 rounded-xl text-sm tabular-nums transition-colors ${
                      selected
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold'
                        : 'text-stone-700 dark:text-white/80 hover:bg-[rgba(118,118,128,0.12)]'
                    }`}
                  >
                    {m} min
                    {selected && <Check className="w-4 h-4" />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>,
      document.body,
      )}
    </div>
  );
}
