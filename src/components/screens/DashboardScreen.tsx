'use client';

import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  Dumbbell,
  MessageCircle,
  ChevronRight,
  Check,
  Clock,
  Apple,
  User,
  Home
} from 'lucide-react';

export function DashboardScreen() {
  const { user, setScreen, setSelectedWeeklySession } = useApp();

  // Calculate progress percentage - must be before any returns
  const progressData = useMemo(() => {
    const completedSessions = user?.weeklySessions?.filter(s => s.status === 'completed').length || 0;
    const totalSessions = user?.weeklySessions?.length || 0;

    // Base progress: profile completed (20%) + onboarding completed (20%)
    const baseProgress = 40;

    // Session progress: remaining 60% based on sessions
    const sessionProgress = totalSessions > 0
      ? Math.round((completedSessions / totalSessions) * 60)
      : 0;

    const totalProgress = baseProgress + sessionProgress;

    return {
      percentage: totalProgress,
      completedSessions,
      totalSessions,
    };
  }, [user?.weeklySessions]);

  // Get ordered sessions: completed first, then next (available), then rest
  const orderedSessions = useMemo(() => {
    if (!user?.weeklySessions) return [];

    const completed = user.weeklySessions.filter(s => s.status === 'completed');
    const available = user.weeklySessions.filter(s => s.status === 'available');
    const locked = user.weeklySessions.filter(s => s.status === 'locked');

    return [...completed, ...available, ...locked];
  }, [user?.weeklySessions]);

  // Get next session (first available)
  const nextSession = useMemo(() => {
    return user?.weeklySessions?.find(s => s.status === 'available') || null;
  }, [user?.weeklySessions]);

  // Early return after hooks
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

  // Get supportive message for completed sessions
  const getCompletedMessage = (index: number) => {
    const messages = ['Buen comienzo', 'Vas bien', 'Sigue así', 'Ya has empezado'];
    return messages[index % messages.length];
  };

  // Get progress message
  const getProgressMessage = () => {
    if (progressData.completedSessions === 0) {
      return 'Ya has dado el primer paso. Sigue a tu ritmo.';
    } else if (progressData.completedSessions === progressData.totalSessions) {
      return 'Semana completada. Esto cuenta.';
    } else {
      return 'Ya has empezado. Sigue a tu ritmo.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 flex flex-col pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 pt-8 pb-4"
      >
        <div className="mb-2">
          <p className="text-stone-500 text-sm">{getGreeting()}</p>
          <h1 className="text-2xl font-bold text-stone-900">{user?.profile?.name ?? 'Usuario'}</h1>
        </div>
        <p className="text-stone-400 text-sm">
          Vamos paso a paso.
        </p>
      </motion.div>

      {/* Week Progress Card - Percentage Based */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-6 pb-6"
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

          {/* Progress bar */}
          <div className="h-3 bg-stone-100 rounded-full overflow-hidden mb-3">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressData.percentage}%` }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </div>

          <p className="text-stone-400 text-sm">
            {getProgressMessage()}
          </p>
        </Card>
      </motion.div>

      {/* Session List */}
      <div className="flex-1 px-6 space-y-3 overflow-y-auto">
        <h2 className="text-stone-600 text-sm font-medium mb-2">
          Sesiones
        </h2>

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
                  isNext
                    ? 'bg-emerald-50 shadow-md hover:shadow-lg'
                    : isCompleted
                    ? 'bg-stone-50 hover:bg-stone-100'
                    : 'bg-white shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Session Icon/Number */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isCompleted
                      ? 'bg-emerald-100'
                      : isNext
                      ? 'bg-emerald-500'
                      : 'bg-stone-100'
                  }`}>
                    {isCompleted ? (
                      <Check className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <span className={`text-lg font-bold ${
                        isNext ? 'text-white' : 'text-stone-600'
                      }`}>
                        {session.sessionNumber ?? ''}
                      </span>
                    )}
                  </div>

                  {/* Session Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`font-semibold ${
                        isCompleted ? 'text-stone-600' : 'text-stone-900'
                      }`}>
                        Sesión {session.sessionNumber ?? ''}
                      </p>
                      {isNext && (
                        <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                          Siguiente
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${
                      isCompleted ? 'text-stone-400' : 'text-stone-600'
                    }`}>
                      {session.name ?? ''}
                    </p>
                    {isCompleted && (
                      <p className="text-emerald-600 text-xs mt-1 italic">
                        "{getCompletedMessage(completedIndex)}"
                      </p>
                    )}
                  </div>

                  {/* Duration & Arrow */}
                  <div className="flex items-center gap-2">
                    {!isCompleted && (
                      <div className="flex items-center gap-1 text-stone-400 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{session.duration ?? ''} min</span>
                      </div>
                    )}
                    <ChevronRight className={`w-5 h-5 ${
                      isCompleted ? 'text-stone-300' : 'text-stone-400'
                    }`} />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}

        {/* Supportive bottom message */}
        {progressData.completedSessions > 0 && progressData.completedSessions < progressData.totalSessions && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-stone-400 text-sm text-center pt-4 pb-2"
          >
            Cada sesión cuenta.
          </motion.p>
        )}
      </div>

      {/* Bottom Navigation - 4 Tabs */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-stone-200 px-4 py-3">
        <div className="max-w-md mx-auto flex justify-around">
          <button
            onClick={() => setScreen('dashboard')}
            className="flex flex-col items-center gap-1 px-4 py-1"
          >
            <Home className="w-6 h-6 text-emerald-500" />
            <span className="text-xs text-emerald-600 font-medium">Inicio</span>
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
