'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sun, Sunset, Moon, Clock, Calendar, CalendarDays, Check, ChevronRight, ChevronDown } from 'lucide-react';
import type { BeginnerGoal, GymComfort, DayOfWeek, TimeOfDay, TrainingDay, WorkoutDuration, StartWeekPreference } from '@/types/user';

const ALL_DAYS: { id: DayOfWeek; label: string; short: string }[] = [
  { id: 'monday', label: 'Lunes', short: 'L' },
  { id: 'tuesday', label: 'Martes', short: 'M' },
  { id: 'wednesday', label: 'Miércoles', short: 'X' },
  { id: 'thursday', label: 'Jueves', short: 'J' },
  { id: 'friday', label: 'Viernes', short: 'V' },
  { id: 'saturday', label: 'Sábado', short: 'S' },
  { id: 'sunday', label: 'Domingo', short: 'D' },
];

const TIMES: { id: TimeOfDay; label: string; icon: typeof Sun }[] = [
  { id: 'morning', label: 'Mañana', icon: Sun },
  { id: 'afternoon', label: 'Tarde', icon: Sunset },
  { id: 'evening', label: 'Noche', icon: Moon },
];

const DURATION_OPTIONS: { id: WorkoutDuration; label: string; description: string }[] = [
  { id: '30min', label: '30 minutos', description: 'Sesiones cortas y efectivas' },
  { id: '45min', label: '45 minutos', description: 'Un buen equilibrio' },
  { id: '1hour', label: '1 hora', description: 'Sesiones más completas' },
  { id: 'depends', label: 'Depende del día', description: 'Lo ajustamos según tu tiempo' },
];

// Helper function to get remaining days of current week
function getRemainingDaysOfWeek(): DayOfWeek[] {
  const dayIndexMap: Record<number, DayOfWeek> = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
  };

  const today = new Date();
  const currentDayIndex = today.getDay();
  const orderedDays: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const todayDay = dayIndexMap[currentDayIndex];
  const todayOrderedIndex = orderedDays.indexOf(todayDay);

  return orderedDays.slice(todayOrderedIndex);
}

// Get full week (for "start next week" option)
function getFullWeek(): DayOfWeek[] {
  return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
}

// Check if today is weekend (Saturday or Sunday)
function isWeekend(): boolean {
  const today = new Date();
  const day = today.getDay();
  return day === 0 || day === 6;
}

// Get week dates for display
function getWeekDates(isNextWeek: boolean): { start: Date; end: Date; weekLabel: string } {
  const today = new Date();
  const currentDay = today.getDay();

  // Get Monday of current week
  const monday = new Date(today);
  monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));

  if (isNextWeek) {
    // Add 7 days to get next week's Monday
    monday.setDate(monday.getDate() + 7);
  }

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const formatDate = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}`;
  const weekLabel = isNextWeek ? 'Próxima semana' : 'Esta semana';

  return { start: monday, end: sunday, weekLabel };
}

// Get specific date for a day of week
function getDateForDay(day: DayOfWeek, isNextWeek: boolean): Date {
  const dayToIndex: Record<DayOfWeek, number> = {
    'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4,
    'friday': 5, 'saturday': 6, 'sunday': 0
  };

  const today = new Date();
  const currentDay = today.getDay();
  const targetDay = dayToIndex[day];

  // Get Monday of current week
  const monday = new Date(today);
  monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));

  if (isNextWeek) {
    monday.setDate(monday.getDate() + 7);
  }

  const result = new Date(monday);
  const daysToAdd = targetDay === 0 ? 6 : targetDay - 1;
  result.setDate(monday.getDate() + daysToAdd);

  return result;
}

export function OnboardingBeginnerScreen() {
  const { setScreen, beginnerOnboarding, setBeginnerOnboarding } = useApp();
  const [step, setStep] = useState(1);
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);
  const [dayTimes, setDayTimes] = useState<Record<DayOfWeek, TimeOfDay>>({} as Record<DayOfWeek, TimeOfDay>);
  const [startWeekChoice, setStartWeekChoice] = useState<StartWeekPreference | null>(null);
  const [showCalendarPreview, setShowCalendarPreview] = useState(false);
  const [expandedDayForTime, setExpandedDayForTime] = useState<DayOfWeek | null>(null);

  const isWeekendDay = useMemo(() => isWeekend(), []);

  // Determine which days to show based on the start week choice
  const availableDays = useMemo(() => {
    if (isWeekendDay && startWeekChoice === 'next-week') {
      return ALL_DAYS;
    } else {
      const remainingDays = getRemainingDaysOfWeek();
      return ALL_DAYS.filter(day => remainingDays.includes(day.id));
    }
  }, [isWeekendDay, startWeekChoice]);

  // Get week info for display
  const weekInfo = useMemo(() => {
    const isNextWeek = isWeekendDay && startWeekChoice === 'next-week';
    return getWeekDates(isNextWeek);
  }, [isWeekendDay, startWeekChoice]);

  // Check if all selected days have a time assigned
  const allDaysHaveTime = useMemo(() => {
    return selectedDays.length > 0 && selectedDays.every(day => dayTimes[day] !== undefined);
  }, [selectedDays, dayTimes]);

  /*
   * STEP FLOW:
   *
   * For Monday-Friday (7 steps with confirmation):
   * 1. Experience level
   * 2. Goal
   * 3. Days per week
   * 4. Select training days
   * 5. Workout duration
   * 6. Gym comfort
   * 7. Confirmation
   *
   * For Saturday-Sunday (8 steps with confirmation):
   * 1. Experience level
   * 2. Goal
   * 3. Days per week
   * 4. Start this week or next week?
   * 5. Select training days
   * 6. Workout duration
   * 7. Gym comfort
   * 8. Confirmation
   */

  const totalSteps = isWeekendDay ? 8 : 7;
  const progress = (step / totalSteps) * 100;

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      if (isWeekendDay) {
        if (step === 5) {
          setSelectedDays([]);
          setDayTimes({} as Record<DayOfWeek, TimeOfDay>);
        }
      } else {
        if (step === 4) {
          setSelectedDays([]);
          setDayTimes({} as Record<DayOfWeek, TimeOfDay>);
        }
      }
    } else {
      setScreen('onboarding-level');
    }
  };

  const handleExperience = (value: 'never' | 'inconsistent') => {
    setBeginnerOnboarding({ ...beginnerOnboarding, experienceLevel: value });
    setStep(2);
  };

  const handleGoal = (value: BeginnerGoal) => {
    setBeginnerOnboarding({ ...beginnerOnboarding, goal: value });
    setStep(3);
  };

  const handleDaysPerWeek = (days: number) => {
    setBeginnerOnboarding({ ...beginnerOnboarding, daysPerWeek: days });
    if (isWeekendDay) {
      setStep(4);
    } else {
      setStep(4);
    }
  };

  const handleStartWeekChoice = (choice: StartWeekPreference) => {
    setStartWeekChoice(choice);
    setBeginnerOnboarding({ ...beginnerOnboarding, startWeekPreference: choice });
    setSelectedDays([]);
    setDayTimes({} as Record<DayOfWeek, TimeOfDay>);
    setStep(5);
  };

  const handleDayToggle = (day: DayOfWeek) => {
    const maxDays = beginnerOnboarding.daysPerWeek || 3;
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
      // Remove the time for this day
      const newDayTimes = { ...dayTimes };
      delete newDayTimes[day];
      setDayTimes(newDayTimes);
      // Close expanded if it was this day
      if (expandedDayForTime === day) {
        setExpandedDayForTime(null);
      }
    } else if (selectedDays.length < maxDays) {
      setSelectedDays([...selectedDays, day]);
      // Auto-expand this day for time selection
      setExpandedDayForTime(day);
    }
  };

  const handleDayTimeSelect = (day: DayOfWeek, time: TimeOfDay) => {
    setDayTimes(prev => ({ ...prev, [day]: time }));
    // Find next day without time and expand it, or close if all have times
    const daysWithoutTime = selectedDays.filter(d => d !== day && !dayTimes[d]);
    if (daysWithoutTime.length > 0) {
      setExpandedDayForTime(daysWithoutTime[0]);
    } else {
      setExpandedDayForTime(null);
    }
  };

  const handleConfirmDays = () => {
    const trainingDays: TrainingDay[] = selectedDays.map(day => ({
      day,
      timeOfDay: dayTimes[day] || 'afternoon',
    }));
    setBeginnerOnboarding({
      ...beginnerOnboarding,
      trainingDays,
      daysPerWeek: selectedDays.length
    });
    if (isWeekendDay) {
      setStep(6);
    } else {
      setStep(5);
    }
  };

  const handleWorkoutDuration = (duration: WorkoutDuration) => {
    setBeginnerOnboarding({ ...beginnerOnboarding, workoutDuration: duration });
    if (isWeekendDay) {
      setStep(7);
    } else {
      setStep(6);
    }
  };

  const handleGymComfort = (value: GymComfort) => {
    setBeginnerOnboarding({ ...beginnerOnboarding, gymComfort: value });
    // Go to confirmation step
    if (isWeekendDay) {
      setStep(8);
    } else {
      setStep(7);
    }
  };

  const handleConfirmPlan = () => {
    setScreen('profile-setup');
  };

  const getStepContent = (): string => {
    if (isWeekendDay) {
      switch (step) {
        case 1: return 'experience';
        case 2: return 'goal';
        case 3: return 'days-per-week';
        case 4: return 'week-choice';
        case 5: return 'day-selection';
        case 6: return 'duration';
        case 7: return 'gym-comfort';
        case 8: return 'confirmation';
        default: return 'experience';
      }
    } else {
      switch (step) {
        case 1: return 'experience';
        case 2: return 'goal';
        case 3: return 'days-per-week';
        case 4: return 'day-selection';
        case 5: return 'duration';
        case 6: return 'gym-comfort';
        case 7: return 'confirmation';
        default: return 'experience';
      }
    }
  };

  const currentContent = getStepContent();

  const getDaySelectionQuestion = (): string => {
    if (isWeekendDay && startWeekChoice === 'next-week') {
      return '¿Qué días te vendrían bien para entrenar la próxima semana?';
    }
    return 'Mirando lo que queda de esta semana, ¿qué días te vendrían bien para entrenar?';
  };

  const getDaySelectionMicrocopy = (): string => {
    if (isWeekendDay && startWeekChoice === 'next-week') {
      return 'Elige los días que mejor te encajen. Siempre puedes cambiarlos después.';
    }
    return 'Si algún día no te va bien después, podemos mover o quitar la sesión. Sin problema.';
  };

  const getTimeLabel = (time: TimeOfDay): string => {
    switch (time) {
      case 'morning': return 'Mañana';
      case 'afternoon': return 'Tarde';
      case 'evening': return 'Noche';
      default: return 'Tarde';
    }
  };

  const getDurationLabel = (duration: WorkoutDuration): string => {
    switch (duration) {
      case '30min': return '30 minutos';
      case '45min': return '45 minutos';
      case '1hour': return '1 hora';
      case 'depends': return 'Variable';
      default: return '45 minutos';
    }
  };

  // Calendar mini view component
  const CalendarMiniView = () => {
    const isNextWeek = isWeekendDay && startWeekChoice === 'next-week';
    const orderedDays: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    return (
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-stone-600">{weekInfo.weekLabel}</span>
          <span className="text-xs text-stone-400">
            {weekInfo.start.getDate()}/{weekInfo.start.getMonth() + 1} - {weekInfo.end.getDate()}/{weekInfo.end.getMonth() + 1}
          </span>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {orderedDays.map(day => {
            const dayInfo = ALL_DAYS.find(d => d.id === day)!;
            const isSelected = selectedDays.includes(day);
            const date = getDateForDay(day, isNextWeek);
            const isAvailable = availableDays.some(d => d.id === day);

            return (
              <div
                key={day}
                className={`text-center py-2 rounded-lg ${
                  isSelected
                    ? 'bg-emerald-500 text-white'
                    : isAvailable
                    ? 'bg-stone-100 text-stone-600'
                    : 'bg-stone-50 text-stone-300'
                }`}
              >
                <p className="text-xs font-medium">{dayInfo.short}</p>
                <p className={`text-sm ${isSelected ? 'font-bold' : ''}`}>{date.getDate()}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-dvh glass-bg flex flex-col px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4 mb-8"
      >
        <button
          onClick={handleBack}
          className="p-2 rounded-xl glass-btn shadow-sm hover:shadow-md transition-shadow"
        >
          <ArrowLeft className="w-5 h-5 text-stone-600" />
        </button>
        <div className="flex-1">
          <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
        <span className="text-sm text-stone-400 font-medium">{step}/{totalSteps}</span>
      </motion.div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          {/* Step: Experience Level */}
          {currentContent === 'experience' && (
            <motion.div
              key="experience"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-stone-900">
                  Respecto al gym, ahora mismo...
                </h2>
              </div>

              <div className="space-y-3">
                <Card
                  onClick={() => handleExperience('never')}
                  className="glass-card p-5 cursor-pointer border-2 border-transparent hover:border-emerald-300 transition-all rounded-2xl"
                >
                  <p className="font-medium text-stone-800">
                    Nunca he entrenado y quiero empezar desde cero
                  </p>
                </Card>
                <Card
                  onClick={() => handleExperience('inconsistent')}
                  className="glass-card p-5 cursor-pointer border-2 border-transparent hover:border-emerald-300 transition-all rounded-2xl"
                >
                  <p className="font-medium text-stone-800">
                    He entrenado otras veces, pero nunca he sido constante
                  </p>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Step: Goal */}
          {currentContent === 'goal' && (
            <motion.div
              key="goal"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-stone-900">
                  ¿Qué te gustaría conseguir con el gym ahora mismo?
                </h2>
              </div>

              <div className="space-y-3">
                {[
                  { id: 'energy' as BeginnerGoal, label: 'Sentirme con más energía' },
                  { id: 'feel-better' as BeginnerGoal, label: 'Sentirme mejor conmigo mismo' },
                  { id: 'strength' as BeginnerGoal, label: 'Ganar fuerza poco a poco' },
                  { id: 'routine' as BeginnerGoal, label: 'Volver a tener una rutina' },
                  { id: 'lose-weight' as BeginnerGoal, label: 'Perder peso', sublabel: 'Bajar el peso de la báscula' },
                  { id: 'lose-fat' as BeginnerGoal, label: 'Perder grasa sin perder músculo', sublabel: 'Definir manteniendo lo ganado' },
                  { id: 'recomp' as BeginnerGoal, label: 'Recomposición corporal', sublabel: 'Perder grasa y ganar músculo a la vez' },
                ].map(option => (
                  <Card
                    key={option.id}
                    onClick={() => handleGoal(option.id)}
                    className="glass-card p-5 cursor-pointer border-2 border-transparent hover:border-emerald-300 transition-all rounded-2xl"
                  >
                    <p className="font-medium text-stone-800">{option.label}</p>
                    {'sublabel' in option && option.sublabel && (
                      <p className="text-stone-400 text-sm mt-0.5">{option.sublabel}</p>
                    )}
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step: Days per week */}
          {currentContent === 'days-per-week' && (
            <motion.div
              key="days-per-week"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                  <p className="text-emerald-800 text-sm leading-relaxed">
                    Para crear hábito suele funcionar bien empezar con pocos días.
                    Siempre podemos ajustar después según cómo te vaya.
                  </p>
                </div>

                <h2 className="text-2xl font-bold text-stone-900">
                  ¿Con cuántos días te sentirías cómodo empezar?
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[2, 3, 4].map(days => (
                  <Card
                    key={days}
                    onClick={() => handleDaysPerWeek(days)}
                    className="glass-card p-6 cursor-pointer border-2 border-transparent hover:border-emerald-300 transition-all rounded-2xl text-center"
                  >
                    <p className="text-3xl font-bold text-emerald-600">{days}</p>
                    <p className="text-stone-500 text-sm mt-1">días</p>
                  </Card>
                ))}
              </div>

              <p className="text-stone-400 text-sm text-center">
                Puedes cambiarlo en cualquier momento
              </p>
            </motion.div>
          )}

          {/* Step: Week Choice (ONLY for weekends) */}
          {currentContent === 'week-choice' && (
            <motion.div
              key="week-choice"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-stone-900">
                  ¿Quieres empezar esta semana o la próxima?
                </h2>
                <p className="text-stone-500">
                  Así puedes empezar a tu propio ritmo
                </p>
              </div>

              <div className="space-y-3">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    onClick={() => handleStartWeekChoice('this-week')}
                    className="glass-card p-5 cursor-pointer border-2 border-transparent hover:border-emerald-300 transition-all rounded-2xl group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-stone-800">Empezar esta semana</p>
                        <p className="text-stone-500 text-sm">Aprovecho lo que queda</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </Card>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    onClick={() => handleStartWeekChoice('next-week')}
                    className="glass-card p-5 cursor-pointer border-2 border-transparent hover:border-emerald-300 transition-all rounded-2xl group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-stone-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                        <CalendarDays className="w-6 h-6 text-stone-600 group-hover:text-emerald-600 transition-colors" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-stone-800">Empezar la próxima semana</p>
                        <p className="text-stone-500 text-sm">Prefiero empezar con la semana completa</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Step: Day Selection - UPDATED with individual time selection */}
          {currentContent === 'day-selection' && (
            <motion.div
              key="day-selection"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Week indicator badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                  <Calendar className="w-4 h-4" />
                  <span>{weekInfo.weekLabel}</span>
                  <span className="text-emerald-500">
                    ({weekInfo.start.getDate()}/{weekInfo.start.getMonth() + 1} - {weekInfo.end.getDate()}/{weekInfo.end.getMonth() + 1})
                  </span>
                </div>
              </motion.div>

              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-stone-900">
                  {getDaySelectionQuestion()}
                </h2>
                <p className="text-stone-500 text-sm">
                  {getDaySelectionMicrocopy()}
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-stone-600 text-sm font-medium">
                  Selecciona hasta {beginnerOnboarding.daysPerWeek} días
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableDays.map((day, index) => {
                    const isNextWeek = isWeekendDay && startWeekChoice === 'next-week';
                    const date = getDateForDay(day.id, isNextWeek);
                    const isSelected = selectedDays.includes(day.id);
                    const hasTime = dayTimes[day.id] !== undefined;

                    return (
                      <motion.button
                        key={day.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleDayToggle(day.id)}
                        className={`px-4 py-3 rounded-xl font-medium transition-all relative ${
                          isSelected
                            ? hasTime
                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                              : 'bg-emerald-400 text-white shadow-md shadow-emerald-200 ring-2 ring-emerald-300 ring-offset-2'
                            : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                        }`}
                      >
                        <span>{day.label}</span>
                        <span className="text-xs ml-1 opacity-70">{date.getDate()}</span>
                        {isSelected && hasTime && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <Check className="w-3 h-3 text-emerald-600" />
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Calendar Preview Toggle */}
              {selectedDays.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <button
                    onClick={() => setShowCalendarPreview(!showCalendarPreview)}
                    className="w-full py-3 text-emerald-600 text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <CalendarDays className="w-4 h-4" />
                    {showCalendarPreview ? 'Ocultar calendario' : 'Ver en calendario'}
                  </button>

                  <AnimatePresence>
                    {showCalendarPreview && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <CalendarMiniView />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* Individual time selection for each day */}
              {selectedDays.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 pt-4"
                >
                  <div className="space-y-1">
                    <p className="text-stone-700 font-medium">
                      ¿A qué hora entrenas cada día?
                    </p>
                    <p className="text-stone-400 text-sm">
                      Te enviaremos un recordatorio antes de cada sesión
                    </p>
                  </div>

                  <div className="space-y-2">
                    {selectedDays.map((day, index) => {
                      const dayInfo = ALL_DAYS.find(d => d.id === day)!;
                      const isNextWeek = isWeekendDay && startWeekChoice === 'next-week';
                      const date = getDateForDay(day, isNextWeek);
                      const selectedTime = dayTimes[day];
                      const isExpanded = expandedDayForTime === day;

                      return (
                        <motion.div
                          key={day}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="glass-card rounded-xl overflow-hidden"
                        >
                          {/* Day header */}
                          <button
                            onClick={() => setExpandedDayForTime(isExpanded ? null : day)}
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-stone-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                selectedTime ? 'bg-emerald-100' : 'bg-stone-100'
                              }`}>
                                {selectedTime ? (
                                  TIMES.find(t => t.id === selectedTime)?.icon &&
                                  (() => {
                                    const Icon = TIMES.find(t => t.id === selectedTime)!.icon;
                                    return <Icon className="w-5 h-5 text-emerald-600" />;
                                  })()
                                ) : (
                                  <Clock className="w-5 h-5 text-stone-400" />
                                )}
                              </div>
                              <div className="text-left">
                                <p className="font-medium text-stone-800">
                                  {dayInfo.label} <span className="text-stone-400 font-normal">{date.getDate()}/{date.getMonth() + 1}</span>
                                </p>
                                {selectedTime && (
                                  <p className="text-sm text-emerald-600">
                                    {TIMES.find(t => t.id === selectedTime)?.label}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {selectedTime && (
                                <Check className="w-5 h-5 text-emerald-500" />
                              )}
                              <ChevronDown className={`w-5 h-5 text-stone-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                          </button>

                          {/* Time options */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 pt-1">
                                  <div className="flex gap-2">
                                    {TIMES.map(time => {
                                      const Icon = time.icon;
                                      const isSelected = selectedTime === time.id;
                                      return (
                                        <button
                                          key={time.id}
                                          onClick={() => handleDayTimeSelect(day, time.id)}
                                          className={`flex-1 py-3 px-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                                            isSelected
                                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                          }`}
                                        >
                                          <Icon className="w-4 h-4" />
                                          {time.label}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Progress indicator */}
                  {selectedDays.length > 0 && !allDaysHaveTime && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-amber-600 text-sm text-center flex items-center justify-center gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      Elige la hora para {selectedDays.filter(d => !dayTimes[d]).length} día{selectedDays.filter(d => !dayTimes[d]).length > 1 ? 's' : ''} más
                    </motion.p>
                  )}
                </motion.div>
              )}

              <Button
                onClick={handleConfirmDays}
                disabled={selectedDays.length === 0 || !allDaysHaveTime}
                className="w-full py-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                Continuar
              </Button>
            </motion.div>
          )}

          {/* Step: Workout Duration */}
          {currentContent === 'duration' && (
            <motion.div
              key="duration"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-stone-900">
                  ¿Cuánto tiempo te gustaría dedicar a cada entreno?
                </h2>
                <p className="text-stone-500">
                  Adaptaremos las sesiones a tu tiempo disponible
                </p>
              </div>

              <div className="space-y-3">
                {DURATION_OPTIONS.map(option => (
                  <Card
                    key={option.id}
                    onClick={() => handleWorkoutDuration(option.id)}
                    className="glass-card p-5 cursor-pointer border-2 border-transparent hover:border-emerald-300 transition-all rounded-2xl group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-stone-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                        <Clock className="w-6 h-6 text-stone-600 group-hover:text-emerald-600 transition-colors" />
                      </div>
                      <div>
                        <p className="font-semibold text-stone-800">{option.label}</p>
                        <p className="text-stone-500 text-sm">{option.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step: Gym Comfort */}
          {currentContent === 'gym-comfort' && (
            <motion.div
              key="gym-comfort"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-stone-900">
                  Cuando vas al gym...
                </h2>
                <p className="text-stone-500">
                  Esto nos ayuda a adaptar cómo te guiamos
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { id: 'shy' as GymComfort, label: 'A veces me da un poco de vergüenza' },
                  { id: 'insecure' as GymComfort, label: 'Me siento inseguro cuando no conozco un ejercicio' },
                  { id: 'depends' as GymComfort, label: 'Depende del día' },
                  { id: 'comfortable' as GymComfort, label: 'Me siento bastante cómodo' },
                ].map(option => (
                  <Card
                    key={option.id}
                    onClick={() => handleGymComfort(option.id)}
                    className="glass-card p-5 cursor-pointer border-2 border-transparent hover:border-emerald-300 transition-all rounded-2xl"
                  >
                    <p className="font-medium text-stone-800">{option.label}</p>
                  </Card>
                ))}
              </div>

              <p className="text-stone-400 text-sm text-center pt-2">
                No hay respuestas incorrectas. Todo es válido.
              </p>
            </motion.div>
          )}

          {/* Step: Final Confirmation */}
          {currentContent === 'confirmation' && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-16 h-16 mx-auto bg-emerald-100 rounded-2xl flex items-center justify-center mb-4"
                >
                  <Check className="w-8 h-8 text-emerald-600" />
                </motion.div>
                <h2 className="text-2xl font-bold text-stone-900">
                  Tu plan está listo
                </h2>
                <p className="text-stone-500">
                  Revisa los detalles antes de continuar
                </p>
              </div>

              {/* Plan Summary */}
              <div className="space-y-4">
                {/* Week info */}
                <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="font-medium text-emerald-800">{weekInfo.weekLabel}</p>
                      <p className="text-emerald-600 text-sm">
                        Del {weekInfo.start.getDate()}/{weekInfo.start.getMonth() + 1} al {weekInfo.end.getDate()}/{weekInfo.end.getMonth() + 1}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Calendar View */}
                <CalendarMiniView />

                {/* Training Details */}
                <Card className="glass-card p-4 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500">Días de entreno</span>
                    <span className="font-medium text-stone-900">{selectedDays.length} días</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-stone-500">Horario preferido</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedDays.map(day => (
                        <span key={day} className="font-medium text-stone-900 bg-stone-100 rounded px-2 py-1 text-xs">
                          {ALL_DAYS.find(d => d.id === day)?.label}: {getTimeLabel(dayTimes[day] || 'afternoon')}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500">Duración por sesión</span>
                    <span className="font-medium text-stone-900">{getDurationLabel(beginnerOnboarding.workoutDuration || '45min')}</span>
                  </div>
                </Card>

                {/* Selected Days List */}
                <div className="flex flex-wrap gap-2">
                  {selectedDays.map(day => {
                    const dayInfo = ALL_DAYS.find(d => d.id === day)!;
                    const isNextWeek = isWeekendDay && startWeekChoice === 'next-week';
                    const date = getDateForDay(day, isNextWeek);
                    return (
                      <div
                        key={day}
                        className="px-3 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-sm font-medium"
                      >
                        {dayInfo.label} {date.getDate()}/{date.getMonth() + 1}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <Button
                  onClick={handleConfirmPlan}
                  className="w-full py-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-lg font-semibold shadow-lg shadow-emerald-200"
                >
                  Confirmar y continuar
                </Button>
                <p className="text-stone-400 text-sm text-center">
                  Podrás cambiar estos ajustes en cualquier momento
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
