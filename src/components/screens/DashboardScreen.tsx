'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { MetricsModal } from './MetricsModal';
import { WeekPlannerModal } from './WeekPlannerModal';
import { CoachCardModal } from '@/components/dashboard/CoachCardModal';
import { BottomNav } from '@/components/ui/BottomNav';
import { SparkLine } from '@/components/metrics/LineChart';
import type { BodyMeasurementRecord } from '@/types/user';

import {
  MessageCircle,
  ChevronRight,
  Check,
  Clock,
  Apple,
  Home,
  TrendingUp,
  Activity,
  Bell,
  X,
  ChevronRight as Arrow,
  User,
  Users,
  BarChart2,
  Share2 as Share2Icon,
  Flame,
  Dumbbell,
} from 'lucide-react';
import type { MeasurementReminderFrequency } from '@/types/user';

function shouldShowMetricAlert(
  lastRecordedAt: Date | undefined,
  frequency: MeasurementReminderFrequency,
  totalSessions: number,
): boolean {
  if (!lastRecordedAt) return totalSessions >= 1; // Show after first session if never recorded
  const now = new Date();
  const daysSince = (now.getTime() - new Date(lastRecordedAt).getTime()) / (1000 * 60 * 60 * 24);
  const daysMap: Partial<Record<MeasurementReminderFrequency, number>> = {
    weekly: 7, '2weeks': 14, '3weeks': 21, monthly: 30,
  };
  if (daysMap[frequency]) return daysSince >= (daysMap[frequency] as number);
  // session-based: not currently trackable precisely, use 14 days as proxy
  return daysSince >= 14;
}

// ─── Notificaciones por sesión ────────────────────────────────────────────────
interface SessionAction {
  sessionId:         string;
  sessionName:       string;
  completedAt:       string; // ISO — TTL de 2h se mide desde aquí
  dismissedRegister: boolean; // el usuario ya registró la sesión
  dismissedCommunity:boolean; // el usuario ya publicó en Comunidad (o lo descartó)
}
type SessionActionsMap = Record<string, SessionAction>;

const SESSION_ACTIONS_KEY = 'fitmente-session-actions';
const TTL_MS = 2 * 60 * 60 * 1000; // 2 h

function loadSessionActions(): SessionActionsMap {
  try {
    const raw = localStorage.getItem(SESSION_ACTIONS_KEY);
    return raw ? (JSON.parse(raw) as SessionActionsMap) : {};
  } catch { return {}; }
}

function saveSessionActions(map: SessionActionsMap) {
  localStorage.setItem(SESSION_ACTIONS_KEY, JSON.stringify(map));
}

// true si la acción todavía está dentro del TTL
function isWithinTTL(action: SessionAction): boolean {
  return Date.now() - new Date(action.completedAt).getTime() < TTL_MS;
}

// El punto parpadea si alguna de las dos acciones sigue pendiente y no ha expirado
function getActiveActionIds(map: SessionActionsMap): Set<string> {
  const active = new Set<string>();
  for (const [id, action] of Object.entries(map)) {
    if (!isWithinTTL(action)) continue;
    if (!action.dismissedRegister || !action.dismissedCommunity) active.add(id);
  }
  return active;
}

// Qué acciones siguen pendientes para una sesión concreta
function pendingActions(action: SessionAction | undefined): { register: boolean; community: boolean } {
  if (!action || !isWithinTTL(action)) return { register: false, community: false };
  return {
    register:  !action.dismissedRegister,
    community: !action.dismissedCommunity,
  };
}

// ─── Detección de tipo de ejercicio ──────────────────────────────────────────
type ExerciseMode = 'weighted' | 'bodyweight' | 'timed' | 'stretch';

const ABS_KEYWORDS    = ['crunch', 'abdom', 'plancha', 'plank', 'sit-up', 'sit up', 'mountain', 'russian', 'leg raise', 'elevacion', 'elevación', 'core', 'bird'];
const STRETCH_KEYWORDS = ['estira', 'stretch', 'flexib', 'movilid', 'yoga', 'foam', 'rodillo', 'hip flexor', 'pigeon', 'paloma', 'calf', 'gemelo'];
const TIMED_KEYWORDS  = ['plancha', 'plank', 'isométr', 'isometr', 'wall sit', 'dead hang', 'hollow'];

function detectExerciseMode(name: string): ExerciseMode {
  const n = name.toLowerCase();
  if (STRETCH_KEYWORDS.some(k => n.includes(k))) return 'stretch';
  if (TIMED_KEYWORDS.some(k => n.includes(k)))   return 'timed';
  if (ABS_KEYWORDS.some(k => n.includes(k)))      return 'bodyweight';
  return 'weighted';
}

// ─── Session Logs localStorage ────────────────────────────────────────────────
interface SetLog {
  weight?: number;  // kg (weighted)
  reps?: number;    // weighted / bodyweight
  seconds?: number; // timed / stretch
  feel?: number;    // 1-3 para stretch (1=tenso, 2=ok, 3=suelto)
}
interface SavedExerciseLog {
  exerciseId: string;
  exerciseName: string;
  mode: ExerciseMode;
  setLogs: SetLog[];
}
interface SavedSessionLog {
  sessionId: string;
  sessionName: string;
  completedAt: string;
  exercises: SavedExerciseLog[];
}
type SessionLogsMap = Record<string, SavedSessionLog>;

// Entrada editable por serie (un array de SetEntry por ejercicio)
type SetEntry = { weight: string; reps: string; seconds: string; feel: number };
type ExerciseEntries = Record<string, SetEntry[]>;

function getSessionLogsKey(userId: string) { return `fitk-session-logs-${userId}`; }

function loadSessionLogs(userId: string): SessionLogsMap {
  try {
    const raw = localStorage.getItem(getSessionLogsKey(userId));
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveSessionLogs(userId: string, map: SessionLogsMap) {
  localStorage.setItem(getSessionLogsKey(userId), JSON.stringify(map));
}

export function DashboardScreen() {
  const { user, setUser, setScreen, setSelectedWeeklySession, weekPlannerPending, generateNextWeekPreview, startNewWeekWithPlan } = useApp();
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [dismissedMetricAlert, setDismissedMetricAlert] = useState(false);
  const [metricsHistory, setMetricsHistory] = useState<BodyMeasurementRecord[]>([]);
  const [sessionActionsMap, setSessionActionsMap] = useState<SessionActionsMap>({});
  const [activeSessionPopup, setActiveSessionPopup] = useState<SessionAction | null>(null);
  const [popupPhase, setPopupPhase] = useState<'actions' | 'logging'>('actions');
  const [exerciseEntries, setExerciseEntries] = useState<ExerciseEntries>({});
  const [savingLogs, setSavingLogs] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [sessionLogsMap, setSessionLogsMap] = useState<SessionLogsMap>({});
  const [dashboardShareData, setDashboardShareData] = useState<{ content: string; minutes: number; exercises: number } | null>(null);
  const [showWeekPlanner, setShowWeekPlanner] = useState(false);
  const [nextWeekPreview, setNextWeekPreview] = useState<import('@/types/user').WeeklySession[]>([]);

  // Carga historial completo de medidas para sparklines y evolución
  useEffect(() => {
    fetch('/api/metrics')
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json?.data) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setMetricsHistory((json.data as any[]).map((r: any) => ({
          id: r.id,
          weight:   r.weight   ?? undefined,
          chest:    r.chest    ?? undefined,
          waist:    r.waist    ?? undefined,
          hips:     r.hips     ?? undefined,
          glutes:   r.glutes   ?? undefined,
          arms:     r.arms     ?? undefined,
          forearms: r.forearms ?? undefined,
          thighs:   r.thighs   ?? undefined,
          calves:   r.calves   ?? undefined,
          recordedAt: new Date(r.recorded_at),
        })));
      })
      .catch(() => {});
  }, []);

  // Carga notificaciones por sesión y logs
  useEffect(() => {
    setSessionActionsMap(loadSessionActions());
    if (user?.id) {
      setSessionLogsMap(loadSessionLogs(user.id));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-abre el planificador cuando todas las sesiones están completadas
  useEffect(() => {
    if (weekPlannerPending && !showWeekPlanner) {
      const preview = generateNextWeekPreview();
      setNextWeekPreview(preview);
      // Pequeño delay para que el dashboard termine de renderizar
      const t = setTimeout(() => setShowWeekPlanner(true), 800);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekPlannerPending]);

  // Descarta sólo una de las dos acciones; cierra el popup sólo si ambas están ya descartadas
  const dismissAction = (sessionId: string, which: 'register' | 'community' | 'both') => {
    const updated = { ...sessionActionsMap };
    if (updated[sessionId]) {
      updated[sessionId] = {
        ...updated[sessionId],
        dismissedRegister:  which === 'register'  || which === 'both' ? true : updated[sessionId].dismissedRegister,
        dismissedCommunity: which === 'community' || which === 'both' ? true : updated[sessionId].dismissedCommunity,
      };
      saveSessionActions(updated);
      setSessionActionsMap(updated);
    }
    // Cierra el popup siempre (el punto del card reflejará el estado real)
    setActiveSessionPopup(null);
    setPopupPhase('actions');
    setExerciseEntries({});
  };

  // Alias para cerrar el popup completamente (ambas acciones descartadas)
  const dismissSessionAction = (sessionId: string) => dismissAction(sessionId, 'both');

  const openSessionPopup = (sessionId: string) => {
    const action = sessionActionsMap[sessionId];
    if (!action) return;
    const session = user?.weeklySessions?.find(s => s.id === sessionId);
    const defaults: ExerciseEntries = {};
    session?.exercises.forEach(ex => {
      // Una fila por serie, pre-rellenada con los valores objetivo
      defaults[ex.id] = Array.from({ length: ex.sets }, () => ({
        weight: '',
        reps:    String(ex.reps[0] ?? ''),
        seconds: '30',
        feel:    2,
      }));
    });
    setActiveSessionPopup(action);
    setPopupPhase('actions');
    setExerciseEntries(defaults);
  };

  const handleSaveLogs = async (sessionId: string) => {
    const session = user?.weeklySessions?.find(s => s.id === sessionId);
    if (!session) { dismissSessionAction(sessionId); return; }
    setSavingLogs(true);
    try {
      // 1. Crear workout session record
      const wsRes = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weeklySessionId: sessionId,
          date: new Date().toISOString(),
          completed: true,
          mode: 'manual',
        }),
      });
      const wsData = await wsRes.json();
      const workoutSessionId = wsData.data?.id;

      // 2. Guardar logs de cada ejercicio (por serie)
      const exerciseLogs: SavedExerciseLog[] = session.exercises.map(ex => {
        const mode  = detectExerciseMode(ex.name);
        const rows  = exerciseEntries[ex.id] ?? [];
        const setLogs: SetLog[] = rows.map(row => ({
          weight:  mode === 'weighted' ? (parseFloat(row.weight) || undefined) : undefined,
          reps:    mode !== 'stretch' && mode !== 'timed' ? (parseInt(row.reps) || ex.reps[0]) : undefined,
          seconds: mode === 'timed' || mode === 'stretch' ? (parseInt(row.seconds) || 30) : undefined,
          feel:    mode === 'stretch' ? row.feel : undefined,
        }));
        return { exerciseId: ex.id, exerciseName: ex.name, mode, setLogs };
      });

      // Guardar en localStorage para mostrar en "Tu progreso"
      if (user?.id) {
        const updated = { ...sessionLogsMap };
        updated[sessionId] = {
          sessionId,
          sessionName: session.name,
          completedAt: new Date().toISOString(),
          exercises: exerciseLogs,
        };
        saveSessionLogs(user.id, updated);
        setSessionLogsMap(updated);
      }

      if (workoutSessionId) {
        const apiLogs = exerciseLogs.flatMap(ex =>
          ex.setLogs.map((sl, i) => ({
            exerciseId: ex.exerciseId,
            setNumber: i + 1,
            weight: sl.weight,
            reps: sl.reps ?? 0,
            timestamp: new Date().toISOString(),
          }))
        ).filter(l => (l.reps ?? 0) > 0 || l.weight);

        if (apiLogs.length > 0) {
          await fetch(`/api/workouts/${workoutSessionId}/logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiLogs),
          });
        }
      }
    } catch { /* silently ignore */ } finally {
      setSavingLogs(false);
      // Solo descarta "registrar" — la de comunidad sigue activa si no se ha hecho
      dismissAction(sessionId, 'register');
    }
  };

  const progressData = useMemo(() => {
    const completedSessions = user?.weeklySessions?.filter(s => s.status === 'completed').length || 0;
    const totalSessions = user?.weeklySessions?.length || 0;
    const baseProgress = 40;
    const sessionProgress = totalSessions > 0
      ? Math.round((completedSessions / totalSessions) * 60)
      : 0;
    return { percentage: baseProgress + sessionProgress, completedSessions, totalSessions };
  }, [user?.weeklySessions]);

  const orderedSessions = useMemo(() => {
    if (!user?.weeklySessions) return [];
    const completed = user.weeklySessions.filter(s => s.status === 'completed');
    const available = user.weeklySessions.filter(s => s.status === 'available');
    const locked = user.weeklySessions.filter(s => s.status === 'locked');
    return [...completed, ...available, ...locked];
  }, [user?.weeklySessions]);

  const nextSession = useMemo(() =>
    user?.weeklySessions?.find(s => s.status === 'available') || null,
    [user?.weeklySessions]
  );

  if (!user) return null;

  const activeIds = getActiveActionIds(sessionActionsMap);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 20) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const handleSessionClick = (session: typeof user.weeklySessions[0]) => {
    setSelectedWeeklySession(session);
    setScreen('workout-preview');
  };

  const getCompletedMessage = (index: number) => {
    const messages = ['Buen comienzo', 'Vas bien', 'Sigue así', 'Ya has empezado'];
    return messages[index % messages.length];
  };

  const getProgressMessage = () => {
    if (progressData.completedSessions === 0) return 'Ya has dado el primer paso. Sigue a tu ritmo.';
    if (progressData.completedSessions === progressData.totalSessions) return 'Semana completada. Esto cuenta.';
    return 'Ya has empezado. Sigue a tu ritmo.';
  };

  const totalCompletedSessions = user.totalCompletedSessions ||
    user.weeklySessions?.filter(s => s.status === 'completed').length || 0;

  const lastMeasurement = user.profile.measurementHistory?.slice(-1)[0];
  const showMetricAlert = !dismissedMetricAlert && shouldShowMetricAlert(
    lastMeasurement?.recordedAt,
    user.profile.reminderFrequency ?? 'weekly',
    totalCompletedSessions,
  );

  // ── Stats tipo app de entrenamiento ──────────────────────────────────────────
  // Volumen total levantado (kg) a partir de los logs guardados por sesión
  const totalVolume = Object.values(sessionLogsMap).reduce((sum, sess) => {
    return sum + (sess?.exercises ?? []).reduce((eSum, ex) =>
      eSum + (ex?.setLogs ?? []).reduce((sSum, set) => sSum + (set?.weight ?? 0) * (set?.reps ?? 0), 0)
    , 0);
  }, 0);

  const volumeLabel = totalVolume >= 1000
    ? `${(totalVolume / 1000).toFixed(1)}t`
    : `${Math.round(totalVolume)}`;

  // Racha de semanas entrenadas consecutivas (semana actual + historial)
  const weekStreak = (() => {
    const currentHasCompleted = (user.weeklySessions ?? []).some(s => s.status === 'completed');
    let streak = currentHasCompleted ? 1 : 0;
    let expected = user.currentWeek - 1;
    const past = [...(user.weeklyHistory ?? [])].sort((a, b) => b.weekNumber - a.weekNumber);
    for (const w of past) {
      if (w.weekNumber !== expected) break;
      if (!(w.sessions ?? []).some(s => s.status === 'completed')) break;
      streak++;
      expected--;
    }
    return streak;
  })();

  // Variación de peso (último registro vs anterior)
  const weightDelta = (() => {
    const w0 = metricsHistory[0]?.weight;
    const w1 = metricsHistory[1]?.weight;
    return w0 != null && w1 != null ? w0 - w1 : null;
  })();

  return (
    <div className="min-h-dvh glass-bg flex flex-col">

      {/* Header con avatar de perfil arriba a la derecha */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 pt-6 pb-4"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-stone-500 text-sm">{getGreeting()}</p>
            <h1 className="text-2xl font-bold text-stone-900">{user?.profile?.name ?? 'Usuario'}</h1>
            <p className="text-stone-400 text-sm mt-1">Vamos paso a paso.</p>
          </div>
          <button
            onClick={() => setScreen('profile')}
            className="w-11 h-11 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0 mt-1"
          >
            {user.profile.avatarUrl ? (
              <img src={user.profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-lg">
                {user.profile.name?.charAt(0).toUpperCase() ?? 'U'}
              </span>
            )}
          </button>
        </div>
      </motion.div>

      {/* Alerta revisión de métricas */}
      <AnimatePresence>
        {showMetricAlert && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-4 mb-2"
          >
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <Bell className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-amber-800 text-sm font-medium">Revisión de métricas</p>
                <p className="text-amber-700 text-xs mt-0.5">
                  {lastMeasurement
                    ? 'Tus métricas no están actualizadas. ¿Hacemos una revisión?'
                    : 'Lleva un tiempo entrenando. ¿Quieres registrar tus medidas?'}
                </p>
                <button
                  onClick={() => { setDismissedMetricAlert(true); setShowMetricsModal(true); }}
                  className="mt-2 text-amber-700 text-xs font-semibold underline underline-offset-2"
                >
                  Registrar ahora →
                </button>
              </div>
              <button onClick={() => setDismissedMetricAlert(true)} className="text-amber-400 hover:text-amber-600 flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Week Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-4 pb-4"
      >
        {/* Banner nueva semana */}
        {weekPlannerPending && (
          <motion.button
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => {
              const preview = generateNextWeekPreview();
              setNextWeekPreview(preview);
              setShowWeekPlanner(true);
            }}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white mb-4 shadow-lg active:scale-95 transition-transform"
          >
            <span className="text-2xl">🎉</span>
            <div className="flex-1 text-left">
              <p className="font-bold text-sm">¡Semana completada!</p>
              <p className="text-white/80 text-xs">Planifica tu próxima semana →</p>
            </div>
          </motion.button>
        )}

        <Card className="p-5 glass-card border-0 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-stone-500 text-sm">Tu semana</p>
              <p className="text-3xl font-bold text-stone-900">{progressData.percentage}%</p>
            </div>
            <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center">
              <span className="text-xl font-bold text-emerald-600">
                {progressData.completedSessions}/{progressData.totalSessions}
              </span>
            </div>
          </div>
          <div className="h-3 bg-stone-100 rounded-full overflow-hidden mb-3">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressData.percentage}%` }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </div>
          <p className="text-stone-400 text-sm">{getProgressMessage()}</p>
        </Card>
      </motion.div>

      {/* Session List */}
      <div className="flex-1 px-4 space-y-3 overflow-y-auto pb-32">
        <h2 className="text-stone-600 text-sm font-medium mb-2">Sesiones</h2>

        {orderedSessions.map((session, index) => {
          const isNext = nextSession?.id === session.id;
          const isCompleted = session.status === 'completed';
          const completedIndex = user?.weeklySessions
            ?.filter(s => s.status === 'completed')
            .findIndex(s => s.id === session.id) ?? 0;
          const hasPendingAction = isCompleted && activeIds.has(session.id);

          return (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className="relative"
            >
              <Card
                onClick={() => handleSessionClick(session)}
                className={`p-4 cursor-pointer border-0 rounded-2xl transition-all ${
                  isNext ? 'bg-emerald-50 dark:bg-emerald-500/15 shadow-md hover:shadow-lg ring-1 ring-emerald-200 dark:ring-emerald-500/25'
                  : isCompleted ? 'bg-stone-50 dark:bg-white/5 hover:bg-stone-100 dark:hover:bg-white/8'
                  : 'glass-card shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isCompleted ? 'bg-emerald-100 dark:bg-emerald-500/20' : isNext ? 'bg-emerald-500' : 'bg-stone-100 dark:bg-white/10'
                  }`}>
                    {isCompleted
                      ? <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      : <span className={`text-lg font-bold ${isNext ? 'text-white' : 'text-stone-600 dark:text-white/70'}`}>{session.sessionNumber ?? ''}</span>
                    }
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`font-semibold ${isCompleted ? 'text-stone-600 dark:text-white/50' : 'text-stone-900 dark:text-white'}`}>
                        Sesión {session.sessionNumber ?? ''}
                      </p>
                      {isNext && (
                        <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">Siguiente</span>
                      )}
                    </div>
                    <p className={`text-sm ${isCompleted ? 'text-stone-400 dark:text-white/35' : 'text-stone-600 dark:text-white/60'}`}>{session.name ?? ''}</p>
                    {isCompleted && (
                      <p className="text-emerald-600 dark:text-emerald-400 text-xs mt-1 italic">"{getCompletedMessage(completedIndex)}"</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!isCompleted && (
                      <div className="flex items-center gap-1 text-stone-400 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{session.duration ?? ''} min</span>
                      </div>
                    )}
                    <ChevronRight className={`w-5 h-5 ${isCompleted ? 'text-stone-300' : 'text-stone-400'}`} />
                  </div>
                </div>
              </Card>

              {/* Punto de notificación post-sesión */}
              {hasPendingAction && (
                <button
                  onClick={e => { e.stopPropagation(); openSessionPopup(session.id); }}
                  className="absolute -top-1.5 -right-1.5 z-10"
                  aria-label="Ver acciones"
                >
                  <motion.div
                    className="w-6 h-6 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center shadow-md"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  >
                    <Bell className="w-3 h-3 text-white" />
                  </motion.div>
                </button>
              )}
            </motion.div>
          );
        })}

        {progressData.completedSessions > 0 && progressData.completedSessions < progressData.totalSessions && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-stone-400 text-sm text-center pt-2 pb-1"
          >
            Cada sesión cuenta.
          </motion.p>
        )}

        {/* Resumen — stats tipo app de entrenamiento */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="pt-3 pb-2"
        >
          <h2 className="text-stone-600 dark:text-white/60 text-sm font-medium mb-2">Resumen</h2>
          <div className="grid grid-cols-3 gap-3">
            {/* Racha */}
            <Card className="glass-card border-0 rounded-2xl p-3.5 flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center mb-1.5">
                <Flame className="w-4 h-4 text-orange-500" />
              </div>
              <span className="text-2xl font-bold text-stone-900 dark:text-white leading-none">{weekStreak}</span>
              <span className="text-[10px] text-stone-400 mt-1">{weekStreak === 1 ? 'sem. seguida' : 'sem. seguidas'}</span>
            </Card>
            {/* Entrenos totales */}
            <Card className="glass-card border-0 rounded-2xl p-3.5 flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mb-1.5">
                <Dumbbell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-2xl font-bold text-stone-900 dark:text-white leading-none">{totalCompletedSessions}</span>
              <span className="text-[10px] text-stone-400 mt-1">entrenos</span>
            </Card>
            {/* Volumen total */}
            <Card className="glass-card border-0 rounded-2xl p-3.5 flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center mb-1.5">
                <BarChart2 className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="text-2xl font-bold text-stone-900 dark:text-white leading-none">{totalVolume > 0 ? volumeLabel : '—'}</span>
              <span className="text-[10px] text-stone-400 mt-1">{totalVolume > 0 ? 'kg movidos' : 'sin datos'}</span>
            </Card>
          </div>
        </motion.div>

        {/* Métricas corporales + Tu progreso */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-3 pt-1 pb-4"
        >
          {/* Métricas corporales */}
          <Card
            onClick={() => setShowMetricsModal(true)}
            className="p-4 glass-card border-0 rounded-2xl cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              {metricsHistory.length >= 2 && (
                <SparkLine
                  data={[...metricsHistory].reverse().filter(r => r.weight != null).map(r => ({ value: r.weight! }))}
                  color="#10b981"
                  height={28}
                />
              )}
            </div>
            <p className="text-stone-500 dark:text-white/50 text-xs mb-1">Métricas corporales</p>
            <p className="text-2xl font-bold text-stone-900 dark:text-white">
              {user.profile.weight} <span className="text-sm font-normal text-stone-400">kg</span>
            </p>
            {weightDelta != null ? (
              <p className="text-xs mt-1" style={{ color: weightDelta === 0 ? '#64748b' : weightDelta < 0 ? '#10b981' : '#f97316' }}>
                {weightDelta > 0 ? '+' : ''}{weightDelta.toFixed(1)} kg desde el anterior
              </p>
            ) : lastMeasurement ? (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                {[lastMeasurement.chest && `P ${lastMeasurement.chest}cm`, lastMeasurement.waist && `C ${lastMeasurement.waist}cm`].filter(Boolean).join(' · ') || 'Ver medidas'}
              </p>
            ) : (
              <p className="text-xs text-stone-400 mt-1">Añadir medidas →</p>
            )}
          </Card>

          {/* Tu progreso — abre modal con sesiones registradas */}
          <Card
            className="p-4 glass-card border-0 rounded-2xl cursor-pointer active:scale-95 transition-transform"
            onClick={() => setShowProgressModal(true)}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-teal-100 dark:bg-teal-500/20 rounded-xl flex items-center justify-center">
                <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              </div>
              <p className="text-stone-500 dark:text-white/50 text-xs">Tu progreso</p>
            </div>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {Object.keys(sessionLogsMap).length}
            </p>
            <p className="text-stone-400 text-xs">sesiones con registro</p>
            <p className="text-[10px] text-teal-500 mt-2">Ver detalles →</p>
          </Card>
        </motion.div>
      </div>

      {/* Modal de métricas */}
      <AnimatePresence>
        {showMetricsModal && (
          <MetricsModal
            gender={user.profile.biologicalProfile === 'female' ? 'female' : 'male'}
            currentWeight={user.profile.weight}
            lastRecord={metricsHistory[0] ?? lastMeasurement ?? null}
            history={metricsHistory}
            onSave={({ weight, record }) => {
              const history = [...(user.profile.measurementHistory ?? []), record];
              setUser({
                ...user,
                ...(weight ? { lastWeightUpdate: new Date() } : {}),
                profile: {
                  ...user.profile,
                  ...(weight ? { weight } : {}),
                  measurements: {
                    chest: record.chest,
                    waist: record.waist,
                    hips: record.hips,
                    arms: record.arms,
                  },
                  measurementHistory: history,
                },
              });
            }}
            onClose={() => setShowMetricsModal(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Popup de acciones post-sesión ── */}
      <AnimatePresence>
        {activeSessionPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-end"
            onClick={() => dismissSessionAction(activeSessionPopup.sessionId)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full glass-modal rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-stone-200 rounded-full mx-auto mb-5" />

              {popupPhase === 'actions' ? (
                (() => {
                  const pending = pendingActions(sessionActionsMap[activeSessionPopup.sessionId]);
                  return (
                  <>
                  <p className="text-xs text-stone-400 font-semibold uppercase tracking-wide mb-1">Sesión completada</p>
                  <h3 className="text-lg font-bold text-stone-900 mb-5">{activeSessionPopup.sessionName}</h3>

                  <div className="space-y-3">
                    {/* Registrar sesión */}
                    {pending.register ? (
                      <button
                        onClick={() => setPopupPhase('logging')}
                        className="w-full flex items-center gap-4 bg-stone-50 hover:bg-stone-100 rounded-2xl p-4 text-left transition-colors"
                      >
                        <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <BarChart2 className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-stone-900">Registrar sesión</p>
                          <p className="text-xs text-stone-400">Apunta pesos, reps y series de hoy</p>
                        </div>
                      </button>
                    ) : (
                      /* Ya registrado — se muestra como completado pero no interactivo */
                      <div className="w-full flex items-center gap-4 bg-emerald-50 rounded-2xl p-4 opacity-70">
                        <div className="w-11 h-11 bg-emerald-200 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Check className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-emerald-700">Sesión registrada ✓</p>
                          <p className="text-xs text-emerald-500">Ya guardaste los datos de hoy</p>
                        </div>
                      </div>
                    )}

                    {/* Publicar en Comunidad */}
                    {pending.community ? (
                      <button
                        onClick={() => { dismissAction(activeSessionPopup.sessionId, 'community'); setScreen('community'); }}
                        className="w-full flex items-center gap-4 bg-stone-50 hover:bg-stone-100 rounded-2xl p-4 text-left transition-colors"
                      >
                        <div className="w-11 h-11 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Users className="w-5 h-5 text-violet-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-stone-900">Publicar en Comunidad</p>
                          <p className="text-xs text-stone-400">Comparte tu entreno con los demás</p>
                        </div>
                      </button>
                    ) : (
                      <div className="w-full flex items-center gap-4 bg-violet-50 rounded-2xl p-4 opacity-70">
                        <div className="w-11 h-11 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Check className="w-5 h-5 text-violet-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-violet-700">Publicado en Comunidad ✓</p>
                          <p className="text-xs text-violet-400">Ya lo compartiste</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => dismissSessionAction(activeSessionPopup.sessionId)}
                    className="w-full mt-4 py-3 text-stone-400 text-sm font-medium"
                  >
                    Cerrar
                  </button>
                  </>
                  );
                })()
              ) : (
                /* ── Formulario por series ── */
                (() => {
                  const session = user?.weeklySessions?.find(s => s.id === activeSessionPopup.sessionId);
                  const exercises = session?.exercises ?? [];
                  return (
                    <>
                      <button onClick={() => setPopupPhase('actions')} className="flex items-center gap-2 text-stone-400 text-sm mb-4">
                        ← Volver
                      </button>
                      <p className="text-xs text-stone-400 font-semibold uppercase tracking-wide mb-1">Registrar sesión</p>
                      <h3 className="text-lg font-bold text-stone-900 mb-4">{activeSessionPopup.sessionName}</h3>

                      <div className="space-y-4 mb-6">
                        {exercises.map(ex => {
                          const mode = detectExerciseMode(ex.name);
                          const rows = exerciseEntries[ex.id] ?? Array.from({ length: ex.sets }, () => ({ weight: '', reps: String(ex.reps[0] ?? ''), seconds: '30', feel: 2 }));

                          const modeLabel = mode === 'stretch' ? '🧘 Estiramiento' : mode === 'timed' ? '⏱ Isométrico' : mode === 'bodyweight' ? '💪 Abdominales / Corporal' : '🏋️ Con peso';
                          const modeColor = mode === 'stretch' ? 'text-purple-600 bg-purple-50' : mode === 'timed' ? 'text-amber-600 bg-amber-50' : mode === 'bodyweight' ? 'text-blue-600 bg-blue-50' : 'text-emerald-600 bg-emerald-50';

                          return (
                            <div key={ex.id} className="bg-stone-50 dark:bg-white/6 rounded-2xl p-4 dark:text-white">
                              <div className="flex items-start justify-between mb-2">
                                <p className="font-semibold text-stone-900 text-sm">{ex.name}</p>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${modeColor}`}>{modeLabel}</span>
                              </div>

                              {/* Cabecera columnas */}
                              <div className={`grid gap-2 mb-2 ${mode === 'weighted' ? 'grid-cols-[2rem_1fr_1fr]' : mode === 'stretch' ? 'grid-cols-[2rem_1fr_1fr]' : 'grid-cols-[2rem_1fr]'}`}>
                                <span className="text-[10px] text-stone-400 font-semibold">S</span>
                                {mode === 'weighted' && <>
                                  <span className="text-[10px] text-stone-400 font-semibold">Peso (kg)</span>
                                  <span className="text-[10px] text-stone-400 font-semibold">Reps</span>
                                </>}
                                {mode === 'bodyweight' && (
                                  <span className="text-[10px] text-stone-400 font-semibold">Reps hechas</span>
                                )}
                                {mode === 'timed' && (
                                  <span className="text-[10px] text-stone-400 font-semibold">Segundos</span>
                                )}
                                {mode === 'stretch' && <>
                                  <span className="text-[10px] text-stone-400 font-semibold">Segundos</span>
                                  <span className="text-[10px] text-stone-400 font-semibold">Sensación</span>
                                </>}
                              </div>

                              {/* Filas por serie */}
                              <div className="space-y-2">
                                {rows.map((row, i) => (
                                  <div key={i} className={`grid gap-2 items-center ${mode === 'weighted' ? 'grid-cols-[2rem_1fr_1fr]' : mode === 'stretch' ? 'grid-cols-[2rem_1fr_1fr]' : 'grid-cols-[2rem_1fr]'}`}>
                                    {/* Número de serie */}
                                    <span className="w-8 h-8 rounded-lg bg-stone-200 flex items-center justify-center text-xs font-bold text-stone-600">{i + 1}</span>

                                    {mode === 'weighted' && <>
                                      <input
                                        type="number" inputMode="decimal"
                                        placeholder={i > 0 ? (rows[i - 1]?.weight || '0') : '0'}
                                        value={row.weight}
                                        onChange={e => setExerciseEntries(prev => {
                                          const updated = [...(prev[ex.id] ?? rows)];
                                          updated[i] = { ...updated[i], weight: e.target.value };
                                          return { ...prev, [ex.id]: updated };
                                        })}
                                        className="glass-input w-full rounded-xl px-3 py-2 text-sm"
                                      />
                                      <input
                                        type="number" inputMode="numeric"
                                        placeholder={String(ex.reps[0] ?? '')}
                                        value={row.reps}
                                        onChange={e => setExerciseEntries(prev => {
                                          const updated = [...(prev[ex.id] ?? rows)];
                                          updated[i] = { ...updated[i], reps: e.target.value };
                                          return { ...prev, [ex.id]: updated };
                                        })}
                                        className="glass-input w-full rounded-xl px-3 py-2 text-sm"
                                      />
                                    </>}

                                    {mode === 'bodyweight' && (
                                      <input
                                        type="number" inputMode="numeric"
                                        placeholder={String(ex.reps[0] ?? '')}
                                        value={row.reps}
                                        onChange={e => setExerciseEntries(prev => {
                                          const updated = [...(prev[ex.id] ?? rows)];
                                          updated[i] = { ...updated[i], reps: e.target.value };
                                          return { ...prev, [ex.id]: updated };
                                        })}
                                        className="glass-input w-full rounded-xl px-3 py-2 text-sm"
                                      />
                                    )}

                                    {mode === 'timed' && (
                                      <input
                                        type="number" inputMode="numeric"
                                        placeholder="30"
                                        value={row.seconds}
                                        onChange={e => setExerciseEntries(prev => {
                                          const updated = [...(prev[ex.id] ?? rows)];
                                          updated[i] = { ...updated[i], seconds: e.target.value };
                                          return { ...prev, [ex.id]: updated };
                                        })}
                                        className="glass-input w-full rounded-xl px-3 py-2 text-sm"
                                      />
                                    )}

                                    {mode === 'stretch' && <>
                                      <input
                                        type="number" inputMode="numeric"
                                        placeholder="30"
                                        value={row.seconds}
                                        onChange={e => setExerciseEntries(prev => {
                                          const updated = [...(prev[ex.id] ?? rows)];
                                          updated[i] = { ...updated[i], seconds: e.target.value };
                                          return { ...prev, [ex.id]: updated };
                                        })}
                                        className="glass-input w-full rounded-xl px-3 py-2 text-sm"
                                      />
                                      {/* Escala de sensación */}
                                      <div className="flex gap-1">
                                        {[{ v: 1, e: '😣' }, { v: 2, e: '😐' }, { v: 3, e: '😌' }].map(opt => (
                                          <button
                                            key={opt.v}
                                            type="button"
                                            onClick={() => setExerciseEntries(prev => {
                                              const updated = [...(prev[ex.id] ?? rows)];
                                              updated[i] = { ...updated[i], feel: opt.v };
                                              return { ...prev, [ex.id]: updated };
                                            })}
                                            className={`flex-1 py-1.5 rounded-lg text-base transition-all ${row.feel === opt.v ? 'bg-purple-100 scale-110' : 'bg-white border border-stone-200'}`}
                                          >
                                            {opt.e}
                                          </button>
                                        ))}
                                      </div>
                                    </>}
                                  </div>
                                ))}

                                {/* Añadir serie extra */}
                                <button
                                  type="button"
                                  onClick={() => setExerciseEntries(prev => ({
                                    ...prev,
                                    [ex.id]: [...(prev[ex.id] ?? rows), { weight: rows[rows.length - 1]?.weight ?? '', reps: String(ex.reps[0] ?? ''), seconds: '30', feel: 2 }],
                                  }))}
                                  className="text-xs text-emerald-600 font-medium pt-1"
                                >
                                  + Añadir serie
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => handleSaveLogs(activeSessionPopup.sessionId)}
                        disabled={savingLogs}
                        className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold disabled:opacity-60"
                      >
                        {savingLogs ? 'Guardando…' : 'Guardar y cerrar'}
                      </button>
                      <button
                        onClick={() => dismissSessionAction(activeSessionPopup.sessionId)}
                        className="w-full mt-3 py-2 text-stone-400 text-sm"
                      >
                        Cerrar sin guardar
                      </button>
                    </>
                  );
                })()
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal Tu progreso ── */}
      <AnimatePresence>
        {showProgressModal && (
          <ProgressDetailModal
            weeks={[
              ...[...(user.weeklyHistory ?? [])]
                .sort((a, b) => a.weekNumber - b.weekNumber)
                .map(w => ({ weekNumber: w.weekNumber, sessions: w.sessions, type: 'past' as const })),
              { weekNumber: user.currentWeek, sessions: user.weeklySessions ?? [], type: 'current' as const },
              { weekNumber: user.currentWeek + 1, sessions: generateNextWeekPreview(), type: 'future' as const },
            ]}
            logsMap={sessionLogsMap}
            onShareSession={session => {
              setShowProgressModal(false);
              setDashboardShareData({ content: session.name, minutes: session.duration, exercises: session.exercises.length });
            }}
            onSaveLogs={(sessionId, entries) => {
              if (!user?.id) return;
              const session = user.weeklySessions?.find(s => s.id === sessionId);
              if (!session) return;
              const updated = { ...sessionLogsMap };
              updated[sessionId] = {
                sessionId,
                sessionName: session.name,
                completedAt: updated[sessionId]?.completedAt ?? new Date().toISOString(),
                exercises: session.exercises.map(ex => {
                  const mode = detectExerciseMode(ex.name);
                  const rows = entries[ex.id] ?? [];
                  return {
                    exerciseId: ex.id,
                    exerciseName: ex.name,
                    mode,
                    setLogs: rows.map(row => ({
                      weight:  mode === 'weighted' ? (parseFloat(row.weight) || undefined) : undefined,
                      reps:    mode !== 'stretch' && mode !== 'timed' ? (parseInt(row.reps) || undefined) : undefined,
                      seconds: mode === 'timed' || mode === 'stretch' ? (parseInt(row.seconds) || 30) : undefined,
                      feel:    mode === 'stretch' ? row.feel : undefined,
                    })),
                  };
                }),
              };
              saveSessionLogs(user.id!, updated);
              setSessionLogsMap(updated);
            }}
            onClose={() => setShowProgressModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Tarjeta institucional del Coach (primera semana / nueva semana) */}
      {!showWeekPlanner && <CoachCardModal weekNumber={user.currentWeek} />}

      {/* Planificador semanal */}
      <AnimatePresence>
        {showWeekPlanner && nextWeekPreview.length > 0 && (
          <WeekPlannerModal
            sessions={nextWeekPreview}
            weekNumber={user.currentWeek}
            onConfirm={sessions => {
              startNewWeekWithPlan(sessions);
              setShowWeekPlanner(false);
            }}
            onClose={() => setShowWeekPlanner(false)}
          />
        )}
      </AnimatePresence>

      {/* ShareCard desde Tu progreso */}
      <AnimatePresence>
        {dashboardShareData && (
          <DashboardShareCardModalLazy
            data={{
              type: 'workout',
              content: dashboardShareData.content,
              workoutStats: { minutes: dashboardShareData.minutes, exercises: dashboardShareData.exercises },
              userName: user.profile.name ?? 'Usuario',
            }}
            onClose={() => setDashboardShareData(null)}
          />
        )}
      </AnimatePresence>

      <BottomNav active="dashboard" />
    </div>
  );
}

function DashboardShareCardModalLazy(props: {
  data: { type: 'workout'; content: string; workoutStats: { minutes: number; exercises: number }; userName: string };
  onClose: () => void;
}) {
  const [Comp, setComp] = useState<React.ComponentType<{ data: typeof props.data; onClose: () => void }> | null>(null);
  useState(() => {
    import('@/components/community/ShareCardModal').then(m => setComp(() => m.ShareCardModal as any));
  });
  if (!Comp) return null;
  return <Comp {...props} />;
}

// ─── Modal de detalle de progreso ─────────────────────────────────────────────
type ProgressWeek = {
  weekNumber: number;
  sessions: import('@/types/user').WeeklySession[];
  type: 'past' | 'current' | 'future';
};

function ProgressDetailModal({
  weeks,
  logsMap,
  onSaveLogs,
  onShareSession,
  onClose,
}: {
  weeks: ProgressWeek[];
  logsMap: SessionLogsMap;
  onSaveLogs: (sessionId: string, entries: ExerciseEntries) => void;
  onShareSession: (session: import('@/types/user').WeeklySession) => void;
  onClose: () => void;
}) {
  const currentIdx = Math.max(0, weeks.findIndex(w => w.type === 'current'));
  const [weekIdx, setWeekIdx] = useState(currentIdx);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEntries, setEditEntries] = useState<ExerciseEntries>({});

  const activeWeek = weeks[weekIdx] ?? weeks[currentIdx];
  const sessions = activeWeek?.sessions ?? [];
  const isCurrent = activeWeek?.type === 'current';
  const isFuture = activeWeek?.type === 'future';

  const weekLabel = activeWeek?.type === 'current' ? 'Esta semana'
    : activeWeek?.type === 'future' ? 'Próxima semana (planificada)'
    : `Semana ${activeWeek?.weekNumber}`;

  function goWeek(dir: -1 | 1) {
    setEditingId(null);
    setWeekIdx(i => Math.min(weeks.length - 1, Math.max(0, i + dir)));
  }

  function startEdit(sessionId: string) {
    const session = sessions.find(s => s.id === sessionId);
    const log = logsMap[sessionId];
    const defaults: ExerciseEntries = {};
    session?.exercises.forEach(ex => {
      const saved = log?.exercises.find(e => e.exerciseId === ex.id);
      defaults[ex.id] = saved?.setLogs?.map(sl => ({
        weight:  sl.weight  ? String(sl.weight)  : '',
        reps:    sl.reps    ? String(sl.reps)     : String(ex.reps[0] ?? ''),
        seconds: sl.seconds ? String(sl.seconds)  : '30',
        feel:    sl.feel    ?? 2,
      })) ?? Array.from({ length: ex.sets }, () => ({
        weight: '', reps: String(ex.reps[0] ?? ''), seconds: '30', feel: 2,
      }));
    });
    setEditEntries(defaults);
    setEditingId(sessionId);
  }

  function saveEdit(sessionId: string) {
    onSaveLogs(sessionId, editEntries);
    setEditingId(null);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-[60] flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="w-full max-w-md glass-modal rounded-t-3xl max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
          <h2 className="font-bold text-stone-900 dark:text-white text-lg">Tu progreso</h2>
          <button onClick={onClose} className="p-2 rounded-xl bg-stone-100 dark:bg-white/10">
            <X className="w-4 h-4 text-stone-600 dark:text-white/70" />
          </button>
        </div>

        {/* Selector de semana */}
        <div className="flex items-center justify-between px-5 pb-3 border-b border-stone-100 dark:border-white/8 flex-shrink-0">
          <button
            onClick={() => goWeek(-1)}
            disabled={weekIdx === 0}
            className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-white/10 flex items-center justify-center disabled:opacity-30 transition-opacity"
          >
            <Arrow className="w-4 h-4 text-stone-600 dark:text-white/70 rotate-180" />
          </button>
          <div className="text-center">
            <p className={`font-semibold text-sm ${isCurrent ? 'text-emerald-600 dark:text-emerald-400' : isFuture ? 'text-violet-600 dark:text-violet-400' : 'text-stone-700 dark:text-white/80'}`}>
              {weekLabel}
            </p>
            <p className="text-[10px] text-stone-400">
              {sessions.filter(s => s.status === 'completed').length}/{sessions.length} completadas
            </p>
          </div>
          <button
            onClick={() => goWeek(1)}
            disabled={weekIdx === weeks.length - 1}
            className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-white/10 flex items-center justify-center disabled:opacity-30 transition-opacity"
          >
            <Arrow className="w-4 h-4 text-stone-600 dark:text-white/70" />
          </button>
        </div>

        {/* Lista de sesiones */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
          {isFuture && (
            <div className="rounded-2xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 px-4 py-3 mb-1">
              <p className="text-violet-700 dark:text-violet-300 text-xs">
                Vista previa de tu próxima semana. Podrás registrar estos entrenos cuando llegues a ella.
              </p>
            </div>
          )}
          {sessions.length === 0 && (
            <p className="text-stone-400 text-sm text-center py-8">No hay sesiones en esta semana.</p>
          )}
          {sessions.map(session => {
            const log = logsMap[session.id];
            const isCompleted = session.status === 'completed';
            const isEditing = editingId === session.id;

            return (
              <div key={session.id} className={`rounded-2xl border ${isCompleted ? 'border-emerald-200 dark:border-emerald-500/25 bg-emerald-50 dark:bg-emerald-500/10' : 'border-stone-100 dark:border-white/8 bg-stone-50 dark:bg-white/5'}`}>
                {/* Cabecera sesión */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isCompleted ? 'bg-emerald-500' : 'bg-stone-200'}`}>
                      {isCompleted
                        ? <Check className="w-4 h-4 text-white" />
                        : <span className="text-stone-400 text-xs font-bold">{session.sessionNumber}</span>
                      }
                    </div>
                    <div>
                      <p className="font-semibold text-stone-900 text-sm">{session.name}</p>
                      {log && (
                        <p className="text-xs text-stone-400">
                          {new Date(log.completedAt).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </p>
                      )}
                    </div>
                  </div>
                  {isCompleted && isCurrent && (
                    <div className="flex gap-2 items-center">
                      {/* Botón compartir */}
                      <button
                        onClick={() => onShareSession(session)}
                        className="p-1.5 rounded-xl bg-white dark:bg-white/10 border border-stone-200 dark:border-white/12 text-stone-500 dark:text-white/50 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-300 transition-colors"
                        title="Compartir entrenamiento"
                      >
                        <Share2Icon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => isEditing ? saveEdit(session.id) : startEdit(session.id)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors ${isEditing ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-white/10 border border-stone-200 dark:border-white/12 text-stone-600 dark:text-white/70'}`}
                      >
                        {isEditing ? 'Guardar' : (log ? 'Editar' : 'Registrar')}
                      </button>
                    </div>
                  )}
                  {isCompleted && !isCurrent && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                      Completada
                    </span>
                  )}
                  {isFuture && (
                    <span className="text-xs text-stone-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />{session.duration} min
                    </span>
                  )}
                </div>

                {/* Ejercicios planificados / registrados / formulario */}
                {(isCompleted || isFuture) && (
                  <div className="px-4 pb-4">
                    {isFuture ? (
                      <div className="space-y-1.5">
                        {session.exercises.map(ex => (
                          <div key={ex.id} className="flex items-center justify-between bg-white dark:bg-white/6 rounded-xl px-3 py-2">
                            <span className="text-xs text-stone-700 dark:text-white/80">{ex.name}</span>
                            <span className="text-[10px] text-stone-400">{ex.sets}×{ex.reps[0] ?? ''}</span>
                          </div>
                        ))}
                      </div>
                    ) : isEditing ? (
                      <div className="space-y-2">
                        {session.exercises.map(ex => {
                          const mode = detectExerciseMode(ex.name);
                          const rows = editEntries[ex.id] ?? Array.from({ length: ex.sets }, () => ({ weight: '', reps: String(ex.reps[0] ?? ''), seconds: '30', feel: 2 }));
                          return (
                          <div key={ex.id} className="bg-white dark:bg-white/6 rounded-xl p-3">
                            <p className="text-xs font-semibold text-stone-700 mb-2">{ex.name}</p>
                            <div className="space-y-1.5">
                              {rows.map((row, i) => (
                                <div key={i} className="flex gap-2 items-center">
                                  <span className="w-6 h-6 rounded-md bg-stone-100 flex items-center justify-center text-[10px] font-bold text-stone-500 flex-shrink-0">{i + 1}</span>
                                  {mode === 'weighted' && <>
                                    <input type="number" inputMode="decimal" placeholder="0 kg" value={row.weight}
                                      onChange={e => setEditEntries(prev => { const u = [...(prev[ex.id] ?? rows)]; u[i] = { ...u[i], weight: e.target.value }; return { ...prev, [ex.id]: u }; })}
                                      className="flex-1 border border-stone-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-emerald-400" />
                                    <input type="number" inputMode="numeric" placeholder={String(ex.reps[0])} value={row.reps}
                                      onChange={e => setEditEntries(prev => { const u = [...(prev[ex.id] ?? rows)]; u[i] = { ...u[i], reps: e.target.value }; return { ...prev, [ex.id]: u }; })}
                                      className="flex-1 border border-stone-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-emerald-400" />
                                    <span className="text-[10px] text-stone-400 flex-shrink-0">rep</span>
                                  </>}
                                  {(mode === 'bodyweight') && (
                                    <input type="number" inputMode="numeric" placeholder={String(ex.reps[0])} value={row.reps}
                                      onChange={e => setEditEntries(prev => { const u = [...(prev[ex.id] ?? rows)]; u[i] = { ...u[i], reps: e.target.value }; return { ...prev, [ex.id]: u }; })}
                                      className="flex-1 border border-stone-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-emerald-400" />
                                  )}
                                  {(mode === 'timed' || mode === 'stretch') && (
                                    <input type="number" inputMode="numeric" placeholder="30 s" value={row.seconds}
                                      onChange={e => setEditEntries(prev => { const u = [...(prev[ex.id] ?? rows)]; u[i] = { ...u[i], seconds: e.target.value }; return { ...prev, [ex.id]: u }; })}
                                      className="flex-1 border border-stone-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-emerald-400" />
                                  )}
                                  {mode === 'stretch' && (
                                    <div className="flex gap-1">
                                      {[{ v: 1, e: '😣' }, { v: 2, e: '😐' }, { v: 3, e: '😌' }].map(opt => (
                                        <button key={opt.v} type="button"
                                          onClick={() => setEditEntries(prev => { const u = [...(prev[ex.id] ?? rows)]; u[i] = { ...u[i], feel: opt.v }; return { ...prev, [ex.id]: u }; })}
                                          className={`w-7 h-7 rounded-lg text-sm ${row.feel === opt.v ? 'bg-purple-100' : 'bg-stone-50 border border-stone-200'}`}
                                        >{opt.e}</button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    ) : log ? (
                      <div className="space-y-2">
                        {log.exercises.map(ex => (
                          <div key={ex.exerciseId} className="bg-white rounded-xl px-3 py-2.5">
                            <div className="flex items-center justify-between mb-1.5">
                              <p className="text-xs text-stone-700 font-semibold">{ex.exerciseName}</p>
                              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                                ex.mode === 'stretch' ? 'bg-purple-50 text-purple-600'
                                : ex.mode === 'timed' ? 'bg-amber-50 text-amber-600'
                                : ex.mode === 'bodyweight' ? 'bg-blue-50 text-blue-600'
                                : 'bg-emerald-50 text-emerald-600'
                              }`}>
                                {ex.mode === 'stretch' ? '🧘' : ex.mode === 'timed' ? '⏱' : ex.mode === 'bodyweight' ? '💪' : '🏋️'}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {ex.setLogs?.map((sl, i) => (
                                <span key={i} className="text-[10px] bg-stone-50 border border-stone-100 text-stone-600 rounded-lg px-2 py-1 font-mono">
                                  S{i + 1}:{' '}
                                  {ex.mode === 'stretch' || ex.mode === 'timed'
                                    ? `${sl.seconds ?? '?'}s${sl.feel ? ['', '😣', '😐', '😌'][sl.feel] : ''}`
                                    : `${sl.reps ?? '?'}rep${sl.weight ? ` · ${sl.weight}kg` : ''}`
                                  }
                                </span>
                              )) ?? <span className="text-[10px] text-stone-300">Sin datos</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : isCurrent ? (
                      <p className="text-xs text-stone-400 italic">Sin datos registrados. Pulsa "Registrar".</p>
                    ) : (
                      <div className="space-y-1.5">
                        {session.exercises.map(ex => (
                          <div key={ex.id} className="flex items-center justify-between bg-white dark:bg-white/6 rounded-xl px-3 py-2">
                            <span className="text-xs text-stone-700 dark:text-white/80">{ex.name}</span>
                            <span className="text-[10px] text-stone-400">{ex.sets} series</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
