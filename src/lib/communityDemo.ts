import type { CommunityPost } from '@/types/user';
import type { ShareData, ShareTemplate } from '@/lib/shareCards';
import type { CommunityProfileView } from '@/lib/communityProfiles';

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
// Hay una de cada plantilla del estudio de tarjetas, todas con foto de fondo,
// para que se vea lo que cada persona puede compartir.

const photo = (id: string) => `https://images.unsplash.com/${id}?w=1080&h=1350&fit=crop&auto=format&q=72`;

export interface DemoCard {
  template: ShareTemplate;
  photo: string;
  data: ShareData;
}

const short = (d: Date) => d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

/** Tarjeta de cada publicación de ejemplo (se dibuja con el mismo motor que el estudio). */
export function getDemoCard(postId: string, host: string): DemoCard | null {
  const now = new Date();
  const base = { date: now, host };
  switch (postId) {
    case 'demo-session':
      return {
        template: 'session', photo: photo('photo-1517836357463-d25dfeac3438'),
        data: {
          ...base, userName: 'Javier', title: 'Pierna y Core', kicker: 'ENTRENO COMPLETADO',
          minutes: 45, exercises: 6, sets: 18, volumeKg: 6240,
          muscles: [{ label: 'Pierna', sets: 10 }, { label: 'Core', sets: 5 }, { label: 'Espalda', sets: 3 }],
          topExercises: [
            { name: 'Sentadilla', detail: '4 × 8 · 70 kg' },
            { name: 'Peso muerto rumano', detail: '3 × 10 · 60 kg' },
            { name: 'Plancha', detail: '3 × 45 s' },
          ],
        },
      };
    case 'demo-photo':
      return {
        template: 'photo', photo: photo('photo-1541534741688-6078c6bfb5c5'),
        data: { ...base, userName: 'Sara', title: 'Espalda y bíceps', kicker: 'ENTRENO COMPLETADO', minutes: 40, exercises: 5, sets: 16, volumeKg: 3180 },
      };
    case 'demo-week': {
      const monday = new Date(now); monday.setHours(0, 0, 0, 0);
      monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7) - 7); // semana pasada, completa
      const planned = [0, 2, 4];
      const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((letter, i) => {
        const d = new Date(monday); d.setDate(monday.getDate() + i);
        return { letter, date: d.getDate(), planned: planned.includes(i), done: planned.includes(i), today: false, sets: planned.includes(i) ? [16, 18, 15][planned.indexOf(i)] : 0 };
      });
      const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
      return {
        template: 'week', photo: photo('photo-1552674605-db6ffd4facb5'),
        data: { ...base, userName: 'Ana', title: 'Mi semana', week: { days, done: 3, total: 3, minutes: 125, sets: 49, range: `${short(monday)} – ${short(sunday)}`, volumeKg: 14820 } },
      };
    }
    case 'demo-progress': {
      const values = [60, 62.5, 65, 65, 67.5, 70, 72.5, 75];
      const points = values.map((value, i) => {
        const d = new Date(now); d.setDate(d.getDate() - (values.length - 1 - i) * 7);
        return { label: short(d), value };
      });
      return {
        template: 'progress', photo: photo('photo-1549060279-7e168fcee0c2'),
        data: { ...base, userName: 'Diego', title: 'Peso muerto', progress: { exercise: 'Peso muerto', unit: 'kg', points } },
      };
    }
    case 'demo-milestone':
      return {
        template: 'milestone', photo: photo('photo-1574680096145-d05b474e2155'),
        data: { ...base, userName: 'Lucía', title: '25 sesiones', milestone: { value: '25', label: 'sesiones completadas', sub: 'Semana 9 con mi plan de Fit K' } },
      };
    default:
      return null;
  }
}

export function getDemoPosts(): CommunityPost[] {
  const now = Date.now();
  const h = 3_600_000;
  const iso = (ms: number) => new Date(now - ms).toISOString();
  const c = (id: string, postId: string, name: string, content: string, ago: number) =>
    ({ id, postId, userId: `demo-user-${name.toLowerCase()}`, displayName: name, content, createdAt: iso(ago) });

  return [
    {
      id: 'demo-session', userId: 'demo-user-javier', displayName: 'Javier', type: 'workout',
      workoutName: 'Pierna y Core', workoutDuration: 45, workoutExercises: 6,
      content: 'Las sentadillas ya no me dan tanto respeto.',
      createdAt: iso(1.5 * h), myReaction: null, reactionCount: 11, commentCount: 1, isDemo: true,
      comments: [c('demo-c1', 'demo-session', 'Lucía', '¡Ese peso muerto! A por más.', 1 * h)],
    },
    {
      id: 'demo-note', userId: 'demo-user-marcos', displayName: 'Marcos', type: 'note',
      content: 'Hoy no tenía ganas de nada y aun así bajé a entrenar 20 minutos. Pequeña victoria, pero cuenta.',
      photoUrl: photo('photo-1576678927484-cc907957088c'),
      createdAt: iso(4 * h), myReaction: null, reactionCount: 18, commentCount: 2,
      milestone: 'Constancia', isDemo: true,
      comments: [
        c('demo-c2', 'demo-note', 'Ana', 'Esos días son los que más cuentan.', 3.5 * h),
        c('demo-c3', 'demo-note', 'Sara', 'Justo lo que necesitaba leer hoy.', 3 * h),
      ],
    },
    {
      id: 'demo-photo', userId: 'demo-user-sara', displayName: 'Sara', type: 'workout',
      workoutName: 'Espalda y bíceps', workoutDuration: 40, workoutExercises: 5,
      content: 'Primera dominada sin goma 🙌',
      createdAt: iso(7 * h), myReaction: null, reactionCount: 24, commentCount: 1,
      milestone: 'Primera dominada', isDemo: true,
      comments: [c('demo-c4', 'demo-photo', 'Diego', 'Brutal, Sara. Eso cuesta mucho.', 6 * h)],
    },
    {
      id: 'demo-week', userId: 'demo-user-ana', displayName: 'Ana', type: 'workout',
      workoutName: 'Mi semana', workoutDuration: 125, workoutExercises: 3,
      content: 'Tres de tres. Llevaba meses diciendo «el lunes empiezo».',
      createdAt: iso(20 * h), myReaction: null, reactionCount: 15, commentCount: 1, isDemo: true,
      comments: [c('demo-c5', 'demo-week', 'Javier', 'Semana redonda 👏', 19 * h)],
    },
    {
      id: 'demo-progress', userId: 'demo-user-diego', displayName: 'Diego', type: 'workout',
      workoutName: 'Peso muerto', workoutDuration: 0, workoutExercises: 1,
      content: 'Dos meses y 15 kg más en el peso muerto. Poco a poco.',
      createdAt: iso(30 * h), myReaction: null, reactionCount: 9, commentCount: 0, isDemo: true,
      comments: [],
    },
    {
      id: 'demo-milestone', userId: 'demo-user-lucia', displayName: 'Lucía', type: 'workout',
      workoutName: '25 sesiones', workoutDuration: 0, workoutExercises: 0,
      content: 'Nunca había llegado tan lejos con nada que tuviera que ver con hacer deporte.',
      createdAt: iso(46 * h), myReaction: null, reactionCount: 21, commentCount: 1,
      milestone: '25 sesiones', isDemo: true,
      comments: [c('demo-c6', 'demo-milestone', 'Marcos', 'Enhorabuena, Lucía 💪', 44 * h)],
    },
  ];
}

// ── Perfiles de ejemplo (autores de las publicaciones de demostración) ──
const DEMO_BIOS: Record<string, string> = {
  'demo-user-javier': 'Pierna los lunes, constancia el resto de la semana.',
  'demo-user-marcos': 'Entreno para despejar la cabeza. Mejor 20 minutos que nada.',
  'demo-user-sara': 'Persiguiendo la primera dominada… ¡conseguida!',
  'demo-user-ana': 'Empecé en septiembre. Tres días a la semana y sin prisa.',
  'demo-user-diego': 'Me gusta ver subir la barra poco a poco.',
  'demo-user-lucia': 'Nunca había sido constante con nada. Hasta ahora.',
};
export function getDemoProfile(userId: string, posts: CommunityPost[]): CommunityProfileView | undefined {
  const mine = posts.filter(p => p.userId === userId && p.isDemo);
  if (!mine.length) return undefined;
  const seed = [...userId].reduce((a, c) => a + c.charCodeAt(0), 0);
  const total = 18 + (seed % 40);
  const since = new Date(); since.setMonth(since.getMonth() - (2 + (seed % 6)));
  return {
    userId, name: mine[0].displayName, bio: DEMO_BIOS[userId], isPublic: true, isMe: false, friendship: 'none',
    friendsCount: 4 + (seed % 23), canView: true, isDemo: true,
    stats: {
      totalSessions: total, totalMinutes: total * (38 + (seed % 12)), monthSessions: 6 + (seed % 7), weekStreak: 2 + (seed % 9),
      totalVolumeKg: total * (900 + (seed % 500)), posts: mine.length, reactionsReceived: mine.reduce((a, p) => a + p.reactionCount, 0),
      memberSince: since.toISOString(),
    },
    lifts: [
      { name: 'Sentadilla', kg: 50 + (seed % 40) }, { name: 'Peso muerto', kg: 60 + (seed % 50) }, { name: 'Press banca', kg: 35 + (seed % 30) },
    ].sort((a, b) => b.kg - a.kg),
    posts: mine.map(p => ({ id: p.id, type: p.type, content: p.content, workoutName: p.workoutName, createdAt: p.createdAt })),
  };
}
