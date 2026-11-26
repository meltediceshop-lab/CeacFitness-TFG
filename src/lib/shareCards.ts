// Tarjetas para compartir fuera de Fit K (historias de Instagram, WhatsApp…).
// Se dibujan directamente en un <canvas> para que la imagen exportada sea
// idéntica a la vista previa en cualquier navegador. Todas llevan la marca
// (logo, lema y dirección de la app): son la publicidad de Fit K.

export type ShareTemplate = 'session' | 'photo' | 'week' | 'progress' | 'milestone' | 'sticker';
export type ShareFormat = 'story' | 'post' | 'square';
export type ShareTheme = 'esmeralda' | 'noche' | 'claro' | 'menta';

export const TEMPLATES: { id: ShareTemplate; label: string; hint: string }[] = [
  { id: 'session', label: 'Sesión', hint: 'Cifras y gráfico por zona' },
  { id: 'photo', label: 'Foto', hint: 'Tu foto con las cifras encima' },
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
  { id: 'claro', label: 'Claro', swatch: ['#fbfcfa', '#059669'] },
  { id: 'menta', label: 'Menta', swatch: ['#a7f3d0', '#047857'] },
];

export interface ShareWeekDay { letter: string; date: number; planned: boolean; done: boolean; today: boolean; sets: number }
export interface ShareData {
  userName: string;
  title: string;
  caption?: string;
  date: Date;
  minutes?: number;
  exercises?: number;
  sets?: number;
  volumeKg?: number;
  /** Series por zona (gráfico de barras). */
  muscles?: { label: string; sets: number }[];
  /** Ejercicios destacados de la sesión. */
  topExercises?: { name: string; detail: string }[];
  week?: { days: ShareWeekDay[]; done: number; total: number; minutes: number; sets: number; range: string };
  progress?: { exercise: string; unit: string; points: { label: string; value: number }[] };
  milestone?: { value: string; label: string; sub?: string };
  /** Dirección de la app que aparece en el pie. */
  host: string;
}
export interface ShareOptions {
  template: ShareTemplate;
  format: ShareFormat;
  theme: ShareTheme;
  photo?: CanvasImageSource | null;
  show: { minutes: boolean; exercises: boolean; sets: boolean; volume: boolean; name: boolean; chart: boolean };
}

interface Palette { bg: [string, string, string]; ink: string; soft: string; accent: string; accent2: string; panel: string; line: string; dark: boolean }
const PALETTES: Record<ShareTheme, Palette> = {
  esmeralda: { bg: ['#022c22', '#064e3b', '#047857'], ink: '#ffffff', soft: 'rgba(255,255,255,0.68)', accent: '#6ee7b7', accent2: '#22d3ee', panel: 'rgba(255,255,255,0.09)', line: 'rgba(255,255,255,0.18)', dark: true },
  noche: { bg: ['#050505', '#0c1210', '#111827'], ink: '#ffffff', soft: 'rgba(255,255,255,0.62)', accent: '#34d399', accent2: '#22d3ee', panel: 'rgba(255,255,255,0.07)', line: 'rgba(255,255,255,0.14)', dark: true },
  claro: { bg: ['#fbfcfa', '#f1f6f3', '#dff3ea'], ink: '#0c0a09', soft: 'rgba(28,25,23,0.6)', accent: '#059669', accent2: '#0891b2', panel: 'rgba(255,255,255,0.8)', line: 'rgba(0,0,0,0.09)', dark: false },
  menta: { bg: ['#d1fae5', '#a7f3d0', '#6ee7b7'], ink: '#022c22', soft: 'rgba(2,44,34,0.66)', accent: '#047857', accent2: '#0e7490', panel: 'rgba(255,255,255,0.55)', line: 'rgba(2,44,34,0.14)', dark: false },
};
const PHOTO_PALETTE: Palette = { bg: ['#000', '#000', '#000'], ink: '#ffffff', soft: 'rgba(255,255,255,0.8)', accent: '#6ee7b7', accent2: '#22d3ee', panel: 'rgba(0,0,0,0.38)', line: 'rgba(255,255,255,0.22)', dark: true };

const W = 1080;
const P = 72; // margen
const fmt = (n: number, d = 0) => n.toLocaleString('es-ES', { maximumFractionDigits: d });
// Contorno de la «K» del logo (public/icon.svg)
const LOGO = 'M198.72-164.06L324.02 0L227.43 0L136.17-122.23L117.71-99.87L117.71 0L38.96 0L38.96-305.36L117.71-305.36L117.71-167.14L226.82-305.36L318.08-305.36Z';

type Ctx = CanvasRenderingContext2D;
interface Kit { ctx: Ctx; H: number; pal: Palette; family: string; data: ShareData; opts: ShareOptions }

function font(k: Kit, size: number, weight = 600) { k.ctx.font = `${weight} ${size}px ${k.family}`; }
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
  ctx.fillText(out, x, y);
  spacing(ctx, 0);
}
/** Ajusta un título al ancho: reduce el tamaño y parte en líneas. */
function fitLines(k: Kit, s: string, max: number, maxLines: number, start: number, min: number, weight = 800): { size: number; lines: string[] } {
  for (let size = start; size >= min; size -= 4) {
    font(k, size, weight);
    const words = s.split(/\s+/); const lines: string[] = []; let cur = '';
    for (const w of words) {
      const next = cur ? `${cur} ${w}` : w;
      if (k.ctx.measureText(next).width <= max) cur = next; else { if (cur) lines.push(cur); cur = w; }
    }
    if (cur) lines.push(cur);
    if (lines.length <= maxLines && lines.every(l => k.ctx.measureText(l).width <= max)) return { size, lines };
  }
  font(k, min, weight);
  return { size: min, lines: [s] };
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
    const s = Math.max(W / iw, H / ih);
    ctx.drawImage(img, (W - iw * s) / 2, (H - ih * s) / 2, iw * s, ih * s);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, 'rgba(0,0,0,0.55)'); g.addColorStop(0.3, 'rgba(0,0,0,0.12)'); g.addColorStop(0.55, 'rgba(0,0,0,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0.9)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    return;
  }
  const g = ctx.createLinearGradient(0, 0, W * 0.6, H);
  g.addColorStop(0, pal.bg[0]); g.addColorStop(0.55, pal.bg[1]); g.addColorStop(1, pal.bg[2]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // Brillo de color arriba a la derecha
  const glow = ctx.createRadialGradient(W * 0.95, H * 0.04, 0, W * 0.95, H * 0.04, W * 0.9);
  glow.addColorStop(0, pal.dark ? 'rgba(52,211,153,0.34)' : 'rgba(16,185,129,0.22)'); glow.addColorStop(1, 'rgba(16,185,129,0)');
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
function footer(k: Kit) {
  const { ctx, H, pal, data } = k;
  const y = H - P;
  ctx.fillStyle = pal.line; ctx.fillRect(P, y - 58, W - 2 * P, 2);
  text(k, 'Entrena tu cuerpo. Cuida tu cabeza.', P, y, { size: 28, weight: 500, color: pal.soft });
  text(k, data.host, W - P, y, { size: 28, weight: 700, color: pal.accent, align: 'right' });
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
  list.forEach((s, i) => {
    const cx = x + col * i;
    if (i > 0) { ctx.fillStyle = pal.line; ctx.fillRect(cx - 1, y + 8, 2, size + 44); }
    const px = cx + (i > 0 ? 28 : 0);
    font(k, size, 800);
    const vw = ctx.measureText(s.value).width;
    text(k, s.value, px, y + size, { size, weight: 800 });
    if (s.unit) text(k, s.unit, px + vw + 8, y + size, { size: size * 0.36, weight: 700, color: pal.soft });
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
  text(k, 'ENTRENO COMPLETADO', P, y, { size: 28, weight: 700, color: pal.accent, ls: 6 });
  const t = fitLines(k, data.title, W - 2 * P, 2, tall ? 116 : 96, 60);
  y += 30;
  for (const line of t.lines) { y += t.size * 1.04; text(k, line, P, y, { size: t.size, weight: 800 }); }
  if (opts.show.name) { y += 58; text(k, data.caption?.trim() || `${data.userName} · con su plan de Fit K`, P, y, { size: 34, weight: 500, color: pal.soft, max: W - 2 * P }); }
  y += tall ? 90 : 56;
  const list = stats(k);
  if (list.length === 4 && tall) {
    y += statRow(k, list.slice(0, 2), P, y, W - 2 * P, 128) + 44;
    y += statRow(k, list.slice(2), P, y, W - 2 * P, 128);
  } else y += statRow(k, list, P, y, W - 2 * P, list.length > 3 ? 84 : mid ? 112 : 96);
  const bottom = H - P - 100;
  if (opts.show.chart && data.muscles?.length) {
    const rows = Math.min(5, data.muscles.length, Math.floor((bottom - y - 60 - 120) / 62));
    if (rows >= 2) { y += tall ? 70 : 48; y += barChart(k, data.muscles.slice(0, rows), P, y, W - 2 * P, 'Series por zona'); }
  }
  if (data.topExercises?.length && bottom - y > 250) {
    y += 64; text(k, 'LO MÁS DESTACADO', P, y, { size: 24, weight: 700, color: pal.soft, ls: 3 });
    for (const e of data.topExercises.slice(0, Math.floor((bottom - y - 20) / 62))) {
      y += 62; text(k, e.name, P, y, { size: 34, weight: 600, max: W - 2 * P - 260 });
      text(k, e.detail, W - P, y, { size: 32, weight: 700, color: pal.accent, align: 'right' });
    }
  }
  footer(k);
}

function tPhoto(k: Kit) {
  const { H, pal, data, opts } = k;
  background(k);
  header(k);
  const list = stats(k).slice(0, 3);
  let y = H - P - 110 - (list.length ? 190 : 0);
  if (opts.show.name) { text(k, data.caption?.trim() || data.userName, P, y - 4, { size: 34, weight: 500, color: pal.soft, max: W - 2 * P }); y -= 60; }
  const t = fitLines(k, data.title, W - 2 * P, 2, 104, 60);
  for (const line of [...t.lines].reverse()) { text(k, line, P, y, { size: t.size, weight: 800 }); y -= t.size * 1.04; }
  text(k, 'ENTRENO COMPLETADO', P, y - 8, { size: 28, weight: 700, color: pal.accent, ls: 6 });
  if (list.length) statRow(k, list, P, H - P - 110 - 150, W - 2 * P, 92);
  footer(k);
}

function tWeek(k: Kit) {
  const { ctx, H, pal, data } = k; const wk = data.week; const tall = H > 1500; const mid = H > 1200;
  background(k);
  header(k, wk?.range.toUpperCase());
  if (!wk) { footer(k); return; }
  let y = P + 54 + (tall ? 170 : mid ? 100 : 70);
  text(k, 'MI SEMANA', P, y, { size: 28, weight: 700, color: pal.accent, ls: 6 });
  y += 30 + 150; text(k, `${wk.done} de ${wk.total}`, P, y, { size: 150, weight: 800 });
  y += 62; text(k, wk.done >= wk.total ? 'Semana completa. Así se construye.' : 'sesiones hechas. Sigo sumando.', P, y, { size: 38, weight: 500, color: pal.soft });
  // Calendario de la semana
  y += tall ? 100 : 64; const pw = W - 2 * P; const ph = 250; panel(k, P, y, pw, ph);
  const col = (pw - 60) / 7;
  wk.days.forEach((d, i) => {
    const cx = P + 30 + col * i + col / 2; const cy = y + 150;
    text(k, d.letter, cx, y + 70, { size: 28, weight: 700, color: d.today ? pal.accent : pal.soft, align: 'center' });
    ctx.beginPath(); ctx.arc(cx, cy, 46, 0, Math.PI * 2);
    if (d.done) { ctx.fillStyle = accentGradient(k, cx - 46, cx + 46); ctx.fill(); }
    else if (d.planned) { ctx.lineWidth = 4; ctx.strokeStyle = pal.accent; ctx.stroke(); }
    else { ctx.fillStyle = pal.line; ctx.fill(); }
    text(k, String(d.date), cx, cy + 13, { size: 36, weight: 800, color: d.done ? (pal.dark ? '#022c22' : '#ffffff') : d.planned ? pal.ink : pal.soft, align: 'center' });
  });
  y += ph + (tall ? 80 : 50);
  const list: Stat[] = [{ value: fmt(wk.minutes), unit: 'min', label: 'Tiempo' }, { value: fmt(wk.sets), unit: '', label: 'Series' }];
  if (data.volumeKg) list.push({ value: fmt(data.volumeKg >= 10000 ? data.volumeKg / 1000 : data.volumeKg, data.volumeKg >= 10000 ? 1 : 0), unit: data.volumeKg >= 10000 ? 't' : 'kg', label: 'Volumen' });
  y += statRow(k, list, P, y, pw, mid ? 112 : 92);
  // Barras por día
  const bottom = H - P - 100;
  if (k.opts.show.chart && bottom - y > 360) {
    y += 70; const ch = Math.min(420, bottom - y - 20); panel(k, P, y, pw, ch);
    text(k, 'SERIES POR DÍA', P + 44, y + 64, { size: 24, weight: 700, color: pal.soft, ls: 3 });
    const max = Math.max(...wk.days.map(d => d.sets), 1); const base = y + ch - 70; const top = y + 100;
    wk.days.forEach((d, i) => {
      const cx = P + 30 + col * i + col / 2; const bh = Math.max(d.sets ? 20 : 8, (base - top) * (d.sets / max));
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
  text(k, 'MI PROGRESO', P, y, { size: 28, weight: 700, color: pal.accent, ls: 6 });
  const t = fitLines(k, pr.exercise, W - 2 * P, 2, 92, 56);
  y += 24; for (const line of t.lines) { y += t.size * 1.04; text(k, line, P, y, { size: t.size, weight: 800 }); }
  y += tall ? 190 : 150;
  const big = `${delta >= 0 ? '+' : '−'}${fmt(Math.abs(delta), 1)}`;
  font(k, 170, 800); const bw = ctx.measureText(big).width;
  ctx.fillStyle = accentGradient(k, P, P + bw); ctx.textAlign = 'left'; ctx.fillText(big, P, y);
  text(k, pr.unit, P + bw + 14, y, { size: 64, weight: 700, color: pal.soft });
  y += 62; text(k, `De ${fmt(first, 1)} a ${fmt(last, 1)} ${pr.unit} en ${pr.points.length} sesiones`, P, y, { size: 36, weight: 500, color: pal.soft });
  // Gráfica de línea
  y += tall ? 80 : 50; const bottom = H - P - 110; const ch = Math.min(640, bottom - y); if (ch < 260) { footer(k); return; }
  const pw = W - 2 * P; panel(k, P, y, pw, ch);
  const x0 = P + 70, x1 = P + pw - 70, y0 = y + 90, y1 = y + ch - 100;
  const min = Math.min(...pr.points.map(p => p.value)), max = Math.max(...pr.points.map(p => p.value)); const span = max - min || 1;
  const pts = pr.points.map((p, i) => ({ x: x0 + (x1 - x0) * (i / (pr.points.length - 1)), y: y1 - (y1 - y0) * ((p.value - min) / span), p }));
  const area = ctx.createLinearGradient(0, y0, 0, y1 + 40); area.addColorStop(0, pal.dark ? 'rgba(52,211,153,0.38)' : 'rgba(16,185,129,0.28)'); area.addColorStop(1, 'rgba(16,185,129,0)');
  ctx.beginPath(); ctx.moveTo(pts[0].x, y1 + 40); pts.forEach(q => ctx.lineTo(q.x, q.y)); ctx.lineTo(pts[pts.length - 1].x, y1 + 40); ctx.closePath(); ctx.fillStyle = area; ctx.fill();
  ctx.beginPath(); pts.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)));
  ctx.lineWidth = 10; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = accentGradient(k, x0, x1); ctx.stroke();
  pts.forEach((q, i) => {
    const edge = i === 0 || i === pts.length - 1;
    ctx.beginPath(); ctx.arc(q.x, q.y, edge ? 18 : 11, 0, Math.PI * 2); ctx.fillStyle = pal.dark ? '#022c22' : '#ffffff'; ctx.fill();
    ctx.lineWidth = edge ? 8 : 6; ctx.strokeStyle = pal.accent; ctx.stroke();
    if (edge) text(k, `${fmt(q.p.value, 1)} ${pr.unit}`, q.x, q.y - 34, { size: 32, weight: 800, align: i === 0 ? 'left' : 'right' });
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
  const cy = H * 0.46; const R = Math.min(360, H * 0.24);
  // Anillos de celebración
  for (let i = 3; i >= 1; i--) { ctx.beginPath(); ctx.arc(W / 2, cy, R + i * 46, 0, Math.PI * 2); ctx.lineWidth = 2; ctx.strokeStyle = pal.line; ctx.stroke(); }
  ctx.beginPath(); ctx.arc(W / 2, cy, R, 0, Math.PI * 2); ctx.lineWidth = 22; ctx.strokeStyle = pal.line; ctx.stroke();
  ctx.beginPath(); ctx.arc(W / 2, cy, R, -Math.PI / 2, Math.PI * 1.32); ctx.lineCap = 'round'; ctx.strokeStyle = accentGradient(k, W / 2 - R, W / 2 + R); ctx.stroke();
  const t = fitLines(k, m.value, R * 1.5, 1, R * 0.95, 80);
  text(k, m.value, W / 2, cy + t.size * 0.34, { size: t.size, weight: 800, align: 'center' });
  const ly = cy + R + 150;
  text(k, m.label.toUpperCase(), W / 2, ly, { size: 40, weight: 800, color: pal.accent, align: 'center', ls: 6 });
  if (m.sub) text(k, m.sub, W / 2, ly + 62, { size: 36, weight: 500, color: pal.soft, align: 'center', max: W - 2 * P });
  if (k.opts.show.name) text(k, data.userName, W / 2, cy - R - 110, { size: 44, weight: 700, align: 'center' });
  footer(k);
}

/** Pegatina: fondo transparente para ponerla encima de una foto o historia propia. */
function tSticker(k: Kit) {
  const { ctx, H, data } = k;
  ctx.clearRect(0, 0, W, H);
  const pal: Palette = { ...PHOTO_PALETTE }; const kk: Kit = { ...k, pal };
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 22; ctx.shadowOffsetY = 4;
  const list = stats(kk).slice(0, 3);
  const blockH = 70 + 40 + 2 * 110 + (list.length ? 210 : 0) + 90; let y = (H - blockH) / 2;
  const w = logo(ctx, P, y, 70); text(kk, 'Fit K', P + w + 20, y + 58, { size: 52, weight: 800 });
  y += 70 + 60;
  const t = fitLines(kk, data.title, W - 2 * P, 2, 110, 64);
  for (const line of t.lines) { y += t.size * 1.04; text(kk, line, P, y, { size: t.size, weight: 800 }); }
  y += 56;
  if (list.length) { y += statRow(kk, list, P, y, W - 2 * P, 120) + 50; }
  text(kk, data.host, P, y + 30, { size: 34, weight: 700, color: pal.accent });
  ctx.restore();
}

/** Dibuja la tarjeta en el canvas (que ya debe tener el tamaño del formato). */
export function renderShareCard(ctx: Ctx, data: ShareData, opts: ShareOptions, family: string) {
  const size = FORMATS.find(f => f.id === opts.format)!.size;
  const H = opts.template === 'sticker' ? 1080 : size[1];
  const usePhoto = !!opts.photo && opts.template !== 'sticker';
  const k: Kit = { ctx, H, pal: usePhoto ? PHOTO_PALETTE : PALETTES[opts.theme], family, data, opts: { ...opts, photo: usePhoto ? opts.photo : null } };
  ctx.save(); ctx.clearRect(0, 0, W, H);
  ({ session: tSession, photo: tPhoto, week: tWeek, progress: tProgress, milestone: tMilestone, sticker: tSticker })[opts.template](k);
  ctx.restore();
}
/** Tamaño del lienzo para una plantilla y formato. */
export function shareCardSize(template: ShareTemplate, format: ShareFormat): [number, number] {
  return template === 'sticker' ? [1080, 1080] : FORMATS.find(f => f.id === format)!.size;
}
