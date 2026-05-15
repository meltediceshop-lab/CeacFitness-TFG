'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Battery, BatteryLow, BatteryMedium, BatteryFull, Zap } from 'lucide-react';
import type { EnergyLevel } from '@/types/user';

interface EnergyOption {
  id: EnergyLevel;
  label: string;
  icon: typeof Battery;
  color: string;
  bgColor: string;
  description: string;
  adjustment: string;
}

const ENERGY_OPTIONS: EnergyOption[] = [
  {
    id: 'very-low',
    label: 'Muy baja',
    icon: BatteryLow,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    description: 'Apenas tengo fuerzas hoy',
    adjustment: 'Reduciremos ejercicios y duración significativamente'
  },
  {
    id: 'low',
    label: 'Baja',
    icon: BatteryLow,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    description: 'No estoy al 100%',
    adjustment: 'Reduciremos un poco el volumen'
  },
  {
    id: 'normal',
    label: 'Normal',
    icon: BatteryMedium,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    description: 'Me siento bien',
    adjustment: 'Mantendremos el plan original'
  },
  {
    id: 'high',
    label: 'Alta',
    icon: BatteryFull,
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
    description: 'Tengo mucha energía hoy',
    adjustment: 'Pequeño aumento de intensidad'
  },
];

export function EnergyCheckScreen() {
  const {
    setScreen,
    setTodayEnergy,
    setWorkoutMode,
    user
  } = useApp();
  const [selectedEnergy, setSelectedEnergy] = useState<EnergyLevel | null>(null);

  // Show explanations for first 3 sessions
  const totalCompleted = user?.totalCompletedSessions || 0;
  const showExplanations = totalCompleted < 3;

  const handleEnergySelect = (energy: EnergyLevel) => {
    setSelectedEnergy(energy);
    setTodayEnergy(energy);

    // Small delay before transitioning
    setTimeout(() => {
      // Go to workout screen with appropriate mode based on energy
      // For very low energy, default to simple mode
      if (energy === 'very-low') {
        setWorkoutMode('simple');
      }
      setScreen('workout');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 flex flex-col px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4 mb-8"
      >
        <button
          onClick={() => setScreen('workout-preview')}
          className="p-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
        >
          <ArrowLeft className="w-5 h-5 text-stone-600" />
        </button>
        <div className="flex-1" />
      </motion.div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="w-16 h-16 mx-auto bg-emerald-100 rounded-2xl flex items-center justify-center"
          >
            <Zap className="w-8 h-8 text-emerald-600" />
          </motion.div>

          {/* Question */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-stone-900">
              ¿Cómo está tu energía hoy?
            </h2>
            <p className="text-stone-500">
              Esto nos ayuda a adaptar la sesión
            </p>
          </div>

          {/* Energy Options */}
          <div className="space-y-3 pt-4">
            {ENERGY_OPTIONS.map((option, index) => {
              const Icon = option.icon;
              const isSelected = selectedEnergy === option.id;

              return (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Card
                    onClick={() => handleEnergySelect(option.id)}
                    className={`p-4 cursor-pointer border-2 transition-all rounded-2xl ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-50 shadow-lg shadow-emerald-200'
                        : 'border-transparent bg-white hover:border-stone-200'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${option.bgColor}`}>
                        <Icon className={`w-6 h-6 ${option.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-stone-900">{option.label}</p>
                        {showExplanations ? (
                          <>
                            <p className="text-stone-500 text-sm">{option.description}</p>
                            <p className="text-stone-400 text-xs mt-1 italic">
                              {option.adjustment}
                            </p>
                          </>
                        ) : (
                          <p className="text-stone-500 text-sm">{option.description}</p>
                        )}
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"
                        >
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </motion.div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Helper text for new users */}
          {showExplanations && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-stone-400 text-sm text-center pt-4"
            >
              No hay respuestas incorrectas. Escucha a tu cuerpo.
            </motion.p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
