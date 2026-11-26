// Perfiles de la Comunidad: tipos compartidos entre el servidor y la app.

export type FriendshipState = 'none' | 'outgoing' | 'incoming' | 'friends';

export interface ProfileStats {
  totalSessions: number;
  totalMinutes: number;
  monthSessions: number;
  weekStreak: number;
  totalVolumeKg: number;
  posts: number;
  reactionsReceived: number;
  memberSince?: string;
}
export interface ProfileLift { name: string; kg: number }
export interface ProfilePost { id: string; type: 'note' | 'workout'; content?: string; workoutName?: string; photoUrl?: string; createdAt: string }

export interface CommunityProfileView {
  userId: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  isPublic: boolean;
  isMe: boolean;
  friendship: FriendshipState;
  friendsCount: number;
  /** ¿Se pueden ver sus estadísticas? (tú, perfil público o amigos) */
  canView: boolean;
  stats?: ProfileStats;
  lifts?: ProfileLift[];
  posts?: ProfilePost[];
  /** Perfil de ejemplo (publicaciones de demostración del feed). */
  isDemo?: boolean;
}

export interface FriendItem { userId: string; name: string; avatarUrl?: string; since: string }
export interface FriendsList { friends: FriendItem[]; incoming: FriendItem[]; outgoing: FriendItem[] }

/** Racha de semanas seguidas con al menos un entreno (cuenta hasta la semana pasada si esta aún no hay). */
export function weekStreakFrom(dates: Date[], now = new Date()): number {
  const key = (d: Date) => {
    const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
    return x.getTime();
  };
  const weeks = new Set(dates.map(key));
  let cursor = key(now);
  if (!weeks.has(cursor)) cursor -= 7 * 86_400_000;
  let streak = 0;
  while (weeks.has(cursor)) { streak++; cursor -= 7 * 86_400_000; }
  return streak;
}
