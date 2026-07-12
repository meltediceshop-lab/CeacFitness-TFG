'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Loader2 } from 'lucide-react';
import type { Exercise } from '@/types/user';

interface ChatMsg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function WorkoutCoachChat({
  sessionName,
  currentExercise,
}: {
  sessionName: string;
  currentExercise?: Exercise | null;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    html.classList.add('modal-open');
    return () => html.classList.remove('modal-open');
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMsg = { id: `u-${Date.now()}`, role: 'user', content: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history,
          mode: 'session',
          context: {
            sessionName,
            exerciseName: currentExercise?.name,
            sets: currentExercise?.sets,
            reps: currentExercise?.reps,
            targetMuscle: currentExercise?.targetMuscle,
          },
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.response || 'No he podido responder, inténtalo de nuevo.',
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'No pude conectarme. Revisa tu conexión e inténtalo de nuevo.',
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-28 right-5 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-300/50 flex items-center justify-center active:scale-95 transition-transform"
        title="Preguntar al Coach"
      >
        <Sparkles className="w-6 h-6 text-white" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/50 flex items-end justify-center"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="glass-modal w-full max-w-md rounded-t-3xl flex flex-col h-[75vh]"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-5 pt-5 pb-3 flex-shrink-0 border-b border-stone-200/50 dark:border-stone-700/50">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-900 dark:text-white text-sm">Coach — durante el entreno</p>
                  <p className="text-stone-400 text-xs truncate">
                    {currentExercise?.name || sessionName}
                  </p>
                </div>
                <button onClick={() => setOpen(false)} className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-white/10 transition-colors flex-shrink-0">
                  <X className="w-5 h-5 text-stone-500" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {messages.length === 0 && (
                  <p className="text-center text-stone-400 text-sm px-6 mt-4">
                    Pregúntame sobre este ejercicio: técnica, variantes o cómo ajustar series/peso.
                  </p>
                )}
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-emerald-500 text-white rounded-tr-md'
                        : 'glass-card text-stone-800 dark:text-stone-100 rounded-tl-md'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="glass-card rounded-2xl rounded-tl-md px-4 py-2.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-3 flex-shrink-0 pb-safe">
                <div className="glass-card rounded-2xl flex items-end gap-2 p-2">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') sendMessage(input); }}
                    placeholder="Pregunta sobre este ejercicio…"
                    className="flex-1 bg-transparent px-2 py-2 text-stone-800 dark:text-stone-100 placeholder-stone-400 outline-none text-sm"
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || isLoading}
                    className="w-9 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
