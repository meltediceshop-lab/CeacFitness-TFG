// Colores de la app elegidos por la persona (acento y fondo, en modo día y noche).
// Toda la app usa las clases `emerald-*` de Tailwind, que ahora apuntan a las
// variables --acc-50 … --acc-950: cambiando las variables cambia el acento en
// todas las pantallas. El fondo usa --app-bg y --app-top.
// Se guarda el CSS ya generado para aplicarlo antes de pintar (sin parpadeo).

export interface ModeColors { accent: string; bg: string; top?: string }
export interface AppTheme { light: ModeColors; dark: ModeColors }

export const DEFAULT_THEME: AppTheme = {
  light: { accent: '#10b981', bg: '#f5f6f4', top: '#eaf3ef' },
  dark: { accent: '#10b981', bg: '#000000', top: '#000000' },
};

export const ACCENT_PRESETS: { id: string; label: string }[] = [
  { id: '#10b981', label: 'Esmeralda' }, { id: '#14b8a6', label: 'Turquesa' }, { id: '#0ea5e9', label: 'Cielo' },
  { id: '#6366f1', label: 'Índigo' }, { id: '#8b5cf6', label: 'Violeta' }, { id: '#ec4899', label: 'Rosa' },
  { id: '#f43f5e', label: 'Coral' }, { id: '#f97316', label: 'Naranja' }, { id: '#eab308', label: 'Oro' },
  { id: '#84cc16', label: 'Lima' }, { id: '#64748b', label: 'Pizarra' },
];
export const LIGHT_BG_PRESETS: { label: string; bg: string; top: string }[] = [
  { label: 'Menta', bg: '#f5f6f4', top: '#eaf3ef' },
  { label: 'Blanco', bg: '#ffffff', top: '#ffffff' },
  { label: 'Arena', bg: '#f7f4ee', top: '#efe8da' },
  { label: 'Cielo', bg: '#f3f6fa', top: '#e4edf8' },
  { label: 'Lavanda', bg: '#f6f4fb', top: '#ebe5f7' },
  { label: 'Rosa', bg: '#fbf5f6', top: '#f6e6ea' },
];
export const DARK_BG_PRESETS: { label: string; bg: string; top: string }[] = [
  { label: 'Negro', bg: '#000000', top: '#000000' },
  { label: 'Grafito', bg: '#101012', top: '#101012' },
  { label: 'Azul noche', bg: '#070b14', top: '#0a1222' },
  { label: 'Bosque', bg: '#040d0a', top: '#06140f' },
  { label: 'Berenjena', bg: '#0d0912', top: '#150d1d' },
  { label: 'Cacao', bg: '#0e0a08', top: '#18110c' },
];

const STORAGE = 'fitk-theme';
const STORAGE_CSS = 'fitk-theme-css';

function hexRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h.slice(0, 6), 16);
  return Number.isFinite(n) && h.length >= 6 ? [(n >> 16) & 255, (n >> 8) & 255, n & 255] : [16, 185, 129];
}
function mix(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [0, 1, 2].map(i => Math.round(a[i] + (b[i] - a[i]) * t)) as [number, number, number];
}
export function isHex(v: unknown): v is string { return typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v); }

/** Escala 50–950 a partir de un color (que hace de 500). */
export function accentScale(hex: string): Record<string, string> {
  const base = hexRgb(hex); const W: [number, number, number] = [255, 255, 255]; const K: [number, number, number] = [0, 0, 0];
  const steps: [string, [number, number, number], number][] = [
    ['50', W, 0.92], ['100', W, 0.82], ['200', W, 0.64], ['300', W, 0.42], ['400', W, 0.2], ['500', W, 0],
    ['600', K, 0.16], ['700', K, 0.32], ['800', K, 0.46], ['900', K, 0.6], ['950', K, 0.74],
  ];
  return Object.fromEntries(steps.map(([k, to, t]) => [k, mix(base, to, t).join(' ')]));
}

function block(sel: string, c: ModeColors, dark: boolean): string {
  const acc = accentScale(c.accent);
  const [r, g, b] = hexRgb(c.accent);
  const top = c.top && isHex(c.top) ? c.top : c.bg;
  const [tr, tg, tb] = hexRgb(top);
  const vars = Object.entries(acc).map(([k, v]) => `--acc-${k}:${v};`).join('');
  return `${sel}{${vars}--app-bg:${c.bg};--app-top:${top};--app-glow:linear-gradient(to bottom, ${top} 0px, rgba(${tr},${tg},${tb},0) ${dark ? 240 : 280}px),radial-gradient(120% 60% at 0% 12%, rgba(${r},${g},${b},${dark ? 0.11 : 0.08}) 0%, transparent 55%),radial-gradient(90% 50% at 100% 8%, rgba(${r},${g},${b},0.05) 0%, transparent 50%);}`;
}

/** CSS con las variables de los dos modos. */
export function themeCss(t: AppTheme): string {
  // Más específico que las reglas de globals.css, para ganar sea cual sea el orden de carga.
  return block('html:root', t.light, false) + block('html.dark:root', t.dark, true);
}

export function loadTheme(): AppTheme {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE) || 'null') as Partial<AppTheme> | null;
    const pick = (m: Partial<ModeColors> | undefined, d: ModeColors): ModeColors => ({
      accent: isHex(m?.accent) ? m!.accent! : d.accent, bg: isHex(m?.bg) ? m!.bg! : d.bg, top: isHex(m?.top) ? m!.top : (isHex(m?.bg) ? m!.bg : d.top),
    });
    return { light: pick(raw?.light, DEFAULT_THEME.light), dark: pick(raw?.dark, DEFAULT_THEME.dark) };
  } catch { return DEFAULT_THEME; }
}

/** Aplica el tema al momento y lo guarda para la próxima vez. */
export function applyTheme(t: AppTheme, persist = true) {
  if (typeof document === 'undefined') return;
  const css = themeCss(t);
  let el = document.getElementById('fitk-theme') as HTMLStyleElement | null;
  if (!el) { el = document.createElement('style'); el.id = 'fitk-theme'; document.head.appendChild(el); }
  el.textContent = css;
  const dark = document.documentElement.classList.contains('dark');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', (dark ? t.dark : t.light).top ?? (dark ? t.dark.bg : t.light.bg));
  if (!persist) return;
  try { localStorage.setItem(STORAGE, JSON.stringify(t)); localStorage.setItem(STORAGE_CSS, css); } catch { /* sin almacenamiento */ }
}

export function resetTheme() {
  try { localStorage.removeItem(STORAGE); localStorage.removeItem(STORAGE_CSS); } catch { /* sin almacenamiento */ }
  document.getElementById('fitk-theme')?.remove();
  const dark = document.documentElement.classList.contains('dark');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#000000' : '#eaf3ef');
}

/** Color de la barra de estado según el modo y el tema guardado. */
export function statusBarColor(dark: boolean): string {
  try {
    const raw = localStorage.getItem(STORAGE);
    if (raw) { const t = loadTheme(); return (dark ? t.dark.top : t.light.top) ?? (dark ? '#000000' : '#eaf3ef'); }
  } catch { /* sin almacenamiento */ }
  return dark ? '#000000' : '#eaf3ef';
}

/** Script que se ejecuta antes de pintar la página: aplica el CSS guardado. */
export const THEME_BOOT_SCRIPT = `try{var c=localStorage.getItem('${STORAGE_CSS}');if(c){var s=document.createElement('style');s.id='fitk-theme';s.textContent=c;document.head.appendChild(s);}}catch(e){}`;
