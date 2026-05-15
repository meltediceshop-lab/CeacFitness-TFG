'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Dumbbell,
  Clock,
  TrendingUp,
  History as HistoryIcon,
  User,
  ChevronRight,
  Weight,
  MessageCircle,
  Apple,
  Home
} from 'lucide-react';

export function HistoryScreen() {
  const { user, setScreen, exerciseLogs } = useApp();
  const [activeTab, setActiveTab] = useState<'sessions' | 'progress'>('sessions');

  if (!user) return null;

  const isFirstMonth = user.currentWeek <= 4;
  const showComparisons = user.level === 'advanced' || !isFirstMonth;

  // Get completed sessions from weeklySessions
  const completedSessions = user.weeklySessions?.filter(s => s.status === 'completed') || [];

  // Group exercise logs by exercise name
  const exerciseProgress = exerciseLogs.reduce((acc, log) => {
    const session = user.weeklySessions?.find(s =>
      s.exercises.some(e => e.id === log.exerciseId)
    );
    const exercise = session?.exercises.find(e => e.id === log.exerciseId);
    const name = exercise?.name || 'Ejercicio desconocido';

    if (!acc[name]) {
      acc[name] = [];
    }
    acc[name].push(log);
    return acc;
  }, {} as Record<string, typeof exerciseLogs>);

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
  };

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
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 flex flex-col pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 pt-8 pb-6"
      >
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setScreen('dashboard')}
            className="p-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-stone-600" />
          </button>
          <h1 className="text-2xl font-bold text-stone-900">Historial</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-stone-200 rounded-xl">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'sessions'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600'
            }`}
          >
            Sesiones
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'progress'
                ? 'bg-white text-stone-900 shadow-sm'
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
            {/* Stats summary */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-white border-0 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 text-stone-500 text-sm mb-1">
                  <Dumbbell className="w-4 h-4 text-emerald-500" />
                  Total entrenos
                </div>
                <p className="text-2xl font-bold text-stone-900">
                  {completedSessions.length}
                </p>
              </Card>
              <Card className="p-4 bg-white border-0 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 text-stone-500 text-sm mb-1">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  Semana
                </div>
                <p className="text-2xl font-bold text-stone-900">{user.currentWeek}</p>
              </Card>
            </div>

            {/* First month message for beginners */}
            {user.level === 'beginner' && isFirstMonth && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4"
              >
                <p className="text-emerald-800 text-sm leading-relaxed">
                  Durante el primer mes nos centramos en crear el hábito.
                  Las comparaciones de peso y progreso aparecerán después.
                </p>
              </motion.div>
            )}

            {/* Completed sessions */}
            {completedSessions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 mx-auto bg-stone-100 rounded-2xl flex items-center justify-center mb-4">
                  <HistoryIcon className="w-8 h-8 text-stone-400" />
                </div>
                <h3 className="font-semibold text-stone-900 mb-2">Aún no hay entrenos</h3>
                <p className="text-stone-500 text-sm">
                  Completa tu primera sesión y aparecerá aquí
                </p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {completedSessions.map((session, i) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="p-4 bg-white border-0 rounded-2xl shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-stone-400 text-sm">
                            {session.completedAt ? formatDate(session.completedAt) : 'Completada'}
                          </p>
                          <h3 className="font-semibold text-stone-900">{session.name}</h3>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700 border-0">
                          Completada
                        </Badge>
                      </div>
                      <div className="flex gap-4 text-sm text-stone-500">
                        <span className="flex items-center gap-1">
                          <Dumbbell className="w-4 h-4" />
                          {session.exercises.length} ejercicios
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {session.duration} min
                        </span>
                      </div>
                    </Card>
                  </motion.div>
                ))}
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
                      <Card className="p-4 bg-white border-0 rounded-2xl shadow-sm">
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

      {/* Bottom Navigation - 4 Tabs */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-stone-200 px-4 py-3">
        <div className="max-w-md mx-auto flex justify-around">
          <button
            onClick={() => setScreen('dashboard')}
            className="flex flex-col items-center gap-1 px-4 py-1"
          >
            <Home className="w-6 h-6 text-stone-400" />
            <span className="text-xs text-stone-400">Inicio</span>
          </button>
          <button
            onClick={() => setScreen('chat')}
            className="flex flex-col items-center gap-1 px-4 py-1"
          >
            <MessageCircle className="w-6 h-6 text-stone-400" />
            <span className="text-xs text-stone-400">Asistente</span>
          </button>
          <button
            onClick={() => setScreen('nutrition')}
            className="flex flex-col items-center gap-1 px-4 py-1"
          >
            <Apple className="w-6 h-6 text-stone-400" />
            <span className="text-xs text-stone-400">Nutrición</span>
          </button>
          <button
            onClick={() => setScreen('profile')}
            className="flex flex-col items-center gap-1 px-4 py-1"
          >
            <User className="w-6 h-6 text-stone-400" />
            <span className="text-xs text-stone-400">Perfil</span>
          </button>
        </div>
      </div>
    </div>
  );
}
