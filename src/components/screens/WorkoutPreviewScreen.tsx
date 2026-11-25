'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ExerciseDetailSheet } from '@/components/workout/ExerciseDetailSheet';
import { DoseChips, MuscleTags, SupersetGroup, exerciseBlocks } from '@/components/workout/ExerciseBits';
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
  ChevronDown,
  Info,
  TrendingUp,
  Trash2,
  MoveRight,
  AlertCircle,
  Flame,
  Check,
  Repeat,
} from 'lucide-react';
import type { WorkoutMode, Exercise } from '@/types/user';
import { ExercisePreview } from '@/components/workout/ExercisePreview';
import { WARMUP_EXERCISES } from '@/lib/warmupExercises';
import { resolveAlternative, swapExercise } from '@/lib/exerciseSwap';

export function WorkoutPreviewScreen() {
  const {
    selectedWeeklySession,
    setScreen,
    setWorkoutMode,
    removeSession,
    getExerciseHistory,
    user,
    getExerciseByName,
    updateSessionExercises,
    includeWarmup,
    setIncludeWarmup,
    changeSessionMinutes,
    setSelectedWeeklySession,
  } = useApp();
  const [showTime, setShowTime] = useState(false);
  const [showModeModal, setShowModeModal] = useState(false);
  const [showExerciseDetail, setShowExerciseDetail] = useState<Exercise | null>(null);
  const [detailIndex, setDetailIndex] = useState<number | null>(null); // posición en la sesión del ejercicio abierto
  const [showSessionOptions, setShowSessionOptions] = useState(false);
  const [showWarmupInfo, setShowWarmupInfo] = useState(false);

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

  // "¿No encuentras este ejercicio?": la alternativa elegida sustituye al
  // ejercicio en la sesión y queda guardada y marcada.
  const chooseAlternative = (name: string) => {
    if (detailIndex === null || !showExerciseDetail || name === showExerciseDetail.name) return;
    const exercises = selectedWeeklySession.exercises;
    const original = exercises[detailIndex];
    const swapped = swapExercise(original, resolveAlternative(original, name, getExerciseByName));
    updateSessionExercises(selectedWeeklySession.id, exercises.map((e, i) => (i === detailIndex ? swapped : e)));
    setShowExerciseDetail(swapped);
  };

  const getLastWeight = (exerciseId: string): number | null => {
    const history = getExerciseHistory(exerciseId);
    if (history.length === 0) return null;
    const lastLog = history[history.length - 1];
    return lastLog.weight || null;
  };

  return (
    <div className="min-h-dvh glass-bg flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 pt-8 pb-6"
      >
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setScreen('dashboard')}
            className="p-2 rounded-xl glass-btn shadow-sm hover:shadow-md transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-stone-600" />
          </button>
          <div className="flex-1">
            <p className="text-stone-500 text-sm">Sesión {selectedWeeklySession.sessionNumber}</p>
            <h1 className="text-2xl font-bold text-stone-900">{selectedWeeklySession.name}</h1>
          </div>
          <button
            onClick={() => setShowSessionOptions(true)}
            className="p-2 rounded-xl glass-btn shadow-sm hover:shadow-md transition-shadow"
          >
            <AlertCircle className="w-5 h-5 text-stone-400" />
          </button>
        </div>

        {/* Session Info Card */}
        <Card className="p-4">
          <div className="grid grid-cols-3 divide-x divide-stone-200/70 dark:divide-white/10 text-center">
            {[
              { value: selectedWeeklySession.duration, unit: 'min', label: 'de sesión', time: true },
              { value: selectedWeeklySession.exercises.length, unit: '', label: 'ejercicios', time: false },
              { value: selectedWeeklySession.exercises.reduce((a, e) => a + e.sets, 0), unit: '', label: 'series', time: false },
            ].map(stat => (
              <button
                key={stat.label}
                type="button"
                disabled={!stat.time || selectedWeeklySession.status === 'completed'}
                onClick={() => setShowTime(v => !v)}
                className="px-1 disabled:cursor-default"
              >
                <p className="text-2xl font-bold text-stone-900 tabular-nums leading-none">
                  {stat.value}<span className="text-sm font-semibold text-stone-500 ml-0.5">{stat.unit}</span>
                </p>
                <p className={`text-[11px] uppercase tracking-wide mt-1.5 ${stat.time && selectedWeeklySession.status !== 'completed' ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-stone-500'}`}>
                  {stat.time && selectedWeeklySession.status !== 'completed' ? 'Cambiar tiempo' : stat.label}
                </p>
              </button>
            ))}
          </div>

          <AnimatePresence initial={false}>
            {showTime && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="pt-4 space-y-2">
                  <p className="text-sm font-semibold text-stone-800 text-center">¿Cuánto tiempo tienes para esta sesión?</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {[...new Set([20, 30, 40, 45, 60, 75, 90, selectedWeeklySession.duration])].sort((a, b) => a - b).map(m => (
                      <button
                        key={m}
                        type="button"
                        aria-pressed={selectedWeeklySession.duration === m}
                        onClick={() => {
                          setSelectedWeeklySession(changeSessionMinutes(selectedWeeklySession, m));
                          setShowTime(false);
                        }}
                        className={`min-w-[3.5rem] px-3 py-2 rounded-full text-sm font-semibold tabular-nums transition-colors ${
                          selectedWeeklySession.duration === m ? 'bg-emerald-500 text-white' : 'bg-[rgba(118,118,128,0.12)] text-stone-700 dark:text-white/80'
                        }`}
                      >
                        {m} min
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-stone-500 text-center">El Motor rehace la sesión para que quepa en ese tiempo.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setShowWarmupInfo(v => !v)}
            className={`mt-4 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              includeWarmup
                ? 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300'
                : 'bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-white/70 hover:bg-stone-200'
            }`}
          >
            <Flame className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <span className="flex-1 text-left">{includeWarmup ? 'Calentamiento añadido · 5 min' : 'Añadir calentamiento · 5 min'}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showWarmupInfo ? 'rotate-180' : ''}`} />
          </button>

          {/* Panel desplegable de calentamiento */}
          <AnimatePresence>
            {showWarmupInfo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-stone-200/60 dark:border-stone-700/60">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-stone-800 dark:text-white flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-orange-500" /> Calentamiento (5 min)
                    </p>
                    <button
                      onClick={() => setIncludeWarmup(!includeWarmup)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        includeWarmup
                          ? 'bg-orange-500 text-white'
                          : 'bg-emerald-500 text-white hover:bg-emerald-600'
                      }`}
                    >
                      {includeWarmup ? <><Check className="w-3.5 h-3.5" /> Añadido</> : 'Añadir'}
                    </button>
                  </div>
                  <ul className="space-y-2">
                    {WARMUP_EXERCISES.map((step, i) => (
                      <li key={step.name} className="flex items-center gap-2.5">
                        <ExercisePreview name={step.name} muscle={step.targetMuscle} className="w-10 h-10 flex-shrink-0" rounded="rounded-lg" />
                        <div className="min-w-0">
                          <p className="text-stone-700 dark:text-stone-200 text-xs font-medium truncate">{step.name}</p>
                          <p className="text-stone-400 text-[11px]">{step.duration}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* Exercise List */}
      <div className="flex-1 px-6 pb-32 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {includeWarmup && (
            <div className="mb-4 p-4 rounded-2xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200/60 dark:border-orange-500/20 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="font-semibold text-stone-800 dark:text-white text-sm">Calentamiento</p>
                <p className="text-stone-500 text-xs">5 min · movilidad + cardio ligero</p>
              </div>
            </div>
          )}

          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-lg font-semibold text-stone-900">Ejercicios</h2>
            <p className="text-xs text-stone-500">{selectedWeeklySession.targetMuscles}</p>
          </div>

          <div className="space-y-3">
            {exerciseBlocks(selectedWeeklySession.exercises).map((block, b) => {
              const rows = block.map(index => {
                const exercise = selectedWeeklySession.exercises[index];
                const lastWeight = getLastWeight(exercise.id);
                return (
                  <Card
                    key={exercise.id}
                    onClick={() => {
                      setDetailIndex(index);
                      setShowExerciseDetail(exercise);
                    }}
                    className="glass-card p-3 border-0 rounded-2xl hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        <ExercisePreview name={exercise.name} muscle={exercise.targetMuscle} className="w-[72px] h-[72px]" rounded="rounded-xl" />
                        <span className="absolute -top-1.5 -left-1.5 min-w-5 h-5 px-1 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow tabular-nums">
                          {index + 1}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <p className="font-semibold text-stone-900 leading-snug">{exercise.name}</p>
                        <DoseChips exercise={exercise} rest={block.length === 1} />
                        <MuscleTags exercise={exercise} size="xs" />
                        {lastWeight && (
                          <p className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 text-xs">
                            <TrendingUp className="w-3 h-3" /> Última vez: {lastWeight} kg
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-stone-300 flex-shrink-0 self-center" />
                    </div>
                  </Card>
                );
              });
              const restOfRound = Math.max(...block.map(i => selectedWeeklySession.exercises[i].restSeconds));
              return (
                <motion.div
                  key={block.join('-')}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + b * 0.04 }}
                >
                  {block.length > 1 ? <SupersetGroup rest={restOfRound}>{rows}</SupersetGroup> : rows}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Start Button */}
      <div className="fixed bottom-0 left-0 right-0 px-6 pt-10 pb-[max(1.5rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-[var(--app-bg)] via-[var(--app-bg)]/90 to-transparent">
        <Button
          onClick={handleStartSession}
          className="w-full h-14 rounded-2xl text-lg font-semibold"
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
              className="glass-modal rounded-t-3xl p-6 w-full max-w-md"
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
                  className="glass-card p-5 cursor-pointer border-2 border-transparent hover:border-emerald-300 transition-all rounded-2xl"
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
                  className="glass-card p-5 cursor-pointer border-2 border-transparent hover:border-emerald-300 transition-all rounded-2xl"
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
              className="glass-modal rounded-t-3xl p-6 w-full max-w-md"
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
                  className="glass-card p-5 cursor-pointer border-2 border-transparent hover:border-emerald-300 transition-all rounded-2xl"
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

      {/* Ficha del ejercicio con alternativas */}
      <ExerciseDetailSheet
        exercise={showExerciseDetail}
        lastWeight={showExerciseDetail ? getLastWeight(showExerciseDetail.id) : null}
        onClose={() => setShowExerciseDetail(null)}
        onChooseAlternative={chooseAlternative}
      />
    </div>
  );
}
