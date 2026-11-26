// Conversaciones del Coach. Cada mensaje guarda en `chat_messages.mode` la clave
// de su conversación: el chat de siempre de cada modo es «gym», «nutrition» u
// «outdoor»; los chats nuevos son «gym:abc123». Así no hace falta otra tabla.

export type CoachChatMode = 'nutrition' | 'gym' | 'outdoor';
export const COACH_CHAT_MODES: CoachChatMode[] = ['nutrition', 'gym', 'outdoor'];

const KEY_RE = /^(nutrition|gym|outdoor)(?::([a-z0-9-]{4,40}))?$/;

/** ¿Es una clave de conversación válida? */
export function isChatKey(key: unknown): key is string {
  return typeof key === 'string' && KEY_RE.test(key);
}
/** Modo del Coach al que pertenece una conversación. */
export function chatKeyMode(key: string): CoachChatMode {
  const m = KEY_RE.exec(key);
  return (m?.[1] as CoachChatMode) ?? 'gym';
}
/** Clave para un chat nuevo. */
export function newChatKey(mode: CoachChatMode): string {
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().replace(/-/g, '').slice(0, 12)
    : Math.random().toString(36).slice(2, 14);
  return `${mode}:${id}`;
}
/** Título a partir del primer mensaje de la persona. */
export function chatTitle(firstMessage: string | undefined): string {
  const t = (firstMessage ?? '').replace(/\s+/g, ' ').trim();
  if (!t) return 'Chat nuevo';
  return t.length > 48 ? `${t.slice(0, 46).trimEnd()}…` : t;
}

export interface CoachChatSummary {
  key: string;
  mode: CoachChatMode;
  title: string;
  updatedAt: string;
  count: number;
}
