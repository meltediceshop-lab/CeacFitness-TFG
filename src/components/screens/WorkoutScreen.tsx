'use client';

import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { formatRepLine, formatRest } from '@/lib/exerciseFormat';
import { ExerciseDetailSheet } from '@/components/workout/ExerciseDetailSheet';
import { MuscleTags } from '@/components/workout/ExerciseBits';
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
  AlertTriangle,
  ClipboardList,
  Plus,
  Minus,
  Repeat,
} from 'lucide-react';
import type { Exercise, ClockStyle } from '@/types/user';
import { ExercisePreview } from '@/components/workout/ExercisePreview';
import { WorkoutCoachChat } from '@/components/workout/WorkoutCoachChat';
import { LastWeightsButton } from '@/components/workout/LastWeightsSheet';
import { ShareStudio } from '@/components/community/ShareStudio';
import { WarmupModal } from '@/components/workout/WarmupModal';
import { WARMUP_EXERCISES } from '@/lib/warmupExercises';
import { WorkoutClock, WorkoutClockLarge } from '@/components/workout/WorkoutClock';
import { useScrollLock } from '@/hooks/useScrollLock';
import { handleDiscomfort } from '@/lib/fitkSafety';
import { resolveAlternative, swapExercise } from '@/lib/exerciseSwap';
import { nextGuidedStep, supersetPartner } from '@/lib/workoutFlow';
import { clearActiveWorkout, elapsedSince, loadActiveWorkout, planSessionId, saveActiveWorkout, secondsUntil, type LoggedSet } from '@/lib/activeWorkout';

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

// ─── Hoja para registrar series (modo simple) ────────────────────────────────
function SetLogSheet({
  exercise, initial, onSave, onClose,
}: {
  exercise: Exercise; initial: LoggedSet[]; onSave: (sets: LoggedSet[]) => void; onClose: () => void;
}) {
  useScrollLock();
  const [sets, setSets] = useState<LoggedSet[]>(initial);
  const unit = exercise.repUnit === 'seconds' ? 'seg' : exercise.repUnit === 'steps' ? 'pasos' : 'reps';
  const update = (i: number, field: keyof LoggedSet, value: string) =>
    setSets(prev => prev.map((s, j) => (j === i ? { ...s, [field]: value } : s)));
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-black/50 flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="glass-modal w-full max-w-md rounded-t-3xl px-6 pt-5 pb-8 max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-stone-200 rounded-full mx-auto mb-4" />
        <h2 className="text-lg font-bold text-stone-900">{exercise.name}</h2>
        <p className="text-stone-500 text-sm mb-4">Objetivo: {exercise.sets} series x {formatRepLine(exercise)}</p>

        <div className="grid grid-cols-[3.5rem_1fr_1fr_2.5rem] gap-2 text-xs text-stone-400 font-medium px-1 mb-1">
          <span>Serie</span><span>kg</span><span>{unit}</span><span />
        </div>
        <div className="space-y-2">
          {sets.map((set, i) => (
            <div key={i} className="grid grid-cols-[3.5rem_1fr_1fr_2.5rem] gap-2 items-center">
              <span className="text-stone-700 font-semibold pl-1">{i + 1}</span>
              <Input type="number" inputMode="decimal" aria-label={`Peso serie ${i + 1}`} value={set.weight}
                onChange={e => update(i, 'weight', e.target.value)} placeholder="—" className="py-4 rounded-xl text-base" />
              <Input type="number" inputMode="numeric" aria-label={`${unit} serie ${i + 1}`} value={set.reps}
                onChange={e => update(i, 'reps', e.target.value)} placeholder="—" className="py-4 rounded-xl text-base" />
              <button type="button" aria-label={`Quitar serie ${i + 1}`} disabled={sets.length <= 1}
                onClick={() => setSets(prev => prev.filter((_, j) => j !== i))}
                className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-red-50 text-stone-500 hover:text-red-500 flex items-center justify-center disabled:opacity-30 transition-colors">
                <Minus className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <button type="button"
          onClick={() => setSets(prev => [...prev, { ...(prev[prev.length - 1] ?? { weight: '', reps: '' }) }])}
          className="mt-3 w-full py-3 rounded-xl border-2 border-dashed border-stone-200 text-stone-500 hover:border-emerald-400 hover:text-emerald-600 flex items-center justify-center gap-2 text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Añadir serie
        </button>
        <Button onClick={() => onSave(sets)} className="mt-5 w-full py-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-semibold">
          Guardar series
        </Button>
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
    getExerciseByName,
    updateSessionExercises,
    supabaseUserId,
    todayEnergy,
  } = useApp();

  // 1. Estado del Modal (Compartido para Modo Simple y Guiado)
  const [showExerciseDetail, setShowExerciseDetail] = useState<Exercise | null>(null);
  const [detailIndex, setDetailIndex] = useState<number | null>(null); // posición en la sesión del ejercicio abierto
  const [warmupDone, setWarmupDone] = useState(false);
  const [showWarmupModal, setShowWarmupModal] = useState(false);
  // Entreno guardado si la app se cerró a mitad de sesión (se reanuda).
  const [resumed] = useState(() => {
    const active = loadActiveWorkout();
    return active && active.session.id === selectedWeeklySession?.id ? active : null;
  });
  // Punto en el que se quedó el modo guiado, si se reanuda.
  const [resumedGuided] = useState(() => {
    const g = resumed?.guided;
    const list = selectedWeeklySession?.exercises ?? [];
    if (!g || !list.length) return null;
    const exerciseIndex = Math.min(Math.max(0, g.exerciseIndex), list.length - 1);
    const restLeft = g.restEndsAt ? secondsUntil(g.restEndsAt) : 0;
    return {
      exerciseIndex,
      setIndex: Math.min(Math.max(0, g.setIndex), list[exerciseIndex].sets - 1),
      completed: g.completed,
      logs: g.logs,
      restEndsAt: restLeft > 0 ? (g.restEndsAt as number) : null,
      restTotal: restLeft > 0 ? Math.max(g.restTotal ?? restLeft, restLeft) : 0,
      warmupPending: g.warmupPending ?? false,
    };
  });
  // Al reanudar solo se salta si ya se había pasado de la pantalla de calentamiento.
  const [showGuidedWarmup, setShowGuidedWarmup] = useState(includeWarmup && (!resumedGuided || resumedGuided.warmupPending));

  // 2. Estado del Modo Guiado
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(resumedGuided?.exerciseIndex ?? 0);
  const [currentSetIndex, setCurrentSetIndex] = useState(resumedGuided?.setIndex ?? 0);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  // Descanso: se guarda la hora real a la que termina, no los segundos que
  // quedan, para que siga contando con la app en segundo plano o cerrada.
  const [restEndsAt, setRestEndsAt] = useState<number | null>(resumedGuided?.restEndsAt ?? null);
  const [restTime, setRestTime] = useState(() => (resumedGuided?.restEndsAt ? secondsUntil(resumedGuided.restEndsAt) : 0));
  const [restTotal, setRestTotal] = useState(resumedGuided?.restTotal ?? 0);
  const [completedSets, setCompletedSets] = useState<Set<string>>(() => new Set(resumedGuided?.completed ?? []));
  const isResting = restEndsAt !== null;

  // 3. Estado del Modo Simple / Finalización
  const [showComplete, setShowComplete] = useState(false);
  const [showRecordPrompt, setShowRecordPrompt] = useState(false);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>(() => resumedGuided?.logs ?? []);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [completionStep, setCompletionStep] = useState<1 | 2>(1); // 1=mensaje, 2=compartir
  const [simpleDone, setSimpleDone] = useState<Set<string>>(() => new Set(resumed?.done ?? [])); // modo simple: ejercicios marcados
  const [setLogs, setSetLogs] = useState<Record<string, LoggedSet[]>>(() => resumed?.sets ?? {}); // modo simple: series registradas
  const [logSheetIndex, setLogSheetIndex] = useState<number | null>(null);
  const [showPartialConfirm, setShowPartialConfirm] = useState(false);
  const [showShareStudio, setShowShareStudio] = useState(false);
  const [showGuidedFinish, setShowGuidedFinish] = useState(false); // modo guiado: terminar con series sin hacer

  // 4. Cronómetro modo simple
  // Hora real de inicio: si la app se cerró a mitad de entreno se reanuda la misma.
  const [startedAt] = useState(() => resumed?.startedAt ?? Date.now());
  const [elapsed, setElapsed] = useState(() => elapsedSince(startedAt)); // segundos desde que empezó
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const finishedRef = useRef(false);
  const [durationAlertShown, setDurationAlertShown] = useState(false);
  const [showDurationBanner, setShowDurationBanner] = useState(false);
  const [showClockPicker, setShowClockPicker] = useState(false);
  const [showClockExpanded, setShowClockExpanded] = useState(false);

  // 5. Safety Flow (SAFE-001): molestia declarada por el usuario
  const [discomfortMessage, setDiscomfortMessage] = useState<string | null>(null);

  // Cuenta atrás del descanso: siempre a partir de la hora real de fin. Al
  // volver a la app (o desbloquear el móvil) se recalcula al instante.
  useEffect(() => {
    if (restEndsAt === null) return;
    const sync = () => {
      const left = secondsUntil(restEndsAt);
      setRestTime(left);
      if (left <= 0) setRestEndsAt(null);
    };
    sync();
    const interval = setInterval(sync, 250);
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('pageshow', sync);
    window.addEventListener('focus', sync);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('pageshow', sync);
      window.removeEventListener('focus', sync);
    };
  }, [restEndsAt]);

  // Cronómetro: arranca en ambos modos al montar el entreno
  useEffect(() => {
    // Primera vez (cualquier modo) → mostrar selector de reloj
    if (!user?.profile.clockStyleChosen) {
      setShowClockPicker(true);
    }

    // Se calcula desde la hora de inicio para que siga contando aunque la
    // app pase a segundo plano o se cierre.
    const tick = () => { if (!finishedRef.current) setElapsed(elapsedSince(startedAt)); };
    timerRef.current = setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);
    window.addEventListener('pageshow', tick);
    window.addEventListener('focus', tick);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', tick);
      window.removeEventListener('pageshow', tick);
      window.removeEventListener('focus', tick);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guarda el entreno en curso (también tras cambiar un ejercicio) para poder reanudarlo.
  useEffect(() => {
    if (finishedRef.current || !selectedWeeklySession || !workoutMode) return;
    saveActiveWorkout({
      session: selectedWeeklySession, startedAt, mode: workoutMode, includeWarmup, done: [...simpleDone], sets: setLogs,
      energy: todayEnergy,
      guided: workoutMode === 'guided'
        ? { exerciseIndex: currentExerciseIndex, setIndex: currentSetIndex, completed: [...completedSets], logs: exerciseLogs, restEndsAt: restEndsAt ?? undefined, restTotal, warmupPending: showGuidedWarmup }
        : undefined,
    });
  }, [selectedWeeklySession, workoutMode, includeWarmup, startedAt, simpleDone, setLogs, todayEnergy,
    currentExerciseIndex, currentSetIndex, completedSets, exerciseLogs, restEndsAt, restTotal, showGuidedWarmup]);

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
  // Sesión del plan que se marca como hecha (la versión adaptada por energía tiene id propio).
  const sessionId = planSessionId(selectedWeeklySession);

  if (exercises.length === 0) {
    return (
      <div className="min-h-screen glass-bg flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <p className="text-stone-500">No hay ejercicios para esta sesión.</p>
          <button
            onClick={() => { finishedRef.current = true; clearActiveWorkout(); setScreen('dashboard'); }}
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
  const getLastWeight = (exerciseId: string): number | null => {
    if (!getExerciseHistory) return null;
    const history = getExerciseHistory(exerciseId);
    if (history.length === 0) return null;
    return history[history.length - 1].weight || null;
  };

  const startRestTimer = (seconds: number) => {
    setRestTime(seconds);
    setRestTotal(seconds);
    setRestEndsAt(Date.now() + seconds * 1000);
  };

  const skipRest = () => {
    setRestEndsAt(null);
    setRestTime(0);
  };

  const extendRest = (seconds: number) => {
    setRestEndsAt(endsAt => (endsAt === null ? endsAt : endsAt + seconds * 1000));
    setRestTime(t => t + seconds);
    setRestTotal(t => t + seconds);
  };

  // Safety Flow (SAFE-001 🔒): cancela el ejercicio actual sin bajar carga
  // ni sustituir automáticamente; registra el evento y deja continuar el
  // resto de la sesión con normalidad.
  const handleReportDiscomfort = () => {
    if (!currentExercise) return;
    skipRest();

    const { message, event } = handleDiscomfort(currentExercise);
    setDiscomfortMessage(message);

    if (supabaseUserId) {
      fetch('/api/safety-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      }).catch(() => { /* silently ignore */ });
    }

    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSetIndex(0);
    } else {
      setShowGuidedFinish(true);
    }
  };

  const handleCompleteSet = () => {
    const setKey = `${currentExerciseIndex}-${currentSetIndex}`;
    const newCompletedSets = new Set(completedSets);
    newCompletedSets.add(setKey);
    setCompletedSets(newCompletedSets);

    // La última serie también cuenta: se pasa al cierre sin esperar al estado.
    const logs = weight || reps
      ? [...exerciseLogs, {
          exerciseId: currentExercise.id,
          setNumber: currentSetIndex + 1,
          weight: parseFloat(weight) || 0,
          reps: parseInt(reps) || currentExercise.reps[currentSetIndex] || currentExercise.reps[0],
        }]
      : exerciseLogs;
    if (logs !== exerciseLogs) setExerciseLogs(logs);

    if (newCompletedSets.size >= totalSets) {
      handleWorkoutComplete(logs);
      return;
    }

    // Siguiente serie; en una biserie se alterna sin descanso entre los dos ejercicios.
    const next = nextGuidedStep(exercises, currentExerciseIndex, currentSetIndex);
    if (next) {
      setCurrentExerciseIndex(next.exerciseIndex);
      setCurrentSetIndex(next.setIndex);
      if (next.rest > 0) startRestTimer(next.rest);
    } else {
      // Final de la sesión con series sin hacer (molestias o saltadas con "Siguiente").
      setShowGuidedFinish(true);
    }

    setWeight('');
    setReps('');
  };

  const savePendingActions = () => {
    if (!selectedWeeklySession) return;
    try {
      const KEY = 'fitmente-session-actions';
      const existing: Record<string, unknown> = JSON.parse(localStorage.getItem(KEY) || '{}');
      existing[sessionId] = {
        sessionId,
        sessionName:        selectedWeeklySession.name,
        completedAt:        new Date().toISOString(),
        dismissedRegister:  false,
        dismissedCommunity: false,
      };
      localStorage.setItem(KEY, JSON.stringify(existing));
    } catch { /* silently ignore */ }
  };

  const realMinutes = () => Math.max(1, Math.round(elapsedSince(startedAt) / 60));
  const finishActiveWorkout = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    finishedRef.current = true;
    clearActiveWorkout();
  };

  const handleWorkoutComplete = (logs: ExerciseLog[] = exerciseLogs, instance?: Exercise[]) => {
    finishActiveWorkout();
    savePendingActions();
    if (workoutMode === 'simple') {
      setShowRecordPrompt(true);
    } else {
      const logsToSave = logs.map(l => ({ ...l, timestamp: new Date() }));
      completeWeeklySession(sessionId, logsToSave, instance, realMinutes());
      setShowComplete(true);
    }
  };

  // Modo guiado: series que quedan sin hacer y cierre con lo hecho (los
  // ejercicios sin ninguna serie se guardan como no hechos, igual que en el simple).
  const setsLeft = (index: number) =>
    Array.from({ length: exercises[index].sets }, (_, k) => k).filter(k => !completedSets.has(`${index}-${k}`));
  const guidedPending = exercises
    .map((e, i) => ({ exercise: e, index: i, left: setsLeft(i) }))
    .filter(p => p.left.length > 0);
  const finishGuided = () => {
    setShowGuidedFinish(false);
    setShowExitConfirm(false);
    const instance = exercises.map((e, i) => (setsLeft(i).length < e.sets ? e : { ...e, skipped: true }));
    handleWorkoutComplete(exerciseLogs, instance);
  };
  const continuePending = () => {
    const first = guidedPending[0];
    if (first) {
      setCurrentExerciseIndex(first.index);
      setCurrentSetIndex(first.left[0]);
    }
    setShowGuidedFinish(false);
  };

  // Modo simple: si quedan ejercicios sin marcar se avisa antes de terminar
  // (p. ej. te vas antes por falta de tiempo) y se guardan como no hechos.
  const pendingExercises = exercises.filter(e => !simpleDone.has(e.id));

  const handleSimpleModeComplete = (confirmedPartial = false) => {
    if (pendingExercises.length > 0 && !confirmedPartial) {
      setShowPartialConfirm(true);
      return;
    }
    setShowPartialConfirm(false);
    finishActiveWorkout();
    savePendingActions();
    const instance = exercises.map(e => (simpleDone.has(e.id) ? e : { ...e, skipped: true }));
    const logs = exercises.filter(e => simpleDone.has(e.id)).flatMap(e =>
      (setLogs[e.id] ?? [])
        .filter(set => set.weight !== '' || set.reps !== '')
        .map((set, i) => ({
          exerciseId: e.id,
          setNumber: i + 1,
          weight: parseFloat(set.weight) || 0,
          reps: parseInt(set.reps) || e.reps[i] || e.reps[0],
          timestamp: new Date(),
        })),
    );
    if (logs.length > 0) {
      completeWeeklySession(sessionId, logs, instance, realMinutes());
      setShowComplete(true);
    } else {
      // Se guarda ya: si la app se cierra en la pregunta siguiente, no se pierde.
      completeWeeklySession(sessionId, undefined, instance, realMinutes());
      setShowRecordPrompt(true);
    }
  };

  const defaultSetsFor = (e: Exercise): LoggedSet[] => {
    const weight = getLastWeight(e.id) ?? e.suggestedWeightKg;
    return Array.from({ length: e.sets }, (_, i) => ({
      weight: weight ? String(weight) : '',
      reps: String(e.reps[i] ?? e.reps[0] ?? ''),
    }));
  };
  const handleExit = () => setShowExitConfirm(true);
  const confirmExit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    finishActiveWorkout();
    setScreen('dashboard');
  };

  const clockStyle: ClockStyle = user?.profile.clockStyle ?? 'digital';

  const handleClockStyleChoice = (style: ClockStyle) => {
    if (!user) return;
    setUser({ ...user, profile: { ...user.profile, clockStyle: style, clockStyleChosen: true } });
    setShowClockPicker(false);
  };
  
  const handleRecordChoice = (_choice: 'now' | 'later' | 'skip') => {
    setShowRecordPrompt(false);
    setShowComplete(true);
  };

  const progress = (completedSets.size / totalSets) * 100;

  const openExerciseDetail = (index: number) => {
    setDetailIndex(index);
    setShowExerciseDetail(exercises[index]);
  };

  // "¿No encuentras este ejercicio?": la alternativa elegida sustituye al
  // ejercicio en la sesión y queda guardada y marcada.
  const chooseAlternative = (name: string) => {
    if (detailIndex === null || !showExerciseDetail || name === showExerciseDetail.name) return;
    const original = exercises[detailIndex];
    const swapped = swapExercise(original, resolveAlternative(original, name, getExerciseByName));
    if (simpleDone.has(original.id)) {
      setSimpleDone(prev => { const next = new Set(prev); next.delete(original.id); next.add(swapped.id); return next; });
    }
    if (setLogs[original.id]) {
      setSetLogs(prev => {
        const { [original.id]: moved, ...rest } = prev;
        return moved ? { ...rest, [swapped.id]: moved } : prev;
      });
    }
    updateSessionExercises(selectedWeeklySession.id, exercises.map((e, i) => (i === detailIndex ? swapped : e)));
    setShowExerciseDetail(swapped);
  };

  // COMPONENTE: Modal de Detalles del Ejercicio (Reutilizable en ambos modos)
  const ExerciseDetailModal = (
    <ExerciseDetailSheet
      exercise={showExerciseDetail}
      lastWeight={showExerciseDetail ? getLastWeight(showExerciseDetail.id) : null}
      onClose={() => setShowExerciseDetail(null)}
      onChooseAlternative={chooseAlternative}
      zIndex="z-[60]"
    />
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
    // Modo simple: solo cuenta lo marcado (y las series registradas si las hay).
    const doneExercises = workoutMode === 'simple'
      ? exercises.filter(e => simpleDone.has(e.id))
      : exercises.filter((e, i) => setsLeft(i).length < e.sets);
    const doneStats = {
      exercises: doneExercises.length < exercises.length ? `${doneExercises.length}/${exercises.length}` : `${exercises.length}`,
      sets: workoutMode === 'simple'
        ? doneExercises.reduce((acc, e) => acc + (setLogs[e.id]?.length ?? e.sets), 0)
        : completedSets.size,
    };

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
                  <p className="text-2xl font-bold text-emerald-600">{doneStats.exercises}</p>
                  <p className="text-stone-500 text-sm">ejercicios</p>
                </div>
                <div className="w-px bg-stone-200" />
                <div>
                  <p className="text-2xl font-bold text-emerald-600">{doneStats.sets}</p>
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
              onClick={() => setShowShareStudio(true)}
              className="w-full p-4 bg-white dark:bg-[#1a1a1a] border-2 border-stone-100 dark:border-stone-800 hover:border-emerald-300 rounded-2xl flex items-center gap-4 transition-all shadow-sm"
            >
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🏋️</span>
              </div>
              <div className="text-left">
                <p className="font-semibold text-stone-900">Compartir entrenamiento</p>
                <p className="text-stone-500 text-sm">Crea tu tarjeta: {sessionName} · {sessionDuration} min</p>
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
        <AnimatePresence>
          {showShareStudio && <ShareStudio sessionId={sessionId} onClose={() => setShowShareStudio(false)} />}
        </AnimatePresence>
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
                className="h-full bg-emerald-500 rounded-full"
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
              <Card
                onClick={() => setShowWarmupModal(true)}
                className={`p-4 border-0 rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition-all ${warmupDone ? 'bg-orange-50 dark:bg-orange-500/15' : 'glass-card'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <Flame className="w-7 h-7 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${warmupDone ? 'text-stone-400 line-through' : 'text-stone-900'}`}>Calentamiento</p>
                    <p className={`font-medium ${warmupDone ? 'text-stone-300' : 'text-orange-600'}`}>5 min · movilidad + cardio ligero</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setWarmupDone(v => !v);
                    }}
                    className={`w-9 h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${warmupDone ? 'border-orange-500 bg-orange-500' : 'border-stone-300 hover:border-orange-400'}`}
                  >
                    <Check className={`w-5 h-5 ${warmupDone ? 'text-white' : 'text-stone-300'}`} />
                  </button>
                </div>
              </Card>
            )}
            {exercises.map((exercise, index) => {
              const done = simpleDone.has(exercise.id);
              const logged = setLogs[exercise.id];
              return (
              <motion.div key={exercise.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <Card
                  onClick={() => openExerciseDetail(index)}
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
                      {/* Al marcarlo como hecho aparece el registro de series */}
                      {done && (
                        <button
                          type="button"
                          aria-label={`Registrar series de ${exercise.name}`}
                          onClick={(e) => { e.stopPropagation(); setLogSheetIndex(index); }}
                          className={`mt-2 w-16 h-9 rounded-xl flex items-center justify-center gap-1 text-xs font-semibold shadow-sm transition-colors ${logged ? 'bg-emerald-500 text-white' : 'bg-white text-emerald-600 ring-2 ring-emerald-400 animate-pulse'}`}
                        >
                          <ClipboardList className="w-4 h-4" />
                          {logged ? logged.length : '+'}
                        </button>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold ${done ? 'text-stone-400 line-through' : 'text-stone-900'}`}>{exercise.name}</p>
                      <p className={`font-medium tabular-nums ${done ? 'text-stone-300' : 'text-emerald-600'}`}>
                        {exercise.sets} × {formatRepLine(exercise)}
                        <span className={`font-normal ${done ? 'text-stone-300' : 'text-stone-400'}`}> · {formatRest(exercise.restSeconds)}</span>
                      </p>
                      {supersetPartner(exercises, index) !== -1 && (
                        <p className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-500/15 text-teal-700 dark:text-teal-300 text-[11px] font-semibold">
                          <Repeat className="w-3 h-3 flex-shrink-0" />
                          Biserie con {exercises[supersetPartner(exercises, index)].name}
                        </p>
                      )}
                      {done && logged && (
                        <p className="text-emerald-700 dark:text-emerald-400 text-sm font-medium mt-1">
                          {logged.map(set => `${set.weight || '–'} kg × ${set.reps || '–'}`).join(' · ')}
                        </p>
                      )}
                      {!done && <div className="mt-2"><MuscleTags exercise={exercise} size="xs" /></div>}
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

        <div className="fixed bottom-0 left-0 right-0 px-6 pt-10 pb-[max(1.5rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-[var(--app-bg)] via-[var(--app-bg)]/90 to-transparent">
          <Button onClick={() => handleSimpleModeComplete()} className="w-full py-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-lg font-semibold shadow-sm">
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

        {showPartialConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-modal rounded-3xl p-6 max-w-sm w-full">
              <h3 className="text-xl font-bold text-stone-900 mb-2">
                Has hecho {exercises.length - pendingExercises.length} de {exercises.length} ejercicios
              </h3>
              <p className="text-stone-500 mb-2">Quedan sin marcar:</p>
              <ul className="mb-4 space-y-1">
                {pendingExercises.map(e => (
                  <li key={e.id} className="text-stone-700 text-sm font-medium">• {e.name}</li>
                ))}
              </ul>
              <p className="text-stone-500 text-sm mb-6">Si terminas ahora se guardarán como no hechos.</p>
              <div className="flex gap-3">
                <Button onClick={() => setShowPartialConfirm(false)} variant="outline" className="flex-1 py-4 rounded-xl">Seguir</Button>
                <Button onClick={() => handleSimpleModeComplete(true)} className="flex-1 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600">Terminar</Button>
              </div>
            </motion.div>
          </div>
        )}

        <AnimatePresence>
          {logSheetIndex !== null && exercises[logSheetIndex] && (
            <SetLogSheet
              exercise={exercises[logSheetIndex]}
              initial={setLogs[exercises[logSheetIndex].id] ?? defaultSetsFor(exercises[logSheetIndex])}
              onSave={sets => {
                setSetLogs(prev => ({ ...prev, [exercises[logSheetIndex].id]: sets }));
                setLogSheetIndex(null);
              }}
              onClose={() => setLogSheetIndex(null)}
            />
          )}
        </AnimatePresence>

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
        <LastWeightsButton exercises={exercises} getExerciseHistory={getExerciseHistory} />

        <AnimatePresence>
          {showWarmupModal && <WarmupModal onClose={() => setShowWarmupModal(false)} />}
        </AnimatePresence>

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
          {WARMUP_EXERCISES.map((step, i) => (
            <li key={step.name} className="flex items-center gap-3 glass-card rounded-2xl p-3">
              <div className="relative flex-shrink-0">
                <ExercisePreview name={step.name} muscle={step.targetMuscle} className="w-14 h-14" rounded="rounded-xl" />
                <span className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-lg flex items-center justify-center shadow">
                  {i + 1}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-stone-800 dark:text-stone-100 text-sm font-semibold">{step.name}</p>
                <p className="text-orange-600 dark:text-orange-400 text-xs font-medium">{step.duration}</p>
              </div>
            </li>
          ))}
        </ul>
        <Button onClick={() => setShowGuidedWarmup(false)} className="w-full max-w-sm py-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-lg font-semibold shadow-sm">
          Continuar al entreno
        </Button>
        <button onClick={confirmExit} className="mt-4 text-stone-400 text-sm">Cancelar</button>
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
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-stone-400">{completedSets.size}/{totalSets} series</p>
          <button
            onClick={handleReportDiscomfort}
            className="flex items-center gap-1 text-xs text-stone-400 hover:text-amber-600 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Tengo molestias
          </button>
        </div>
      </div>

      <AnimatePresence>
        {discomfortMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-6 mb-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 flex-1">{discomfortMessage}</p>
            <button onClick={() => setDiscomfortMessage(null)}><X className="w-4 h-4 text-amber-600" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 px-6 flex flex-col">
        <AnimatePresence mode="wait">
          {isResting ? (
            <motion.div key="rest" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex-1 flex flex-col items-center text-center pt-4 pb-32">
              <div className="mb-8 w-full max-w-sm glass-card rounded-2xl p-3 flex items-center gap-3 text-left">
                <ExercisePreview name={currentExercise.name} muscle={currentExercise.targetMuscle} className="w-16 h-16 flex-shrink-0" rounded="rounded-xl" />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                    A continuación
                  </p>
                  <p className="font-semibold text-stone-900 leading-snug">{currentExercise.name}</p>
                  <p className="text-sm text-stone-500 tabular-nums">Serie {currentSetIndex + 1} de {currentExercise.sets} · {formatRepLine(currentExercise)}</p>
                </div>
              </div>
              <p className="text-stone-500 mb-5 flex items-center gap-2"><Clock className="w-4 h-4" /> Descansa</p>
              <div className="relative w-52 h-52 mb-8">
                <svg className="w-52 h-52 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgb(var(--acc-500)/0.15)" strokeWidth="6" />
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
                  <span className="text-stone-400 text-sm mt-1">de {formatRest(restTotal)}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => extendRest(15)} variant="outline" className="rounded-xl px-5 h-11">
                  +15 s
                </Button>
                <Button onClick={skipRest} className="rounded-xl px-6 h-11">Saltar descanso</Button>
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
                    <h2 className="text-xl font-bold text-stone-900 leading-tight mb-2">{currentExercise.name}</h2>
                    <MuscleTags exercise={currentExercise} />
                  </div>
                  <button
                    onClick={() => openExerciseDetail(currentExerciseIndex)}
                    className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 transition-colors ml-3 flex-shrink-0"
                  >
                    <Info className="w-5 h-5 text-stone-500" />
                  </button>
                </div>

                {supersetPartner(exercises, currentExerciseIndex) !== -1 && (
                  <div className="mb-4 px-3 py-2 rounded-xl bg-teal-50 dark:bg-teal-500/15 text-teal-800 dark:text-teal-200 text-sm flex items-center gap-2">
                    <Repeat className="w-4 h-4 flex-shrink-0" />
                    <span>
                      Biserie con <strong>{exercises[supersetPartner(exercises, currentExerciseIndex)].name}</strong>: haz una serie de cada seguida y descansa después.
                    </span>
                  </div>
                )}

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

                <div className="rounded-2xl bg-emerald-50 p-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">Serie {currentSetIndex + 1} de {currentExercise.sets}</p>
                    <p className="text-3xl font-bold text-stone-900 tabular-nums mt-1">{formatRepLine(currentExercise)}</p>
                  </div>
                  <p className="text-xs text-stone-500 text-right">Descanso<br /><span className="font-semibold text-stone-700 tabular-nums">{formatRest(currentExercise.restSeconds)}</span></p>
                </div>
              </Card>

              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-stone-600 text-sm">Peso usado (kg) - opcional</label>
                    {getLastWeight(currentExercise.id) ? (
                      <button
                        type="button"
                        onClick={() => setWeight(String(getLastWeight(currentExercise.id)))}
                        className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full flex items-center gap-1"
                      >
                        <TrendingUp className="w-3 h-3" /> Última vez: {getLastWeight(currentExercise.id)} kg
                      </button>
                    ) : currentExercise.suggestedWeightKg != null && (
                      <button
                        type="button"
                        onClick={() => setWeight(String(currentExercise.suggestedWeightKg))}
                        className="text-xs font-medium text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full flex items-center gap-1"
                      >
                        Sugerido: {currentExercise.suggestedWeightKg} kg{currentExercise.suggestedWeightUnit === 'per-dumbbell' ? '/mancuerna' : ''}
                      </button>
                    )}
                  </div>
                  <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder={String(getLastWeight(currentExercise.id) ?? currentExercise.suggestedWeightKg ?? 'Ej: 20')} className="py-5 px-4 rounded-xl bg-white border-stone-200 text-lg" />
                </div>
                <div>
                  <label className="text-stone-600 text-sm mb-2 block">Repeticiones hechas (si diferente)</label>
                  <Input type="number" value={reps} onChange={(e) => setReps(e.target.value)} placeholder={(currentExercise.reps[currentSetIndex] || currentExercise.reps[0]).toString()} className="py-5 px-4 rounded-xl bg-white border-stone-200 text-lg" />
                </div>
              </div>

              <div className="mt-auto pb-6">
                <Button onClick={handleCompleteSet} className="w-full py-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-lg font-semibold shadow-sm">
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
            <p className="text-stone-500 mb-6">
              {completedSets.size > 0
                ? `Llevas ${completedSets.size} de ${totalSets} series. Puedes terminar aquí y guardar lo que has hecho.`
                : 'Aún no has completado ninguna serie, así que no se guardará nada.'}
            </p>
            <div className="space-y-3">
              {completedSets.size > 0 && (
                <Button onClick={finishGuided} className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600">Terminar y guardar</Button>
              )}
              <div className="flex gap-3">
                <Button onClick={() => setShowExitConfirm(false)} variant="outline" className="flex-1 py-4 rounded-xl">Continuar</Button>
                <Button onClick={confirmExit} className="flex-1 py-4 rounded-xl bg-stone-900 hover:bg-stone-800">{completedSets.size > 0 ? 'Salir sin guardar' : 'Salir'}</Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {showGuidedFinish && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-modal rounded-3xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-stone-900 mb-2">Has hecho {completedSets.size} de {totalSets} series</h3>
            <p className="text-stone-500 mb-2">Quedan sin hacer:</p>
            <ul className="mb-4 space-y-1">
              {guidedPending.map(p => (
                <li key={p.exercise.id} className="text-stone-700 text-sm font-medium">
                  • {p.exercise.name} ({p.left.length} {p.left.length === 1 ? 'serie' : 'series'})
                </li>
              ))}
            </ul>
            <p className="text-stone-500 text-sm mb-6">Si terminas ahora se guardará lo que has hecho.</p>
            <div className="flex gap-3">
              <Button onClick={continuePending} variant="outline" className="flex-1 py-4 rounded-xl">Seguir</Button>
              <Button onClick={finishGuided} className="flex-1 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600">Terminar</Button>
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