'use client';

import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Calendar, RefreshCw, Clock, Sparkles } from 'lucide-react';

export function WeeklyCheckInScreen() {
  const { user, handleWeeklyCheckIn, setShowWeeklyCheckIn } = useApp();

  if (!user) return null;

  const completedLastWeek = user.weeklySessions?.filter(s => s.status === 'completed').length || 0;
  const totalLastWeek = user.weeklySessions?.length || 0;

  return (
    <div className="min-h-dvh glass-bg flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200"
          >
            <Calendar className="w-10 h-10 text-white" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">
              Plan para esta semana
            </h1>
            <p className="text-stone-500 mt-2">
              Empezamos una nueva semana. Vamos paso a paso.
            </p>
          </div>
        </div>

        {/* Last week summary */}
        {totalLastWeek > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass-card bg-emerald-50 p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-emerald-800 font-medium">
                    La semana pasada completaste {completedLastWeek} de {totalLastWeek} sesiones
                  </p>
                  <p className="text-emerald-600 text-sm">
                    {completedLastWeek === totalLastWeek
                      ? '¡Excelente trabajo!'
                      : completedLastWeek > 0
                        ? 'Cada entreno cuenta'
                        : 'Esta semana empezamos de nuevo'}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Question */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold text-stone-900 text-center">
            ¿Quieres mantener los mismos días de entreno esta semana?
          </h2>

          <div className="space-y-3">
            <Card
              onClick={() => handleWeeklyCheckIn('same')}
              className="glass-card p-5 cursor-pointer border-2 border-transparent hover:border-emerald-300 transition-all rounded-2xl group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                  <RefreshCw className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-stone-900">Los mismos que la semana pasada</p>
                  <p className="text-stone-500 text-sm">Generar nuevas sesiones con la misma estructura</p>
                </div>
              </div>
            </Card>

            <Card
              onClick={() => {
                // For now, just close and go to dashboard
                // In the future, this would open a day selection flow
                handleWeeklyCheckIn('decide-later');
              }}
              className="glass-card p-5 cursor-pointer border-2 border-transparent hover:border-emerald-300 transition-all rounded-2xl group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center group-hover:bg-stone-200 transition-colors">
                  <Calendar className="w-6 h-6 text-stone-600" />
                </div>
                <div>
                  <p className="font-semibold text-stone-900">Cambiar días</p>
                  <p className="text-stone-500 text-sm">Ajustar los días de entrenamiento</p>
                </div>
              </div>
            </Card>

            <Card
              onClick={() => handleWeeklyCheckIn('decide-later')}
              className="glass-card p-5 cursor-pointer border-2 border-transparent hover:border-emerald-300 transition-all rounded-2xl group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center group-hover:bg-stone-200 transition-colors">
                  <Clock className="w-6 h-6 text-stone-600" />
                </div>
                <div>
                  <p className="font-semibold text-stone-900">Ya lo decidiré durante la semana</p>
                  <p className="text-stone-500 text-sm">Mantener las sesiones actuales por ahora</p>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Skip option */}
        <button
          onClick={() => setShowWeeklyCheckIn(false)}
          className="w-full text-stone-400 hover:text-stone-600 text-sm transition-colors"
        >
          Omitir por ahora
        </button>
      </motion.div>
    </div>
  );
}
