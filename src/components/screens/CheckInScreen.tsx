'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Sparkles, Heart, ChevronRight } from 'lucide-react';

export function CheckInScreen() {
  const { user, setScreen } = useApp();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Show button after animation
    const timer = setTimeout(() => setShowButton(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    setScreen('dashboard');
  };

  return (
    <div className="min-h-dvh glass-bg flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-8"
      >
        {/* Celebration Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-200"
        >
          <Heart className="w-12 h-12 text-white" />
        </motion.div>

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <h1 className="text-3xl font-bold text-stone-900">
            ¡Todo listo, {user?.profile.name}!
          </h1>
          <p className="text-stone-600 text-lg leading-relaxed">
            Tu plan de entrenamiento está preparado.
            <br />
            Vamos paso a paso.
          </p>
        </motion.div>

        {/* Supportive message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex items-center justify-center gap-2 text-emerald-700 mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">Recuerda</span>
          </div>
          <p className="text-stone-600 text-sm leading-relaxed">
            No importa si empiezas poco a poco.
            <br />
            Lo que importa es que aparezcas.
          </p>
        </motion.div>

        {/* Continue Button */}
        {showButton && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-4"
          >
            <Button
              onClick={handleContinue}
              className="w-full py-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-lg font-semibold shadow-lg shadow-emerald-200"
            >
              Ver mi plan
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
