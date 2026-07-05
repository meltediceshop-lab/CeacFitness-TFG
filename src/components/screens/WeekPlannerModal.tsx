'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, Pencil, Check, Bell } from 'lucide-react';
import { useScrollLock } from '@/hooks/useScrollLock';
import type { WeeklySession } from '@/types/user';

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const DAY_FULL  = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const DURATION_OPTIONS = [20, 30, 45, 60, 75, 90];

const SESSION_NAMES = [
  'Full Body', 'Tren Superior', 'Tren Inferior',
  'Cardio + Core', 'Movilidad', 'Hipertrofia',
  'Fuerza', 'HIIT',
];

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
}

export function WeekPlannerModal({ sessions: initialSessions, weekNumber, onConfirm, onClose }: Props) {
  useScrollLock();

  const nextMonday = getNextMonday();
  const weekDates  = getWeekDates(nextMonday);

  // Estado editable de las sesiones
  const [sessions, setSessions] = useState<WeeklySession[]>(() =>
    initialSessions.map((s, i) => ({
      ...s,
      dayOfWeek: s.dayOfWeek ?? i * 2, // por defecto lun, mié, vie...
    }))
  );
  const [editingId, setEditingId]       = useState<string | null>(null);
  const [editName, setEditName]         = useState('');
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

  function startEdit(session: WeeklySession) {
    setEditingId(session.id);
    setEditName(session.name);
  }

  function saveEdit(id: string) {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, name: editName } : s));
    setEditingId(null);
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
    setSessions(prev => prev.map(s => s.id === id ? { ...s, duration } : s));
  }

  const sortedSessions = [...sessions].sort((a, b) => (a.dayOfWeek ?? 0) - (b.dayOfWeek ?? 0));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-[90] flex flex-col"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl flex flex-col"
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
            <button onClick={onClose} className="p-2 rounded-xl bg-stone-100 mt-1">
              <X className="w-4 h-4 text-stone-600" />
            </button>
          </div>
        </div>

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
                  className={`flex flex-col items-center gap-0.5 rounded-xl py-2 px-0.5 transition-all ${
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
                    <div className="w-1.5 h-1.5 rounded-full bg-white/70 mt-0.5" />
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
                  className={`flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all ${
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

                {/* Nombre editable */}
                <div className="flex-1 min-w-0">
                  {editingId === session.id ? (
                    <div className="flex gap-2 items-center">
                      <select
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="flex-1 border border-stone-200 rounded-xl px-2 py-1.5 text-sm text-stone-900 focus:outline-none focus:border-emerald-400"
                      >
                        {SESSION_NAMES.map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                        <option value={editName}>{editName}</option>
                      </select>
                      <button
                        onClick={() => saveEdit(session.id)}
                        className="p-1.5 rounded-xl bg-emerald-500 text-white"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-stone-900 text-sm truncate">{session.name}</p>
                      <button onClick={() => startEdit(session)} className="text-stone-400 hover:text-stone-600 flex-shrink-0">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <p className="text-stone-400 text-xs mt-0.5">{session.targetMuscles}</p>
                </div>

                {/* Duración */}
                <div className="flex-shrink-0">
                  <select
                    value={session.duration}
                    onChange={e => changeDuration(session.id, Number(e.target.value))}
                    className="border border-stone-200 rounded-xl px-2 py-1.5 text-xs text-stone-700 focus:outline-none focus:border-emerald-400 bg-white"
                  >
                    {DURATION_OPTIONS.map(d => (
                      <option key={d} value={d}>{d} min</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Ejercicios */}
              <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                {session.exercises.slice(0, 4).map(ex => (
                  <span key={ex.id} className="text-[10px] bg-white border border-stone-200 text-stone-600 rounded-full px-2 py-0.5">
                    {ex.name}
                  </span>
                ))}
                {session.exercises.length > 4 && (
                  <span className="text-[10px] text-stone-400">+{session.exercises.length - 4} más</span>
                )}
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
              className="w-full flex items-center gap-3 py-3 px-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm"
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
            className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base transition-colors"
          >
            Empezar semana {weekNumber + 1} →
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
