'use client';

import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  ChevronLeft,
  Clock,
  Dumbbell,
  X,
  TrendingUp,
  Info,
  Play,
  Pause
} from 'lucide-react';
import type { Exercise, ExerciseVariation } from '@/types/user';

interface ExerciseLog {
  exerciseId: string;
  setNumber: number;
  weight: number;
  reps: number;
}

export function WorkoutScreen() {
  const { 
    selectedWeeklySession, 
    workoutMode, 
    setScreen, 
    completeWeeklySession,
    getExerciseHistory,
    getExerciseByName 
  } = useApp();

  // 1. Estado del Modal (Compartido para Modo Simple y Guiado)
  const [showExerciseDetail, setShowExerciseDetail] = useState<Exercise | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<ExerciseVariation | null>(null);

  // 2. Estado del Modo Guiado
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(0);
  const [completedSets, setCompletedSets] = useState<Set<string>>(new Set());
  const restIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 3. Estado del Modo Simple / Finalización
  const [showComplete, setShowComplete] = useState(false);
  const [showRecordPrompt, setShowRecordPrompt] = useState(false);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Limpieza del temporizador
  useEffect(() => {
    return () => {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
      }
    };
  }, []);

  if (!selectedWeeklySession) return null;

  const exercises = selectedWeeklySession.exercises ?? [];

  if (exercises.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <p className="text-stone-500">No hay ejercicios para esta sesión.</p>
          <button
            onClick={() => setScreen('dashboard')}
            className="text-emerald-600 font-medium"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const currentExercise = exercises[currentExerciseIndex];
  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets, 0);

  // Funciones Auxiliares
  const formatReps = (repsArr: number[]) => {
    if (!repsArr || repsArr.length === 0) return '';
    if (repsArr.every(r => r === repsArr[0])) {
      return `${repsArr.length} x ${repsArr[0]}`;
    }
    return repsArr.join('/');
  };

  const getLastWeight = (exerciseId: string): number | null => {
    if (!getExerciseHistory) return null;
    const history = getExerciseHistory(exerciseId);
    if (history.length === 0) return null;
    return history[history.length - 1].weight || null;
  };

  const startRestTimer = (seconds: number) => {
    setRestTime(seconds);
    setIsResting(true);

    if (restIntervalRef.current) clearInterval(restIntervalRef.current);

    restIntervalRef.current = setInterval(() => {
      setRestTime(prev => {
        if (prev <= 1) {
          if (restIntervalRef.current) clearInterval(restIntervalRef.current);
          setIsResting(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const skipRest = () => {
    if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    setIsResting(false);
    setRestTime(0);
  };

  const handleCompleteSet = () => {
    const setKey = `${currentExerciseIndex}-${currentSetIndex}`;
    const newCompletedSets = new Set(completedSets);
    newCompletedSets.add(setKey);
    setCompletedSets(newCompletedSets);

    if (weight || reps) {
      setExerciseLogs([...exerciseLogs, {
        exerciseId: currentExercise.id,
        setNumber: currentSetIndex + 1,
        weight: parseFloat(weight) || 0,
        reps: parseInt(reps) || currentExercise.reps[currentSetIndex] || currentExercise.reps[0],
      }]);
    }

    if (newCompletedSets.size >= totalSets) {
      handleWorkoutComplete();
      return;
    }

    if (currentSetIndex < currentExercise.sets - 1) {
      setCurrentSetIndex(currentSetIndex + 1);
      startRestTimer(currentExercise.restSeconds);
    } else if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSetIndex(0);
      startRestTimer(90);
    }

    setWeight('');
    setReps('');
  };

  const handleWorkoutComplete = () => {
    if (workoutMode === 'simple') {
      setShowRecordPrompt(true);
    } else {
      completeWeeklySession(selectedWeeklySession.id);
      setShowComplete(true);
    }
  };

  const handleSimpleModeComplete = () => setShowRecordPrompt(true);
  const handleExit = () => setShowExitConfirm(true);
  const confirmExit = () => setScreen('dashboard');
  
  const handleRecordChoice = (choice: 'now' | 'later' | 'skip') => {
    completeWeeklySession(selectedWeeklySession.id);
    setShowRecordPrompt(false);
    setShowComplete(true);
  };

  const progress = (completedSets.size / totalSets) * 100;

  // COMPONENTE: Modal de Detalles del Ejercicio (Reutilizable en ambos modos)
  const ExerciseDetailModal = (
    <AnimatePresence>
      {showExerciseDetail && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]"
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
              <h2 className="text-xl font-bold text-stone-900 mb-4">{showExerciseDetail.name}</h2>

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
                      <p className="text-stone-900 font-medium">Último peso: {getLastWeight(showExerciseDetail.id)} kg</p>
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
                  <h3 className="font-semibold text-stone-900 mb-3">¿No encuentras este ejercicio?</h3>
                  <p className="text-stone-500 text-sm mb-3">Prueba con estas alternativas:</p>
                  <div className="space-y-2">
                    {showExerciseDetail.alternatives.map((alt, i) => {
                      // Look up in catalog first, then try variation match
                      const catalogMatch = typeof getExerciseByName === 'function'
                        ? getExerciseByName(alt)
                        : undefined;
                      // Try to find a variation of the current exercise that matches the name
                      const variationMatch = showExerciseDetail.variations?.find(v =>
                        alt.toLowerCase().includes(v.name.toLowerCase()) ||
                        v.name.toLowerCase().includes(alt.toLowerCase())
                      );

                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            if (catalogMatch) {
                              setShowExerciseDetail(catalogMatch);
                              setSelectedVariation(catalogMatch.variations?.[0] || null);
                            } else if (variationMatch) {
                              // Switch to the matching variation image without changing exercise
                              setSelectedVariation(variationMatch);
                            } else {
                              // Fallback: show the alternative with the variation's image if available
                              const fallback: Exercise = {
                                ...showExerciseDetail,
                                id: `alt-${i}`,
                                name: alt,
                                imageUrl: showExerciseDetail.variations?.[i % (showExerciseDetail.variations?.length || 1)]?.imageUrl ?? showExerciseDetail.imageUrl,
                                variations: [],
                                alternatives: [],
                              };
                              setShowExerciseDetail(fallback);
                              setSelectedVariation(null);
                            }
                          }}
                          className="w-full flex items-center gap-3 py-3 px-4 text-left text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
                        >
                          {(catalogMatch?.imageUrl || variationMatch?.imageUrl) && (
                            <img
                              src={catalogMatch?.imageUrl || variationMatch?.imageUrl}
                              alt={alt}
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                            />
                          )}
                          <span className="font-medium">{alt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <Button
                onClick={() => setShowExerciseDetail(null)}
                className="w-full py-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                Entendido
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // -------------------------
  // PANTALLAS DE FINALIZACIÓN
  // -------------------------
  
  if (showComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 flex flex-col items-center justify-center px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-8 max-w-sm">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 150 }} className="w-20 h-20 mx-auto bg-emerald-100 rounded-2xl flex items-center justify-center">
            <Check className="w-10 h-10 text-emerald-600" />
          </motion.div>
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-stone-900">Has completado la sesión de hoy</h1>
            <p className="text-stone-500">Esto cuenta.</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex justify-around text-center">
              <div>
                <p className="text-2xl font-bold text-emerald-600">{exercises.length}</p>
                <p className="text-stone-500 text-sm">ejercicios</p>
              </div>
              <div className="w-px bg-stone-200" />
              <div>
                <p className="text-2xl font-bold text-emerald-600">{totalSets}</p>
                <p className="text-stone-500 text-sm">series</p>
              </div>
            </div>
          </div>
          <div className="pt-4">
            <Button onClick={() => setScreen('dashboard')} className="w-full py-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 font-semibold text-lg">
              Volver al inicio
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (showRecordPrompt) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 flex flex-col items-center justify-center px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md w-full">
          <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
            <Dumbbell className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 mb-2">Buen trabajo</h2>
          <p className="text-stone-500 mb-8">¿Quieres registrar los pesos y repeticiones?</p>
          <div className="space-y-3">
            <Button onClick={() => handleRecordChoice('now')} className="w-full py-5 rounded-xl bg-emerald-500 hover:bg-emerald-600">Registrar ahora</Button>
            <Button onClick={() => handleRecordChoice('later')} variant="outline" className="w-full py-5 rounded-xl">Registrar después</Button>
            <button onClick={() => handleRecordChoice('skip')} className="w-full py-3 text-stone-400 hover:text-stone-600">Omitir</button>
          </div>
        </motion.div>
      </div>
    );
  }

  // -------------------------
  // MODO SIMPLE
  // -------------------------

  if (workoutMode === 'simple') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 flex flex-col">
        <div className="px-6 pt-8 pb-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={handleExit} className="p-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
              <X className="w-5 h-5 text-stone-600" />
            </button>
            <div className="text-center">
              <p className="text-stone-500 text-sm">{selectedWeeklySession.name}</p>
              <p className="font-semibold text-stone-900">{selectedWeeklySession.duration} minutos</p>
            </div>
            <div className="w-10" />
          </div>
        </div>

        <div className="flex-1 px-6 pb-32 overflow-y-auto">
          <div className="space-y-4">
            {exercises.map((exercise, index) => (
              <motion.div key={exercise.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <Card 
                  onClick={() => {
                    setShowExerciseDetail(exercise);
                    setSelectedVariation(exercise.variations?.[0] || null);
                  }}
                  className="p-4 bg-white border-0 rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-stone-900">{exercise.name}</p>
                      <p className="text-emerald-600 font-medium">
                        {exercise.sets} series x {formatReps(exercise.reps)} reps
                      </p>
                      {exercise.instructions && (
                        <p className="text-stone-400 text-sm mt-1">{exercise.instructions}</p>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-stone-100 via-stone-100 to-transparent">
          <Button onClick={handleSimpleModeComplete} className="w-full py-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-lg font-semibold shadow-lg shadow-emerald-200">
            <Check className="w-5 h-5 mr-2" />
            Terminar entreno
          </Button>
        </div>

        {showExitConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-6 max-w-sm w-full">
              <h3 className="text-xl font-bold text-stone-900 mb-2">¿Salir del entreno?</h3>
              <p className="text-stone-500 mb-6">Tu progreso no se guardará</p>
              <div className="flex gap-3">
                <Button onClick={() => setShowExitConfirm(false)} variant="outline" className="flex-1 py-4 rounded-xl">Continuar</Button>
                <Button onClick={confirmExit} className="flex-1 py-4 rounded-xl bg-stone-900 hover:bg-stone-800">Salir</Button>
              </div>
            </motion.div>
          </div>
        )}

        {/* INYECTAMOS EL MODAL AQUÍ */}
        {ExerciseDetailModal}
      </div>
    );
  }

  // -------------------------
  // MODO GUIADO
  // -------------------------

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 flex flex-col">
      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={handleExit} className="p-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
            <X className="w-5 h-5 text-stone-600" />
          </button>
          <div className="text-center">
            <p className="text-stone-500 text-sm">{selectedWeeklySession.name}</p>
            <p className="font-semibold text-stone-900">Ejercicio {currentExerciseIndex + 1} de {exercises.length}</p>
          </div>
          <div className="w-10" />
        </div>
        <Progress value={progress} className="h-2 bg-stone-200" />
        <p className="text-right text-sm text-stone-400 mt-1">{completedSets.size}/{totalSets} series</p>
      </div>

      <div className="flex-1 px-6 flex flex-col">
        <AnimatePresence mode="wait">
          {isResting ? (
            <motion.div key="rest" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-32 h-32 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
                <Clock className="w-12 h-12 text-emerald-500" />
              </div>
              <p className="text-stone-500 mb-2">Descansa</p>
              <p className="text-6xl font-bold text-stone-900 mb-8">
                {Math.floor(restTime / 60)}:{(restTime % 60).toString().padStart(2, '0')}
              </p>
              <Button onClick={skipRest} variant="outline" className="rounded-xl px-6">Saltar descanso</Button>
            </motion.div>
          ) : (
            <motion.div key="exercise" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col">
              <Card className="p-6 bg-white border-0 rounded-3xl shadow-sm mb-6">
                {/* GIF del ejercicio actual */}
                {currentExercise.imageUrl && (
                  <div className="h-40 rounded-2xl overflow-hidden mb-4 bg-stone-100">
                    <img
                      src={currentExercise.imageUrl}
                      alt={currentExercise.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-stone-900">{currentExercise.name}</h2>
                    {currentExercise.instructions && (
                      <p className="text-stone-500 text-sm mt-1">{currentExercise.instructions}</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setShowExerciseDetail(currentExercise);
                      setSelectedVariation(currentExercise.variations?.[0] || null);
                    }}
                    className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 transition-colors ml-3 flex-shrink-0"
                  >
                    <Info className="w-5 h-5 text-stone-500" />
                  </button>
                </div>

                <div className="flex gap-2 mb-4">
                  {Array.from({ length: currentExercise.sets }).map((_, i) => {
                    const setKey = `${currentExerciseIndex}-${i}`;
                    const isCompleted = completedSets.has(setKey);
                    const isCurrent = i === currentSetIndex;
                    return (
                      <div key={i} className={`flex-1 h-2 rounded-full ${isCompleted ? 'bg-emerald-500' : isCurrent ? 'bg-emerald-300' : 'bg-stone-200'}`} />
                    );
                  })}
                </div>

                <div className="bg-stone-50 rounded-2xl p-4">
                  <p className="text-stone-500 text-sm mb-1">Serie {currentSetIndex + 1}</p>
                  <p className="text-2xl font-bold text-stone-900">
                    {currentExercise.reps[currentSetIndex] || currentExercise.reps[0]} repeticiones
                  </p>
                </div>
              </Card>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-stone-600 text-sm mb-2 block">Peso usado (kg) - opcional</label>
                  <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Ej: 20" className="py-5 px-4 rounded-xl bg-white border-stone-200 text-lg" />
                </div>
                <div>
                  <label className="text-stone-600 text-sm mb-2 block">Repeticiones hechas (si diferente)</label>
                  <Input type="number" value={reps} onChange={(e) => setReps(e.target.value)} placeholder={(currentExercise.reps[currentSetIndex] || currentExercise.reps[0]).toString()} className="py-5 px-4 rounded-xl bg-white border-stone-200 text-lg" />
                </div>
              </div>

              <div className="mt-auto pb-6">
                <Button onClick={handleCompleteSet} className="w-full py-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-lg font-semibold shadow-lg shadow-emerald-200">
                  <Check className="w-5 h-5 mr-2" />
                  Serie completada
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!isResting && (
        <div className="px-6 pb-8 flex justify-between">
          <button
            onClick={() => {
              if (currentSetIndex > 0) {
                setCurrentSetIndex(currentSetIndex - 1);
              } else if (currentExerciseIndex > 0) {
                setCurrentExerciseIndex(currentExerciseIndex - 1);
                setCurrentSetIndex(exercises[currentExerciseIndex - 1].sets - 1);
              }
            }}
            disabled={currentExerciseIndex === 0 && currentSetIndex === 0}
            className="flex items-center gap-2 text-stone-400 disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" /> Anterior
          </button>
          <button
            onClick={() => {
              if (currentSetIndex < currentExercise.sets - 1) {
                setCurrentSetIndex(currentSetIndex + 1);
              } else if (currentExerciseIndex < exercises.length - 1) {
                setCurrentExerciseIndex(currentExerciseIndex + 1);
                setCurrentSetIndex(0);
              }
            }}
            disabled={currentExerciseIndex === exercises.length - 1 && currentSetIndex === currentExercise.sets - 1}
            className="flex items-center gap-2 text-stone-400 disabled:opacity-50"
          >
            Siguiente <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-stone-900 mb-2">¿Salir del entreno?</h3>
            <p className="text-stone-500 mb-6">Tu progreso se guardará parcialmente</p>
            <div className="flex gap-3">
              <Button onClick={() => setShowExitConfirm(false)} variant="outline" className="flex-1 py-4 rounded-xl">Continuar</Button>
              <Button onClick={confirmExit} className="flex-1 py-4 rounded-xl bg-stone-900 hover:bg-stone-800">Salir</Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* INYECTAMOS EL MODAL AQUÍ (Compartido) */}
      {ExerciseDetailModal}
    </div>
  );
}