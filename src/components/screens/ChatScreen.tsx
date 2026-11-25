'use client';

import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { BottomNav } from '@/components/ui/BottomNav';
import { motion, AnimatePresence } from 'framer-motion';
import type { CoachWorkout, CoachNutritionPlan, Exercise, WeeklySession } from '@/types/user';
import { ExercisePreview } from '@/components/workout/ExercisePreview';
import { formatRepLine } from '@/lib/exerciseFormat';
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
  Mic,
  Paperclip,
  Square,
  X,
  type LucideIcon,
} from 'lucide-react';

type CoachMode = 'nutrition' | 'gym' | 'outdoor';

const CHAT_MODES: CoachMode[] = ['nutrition', 'gym', 'outdoor'];

const MODE_CONFIG: Record<CoachMode, { label: string; icon: LucideIcon; intro: string }> = {
  gym:       { label: 'Gimnasio',   icon: Dumbbell, intro: 'Te preparo entrenos con tu Motor, adapto la sesión si hoy vas con poca energía o poco tiempo y resuelvo tus dudas.' },
  outdoor:   { label: 'Aire libre', icon: TreePine, intro: 'Entrenos en el parque o la calle, running y alternativas sin máquinas cuando no puedas ir al gimnasio.' },
  nutrition: { label: 'Nutrición',  icon: Utensils, intro: 'Planes de comidas, macros y qué comer antes y después de entrenar, adaptado a tu objetivo.' },
};
// Orden del selector y color del icono de cada sugerencia
const MODE_ORDER: CoachMode[] = ['gym', 'outdoor', 'nutrition'];
const ACTION_TINTS = ['bg-emerald-500', 'bg-amber-500', 'bg-sky-500', 'bg-rose-500', 'bg-violet-500'];

const QUICK_ACTIONS_BY_MODE: Record<CoachMode, { id: string; label: string; icon: LucideIcon }[]> = {
  nutrition: [
    { id: 'diet',           label: 'Hazme un plan de comidas',        icon: Utensils  },
    { id: 'macro',          label: 'Calcula mis macros',               icon: Sliders   },
    { id: 'pre-workout',    label: 'Qué comer antes de entrenar',      icon: Clock     },
    { id: 'snack',          label: 'Recomiéndame un snack saludable',  icon: Apple     },
  ],
  gym: [
    { id: 'workout',        label: 'Créame un entreno para hoy',       icon: Dumbbell  },
    { id: 'add-exercise',   label: 'Añade un ejercicio a una sesión',  icon: Plus      },
    { id: 'low-energy',     label: 'Hoy tengo poca energía',           icon: Battery   },
    { id: 'short-time',     label: 'Tengo poco tiempo',                icon: Clock     },
    { id: 'cant-exercise',  label: 'No puedo hacer un ejercicio',      icon: XCircle   },
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
  /** Foto adjunta por el usuario (data URL). */
  image?: string;
  /** El mensaje se dictó con una nota de voz. */
  voice?: boolean;
  /** Ejercicio que el Coach propone añadir a una sesión. */
  exerciseAdd?: { exercise: Exercise; target?: string };
}

// Lo que sabe hacer el Coach (se enseña en la bienvenida)
const CAPABILITIES = [
  'Crear una sesión con el Motor: gimnasio, casa o calle',
  'Añadir un ejercicio concreto a una de tus sesiones',
  'Planes de comidas y macros adaptados a tu objetivo',
  'Entender fotos y notas de voz',
  'Dudas de técnica, descansos y progresión',
];

/** Reduce la foto en el móvil (lado mayor 1024 px, JPEG) antes de enviarla. */
async function photoToDataUrl(file: File): Promise<string | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1024 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.82);
  } catch {
    return null;
  }
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
  // Adjuntos y notas de voz
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [attachment, setAttachment] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

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

  async function sendMessage(text: string, opts: { image?: string | null; voice?: boolean } = {}) {
    const trimmed = text.trim();
    const image = opts.image ?? null;
    if ((!trimmed && !image) || isLoading) return;

    const mode = coachMode;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: trimmed, image: image ?? undefined, voice: opts.voice };
    setMessagesByMode(prev => ({ ...prev, [mode]: [...prev[mode], userMsg] }));
    setInput('');
    setAttachment(null);
    setIsLoading(true);

    try {
      const history = messagesByMode[mode].slice(-20).map(m => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed || '¿Qué te parece esta foto?', history, mode, image: image ?? undefined }),
      });
      const data = await res.json();
      if (data.response) {
        const aiMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: data.response,
          workout: data.workout ?? undefined,
          nutritionPlan: data.nutritionPlan ?? undefined,
          exerciseAdd: data.exerciseAdd ?? undefined,
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

  async function pickPhoto(file?: File) {
    if (!file) return;
    const dataUrl = await photoToDataUrl(file);
    if (dataUrl) setAttachment(dataUrl);
  }

  async function toggleRecording() {
    setVoiceError(null);
    if (recording) { recorderRef.current?.stop(); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = e => { if (e.data.size) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        setRecording(false);
        const type = recorder.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type });
        if (blob.size < 1000) return;
        setTranscribing(true);
        try {
          const ext = type.includes('mp4') ? 'mp4' : type.includes('ogg') ? 'ogg' : 'webm';
          const form = new FormData();
          form.append('file', new File([blob], `nota.${ext}`, { type }));
          const res = await fetch('/api/chat/transcribe', { method: 'POST', body: form });
          const data = await res.json();
          if (data.text) sendMessage(data.text, { voice: true, image: attachment });
          else setVoiceError(data.error ?? 'No se ha entendido el audio');
        } catch {
          setVoiceError('No se ha podido enviar el audio');
        } finally {
          setTranscribing(false);
        }
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      setVoiceError('Permite el micrófono para enviar notas de voz');
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
      {/* Cabecera: Coach y modo */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="px-4 pt-6 pb-3 flex-shrink-0 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_6px_16px_-6px_rgba(16,185,129,0.6)]">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-stone-900 leading-tight">Coach K</h1>
            <p className="text-stone-500 text-xs">Tu entrenador y nutricionista</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[rgba(118,118,128,0.12)]">
          {MODE_ORDER.map(m => {
            const Icon = MODE_CONFIG[m].icon;
            return (
              <button key={m} type="button" onClick={() => setCoachMode(m)} aria-pressed={coachMode === m}
                className={`h-9 rounded-lg flex items-center justify-center gap-1.5 text-sm font-semibold transition-colors ${
                  coachMode === m ? 'bg-[#fff] dark:bg-[#48484a] text-stone-900 shadow-sm' : 'text-stone-500'
                }`}>
                <Icon className="w-4 h-4" /> {MODE_CONFIG[m].label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pb-64 space-y-3">
        {/* Cargando historial */}
        {isLoadingHistory && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
          </div>
        )}

        {/* Bienvenida y sugerencias con el chat vacío */}
        <AnimatePresence mode="wait">
          {showQuickActions && (
            <motion.div key={coachMode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="pt-4 space-y-5">
              <div className="text-center px-4">
                <div className="w-16 h-16 mx-auto rounded-full glass-card flex items-center justify-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-semibold text-stone-900 text-balance">Hola, {user.profile.name}</h2>
                <p className="text-sm text-stone-500 mt-1 text-balance">{MODE_CONFIG[coachMode].intro}</p>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {QUICK_ACTIONS_BY_MODE[coachMode].map(({ id, label, icon: Icon }, i) => (
                  <motion.button
                    key={id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.04 }}
                    onClick={() => {
                      if (id === 'add-exercise') { setInput('Añade a mi próxima sesión: '); textareaRef.current?.focus(); return; }
                      sendMessage(QUICK_MESSAGES_BY_MODE[coachMode][id] ?? label);
                    }}
                    className={`glass-card rounded-2xl p-3.5 text-left flex flex-col gap-2.5 active:scale-[0.98] transition-transform ${
                      i === 0 && QUICK_ACTIONS_BY_MODE[coachMode].length % 2 === 1 ? 'col-span-2' : ''
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-[10px] flex items-center justify-center ${ACTION_TINTS[i % ACTION_TINTS.length]}`}>
                      <Icon className="w-4 h-4 text-white" />
                    </span>
                    <span className="text-sm font-medium text-stone-800 dark:text-stone-100 leading-snug">{label}</span>
                  </motion.button>
                ))}
              </div>
              <div className="glass-card rounded-2xl p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-2">Qué puedo hacer por ti</p>
                <ul className="space-y-1.5">
                  {CAPABILITIES.map(c => (
                    <li key={c} className="flex items-start gap-2 text-sm text-stone-700 dark:text-stone-200">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" /> {c}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-stone-500 mt-2">Escríbeme, mándame una nota de voz o una foto.</p>
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
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-1">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={`max-w-[82%] ${msg.role === 'user' ? '' : 'flex-1'}`}>
              {msg.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={msg.image} alt="Foto enviada al Coach" className="mb-1.5 ml-auto max-h-56 rounded-2xl object-cover" />
              )}
              {msg.content && (
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-emerald-500 text-white rounded-tr-md'
                    : 'glass-card text-stone-800 dark:text-stone-100 rounded-tl-md'
                }`}>
                  {msg.voice && <span className="flex items-center gap-1 text-[11px] font-semibold text-white/80 mb-0.5"><Mic className="w-3 h-3" /> Nota de voz</span>}
                  {msg.content}
                </div>
              )}

              {/* Tarjeta de entreno creado */}
              {msg.workout && (
                <WorkoutCard
                  workout={msg.workout}
                  saved={savedWorkouts.has(msg.id)}
                  onAdd={() => handleAddWorkout(msg.id, msg.workout!)}
                />
              )}

              {/* Tarjeta para añadir un ejercicio a una sesión */}
              {msg.exerciseAdd && <ExerciseAddCard proposal={msg.exerciseAdd} />}

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
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-1">
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

      {/* Barra de escritura fija encima de la navegación */}
      <div
        className="fixed inset-x-0 z-30 px-4"
        style={{ bottom: 'calc(max(1.25rem, env(safe-area-inset-bottom) + 0.5rem) + 4.75rem)' }}
      >
        <div className="max-w-2xl mx-auto">
          {attachment && (
            <div className="mb-2 inline-flex items-start gap-2 glass-card rounded-2xl p-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={attachment} alt="Foto para enviar" className="w-16 h-16 rounded-xl object-cover" />
              <button type="button" aria-label="Quitar la foto" onClick={() => setAttachment(null)} className="w-6 h-6 rounded-full bg-[rgba(118,118,128,0.2)] flex items-center justify-center">
                <X className="w-3.5 h-3.5 text-stone-700" />
              </button>
            </div>
          )}
          {(recording || transcribing || voiceError) && (
            <p className={`mb-1.5 px-2 text-xs font-medium ${voiceError ? 'text-red-600' : 'text-emerald-700 dark:text-emerald-400'}`}>
              {voiceError ?? (recording ? 'Grabando… pulsa el cuadrado para enviar' : 'Transcribiendo tu nota de voz…')}
            </p>
          )}
          <div className="glass-card rounded-[22px] flex items-end gap-1.5 p-1.5">
            <button type="button" aria-label="Adjuntar foto" onClick={() => fileRef.current?.click()} disabled={recording}
              className="w-9 h-9 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-800 disabled:opacity-40 flex-shrink-0">
              <Paperclip className="w-5 h-5" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { pickPhoto(e.target.files?.[0]); e.target.value = ''; }} />
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={recording ? 'Te escucho…' : 'Pregúntale al Coach…'}
              rows={1}
              disabled={recording}
              style={{ resize: 'none', maxHeight: 96 }}
              className="bare-input flex-1 bg-transparent px-1 py-2 text-stone-800 dark:text-stone-100 placeholder-stone-400 outline-none text-[15px] leading-relaxed"
            />
            {input.trim() || attachment ? (
              <button
                onClick={() => sendMessage(input, { image: attachment })}
                disabled={isLoading}
                aria-label="Enviar"
                className="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center transition-colors flex-shrink-0"
              >
                {isLoading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
              </button>
            ) : (
              <button
                onClick={toggleRecording}
                disabled={transcribing || isLoading}
                aria-label={recording ? 'Parar y enviar la nota de voz' : 'Grabar una nota de voz'}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors flex-shrink-0 disabled:opacity-50 ${recording ? 'bg-red-500 animate-pulse' : 'bg-emerald-500 hover:bg-emerald-600'}`}
              >
                {transcribing ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : recording ? <Square className="w-3.5 h-3.5 text-white fill-white" /> : <Mic className="w-4 h-4 text-white" />}
              </button>
            )}
          </div>
          <p className="text-center text-[10px] text-stone-400 mt-1.5">
            Respuestas generadas por IA. Consulta a un profesional para decisiones médicas.
          </p>
        </div>
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
      <div className="bg-emerald-500 px-4 py-3 flex items-center gap-2">
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
            <span className="text-[11px] text-stone-400 flex-shrink-0 ml-2">{ex.sets}×{ex.repLabel ?? ex.reps.join('/')}</span>
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

// ─── Tarjeta: añadir un ejercicio a una sesión de la semana ───────────
function ExerciseAddCard({ proposal }: { proposal: { exercise: Exercise; target?: string } }) {
  const { user, updateSessionExercises } = useApp();
  const pending = (user?.weeklySessions ?? []).filter(s => s.status !== 'completed');
  const norm = (t: string) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  const target = proposal.target ? norm(proposal.target) : '';
  const guess = pending.find(s => target && (norm(s.name).includes(target) || (s.dayOfWeek !== undefined && target.includes(days[s.dayOfWeek])))) ?? pending[0];
  const [sessionId, setSessionId] = useState<string | undefined>(guess?.id);
  const [added, setAdded] = useState<string | null>(null);
  const ex = proposal.exercise;
  const session = pending.find(s => s.id === sessionId);
  const already = !!session?.exercises.some(e => e.id === ex.id || e.name === ex.name);

  const add = (s: WeeklySession) => {
    updateSessionExercises(s.id, [...s.exercises, { ...ex }]);
    setAdded(s.name);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-2 glass-card rounded-2xl p-3 space-y-3">
      <div className="flex items-center gap-3">
        <ExercisePreview name={ex.name} muscle={ex.targetMuscle} className="w-14 h-14 flex-shrink-0" rounded="rounded-xl" animate={false} />
        <div className="min-w-0">
          <p className="font-semibold text-stone-900 leading-snug">{ex.name}</p>
          <p className="text-xs text-stone-500 tabular-nums">{ex.sets} × {formatRepLine(ex)}</p>
        </div>
      </div>
      {added ? (
        <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400"><Check className="w-4 h-4" /> Añadido a {added}</p>
      ) : pending.length === 0 ? (
        <p className="text-xs text-stone-500">No te quedan sesiones pendientes esta semana.</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5">
            {pending.map(s => (
              <button key={s.id} type="button" onClick={() => setSessionId(s.id)} aria-pressed={s.id === sessionId}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${s.id === sessionId ? 'bg-emerald-500 text-white' : 'bg-[rgba(118,118,128,0.12)] text-stone-600 dark:text-white/70'}`}>
                {s.name}
              </button>
            ))}
          </div>
          <button type="button" disabled={!session || already} onClick={() => session && add(session)}
            className="w-full h-10 rounded-xl bg-emerald-500 text-white text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50">
            <Plus className="w-4 h-4" /> {already ? 'Ya está en esa sesión' : `Añadir a ${session?.name ?? 'la sesión'}`}
          </button>
        </>
      )}
    </motion.div>
  );
}
