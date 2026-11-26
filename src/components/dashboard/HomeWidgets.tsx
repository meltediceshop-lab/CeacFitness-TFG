'use client';

// Secciones propias de la pantalla de inicio: cada persona añade las que quiera
// (reloj, métricas, objetivos, cuenta atrás…), las edita y las ordena.
// Se guardan en este dispositivo, una lista por usuario.

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Clock, Activity, Target, CalendarClock, StickyNote, CalendarDays, Play, MoreHorizontal,
  ChevronUp, ChevronDown, Trash2, Check, Flame, Dumbbell, Scale, Timer, Trophy, BarChart2, type LucideIcon,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { canonicalExerciseId } from '@/lib/fitkMotor';
import { weekStart } from '@/lib/weekCalendar';
import type { WeeklySession } from '@/types/user';

// ── Modelo ───────────────────────────────────────────────────────────
export type WidgetType = 'clock' | 'metric' | 'goal' | 'countdown' | 'week' | 'next' | 'note';
type MetricId = 'weight' | 'streak' | 'total' | 'volume' | 'week' | 'minutes' | 'month' | 'exercise';
type ColorId = 'verde' | 'cian' | 'azul' | 'violeta' | 'rosa' | 'naranja' | 'ambar' | 'grafito';

interface WidgetSettings {
  clockStyle?: 'analog' | 'digital' | 'ring';
  seconds?: boolean;
  metric?: MetricId;
  exercise?: string;
  target?: number;
  date?: string;
  label?: string;
  text?: string;
  startedAt?: string;
}
export interface HomeWidget {
  id: string;
  type: WidgetType;
  title: string;
  color: ColorId;
  look: 'glass' | 'solid';
  size: 'half' | 'full';
  settings: WidgetSettings;
}
export interface HomeStats {
  weekStreak: number;
  totalCompleted: number;
  totalVolume: number;
  /** Peso de más antiguo a más reciente. */
  weights: { date: string; value: number }[];
  currentWeight?: number;
  nextSession: WeeklySession | null;
  onStartSession: (s: WeeklySession) => void;
}

const COLORS: Record<ColorId, { label: string; hex: string; deep: string }> = {
  verde: { label: 'Verde', hex: '#10b981', deep: '#047857' },
  cian: { label: 'Cian', hex: '#06b6d4', deep: '#0e7490' },
  azul: { label: 'Azul', hex: '#3b82f6', deep: '#1d4ed8' },
  violeta: { label: 'Violeta', hex: '#8b5cf6', deep: '#6d28d9' },
  rosa: { label: 'Rosa', hex: '#ec4899', deep: '#be185d' },
  naranja: { label: 'Naranja', hex: '#f97316', deep: '#c2410c' },
  ambar: { label: 'Ámbar', hex: '#f59e0b', deep: '#b45309' },
  grafito: { label: 'Grafito', hex: '#71717a', deep: '#27272a' },
};

const METRICS: { id: MetricId; label: string; icon: LucideIcon }[] = [
  { id: 'weight', label: 'Peso', icon: Scale },
  { id: 'streak', label: 'Racha de semanas', icon: Flame },
  { id: 'total', label: 'Entrenos totales', icon: Dumbbell },
  { id: 'week', label: 'Entrenos esta semana', icon: CalendarDays },
  { id: 'month', label: 'Entrenos este mes', icon: CalendarDays },
  { id: 'minutes', label: 'Minutos esta semana', icon: Timer },
  { id: 'volume', label: 'Kilos movidos', icon: BarChart2 },
  { id: 'exercise', label: 'Mejor marca de un ejercicio', icon: Trophy },
];

const TEMPLATES: { type: WidgetType; name: string; hint: string; icon: LucideIcon; make: () => Omit<HomeWidget, 'id'> }[] = [
  { type: 'clock', name: 'Reloj', hint: 'Analógico, digital o el anillo del día', icon: Clock,
    make: () => ({ type: 'clock', title: 'Ahora', color: 'verde', look: 'glass', size: 'half', settings: { clockStyle: 'analog', seconds: true } }) },
  { type: 'metric', name: 'Métrica', hint: 'Un número tuyo con su gráfica', icon: Activity,
    make: () => ({ type: 'metric', title: 'Peso', color: 'azul', look: 'glass', size: 'half', settings: { metric: 'weight' } }) },
  { type: 'goal', name: 'Objetivo', hint: 'Anillo de progreso hacia una meta', icon: Target,
    make: () => ({ type: 'goal', title: 'Entrenos del mes', color: 'violeta', look: 'solid', size: 'half', settings: { metric: 'month', target: 12 } }) },
  { type: 'countdown', name: 'Cuenta atrás', hint: 'Días hasta tu carrera, viaje o reto', icon: CalendarClock,
    make: () => {
      const d = new Date(); d.setDate(d.getDate() + 30);
      return { type: 'countdown', title: 'Mi reto', color: 'naranja', look: 'solid', size: 'half', settings: { date: d.toISOString().slice(0, 10), label: 'Carrera 10K', startedAt: new Date().toISOString() } };
    } },
  { type: 'week', name: 'Mi semana', hint: 'Qué días has entrenado', icon: CalendarDays,
    make: () => ({ type: 'week', title: 'Mi semana', color: 'verde', look: 'glass', size: 'full', settings: {} }) },
  { type: 'next', name: 'Próximo entreno', hint: 'Tu siguiente sesión, a un toque', icon: Play,
    make: () => ({ type: 'next', title: 'Próximo entreno', color: 'cian', look: 'solid', size: 'full', settings: {} }) },
  { type: 'note', name: 'Nota', hint: 'Tu frase o recordatorio', icon: StickyNote,
    make: () => ({ type: 'note', title: 'Recuerda', color: 'ambar', look: 'glass', size: 'full', settings: { text: 'Constancia antes que intensidad.' } }) },
];

const uid = () => Math.random().toString(36).slice(2, 10);
const fmtNum = (n: number, d = 0) => n.toLocaleString('es-ES', { maximumFractionDigits: d, minimumFractionDigits: 0 });

// ── Guardado ─────────────────────────────────────────────────────────
function useStoredWidgets(userId: string) {
  const key = `fitk-home-widgets:${userId}`;
  const [widgets, setWidgets] = useState<HomeWidget[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      setWidgets(Array.isArray(parsed) ? parsed.filter(w => w && TEMPLATES.some(t => t.type === w.type)) : []);
    } catch { setWidgets([]); }
    setLoaded(true);
  }, [key]);
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(key, JSON.stringify(widgets)); } catch { /* sin almacenamiento */ }
  }, [key, widgets, loaded]);
  return [widgets, setWidgets] as const;
}

/** Hora actual que se actualiza sola (cada segundo o cada 20 s). */
function useNow(everySecond: boolean) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), everySecond ? 1000 : 20000);
    return () => clearInterval(id);
  }, [everySecond]);
  return now;
}

// ── Datos para las métricas ──────────────────────────────────────────
interface Derived {
  weekDone: number; weekTotal: number; weekMinutes: number; monthDone: number;
  weekDays: { letter: string; date: number; done: boolean; planned: boolean; today: boolean }[];
  bests: Map<string, { name: string; best: number; series: number[] }>;
}
function useDerived(): Derived {
  const { user, exerciseLogs, getExerciseCatalog } = useApp();
  return useMemo(() => {
    const sessions = user?.weeklySessions ?? [];
    const done = sessions.filter(s => s.status === 'completed');
    const now = new Date();
    const history = (user?.weeklyHistory ?? []).flatMap(w => w.sessions ?? []);
    const allDone = [...done, ...history.filter(s => s.status === 'completed')];
    const monthDone = allDone.filter(s => {
      const d = s.completedAt ? new Date(s.completedAt) : null;
      return d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const start = weekStart(now);
    const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((letter, i) => {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const isDone = allDone.some(s => s.completedAt && new Date(s.completedAt).toDateString() === d.toDateString());
      const planned = sessions.some(s => s.status !== 'completed' && s.dayOfWeek === i);
      return { letter, date: d.getDate(), done: isDone, planned, today: d.toDateString() === now.toDateString() };
    });
    const names = new Map<string, string>();
    for (const e of getExerciseCatalog()) names.set(canonicalExerciseId(e.id), e.name);
    for (const s of sessions) for (const e of s.exercises) names.set(canonicalExerciseId(e.id), e.name);
    const byEx = new Map<string, { t: number; w: number }[]>();
    for (const l of exerciseLogs) {
      if (!l.weight) continue;
      const id = canonicalExerciseId(l.exerciseId);
      (byEx.get(id) ?? byEx.set(id, []).get(id)!).push({ t: new Date(l.timestamp).getTime(), w: l.weight });
    }
    const bests = new Map<string, { name: string; best: number; series: number[] }>();
    for (const [id, pts] of byEx) {
      pts.sort((a, b) => a.t - b.t);
      const perDay = new Map<string, number>();
      for (const p of pts) { const k = new Date(p.t).toDateString(); perDay.set(k, Math.max(perDay.get(k) ?? 0, p.w)); }
      bests.set(id, { name: names.get(id) ?? id, best: Math.max(...pts.map(p => p.w)), series: [...perDay.values()].slice(-12) });
    }
    return {
      weekDone: done.length, weekTotal: sessions.length,
      weekMinutes: done.reduce((m, s) => m + (s.actualMinutes ?? s.duration ?? 0), 0),
      monthDone, weekDays, bests,
    };
  }, [user, exerciseLogs, getExerciseCatalog]);
}

function metricValue(id: MetricId, s: WidgetSettings, stats: HomeStats, d: Derived): { value: number | null; text: string; unit: string; series?: number[]; sub?: string } {
  switch (id) {
    case 'weight': return { value: stats.currentWeight ?? null, text: stats.currentWeight != null ? fmtNum(stats.currentWeight, 1) : '—', unit: 'kg', series: stats.weights.map(w => w.value).slice(-12),
      sub: stats.weights.length >= 2 ? `${stats.weights[stats.weights.length - 1].value - stats.weights[stats.weights.length - 2].value >= 0 ? '+' : ''}${fmtNum(stats.weights[stats.weights.length - 1].value - stats.weights[stats.weights.length - 2].value, 1)} kg desde la anterior` : 'Registra tu peso en Métricas' };
    case 'streak': return { value: stats.weekStreak, text: fmtNum(stats.weekStreak), unit: stats.weekStreak === 1 ? 'semana' : 'semanas', sub: 'seguidas entrenando' };
    case 'total': return { value: stats.totalCompleted, text: fmtNum(stats.totalCompleted), unit: 'entrenos', sub: 'desde que empezaste' };
    case 'week': return { value: d.weekDone, text: `${d.weekDone}/${d.weekTotal}`, unit: '', sub: 'sesiones esta semana' };
    case 'month': return { value: d.monthDone, text: fmtNum(d.monthDone), unit: 'entrenos', sub: new Date().toLocaleDateString('es-ES', { month: 'long' }) };
    case 'minutes': return { value: d.weekMinutes, text: fmtNum(d.weekMinutes), unit: 'min', sub: 'entrenados esta semana' };
    case 'volume': return stats.totalVolume >= 1000
      ? { value: stats.totalVolume, text: fmtNum(stats.totalVolume / 1000, 1), unit: 't', sub: 'movidas en total' }
      : { value: stats.totalVolume, text: fmtNum(stats.totalVolume), unit: 'kg', sub: 'movidos en total' };
    case 'exercise': {
      const b = s.exercise ? d.bests.get(s.exercise) : [...d.bests.values()][0];
      return b ? { value: b.best, text: fmtNum(b.best, 1), unit: 'kg', series: b.series, sub: b.name } : { value: null, text: '—', unit: 'kg', sub: 'Registra pesos en tus entrenos' };
    }
  }
}

// ── Piezas visuales ──────────────────────────────────────────────────
function Spark({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data), span = max - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * 100, 34 - ((v - min) / span) * 28] as const);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-10" aria-hidden>
      <path d={`${line} L100,40 L0,40 Z`} fill={color} opacity={0.16} />
      <path d={line} fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={3} fill={color} />
    </svg>
  );
}
function Ring({ value, color, track, size = 84, stroke = 9, children }: { value: number; color: string; track: string; size?: number; stroke?: number; children?: React.ReactNode }) {
  const r = (size - stroke) / 2; const c = 2 * Math.PI * r; const v = Math.max(0, Math.min(1, value));
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - v)} style={{ transition: 'stroke-dashoffset 600ms ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}

function AnalogClock({ now, seconds, color, ink }: { now: Date; seconds: boolean; color: string; ink: string }) {
  const h = now.getHours() % 12, m = now.getMinutes(), s = now.getSeconds();
  const hand = (deg: number, len: number, w: number, c: string) => (
    <line x1={50} y1={50} x2={50 + len * Math.sin((deg * Math.PI) / 180)} y2={50 - len * Math.cos((deg * Math.PI) / 180)} stroke={c} strokeWidth={w} strokeLinecap="round" />
  );
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full max-w-[124px] max-h-[124px]" role="img" aria-label={now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}>
      <circle cx={50} cy={50} r={47} fill="none" stroke={ink} strokeOpacity={0.14} strokeWidth={1.5} />
      {Array.from({ length: 60 }, (_, i) => {
        const big = i % 5 === 0; const a = (i * 6 * Math.PI) / 180; const r1 = big ? 38 : 41.5, r2 = 44;
        return <line key={i} x1={50 + r1 * Math.sin(a)} y1={50 - r1 * Math.cos(a)} x2={50 + r2 * Math.sin(a)} y2={50 - r2 * Math.cos(a)} stroke={ink} strokeOpacity={big ? 0.75 : 0.25} strokeWidth={big ? 2 : 0.8} strokeLinecap="round" />;
      })}
      {hand(h * 30 + m * 0.5, 22, 4.2, ink)}
      {hand(m * 6 + s * 0.1, 33, 2.8, ink)}
      {seconds && hand(s * 6, 37, 1.2, color)}
      <circle cx={50} cy={50} r={3.2} fill={color} />
    </svg>
  );
}

function ClockFace({ w, solid, ink, color }: { w: HomeWidget; solid: boolean; ink: string; color: string }) {
  const seconds = w.settings.seconds ?? true;
  const now = useNow(seconds || w.settings.clockStyle === 'analog');
  const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const date = now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const style = w.settings.clockStyle ?? 'analog';
  const muted = solid ? 'rgba(255,255,255,0.75)' : undefined;
  if (style === 'digital') {
    return (
      <div className="flex-1 flex flex-col justify-end">
        <p className="font-semibold tabular-nums tracking-tight leading-none" style={{ fontSize: w.size === 'full' ? 64 : 44 }}>
          {time}{seconds && <span className="text-[0.4em] align-top ml-1" style={{ color: solid ? muted : color }}>{String(now.getSeconds()).padStart(2, '0')}</span>}
        </p>
        <p className="text-xs mt-2 first-letter:uppercase" style={{ color: muted }}>{date}</p>
      </div>
    );
  }
  if (style === 'ring') {
    const dayPct = (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) / 86400;
    return (
      <div className={`flex-1 flex items-center ${w.size === 'full' ? 'gap-5' : 'justify-center'}`}>
        <Ring value={dayPct} color={solid ? '#fff' : color} track={solid ? 'rgba(255,255,255,0.22)' : 'rgba(118,118,128,0.18)'} size={w.size === 'full' ? 112 : 104} stroke={8}>
          <span className="text-xl font-bold tabular-nums leading-none">{time}</span>
          <span className="text-[10px] mt-1" style={{ color: muted }}>{Math.round(dayPct * 100)}% del día</span>
        </Ring>
        {w.size === 'full' && <p className="text-sm first-letter:uppercase" style={{ color: muted }}>{date}</p>}
      </div>
    );
  }
  return (
    <div className={`flex-1 flex items-center ${w.size === 'full' ? 'gap-5' : 'justify-center'}`}>
      <div className="aspect-square h-[112px] flex items-center justify-center"><AnalogClock now={now} seconds={seconds} color={solid ? '#fff' : color} ink={ink} /></div>
      {w.size === 'full' && (
        <div>
          <p className="text-3xl font-semibold tabular-nums">{time}</p>
          <p className="text-sm first-letter:uppercase" style={{ color: muted }}>{date}</p>
        </div>
      )}
    </div>
  );
}

// ── Una sección ──────────────────────────────────────────────────────
function WidgetBody({ w, stats, d, preview }: { w: HomeWidget; stats: HomeStats; d: Derived; preview?: boolean }) {
  const c = COLORS[w.color] ?? COLORS.verde;
  const solid = w.look === 'solid';
  const accent = solid ? '#ffffff' : c.hex;
  const muted = solid ? 'text-white/75' : 'text-stone-500';
  const track = solid ? 'rgba(255,255,255,0.22)' : 'rgba(118,118,128,0.18)';

  switch (w.type) {
    case 'clock':
      return <ClockFace w={w} solid={solid} ink={solid ? '#ffffff' : '#57534e'} color={c.hex} />;
    case 'metric': {
      const m = metricValue(w.settings.metric ?? 'weight', w.settings, stats, d);
      return (
        <div className="flex-1 flex flex-col justify-end">
          {m.series && m.series.length >= 2 && <div className="mb-1"><Spark data={m.series} color={accent} /></div>}
          <p className="leading-none"><span className="text-[34px] font-bold tabular-nums tracking-tight">{m.text}</span>{m.unit && <span className={`text-sm font-semibold ml-1 ${muted}`}>{m.unit}</span>}</p>
          {m.sub && <p className={`text-xs mt-1.5 truncate first-letter:uppercase ${muted}`}>{m.sub}</p>}
        </div>
      );
    }
    case 'goal': {
      const metric = w.settings.metric ?? 'month';
      const m = metricValue(metric, w.settings, stats, d);
      const target = w.settings.target ?? 1;
      let pct = 0; let left = '';
      if (metric === 'weight' && m.value != null) {
        const start = stats.weights[0]?.value ?? m.value;
        const span = start - target;
        pct = span === 0 ? 1 : (start - m.value) / span;
        const diff = Math.abs(m.value - target);
        left = diff < 0.05 ? '¡Objetivo cumplido!' : `Te faltan ${fmtNum(diff, 1)} kg`;
      } else if (m.value != null) {
        pct = m.value / Math.max(target, 0.0001);
        const diff = target - m.value;
        left = diff <= 0 ? '¡Objetivo cumplido!' : `Te faltan ${fmtNum(diff, metric === 'exercise' ? 1 : 0)}${metric === 'exercise' ? ' kg' : ''}`;
      } else left = 'Aún no hay datos';
      const full = w.size === 'full';
      return (
        <div className={`flex-1 flex items-center ${full ? 'gap-5' : 'flex-col justify-center gap-2'}`}>
          <Ring value={pct} color={accent} track={track} size={full ? 96 : 88} stroke={9}>
            <span className="text-lg font-bold tabular-nums leading-none">{Math.round(Math.max(0, Math.min(1, pct)) * 100)}%</span>
          </Ring>
          <div className={full ? 'min-w-0' : 'text-center'}>
            <p className="text-sm font-semibold tabular-nums">{m.text}{m.unit && metric !== 'week' ? ` ${m.unit}` : ''} <span className={muted}>/ {fmtNum(target, 1)}</span></p>
            <p className={`text-xs ${muted}`}>{left}</p>
          </div>
        </div>
      );
    }
    case 'countdown': {
      const target = w.settings.date ? new Date(`${w.settings.date}T00:00:00`) : new Date();
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const days = Math.round((target.getTime() - today.getTime()) / 86_400_000);
      const started = w.settings.startedAt ? new Date(w.settings.startedAt) : today;
      const total = Math.max(1, (target.getTime() - started.getTime()) / 86_400_000);
      const pct = 1 - Math.max(0, days) / total;
      return (
        <div className="flex-1 flex flex-col justify-end">
          <p className={`text-xs font-semibold uppercase tracking-wide ${muted}`}>{w.settings.label || 'Cuenta atrás'}</p>
          <p className="leading-none mt-1">
            <span className="text-[40px] font-bold tabular-nums tracking-tight">{days > 0 ? days : days === 0 ? '¡Hoy!' : '✓'}</span>
            {days > 0 && <span className={`text-sm font-semibold ml-1.5 ${muted}`}>{days === 1 ? 'día' : 'días'}</span>}
          </p>
          <div className="mt-2.5 h-1.5 rounded-full overflow-hidden" style={{ background: track }}>
            <div className="h-full rounded-full" style={{ width: `${Math.round(Math.max(0.03, Math.min(1, pct)) * 100)}%`, background: accent }} />
          </div>
          <p className={`text-[11px] mt-1.5 ${muted}`}>{target.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      );
    }
    case 'week':
      return (
        <div className="flex-1 flex flex-col justify-end">
          <p className={`text-xs mb-2.5 ${muted}`}>{d.weekDone} de {d.weekTotal} sesiones · {fmtNum(d.weekMinutes)} min</p>
          <div className="grid grid-cols-7 gap-1.5">
            {d.weekDays.map(day => (
              <div key={day.letter} className="flex flex-col items-center gap-1">
                <span className={`text-[10px] font-semibold ${muted}`}>{day.letter}</span>
                <span className={`w-9 h-9 rounded-full flex items-center justify-center text-xs tabular-nums ${day.today ? 'font-black' : 'font-bold'}`}
                  style={{
                    background: day.done ? accent : day.planned ? 'transparent' : track,
                    color: day.done ? (solid ? c.deep : '#fff') : day.today ? accent : undefined,
                    // Planificado: aro del color. Hoy: además un halo suave alrededor.
                    boxShadow: [day.planned && !day.done ? `inset 0 0 0 2px ${accent}` : '', day.today ? `0 0 0 3px ${solid ? 'rgba(255,255,255,0.35)' : `${c.hex}40`}` : ''].filter(Boolean).join(', ') || undefined,
                  }}>
                  {day.done ? <Check className="w-4 h-4" strokeWidth={3} /> : day.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    case 'next': {
      const s = stats.nextSession;
      if (!s) return <div className="flex-1 flex items-end"><p className={`text-sm ${muted}`}>No te queda ninguna sesión esta semana. ¡Buen trabajo!</p></div>;
      return (
        <div className="flex-1 flex items-end gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xl font-bold leading-tight truncate">{s.name}</p>
            <p className={`text-xs mt-1 ${muted}`}>{s.duration} min · {s.exercises.length} ejercicios</p>
          </div>
          {React.createElement(preview ? 'span' : 'button', {
            ...(preview ? {} : { type: 'button', onClick: (e: React.MouseEvent) => { e.stopPropagation(); stats.onStartSession(s); } }),
            className: 'h-11 px-4 rounded-full font-semibold text-sm flex items-center gap-1.5 flex-shrink-0 active:scale-95 transition-transform',
            style: { background: solid ? '#fff' : c.hex, color: solid ? c.deep : '#fff' },
          }, <Play className="w-4 h-4" fill="currentColor" />, 'Empezar')}
        </div>
      );
    }
    case 'note':
      return (
        <div className="flex-1 flex items-end">
          <p className="text-lg font-semibold leading-snug [text-wrap:balance]" style={{ color: solid ? '#fff' : undefined }}>
            <span style={{ color: accent }} className="text-2xl font-black mr-1">“</span>{w.settings.text || 'Escribe aquí tu frase.'}
          </p>
        </div>
      );
  }
  return null;
}

function WidgetCard({ w, stats, d, onEdit, preview }: { w: HomeWidget; stats: HomeStats; d: Derived; onEdit?: () => void; preview?: boolean }) {
  const c = COLORS[w.color] ?? COLORS.verde;
  const solid = w.look === 'solid';
  const Icon = TEMPLATES.find(t => t.type === w.type)?.icon ?? Activity;
  return (
    <div
      className={`relative rounded-3xl p-4 flex flex-col overflow-hidden ${solid ? 'text-white' : 'glass-card text-stone-900 dark:text-white'} ${w.size === 'full' ? 'min-h-[148px]' : 'min-h-[180px]'} h-full`}
      style={solid ? { background: `radial-gradient(120% 120% at 100% 0%, ${c.hex} 0%, ${c.deep} 70%)`, boxShadow: `0 14px 30px -18px ${c.deep}` } : undefined}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: solid ? 'rgba(255,255,255,0.2)' : `${c.hex}22`, color: solid ? '#fff' : c.hex }}>
          <Icon className="w-3.5 h-3.5" />
        </span>
        <p className={`text-xs font-semibold truncate flex-1 ${solid ? 'text-white/90' : 'text-stone-600 dark:text-white/70'}`}>{w.title}</p>
        {!preview && onEdit && (
          <button type="button" onClick={onEdit} aria-label={`Editar la sección ${w.title}`}
            className={`w-7 h-7 -mr-1 rounded-full flex items-center justify-center ${solid ? 'hover:bg-white/15 text-white/80' : 'hover:bg-[rgba(118,118,128,0.12)] text-stone-400'}`}>
            <MoreHorizontal className="w-4 h-4" />
          </button>
        )}
      </div>
      <WidgetBody w={w} stats={stats} d={d} preview={preview} />
    </div>
  );
}

// ── Hojas: galería y editor ──────────────────────────────────────────
function Sheet({ children, onClose, label }: { children: React.ReactNode; onClose: () => void; label: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[85] bg-black/40 flex items-end justify-center" onClick={onClose}>
      <motion.div role="dialog" aria-label={label} initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 320 }}
        className="glass-modal w-full max-w-md rounded-t-3xl max-h-[92dvh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-stone-300 dark:bg-white/20 rounded-full mx-auto mt-3 mb-1 flex-shrink-0" />
        {children}
      </motion.div>
    </motion.div>
  );
}

const seg = (on: boolean) => `h-8 rounded-lg text-xs font-semibold ${on ? 'bg-[#fff] dark:bg-[#48484a] text-stone-900 dark:text-white shadow-sm' : 'text-stone-500'}`;
const fieldCls = 'w-full h-11 rounded-xl bg-[rgba(118,118,128,0.10)] px-3.5 text-[15px] text-stone-900 dark:text-white placeholder:text-stone-400 outline-none focus:ring-4 focus:ring-emerald-500/15';
const lbl = 'text-[11px] font-semibold uppercase tracking-wide text-stone-500 mb-1.5';

function Editor({ w, stats, d, index, count, onChange, onMove, onDelete, onClose }: {
  w: HomeWidget; stats: HomeStats; d: Derived; index: number; count: number;
  onChange: (w: HomeWidget) => void; onMove: (dir: -1 | 1) => void; onDelete: () => void; onClose: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const set = (patch: Partial<HomeWidget>) => onChange({ ...w, ...patch });
  const setS = (patch: Partial<WidgetSettings>) => onChange({ ...w, settings: { ...w.settings, ...patch } });
  const metric = w.settings.metric ?? 'weight';
  return (
    <Sheet onClose={onClose} label="Editar sección">
      <div className="px-5 pt-2 pb-3 flex items-center justify-between flex-shrink-0">
        <h2 className="text-lg font-bold text-stone-900 dark:text-white">Editar sección</h2>
        <button type="button" onClick={onClose} className="h-9 px-4 rounded-full bg-emerald-500 text-white text-sm font-semibold">Listo</button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-4">
        {/* Vista previa en vivo */}
        <div className="pointer-events-none flex justify-center">
          <div className={w.size === 'full' ? 'w-full' : 'w-1/2 min-w-[172px]'}>
            <WidgetCard w={w} stats={stats} d={d} preview />
          </div>
        </div>

        <label className="block"><p className={lbl}>Título</p>
          <input id="widget-title" value={w.title} maxLength={28} onChange={e => set({ title: e.target.value })} className={fieldCls} placeholder="Nombre de la sección" />
        </label>

        <div><p className={lbl}>Color</p>
          <div className="flex gap-2.5 flex-wrap">
            {(Object.keys(COLORS) as ColorId[]).map(id => (
              <button key={id} type="button" onClick={() => set({ color: id })} aria-label={`Color ${COLORS[id].label}`} aria-pressed={w.color === id}
                className={`w-9 h-9 rounded-full flex items-center justify-center ring-2 ring-offset-2 ring-offset-[#f9f9f8] dark:ring-offset-[#1c1c1e] ${w.color === id ? 'ring-emerald-500' : 'ring-transparent'}`}
                style={{ background: COLORS[id].hex }}>
                {w.color === id && <Check className="w-4 h-4 text-white" />}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div><p className={lbl}>Estilo</p>
            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[rgba(118,118,128,0.12)]">
              <button type="button" onClick={() => set({ look: 'glass' })} aria-pressed={w.look === 'glass'} className={seg(w.look === 'glass')}>Vidrio</button>
              <button type="button" onClick={() => set({ look: 'solid' })} aria-pressed={w.look === 'solid'} className={seg(w.look === 'solid')}>Color</button>
            </div>
          </div>
          <div><p className={lbl}>Tamaño</p>
            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[rgba(118,118,128,0.12)]">
              <button type="button" onClick={() => set({ size: 'half' })} aria-pressed={w.size === 'half'} className={seg(w.size === 'half')}>Mitad</button>
              <button type="button" onClick={() => set({ size: 'full' })} aria-pressed={w.size === 'full'} className={seg(w.size === 'full')}>Ancho</button>
            </div>
          </div>
        </div>

        {/* Ajustes de cada plantilla */}
        {w.type === 'clock' && (
          <div className="space-y-3">
            <div><p className={lbl}>Esfera</p>
              <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[rgba(118,118,128,0.12)]">
                {([['analog', 'Analógico'], ['digital', 'Digital'], ['ring', 'Anillo']] as const).map(([id, l]) => (
                  <button key={id} type="button" onClick={() => setS({ clockStyle: id })} aria-pressed={(w.settings.clockStyle ?? 'analog') === id} className={seg((w.settings.clockStyle ?? 'analog') === id)}>{l}</button>
                ))}
              </div>
            </div>
            <button type="button" onClick={() => setS({ seconds: !(w.settings.seconds ?? true) })} aria-pressed={w.settings.seconds ?? true}
              className="w-full h-11 px-3.5 rounded-xl bg-[rgba(118,118,128,0.10)] flex items-center justify-between text-[15px] text-stone-900 dark:text-white">
              Mostrar segundos
              <span className={`w-11 h-6 rounded-full p-0.5 transition-colors ${(w.settings.seconds ?? true) ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-white/20'}`}>
                <span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${(w.settings.seconds ?? true) ? 'translate-x-5' : ''}`} />
              </span>
            </button>
          </div>
        )}

        {(w.type === 'metric' || w.type === 'goal') && (
          <div className="space-y-3">
            <div><p className={lbl}>{w.type === 'goal' ? 'Qué quieres conseguir' : 'Qué enseña'}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {METRICS.filter(m => w.type === 'metric' || !['streak'].includes(m.id)).map(m => (
                  <button key={m.id} type="button" onClick={() => setS({ metric: m.id })} aria-pressed={metric === m.id}
                    className={`h-10 px-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-left ${metric === m.id ? 'bg-emerald-500 text-white' : 'bg-[rgba(118,118,128,0.10)] text-stone-700 dark:text-white/80'}`}>
                    <m.icon className="w-3.5 h-3.5 flex-shrink-0" /> <span className="truncate">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
            {metric === 'exercise' && (
              <div><p className={lbl}>Ejercicio</p>
                {d.bests.size ? (
                  <select id="widget-exercise" value={w.settings.exercise ?? [...d.bests.keys()][0]} onChange={e => setS({ exercise: e.target.value })} className={fieldCls}>
                    {[...d.bests.entries()].map(([id, b]) => <option key={id} value={id}>{b.name} · {fmtNum(b.best, 1)} kg</option>)}
                  </select>
                ) : <p className="text-sm text-stone-500">Cuando registres pesos en tus entrenos, podrás elegir el ejercicio aquí.</p>}
              </div>
            )}
            {w.type === 'goal' && (
              <label className="block"><p className={lbl}>Objetivo</p>
                <input id="widget-target" type="number" inputMode="decimal" min={0} step="any" value={w.settings.target ?? ''} onChange={e => setS({ target: Number(e.target.value) || 0 })} className={fieldCls} />
              </label>
            )}
          </div>
        )}

        {w.type === 'countdown' && (
          <div className="space-y-3">
            <label className="block"><p className={lbl}>Qué esperas</p>
              <input id="widget-label" value={w.settings.label ?? ''} maxLength={30} onChange={e => setS({ label: e.target.value })} placeholder="Carrera, viaje, competición…" className={fieldCls} />
            </label>
            <label className="block"><p className={lbl}>Fecha</p>
              <input id="widget-date" type="date" value={w.settings.date ?? ''} onChange={e => setS({ date: e.target.value })} className={fieldCls} />
            </label>
          </div>
        )}

        {w.type === 'note' && (
          <label className="block"><p className={lbl}>Texto</p>
            <textarea id="widget-text" value={w.settings.text ?? ''} maxLength={140} rows={3} onChange={e => setS({ text: e.target.value })}
              className={`bare-input ${fieldCls} h-auto py-3 resize-none`} placeholder="Tu frase o recordatorio" />
          </label>
        )}

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button type="button" disabled={index === 0} onClick={() => onMove(-1)} className="h-11 rounded-xl bg-[rgba(118,118,128,0.10)] text-sm font-semibold text-stone-800 dark:text-white flex items-center justify-center gap-1.5 disabled:opacity-40">
            <ChevronUp className="w-4 h-4" /> Subir
          </button>
          <button type="button" disabled={index === count - 1} onClick={() => onMove(1)} className="h-11 rounded-xl bg-[rgba(118,118,128,0.10)] text-sm font-semibold text-stone-800 dark:text-white flex items-center justify-center gap-1.5 disabled:opacity-40">
            <ChevronDown className="w-4 h-4" /> Bajar
          </button>
        </div>
        {confirm ? (
          <div className="flex gap-2">
            <button type="button" onClick={() => setConfirm(false)} className="flex-1 h-11 rounded-xl bg-[rgba(118,118,128,0.10)] text-sm font-semibold text-stone-700 dark:text-white">Cancelar</button>
            <button type="button" onClick={onDelete} className="flex-1 h-11 rounded-xl bg-red-500 text-white text-sm font-semibold">Quitar sección</button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirm(true)} className="w-full h-11 rounded-xl text-red-500 text-sm font-semibold flex items-center justify-center gap-1.5">
            <Trash2 className="w-4 h-4" /> Quitar esta sección
          </button>
        )}
      </div>
    </Sheet>
  );
}

function Gallery({ stats, d, onPick, onClose }: { stats: HomeStats; d: Derived; onPick: (t: typeof TEMPLATES[number]) => void; onClose: () => void }) {
  return (
    <Sheet onClose={onClose} label="Añadir una sección">
      <div className="px-5 pt-2 pb-3 flex items-start justify-between flex-shrink-0">
        <div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-white">Añadir una sección</h2>
          <p className="text-sm text-stone-500">Elige una plantilla. Luego la cambias a tu gusto.</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Cerrar" className="w-9 h-9 rounded-full bg-[rgba(118,118,128,0.12)] flex items-center justify-center flex-shrink-0">
          <X className="w-5 h-5 text-stone-600 dark:text-white/70" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <div className="grid grid-cols-2 gap-3">
          {TEMPLATES.map(t => {
            const sample = { id: `sample-${t.type}`, ...t.make() } as HomeWidget;
            return (
              <button key={t.type} type="button" onClick={() => onPick(t)} className={`text-left active:scale-[0.98] transition-transform ${sample.size === 'full' ? 'col-span-2' : ''}`}>
                <div className="pointer-events-none"><WidgetCard w={sample} stats={stats} d={d} preview /></div>
                <p className="mt-1.5 px-1 text-sm font-semibold text-stone-900 dark:text-white flex items-center gap-1"><Plus className="w-3.5 h-3.5 text-emerald-600" /> {t.name}</p>
                <p className="px-1 text-xs text-stone-500">{t.hint}</p>
              </button>
            );
          })}
        </div>
      </div>
    </Sheet>
  );
}

// ── Bloque de la pantalla de inicio ──────────────────────────────────
export function HomeWidgets({ stats, userId }: { stats: HomeStats; userId: string }) {
  const [widgets, setWidgets] = useStoredWidgets(userId);
  const [editing, setEditing] = useState<string | null>(null);
  const [gallery, setGallery] = useState(false);
  const d = useDerived();
  const current = widgets.find(w => w.id === editing) ?? null;
  const index = current ? widgets.indexOf(current) : -1;

  const add = (t: typeof TEMPLATES[number]) => {
    const w: HomeWidget = { id: uid(), ...t.make() };
    setWidgets(prev => [...prev, w]);
    setGallery(false);
    setEditing(w.id);
  };
  const update = (w: HomeWidget) => setWidgets(prev => prev.map(x => (x.id === w.id ? w : x)));
  const move = (dir: -1 | 1) => setWidgets(prev => {
    const i = prev.findIndex(x => x.id === editing); const j = i + dir;
    if (i < 0 || j < 0 || j >= prev.length) return prev;
    const next = [...prev]; [next[i], next[j]] = [next[j], next[i]]; return next;
  });
  const remove = () => { setWidgets(prev => prev.filter(x => x.id !== editing)); setEditing(null); };

  return (
    <section className="pt-1 pb-4" aria-label="Tus secciones">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-stone-600 dark:text-white/60 text-sm font-medium">Tus secciones</h2>
        <button type="button" onClick={() => setGallery(true)} className="h-8 px-3 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" strokeWidth={2.5} /> Añadir
        </button>
      </div>
      {widgets.length === 0 ? (
        <button type="button" onClick={() => setGallery(true)}
          className="w-full rounded-3xl border-2 border-dashed border-stone-300/80 dark:border-white/15 p-5 flex items-center gap-4 text-left active:scale-[0.99] transition-transform">
          <span className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0"><Plus className="w-6 h-6" /></span>
          <span className="min-w-0">
            <span className="block font-semibold text-stone-900 dark:text-white">Personaliza tu inicio</span>
            <span className="block text-sm text-stone-500">Añade un reloj, tus métricas, un objetivo o una cuenta atrás.</span>
          </span>
        </button>
      ) : (
        <motion.div layout className="grid grid-cols-2 gap-3">
          <AnimatePresence initial={false}>
            {widgets.map(w => (
              <motion.div key={w.id} layout initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }}
                className={w.size === 'full' ? 'col-span-2' : ''}>
                <WidgetCard w={w} stats={stats} d={d} onEdit={() => setEditing(w.id)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {gallery && <Gallery stats={stats} d={d} onPick={add} onClose={() => setGallery(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {current && (
          <Editor w={current} stats={stats} d={d} index={index} count={widgets.length}
            onChange={update} onMove={move} onDelete={remove} onClose={() => setEditing(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
