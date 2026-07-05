'use client';

import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { BottomNav } from '@/components/ui/BottomNav';
import { motion, AnimatePresence } from 'framer-motion';
import type { CoachWorkout, CoachNutritionPlan } from '@/types/user';
import {
  Send,
  Sparkles,
  Loader2,
  Battery,
  Clock,
  XCircle,
  Sliders,
  Dumbbell,
  Apple,
  Check,
  Plus,
  ArrowRight,
  ChevronDown,
  TreePine,
  Zap,
  Utensils,
  type LucideIcon,
} from 'lucide-react';

type CoachMode = 'nutrition' | 'gym' | 'outdoor';

const CHAT_MODES: CoachMode[] = ['nutrition', 'gym', 'outdoor'];

const MODE_CONFIG: Record<CoachMode, { label: string; sublabel: string; emoji: string; color: string }> = {
  nutrition: { label: 'Nutrición',  sublabel: 'Dieta y comidas',   emoji: '🥗', color: 'emerald' },
  gym:       { label: 'Gimnasio',   sublabel: 'Pesas y máquinas',  emoji: '🏋️', color: 'blue'    },
  outdoor:   { label: 'Aire libre', sublabel: 'Running y parque',  emoji: '🌿', color: 'teal'    },
};

const QUICK_ACTIONS_BY_MODE: Record<CoachMode, { id: string; label: string; icon: LucideIcon }[]> = {
  nutrition: [
    { id: 'diet',           label: 'Hazme un plan de comidas',        icon: Utensils  },
    { id: 'macro',          label: 'Calcula mis macros',               icon: Sliders   },
    { id: 'pre-workout',    label: 'Qué comer antes de entrenar',      icon: Clock     },
    { id: 'snack',          label: 'Recomiéndame un snack saludable',  icon: Apple     },
  ],
  gym: [
    { id: 'workout',        label: 'Créame un entreno para hoy',       icon: Dumbbell  },
    { id: 'low-energy',     label: 'Hoy tengo poca energía',           icon: Battery   },
    { id: 'short-time',     label: 'Tengo poco tiempo',                icon: Clock     },
    { id: 'cant-exercise',  label: 'No puedo hacer un ejercicio',      icon: XCircle   },
    { id: 'intensity',      label: 'Ajustar la intensidad',            icon: Sliders   },
  ],
  outdoor: [
    { id: 'workout',        label: 'Entreno al aire libre para hoy',   icon: TreePine  },
    { id: 'running',        label: 'Plan de running',                  icon: Zap       },
    { id: 'low-energy',     label: 'Hoy tengo poca energía',           icon: Battery   },
    { id: 'short-time',     label: 'Tengo poco tiempo',                icon: Clock     },
  ],
};

const QUICK_MESSAGES_BY_MODE: Record<CoachMode, Record<string, string>> = {
  nutrition: {
    diet:         'Hazme un plan de comidas para hoy adaptado a mi objetivo y mi perfil.',
    macro:        'Calcula mis macros según mi objetivo y mi perfil.',
    'pre-workout':'¿Qué debería comer antes de entrenar para rendir mejor?',
    snack:        'Recomiéndame un snack saludable y rico en proteína.',
  },
  gym: {
    workout:       'Créame una sesión de entrenamiento en gimnasio personalizada para hoy según mi perfil.',
    'low-energy':  'Hoy tengo poca energía. ¿Cómo adapto la sesión en el gym?',
    'short-time':  'Solo tengo 20-30 minutos hoy en el gym. ¿Qué entreno hago?',
    'cant-exercise':'Hay un ejercicio de gym que no puedo hacer hoy. ¿Con qué lo sustituyo?',
    intensity:     'Quiero ajustar la intensidad del entreno de gym de hoy.',
  },
  outdoor: {
    workout:      'Créame un entreno al aire libre para hoy según mi perfil.',
    running:      '¿Puedes hacerme un plan de running adaptado a mi nivel?',
    'low-energy': 'Hoy tengo poca energía. ¿Qué entreno suave al aire libre puedo hacer?',
    'short-time': 'Solo tengo 20-30 minutos para entrenar al aire libre. ¿Qué hago?',
  },
};

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  workout?: CoachWorkout;
  nutritionPlan?: CoachNutritionPlan;
}


export function ChatScreen() {
  const { user, setScreen, addSessionFromCoach } = useApp();
  const [messagesByMode, setMessagesByMode] = useState<Record<CoachMode, ChatMessage[]>>({
    nutrition: [],
    gym: [],
    outdoor: [],
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [savedWorkouts, setSavedWorkouts] = useState<Set<string>>(new Set());
  const [savedPlans, setSavedPlans] = useState<Set<string>>(new Set());
  const [savingPlan, setSavingPlan] = useState<string | null>(null);
  const [coachMode, setCoachMode] = useState<CoachMode>('gym');
  const [showModeMenu, setShowModeMenu] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = messagesByMode[coachMode];

  useEffect(() => {
    async function loadHistory() {
      try {
        const results = await Promise.all(CHAT_MODES.map(async (m) => {
          const res = await fetch(`/api/chat?mode=${m}`);
          const data = await res.json();
          const msgs: ChatMessage[] = (data.data || []).map((mm: { id: string; role: string; content: string }) => ({
            id: mm.id,
            role: mm.role as 'user' | 'assistant',
            content: mm.content,
          }));
          return [m, msgs] as const;
        }));
        setMessagesByMode(prev => {
          const next = { ...prev };
          for (const [m, msgs] of results) {
            if (msgs.length && next[m].length === 0) next[m] = msgs;
          }
          return next;
        });
      } catch { /* ignore */ } finally {
        setIsLoadingHistory(false);
      }
    }
    loadHistory();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, coachMode]);

  if (!user) return null;

  const isAdvanced = user.level === 'advanced';

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const mode = coachMode;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: trimmed };
    setMessagesByMode(prev => ({ ...prev, [mode]: [...prev[mode], userMsg] }));
    setInput('');
    setIsLoading(true);

    try {
      const history = messagesByMode[mode].slice(-20).map(m => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history, mode }),
      });
      const data = await res.json();
      if (data.response) {
        const aiMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: data.response,
          workout: data.workout ?? undefined,
          nutritionPlan: data.nutritionPlan ?? undefined,
        };
        setMessagesByMode(prev => ({ ...prev, [mode]: [...prev[mode], aiMsg] }));
      }
    } catch {
      setMessagesByMode(prev => ({ ...prev, [mode]: [...prev[mode], {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'No pude conectarme. Revisa tu conexión e inténtalo de nuevo.',
      }] }));
    } finally {
      setIsLoading(false);
    }
  }

  function handleAddWorkout(msgId: string, workout: CoachWorkout) {
    addSessionFromCoach(workout); // añade la sesión y navega al dashboard
    setSavedWorkouts(prev => new Set(prev).add(msgId));
  }

  async function handleSaveNutrition(msgId: string, plan: CoachNutritionPlan) {
    setSavingPlan(msgId);
    try {
      const res = await fetch('/api/nutrition', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      if (res.ok) {
        setSavedPlans(prev => new Set(prev).add(msgId));
      }
    } catch { /* ignore */ } finally {
      setSavingPlan(null);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  const showQuickActions = messages.length === 0 && !isLoadingHistory;

  return (
    <div className="min-h-dvh glass-bg flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 pt-8 pb-3 flex-shrink-0"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-900">Coach K</h1>
            <p className="text-stone-500 text-xs">Tu entrenador y nutricionista de IA</p>
          </div>
          {/* Mode selector */}
          <div className="relative ml-auto">
            <button
              onClick={() => setShowModeMenu(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-card border border-stone-200/60 dark:border-stone-700/60 text-xs font-medium text-stone-700 dark:text-stone-200 hover:border-emerald-400/40 transition-all"
            >
              <span className="text-sm leading-none">{MODE_CONFIG[coachMode].emoji}</span>
              <span>{MODE_CONFIG[coachMode].label}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showModeMenu ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showModeMenu && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowModeMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 glass-modal rounded-2xl p-2 min-w-[176px] z-50 shadow-xl"
                  >
                    {/* Nutrición */}
                    <button
                      onClick={() => { setCoachMode('nutrition'); setShowModeMenu(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        coachMode === 'nutrition'
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                          : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/40'
                      }`}
                    >
                      <span className="text-base leading-none">🥗</span>
                      <span className="flex-1 text-left">Nutrición</span>
                      {coachMode === 'nutrition' && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                    </button>

                    {/* Separator */}
                    <div className="px-3 pt-2 pb-0.5">
                      <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Entrenamiento</span>
                    </div>

                    {/* Gym */}
                    <button
                      onClick={() => { setCoachMode('gym'); setShowModeMenu(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        coachMode === 'gym'
                          ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'
                          : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/40'
                      }`}
                    >
                      <span className="text-base leading-none">🏋️</span>
                      <span className="flex-1 text-left">Gimnasio</span>
                      {coachMode === 'gym' && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                    </button>

                    {/* Outdoor */}
                    <button
                      onClick={() => { setCoachMode('outdoor'); setShowModeMenu(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        coachMode === 'outdoor'
                          ? 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400'
                          : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/40'
                      }`}
                    >
                      <span className="text-base leading-none">🌿</span>
                      <span className="flex-1 text-left">Aire libre</span>
                      {coachMode === 'outdoor' && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {/* Welcome message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 mt-2"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0 mt-1">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="glass-card rounded-2xl rounded-tl-md px-4 py-3 max-w-[82%]">
            <p className="text-stone-800 dark:text-stone-100 text-sm leading-relaxed">
              {isAdvanced
                ? `Soy tu coach IA. Puedo crearte entrenos y planes de comidas a medida, ajustar tu plan y resolver dudas. Conozco tu perfil. Dime qué necesitas.`
                : `¡Hola, ${user.profile.name}! Soy tu coach personal de IA. Puedo crearte entrenos, planes de comidas, adaptar tu plan… y guardarlos directamente en tu app. ¿Qué necesitas hoy?`}
            </p>
          </div>
        </motion.div>

        {/* Loading history */}
        {isLoadingHistory && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
          </div>
        )}

        {/* Quick action chips */}
        <AnimatePresence>
          {showQuickActions && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="pl-11"
            >
              <p className="text-xs text-stone-400 mb-2 font-medium">
                {MODE_CONFIG[coachMode].emoji} {MODE_CONFIG[coachMode].sublabel} · Prueba con:
              </p>
              <div className="flex flex-col gap-2">
                {QUICK_ACTIONS_BY_MODE[coachMode].map(({ id, label, icon: Icon }, i) => (
                  <motion.button
                    key={id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => sendMessage(QUICK_MESSAGES_BY_MODE[coachMode][id] ?? label)}
                    className="flex items-center gap-3 px-4 py-2.5 glass-card rounded-xl text-left hover:ring-1 hover:ring-emerald-400/40 transition-all group"
                  >
                    <Icon className="w-4 h-4 text-stone-400 group-hover:text-emerald-500 transition-colors flex-shrink-0" />
                    <span className="text-sm text-stone-700 dark:text-stone-200">{label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat history */}
        {messages.map(msg => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0 mt-1">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={`max-w-[82%] ${msg.role === 'user' ? '' : 'flex-1'}`}>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-emerald-500 text-white rounded-tr-md'
                  : 'glass-card text-stone-800 dark:text-stone-100 rounded-tl-md'
              }`}>
                {msg.content}
              </div>

              {/* Tarjeta de entreno creado */}
              {msg.workout && (
                <WorkoutCard
                  workout={msg.workout}
                  saved={savedWorkouts.has(msg.id)}
                  onAdd={() => handleAddWorkout(msg.id, msg.workout!)}
                />
              )}

              {/* Tarjeta de plan nutricional */}
              {msg.nutritionPlan && (
                <NutritionCard
                  plan={msg.nutritionPlan}
                  saved={savedPlans.has(msg.id)}
                  saving={savingPlan === msg.id}
                  onSave={() => handleSaveNutrition(msg.id, msg.nutritionPlan!)}
                  onView={() => setScreen('nutrition')}
                />
              )}
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0 mt-1">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="glass-card rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 px-4 pb-36">
        <div className="glass-card rounded-2xl flex items-end gap-2 p-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu pregunta…"
            rows={1}
            style={{ resize: 'none', maxHeight: 96 }}
            className="flex-1 bg-transparent px-2 py-2 text-stone-800 dark:text-stone-100 placeholder-stone-400 outline-none text-sm leading-relaxed"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
          >
            {isLoading
              ? <Loader2 className="w-4 h-4 text-white animate-spin" />
              : <Send className="w-4 h-4 text-white" />}
          </button>
        </div>
        <p className="text-center text-[10px] text-stone-400 mt-2">
          Respuestas generadas por IA. Consulta a un profesional para decisiones médicas.
        </p>
      </div>

      <BottomNav active="chat" />
    </div>
  );
}

// ─── Tarjeta de entreno generado ──────────────────────────────────────
function WorkoutCard({ workout, saved, onAdd }: { workout: CoachWorkout; saved: boolean; onAdd: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-2 glass-card rounded-2xl overflow-hidden border border-emerald-200/50 dark:border-emerald-500/20"
    >
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 flex items-center gap-2">
        <Dumbbell className="w-4 h-4 text-white" />
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm truncate">{workout.name}</p>
          <p className="text-white/80 text-[11px]">{workout.targetMuscles} · {workout.duration} min</p>
        </div>
      </div>
      <div className="p-3 space-y-1.5">
        {workout.exercises.slice(0, 5).map((ex, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-xs text-stone-700 dark:text-stone-200 truncate flex-1">{ex.name}</span>
            <span className="text-[11px] text-stone-400 flex-shrink-0 ml-2">{ex.sets}×{ex.reps.join('/')}</span>
          </div>
        ))}
        {workout.exercises.length > 5 && (
          <p className="text-[11px] text-stone-400">+{workout.exercises.length - 5} ejercicios más</p>
        )}
        <button
          onClick={onAdd}
          disabled={saved}
          className={`w-full mt-2 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 transition-colors ${
            saved
              ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white'
          }`}
        >
          {saved
            ? <><Check className="w-4 h-4" /> Añadido a tus sesiones</>
            : <><Plus className="w-4 h-4" /> Añadir a mis sesiones</>}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Tarjeta de plan nutricional generado ─────────────────────────────
function NutritionCard({ plan, saved, saving, onSave, onView }: {
  plan: CoachNutritionPlan; saved: boolean; saving: boolean; onSave: () => void; onView: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-2 glass-card rounded-2xl overflow-hidden border border-orange-200/50 dark:border-orange-500/20"
    >
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 flex items-center gap-2">
        <Apple className="w-4 h-4 text-white" />
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm truncate">Plan de comidas</p>
          <p className="text-white/80 text-[11px]">{plan.dailyCalories} kcal · {plan.meals.length} comidas</p>
        </div>
      </div>
      <div className="p-3 space-y-2">
        {/* Macros */}
        <div className="flex gap-2">
          {[
            { l: 'Proteína', v: plan.macros.protein, c: 'text-emerald-600 dark:text-emerald-400' },
            { l: 'Carbos', v: plan.macros.carbs, c: 'text-blue-600 dark:text-blue-400' },
            { l: 'Grasas', v: plan.macros.fats, c: 'text-amber-600 dark:text-amber-400' },
          ].map(m => (
            <div key={m.l} className="flex-1 text-center bg-stone-50 dark:bg-white/5 rounded-lg py-1.5">
              <p className={`text-sm font-bold ${m.c}`}>{m.v}g</p>
              <p className="text-[9px] text-stone-400">{m.l}</p>
            </div>
          ))}
        </div>
        {/* Comidas */}
        <div className="space-y-1">
          {plan.meals.slice(0, 4).map((meal, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-xs text-stone-700 dark:text-stone-200">{meal.name}</span>
              <span className="text-[11px] text-stone-400">{meal.calories} kcal</span>
            </div>
          ))}
        </div>
        {saved ? (
          <button
            onClick={onView}
            className="w-full mt-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-400"
          >
            <Check className="w-4 h-4" /> Guardado · Ver en Nutrición <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={onSave}
            disabled={saving}
            className="w-full mt-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-60 transition-colors"
          >
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando…</>
              : <><Plus className="w-4 h-4" /> Guardar en Nutrición</>}
          </button>
        )}
      </div>
    </motion.div>
  );
}
