'use client';

import { defaultDay } from '@/lib/weekCalendar';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Bell, Minus, Plus, ChevronDown, ChevronRight, Repeat } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ExercisePreview } from '@/components/workout/ExercisePreview';
import { DoseChips } from '@/components/workout/ExerciseBits';
import { ExerciseDetailSheet } from '@/components/workout/ExerciseDetailSheet';
import { alternativeOptions, resolveAlternative, swapExercise } from '@/lib/exerciseSwap';
import { useScrollLock } from '@/hooks/useScrollLock';
import { TimePicker } from '@/components/ui/TimePicker';
import type { WeeklySession } from '@/types/user';

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const DAY_FULL  = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const DURATION_OPTIONS = [20, 30, 40, 45, 60, 75, 90];
const MIN_DAYS = 1;
const MAX_DAYS = 6;

// Calcula la fecha del lunes de la semana que viene
function getNextMonday(): Date {
  const now = new Date();
  const day = now.getDay(); // 0=dom, 1=lun...
  const diff = day === 0 ? 1 : 8 - day; // días hasta el siguiente lunes
  const next = new Date(now);
  next.setDate(now.getDate() + diff);
  next.setHours(0, 0, 0, 0);
  return next;
}

function getWeekDates(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

interface Props {
  sessions: WeeklySession[];
  weekNumber: number;
  onConfirm: (sessions: WeeklySession[]) => void;
  onClose: () => void;
  /** El Motor rehace la semana con otro número de días. */
  onChangeDays?: (days: number) => WeeklySession[];
  /** El Motor rehace una sesión para otro tiempo. */
  onRebuild?: (session: WeeklySession, minutes: number, days: number) => WeeklySession;
}

export function WeekPlannerModal({ sessions: initialSessions, weekNumber, onConfirm, onClose, onChangeDays, onRebuild }: Props) {
  useScrollLock();
  const { getExerciseByName } = useApp();
  // Sesiones desplegadas y ejercicio abierto en la ficha
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<{ sessionId: string; index: number } | null>(null);
  const toggleOpen = (id: string) => setOpen(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  // Cambiar un ejercicio por una de sus variantes (mantiene series y descanso)
  function chooseAlternative(name: string) {
    if (!detail) return;
    setSessions(prev => prev.map(s => {
      if (s.id !== detail.sessionId) return s;
      // No se puede elegir un ejercicio que ya está en otro hueco de la sesión.
      if (s.exercises.some((e, i) => i !== detail.index && e.name === name)) return s;
      const exercises = s.exercises.map((e, i) => (i === detail.index && e.name !== name ? swapExercise(e, resolveAlternative(e, name, getExerciseByName)) : e));
      return { ...s, exercises };
    }));
  }

  // Vuelve a aplicar las variantes elegidas cuando el Motor rehace la sesión (otro tiempo u otros días).
  function keepSwaps(prev: WeeklySession | undefined, next: WeeklySession): WeeklySession {
    const swaps = new Map((prev?.exercises ?? []).filter(e => e.swappedFrom).map(e => [e.swappedFrom!, e.name]));
    if (!swaps.size) return next;
    const used = new Set(next.exercises.map(e => e.name));
    return {
      ...next,
      exercises: next.exercises.map(e => {
        const alt = swaps.get(e.name);
        if (!alt || alt === e.name || used.has(alt)) return e;
        used.add(alt);
        return swapExercise(e, resolveAlternative(e, alt, getExerciseByName));
      }),
    };
  }

  const nextMonday = getNextMonday();
  const weekDates  = getWeekDates(nextMonday);

  // Estado editable de las sesiones
  const [sessions, setSessions] = useState<WeeklySession[]>(() =>
    initialSessions.map((s, i) => ({
      ...s,
      dayOfWeek: s.dayOfWeek ?? defaultDay(i, initialSessions.length), // reparto por defecto
    }))
  );
  const [days, setDays] = useState(initialSessions.length);
  const [movingId, setMovingId]         = useState<string | null>(null);
  const [notifRequested, setNotifRequested] = useState(false);

  // Solicitar permiso de notificaciones del navegador
  async function requestNotification() {
    if (!('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    setNotifRequested(perm === 'granted');
    if (perm === 'granted') {
      // Programa una notificación ficticia para el domingo a las 16:00
      // (en producción se haría con un service worker o un backend)
      new Notification('Fit K · Nueva semana lista 🏋️', {
        body: `Tu plan de la semana ${weekNumber + 1} te espera. ¡A por ello!`,
        icon: '/icon.svg',
      });
    }
  }

  function changeDay(sessionId: string, day: number) {
    // Si otro entreno ya está en ese día, intercambiar
    setSessions(prev => {
      const target   = prev.find(s => s.id === sessionId)!;
      const conflict = prev.find(s => s.id !== sessionId && s.dayOfWeek === day);
      return prev.map(s => {
        if (s.id === sessionId) return { ...s, dayOfWeek: day };
        if (conflict && s.id === conflict.id) return { ...s, dayOfWeek: target.dayOfWeek };
        return s;
      });
    });
    setMovingId(null);
  }

  function changeDuration(id: string, duration: number) {
    setSessions(prev => prev.map(s => (s.id !== id ? s : onRebuild ? keepSwaps(s, onRebuild(s, duration, days)) : { ...s, duration })));
  }

  // Añadir o quitar un entreno: el Motor rehace la semana con esos días.
  function changeDays(next: number) {
    if (!onChangeDays || next < MIN_DAYS || next > MAX_DAYS) return;
    const generated = onChangeDays(next);
    if (!generated.length) return;
    setDays(next);
    setMovingId(null);
    setSessions(prev => generated.map((s, i) => keepSwaps(prev.find(p => p.name === s.name), { ...s, dayOfWeek: s.dayOfWeek ?? defaultDay(i, generated.length) })));
  }

  const sortedSessions = [...sessions].sort((a, b) => (a.dayOfWeek ?? 0) - (b.dayOfWeek ?? 0));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 z-[90] flex flex-col"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="absolute inset-x-0 bottom-0 glass-modal rounded-t-3xl flex flex-col"
        style={{ maxHeight: '92vh' }}
      >
        {/* ── Header ── */}
        <div className="px-5 pt-5 pb-4 border-b border-stone-100 flex-shrink-0">
          <div className="w-10 h-1 bg-stone-200 rounded-full mx-auto mb-4" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-0.5">
                Semana {weekNumber + 1}
              </p>
              <h2 className="text-xl font-bold text-stone-900">Planifica tu semana</h2>
              <p className="text-stone-400 text-sm mt-0.5">
                {nextMonday.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })} –{' '}
                {weekDates[6].toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
              </p>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0 mt-1">
              <X className="w-4 h-4 text-stone-600" />
            </button>
          </div>
        </div>

        {/* ── Días de entreno esta semana ── */}
        {onChangeDays && (
          <div className="px-5 pt-4 flex items-center justify-between gap-3 flex-shrink-0">
            <div>
              <p className="text-sm font-semibold text-stone-900">Días de entreno</p>
              <p className="text-xs text-stone-500">Añade o quita un entreno solo para esta semana.</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" aria-label="Quitar un entreno" disabled={days <= MIN_DAYS} onClick={() => changeDays(days - 1)}
                className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center disabled:opacity-30">
                <Minus className="w-4 h-4 text-stone-700" />
              </button>
              <span className="w-8 text-center text-lg font-semibold text-stone-900 tabular-nums">{days}</span>
              <button type="button" aria-label="Añadir un entreno" disabled={days >= MAX_DAYS} onClick={() => changeDays(days + 1)}
                className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center disabled:opacity-30">
                <Plus className="w-4 h-4 text-stone-700" />
              </button>
            </div>
          </div>
        )}

        {/* ── Calendario visual Mon–Dom ── */}
        <div className="px-5 pt-4 pb-2 flex-shrink-0">
          <div className="grid grid-cols-7 gap-1">
            {weekDates.map((date, i) => {
              const session = sessions.find(s => s.dayOfWeek === i);
              const isMoving = movingId !== null;
              return (
                <button
                  key={i}
                  onClick={() => {
                    if (isMoving && movingId) {
                      changeDay(movingId, i);
                    }
                  }}
                  className={`lg-keep flex flex-col items-center gap-0.5 rounded-xl py-2 px-0.5 transition-all ${
                    session
                      ? 'bg-emerald-500 text-white'
                      : isMoving
                      ? 'bg-stone-100 border-2 border-dashed border-emerald-300'
                      : 'bg-stone-100'
                  } ${isMoving ? 'cursor-pointer scale-95' : ''}`}
                >
                  <span className={`text-[9px] font-semibold ${session ? 'text-white/80' : 'text-stone-400'}`}>
                    {DAY_NAMES[i]}
                  </span>
                  <span className={`text-xs font-bold ${session ? 'text-white' : 'text-stone-500'}`}>
                    {date.getDate()}
                  </span>
                  {session && (
                    <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>
          {movingId && (
            <p className="text-center text-xs text-emerald-600 font-medium mt-2">
              Toca el día donde quieres mover el entreno
            </p>
          )}
        </div>

        {/* ── Lista de sesiones ── */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
          {sortedSessions.map(session => (
            <motion.div
              key={session.id}
              layout
              className={`rounded-2xl border transition-all ${
                movingId === session.id
                  ? 'border-emerald-400 bg-emerald-50 shadow-md'
                  : 'border-stone-100 bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-3 p-4">
                {/* Día badge */}
                <button
                  onClick={() => setMovingId(movingId === session.id ? null : session.id)}
                  className={`lg-keep flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all ${
                    movingId === session.id ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-700'
                  }`}
                  title="Toca para mover de día"
                >
                  <span className="text-[10px] font-semibold">
                    {session.dayOfWeek !== undefined ? DAY_NAMES[session.dayOfWeek] : '?'}
                  </span>
                  <span className="text-sm font-bold">
                    {session.dayOfWeek !== undefined ? weekDates[session.dayOfWeek]?.getDate() : '–'}
                  </span>
                </button>

                {/* Nombre: lo pone el Motor según el tipo de sesión */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-900 text-sm truncate">{session.name}</p>
                  <p className="text-stone-400 text-xs mt-0.5">{session.targetMuscles}</p>
                </div>

                {/* Duración */}
                <div className="flex-shrink-0">
                  <TimePicker
                    value={session.duration}
                    options={DURATION_OPTIONS}
                    onChange={m => changeDuration(session.id, m)}
                  />
                </div>
              </div>

              {/* Ejercicios: todos, con sus variantes */}
              <div className="px-4 pb-3">
                <button type="button" onClick={() => toggleOpen(session.id)} aria-expanded={open.has(session.id)}
                  className="w-full flex items-center justify-between gap-2 py-1.5 text-left">
                  <span className="text-xs font-semibold text-stone-600 dark:text-white/70">
                    {session.exercises.length} ejercicios{!open.has(session.id) && ` · ${session.exercises.slice(0, 3).map(e => e.name).join(', ')}${session.exercises.length > 3 ? '…' : ''}`}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-stone-400 flex-shrink-0 transition-transform ${open.has(session.id) ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {open.has(session.id) && (
                    <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-1.5 pt-1">
                      {session.exercises.map((ex, i) => {
                        const alts = alternativeOptions(ex).filter(n => n !== ex.name).length;
                        return (
                          <li key={`${ex.id}-${i}`}>
                            <button type="button" onClick={() => setDetail({ sessionId: session.id, index: i })}
                              className="w-full flex items-center gap-3 p-2 pr-2.5 rounded-2xl bg-white/80 dark:bg-white/[0.06] border border-stone-100 dark:border-white/10 text-left active:scale-[0.99] transition-transform">
                              <span className="relative flex-shrink-0">
                                <ExercisePreview name={ex.name} muscle={ex.targetMuscle} className="w-14 h-14" rounded="rounded-xl" animate={false} />
                                <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-stone-900 text-white text-[10px] font-bold flex items-center justify-center tabular-nums dark:bg-white dark:text-stone-900">{i + 1}</span>
                              </span>
                              <span className="flex-1 min-w-0 space-y-1">
                                <span className="block text-sm font-semibold text-stone-900 dark:text-white leading-tight truncate">{ex.name}</span>
                                <DoseChips exercise={ex} />
                                {ex.swappedFrom && <span className="block text-[11px] text-stone-500 truncate">En lugar de {ex.swappedFrom}</span>}
                              </span>
                              <span className="flex flex-col items-end gap-1 flex-shrink-0">
                                {alts > 0 && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                                    <Repeat className="w-3 h-3" /> {alts}
                                  </span>
                                )}
                                <ChevronRight className="w-4 h-4 text-stone-300" />
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Footer ── */}
        <div className="px-5 pt-3 pb-8 border-t border-stone-100 flex-shrink-0 space-y-3">
          {/* Aviso de notificación */}
          {!notifRequested && 'Notification' in window && (
            <button
              onClick={requestNotification}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[rgba(118,118,128,0.12)] text-stone-800 dark:text-white text-sm"
            >
              <Bell className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs font-medium">Activar aviso cuando termine la semana</span>
            </button>
          )}
          {notifRequested && (
            <div className="flex items-center gap-2 px-2 text-xs text-emerald-600">
              <Check className="w-3.5 h-3.5" />
              Notificaciones activadas
            </div>
          )}

          {/* Confirmar */}
          <button
            onClick={() => onConfirm(sessions)}
            className="w-full py-4 rounded-full bg-emerald-500 text-white font-bold text-base"
          >
            Empezar semana {weekNumber + 1} →
          </button>
        </div>
      </motion.div>

      <ExerciseDetailSheet
        exercise={(() => {
          // Sin ofrecer variantes que ya están en otro hueco de la misma sesión.
          const s = detail && sessions.find(x => x.id === detail.sessionId);
          const ex = s && detail ? s.exercises[detail.index] : undefined;
          if (!s || !ex || !detail) return null;
          const taken = new Set(s.exercises.filter((_, i) => i !== detail.index).map(e => e.name));
          return { ...ex, alternatives: ex.alternatives?.filter(n => !taken.has(n)) };
        })()}
        onClose={() => setDetail(null)}
        onChooseAlternative={chooseAlternative}
        zIndex="z-[95]"
      />
    </motion.div>
  );
}
