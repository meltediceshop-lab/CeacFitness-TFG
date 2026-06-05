'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import type { MeasurementReminderFrequency } from '@/types/user';
import {
  ArrowLeft,
  Settings,
  Calendar,
  Clock,
  ChevronRight,
  LogOut,
  MessageCircle,
  Apple,
  Home,
  Bell,
} from 'lucide-react';

// ── Silueta corporal SVG ──────────────────────────────────────────
function BodySilhouette({
  gender,
  activePoint,
  onPointClick,
}: {
  gender: 'male' | 'female';
  activePoint: string | null;
  onPointClick: (point: string) => void;
}) {
  const points = [
    { id: 'chest', label: 'Pecho', cx: 60, cy: 88 },
    { id: 'waist', label: 'Cintura', cx: 60, cy: 122 },
    { id: 'hips', label: 'Cadera', cx: 60, cy: 152 },
    { id: 'arms', label: 'Brazo', cx: 28, cy: 100 },
  ];

  // Torso path: male = more rectangular, female = hourglass
  const torsoPath = gender === 'female'
    ? 'M38,62 C30,70 26,85 28,100 L26,148 C26,152 30,156 38,158 L48,160 L52,175 L68,175 L72,160 L82,158 C90,156 94,152 94,148 L92,100 C94,85 90,70 82,62 C74,56 66,54 60,54 C54,54 46,56 38,62 Z'
    : 'M36,62 C30,68 28,82 28,98 L26,148 C26,152 30,156 38,158 L48,160 L52,175 L68,175 L72,160 L82,158 C90,156 94,152 94,148 L92,98 C92,82 90,68 84,62 C76,56 66,54 60,54 C54,54 44,56 36,62 Z';

  return (
    <svg viewBox="0 0 120 200" className="w-full max-w-[160px] mx-auto">
      {/* Head */}
      <ellipse cx="60" cy="28" rx="16" ry="18" fill="#e7e5e4" stroke="#d6d3d1" strokeWidth="1.5" />
      {/* Neck */}
      <rect x="54" y="44" width="12" height="12" rx="3" fill="#e7e5e4" stroke="#d6d3d1" strokeWidth="1.5" />
      {/* Body */}
      <path d={torsoPath} fill="#e7e5e4" stroke="#d6d3d1" strokeWidth="1.5" />
      {/* Left arm */}
      <path d="M28,62 C22,70 20,85 20,100 L20,130 C20,134 24,136 28,134 L32,132 L34,100 L36,64 Z"
        fill="#e7e5e4" stroke="#d6d3d1" strokeWidth="1.5" />
      {/* Right arm */}
      <path d="M92,62 C98,70 100,85 100,100 L100,130 C100,134 96,136 92,134 L88,132 L86,100 L84,64 Z"
        fill="#e7e5e4" stroke="#d6d3d1" strokeWidth="1.5" />
      {/* Left leg */}
      <path d="M48,172 L44,198 L56,198 L60,175 Z" fill="#e7e5e4" stroke="#d6d3d1" strokeWidth="1.5" />
      {/* Right leg */}
      <path d="M72,172 L76,198 L64,198 L60,175 Z" fill="#e7e5e4" stroke="#d6d3d1" strokeWidth="1.5" />

      {/* Measurement points */}
      {points.map(p => (
        <g key={p.id} onClick={() => onPointClick(p.id)} className="cursor-pointer">
          <circle
            cx={p.cx} cy={p.cy} r="7"
            fill={activePoint === p.id ? '#10b981' : '#fff'}
            stroke={activePoint === p.id ? '#059669' : '#10b981'}
            strokeWidth="2"
          />
          <circle cx={p.cx} cy={p.cy} r="3"
            fill={activePoint === p.id ? '#fff' : '#10b981'}
          />
          {/* Label line + text */}
          <line
            x1={p.cx + (p.cx < 60 ? -8 : p.cx === 60 ? 8 : 8)} y1={p.cy}
            x2={p.cx + (p.cx < 60 ? -28 : p.cx === 60 ? 28 : 28)} y2={p.cy}
            stroke="#10b981" strokeWidth="1" strokeDasharray="2,2"
          />
          <text
            x={p.cx + (p.cx < 60 ? -30 : 30)}
            y={p.cy + 4}
            fontSize="7"
            textAnchor={p.cx < 60 ? 'end' : 'start'}
            fill={activePoint === p.id ? '#059669' : '#78716c'}
            fontWeight={activePoint === p.id ? 'bold' : 'normal'}
          >
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── Etiqueta de frecuencia ────────────────────────────────────────
function frequencyLabel(f: MeasurementReminderFrequency): string {
  const map: Record<MeasurementReminderFrequency, string> = {
    weekly: 'Cada semana',
    '2weeks': 'Cada 2 semanas',
    '3weeks': 'Cada 3 semanas',
    monthly: 'Cada mes',
    '3sessions': 'Cada 3 sesiones',
    '5sessions': 'Cada 5 sesiones',
  };
  return map[f];
}

// ── Componente principal ──────────────────────────────────────────
export function ProfileScreen() {
  const { user, setUser, setScreen, logout } = useApp();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);

  if (!user) return null;

  const currentFrequency: MeasurementReminderFrequency =
    user.profile.reminderFrequency ?? 'weekly';

  const handleFrequencyChange = (f: MeasurementReminderFrequency) => {
    setUser({ ...user, profile: { ...user.profile, reminderFrequency: f } });
    setShowReminderPicker(false);
  };

  const gender = user.profile.biologicalProfile === 'female' ? 'female' : 'male';

  const frequencies: MeasurementReminderFrequency[] = [
    'weekly', '2weeks', '3weeks', 'monthly', '3sessions', '5sessions',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 flex flex-col pb-24">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="px-6 pt-8 pb-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setScreen('dashboard')} className="p-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
            <ArrowLeft className="w-5 h-5 text-stone-600" />
          </button>
          <h1 className="text-2xl font-bold text-stone-900">Tu perfil</h1>
        </div>

        <Card className="p-5 bg-white border-0 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-2xl flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{user.profile.name?.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900">{user.profile.name}</h2>
              <p className="text-stone-500 text-sm">Semana {user.currentWeek}</p>
            </div>
          </div>
          <p className="text-stone-400 text-sm mt-4 italic">"Este es tu espacio. El progreso sucede paso a paso."</p>
        </Card>
      </motion.div>

      <div className="flex-1 px-6 space-y-4">

        {/* ── NUTRICIÓN ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card onClick={() => setScreen('nutrition')} className="p-5 bg-white border-0 rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Apple className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900">Nutrición</h3>
                  <p className="text-stone-500 text-sm">Hidratación y comidas</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-300" />
            </div>
          </Card>
        </motion.div>

        {/* ── AJUSTES ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="p-5 bg-white border-0 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-stone-600" />
              </div>
              <h3 className="font-semibold text-stone-900">Ajustes</h3>
            </div>

            <div className="space-y-1">
              <button onClick={() => setScreen('chat')} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-stone-400" />
                  <span className="text-stone-700 text-sm">Días de entrenamiento</span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-300" />
              </button>

              <button onClick={() => setScreen('chat')} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-stone-400" />
                  <span className="text-stone-700 text-sm">Duración de sesiones</span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-300" />
              </button>

              {/* Recordatorio de métricas */}
              <button onClick={() => setShowReminderPicker(!showReminderPicker)} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-stone-400" />
                  <div className="text-left">
                    <p className="text-stone-700 text-sm">Revisión de métricas</p>
                    <p className="text-stone-400 text-xs">{frequencyLabel(currentFrequency)}</p>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 text-stone-300 transition-transform ${showReminderPicker ? 'rotate-90' : ''}`} />
              </button>

              <AnimatePresence>
                {showReminderPicker && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-8 mt-1 mb-2 space-y-1">
                      {frequencies.map(f => (
                        <button
                          key={f}
                          onClick={() => handleFrequencyChange(f)}
                          className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-colors ${
                            currentFrequency === f
                              ? 'bg-emerald-50 text-emerald-700 font-medium'
                              : 'text-stone-600 hover:bg-stone-50'
                          }`}
                        >
                          {frequencyLabel(f)}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="border-t border-stone-100 my-2" />

              <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center p-3 rounded-xl hover:bg-red-50 transition-colors text-red-600 gap-3">
                <LogOut className="w-5 h-5" />
                <span className="text-sm">Cerrar sesión</span>
              </button>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-stone-200 px-4 py-3">
        <div className="max-w-md mx-auto flex justify-around">
          <button onClick={() => setScreen('dashboard')} className="flex flex-col items-center gap-1 px-6 py-1">
            <Home className="w-6 h-6 text-stone-400" />
            <span className="text-xs text-stone-400">Inicio</span>
          </button>
          <button onClick={() => setScreen('chat')} className="flex flex-col items-center gap-1 px-6 py-1">
            <MessageCircle className="w-6 h-6 text-stone-400" />
            <span className="text-xs text-stone-400">Asistente</span>
          </button>
          <button onClick={() => setScreen('nutrition')} className="flex flex-col items-center gap-1 px-6 py-1">
            <Apple className="w-6 h-6 text-stone-400" />
            <span className="text-xs text-stone-400">Nutrición</span>
          </button>
        </div>
      </div>

      {/* Logout modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-stone-900 mb-2">¿Cerrar sesión?</h3>
              <p className="text-stone-500 mb-6">Tendrás que volver a iniciar sesión para acceder a tu cuenta.</p>
              <div className="flex gap-3">
                <Button onClick={() => setShowLogoutConfirm(false)} variant="outline" className="flex-1 py-4 rounded-xl">Cancelar</Button>
                <Button onClick={() => { logout(); setShowLogoutConfirm(false); }} className="flex-1 py-4 rounded-xl bg-red-500 hover:bg-red-600">Cerrar sesión</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
