'use client';

// Ajustes › Colores de la app: acento y fondo para el modo día y el modo noche.
// Los cambios se ven al momento en toda la app.

import { useEffect, useState } from 'react';
import { Check, RotateCcw, Sun, Moon } from 'lucide-react';
import {
  ACCENT_PRESETS, DARK_BG_PRESETS, DEFAULT_THEME, LIGHT_BG_PRESETS,
  applyTheme, loadTheme, resetTheme, type AppTheme,
} from '@/lib/appTheme';

const seg = (on: boolean) => `h-9 rounded-lg text-[13px] font-semibold flex items-center justify-center gap-1.5 ${on ? 'bg-[#fff] dark:bg-[#48484a] text-stone-900 dark:text-white shadow-sm' : 'text-stone-500'}`;
const lbl = 'text-[11px] font-semibold uppercase tracking-wide text-stone-500 mb-2';
const ring = (on: boolean) => `ring-2 ring-offset-2 ring-offset-[#fbfbfa] dark:ring-offset-[#1c1c1e] ${on ? 'ring-[rgb(var(--acc-500))]' : 'ring-transparent'}`;

/** Muestra en miniatura de cómo queda: fondo, tarjeta, botón y chip. */
function Preview({ accent, bg, dark }: { accent: string; bg: string; dark: boolean }) {
  const card = dark ? 'rgba(28,28,30,0.9)' : 'rgba(255,255,255,0.85)';
  const ink = dark ? '#fff' : '#1c1917'; const soft = dark ? 'rgba(255,255,255,0.6)' : '#78716c';
  return (
    <div className="rounded-2xl p-3 border border-black/5 dark:border-white/10" style={{ background: bg }}>
      <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: card }}>
        <span className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: accent }}>K</span>
        <span className="flex-1 min-w-0">
          <span className="block text-[13px] font-semibold" style={{ color: ink }}>Pierna y core</span>
          <span className="block text-[11px]" style={{ color: soft }}>45 min · 6 ejercicios</span>
        </span>
        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ background: `${accent}22`, color: accent }}>Hoy</span>
      </div>
      <div className="mt-2.5 h-9 rounded-full text-white text-[13px] font-semibold flex items-center justify-center" style={{ background: accent }}>Empezar</div>
    </div>
  );
}

export function ThemeEditor({ isDark }: { isDark: boolean }) {
  const [theme, setTheme] = useState<AppTheme>(DEFAULT_THEME);
  const [mode, setMode] = useState<'light' | 'dark'>(isDark ? 'dark' : 'light');
  const [custom, setCustom] = useState(false);
  useEffect(() => { setTheme(loadTheme()); setCustom(!!localStorage.getItem('fitk-theme')); }, []);
  useEffect(() => { setMode(isDark ? 'dark' : 'light'); }, [isDark]);

  const cur = theme[mode];
  const presets = mode === 'light' ? LIGHT_BG_PRESETS : DARK_BG_PRESETS;
  const update = (patch: Partial<AppTheme['light']>) => {
    const next = { ...theme, [mode]: { ...theme[mode], ...patch } };
    setTheme(next); applyTheme(next); setCustom(true);
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[rgba(118,118,128,0.12)]" role="tablist" aria-label="Modo que editas">
        <button type="button" role="tab" aria-selected={mode === 'light'} onClick={() => setMode('light')} className={seg(mode === 'light')}><Sun className="w-4 h-4" /> Modo día</button>
        <button type="button" role="tab" aria-selected={mode === 'dark'} onClick={() => setMode('dark')} className={seg(mode === 'dark')}><Moon className="w-4 h-4" /> Modo noche</button>
      </div>

      <Preview accent={cur.accent} bg={cur.bg} dark={mode === 'dark'} />
      {(mode === 'dark') !== isDark && (
        <p className="text-xs text-stone-500 -mt-2">Estás editando el modo {mode === 'dark' ? 'noche' : 'día'}: lo verás en la app al cambiar de modo.</p>
      )}

      <div>
        <p className={lbl}>Color principal</p>
        <div className="flex flex-wrap gap-2.5">
          {ACCENT_PRESETS.map(a => (
            <button key={a.id} type="button" onClick={() => update({ accent: a.id })} aria-label={`Color ${a.label}`} aria-pressed={cur.accent === a.id} title={a.label}
              className={`w-9 h-9 rounded-full flex items-center justify-center ${ring(cur.accent === a.id)}`} style={{ background: a.id }}>
              {cur.accent === a.id && <Check className="w-4 h-4 text-white" />}
            </button>
          ))}
          <label title="Elige cualquier color" className={`relative w-9 h-9 rounded-full cursor-pointer ${ring(!ACCENT_PRESETS.some(a => a.id === cur.accent))}`}
            style={{ background: ACCENT_PRESETS.some(a => a.id === cur.accent) ? 'conic-gradient(#f43f5e, #f59e0b, #84cc16, #10b981, #06b6d4, #6366f1, #d946ef, #f43f5e)' : cur.accent }}>
            <input type="color" aria-label="Elegir un color principal" value={cur.accent} onChange={e => update({ accent: e.target.value })} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          </label>
        </div>
      </div>

      <div>
        <p className={lbl}>Fondo</p>
        <div className="grid grid-cols-3 gap-2">
          {presets.map(p => {
            const on = cur.bg === p.bg;
            return (
              <button key={p.label} type="button" onClick={() => update({ bg: p.bg, top: p.top })} aria-pressed={on}
                className={`rounded-xl p-1.5 text-left border border-[rgba(128,128,128,0.25)] ${ring(on)}`} style={{ background: p.bg }}>
                <span className="block h-6 rounded-lg" style={{ background: `linear-gradient(180deg, ${p.top}, ${p.bg})` }} />
                <span className={`block text-[11px] font-semibold mt-1 px-0.5 ${mode === 'dark' ? 'text-white/80' : 'text-stone-700'}`}>{p.label}</span>
              </button>
            );
          })}
        </div>
        <label className="mt-2.5 flex items-center justify-between gap-3 h-11 px-3.5 rounded-xl bg-[rgba(118,118,128,0.10)] cursor-pointer">
          <span className="text-[15px] text-stone-900 dark:text-white">Otro color de fondo</span>
          <span className="relative w-8 h-8 rounded-full" style={{ background: cur.bg, boxShadow: 'inset 0 0 0 1px rgba(128,128,128,0.4)' }}>
            <input type="color" aria-label="Elegir un color de fondo" value={cur.bg} onChange={e => update({ bg: e.target.value, top: e.target.value })} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          </span>
        </label>
      </div>

      {custom && (
        <button type="button" onClick={() => { resetTheme(); setTheme(DEFAULT_THEME); setCustom(false); }}
          className="w-full h-10 rounded-xl text-sm font-semibold text-stone-600 dark:text-white/70 flex items-center justify-center gap-1.5">
          <RotateCcw className="w-4 h-4" /> Volver a los colores de Fit K
        </button>
      )}
    </div>
  );
}
