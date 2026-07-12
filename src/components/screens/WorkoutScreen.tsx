'use client';

import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Clock,
  Dumbbell,
  X,
  TrendingUp,
  Info,
  Watch,
  Hash,
  Flame,
} from 'lucide-react';
import type { Exercise, ExerciseVariation, ClockStyle } from '@/types/user';
import { ExercisePreview } from '@/components/workout/ExercisePreview';
import { WorkoutCoachChat } from '@/components/workout/WorkoutCoachChat';
import { WorkoutClock, WorkoutClockLarge } from '@/components/workout/WorkoutClock';
import { useScrollLock } from '@/hooks/useScrollLock';

interface ExerciseLog {
  exerciseId: string;
  setNumber: number;
  weight: number;
  reps: number;
}

// ─── Modal selector de reloj (primera vez) ────────────────────────────────────
function ClockPickerModal({ onChoose }: { onChoose: (style: ClockStyle) => void }) {
  useScrollLock();
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-end justify-center"
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="bg-white w-full max-w-md rounded-t-3xl px-6 pt-6 pb-10"
      >
        <div className="w-10 h-1 bg-stone-200 rounded-full mx-auto mb-5" />
        <h2 className="text-xl font-bold text-stone-900 text-center mb-1">¿Qué tipo de reloj prefieres?</h2>
        <p className="text-stone-400 text-sm text-center mb-6">
          Verás el tiempo de tu entreno arriba a la derecha
        </p>

        <div className="grid grid-cols-2 gap-3 mb-5">
          {([
            { style: 'digital' as ClockStyle, label: 'Digital', icon: Hash, desc: '04:32' },
            { style: 'analog'  as ClockStyle, label: 'Analógico', icon: Watch, desc: 'Con agujas' },
          ]).map(opt => (
            <button key={opt.style}
              onClick={() => onChoose(opt.style)}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-stone-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all"
            >
              <opt.icon className="w-8 h-8 text-emerald-500" />
              <div className="text-center">
                <p className="font-semibold text-stone-900">{opt.label}</p>
                <p className="text-xs text-stone-400">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-stone-400 text-xs">
          Podrás cambiarlo en cualquier momento en <span className="font-medium text-stone-600">Perfil → Ajustes</span>
        </p>
      </motion.div>
    </motion.div>
  );
}

// ─── Modal reloj expandido ────────────────────────────────────────────────────
function ClockExpandedModal({
  elapsed, style, targetMinutes, onClose,
}: {
  elapsed: number; style: ClockStyle; targetMinutes?: number; onClose: () => void;
}) {
  useScrollLock();
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center px-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="bg-white rounded-3xl p-8 flex flex-col items-center gap-4 max-w-xs w-full"
        onClick={e => e.stopPropagation()}
      >
        <WorkoutClockLarge elapsed={elapsed} style={style} targetMinutes={targetMinutes} />
        {targetMinutes && (
          <div className="text-center">
            <p className="text-stone-400 text-xs">Objetivo</p>
            <p className="font-semibold text-stone-700">{targetMinutes} minutos</p>
          </div>
        )}
        <button onClick={onClose}
          className="mt-2 px-6 py-2 rounded-xl bg-stone-100 text-stone-600 text-sm font-medium hover:bg-stone-200 transition-colors">
          Cerrar
        </button>
      </motion.div>
    </motion.div>
  );
}

export function WorkoutScreen() {
  const {
    user,
    selectedWeeklySession,
    workoutMode,
    includeWarmup,
    setScreen,
    setUser,
    completeWeeklySession,
    getExerciseHistory,
    getExerciseByName
  } = useApp();

  // 1. Estado del Modal (Compartido para Modo Simple y Guiado)
  const [showExerciseDetail, setShowExerciseDetail] = useState<Exercise | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<ExerciseVariation | null>(null);
  const [warmupDone, setWarmupDone] = useState(false);
  const [showGuidedWarmup, setShowGuidedWarmup] = useState(includeWarmup);

  // 2. Estado del Modo Guiado
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(0);
  const [restTotal, setRestTotal] = useState(0);
  const [completedSets, setCompletedSets] = useState<Set<string>>(new Set());
  const restIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 3. Estado del Modo Simple / Finalización
  const [showComplete, setShowComplete] = useState(false);
  const [showRecordPrompt, setShowRecordPrompt] = useState(false);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [completionStep, setCompletionStep] = useState<1 | 2>(1); // 1=mensaje, 2=compartir
  const [simpleDone, setSimpleDone] = useState<Set<string>>(new Set()); // modo simple: ejercicios marcados

  // 4. Cronómetro modo simple
  const [elapsed, setElapsed] = useState(0); // segundos desde que empezó
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [durationAlertShown, setDurationAlertShown] = useState(false);
  const [showDurationBanner, setShowDurationBanner] = useState(false);
  const [showClockPicker, setShowClockPicker] = useState(false);
  const [showClockExpanded, setShowClockExpanded] = useState(false);

  // Limpieza del temporizador de descanso
  useEffect(() => {
    return () => {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    };
  }, []);

  // Cronómetro: arranca en ambos modos al montar el entreno
  useEffect(() => {
    // Primera vez (cualquier modo) → mostrar selector de reloj
    if (!user?.profile.clockStyleChosen) {
      setShowClockPicker(true);
    }

    timerRef.current = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Alerta cuando alcanza la duración objetivo
  const targetDuration = selectedWeeklySession?.duration ?? 0;
  useEffect(() => {
    if (workoutMode !== 'simple') return;
    if (!durationAlertShown && targetDuration > 0 && elapsed >= targetDuration * 60) {
      setDurationAlertShown(true);
      setShowDurationBanner(true);
      // Auto-ocultar tras 6 segundos
      setTimeout(() => setShowDurationBanner(false), 6000);
    }
  }, [elapsed, durationAlertShown, targetDuration, workoutMode]);

  if (!selectedWeeklySession) return null;

  const exercises = selectedWeeklySession.exercises ?? [];

  if (exercises.length === 0) {
    return (
      <div className="min-h-screen glass-bg flex items-center justify-center px-6">
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
    setRestTotal(seconds);
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

  const savePendingActions = () => {
    if (!selectedWeeklySession) return;
    try {
      const KEY = 'fitmente-session-actions';
      const existing: Record<string, unknown> = JSON.parse(localStorage.getItem(KEY) || '{}');
      existing[selectedWeeklySession.id] = {
        sessionId:          selectedWeeklySession.id,
        sessionName:        selectedWeeklySession.name,
        completedAt:        new Date().toISOString(),
        dismissedRegister:  false,
        dismissedCommunity: false,
      };
      localStorage.setItem(KEY, JSON.stringify(existing));
    } catch { /* silently ignore */ }
  };

  const handleWorkoutComplete = () => {
    savePendingActions();
    if (workoutMode === 'simple') {
      setShowRecordPrompt(true);
    } else {
      const logsToSave = exerciseLogs.map(l => ({ ...l, timestamp: new Date() }));
      completeWeeklySession(selectedWeeklySession.id, logsToSave);
      setShowComplete(true);
    }
  };

  const handleSimpleModeComplete = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    savePendingActions();
    setShowRecordPrompt(true);
  };
  const handleExit = () => setShowExitConfirm(true);
  const confirmExit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setScreen('dashboard');
  };

  const clockStyle: ClockStyle = user?.profile.clockStyle ?? 'digital';

  const handleClockStyleChoice = (style: ClockStyle) => {
    if (!user) return;
    setUser({ ...user, profile: { ...user.profile, clockStyle: style, clockStyleChosen: true } });
    setShowClockPicker(false);
  };
  
  const handleRecordChoice = (_choice: 'now' | 'later' | 'skip') => {
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
            className="glass-modal rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Preview animado del ejercicio */}
            <div className="relative h-52">
              <ExercisePreview
                name={showExerciseDetail.name}
                muscle={showExerciseDetail.targetMuscle}
                className="w-full h-52"
                rounded="rounded-t-3xl"
              />
              <button
                onClick={() => setShowExerciseDetail(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/90 hover:bg-white transition-colors shadow-sm"
              >
                <X className="w-5 h-5 text-stone-600" />
              </button>
            </div>

            <div className="p-6">
              <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-4">{showExerciseDetail.name}</h2>

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
                <div className="glass-bg rounded-2xl p-4 mb-6">
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
    const totalSessions = user?.totalCompletedSessions ?? 0;
    const isNewUser = totalSessions <= 2;
    const newMessages = ['Eso ya cuenta.', 'Hoy también suma.', 'Lo importante es que has venido.', 'Buen paso.', 'Seguimos a tu ritmo.'];
    const proMessages = ['Buen trabajo.', 'Muy buena sesión.', 'Sigues construyendo.', 'Otra más.', 'Sesión sólida.', 'Hoy te noto fuerte.'];
    const msgs = isNewUser ? newMessages : proMessages;
    const motivMsg = msgs[totalSessions % msgs.length];
    const sessionName = selectedWeeklySession?.name ?? 'Entrenamiento';
    const sessionDuration = selectedWeeklySession?.duration ?? 45;

    if (completionStep === 1) {
      return (
        <div className="min-h-screen glass-bg flex flex-col items-center justify-center px-6 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-8 max-w-sm w-full">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 150 }} className="w-20 h-20 mx-auto bg-emerald-100 rounded-2xl flex items-center justify-center">
              <Check className="w-10 h-10 text-emerald-600" />
            </motion.div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-stone-900">Has completado la sesión de hoy</h1>
              <p className="text-stone-500 text-lg">{motivMsg}</p>
            </div>
            <div className="glass-card rounded-2xl p-5">
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
                <div className="w-px bg-stone-200" />
                <div>
                  <p className="text-2xl font-bold text-emerald-600">{Math.round(elapsed / 60) || sessionDuration}</p>
                  <p className="text-stone-500 text-sm">min reales</p>
                </div>
              </div>
            </div>
            <div className="pt-2 w-full">
              <Button onClick={() => setCompletionStep(2)} className="w-full py-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 font-semibold text-lg">
                Continuar
              </Button>
            </div>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="min-h-screen glass-bg flex flex-col items-center justify-center px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6 max-w-sm w-full">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-stone-900">¿Quieres compartirlo?</h2>
            <p className="text-stone-500 text-sm">La comunidad te acompaña en el proceso</p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => { setScreen('community'); }}
              className="w-full p-4 bg-white dark:bg-[#1a1a1a] border-2 border-stone-100 dark:border-stone-800 hover:border-emerald-300 rounded-2xl flex items-center gap-4 transition-all shadow-sm"
            >
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📝</span>
              </div>
              <div className="text-left">
                <p className="font-semibold text-stone-900">Escribir una nota</p>
                <p className="text-stone-500 text-sm">Comparte tu experiencia de hoy</p>
              </div>
            </button>

            <button
              onClick={() => { setScreen('community'); }}
              className="w-full p-4 bg-white dark:bg-[#1a1a1a] border-2 border-stone-100 dark:border-stone-800 hover:border-emerald-300 rounded-2xl flex items-center gap-4 transition-all shadow-sm"
            >
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🏋️</span>
              </div>
              <div className="text-left">
                <p className="font-semibold text-stone-900">Compartir entrenamiento</p>
                <p className="text-stone-500 text-sm">{sessionName} · {sessionDuration} min · {exercises.length} ejercicios</p>
              </div>
            </button>

            <button
              onClick={() => setScreen('dashboard')}
              className="w-full py-4 text-stone-400 hover:text-stone-600 text-sm transition-colors"
            >
              ❌ Ahora no
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (showRecordPrompt) {
    return (
      <div className="min-h-screen glass-bg flex flex-col items-center justify-center px-6 py-12">
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
      <div className="min-h-screen glass-bg flex flex-col">
        {/* ── Banner de duración alcanzada ── */}
        <AnimatePresence>
          {showDurationBanner && (
            <motion.div
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -60, opacity: 0 }}
              className="fixed top-0 inset-x-0 z-50 mx-4 mt-16 bg-amber-400 text-amber-900 rounded-2xl px-4 py-3 flex items-center justify-between shadow-lg"
            >
              <p className="text-sm font-semibold">
                ¡{targetDuration} minutos completados! Sigue hasta que quieras terminar.
              </p>
              <button onClick={() => setShowDurationBanner(false)} className="ml-3 flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="px-6 pt-8 pb-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={handleExit} className="p-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
              <X className="w-5 h-5 text-stone-600" />
            </button>
            <div className="text-center">
              <p className="text-stone-500 text-sm">{selectedWeeklySession.name}</p>
              <p className="font-semibold text-stone-900">{selectedWeeklySession.duration} min</p>
            </div>
            {/* Reloj — pulsar para expandir */}
            <button onClick={() => setShowClockExpanded(true)} className="focus:outline-none">
              <WorkoutClock elapsed={elapsed} style={clockStyle} targetMinutes={targetDuration} />
            </button>
          </div>
          {/* Progreso del modo simple */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                animate={{ width: `${exercises.length ? (exercises.filter(e => simpleDone.has(e.id)).length / exercises.length) * 100 : 0}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="text-sm text-stone-500 font-medium">{exercises.filter(e => simpleDone.has(e.id)).length}/{exercises.length}</span>
          </div>
        </div>

        <div className="flex-1 px-6 pb-32 overflow-y-auto">
          <div className="space-y-4">
            {includeWarmup && (
              <Card className={`p-4 border-0 rounded-2xl shadow-sm ${warmupDone ? 'bg-orange-50 dark:bg-orange-500/15' : 'glass-card'}`}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <Flame className="w-7 h-7 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${warmupDone ? 'text-stone-400 line-through' : 'text-stone-900'}`}>Calentamiento</p>
                    <p className={`font-medium ${warmupDone ? 'text-stone-300' : 'text-orange-600'}`}>5 min · movilidad + cardio ligero</p>
                  </div>
                  <button
                    onClick={() => setWarmupDone(v => !v)}
                    className={`w-9 h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${warmupDone ? 'border-orange-500 bg-orange-500' : 'border-stone-300 hover:border-orange-400'}`}
                  >
                    <Check className={`w-5 h-5 ${warmupDone ? 'text-white' : 'text-stone-300'}`} />
                  </button>
                </div>
              </Card>
            )}
            {exercises.map((exercise, index) => {
              const done = simpleDone.has(exercise.id);
              return (
              <motion.div key={exercise.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <Card
                  onClick={() => {
                    setShowExerciseDetail(exercise);
                    setSelectedVariation(exercise.variations?.[0] || null);
                  }}
                  className={`p-4 border-0 rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition-all ${done ? 'bg-emerald-50 dark:bg-emerald-500/15' : 'glass-card'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                      <ExercisePreview
                        name={exercise.name}
                        muscle={exercise.targetMuscle}
                        className="w-16 h-16"
                        rounded="rounded-xl"
                      />
                      <span className="absolute -top-1.5 -left-1.5 w-6 h-6 bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center justify-center shadow">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold ${done ? 'text-stone-400 line-through' : 'text-stone-900'}`}>{exercise.name}</p>
                      <p className={`font-medium ${done ? 'text-stone-300' : 'text-emerald-600'}`}>
                        {exercise.sets} series x {formatReps(exercise.reps)} reps
                      </p>
                      {exercise.instructions && (
                        <p className="text-stone-400 text-sm mt-1">{exercise.instructions}</p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSimpleDone(prev => {
                          const next = new Set(prev);
                          if (next.has(exercise.id)) next.delete(exercise.id); else next.add(exercise.id);
                          return next;
                        });
                      }}
                      className={`w-9 h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${done ? 'border-emerald-500 bg-emerald-500' : 'border-stone-300 hover:border-emerald-400'}`}
                      title={done ? 'Marcar como pendiente' : 'Marcar como hecho'}
                    >
                      <Check className={`w-5 h-5 ${done ? 'text-white' : 'text-stone-300'}`} />
                    </button>
                  </div>
                </Card>
              </motion.div>
              );
            })}
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
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-modal rounded-3xl p-6 max-w-sm w-full">
              <h3 className="text-xl font-bold text-stone-900 mb-2">¿Salir del entreno?</h3>
              <p className="text-stone-500 mb-6">Tu progreso no se guardará</p>
              <div className="flex gap-3">
                <Button onClick={() => setShowExitConfirm(false)} variant="outline" className="flex-1 py-4 rounded-xl">Continuar</Button>
                <Button onClick={confirmExit} className="flex-1 py-4 rounded-xl bg-stone-900 hover:bg-stone-800">Salir</Button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ── Modal: selector de reloj (primera vez) ── */}
        <AnimatePresence>
          {showClockPicker && (
            <ClockPickerModal
              onChoose={handleClockStyleChoice}
            />
          )}
        </AnimatePresence>

        {/* ── Modal: reloj expandido (al pulsar el reloj) ── */}
        <AnimatePresence>
          {showClockExpanded && (
            <ClockExpandedModal
              elapsed={elapsed}
              style={clockStyle}
              targetMinutes={targetDuration}
              onClose={() => setShowClockExpanded(false)}
            />
          )}
        </AnimatePresence>

        <WorkoutCoachChat sessionName={selectedWeeklySession.name} />

        {/* INYECTAMOS EL MODAL AQUÍ */}
        {ExerciseDetailModal}
      </div>
    );
  }

  // -------------------------
  // MODO GUIADO
  // -------------------------

  if (showGuidedWarmup) {
    return (
      <div className="min-h-screen glass-bg flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center mb-6">
          <Flame className="w-10 h-10 text-orange-500" />
        </div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">Calentamiento</h1>
        <p className="text-stone-500 mb-8">5 minutos antes de empezar {selectedWeeklySession.name}</p>
        <ul className="space-y-3 mb-10 w-full max-w-sm text-left">
          {['Movilidad articular: hombros, cadera y rodillas (1 min)', 'Cardio ligero: marcha o jumping jacks suaves (2 min)', 'Activación con peso corporal de los músculos de hoy (2 min)'].map((step, i) => (
            <li key={i} className="flex items-start gap-3 glass-card rounded-2xl p-4">
              <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
              <span className="text-stone-700 dark:text-stone-200 text-sm">{step}</span>
            </li>
          ))}
        </ul>
        <Button onClick={() => setShowGuidedWarmup(false)} className="w-full max-w-sm py-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-lg font-semibold shadow-lg shadow-emerald-200">
          Continuar al entreno
        </Button>
        <button onClick={() => setScreen('dashboard')} className="mt-4 text-stone-400 text-sm">Cancelar</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen glass-bg flex flex-col">
      {/* Banner de duración alcanzada (modo guiado) */}
      <AnimatePresence>
        {showDurationBanner && (
          <motion.div
            initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -60, opacity: 0 }}
            className="fixed top-0 inset-x-0 z-50 mx-4 mt-16 bg-amber-400 text-amber-900 rounded-2xl px-4 py-3 flex items-center justify-between shadow-lg"
          >
            <p className="text-sm font-semibold">¡{targetDuration} minutos completados! Sigue hasta terminar.</p>
            <button onClick={() => setShowDurationBanner(false)}><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={handleExit} className="p-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
            <X className="w-5 h-5 text-stone-600" />
          </button>
          <div className="text-center">
            <p className="text-stone-500 text-sm">{selectedWeeklySession.name}</p>
            <p className="font-semibold text-stone-900">Ejercicio {currentExerciseIndex + 1} de {exercises.length}</p>
          </div>
          {/* Reloj modo guiado — misma lógica que simple */}
          <button onClick={() => setShowClockExpanded(true)} className="focus:outline-none">
            <WorkoutClock elapsed={elapsed} style={clockStyle} targetMinutes={targetDuration} />
          </button>
        </div>
        <Progress value={progress} className="h-2 bg-stone-200" />
        <p className="text-right text-sm text-stone-400 mt-1">{completedSets.size}/{totalSets} series</p>
      </div>

      <div className="flex-1 px-6 flex flex-col">
        <AnimatePresence mode="wait">
          {isResting ? (
            <motion.div key="rest" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex-1 flex flex-col items-center justify-center text-center">
              <p className="text-stone-500 mb-5 flex items-center gap-2"><Clock className="w-4 h-4" /> Descansa</p>
              <div className="relative w-52 h-52 mb-8">
                <svg className="w-52 h-52 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(16,185,129,0.15)" strokeWidth="6" />
                  <motion.circle
                    cx="50" cy="50" r="45" fill="none" stroke="#10b981" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 45}
                    animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - (restTotal ? restTime / restTotal : 0)) }}
                    transition={{ duration: 0.4, ease: 'linear' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold text-stone-900">
                    {Math.floor(restTime / 60)}:{(restTime % 60).toString().padStart(2, '0')}
                  </span>
                  <span className="text-stone-400 text-sm mt-1">siguiente serie</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => { setRestTime(t => t + 15); setRestTotal(t => t + 15); }} variant="outline" className="rounded-xl px-5">
                  +15s
                </Button>
                <Button onClick={skipRest} className="rounded-xl px-6 bg-emerald-500 hover:bg-emerald-600">Saltar descanso</Button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="exercise" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col">
              <Card className="p-6 bg-white border-0 rounded-3xl shadow-sm mb-6">
                {/* Preview animado del ejercicio actual */}
                <ExercisePreview
                  name={currentExercise.name}
                  muscle={currentExercise.targetMuscle}
                  className="h-44 w-full mb-4"
                />
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

                <div className="glass-bg rounded-2xl p-4">
                  <p className="text-stone-500 text-sm mb-1">Serie {currentSetIndex + 1}</p>
                  <p className="text-2xl font-bold text-stone-900">
                    {currentExercise.reps[currentSetIndex] || currentExercise.reps[0]} repeticiones
                  </p>
                </div>
              </Card>

              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-stone-600 text-sm">Peso usado (kg) - opcional</label>
                    {getLastWeight(currentExercise.id) && (
                      <button
                        type="button"
                        onClick={() => setWeight(String(getLastWeight(currentExercise.id)))}
                        className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full flex items-center gap-1"
                      >
                        <TrendingUp className="w-3 h-3" /> Última vez: {getLastWeight(currentExercise.id)} kg
                      </button>
                    )}
                  </div>
                  <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder={getLastWeight(currentExercise.id) ? String(getLastWeight(currentExercise.id)) : 'Ej: 20'} className="py-5 px-4 rounded-xl bg-white border-stone-200 text-lg" />
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
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-modal rounded-3xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-stone-900 mb-2">¿Salir del entreno?</h3>
            <p className="text-stone-500 mb-6">Tu progreso se guardará parcialmente</p>
            <div className="flex gap-3">
              <Button onClick={() => setShowExitConfirm(false)} variant="outline" className="flex-1 py-4 rounded-xl">Continuar</Button>
              <Button onClick={confirmExit} className="flex-1 py-4 rounded-xl bg-stone-900 hover:bg-stone-800">Salir</Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Modales de reloj (modo guiado) ── */}
      <AnimatePresence>
        {showClockPicker && (
          <ClockPickerModal onChoose={handleClockStyleChoice} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showClockExpanded && (
          <ClockExpandedModal
            elapsed={elapsed}
            style={clockStyle}
            targetMinutes={targetDuration}
            onClose={() => setShowClockExpanded(false)}
          />
        )}
      </AnimatePresence>

      <WorkoutCoachChat sessionName={selectedWeeklySession.name} currentExercise={currentExercise} />

      {/* INYECTAMOS EL MODAL AQUÍ (Compartido) */}
      {ExerciseDetailModal}
    </div>
  );
}