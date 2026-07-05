import type { CommunityPost } from '@/types/user';

// ── Tema del día ──────────────────────────────────────────────────
// Invitaciones suaves a compartir. Sin presión, sin comparación.
export const DAILY_THEMES = [
  { emoji: '🌱', title: 'Una pequeña victoria', prompt: 'Comparte algo pequeño que hayas conseguido hoy.' },
  { emoji: '💭', title: '¿Cómo llegas hoy?', prompt: 'Cuenta cómo te sientes antes del entreno, sin filtros.' },
  { emoji: '🔁', title: 'Constancia', prompt: '¿Qué te está ayudando a no abandonar esta semana?' },
  { emoji: '🙌', title: 'Algo que superaste', prompt: 'Un ejercicio o miedo que antes te costaba y ahora menos.' },
  { emoji: '🧠', title: 'Cuerpo y cabeza', prompt: '¿Cómo ha cambiado tu ánimo desde que entrenas?' },
  { emoji: '⏱️', title: 'Aunque sea poco', prompt: 'Una sesión corta que hiciste aunque no tenías ganas.' },
  { emoji: '✨', title: 'Tu porqué', prompt: '¿Por qué empezaste? Recuérdalo en voz alta.' },
];

export function getDailyTheme() {
  const start = new Date(new Date().getFullYear(), 0, 0).getTime();
  const dayOfYear = Math.floor((Date.now() - start) / 86_400_000);
  return DAILY_THEMES[dayOfYear % DAILY_THEMES.length];
}

// ── Reto de la semana ─────────────────────────────────────────────
// Colectivo y cooperativo, nunca competitivo ni con ranking.
const WEEKLY_CHALLENGES = [
  { emoji: '🎯', text: 'Comparte al menos una sesión completada. Cada una suma a la comunidad.' },
  { emoji: '📝', text: 'Escribe una nota honesta sobre un día difícil. A alguien le ayudará.' },
  { emoji: '🤝', text: 'Reacciona o comenta en 3 publicaciones de otras personas.' },
  { emoji: '🌤️', text: 'Cuenta una pequeña mejora que hayas notado esta semana.' },
];

export function getWeeklyChallenge() {
  const week = Math.floor(Date.now() / (7 * 86_400_000));
  return WEEKLY_CHALLENGES[week % WEEKLY_CHALLENGES.length];
}

// ── Logros personales (sin presión) ───────────────────────────────
// Celebran el camino de cada persona, nunca comparan con nadie.
export interface CommunityBadge {
  id: string;
  emoji: string;
  label: string;
  hint: string;
  unlocked: boolean;
}

export function computeBadges(opts: {
  ownPosts: number;
  ownNotes: number;
  ownWorkouts: number;
  reactionsGiven: number;
}): CommunityBadge[] {
  const { ownPosts, ownNotes, ownWorkouts, reactionsGiven } = opts;
  return [
    { id: 'first', emoji: '🌱', label: 'Primer paso', hint: 'Comparte tu primera publicación', unlocked: ownPosts >= 1 },
    { id: 'voice', emoji: '✍️', label: 'Tu voz', hint: 'Escribe una nota', unlocked: ownNotes >= 1 },
    { id: 'effort', emoji: '🏋️', label: 'Esfuerzo', hint: 'Comparte un entrenamiento', unlocked: ownWorkouts >= 1 },
    { id: 'support', emoji: '🤝', label: 'Apoyo', hint: 'Reacciona a alguien', unlocked: reactionsGiven >= 1 },
    { id: 'steady', emoji: '🔥', label: 'Constancia', hint: 'Comparte 3 publicaciones', unlocked: ownPosts >= 3 },
  ];
}

// ── Publicaciones de ejemplo ──────────────────────────────────────
// Semi-anónimas (solo nombre de pila), tono de apoyo. IDs con prefijo "demo-".
// Son interactivas solo en local (reacciones/comentarios no tocan la base de datos).
export function getDemoPosts(): CommunityPost[] {
  const now = Date.now();
  const h = 3_600_000;
  const iso = (ms: number) => new Date(now - ms).toISOString();

  return [
    {
      id: 'demo-1', userId: 'demo-user-lucia', displayName: 'Lucía', type: 'note',
      content: 'Hoy no tenía ganas de nada y aun así bajé a entrenar 20 minutos. Pequeña victoria, pero cuenta.',
      createdAt: iso(2 * h), myReaction: null, reactionCount: 12, commentCount: 2,
      milestone: 'Constancia 🔥', isDemo: true,
      comments: [
        { id: 'demo-c1', postId: 'demo-1', userId: 'demo-user-marcos', displayName: 'Marcos', content: 'Justo lo que necesitaba leer hoy.', createdAt: iso(1.5 * h) },
        { id: 'demo-c2', postId: 'demo-1', userId: 'demo-user-ana', displayName: 'Ana', content: 'Esos días son los que más cuentan.', createdAt: iso(1 * h) },
      ],
    },
    {
      id: 'demo-2', userId: 'demo-user-marcos', displayName: 'Marcos', type: 'workout',
      workoutName: 'Full Body en Casa', workoutDuration: 30, workoutExercises: 6,
      content: 'Primer día de la semana hecho 💪',
      createdAt: iso(5 * h), myReaction: null, reactionCount: 7, commentCount: 1, isDemo: true,
      comments: [
        { id: 'demo-c3', postId: 'demo-2', userId: 'demo-user-lucia', displayName: 'Lucía', content: '¡Bien hecho! A por la semana.', createdAt: iso(4 * h) },
      ],
    },
    {
      id: 'demo-3', userId: 'demo-user-ana', displayName: 'Ana', type: 'note',
      content: 'Llevaba meses diciéndome "el lunes empiezo". Hoy por fin ese lunes llegó.',
      createdAt: iso(9 * h), myReaction: null, reactionCount: 18, commentCount: 3,
      milestone: 'Primer paso 🌱', isDemo: true,
      comments: [
        { id: 'demo-c4', postId: 'demo-3', userId: 'demo-user-diego', displayName: 'Diego', content: 'Bienvenida, el primer paso es el más difícil.', createdAt: iso(8 * h) },
        { id: 'demo-c5', postId: 'demo-3', userId: 'demo-user-sara', displayName: 'Sara', content: 'Yo igual hace un mes. Sigue así 💪', createdAt: iso(7.5 * h) },
        { id: 'demo-c6', postId: 'demo-3', userId: 'demo-user-javier', displayName: 'Javier', content: 'A por ello.', createdAt: iso(7 * h) },
      ],
    },
    {
      id: 'demo-4', userId: 'demo-user-javier', displayName: 'Javier', type: 'workout',
      workoutName: 'Pierna y Core', workoutDuration: 45, workoutExercises: 7,
      content: 'Las sentadillas ya no me dan tanto respeto.',
      createdAt: iso(26 * h), myReaction: null, reactionCount: 9, commentCount: 0, isDemo: true,
      comments: [],
    },
    {
      id: 'demo-5', userId: 'demo-user-sara', displayName: 'Sara', type: 'note',
      content: 'Dormí fatal y casi lo dejo pasar. Al final hice 15 minutos. Mejor algo que nada.',
      createdAt: iso(30 * h), myReaction: null, reactionCount: 14, commentCount: 1,
      milestone: '3 semanas seguidas 🗓️', isDemo: true,
      comments: [
        { id: 'demo-c7', postId: 'demo-5', userId: 'demo-user-ana', displayName: 'Ana', content: 'Mejor algo que nada, totalmente.', createdAt: iso(29 * h) },
      ],
    },
    {
      id: 'demo-6', userId: 'demo-user-diego', displayName: 'Diego', type: 'workout',
      workoutName: 'Push · Pecho y Hombro', workoutDuration: 40, workoutExercises: 5,
      createdAt: iso(48 * h), myReaction: null, reactionCount: 6, commentCount: 0, isDemo: true,
      comments: [],
    },
  ];
}