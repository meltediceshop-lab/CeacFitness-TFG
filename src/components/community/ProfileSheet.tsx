'use client';

// Perfil de la Comunidad (tuyo o de otra persona) y panel de amigos.
// Privacidad: un perfil privado solo enseña sus estadísticas a sus amigos.

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Lock, Globe, UserPlus, UserCheck, Clock, Check, Loader2, Pencil, Users, Dumbbell, Timer, Flame,
  CalendarDays, BarChart2, Heart, Trophy, ChevronRight, Quote,
} from 'lucide-react';
import type { CommunityProfileView, FriendsList, FriendshipState, ProfileStats } from '@/lib/communityProfiles';

const fmt = (n: number) => n.toLocaleString('es-ES');

function Avatar({ name, url, size }: { name: string; url?: string; size: number }) {
  return (
    <span className="rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-emerald-400 to-emerald-700 text-white font-bold flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {url ? <img src={url} alt="" className="w-full h-full object-cover" /> : name.charAt(0).toUpperCase()}
    </span>
  );
}

/** Logros a partir de las estadísticas (los mismos para todos, sin comparar con nadie). */
function badgesFor(s: ProfileStats, postsNotes: number, postsWorkouts: number) {
  return [
    { id: 'first', emoji: '🌱', label: 'Primer entreno', on: s.totalSessions >= 1 },
    { id: 'ten', emoji: '💪', label: '10 entrenos', on: s.totalSessions >= 10 },
    { id: 'fifty', emoji: '🏅', label: '50 entrenos', on: s.totalSessions >= 50 },
    { id: 'streak', emoji: '🔥', label: '4 semanas seguidas', on: s.weekStreak >= 4 },
    { id: 'ton', emoji: '🏋️', label: '1 tonelada', on: s.totalVolumeKg >= 1000 },
    { id: 'tons', emoji: '🚀', label: '10 toneladas', on: s.totalVolumeKg >= 10000 },
    { id: 'voice', emoji: '✍️', label: 'Tu voz', on: postsNotes >= 1 },
    { id: 'share', emoji: '📸', label: 'Comparte', on: postsWorkouts >= 1 },
    { id: 'support', emoji: '🤝', label: 'Inspira', on: s.reactionsReceived >= 10 },
  ];
}

function FriendButton({ state, busy, onAction }: { state: FriendshipState; busy: boolean; onAction: (a: 'request' | 'accept' | 'decline' | 'cancel' | 'remove') => void }) {
  const [confirm, setConfirm] = useState(false);
  useEffect(() => setConfirm(false), [state]);
  const base = 'h-10 px-4 rounded-full text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50';
  if (busy) return <span className={`${base} bg-[rgba(118,118,128,0.12)] text-stone-500`}><Loader2 className="w-4 h-4 animate-spin" /></span>;
  if (state === 'none') return <button type="button" onClick={() => onAction('request')} className={`${base} bg-emerald-500 text-white flex-1`}><UserPlus className="w-4 h-4" /> Añadir amigo</button>;
  if (state === 'incoming') return (
    <div className="flex gap-2 flex-1">
      <button type="button" onClick={() => onAction('accept')} className={`${base} bg-emerald-500 text-white flex-1`}><Check className="w-4 h-4" /> Aceptar solicitud</button>
      <button type="button" onClick={() => onAction('decline')} className={`${base} bg-[rgba(118,118,128,0.12)] text-stone-700 dark:text-white`}>Rechazar</button>
    </div>
  );
  const isFriend = state === 'friends';
  return confirm ? (
    <div className="flex gap-2 flex-1">
      <button type="button" onClick={() => setConfirm(false)} className={`${base} bg-[rgba(118,118,128,0.12)] text-stone-700 dark:text-white flex-1`}>Cancelar</button>
      <button type="button" onClick={() => onAction(isFriend ? 'remove' : 'cancel')} className={`${base} bg-red-500 text-white flex-1`}>{isFriend ? 'Quitar amigo' : 'Retirar solicitud'}</button>
    </div>
  ) : (
    <button type="button" onClick={() => setConfirm(true)} className={`${base} bg-[rgba(118,118,128,0.12)] text-stone-800 dark:text-white flex-1`}>
      {isFriend ? <><UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Amigos</> : <><Clock className="w-4 h-4" /> Solicitud enviada</>}
    </button>
  );
}

export function ProfileSheet({ userId, demo, onClose, onOpenFriends, onChanged }: {
  userId: string;
  /** Perfil de ejemplo ya construido (publicaciones de demostración). */
  demo?: CommunityProfileView;
  onClose: () => void;
  onOpenFriends?: () => void;
  onChanged?: () => void;
}) {
  const [view, setView] = useState<CommunityProfileView | null>(demo ?? null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (demo) { setView(demo); return; }
    let alive = true;
    setView(null); setError(null);
    fetch(`/api/community/profile?userId=${encodeURIComponent(userId)}`)
      .then(async r => { const j = await r.json(); if (!alive) return; if (!r.ok || !j.data) setError(j.error ?? 'No se ha podido cargar el perfil.'); else setView(j.data); })
      .catch(() => alive && setError('Sin conexión. Inténtalo de nuevo.'));
    return () => { alive = false; };
  }, [userId, demo]);

  async function friendAction(action: 'request' | 'accept' | 'decline' | 'cancel' | 'remove') {
    if (!view || view.isDemo) return;
    setBusy(true);
    try {
      const r = await fetch('/api/community/friends', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: view.userId, action }) });
      const j = await r.json();
      if (r.ok && j.state) {
        // Al haceros amigos se recarga para ver sus estadísticas si era privado.
        if (j.state === 'friends' && !view.canView) {
          const p = await fetch(`/api/community/profile?userId=${encodeURIComponent(view.userId)}`).then(x => x.json());
          if (p.data) setView(p.data);
        } else {
          setView(v => v && ({ ...v, friendship: j.state, friendsCount: v.friendsCount + (j.state === 'friends' ? 1 : action === 'remove' ? -1 : 0), canView: v.isPublic || j.state === 'friends' }));
        }
        onChanged?.();
      } else setError(j.error ?? 'No se ha podido completar.');
    } catch { setError('Sin conexión. Inténtalo de nuevo.'); }
    setBusy(false);
  }

  async function saveProfile() {
    setSaving(true);
    try {
      const r = await fetch('/api/community/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bio, isPublic }) });
      if (r.ok) { setView(v => v && ({ ...v, bio: bio.trim() || undefined, isPublic })); setEditing(false); }
      else setError('No se ha podido guardar. ¿Está creada la tabla de perfiles?');
    } catch { setError('Sin conexión. Inténtalo de nuevo.'); }
    setSaving(false);
  }

  const s = view?.stats;
  const notes = view?.posts?.filter(p => p.type === 'note').length ?? 0;
  const workouts = view?.posts?.filter(p => p.type === 'workout').length ?? 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[85] bg-black/40 flex items-end justify-center" onClick={onClose}>
      <motion.div role="dialog" aria-label={view ? `Perfil de ${view.name}` : 'Perfil'} initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="glass-modal w-full max-w-md rounded-t-3xl max-h-[94dvh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex-1 overflow-y-auto">
          {/* Portada */}
          <div className="relative h-28" style={{ background: 'radial-gradient(130% 140% at 100% 0%, rgb(var(--acc-400)) 0%, rgb(var(--acc-600)) 45%, rgb(var(--acc-900)) 100%)' }}>
            <div className="w-10 h-1 bg-white/50 rounded-full mx-auto pt-0 absolute top-3 left-1/2 -translate-x-1/2" />
            <button type="button" onClick={onClose} aria-label="Cerrar" className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/25 backdrop-blur flex items-center justify-center">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {!view && !error && <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 text-emerald-500 animate-spin" /></div>}
          {error && !view && <p className="px-6 py-12 text-center text-sm text-stone-500">{error}</p>}

          {view && (
            <div className="px-5 pb-8">
              <div className="relative z-10 -mt-12 flex items-end justify-between gap-3">
                <span className="rounded-full p-1 bg-[var(--app-bg)]"><Avatar name={view.name} url={view.avatarUrl} size={92} /></span>
                <button type="button" onClick={() => !view.isDemo && onOpenFriends?.()} className="mb-2 text-right">
                  <span className="block text-lg font-bold tabular-nums text-stone-900 dark:text-white leading-none">{fmt(view.friendsCount)}</span>
                  <span className="text-xs text-stone-500">{view.friendsCount === 1 ? 'amigo' : 'amigos'}</span>
                </button>
              </div>
              <h2 className="mt-2 text-2xl font-bold text-stone-900 dark:text-white leading-tight">{view.name}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-stone-500">
                <span className="inline-flex items-center gap-1">{view.isPublic ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}{view.isPublic ? 'Perfil público' : 'Perfil privado'}</span>
                {s?.memberSince && <span>· En Fit K desde {new Date(s.memberSince).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>}
                {view.isDemo && <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold">Perfil de ejemplo</span>}
              </div>
              {view.bio && !editing && <p className="mt-3 text-[15px] leading-snug text-stone-700 dark:text-stone-200">{view.bio}</p>}

              {/* Acciones */}
              <div className="mt-4 flex gap-2">
                {view.isMe ? (
                  !editing && (
                    <button type="button" onClick={() => { setBio(view.bio ?? ''); setIsPublic(view.isPublic); setEditing(true); }}
                      className="flex-1 h-10 rounded-full bg-[rgba(118,118,128,0.12)] text-sm font-semibold text-stone-800 dark:text-white flex items-center justify-center gap-1.5">
                      <Pencil className="w-4 h-4" /> Editar perfil
                    </button>
                  )
                ) : !view.isDemo && <FriendButton state={view.friendship} busy={busy} onAction={friendAction} />}
                {view.isMe && !editing && onOpenFriends && (
                  <button type="button" onClick={onOpenFriends} className="h-10 px-4 rounded-full bg-[rgba(118,118,128,0.12)] text-sm font-semibold text-stone-800 dark:text-white flex items-center gap-1.5">
                    <Users className="w-4 h-4" /> Amigos
                  </button>
                )}
              </div>
              {error && view && <p className="mt-2 text-xs text-red-500">{error}</p>}

              {/* Edición de tu perfil */}
              <AnimatePresence initial={false}>
                {editing && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="mt-1 space-y-3 rounded-2xl bg-[rgba(118,118,128,0.08)] p-3.5">
                      <label className="block">
                        <span className="flex justify-between text-[11px] text-stone-500 mb-1"><span>Sobre ti</span><span className="tabular-nums">{bio.length}/160</span></span>
                        <textarea id="profile-bio" value={bio} rows={3} maxLength={160} onChange={e => setBio(e.target.value)} placeholder="Qué entrenas, qué te motiva, tu objetivo…"
                          className="bare-input w-full rounded-xl bg-white/70 dark:bg-white/10 px-3 py-2.5 text-[15px] text-stone-900 dark:text-white outline-none resize-none focus:ring-4 focus:ring-emerald-500/15" />
                      </label>
                      <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[rgba(118,118,128,0.12)]">
                        {([[true, 'Público', Globe], [false, 'Privado', Lock]] as const).map(([v, l, Icon]) => (
                          <button key={l} type="button" aria-pressed={isPublic === v} onClick={() => setIsPublic(v)}
                            className={`h-9 rounded-lg text-[13px] font-semibold flex items-center justify-center gap-1.5 ${isPublic === v ? 'bg-[#fff] dark:bg-[#48484a] text-stone-900 dark:text-white shadow-sm' : 'text-stone-500'}`}>
                            <Icon className="w-4 h-4" /> {l}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-stone-500">{isPublic ? 'Cualquiera de la Comunidad puede ver tus estadísticas, logros y publicaciones.' : 'Solo tus amigos verán tus estadísticas y logros. Los demás verán tu nombre y foto.'}</p>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setEditing(false)} className="flex-1 h-10 rounded-full bg-[rgba(118,118,128,0.12)] text-sm font-semibold text-stone-700 dark:text-white">Cancelar</button>
                        <button type="button" onClick={saveProfile} disabled={saving} className="flex-1 h-10 rounded-full bg-emerald-500 text-white text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-60">
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Guardar
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!view.canView ? (
                <div className="mt-6 rounded-3xl bg-[rgba(118,118,128,0.08)] p-6 text-center">
                  <span className="w-12 h-12 rounded-2xl bg-[rgba(118,118,128,0.15)] mx-auto flex items-center justify-center mb-3"><Lock className="w-6 h-6 text-stone-500" /></span>
                  <p className="font-semibold text-stone-900 dark:text-white">Este perfil es privado</p>
                  <p className="text-sm text-stone-500 mt-1">
                    {view.friendship === 'outgoing' ? 'Cuando acepte tu solicitud podrás ver sus estadísticas y logros.' : 'Envía una solicitud de amistad para ver sus estadísticas y logros.'}
                  </p>
                </div>
              ) : s && (
                <>
                  {/* Estadísticas */}
                  <section className="mt-6" aria-label="Estadísticas">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500 mb-2">Estadísticas</p>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        [Dumbbell, fmt(s.totalSessions), 'entrenos'],
                        [Timer, s.totalMinutes >= 120 ? `${fmt(Math.round(s.totalMinutes / 60))} h` : `${fmt(s.totalMinutes)} min`, 'entrenando'],
                        [Flame, fmt(s.weekStreak), s.weekStreak === 1 ? 'semana seguida' : 'semanas seguidas'],
                        [CalendarDays, fmt(s.monthSessions), 'este mes'],
                        [BarChart2, s.totalVolumeKg >= 1000 ? `${(s.totalVolumeKg / 1000).toLocaleString('es-ES', { maximumFractionDigits: 1 })} t` : `${fmt(s.totalVolumeKg)} kg`, 'movidos'],
                        [Heart, fmt(s.reactionsReceived), 'reacciones'],
                      ] as const).map(([Icon, v, l]) => (
                        <div key={l} className="glass-card rounded-2xl p-3">
                          <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <p className="mt-1.5 text-xl font-bold tabular-nums text-stone-900 dark:text-white leading-none">{v}</p>
                          <p className="text-[11px] text-stone-500 mt-1 leading-tight">{l}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {view.lifts && view.lifts.length > 0 && (
                    <section className="mt-5" aria-label="Mejores marcas">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500 mb-2">Mejores marcas</p>
                      <div className="glass-card rounded-2xl divide-y divide-black/5 dark:divide-white/10">
                        {view.lifts.map((l, i) => (
                          <div key={l.name} className="flex items-center gap-3 px-3.5 py-2.5">
                            <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm" style={{ background: ['#fde68a', '#e5e7eb', '#fed7aa'][i] }}>{['🥇', '🥈', '🥉'][i]}</span>
                            <span className="flex-1 min-w-0 text-sm font-medium text-stone-800 dark:text-stone-100 truncate first-letter:uppercase">{l.name}</span>
                            <span className="text-sm font-bold tabular-nums text-stone-900 dark:text-white">{l.kg.toLocaleString('es-ES', { maximumFractionDigits: 1 })} kg</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  <section className="mt-5" aria-label="Logros">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500 mb-2 flex items-center gap-1"><Trophy className="w-3 h-3" /> Logros · {badgesFor(s, notes, workouts).filter(b => b.on).length}/{badgesFor(s, notes, workouts).length}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {badgesFor(s, notes, workouts).map(b => (
                        <div key={b.id} className={`rounded-2xl p-2.5 text-center ${b.on ? 'bg-emerald-500/10 ring-1 ring-emerald-500/30' : 'bg-[rgba(118,118,128,0.08)] opacity-50'}`}>
                          <span className={`text-2xl ${b.on ? '' : 'grayscale'}`}>{b.emoji}</span>
                          <p className="text-[11px] font-semibold text-stone-800 dark:text-stone-100 leading-tight mt-1">{b.label}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {view.posts && view.posts.length > 0 && (
                    <section className="mt-5" aria-label="Publicaciones">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500 mb-2">Publicaciones · {s.posts}</p>
                      <div className="grid grid-cols-3 gap-1.5">
                        {view.posts.map(p => (
                          <div key={p.id} className="aspect-[4/5] rounded-xl overflow-hidden relative" style={p.photoUrl ? undefined : { background: 'radial-gradient(120% 100% at 100% 0%, rgb(var(--acc-500)), rgb(var(--acc-900)))' }}>
                            {p.photoUrl
                              ? <img src={p.photoUrl} alt={p.workoutName || 'Publicación'} loading="lazy" className="w-full h-full object-cover" />
                              : <div className="p-2 h-full flex flex-col text-white"><Quote className="w-3.5 h-3.5 opacity-80" /><p className="mt-1 text-[10px] leading-snug line-clamp-6">{p.content || p.workoutName}</p></div>}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function FriendsSheet({ onClose, onOpenProfile, onChanged }: { onClose: () => void; onOpenProfile: (userId: string) => void; onChanged?: (incoming: number) => void }) {
  const [tab, setTab] = useState<'incoming' | 'friends' | 'outgoing'>('incoming');
  const [list, setList] = useState<FriendsList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = () => fetch('/api/community/friends').then(async r => {
    const j = await r.json();
    if (!r.ok || !j.data) { setError(j.error ?? 'No se han podido cargar tus amigos.'); return; }
    setList(j.data); onChanged?.(j.data.incoming.length);
    setTab(t => (t === 'incoming' && j.data.incoming.length === 0 ? 'friends' : t));
  }).catch(() => setError('Sin conexión. Inténtalo de nuevo.'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  async function act(userId: string, action: 'accept' | 'decline' | 'cancel') {
    setBusy(userId);
    await fetch('/api/community/friends', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, action }) }).catch(() => {});
    await load(); setBusy(null);
  }

  const items = list ? list[tab] : [];
  const counts = { incoming: list?.incoming.length ?? 0, friends: list?.friends.length ?? 0, outgoing: list?.outgoing.length ?? 0 };
  const empty = { incoming: 'No tienes solicitudes pendientes.', friends: 'Aún no tienes amigos en Fit K. Toca a alguien en el feed para ver su perfil y añadirle.', outgoing: 'No has enviado solicitudes.' }[tab];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[86] bg-black/40 flex items-end justify-center" onClick={onClose}>
      <motion.div role="dialog" aria-label="Amigos" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="glass-modal w-full max-w-md rounded-t-3xl max-h-[88dvh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-stone-300 dark:bg-white/20 rounded-full mx-auto mt-3 flex-shrink-0" />
        <div className="px-5 pt-3 pb-3 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-bold text-stone-900 dark:text-white">Amigos</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="w-9 h-9 rounded-full bg-[rgba(118,118,128,0.12)] flex items-center justify-center"><X className="w-5 h-5 text-stone-600 dark:text-white/70" /></button>
        </div>
        <div className="px-5 pb-3 flex-shrink-0">
          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[rgba(118,118,128,0.12)]" role="tablist">
            {([['incoming', 'Solicitudes'], ['friends', 'Amigos'], ['outgoing', 'Enviadas']] as const).map(([id, l]) => (
              <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
                className={`h-8 rounded-lg text-[12px] font-semibold ${tab === id ? 'bg-[#fff] dark:bg-[#48484a] text-stone-900 dark:text-white shadow-sm' : 'text-stone-500'}`}>
                {l}{counts[id] > 0 && <span className={`ml-1 tabular-nums ${id === 'incoming' ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>{counts[id]}</span>}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-8">
          {!list && !error && <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /></div>}
          {error && <p className="px-3 py-10 text-center text-sm text-stone-500">{error}</p>}
          {list && items.length === 0 && <p className="px-3 py-10 text-center text-sm text-stone-500">{empty}</p>}
          {items.map(f => (
            <div key={f.userId} className="flex items-center gap-3 px-2 py-2 rounded-2xl">
              <button type="button" onClick={() => onOpenProfile(f.userId)} className="flex-1 min-w-0 flex items-center gap-3 text-left">
                <Avatar name={f.name} url={f.avatarUrl} size={44} />
                <span className="min-w-0">
                  <span className="block font-semibold text-stone-900 dark:text-white truncate">{f.name}</span>
                  <span className="block text-xs text-stone-500">{tab === 'friends' ? `Amigos desde ${new Date(f.since).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}` : tab === 'incoming' ? 'Quiere ser tu amigo' : 'Pendiente de respuesta'}</span>
                </span>
              </button>
              {busy === f.userId ? <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" /> : tab === 'incoming' ? (
                <div className="flex gap-1.5">
                  <button type="button" onClick={() => act(f.userId, 'accept')} className="h-8 px-3 rounded-full bg-emerald-500 text-white text-xs font-semibold">Aceptar</button>
                  <button type="button" onClick={() => act(f.userId, 'decline')} aria-label={`Rechazar a ${f.name}`} className="w-8 h-8 rounded-full bg-[rgba(118,118,128,0.12)] flex items-center justify-center"><X className="w-4 h-4 text-stone-600 dark:text-white/70" /></button>
                </div>
              ) : tab === 'outgoing' ? (
                <button type="button" onClick={() => act(f.userId, 'cancel')} className="h-8 px-3 rounded-full bg-[rgba(118,118,128,0.12)] text-xs font-semibold text-stone-700 dark:text-white">Retirar</button>
              ) : <ChevronRight className="w-4 h-4 text-stone-300" />}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
