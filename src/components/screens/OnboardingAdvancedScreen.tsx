'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import type { AdvancedGoal, TrainingStyle, Availability, MuscleGroup, AppTone } from '@/types/user';

export function OnboardingAdvancedScreen() {
  const { setScreen, advancedOnboarding, setAdvancedOnboarding } = useApp();
  const [step, setStep] = useState(1);

  const totalSteps = 6;
  const progress = (step / totalSteps) * 100;

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      setScreen('onboarding-level');
    }
  };

  const handleGoal = (value: AdvancedGoal) => {
    setAdvancedOnboarding({ ...advancedOnboarding, goal: value });
    setStep(2);
  };

  const handleTrainingStyle = (value: TrainingStyle) => {
    setAdvancedOnboarding({ ...advancedOnboarding, trainingStyle: value });
    setStep(3);
  };

  const handleDaysPerWeek = (days: number) => {
    setAdvancedOnboarding({ ...advancedOnboarding, daysPerWeek: days });
    setStep(4);
  };

  const handleAvailability = (value: Availability) => {
    setAdvancedOnboarding({ ...advancedOnboarding, availability: value });
    setStep(5);
  };

  const handleMuscle = (value: MuscleGroup) => {
    setAdvancedOnboarding({ ...advancedOnboarding, priorityMuscle: value });
    setStep(6);
  };

  const handleTone = (value: AppTone) => {
    setAdvancedOnboarding({ ...advancedOnboarding, appTone: value });
    setScreen('profile-setup');
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
              className="h-full bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full"
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
          {/* Step 1: Goal */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-stone-900">
                  ¿En qué quieres centrarte ahora mismo?
                </h2>
              </div>

              <div className="space-y-3">
                {[
                  { id: 'strength' as AdvancedGoal, label: 'Ganar fuerza' },
                  { id: 'physique' as AdvancedGoal, label: 'Mejorar el físico' },
                  { id: 'performance' as AdvancedGoal, label: 'Rendimiento general' },
                  { id: 'maintain' as AdvancedGoal, label: 'Mantenerme y optimizar' },
                ].map(option => (
                  <Card
                    key={option.id}
                    onClick={() => handleGoal(option.id)}
                    className="glass-card p-5 cursor-pointer border-2 border-transparent hover:border-teal-300 transition-all rounded-2xl"
                  >
                    <p className="font-medium text-stone-800">{option.label}</p>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Training Style */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-stone-900">
                  ¿Cómo entrenas actualmente?
                </h2>
              </div>

              <div className="space-y-3">
                {[
                  { id: 'clear-routine' as TrainingStyle, label: 'Tengo una rutina clara' },
                  { id: 'improvise' as TrainingStyle, label: 'Entreno, pero improviso' },
                  { id: 'optimize' as TrainingStyle, label: 'Entreno y quiero optimizar mejor' },
                ].map(option => (
                  <Card
                    key={option.id}
                    onClick={() => handleTrainingStyle(option.id)}
                    className="glass-card p-5 cursor-pointer border-2 border-transparent hover:border-teal-300 transition-all rounded-2xl"
                  >
                    <p className="font-medium text-stone-800">{option.label}</p>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Days per week */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-stone-900">
                  ¿Cuántos días entrenas normalmente?
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[3, 4, 5, 6].map(days => (
                  <Card
                    key={days}
                    onClick={() => handleDaysPerWeek(days)}
                    className="glass-card p-6 cursor-pointer border-2 border-transparent hover:border-teal-300 transition-all rounded-2xl text-center"
                  >
                    <p className="text-3xl font-bold text-teal-600">{days}</p>
                    <p className="text-stone-500 text-sm mt-1">
                      {days === 6 ? 'o más' : 'días'}
                    </p>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 4: Availability */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-stone-900">
                  En una semana normal, tu disponibilidad para entrenar es...
                </h2>
              </div>

              <div className="space-y-3">
                {[
                  { id: 'stable' as Availability, label: 'Bastante estable' },
                  { id: 'variable' as Availability, label: 'Cambia según la semana' },
                  { id: 'depends-work' as Availability, label: 'Depende mucho del trabajo o estudios' },
                ].map(option => (
                  <Card
                    key={option.id}
                    onClick={() => handleAvailability(option.id)}
                    className="glass-card p-5 cursor-pointer border-2 border-transparent hover:border-teal-300 transition-all rounded-2xl"
                  >
                    <p className="font-medium text-stone-800">{option.label}</p>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 5: Priority Muscle */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-stone-900">
                  ¿Hay algún músculo que quieras priorizar ahora mismo?
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'chest' as MuscleGroup, label: 'Pecho' },
                  { id: 'back' as MuscleGroup, label: 'Espalda' },
                  { id: 'shoulders' as MuscleGroup, label: 'Hombros' },
                  { id: 'legs' as MuscleGroup, label: 'Piernas' },
                  { id: 'arms' as MuscleGroup, label: 'Brazos' },
                  { id: 'core' as MuscleGroup, label: 'Core' },
                ].map(option => (
                  <Card
                    key={option.id}
                    onClick={() => handleMuscle(option.id)}
                    className="glass-card p-5 cursor-pointer border-2 border-transparent hover:border-teal-300 transition-all rounded-2xl text-center"
                  >
                    <p className="font-medium text-stone-800">{option.label}</p>
                  </Card>
                ))}
              </div>

              <Card
                onClick={() => handleMuscle('none')}
                className="glass-card p-5 cursor-pointer border-2 border-transparent hover:border-teal-300 transition-all rounded-2xl text-center"
              >
                <p className="font-medium text-stone-500">Ninguno en concreto</p>
              </Card>
            </motion.div>
          )}

          {/* Step 6: App Tone */}
          {step === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-stone-900">
                  ¿Cómo prefieres que te hable la app?
                </h2>
              </div>

              <div className="space-y-3">
                <Card
                  onClick={() => handleTone('demanding')}
                  className="glass-card p-5 cursor-pointer border-2 border-transparent hover:border-teal-300 transition-all rounded-2xl"
                >
                  <p className="font-semibold text-stone-800 mb-1">Directo y exigente</p>
                  <p className="text-stone-500 text-sm">Sin rodeos, al grano</p>
                </Card>
                <Card
                  onClick={() => handleTone('flexible')}
                  className="glass-card p-5 cursor-pointer border-2 border-transparent hover:border-teal-300 transition-all rounded-2xl"
                >
                  <p className="font-semibold text-stone-800 mb-1">Directo pero flexible</p>
                  <p className="text-stone-500 text-sm">Claro, pero con margen</p>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
