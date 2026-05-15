'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Dumbbell,
  History,
  MessageCircle,
  User,
  Battery,
  CalendarX,
  Clock,
  XCircle,
  Sliders,
  Calendar,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Check,
  Apple,
  Home
} from 'lucide-react';
import { CHAT_ACTIONS } from '@/types/user';

const ACTION_ICONS: Record<string, typeof Battery> = {
  'low-energy': Battery,
  'cant-train': CalendarX,
  'short-time': Clock,
  'cant-exercise': XCircle,
  'intensity': Sliders,
  'change-day': Calendar,
  'discomfort': AlertTriangle,
};

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  options?: { id: string; label: string }[];
}

export function ChatScreen() {
  const { user, setScreen } = useApp();
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!user) return null;

  const isAdvanced = user.level === 'advanced';

  const handleAction = (actionId: string) => {
    setActiveAction(actionId);

    // Generate AI response based on action
    const responses: Record<string, ChatMessage[]> = {
      'low-energy': [
        {
          id: '1',
          type: 'ai',
          content: 'Entendido. Voy a ajustar la sesión de hoy para que sea más ligera. Menos series, menos peso sugerido, y ejercicios que no te agoten tanto.',
        },
        {
          id: '2',
          type: 'ai',
          content: 'He reducido el volumen un 30%. Recuerda: entrenar suave es mejor que no entrenar.',
        },
      ],
      'cant-train': [
        {
          id: '1',
          type: 'ai',
          content: 'Sin problema. ¿Quieres que movamos el entreno a otro día esta semana?',
          options: [
            { id: 'move', label: 'Sí, moverlo' },
            { id: 'skip', label: 'No, dejarlo pasar' },
          ],
        },
      ],
      'short-time': [
        {
          id: '1',
          type: 'ai',
          content: '¿Cuánto tiempo tienes?',
          options: [
            { id: '20', label: '20 minutos' },
            { id: '30', label: '30 minutos' },
            { id: '40', label: '40 minutos' },
          ],
        },
      ],
      'cant-exercise': [
        {
          id: '1',
          type: 'ai',
          content: '¿Qué ejercicio no puedes hacer hoy?',
          options: [
            { id: 'press', label: 'Press de banca' },
            { id: 'row', label: 'Remo' },
            { id: 'squat', label: 'Sentadilla' },
            { id: 'other', label: 'Otro ejercicio' },
          ],
        },
      ],
      'intensity': [
        {
          id: '1',
          type: 'ai',
          content: '¿Cómo quieres ajustar la intensidad de hoy?',
          options: [
            { id: 'softer', label: 'Más suave' },
            { id: 'harder', label: 'Más intenso' },
          ],
        },
      ],
      'change-day': [
        {
          id: '1',
          type: 'ai',
          content: '¿Qué día quieres cambiar?',
          options: [
            { id: 'today', label: 'El de hoy' },
            { id: 'week', label: 'Reorganizar la semana' },
          ],
        },
      ],
      'discomfort': [
        {
          id: '1',
          type: 'ai',
          content: '¿Dónde sientes la molestia?',
          options: [
            { id: 'shoulder', label: 'Hombro' },
            { id: 'back', label: 'Espalda' },
            { id: 'knee', label: 'Rodilla' },
            { id: 'other', label: 'Otra zona' },
          ],
        },
      ],
    };

    setMessages(responses[actionId] || []);
  };

  const handleOption = (optionId: string) => {
    // Add user response
    const newMessages = [...messages];

    // Generate follow-up based on the action and option
    let response = '';

    if (activeAction === 'cant-train') {
      if (optionId === 'move') {
        response = 'He movido el entreno. Recuerda: no pasa nada por cambiar planes. Lo importante es seguir.';
      } else {
        response = 'Perfecto, lo dejamos pasar. Descansa y vuelve cuando puedas. Sin presión.';
      }
    } else if (activeAction === 'short-time') {
      response = `Perfecto. He creado una versión de ${optionId} minutos manteniendo los ejercicios clave. Menos series, pero igual de efectivo.`;
    } else if (activeAction === 'intensity') {
      if (optionId === 'softer') {
        response = 'Hecho. He reducido peso sugerido y volumen. Escucha a tu cuerpo.';
      } else {
        response = 'Bien. He añadido una serie extra a los ejercicios principales. ¡A por ello!';
      }
    } else if (activeAction === 'discomfort') {
      response = 'Gracias por avisar. He adaptado los ejercicios que podrían afectar esa zona. Si la molestia persiste, considera consultar a un profesional.';
    } else if (activeAction === 'cant-exercise') {
      response = 'Entendido. He sustituido ese ejercicio por una alternativa que trabaja los mismos músculos sin forzar.';
    } else {
      response = 'Listo, he hecho los ajustes. ¿Algo más?';
    }

    newMessages.push({
      id: `response-${Date.now()}`,
      type: 'ai',
      content: response,
    });

    setMessages(newMessages);
    setShowConfirmation(true);
  };

  const resetChat = () => {
    setActiveAction(null);
    setMessages([]);
    setShowConfirmation(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 flex flex-col pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 pt-8 pb-6"
      >
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => activeAction ? resetChat() : setScreen('dashboard')}
            className="p-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-stone-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Asistente</h1>
            <p className="text-stone-500 text-sm">Adapta tu plan cuando lo necesites</p>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 px-6">
        <AnimatePresence mode="wait">
          {!activeAction ? (
            <motion.div
              key="actions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {/* Intro message */}
              <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 rounded-2xl mb-6">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-emerald-800 text-sm leading-relaxed">
                    {isAdvanced
                      ? 'Aquí puedes ajustar tu plan cuando lo necesites. Sin rodeos.'
                      : 'No todos los días son iguales. Dime qué necesitas y adaptamos tu entreno.'}
                  </p>
                </div>
              </Card>

              {/* Action buttons */}
              {CHAT_ACTIONS.map((action, i) => {
                const Icon = ACTION_ICONS[action.id];
                return (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card
                      onClick={() => handleAction(action.id)}
                      className="p-4 bg-white border-0 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                          <Icon className="w-5 h-5 text-stone-600 group-hover:text-emerald-600 transition-colors" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-stone-900">{action.label}</p>
                          <p className="text-stone-400 text-sm">{action.description}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-emerald-500 transition-colors" />
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* User action */}
              <div className="flex justify-end">
                <div className="bg-emerald-500 text-white rounded-2xl rounded-tr-md px-4 py-3 max-w-[80%]">
                  {CHAT_ACTIONS.find(a => a.id === activeAction)?.label}
                </div>
              </div>

              {/* AI responses */}
              {messages.map((message, i) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2 }}
                >
                  {message.type === 'ai' && (
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm max-w-[80%]">
                          <p className="text-stone-800">{message.content}</p>
                        </div>
                      </div>

                      {/* Options */}
                      {message.options && !showConfirmation && (
                        <div className="pl-11 flex flex-wrap gap-2">
                          {message.options.map(option => (
                            <Button
                              key={option.id}
                              onClick={() => handleOption(option.id)}
                              variant="outline"
                              className="rounded-full px-4 py-2 text-sm border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300"
                            >
                              {option.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Confirmation */}
              {showConfirmation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-4"
                >
                  <Button
                    onClick={resetChat}
                    className="w-full py-5 rounded-xl bg-emerald-500 hover:bg-emerald-600"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Entendido
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation - 4 Tabs */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-stone-200 px-4 py-3">
        <div className="max-w-md mx-auto flex justify-around">
          <button
            onClick={() => setScreen('dashboard')}
            className="flex flex-col items-center gap-1 px-4 py-1"
          >
            <Home className="w-6 h-6 text-stone-400" />
            <span className="text-xs text-stone-400">Inicio</span>
          </button>
          <button
            onClick={() => setScreen('chat')}
            className="flex flex-col items-center gap-1 px-4 py-1"
          >
            <MessageCircle className="w-6 h-6 text-emerald-500" />
            <span className="text-xs text-emerald-600 font-medium">Asistente</span>
          </button>
          <button
            onClick={() => setScreen('nutrition')}
            className="flex flex-col items-center gap-1 px-4 py-1"
          >
            <Apple className="w-6 h-6 text-stone-400" />
            <span className="text-xs text-stone-400">Nutrición</span>
          </button>
          <button
            onClick={() => setScreen('profile')}
            className="flex flex-col items-center gap-1 px-4 py-1"
          >
            <User className="w-6 h-6 text-stone-400" />
            <span className="text-xs text-stone-400">Perfil</span>
          </button>
        </div>
      </div>
    </div>
  );
}
