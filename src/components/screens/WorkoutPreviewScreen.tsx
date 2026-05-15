'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  Dumbbell,
  Play,
  ListChecks,
  Timer,
  X,
  ChevronRight,
  Info,
  TrendingUp,
  Trash2,
  MoveRight,
  AlertCircle
} from 'lucide-react';
import type { WorkoutMode, Exercise, ExerciseVariation } from '@/types/user';

export function WorkoutPreviewScreen() {
  const {
    selectedWeeklySession,
    setScreen,
    setWorkoutMode,
    removeSession,
    getExerciseHistory,
    user,
    getExerciseByName
  } = useApp();
  const [showModeModal, setShowModeModal] = useState(false);
  const [showExerciseDetail, setShowExerciseDetail] = useState<Exercise | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<ExerciseVariation | null>(null);
  const [showSessionOptions, setShowSessionOptions] = useState(false);

  if (!selectedWeeklySession) {
    return null;
  }

  const handleStartSession = () => {
    setShowModeModal(true);
  };

  const handleModeSelect = (mode: WorkoutMode) => {
    setWorkoutMode(mode);
    setShowModeModal(false);
    // Go to energy check before workout
    setScreen('energy-check');
  };

  const handleRemoveSession = () => {
    removeSession(selectedWeeklySession.id);
    setScreen('dashboard');
  };

  const formatReps = (reps: number[]) => {
    if (reps.every(r => r === reps[0])) {
      return `${reps.length} x ${reps[0]}`;
    }
    return reps.join('/');
  };

  const getLastWeight = (exerciseId: string): number | null => {
    const history = getExerciseHistory(exerciseId);
    if (history.length === 0) return null;
    const lastLog = history[history.length - 1];
    return lastLog.weight || null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 flex flex-col">
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
            <p className="text-stone-500 text-sm">Sesión {selectedWeeklySession.sessionNumber}</p>
            <h1 className="text-2xl font-bold text-stone-900">{selectedWeeklySession.name}</h1>
          </div>
          <button
            onClick={() => setShowSessionOptions(true)}
            className="p-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <AlertCircle className="w-5 h-5 text-stone-400" />
          </button>
        </div>

        {/* Session Info Card */}
        <Card className="p-5 bg-gradient-to-br from-emerald-500 to-teal-500 border-0 rounded-2xl shadow-lg shadow-emerald-200 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">{selectedWeeklySession.targetMuscles}</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span className="font-semibold">{selectedWeeklySession.duration} minutos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-5 h-5" />
                  <span className="font-semibold">{selectedWeeklySession.exercises.length} ejercicios</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Exercise List */}
      <div className="flex-1 px-6 pb-32 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-lg font-semibold text-stone-900 mb-4">
            Ejercicios
          </h2>

          <div className="space-y-3">
            {selectedWeeklySession.exercises.map((exercise, index) => {
              const lastWeight = getLastWeight(exercise.id);
              return (
                <motion.div
                  key={exercise.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Card
                    onClick={() => {
                      setShowExerciseDetail(exercise);
                      setSelectedVariation(exercise.variations?.[0] || null);
                    }}
                    className="p-4 bg-white border-0 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center text-stone-600 font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-stone-900">{exercise.name}</p>
                          <p className="text-stone-500 text-sm">
                            {exercise.sets} series x {formatReps(exercise.reps)} reps
                          </p>
                          {lastWeight && (
                            <div className="flex items-center gap-1 text-emerald-600 text-xs mt-1">
                              <TrendingUp className="w-3 h-3" />
                              <span>Último peso: {lastWeight} kg</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-stone-400">
                        <Info className="w-4 h-4" />
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Start Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-stone-100 via-stone-100 to-transparent">
        <Button
          onClick={handleStartSession}
          className="w-full py-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-lg font-semibold shadow-lg shadow-emerald-200"
        >
          <Play className="w-5 h-5 mr-2" />
          Empezar sesión
        </Button>
      </div>

      {/* Mode Selection Modal */}
      <AnimatePresence>
        {showModeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-end justify-center z-50"
            onClick={() => setShowModeModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white rounded-t-3xl p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto mb-6" />

              <h2 className="text-xl font-bold text-stone-900 mb-2">
                ¿Cómo quieres hacer este entreno?
              </h2>
              <p className="text-stone-500 text-sm mb-6">
                Puedes elegir esto en cada sesión
              </p>

              <div className="space-y-3">
                <Card
                  onClick={() => handleModeSelect('guided')}
                  className="p-5 cursor-pointer border-2 border-transparent hover:border-emerald-300 transition-all bg-stone-50 rounded-2xl"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <Timer className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-stone-900 mb-1">Modo guiado</p>
                      <ul className="text-stone-500 text-sm space-y-1">
                        <li>La app te guía paso a paso</li>
                        <li>Incluye temporizador de descanso</li>
                        <li>Registra peso y repeticiones</li>
                      </ul>
                    </div>
                  </div>
                </Card>

                <Card
                  onClick={() => handleModeSelect('simple')}
                  className="p-5 cursor-pointer border-2 border-transparent hover:border-emerald-300 transition-all bg-stone-50 rounded-2xl"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-stone-200 rounded-xl flex items-center justify-center">
                      <ListChecks className="w-6 h-6 text-stone-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-stone-900 mb-1">Modo simple</p>
                      <ul className="text-stone-500 text-sm space-y-1">
                        <li>Solo muestra la lista de ejercicios</li>
                        <li>Sin temporizadores</li>
                        <li>Sin interrupciones</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>

              <button
                onClick={() => setShowModeModal(false)}
                className="w-full mt-6 py-4 text-stone-500 font-medium"
              >
                Cancelar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session Options Modal (Move/Remove) */}
      <AnimatePresence>
        {showSessionOptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-end justify-center z-50"
            onClick={() => setShowSessionOptions(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white rounded-t-3xl p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto mb-6" />

              <h2 className="text-xl font-bold text-stone-900 mb-2">
                ¿Qué quieres hacer con esta sesión?
              </h2>
              <p className="text-stone-500 text-sm mb-6">
                Si hoy no te va bien, podemos adaptarnos
              </p>

              <div className="space-y-3">
                <Card
                  onClick={() => {
                    // For now, just show a message
                    // In the future, this would open a day selector
                    setShowSessionOptions(false);
                    alert('Función de mover sesión próximamente');
                  }}
                  className="p-5 cursor-pointer border-2 border-transparent hover:border-emerald-300 transition-all bg-stone-50 rounded-2xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <MoveRight className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-stone-900">Moverla a otro día</p>
                      <p className="text-stone-500 text-sm">Elegir otro día esta semana</p>
                    </div>
                  </div>
                </Card>

                <Card
                  onClick={handleRemoveSession}
                  className="p-5 cursor-pointer border-2 border-transparent hover:border-red-300 transition-all bg-stone-50 rounded-2xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <Trash2 className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-stone-900">Quitarla de esta semana</p>
                      <p className="text-stone-500 text-sm">No pasa nada, seguimos la próxima</p>
                    </div>
                  </div>
                </Card>
              </div>

              <button
                onClick={() => setShowSessionOptions(false)}
                className="w-full mt-6 py-4 text-stone-500 font-medium"
              >
                Cancelar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercise Detail Modal with GIF and Variations */}
      <AnimatePresence>
        {showExerciseDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowExerciseDetail(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* GIF Display */}
              <div className="relative h-48 bg-stone-100 rounded-t-3xl overflow-hidden">
                {(selectedVariation?.imageUrl || showExerciseDetail.imageUrl) ? (
                  <img
                    src={selectedVariation?.imageUrl || showExerciseDetail.imageUrl}
                    alt={showExerciseDetail.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Dumbbell className="w-16 h-16 text-stone-300" />
                  </div>
                )}
                <button
                  onClick={() => setShowExerciseDetail(null)}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-white/90 hover:bg-white transition-colors"
                >
                  <X className="w-5 h-5 text-stone-600" />
                </button>
              </div>

              <div className="p-6">
                <h2 className="text-xl font-bold text-stone-900 mb-4">
                  {showExerciseDetail.name}
                </h2>

                {/* Variation Selector */}
                {showExerciseDetail.variations && showExerciseDetail.variations.length > 0 && (
                  <div className="mb-6">
                    <p className="text-stone-600 text-sm font-medium mb-3">Variación:</p>
                    <div className="flex flex-wrap gap-2">
                      {showExerciseDetail.variations.map(variation => (
                        <button
                          key={variation.id}
                          onClick={() => setSelectedVariation(variation)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            selectedVariation?.id === variation.id
                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          }`}
                        >
                          {variation.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Exercise Info */}
                <div className="bg-emerald-50 rounded-2xl p-4 mb-6">
                  <div className="flex justify-around text-center">
                    <div>
                      <p className="text-2xl font-bold text-emerald-600">{showExerciseDetail.sets}</p>
                      <p className="text-stone-500 text-sm">Series</p>
                    </div>
                    <div className="w-px bg-emerald-200" />
                    <div>
                      <p className="text-2xl font-bold text-emerald-600">{formatReps(showExerciseDetail.reps)}</p>
                      <p className="text-stone-500 text-sm">Reps</p>
                    </div>
                    <div className="w-px bg-emerald-200" />
                    <div>
                      <p className="text-2xl font-bold text-emerald-600">{showExerciseDetail.restSeconds}s</p>
                      <p className="text-stone-500 text-sm">Descanso</p>
                    </div>
                  </div>
                </div>

                {/* Last Weight */}
                {getLastWeight(showExerciseDetail.id) && (
                  <div className="bg-stone-50 rounded-2xl p-4 mb-6">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="text-stone-900 font-medium">
                          Último peso: {getLastWeight(showExerciseDetail.id)} kg
                        </p>
                        <p className="text-stone-500 text-sm">Basado en tu historial</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Instructions */}
                {showExerciseDetail.instructions && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-stone-900 mb-2">Instrucciones</h3>
                    <p className="text-stone-600">{showExerciseDetail.instructions}</p>
                  </div>
                )}

                {/* Alternatives */}
                {showExerciseDetail.alternatives && showExerciseDetail.alternatives.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-stone-900 mb-3">
                      ¿No encuentras este ejercicio?
                    </h3>
                    <p className="text-stone-500 text-sm mb-3">
                      Prueba con estas alternativas:
                    </p>
                    <div className="space-y-2">
                      {showExerciseDetail.alternatives.map((alt, i) => (
                        <Button
                          key={i}
                          variant="ghost"
                          onClick={() => {
                            // 1. Intentamos buscarlo en tu AppContext
                            let newExercise = typeof getExerciseByName === 'function' 
                              ? getExerciseByName(alt) 
                              : undefined;

                            // 2. Si no existe en los datos falsos, creamos uno al vuelo
                            // para que la interfaz NUNCA se bloquee.
                            if (!newExercise) {
                              newExercise = {
                                ...showExerciseDetail, // Hereda las series, reps y músculo
                                id: `mock-alt-${i}`,
                                name: alt, // Actualiza al nombre de la alternativa
                                variations: [], // Limpiamos para evitar errores
                                alternatives: [], // Limpiamos para no hacer bucles infinitos
                                instructions: `Mantén la técnica adecuada para: ${alt}`,
                                imageUrl: undefined // Mostrará el icono del Dumbbell automáticamente
                              };
                            }

                            // 3. Forzamos la actualización de React
                            setShowExerciseDetail(newExercise);
                            setSelectedVariation(newExercise.variations?.[0] || null);
                          }}
                          className="w-full h-auto min-h-[3rem] py-3 justify-start px-4 text-left font-normal text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl border-none shadow-none text-base transition-colors"
                        >
                          {alt}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => setShowExerciseDetail(null)}
                  className="w-full py-5 rounded-xl bg-emerald-500 hover:bg-emerald-600"
                >
                  Entendido
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
