'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Scale,
  Activity,
  Ruler,
  Settings,
  Calendar,
  Clock,
  ChevronRight,
  Check,
  RefreshCw,
  Dumbbell,
  MessageCircle,
  User as UserIcon,
  Apple,
  Home
} from 'lucide-react';

export function ProfileScreen() {
  const { user, setUser, setScreen, resetApp } = useApp();
  const [showWeightUpdate, setShowWeightUpdate] = useState(false);
  const [newWeight, setNewWeight] = useState(user?.profile.weight?.toString() || '');
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [weightUpdated, setWeightUpdated] = useState(false);

  if (!user) return null;

  const completedSessions = user.weeklySessions?.filter(s => s.status === 'completed').length || 0;
  const totalCompletedSessions = user.totalCompletedSessions || completedSessions;
  const canShowMeasurements = totalCompletedSessions >= 3;

  const handleWeightUpdate = () => {
    if (newWeight && user) {
      setUser({
        ...user,
        profile: {
          ...user.profile,
          weight: parseFloat(newWeight),
        },
        lastWeightUpdate: new Date(),
      });
      setShowWeightUpdate(false);
      setWeightUpdated(true);
      setTimeout(() => setWeightUpdated(false), 3000);
    }
  };

  const getLastWeightUpdateText = () => {
    if (!user.lastWeightUpdate) return 'No actualizado';
    const lastUpdate = new Date(user.lastWeightUpdate);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    return `Hace ${diffDays} días`;
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
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-stone-900">Tu perfil</h1>
          </div>
        </div>

        {/* Profile Header Card */}
        <Card className="p-5 bg-white border-0 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-2xl flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {user.profile.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900">{user.profile.name}</h2>
              <p className="text-stone-500 text-sm">Semana {user.currentWeek}</p>
            </div>
          </div>
          <p className="text-stone-400 text-sm mt-4 italic">
            "Este es tu espacio. El progreso sucede paso a paso."
          </p>
        </Card>
      </motion.div>

      {/* Content */}
      <div className="flex-1 px-6 space-y-4">
        {/* Weight Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-5 bg-white border-0 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Scale className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-stone-500 text-sm">Tu peso actual</p>
                  <p className="text-2xl font-bold text-stone-900">{user.profile.weight} kg</p>
                </div>
              </div>
            </div>

            <p className="text-stone-400 text-xs mb-3">
              Última actualización: {getLastWeightUpdateText()}
            </p>

            <AnimatePresence>
              {weightUpdated && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-3"
                >
                  <p className="text-emerald-700 text-sm flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Bien. Lo tendremos en cuenta.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {showWeightUpdate ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3"
              >
                <Input
                  type="number"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  placeholder="Nuevo peso en kg"
                  className="py-4 px-4 rounded-xl bg-stone-50 border-stone-200"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowWeightUpdate(false)}
                    variant="outline"
                    className="flex-1 py-4 rounded-xl"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleWeightUpdate}
                    className="flex-1 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600"
                  >
                    Guardar
                  </Button>
                </div>
              </motion.div>
            ) : (
              <Button
                onClick={() => setShowWeightUpdate(true)}
                variant="outline"
                className="w-full py-4 rounded-xl"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar peso
              </Button>
            )}
          </Card>
        </motion.div>

        {/* Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-5 bg-white border-0 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-teal-600" />
              </div>
              <h3 className="font-semibold text-stone-900">Tu progreso</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-stone-50 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-emerald-600">{totalCompletedSessions}</p>
                <p className="text-stone-500 text-sm">Sesiones completadas</p>
              </div>
              <div className="bg-stone-50 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-teal-600">{user.currentWeek}</p>
                <p className="text-stone-500 text-sm">Semanas activas</p>
              </div>
            </div>

            <p className="text-stone-400 text-sm italic text-center">
              "Estás construyendo constancia."
            </p>
          </Card>
        </motion.div>

        {/* Body Measurements Section (Optional) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-5 bg-white border-0 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center">
                <Ruler className="w-5 h-5 text-stone-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-stone-900">Medidas corporales</h3>
                <p className="text-stone-400 text-xs">(opcional)</p>
              </div>
            </div>

            {!canShowMeasurements ? (
              <div className="bg-stone-50 rounded-xl p-4">
                <p className="text-stone-500 text-sm">
                  Puedes añadir esto después. Por ahora, céntrate en empezar.
                </p>
              </div>
            ) : (
              <>
                <p className="text-stone-500 text-sm mb-4">
                  Puedes añadir medidas si quieres un seguimiento más detallado.
                </p>
                <Button
                  onClick={() => setShowMeasurements(!showMeasurements)}
                  variant="outline"
                  className="w-full py-4 rounded-xl flex items-center justify-between"
                >
                  <span>Añadir medidas</span>
                  <ChevronRight className={`w-5 h-5 transition-transform ${showMeasurements ? 'rotate-90' : ''}`} />
                </Button>

                <AnimatePresence>
                  {showMeasurements && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-3"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-stone-600 text-xs mb-1 block">Pecho (cm)</label>
                          <Input
                            type="number"
                            placeholder="—"
                            className="py-3 px-3 rounded-xl bg-stone-50 border-stone-200"
                          />
                        </div>
                        <div>
                          <label className="text-stone-600 text-xs mb-1 block">Cintura (cm)</label>
                          <Input
                            type="number"
                            placeholder="—"
                            className="py-3 px-3 rounded-xl bg-stone-50 border-stone-200"
                          />
                        </div>
                        <div>
                          <label className="text-stone-600 text-xs mb-1 block">Cadera (cm)</label>
                          <Input
                            type="number"
                            placeholder="—"
                            className="py-3 px-3 rounded-xl bg-stone-50 border-stone-200"
                          />
                        </div>
                        <div>
                          <label className="text-stone-600 text-xs mb-1 block">Brazo (cm)</label>
                          <Input
                            type="number"
                            placeholder="—"
                            className="py-3 px-3 rounded-xl bg-stone-50 border-stone-200"
                          />
                        </div>
                      </div>
                      <Button className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600">
                        Guardar medidas
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </Card>
        </motion.div>

        {/* Nutrition Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card
            onClick={() => setScreen('nutrition')}
            className="p-5 bg-white border-0 rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Apple className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900">Nutrición</h3>
                  <p className="text-stone-500 text-sm">Hidratación y comidas</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-300" />
            </div>
          </Card>
        </motion.div>

        {/* Settings Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-5 bg-white border-0 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-stone-600" />
              </div>
              <h3 className="font-semibold text-stone-900">Ajustes</h3>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setScreen('chat')}
                className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-stone-400" />
                  <span className="text-stone-700">Días de entrenamiento</span>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-300" />
              </button>

              <button
                onClick={() => setScreen('chat')}
                className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-stone-400" />
                  <span className="text-stone-700">Duración de sesiones</span>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-300" />
              </button>

              <div className="border-t border-stone-100 my-2" />

              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-red-50 transition-colors text-red-600"
              >
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5" />
                  <span>Reiniciar app</span>
                </div>
              </button>
            </div>
          </Card>
        </motion.div>
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
            <UserIcon className="w-6 h-6 text-emerald-500" />
            <span className="text-xs text-emerald-600 font-medium">Perfil</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50"
            onClick={() => setShowResetConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-stone-900 mb-2">
                ¿Reiniciar la app?
              </h3>
              <p className="text-stone-500 mb-6">
                Esto borrará todos tus datos y tendrás que crear un nuevo perfil.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowResetConfirm(false)}
                  variant="outline"
                  className="flex-1 py-4 rounded-xl"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    resetApp();
                    setShowResetConfirm(false);
                  }}
                  className="flex-1 py-4 rounded-xl bg-red-500 hover:bg-red-600"
                >
                  Reiniciar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
