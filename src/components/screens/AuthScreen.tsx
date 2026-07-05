'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';

export function AuthScreen() {
  const { login, register } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        await register(email, password);
      } else {
        await login(email, password);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ha ocurrido un error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh glass-bg flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-stone-800">FitMente</h1>
        </div>

        {/* Card */}
        <div className="glass-card rounded-3xl p-8 space-y-6">
          {/* Toggle */}
          <div className="flex rounded-2xl glass-card p-1">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${
                mode === 'login' ? 'glass-btn text-stone-900 shadow-sm' : 'text-stone-500'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${
                mode === 'register' ? 'glass-btn text-stone-900 shadow-sm' : 'text-stone-500'
              }`}
            >
              Crear cuenta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-stone-700 text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="glass-input rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-stone-700 text-sm font-medium">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="glass-input rounded-xl"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-6 text-base font-medium bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl shadow-lg shadow-emerald-200 transition-all duration-300 disabled:opacity-60"
            >
              {loading
                ? 'Un momento...'
                : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
            </Button>
          </form>

          {mode === 'register' && (
            <p className="text-stone-400 text-xs text-center leading-relaxed">
              Al crear una cuenta aceptas guardar tus datos de entrenamiento en nuestros servidores.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
