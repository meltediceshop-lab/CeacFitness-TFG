'use client';

import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export function WelcomeScreen() {
  const { setScreen } = useApp();

  return (
    <div className="min-h-dvh glass-bg flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full text-center space-y-8"
      >
        {/* Logo / Brand */}
        <div className="space-y-2">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-200">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-stone-800 tracking-tight">
            FitMente
          </h1>
        </div>

        {/* Main Message */}
        <div className="space-y-4 pt-8">
          <h2 className="text-3xl md:text-4xl font-bold text-stone-900 leading-tight">
            Entrena tu cuerpo.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">
              Cuida tu cabeza.
            </span>
          </h2>
          <p className="text-stone-600 text-lg leading-relaxed">
            No todos los días son iguales, y tu entrenamiento tampoco debería serlo.
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="flex justify-center gap-3 py-6">
          <div className="w-2 h-2 rounded-full bg-emerald-300" />
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Button
            onClick={() => setScreen('onboarding-level')}
            className="w-full py-6 text-lg font-medium bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl shadow-lg shadow-emerald-200 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-300"
          >
            Empezamos
          </Button>
        </motion.div>

        {/* Subtle Footer */}
        <p className="text-stone-400 text-sm pt-4">
          Tu bienestar, a tu ritmo
        </p>
      </motion.div>
    </div>
  );
}
