'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { MetricsModal } from './MetricsModal';

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

export function DashboardScreen() {
  const { user, setUser, setScreen, setSelectedWeeklySession } = useApp();
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [dismissedMetricAlert, setDismissedMetricAlert] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 flex flex-col pb-24">

      {/* Header con avatar de perfil arriba a la derecha */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 pt-8 pb-4"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-stone-500 text-sm">{getGreeting()}</p>
            <h1 className="text-2xl font-bold text-stone-900">{user?.profile?.name ?? 'Usuario'}</h1>
            <p className="text-stone-400 text-sm mt-1">Vamos paso a paso.</p>
          </div>
          <button
            onClick={() => setScreen('profile')}
            className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-md shadow-emerald-100 flex-shrink-0 mt-1"
          >
            <span className="text-white font-bold text-lg">
              {user.profile.name?.charAt(0).toUpperCase() ?? 'U'}
            </span>
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
            className="mx-6 mb-2"
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
        className="px-6 pb-4"
      >
        <Card className="p-5 bg-white border-0 rounded-2xl shadow-sm">
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
      <div className="flex-1 px-6 space-y-3 overflow-y-auto">
        <h2 className="text-stone-600 text-sm font-medium mb-2">Sesiones</h2>

        {orderedSessions.map((session, index) => {
          const isNext = nextSession?.id === session.id;
          const isCompleted = session.status === 'completed';
          const completedIndex = user?.weeklySessions
            ?.filter(s => s.status === 'completed')
            .findIndex(s => s.id === session.id) ?? 0;

          return (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
            >
              <Card
                onClick={() => handleSessionClick(session)}
                className={`p-4 cursor-pointer border-0 rounded-2xl transition-all ${
                  isNext ? 'bg-emerald-50 shadow-md hover:shadow-lg'
                  : isCompleted ? 'bg-stone-50 hover:bg-stone-100'
                  : 'bg-white shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isCompleted ? 'bg-emerald-100' : isNext ? 'bg-emerald-500' : 'bg-stone-100'
                  }`}>
                    {isCompleted
                      ? <Check className="w-6 h-6 text-emerald-600" />
                      : <span className={`text-lg font-bold ${isNext ? 'text-white' : 'text-stone-600'}`}>{session.sessionNumber ?? ''}</span>
                    }
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`font-semibold ${isCompleted ? 'text-stone-600' : 'text-stone-900'}`}>
                        Sesión {session.sessionNumber ?? ''}
                      </p>
                      {isNext && (
                        <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">Siguiente</span>
                      )}
                    </div>
                    <p className={`text-sm ${isCompleted ? 'text-stone-400' : 'text-stone-600'}`}>{session.name ?? ''}</p>
                    {isCompleted && (
                      <p className="text-emerald-600 text-xs mt-1 italic">"{getCompletedMessage(completedIndex)}"</p>
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

        {/* Métricas corporales + progreso */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-3 pt-2 pb-4"
        >
          {/* Métricas corporales */}
          <Card
            onClick={() => setShowMetricsModal(true)}
            className="p-4 bg-white border-0 rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <Arrow className="w-4 h-4 text-stone-300" />
            </div>
            <p className="text-stone-500 text-xs mb-1">Métricas corporales</p>
            <p className="text-2xl font-bold text-stone-900">
              {user.profile.weight} <span className="text-sm font-normal text-stone-400">kg</span>
            </p>
            {lastMeasurement ? (
              <p className="text-xs text-emerald-600 mt-1">
                {[
                  lastMeasurement.chest && `P ${lastMeasurement.chest}cm`,
                  lastMeasurement.waist && `C ${lastMeasurement.waist}cm`,
                ].filter(Boolean).join(' · ') || 'Ver medidas'}
              </p>
            ) : (
              <p className="text-xs text-stone-400 mt-1">Añadir medidas</p>
            )}
          </Card>

          {/* Progreso */}
          <Card className="p-4 bg-white border-0 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-teal-100 rounded-xl flex items-center justify-center">
                <Activity className="w-4 h-4 text-teal-600" />
              </div>
              <p className="text-stone-500 text-xs">Tu progreso</p>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-2xl font-bold text-emerald-600">{totalCompletedSessions}</p>
                <p className="text-stone-400 text-xs">Sesiones</p>
              </div>
              <div>
                <p className="text-xl font-bold text-teal-600">{user.currentWeek}</p>
                <p className="text-stone-400 text-xs">Semanas activas</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Modal de métricas */}
      <AnimatePresence>
        {showMetricsModal && (
          <MetricsModal
            gender={user.profile.biologicalProfile === 'female' ? 'female' : 'male'}
            currentWeight={user.profile.weight}
            lastRecord={lastMeasurement ?? null}
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

      {/* Bottom Navigation — 3 tabs (perfil movido arriba) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-stone-200 px-4 py-3">
        <div className="max-w-md mx-auto flex justify-around">
          <button onClick={() => setScreen('dashboard')} className="flex flex-col items-center gap-1 px-6 py-1">
            <Home className="w-6 h-6 text-emerald-500" />
            <span className="text-xs text-emerald-600 font-medium">Inicio</span>
          </button>
          <button onClick={() => setScreen('chat')} className="flex flex-col items-center gap-1 px-6 py-1">
            <MessageCircle className="w-6 h-6 text-stone-400" />
            <span className="text-xs text-stone-400">Asistente</span>
          </button>
          <button onClick={() => setScreen('nutrition')} className="flex flex-col items-center gap-1 px-6 py-1">
            <Apple className="w-6 h-6 text-stone-400" />
            <span className="text-xs text-stone-400">Nutrición</span>
          </button>
        </div>
      </div>
    </div>
  );
}
