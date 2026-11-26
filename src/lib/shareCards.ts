// Tarjetas para compartir fuera de Fit K (historias de Instagram, WhatsApp…).
// Se dibujan directamente en un <canvas> para que la imagen exportada sea
// idéntica a la vista previa en cualquier navegador. Todas llevan la marca
// (logo, lema y dirección de la app): son la publicidad de Fit K.

export type ShareTemplate = 'session' | 'photo' | 'note' | 'week' | 'progress' | 'milestone' | 'sticker';
export type ShareFormat = 'story' | 'post' | 'square';
export type ShareTheme = 'esmeralda' | 'noche' | 'oceano' | 'atardecer' | 'lila' | 'grafito' | 'claro' | 'menta' | 'arena';
export type ShareFont = 'moderna' | 'clasica' | 'mono';

export const TEMPLATES: { id: ShareTemplate; label: string; hint: string }[] = [
  { id: 'session', label: 'Sesión', hint: 'Cifras y gráfico por zona' },
  { id: 'photo', label: 'Foto', hint: 'Tu foto con las cifras encima' },
  { id: 'note', label: 'Reflexión', hint: 'Tu frase en grande' },
  { id: 'week', label: 'Semana', hint: 'Calendario y resumen' },
  { id: 'progress', label: 'Progreso', hint: 'Gráfica de un ejercicio' },
  { id: 'milestone', label: 'Hito', hint: 'Tu número en grande' },
  { id: 'sticker', label: 'Pegatina', hint: 'Fondo transparente' },
];
export const FORMATS: { id: ShareFormat; label: string; size: [number, number] }[] = [
  { id: 'story', label: 'Historia', size: [1080, 1920] },
  { id: 'post', label: 'Post', size: [1080, 1350] },
  { id: 'square', label: 'Cuadrado', size: [1080, 1080] },
];
export const THEMES: { id: ShareTheme; label: string; swatch: [string, string] }[] = [
  { id: 'esmeralda', label: 'Esmeralda', swatch: ['#064e3b', '#10b981'] },
  { id: 'noche', label: 'Noche', swatch: ['#09090b', '#34d399'] },
  { id: 'oceano', label: 'Océano', swatch: ['#0c1e3e', '#38bdf8'] },
  { id: 'atardecer', label: 'Atardecer', swatch: ['#7c2d12', '#fdba74'] },
  { id: 'lila', label: 'Lila', swatch: ['#2e1065', '#c4b5fd'] },
  { id: 'grafito', label: 'Grafito', swatch: ['#27272a', '#e4e4e7'] },
  { id: 'claro', label: 'Claro', swatch: ['#fbfcfa', '#059669'] },
  { id: 'menta', label: 'Menta', swatch: ['#a7f3d0', '#047857'] },
  { id: 'arena', label: 'Arena', swatch: ['#f5f0e6', '#b45309'] },
];
/** Colores de acento rápidos (además del selector libre). */
export const ACCENTS: { id: string; label: string }[] = [
  { id: '#34d399', label: 'Verde' }, { id: '#22d3ee', label: 'Cian' }, { id: '#a3e635', label: 'Lima' },
  { id: '#fbbf24', label: 'Ámbar' }, { id: '#fb7185', label: 'Coral' }, { id: '#a78bfa', label: 'Violeta' },
  { id: '#ffffff', label: 'Blanco' },
];
export const FONTS: { id: ShareFont; label: string; stack?: string }[] = [
  { id: 'moderna', label: 'Moderna' },
  { id: 'clasica', label: 'Clásica', stack: 'Georgia, "Times New Roman", "Noto Serif", serif' },
  { id: 'mono', label: 'Técnica', stack: 'ui-monospace, "SF Mono", Menlo, "Roboto Mono", monospace' },
];

export interface ShareWeekDay { letter: string; date: number; planned: boolean; done: boolean; today: boolean; sets: number }
export interface ShareData {
  userName: string;
  title: string;
  caption?: string;
  /** Rótulo sobre el título: «ENTRENO COMPLETADO», «MI PRÓXIMO ENTRENO»… */
  kicker?: string;
  date: Date;
  minutes?: number;
  exercises?: number;
  sets?: number;
  volumeKg?: number;
  /** Series por zona (gráfico de barras). */
  muscles?: { label: string; sets: number }[];
  /** Ejercicios destacados de la sesión. */
  topExercises?: { name: string; detail: string }[];
  week?: { days: ShareWeekDay[]; done: number; total: number; minutes: number; sets: number; range: string; volumeKg?: number };
  progress?: { exercise: string; unit: string; points: { label: string; value: number }[] };
  milestone?: { value: string; label: string; sub?: string };
  /** Texto de la plantilla «Reflexión». */
  quote?: string;
  /** Dirección de la app que aparece en el pie. */
  host: string;
}
export interface ShareOptions {
  template: ShareTemplate;
  format: ShareFormat;
  theme: ShareTheme;
  photo?: CanvasImageSource | null;
  show: { minutes: boolean; exercises: boolean; sets: boolean; volume: boolean; name: boolean; chart: boolean };
  /** Color de acento elegido (hex). Sin él, el de la paleta. */
  accent?: string;
  /** Oscurecimiento de la foto, 0–1 (0,5 por defecto). */
  veil?: number;
  /** Zoom de la foto (1 = cubrir justo) y punto de encuadre (0–1 en cada eje). */
  photoZoom?: number;
  photoPos?: { x: number; y: number };
  /** Tipo de letra. */
  font?: ShareFont;
  /** Rótulo propio (sustituye a «ENTRENO COMPLETADO», «MI SEMANA»…). */
  kicker?: string;
  /** Tamaño del texto principal (1 = normal). */
  textScale?: number;
  /** Alineación del texto en la reflexión. */
  align?: 'left' | 'center';
}

interface Palette { bg: [string, string, string]; ink: string; soft: string; accent: string; accent2: string; panel: string; line: string; dark: boolean }
const PALETTES: Record<ShareTheme, Palette> = {
  esmeralda: { bg: ['#022c22', '#064e3b', '#047857'], ink: '#ffffff', soft: 'rgba(255,255,255,0.68)', accent: '#6ee7b7', accent2: '#22d3ee', panel: 'rgba(255,255,255,0.09)', line: 'rgba(255,255,255,0.18)', dark: true },
  noche: { bg: ['#050505', '#0c1210', '#111827'], ink: '#ffffff', soft: 'rgba(255,255,255,0.62)', accent: '#34d399', accent2: '#22d3ee', panel: 'rgba(255,255,255,0.07)', line: 'rgba(255,255,255,0.14)', dark: true },
  oceano: { bg: ['#020617', '#0c1e3e', '#1e40af'], ink: '#ffffff', soft: 'rgba(255,255,255,0.68)', accent: '#38bdf8', accent2: '#a5f3fc', panel: 'rgba(255,255,255,0.08)', line: 'rgba(255,255,255,0.17)', dark: true },
  atardecer: { bg: ['#1c0a0a', '#7c2d12', '#c2410c'], ink: '#ffffff', soft: 'rgba(255,255,255,0.7)', accent: '#fdba74', accent2: '#fde047', panel: 'rgba(255,255,255,0.09)', line: 'rgba(255,255,255,0.18)', dark: true },
  lila: { bg: ['#0f0a1e', '#2e1065', '#6d28d9'], ink: '#ffffff', soft: 'rgba(255,255,255,0.68)', accent: '#c4b5fd', accent2: '#f0abfc', panel: 'rgba(255,255,255,0.08)', line: 'rgba(255,255,255,0.17)', dark: true },
  grafito: { bg: ['#09090b', '#18181b', '#3f3f46'], ink: '#ffffff', soft: 'rgba(255,255,255,0.62)', accent: '#e4e4e7', accent2: '#a1a1aa', panel: 'rgba(255,255,255,0.07)', line: 'rgba(255,255,255,0.15)', dark: true },
  claro: { bg: ['#fbfcfa', '#f1f6f3', '#dff3ea'], ink: '#0c0a09', soft: 'rgba(28,25,23,0.6)', accent: '#059669', accent2: '#0891b2', panel: 'rgba(255,255,255,0.8)', line: 'rgba(0,0,0,0.09)', dark: false },
  menta: { bg: ['#d1fae5', '#a7f3d0', '#6ee7b7'], ink: '#022c22', soft: 'rgba(2,44,34,0.66)', accent: '#047857', accent2: '#0e7490', panel: 'rgba(255,255,255,0.55)', line: 'rgba(2,44,34,0.14)', dark: false },
  arena: { bg: ['#fafaf9', '#f5f0e6', '#e7dcc6'], ink: '#1c1917', soft: 'rgba(28,25,23,0.62)', accent: '#b45309', accent2: '#c2410c', panel: 'rgba(255,255,255,0.65)', line: 'rgba(28,25,23,0.11)', dark: false },
};
const PHOTO_PALETTE: Palette = { bg: ['#000', '#000', '#000'], ink: '#ffffff', soft: 'rgba(255,255,255,0.8)', accent: '#6ee7b7', accent2: '#22d3ee', panel: 'rgba(0,0,0,0.38)', line: 'rgba(255,255,255,0.22)', dark: true };

// ── Color ───────────────────────────────────────────────────────────
function hexRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h.slice(0, 6), 16);
  return Number.isFinite(n) ? [(n >> 16) & 255, (n >> 8) & 255, n & 255] : [52, 211, 153];
}
function rgbHex(r: number, g: number, b: number) { return '#' + [r, g, b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join(''); }
function mix(a: string, b: string, t: number) { const x = hexRgb(a), y = hexRgb(b); return rgbHex(x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t); }
function luminance(hex: string) {
  const c = hexRgb(hex).map(v => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function contrast(a: string, b: string) { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
/** Hace legible el acento sobre el fondo: lo aclara en fondos oscuros y lo oscurece en claros. */
function readable(accent: string, bg: string, dark: boolean) {
  let c = accent;
  for (let i = 0; i < 12 && contrast(c, bg) < 3.2; i++) c = mix(c, dark ? '#ffffff' : '#000000', 0.14);
  return c;
}
/** Segundo tono del degradado: el mismo color girado un poco y más luminoso. */
function companion(hex: string) {
  const [r, g, b] = hexRgb(hex).map(v => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b); const l = (max + min) / 2; const d = max - min;
  if (d < 0.04) return mix(hex, '#ffffff', 0.35); // grises y blanco
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4; h = (h * 60 + 360 + 32) % 360;
  const c2 = (1 - Math.abs(2 * l - 1)) * s; const x = c2 * (1 - Math.abs(((h / 60) % 2) - 1)); const m = l - c2 / 2;
  const [r1, g1, b1] = h < 60 ? [c2, x, 0] : h < 120 ? [x, c2, 0] : h < 180 ? [0, c2, x] : h < 240 ? [0, x, c2] : h < 300 ? [x, 0, c2] : [c2, 0, x];
  return rgbHex((r1 + m) * 255, (g1 + m) * 255, (b1 + m) * 255);
}
function rgba(hex: string, a: number) { const [r, g, b] = hexRgb(hex); return `rgba(${r},${g},${b},${a})`; }

/** Paleta final: la del tema (o la de foto) con el acento elegido, siempre legible. */
function buildPalette(opts: ShareOptions, usePhoto: boolean): Palette {
  const theme = PALETTES[opts.theme] ?? PALETTES.esmeralda;
  const base = usePhoto ? { ...PHOTO_PALETTE, bg: theme.bg, accent: theme.dark ? theme.accent : PHOTO_PALETTE.accent, accent2: theme.dark ? theme.accent2 : PHOTO_PALETTE.accent2 } : { ...theme };
  if (!opts.accent) return base;
  const ground = usePhoto || base.dark ? '#111111' : base.bg[1];
  const accent = readable(opts.accent, ground, usePhoto || base.dark);
  return { ...base, accent, accent2: readable(companion(accent), ground, usePhoto || base.dark) };
}

const W = 1080;
const P = 72; // margen
const fmt = (n: number, d = 0) => n.toLocaleString('es-ES', { maximumFractionDigits: d });
// Contorno de la «K» del logo (public/icon.svg)
const LOGO = 'M198.72-164.06L324.02 0L227.43 0L136.17-122.23L117.71-99.87L117.71 0L38.96 0L38.96-305.36L117.71-305.36L117.71-167.14L226.82-305.36L318.08-305.36Z';

type Ctx = CanvasRenderingContext2D;
interface Kit { ctx: Ctx; H: number; pal: Palette; family: string; data: ShareData; opts: ShareOptions; /** Sombra suave en los textos (sobre foto). */ shadow?: boolean }

function font(k: Kit, size: number, weight = 600) { k.ctx.font = `${weight} ${size}px ${k.family}`; }
/** Rótulo de cada plantilla: el que escriba la persona o el de siempre. */
function kicker(k: Kit, fallback: string) { return (k.opts.kicker?.trim() || fallback).toUpperCase(); }
function spacing(ctx: Ctx, px: number) { (ctx as unknown as { letterSpacing: string }).letterSpacing = `${px}px`; }
function text(k: Kit, s: string, x: number, y: number, o: { size: number; weight?: number; color?: string; align?: CanvasTextAlign; ls?: number; max?: number }) {
  const { ctx } = k;
  font(k, o.size, o.weight ?? 600);
  ctx.fillStyle = o.color ?? k.pal.ink;
  ctx.textAlign = o.align ?? 'left';
  ctx.textBaseline = 'alphabetic';
  spacing(ctx, o.ls ?? 0);
  let out = s;
  if (o.max) { while (out.length > 1 && ctx.measureText(out).width > o.max) out = out.slice(0, -1); if (out !== s) out = out.trimEnd().replace(/.$/, '…'); }
  if (k.shadow) { ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 2; }
  ctx.fillText(out, x, y);
  if (k.shadow) { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; }
  spacing(ctx, 0);
}
/** Ajusta un título al ancho: reduce el tamaño y parte en líneas. Si no cabe ni al mínimo, recorta con «…». */
function fitLines(k: Kit, s: string, max: number, maxLines: number, start: number, min: number, weight = 800): { size: number; lines: string[] } {
  const wrap = (size: number) => {
    font(k, size, weight);
    const lines: string[] = []; let cur = '';
    for (const w of s.split(/\s+/)) {
      const next = cur ? `${cur} ${w}` : w;
      if (k.ctx.measureText(next).width <= max) cur = next; else { if (cur) lines.push(cur); cur = w; }
    }
    if (cur) lines.push(cur);
    return lines;
  };
  for (let size = start; size >= min; size -= 4) {
    const lines = wrap(size);
    if (lines.length <= maxLines && lines.every(l => k.ctx.measureText(l).width <= max)) return { size, lines };
  }
  const lines = wrap(min);
  if (lines.length > maxLines) lines.splice(maxLines - 1, lines.length, lines.slice(maxLines - 1).join(' '));
  return { size: min, lines }; // quien pinta pasa `max`, así que la línea que sobre se recorta con «…»
}
function rr(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  const q = Math.min(r, w / 2, h / 2);
  ctx.beginPath(); ctx.moveTo(x + q, y); ctx.arcTo(x + w, y, x + w, y + h, q); ctx.arcTo(x + w, y + h, x, y + h, q); ctx.arcTo(x, y + h, x, y, q); ctx.arcTo(x, y, x + w, y, q); ctx.closePath();
}
function logo(ctx: Ctx, x: number, y: number, h: number, mono?: string): number {
  const s = h / 305.36;
  ctx.save(); ctx.translate(x - 38.96 * s, y + h); ctx.scale(s, s);
  const g = ctx.createLinearGradient(0, -305.36, 0, 0); g.addColorStop(0, '#22d3ee'); g.addColorStop(1, '#4ade80');
  ctx.fillStyle = mono ?? g; ctx.fill(new Path2D(LOGO)); ctx.restore();
  return 285.06 * s;
}
function accentGradient(k: Kit, x0: number, x1: number) {
  const g = k.ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, k.pal.accent); g.addColorStop(1, k.pal.accent2); return g;
}

function background(k: Kit) {
  const { ctx, H, pal, opts } = k;
  if (opts.photo) {
    const img = opts.photo as HTMLImageElement;
    const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    const zoom = Math.max(1, Math.min(3, opts.photoZoom ?? 1));
    const s = Math.max(W / iw, H / ih) * zoom;
    const fx = Math.max(0, Math.min(1, opts.photoPos?.x ?? 0.5)), fy = Math.max(0, Math.min(1, opts.photoPos?.y ?? 0.5));
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); // base opaca (fotos con transparencia)
    if (iw > 0 && ih > 0) ctx.drawImage(img, (W - iw * s) * fx, (H - ih * s) * fy, iw * s, ih * s);
    // Velo: más o menos oscuro según elija la persona, teñido con el color de la paleta.
    const v = Math.max(0, Math.min(1, opts.veil ?? 0.5)) / 0.5;
    const tint = pal.bg[0] === '#000' ? '#000000' : (luminance(pal.bg[1]) < 0.2 ? pal.bg[0] : '#000000');
    const a = (x: number) => rgba(tint, Math.min(0.96, x * v));
    const g = ctx.createLinearGradient(0, 0, 0, H);
    if (opts.template === 'photo' || opts.template === 'note') {
      // El texto va abajo: la foto respira arriba.
      g.addColorStop(0, a(0.55)); g.addColorStop(0.3, a(0.12)); g.addColorStop(0.55, a(0.35)); g.addColorStop(1, a(0.9));
    } else {
      // El texto ocupa toda la tarjeta: velo uniforme para que se lea sobre fotos claras.
      g.addColorStop(0, a(0.62)); g.addColorStop(0.5, a(0.52)); g.addColorStop(1, a(0.86));
    }
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    return;
  }
  const g = ctx.createLinearGradient(0, 0, W * 0.6, H);
  g.addColorStop(0, pal.bg[0]); g.addColorStop(0.55, pal.bg[1]); g.addColorStop(1, pal.bg[2]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // Brillo de color arriba a la derecha
  const glow = ctx.createRadialGradient(W * 0.95, H * 0.04, 0, W * 0.95, H * 0.04, W * 0.9);
  glow.addColorStop(0, rgba(pal.accent, pal.dark ? 0.32 : 0.22)); glow.addColorStop(1, rgba(pal.accent, 0));
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
  // «K» gigante de marca, casi transparente
  ctx.save(); ctx.globalAlpha = pal.dark ? 0.06 : 0.07;
  logo(ctx, W * 0.42, H - W * 0.86, W * 0.86, pal.dark ? '#ffffff' : pal.accent);
  ctx.restore();
}

function header(k: Kit, right?: string) {
  const { ctx, pal } = k;
  const w = logo(ctx, P, P, 54);
  text(k, 'Fit K', P + w + 18, P + 44, { size: 40, weight: 800 });
  if (right) text(k, right, W - P, P + 40, { size: 28, weight: 600, color: pal.soft, align: 'right', ls: 2 });
}
const TAGLINE = 'Entrena tu cuerpo. Cuida tu cabeza.';
/** ¿El lema y la dirección caben en una línea? Si no, van apilados. */
function footerStacked(k: Kit): boolean {
  font(k, 38, 800); const hw = k.ctx.measureText(k.data.host).width;
  font(k, 30, 500); const tw = k.ctx.measureText(TAGLINE).width;
  return hw + tw + 40 > W - 2 * P;
}
/** Y hasta la que puede llegar el contenido sin tocar el pie. */
function contentBottom(k: Kit): number { return k.H - P - (footerStacked(k) ? 116 : 70) - 44; }
/** Pie con la marca: es lo que lleva a quien ve la tarjeta hasta la app. */
function footer(k: Kit) {
  const { ctx, H, pal, data } = k;
  const y = H - P; const stacked = footerStacked(k);
  const hostColor = pal.accent;
  ctx.fillStyle = pal.line; ctx.fillRect(P, y - (stacked ? 116 : 70), W - 2 * P, 2);
  if (stacked) {
    text(k, TAGLINE, P, y - 54, { size: 30, weight: 500, color: pal.soft, max: W - 2 * P });
    text(k, data.host, P, y, { size: 38, weight: 800, color: hostColor, max: W - 2 * P });
  } else {
    text(k, TAGLINE, P, y, { size: 30, weight: 500, color: pal.soft });
    text(k, data.host, W - P, y, { size: 38, weight: 800, color: hostColor, align: 'right' });
  }
}

interface Stat { value: string; unit: string; label: string }
function stats(k: Kit): Stat[] {
  const { data, opts } = k; const out: Stat[] = [];
  if (opts.show.minutes && data.minutes) out.push({ value: fmt(data.minutes), unit: 'min', label: 'Duración' });
  if (opts.show.exercises && data.exercises) out.push({ value: fmt(data.exercises), unit: '', label: 'Ejercicios' });
  if (opts.show.sets && data.sets) out.push({ value: fmt(data.sets), unit: '', label: 'Series' });
  if (opts.show.volume && data.volumeKg) out.push(data.volumeKg >= 10000
    ? { value: fmt(data.volumeKg / 1000, 1), unit: 't', label: 'Volumen' }
    : { value: fmt(data.volumeKg), unit: 'kg', label: 'Volumen' });
  return out;
}
/** Fila de cifras; devuelve la altura usada. */
function statRow(k: Kit, list: Stat[], x: number, y: number, w: number, size: number): number {
  if (!list.length) return 0;
  const { ctx, pal } = k; const col = w / list.length;
  // Si alguna cifra no cabe en su columna (p. ej. «4850 kg»), se reduce el tamaño de todas.
  const widest = (sz: number) => Math.max(...list.map(s => { font(k, sz, 800); const v = ctx.measureText(s.value).width; font(k, Math.max(28, sz * 0.36), 700); return v + (s.unit ? 8 + ctx.measureText(s.unit).width : 0); }));
  while (size > 48 && widest(size) > col - 44) size -= 4;
  list.forEach((s, i) => {
    const cx = x + col * i;
    if (i > 0) { ctx.fillStyle = pal.line; ctx.fillRect(cx - 1, y + 8, 2, size + 44); }
    const px = cx + (i > 0 ? 28 : 0);
    font(k, size, 800);
    const vw = ctx.measureText(s.value).width;
    text(k, s.value, px, y + size, { size, weight: 800 });
    if (s.unit) text(k, s.unit, px + vw + 8, y + size, { size: Math.max(28, size * 0.36), weight: 700, color: pal.soft });
    text(k, s.label.toUpperCase(), px, y + size + 46, { size: 24, weight: 700, color: pal.soft, ls: 3 });
  });
  return size + 60;
}
function panel(k: Kit, x: number, y: number, w: number, h: number) {
  const { ctx, pal } = k;
  rr(ctx, x, y, w, h, 40); ctx.fillStyle = pal.panel; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = pal.line; ctx.stroke();
}
/** Barras horizontales (series por zona). */
function barChart(k: Kit, items: { label: string; sets: number }[], x: number, y: number, w: number, title: string): number {
  const { ctx, pal } = k; const rows = items.slice(0, 5); const rowH = 62; const h = 96 + rows.length * rowH + 24;
  panel(k, x, y, w, h);
  text(k, title.toUpperCase(), x + 44, y + 64, { size: 24, weight: 700, color: pal.soft, ls: 3 });
  const max = Math.max(...rows.map(r => r.sets), 1); const bx = x + 290; const bw = w - 290 - 130;
  rows.forEach((r, i) => {
    const cy = y + 96 + i * rowH;
    text(k, r.label, x + 44, cy + 36, { size: 32, weight: 600, max: 230 });
    rr(ctx, bx, cy + 10, bw, 28, 14); ctx.fillStyle = pal.line; ctx.fill();
    const fw = Math.max(28, bw * (r.sets / max));
    rr(ctx, bx, cy + 10, fw, 28, 14); ctx.fillStyle = accentGradient(k, bx, bx + bw); ctx.fill();
    text(k, fmt(r.sets), x + w - 44, cy + 36, { size: 32, weight: 800, align: 'right' });
  });
  return h;
}

// ── Plantillas ──────────────────────────────────────────────────────
function tSession(k: Kit) {
  const { H, pal, data, opts } = k; const tall = H > 1500; const mid = H > 1200;
  background(k);
  header(k, data.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase());
  let y = P + 54 + (tall ? 170 : mid ? 100 : 70);
  text(k, kicker(k, data.kicker ?? 'ENTRENO COMPLETADO'), P, y, { size: 28, weight: 700, color: pal.accent, ls: 6, max: W - 2 * P });
  const sc = k.opts.textScale ?? 1;
  const t = fitLines(k, data.title, W - 2 * P, 2, Math.round((tall ? 116 : 96) * sc), Math.round(60 * Math.min(1, sc)));
  y += 30;
  for (const line of t.lines) { y += t.size * 1.14; text(k, line, P, y, { size: t.size, weight: 800, max: W - 2 * P }); }
  if (opts.show.name) { y += Math.round(t.size * 0.3) + 40; text(k, data.caption?.trim() || `${data.userName} · con su plan de Fit K`, P, y, { size: 34, weight: 500, color: pal.soft, max: W - 2 * P }); }
  y += tall ? 90 : 56;
  const list = stats(k);
  if (list.length === 4 && tall) {
    y += statRow(k, list.slice(0, 2), P, y, W - 2 * P, 128) + 44;
    y += statRow(k, list.slice(2), P, y, W - 2 * P, 128);
  } else y += statRow(k, list, P, y, W - 2 * P, list.length > 3 ? 84 : mid ? 112 : 96);
  const bottom = contentBottom(k);
  if (opts.show.chart && data.muscles?.length) {
    const rows = Math.min(5, data.muscles.length, Math.floor((bottom - y - 48 - 120) / 62));
    if (rows >= 2) { y += tall ? 70 : 48; y += barChart(k, data.muscles.slice(0, rows), P, y, W - 2 * P, 'Series por zona'); }
  }
  if (data.topExercises?.length && bottom - y > 190) {
    y += 64; text(k, 'LO MÁS DESTACADO', P, y, { size: 24, weight: 700, color: pal.soft, ls: 3 });
    for (const e of data.topExercises.slice(0, Math.floor((bottom - y - 20) / 62))) {
      y += 62; font(k, 32, 700); const dw = k.ctx.measureText(e.detail).width;
      text(k, e.detail, W - P, y, { size: 32, weight: 700, color: pal.accent, align: 'right' });
      text(k, e.name, P, y, { size: 34, weight: 600, max: W - 2 * P - dw - 36 });
    }
  }
  footer(k);
}

function tPhoto(k: Kit) {
  const { H, pal, data, opts } = k;
  background(k);
  header(k);
  const list = stats(k).slice(0, 3);
  const base = contentBottom(k) + 10;
  let y = base - (list.length ? 190 : 0);
  if (opts.show.name) { text(k, data.caption?.trim() || data.userName, P, y - 4, { size: 34, weight: 500, color: pal.soft, max: W - 2 * P }); y -= 60; }
  const sc = opts.textScale ?? 1;
  const t = fitLines(k, data.title, W - 2 * P, 2, Math.round(104 * sc), Math.round(60 * Math.min(1, sc)));
  for (const line of [...t.lines].reverse()) { text(k, line, P, y, { size: t.size, weight: 800, max: W - 2 * P }); y -= t.size * 1.14; }
  text(k, kicker(k, data.kicker ?? 'ENTRENO COMPLETADO'), P, y - 8, { size: 28, weight: 700, color: pal.accent, ls: 6, max: W - 2 * P });
  if (list.length) statRow(k, list, P, base - 150, W - 2 * P, 92);
  footer(k);
}

// ── Texto con formato (negrita **así**, cursiva *así*, resaltado ==así==) ──
interface Run { text: string; bold: boolean; italic: boolean; mark: boolean }
/** Quita las marcas de formato (para publicar o contar caracteres). */
export function plainText(s: string): string { return s.replace(/\*\*|==|\*/g, ''); }
function parseRich(s: string): Run[] {
  const runs: Run[] = []; let bold = false, italic = false, mark = false; let buf = '';
  const push = () => { if (buf) runs.push({ text: buf, bold, italic, mark }); buf = ''; };
  for (let i = 0; i < s.length; i++) {
    if (s.startsWith('**', i)) { push(); bold = !bold; i++; continue; }
    if (s.startsWith('==', i)) { push(); mark = !mark; i++; continue; }
    if (s[i] === '*') { push(); italic = !italic; continue; }
    buf += s[i];
  }
  push();
  return runs;
}
type Piece = Run & { w: number };
function richFont(k: Kit, size: number, base: number, r: Run) { k.ctx.font = `${r.italic ? 'italic ' : ''}${r.bold ? 800 : base} ${size}px ${k.family}`; }
/** Parte el texto con formato en líneas que quepan, reduciendo el tamaño si hace falta. */
function richLines(k: Kit, s: string, max: number, maxLines: number, start: number, min: number, base: number): { size: number; lines: Piece[][] } {
  const runs = parseRich(s);
  const wrap = (size: number) => {
    const lines: Piece[][] = []; let cur: Piece[] = []; let curW = 0;
    for (const r of runs) {
      // Cada palabra (con su espacio) es una pieza con su propio estilo.
      for (const part of r.text.split(/(\s+)/)) {
        if (!part) continue;
        if (/\n/.test(part)) { lines.push(cur); cur = []; curW = 0; continue; }
        richFont(k, size, base, r); const w = k.ctx.measureText(part).width;
        if (/^\s+$/.test(part)) { if (cur.length) { cur.push({ ...r, text: part, w }); curW += w; } continue; }
        if (curW + w > max && cur.length) {
          while (cur.length && /^\s+$/.test(cur[cur.length - 1].text)) curW -= cur.pop()!.w;
          lines.push(cur); cur = []; curW = 0;
        }
        cur.push({ ...r, text: part, w }); curW += w;
      }
    }
    if (cur.length) lines.push(cur);
    return lines.map(l => { while (l.length && /^\s+$/.test(l[l.length - 1].text)) l.pop(); return l; });
  };
  for (let size = start; size >= min; size -= 2) { const lines = wrap(size); if (lines.length <= maxLines) return { size, lines }; }
  const lines = wrap(min); return { size: min, lines: lines.slice(0, maxLines) };
}
function drawRichLine(k: Kit, line: Piece[], x: number, y: number, size: number, base: number, color: string, align: CanvasTextAlign) {
  const { ctx } = k; const total = line.reduce((a, p) => a + p.w, 0);
  let cx = align === 'center' ? x - total / 2 : x;
  for (const p of line) {
    richFont(k, size, base, p);
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    if (p.mark && !/^\s+$/.test(p.text)) {
      // Resaltado: fondo del color de acento detrás de la palabra.
      ctx.save(); ctx.fillStyle = rgba(k.pal.accent, 0.32); rr(ctx, cx - 6, y - size * 0.86, p.w + 12, size * 1.12, 10); ctx.fill(); ctx.restore();
    }
    ctx.fillStyle = p.mark ? k.pal.ink : p.bold ? k.pal.ink : color;
    if (k.shadow) { ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 2; }
    ctx.fillText(p.text, cx, y);
    if (k.shadow) { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; }
    cx += p.w;
  }
}

/** Reflexión: título en grande y un párrafo debajo, sobre su foto o el color elegido. */
function tNote(k: Kit) {
  const { ctx, pal, data, opts } = k;
  background(k);
  header(k, data.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase());
  const title = data.title?.trim() ?? '';
  const body = data.quote?.trim() || (title ? '' : 'Escribe aquí lo que quieras contar.');
  const tall = k.H > 1500; const mid = k.H > 1200;
  const sc = Math.max(0.7, Math.min(1.4, opts.textScale ?? 1));
  const center = opts.align === 'center';
  const x = center ? W / 2 : P; const align: CanvasTextAlign = center ? 'center' : 'left';
  const maxW = W - 2 * P;
  // Medidas del título y del párrafo
  const tt = title ? fitLines(k, title, maxW, tall ? 4 : 3, Math.round((tall ? 96 : 84) * sc), Math.round(52 * Math.min(1, sc)), 800) : null;
  const tlh = tt ? tt.size * 1.12 : 0;
  const baseW = title ? 500 : 700;
  const bt = body ? richLines(k, body, maxW, tall ? 10 : mid ? 7 : 5, Math.round((title ? 42 : (tall ? 84 : 76)) * sc), Math.round((title ? 32 : 44) * Math.min(1, sc)), baseW) : null;
  const blh = bt ? bt.size * (title ? 1.4 : 1.22) : 0;
  const titleH = tt ? tlh * (tt.lines.length - 1) + tt.size : 0;
  const bodyH = bt ? blh * (bt.lines.length - 1) + bt.size : 0;
  const gap = tt && bt ? 44 : 0;
  const signH = opts.show.name ? 80 : 0;
  const kickerH = 96; // comillas + rótulo
  const blockH = kickerH + titleH + gap + bodyH + signH;
  const bottom = contentBottom(k) + 10; const top0 = P + 54 + 60;
  // Abajo (izquierda) o en mitad de la tarjeta (centrado).
  let y = center ? Math.max(top0, top0 + (bottom - top0 - blockH) / 2) : Math.max(top0, bottom - blockH);
  // Comillas de color y rótulo
  const label = kicker(k, data.kicker ?? 'REFLEXIÓN');
  ctx.save(); font(k, 150, 900); ctx.textBaseline = 'alphabetic'; ctx.textAlign = align;
  ctx.fillStyle = accentGradient(k, center ? W / 2 - 60 : P, center ? W / 2 + 60 : P + 120);
  ctx.fillText('“', center ? W / 2 : P - 6, y + 96); ctx.restore();
  if (center) text(k, label, W / 2, y - 6, { size: 28, weight: 700, color: pal.accent, ls: 6, max: maxW, align: 'center' });
  else text(k, label, P + 100, y + 40, { size: 28, weight: 700, color: pal.accent, ls: 6, max: maxW - 100 });
  y += kickerH;
  if (tt) { tt.lines.forEach((line, i) => text(k, line, x, y + tt.size + i * tlh, { size: tt.size, weight: 800, max: maxW, align })); y += titleH + gap; }
  if (bt) {
    const color = title ? (pal.dark ? 'rgba(255,255,255,0.9)' : pal.ink) : pal.ink;
    bt.lines.forEach((line, i) => drawRichLine(k, line, x, y + bt.size + i * blh, bt.size, baseW, color, align));
    y += bodyH;
  }
  if (opts.show.name) text(k, `— ${data.caption?.trim() || data.userName}`, x, y + 70, { size: 34, weight: 600, color: pal.soft, max: maxW, align });
  footer(k);
}

function tWeek(k: Kit) {
  const { ctx, H, pal, data } = k; const wk = data.week; const tall = H > 1500; const mid = H > 1200;
  background(k);
  header(k, wk?.range.toUpperCase());
  if (!wk) { footer(k); return; }
  const pw = W - 2 * P; const bottom = contentBottom(k);
  const list: Stat[] = [{ value: fmt(wk.minutes), unit: 'min', label: 'Tiempo' }, { value: fmt(wk.sets), unit: '', label: 'Series' }];
  if (k.opts.show.volume && wk.volumeKg) list.push(wk.volumeKg >= 10000
    ? { value: fmt(wk.volumeKg / 1000, 1), unit: 't', label: 'Volumen' }
    : { value: fmt(wk.volumeKg), unit: 'kg', label: 'Volumen' });
  // Medidas según el formato (el cuadrado va más compacto)
  const big = mid ? 150 : 124; const ph = mid ? 250 : 216; const gapA = tall ? 100 : mid ? 64 : 44; const gapB = tall ? 80 : mid ? 56 : 40;
  const statSize = mid ? 112 : 88; const statsH = statSize + 60;
  const top = P + 54 + (tall ? 170 : mid ? 100 : 66);
  const fixed = 30 + big + 62 + gapA + ph + gapB + statsH;
  const chartRoom = bottom - (top + fixed) - 70;
  const withChart = k.opts.show.chart && chartRoom >= 250;
  // Sin gráfica, el bloque se baja un poco para no dejar una franja vacía abajo.
  let y = withChart ? top : top + Math.max(0, (bottom - top - fixed) * 0.45);
  text(k, kicker(k, 'MI SEMANA'), P, y, { size: 28, weight: 700, color: pal.accent, ls: 6, max: pw });
  y += 30 + big; text(k, `${wk.done} de ${wk.total}`, P, y, { size: big, weight: 800 });
  y += 62; text(k, data.caption?.trim() || (wk.done >= wk.total ? 'Semana completa. Así se construye.' : 'sesiones hechas. Sigo sumando.'), P, y, { size: 38, weight: 500, color: pal.soft, max: pw });
  // Calendario de la semana
  y += gapA; panel(k, P, y, pw, ph);
  const col = (pw - 60) / 7; const r = mid ? 46 : 40;
  wk.days.forEach((d, i) => {
    const cx = P + 30 + col * i + col / 2; const cy = y + ph - 100 + (mid ? 0 : 8);
    text(k, d.letter, cx, y + 70, { size: 28, weight: 700, color: d.today ? pal.accent : pal.soft, align: 'center' });
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    if (d.done) { ctx.fillStyle = accentGradient(k, cx - r, cx + r); ctx.fill(); }
    else if (d.planned) { ctx.lineWidth = 4; ctx.strokeStyle = pal.accent; ctx.stroke(); }
    else { ctx.fillStyle = pal.line; ctx.fill(); }
    text(k, String(d.date), cx, cy + 13, { size: 36, weight: 800, color: d.done ? (luminance(pal.accent) > 0.35 ? '#0a0a0a' : '#ffffff') : d.planned ? pal.ink : pal.soft, align: 'center' });
  });
  y += ph + gapB;
  y += statRow(k, list, P, y, pw, statSize);
  // Barras por día
  if (withChart) {
    y += 70; const ch = Math.min(440, bottom - y); panel(k, P, y, pw, ch);
    text(k, 'SERIES POR DÍA', P + 44, y + 64, { size: 24, weight: 700, color: pal.soft, ls: 3 });
    const max = Math.max(...wk.days.map(d => d.sets), 1); const base = y + ch - 70; const topBar = y + 150;
    wk.days.forEach((d, i) => {
      const cx = P + 30 + col * i + col / 2; const bh = Math.max(d.sets ? 20 : 8, (base - topBar) * (d.sets / max));
      rr(ctx, cx - 30, base - bh, 60, bh, 18); ctx.fillStyle = d.sets ? accentGradient(k, cx - 30, cx + 30) : pal.line; ctx.fill();
      if (d.sets) text(k, String(d.sets), cx, base - bh - 14, { size: 28, weight: 800, align: 'center' });
      text(k, d.letter, cx, base + 44, { size: 26, weight: 700, color: pal.soft, align: 'center' });
    });
  }
  footer(k);
}

function tProgress(k: Kit) {
  const { ctx, H, pal, data } = k; const pr = data.progress; const tall = H > 1500; const mid = H > 1200;
  background(k);
  header(k, data.date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase());
  if (!pr || pr.points.length < 2) { footer(k); return; }
  const first = pr.points[0].value, last = pr.points[pr.points.length - 1].value; const delta = last - first;
  let y = P + 54 + (tall ? 170 : mid ? 100 : 70);
  text(k, kicker(k, 'MI PROGRESO'), P, y, { size: 28, weight: 700, color: pal.accent, ls: 6, max: W - 2 * P });
  const sc = k.opts.textScale ?? 1;
  const t = fitLines(k, pr.exercise, W - 2 * P, mid ? 2 : 1, Math.round((mid ? 92 : 72) * sc), Math.round(48 * Math.min(1, sc)));
  y += 24; for (const line of t.lines) { y += t.size * 1.14; text(k, line, P, y, { size: t.size, weight: 800, max: W - 2 * P }); }
  const bigSize = mid ? 170 : 120;
  y += tall ? 190 : mid ? 150 : 116;
  const big = `${delta >= 0 ? '+' : '−'}${fmt(Math.abs(delta), 1)}`;
  font(k, bigSize, 800); const bw = ctx.measureText(big).width;
  ctx.fillStyle = accentGradient(k, P, P + bw); ctx.textAlign = 'left'; ctx.fillText(big, P, y);
  text(k, pr.unit, P + bw + 14, y, { size: bigSize * 0.38, weight: 700, color: pal.soft });
  y += 62; text(k, data.caption?.trim() || `De ${fmt(first, 1)} a ${fmt(last, 1)} ${pr.unit} en ${pr.points.length} sesiones`, P, y, { size: 36, weight: 500, color: pal.soft, max: W - 2 * P });
  // Gráfica de línea
  y += tall ? 80 : mid ? 50 : 36; const bottom = contentBottom(k); const ch = Math.min(tall ? 860 : 680, bottom - y); if (ch < 220) { footer(k); return; }
  const pw = W - 2 * P; panel(k, P, y, pw, ch);
  const x0 = P + 70, x1 = P + pw - 70, y0 = y + 110, y1 = y + ch - 150;
  const min = Math.min(...pr.points.map(p => p.value)), max = Math.max(...pr.points.map(p => p.value)); const span = max - min || 1;
  const pts = pr.points.map((p, i) => ({ x: x0 + (x1 - x0) * (i / (pr.points.length - 1)), y: y1 - (y1 - y0) * ((p.value - min) / span), p }));
  const area = ctx.createLinearGradient(0, y0, 0, y1 + 40); area.addColorStop(0, rgba(pal.accent, pal.dark ? 0.38 : 0.28)); area.addColorStop(1, rgba(pal.accent, 0));
  ctx.beginPath(); ctx.moveTo(pts[0].x, y1 + 40); pts.forEach(q => ctx.lineTo(q.x, q.y)); ctx.lineTo(pts[pts.length - 1].x, y1 + 40); ctx.closePath(); ctx.fillStyle = area; ctx.fill();
  ctx.beginPath(); pts.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)));
  ctx.lineWidth = 10; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = accentGradient(k, x0, x1); ctx.stroke();
  pts.forEach((q, i) => {
    const edge = i === 0 || i === pts.length - 1;
    ctx.beginPath(); ctx.arc(q.x, q.y, edge ? 18 : 11, 0, Math.PI * 2); ctx.fillStyle = pal.dark ? mix(pal.bg[0] === '#000' ? '#000000' : pal.bg[0], '#000000', 0.2) : '#ffffff'; ctx.fill();
    ctx.lineWidth = edge ? 8 : 6; ctx.strokeStyle = pal.accent; ctx.stroke();
    if (edge) {
      // La etiqueta va al lado contrario del tramo vecino para que la línea no la atraviese.
      const neighbour = i === 0 ? pts[1] : pts[pts.length - 2];
      const below = neighbour.y < q.y - 6;
      text(k, `${fmt(q.p.value, 1)} ${pr.unit}`, q.x, below ? q.y + 62 : q.y - 34, { size: 32, weight: 800, align: i === 0 ? 'left' : 'right' });
    }
  });
  text(k, pts[0].p.label, x0, y + ch - 36, { size: 26, weight: 600, color: pal.soft });
  text(k, pts[pts.length - 1].p.label, x1, y + ch - 36, { size: 26, weight: 600, color: pal.soft, align: 'right' });
  footer(k);
}

function tMilestone(k: Kit) {
  const { ctx, H, pal, data } = k; const m = data.milestone;
  background(k);
  header(k, data.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase());
  if (!m) { footer(k); return; }
  // El anillo ocupa el hueco entre la cabecera y el pie, sea cual sea el formato.
  const tall = H > 1500; const labelGap = tall ? 150 : 118;
  const top0 = P + 54 + (k.opts.show.name ? 110 : 50);
  const sub = data.caption?.trim() || m.sub;
  const avail = contentBottom(k) - top0 - labelGap - (sub ? 62 : 0);
  const R = Math.max(120, Math.min(360, avail / 2)); const cy = top0 + avail / 2;
  // Anillos de celebración
  for (let i = 3; i >= 1; i--) { ctx.beginPath(); ctx.arc(W / 2, cy, R + i * 46, 0, Math.PI * 2); ctx.lineWidth = 2; ctx.strokeStyle = pal.line; ctx.stroke(); }
  ctx.beginPath(); ctx.arc(W / 2, cy, R, 0, Math.PI * 2); ctx.lineWidth = 22; ctx.strokeStyle = pal.line; ctx.stroke();
  ctx.beginPath(); ctx.arc(W / 2, cy, R, -Math.PI / 2, Math.PI * 1.32); ctx.lineCap = 'round'; ctx.strokeStyle = accentGradient(k, W / 2 - R, W / 2 + R); ctx.stroke();
  const t = fitLines(k, m.value, R * 1.5, 1, R * 0.95, 80);
  text(k, m.value, W / 2, cy + t.size * 0.34, { size: t.size, weight: 800, align: 'center' });
  const ly = cy + R + labelGap;
  text(k, kicker(k, m.label), W / 2, ly, { size: 40, weight: 800, color: pal.accent, align: 'center', ls: 6, max: W - 2 * P });
  if (sub) text(k, sub, W / 2, ly + 62, { size: 36, weight: 500, color: pal.soft, align: 'center', max: W - 2 * P });
  if (k.opts.show.name) text(k, data.userName, W / 2, cy - R - (tall ? 110 : 62), { size: 44, weight: 700, align: 'center', max: W - 2 * P });
  footer(k);
}

/** Pegatina: fondo transparente para ponerla encima de una foto o historia propia. */
function tSticker(k: Kit) {
  const { ctx, H, data } = k;
  ctx.clearRect(0, 0, W, H);
  const pal: Palette = { ...k.pal }; const kk: Kit = { ...k, pal };
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 22; ctx.shadowOffsetY = 4;
  const list = stats(kk).slice(0, 3);
  const blockH = 70 + 40 + 2 * 110 + (list.length ? 210 : 0) + 140; let y = (H - blockH) / 2;
  const w = logo(ctx, P, y, 70); text(kk, 'Fit K', P + w + 20, y + 58, { size: 52, weight: 800 });
  y += 70 + 60;
  const t = fitLines(kk, data.title, W - 2 * P, 2, 110, 64);
  for (const line of t.lines) { y += t.size * 1.14; text(kk, line, P, y, { size: t.size, weight: 800, max: W - 2 * P }); }
  y += 56;
  if (list.length) { y += statRow(kk, list, P, y, W - 2 * P, 120) + 50; }
  text(kk, data.host, P, y + 34, { size: 40, weight: 800, color: pal.accent, max: W - 2 * P });
  text(kk, TAGLINE, P, y + 86, { size: 30, weight: 500, color: pal.soft });
  ctx.restore();
}

/** Dibuja la tarjeta en el canvas (que ya debe tener el tamaño del formato). */
export function renderShareCard(ctx: Ctx, data: ShareData, opts: ShareOptions, family: string) {
  const size = FORMATS.find(f => f.id === opts.format)!.size;
  const H = opts.template === 'sticker' ? 1080 : size[1];
  const usePhoto = !!opts.photo && opts.template !== 'sticker';
  const sticker = opts.template === 'sticker';
  const pal = sticker ? buildPalette({ ...opts, theme: 'noche' }, true) : buildPalette(opts, usePhoto);
  const fam = FONTS.find(f => f.id === opts.font)?.stack ?? family;
  const k: Kit = { ctx, H, pal, family: fam, data, opts: { ...opts, photo: usePhoto ? opts.photo : null }, shadow: usePhoto };
  ctx.save(); ctx.clearRect(0, 0, W, H);
  ({ session: tSession, photo: tPhoto, note: tNote, week: tWeek, progress: tProgress, milestone: tMilestone, sticker: tSticker })[opts.template](k);
  ctx.restore();
}
/** Tamaño del lienzo para una plantilla y formato. */
export function shareCardSize(template: ShareTemplate, format: ShareFormat): [number, number] {
  return template === 'sticker' ? [1080, 1080] : FORMATS.find(f => f.id === format)!.size;
}
