'use client';

import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowLeft, Target, Rocket } from 'lucide-react';

export function OnboardingLevelScreen() {
  const { setScreen, setUserLevel } = useApp();

  const handleSelect = (level: 'beginner' | 'advanced') => {
    setUserLevel(level);
    setScreen(level === 'beginner' ? 'onboarding-beginner' : 'onboarding-advanced');
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
          onClick={() => setScreen('welcome')}
          className="p-2 rounded-xl glass-btn shadow-sm hover:shadow-md transition-shadow"
        >
          <ArrowLeft className="w-5 h-5 text-stone-600" />
        </button>
        <div className="flex-1">
          <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
            <div className="h-full w-[10%] bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" />
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full"
      >
        <div className="space-y-3 mb-10">
          <h2 className="text-2xl font-bold text-stone-900">
            ¿Con cuál de estas frases te identificas más ahora mismo?
          </h2>
          <p className="text-stone-500">
            Esto nos ayuda a adaptar tu experiencia
          </p>
        </div>

        <div className="space-y-4">
          {/* Beginner Option */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card
              onClick={() => handleSelect('beginner')}
              className="p-6 cursor-pointer border-2 border-transparent hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-100 transition-all duration-300 glass-card rounded-2xl group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center group-hover:from-emerald-200 group-hover:to-teal-200 transition-colors">
                  <Target className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-stone-900 text-lg mb-1">
                    Quiero empezar o retomar
                  </h3>
                  <p className="text-stone-500 text-sm leading-relaxed">
                    Quiero empezar o retomar el gym y ser constante
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Advanced Option */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card
              onClick={() => handleSelect('advanced')}
              className="p-6 cursor-pointer border-2 border-transparent hover:border-teal-300 hover:shadow-lg hover:shadow-teal-100 transition-all duration-300 glass-card rounded-2xl group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center group-hover:from-teal-200 group-hover:to-cyan-200 transition-colors">
                  <Rocket className="w-6 h-6 text-teal-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-stone-900 text-lg mb-1">
                    Ya entreno con constancia
                  </h3>
                  <p className="text-stone-500 text-sm leading-relaxed">
                    Quiero optimizar mi rendimiento
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
