'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { BottomNav } from '@/components/ui/BottomNav';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import type { WeekRecord } from '@/types/user';
import {
  ArrowLeft,
  Calendar,
  Dumbbell,
  Clock,
  TrendingUp,
  History as HistoryIcon,
  ChevronDown,
  ChevronRight,
  Weight,
  Check,
} from 'lucide-react';

function formatDate(date: Date | string) {
  const d = new Date(date);
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
}

function WeekBlock({ record, defaultOpen = false }: { record: WeekRecord; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const completed = record.sessions.filter(s => s.status === 'completed');
  const all = record.sessions.length;
  const full = completed.length === all;

  return (
    <Card className="glass-card border-0 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${full ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-stone-100 dark:bg-white/8'}`}>
            {full
              ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              : <Calendar className="w-4 h-4 text-stone-500 dark:text-white/50" />}
          </div>
          <div>
            <p className="font-semibold text-stone-900 text-sm">Semana {record.weekNumber}</p>
            <p className="text-xs text-stone-400">
              {completed.length} de {all} sesiones · {formatDate(record.closedAt)}
            </p>
          </div>
        </div>
        {open
          ? <ChevronDown className="w-4 h-4 text-stone-400 flex-shrink-0" />
          : <ChevronRight className="w-4 h-4 text-stone-400 flex-shrink-0" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2 border-t border-stone-100 dark:border-white/8 pt-3">
              {record.sessions.map(session => (
                <div key={session.id} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${session.status === 'completed' ? 'bg-emerald-500' : 'bg-stone-200 dark:bg-white/10'}`}>
                    {session.status === 'completed'
                      ? <Check className="w-3 h-3 text-white" />
                      : <span className="w-2 h-2 rounded-full bg-stone-400 dark:bg-white/30" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800">
                      Sesión {session.sessionNumber} · {session.name}
                    </p>
                    <p className="text-xs text-stone-400">
                      {session.status === 'completed' && session.completedAt
                        ? formatDate(session.completedAt)
                        : session.status === 'completed' ? 'Completada' : 'No realizada'}
                      {' · '}{session.duration} min
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export function HistoryScreen() {
  const { user, setScreen, exerciseLogs } = useApp();
  const [activeTab, setActiveTab] = useState<'sessions' | 'progress'>('sessions');

  if (!user) return null;

  const isFirstMonth = user.currentWeek <= 4;

  // Sesiones completadas en la semana actual
  const currentCompleted = user.weeklySessions?.filter(s => s.status === 'completed') || [];

  // Todas las completadas en historial pasado
  const historyCompleted = (user.weeklyHistory || []).reduce(
    (sum, w) => sum + w.sessions.filter(s => s.status === 'completed').length, 0
  );
  const totalCompleted = currentCompleted.length + historyCompleted;

  // Semanas anteriores en orden inverso (más reciente primero)
  const pastWeeks = [...(user.weeklyHistory || [])].reverse();

  // Group exercise logs by exercise name
  const exerciseProgress = exerciseLogs.reduce((acc, log) => {
    const session = user.weeklySessions?.find(s =>
      s.exercises.some(e => e.id === log.exerciseId)
    );
    const exercise = session?.exercises.find(e => e.id === log.exerciseId);
    const name = exercise?.name || 'Ejercicio desconocido';
    if (!acc[name]) acc[name] = [];
    acc[name].push(log);
    return acc;
  }, {} as Record<string, typeof exerciseLogs>);

  const getProgressTrend = (logs: typeof exerciseLogs): 'up' | 'down' | 'same' => {
    if (logs.length < 2) return 'same';
    const recent = logs.slice(-3);
    const firstWeight = recent[0].weight || 0;
    const lastWeight = recent[recent.length - 1].weight || 0;
    if (lastWeight > firstWeight) return 'up';
    if (lastWeight < firstWeight) return 'down';
    return 'same';
  };

  return (
    <div className="min-h-dvh glass-bg flex flex-col pb-32">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 pt-8 pb-6"
      >
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setScreen('dashboard')}
            className="p-2 rounded-xl glass-btn transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-stone-600" />
          </button>
          <h1 className="text-2xl font-bold text-stone-900">Historial</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 glass-card rounded-xl">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'sessions'
                ? 'bg-white dark:bg-white/15 text-stone-900 shadow-sm'
                : 'text-stone-600'
            }`}
          >
            Sesiones
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'progress'
                ? 'bg-white dark:bg-white/15 text-stone-900 shadow-sm'
                : 'text-stone-600'
            }`}
          >
            Progreso
          </button>
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 px-6 space-y-4">
        {activeTab === 'sessions' ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="p-3 glass-card border-0 rounded-2xl text-center">
                <Dumbbell className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                <p className="text-xl font-bold text-stone-900">{totalCompleted}</p>
                <p className="text-xs text-stone-400">entrenos</p>
              </Card>
              <Card className="p-3 glass-card border-0 rounded-2xl text-center">
                <Calendar className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                <p className="text-xl font-bold text-stone-900">{user.currentWeek}</p>
                <p className="text-xs text-stone-400">semanas</p>
              </Card>
              <Card className="p-3 glass-card border-0 rounded-2xl text-center">
                <TrendingUp className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                <p className="text-xl font-bold text-stone-900">
                  {currentCompleted.length > 0
                    ? Math.max(...currentCompleted.map(s => s.sessionNumber))
                    : historyCompleted}
                </p>
                <p className="text-xs text-stone-400">última ses.</p>
              </Card>
            </div>

            {/* First month message */}
            {user.level === 'beginner' && isFirstMonth && (
              <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 rounded-2xl p-4">
                <p className="text-emerald-800 dark:text-emerald-300 text-sm leading-relaxed">
                  Durante el primer mes nos centramos en crear el hábito. El progreso aparece después.
                </p>
              </div>
            )}

            {/* Semana actual */}
            {currentCompleted.length === 0 && pastWeeks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 mx-auto bg-stone-100 rounded-2xl flex items-center justify-center mb-4">
                  <HistoryIcon className="w-8 h-8 text-stone-400" />
                </div>
                <h3 className="font-semibold text-stone-900 mb-2">Aún no hay entrenos</h3>
                <p className="text-stone-500 text-sm">Completa tu primera sesión y aparecerá aquí</p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {/* Semana en curso (si hay sesiones completadas) */}
                {currentCompleted.length > 0 && (
                  <WeekBlock
                    record={{
                      weekNumber: user.currentWeek,
                      sessions: user.weeklySessions || [],
                      startedAt: user.lastWeeklyCheckIn?.toISOString() || new Date().toISOString(),
                      closedAt: new Date().toISOString(),
                    }}
                    defaultOpen
                  />
                )}

                {/* Semanas anteriores */}
                {pastWeeks.length > 0 && (
                  <>
                    {currentCompleted.length > 0 && (
                      <p className="text-stone-500 text-xs font-medium uppercase tracking-wide pt-1">Semanas anteriores</p>
                    )}
                    {pastWeeks.map(week => (
                      <WeekBlock key={week.weekNumber} record={week} />
                    ))}
                  </>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Progress Tab */}
            {exerciseLogs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 mx-auto bg-stone-100 rounded-2xl flex items-center justify-center mb-4">
                  <Weight className="w-8 h-8 text-stone-400" />
                </div>
                <h3 className="font-semibold text-stone-900 mb-2">Sin registros de peso</h3>
                <p className="text-stone-500 text-sm">
                  Registra pesos en tus entrenos para ver tu progreso
                </p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <p className="text-stone-600 text-sm">
                  Tu progreso por ejercicio
                </p>

                {Object.entries(exerciseProgress).map(([name, logs], i) => {
                  const trend = getProgressTrend(logs);
                  const lastWeight = logs[logs.length - 1]?.weight || 0;
                  const firstWeight = logs[0]?.weight || 0;
                  const improvement = lastWeight - firstWeight;

                  return (
                    <motion.div
                      key={name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card className="p-4 glass-card border-0 rounded-2xl">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-stone-900">{name}</h3>
                            <p className="text-stone-500 text-sm">
                              {logs.length} registros
                            </p>
                          </div>
                          {trend === 'up' && (
                            <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                              <TrendingUp className="w-4 h-4" />
                              <span className="text-sm font-medium">+{improvement.toFixed(1)} kg</span>
                            </div>
                          )}
                        </div>

                        {/* Weight history */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {logs.slice(-5).map((log, j) => (
                            <div
                              key={j}
                              className="flex-shrink-0 bg-stone-100 rounded-xl px-3 py-2 text-center"
                            >
                              <p className="text-lg font-bold text-stone-900">{log.weight || '-'}</p>
                              <p className="text-xs text-stone-500">kg</p>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between mt-2 text-sm">
                          <span className="text-stone-400">Primer registro: {firstWeight} kg</span>
                          <span className="text-stone-600 font-medium">Actual: {lastWeight} kg</span>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav active="history" />
    </div>
  );
}
