'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { useScrollLock } from '@/hooks/useScrollLock';
import { BottomNav } from '@/components/ui/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Send,
  Sparkles,
  X,
  PenLine,
  Loader2,
  MoreVertical,
  Trash2,
  Flag,
  EyeOff,
  Pencil,
  Check,
  Image as ImageIcon,
  ChevronRight,
  ZoomIn,
  Plus,
  TrendingUp,
  Share2,
  Search,
  AtSign,
  User,
} from 'lucide-react';

const COMM_NOTIF_KEY = 'fitk-comm-notif';

// ─── Helper: renderizar @menciones en comentarios ─────────────────
function renderWithMentions(text: string): React.ReactNode {
  const parts = text.split(/(@\w+)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^@\w+/.test(part)
          ? <span key={i} className="text-emerald-600 dark:text-emerald-400 font-semibold">{part}</span>
          : <React.Fragment key={i}>{part}</React.Fragment>
      )}
    </>
  );
}
import type { CommunityPost, CommunityComment, CommunityReactionType, CommunityFilter } from '@/types/user';
import { getDailyTheme, getWeeklyChallenge, getDemoPosts, computeBadges } from '@/lib/communityDemo';

// ─── Reaction config ──────────────────────────────────────────────
const REACTIONS: { id: CommunityReactionType; emoji: string; label: string }[] = [
  { id: 'identify', emoji: '❤️', label: 'Me identifico' },
  { id: 'bravo', emoji: '👏', label: 'Bien hecho' },
  { id: 'keep-going', emoji: '💪', label: 'A seguir' },
  { id: 'fire', emoji: '🔥', label: 'Buena sesión' },
  { id: 'same', emoji: '🤝', label: 'A mí también' },
];

const QUICK_REPLIES = [
  'A mí también me pasó.',
  'Bien hecho.',
  'Sigue así.',
  'Gracias por compartirlo.',
  'Me identifico mucho.',
  'Yo estaba igual al principio.',
];

// ─── Helpers ──────────────────────────────────────────────────────
function reactionMessage(count: number, isOwner: boolean): string | null {
  if (!isOwner || count === 0) return null;
  if (count <= 2) return 'Algunas personas se han identificado con tu publicación.';
  if (count <= 5) return 'Varias personas se han identificado con tu nota.';
  if (count <= 10) return 'Tu experiencia ha ayudado a otras personas.';
  return 'Lo que has compartido ha conectado con la comunidad.';
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  return `hace ${Math.floor(hrs / 24)}d`;
}

// ─── Visor de imagen a pantalla completa ─────────────────────────
function ImageViewer({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black flex items-center justify-center"
      onClick={onClose}
    >
      <button onClick={onClose} className="absolute top-5 right-5 p-2 bg-white/10 rounded-full text-white z-10">
        <X className="w-5 h-5" />
      </button>
      <img
        src={url}
        alt="post"
        className="max-w-full max-h-full object-contain"
        onClick={e => e.stopPropagation()}
      />
    </motion.div>
  );
}

// ─── Mini-preview de tarjeta 9:16 para el compositor ─────────────
function NoteCardMini({ content, userPhotoUrl, userName }: { content: string; userPhotoUrl?: string; userName: string }) {
  const dateStr = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  const bgPhoto = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=711&fit=crop&auto=format&q=80';
  return (
    <div style={{ width: '100%', aspectRatio: '400/711', position: 'relative', overflow: 'hidden', borderRadius: 16, flexShrink: 0 }}>
      <img src={userPhotoUrl || bgPhoto} alt="bg" crossOrigin="anonymous"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '72%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, height: '72%', background: 'linear-gradient(to bottom,rgba(0,0,0,.25),rgba(0,0,0,.7))' }} />
      <div style={{ position: 'absolute', top: 16, left: 16, color: '#22d3ee', fontSize: 24, fontWeight: 900, letterSpacing: -1 }}>K</div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '31%', background: '#f5f0e8', padding: '14px 18px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
            <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: 2, color: '#78716c', textTransform: 'uppercase' }}>Reflexión del día</span>
            <span style={{ fontSize: 12, color: '#22d3ee' }}>❝</span>
          </div>
          <p style={{ fontStyle: 'italic', fontSize: 12, lineHeight: 1.6, color: '#1c1917', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {content || 'Tu reflexión aparecerá aquí…'}
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <span style={{ fontSize: 8, color: '#a8a29e', letterSpacing: 1 }}>{dateStr}</span>
          <span style={{ fontSize: 14, fontWeight: 900, color: '#22d3ee' }}>K</span>
        </div>
      </div>
    </div>
  );
}

function WorkoutCardMini({ content, userPhotoUrl, stats, note }: { content: string; userPhotoUrl?: string; stats?: { minutes: number; exercises: number }; note?: string }) {
  return (
    <div style={{ width: '100%', aspectRatio: '400/711', position: 'relative', overflow: 'hidden', borderRadius: 16, background: '#0a0a0a', flexShrink: 0 }}>
      {userPhotoUrl ? (
        <img src={userPhotoUrl} alt="workout" crossOrigin="anonymous"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '65%', objectFit: 'cover' }} />
      ) : (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '65%', background: 'linear-gradient(135deg,#0a0a0a 0%,#0e7490 60%,#22d3ee 100%)' }} />
      )}
      {userPhotoUrl && (
        <div style={{ position: 'absolute', inset: 0, height: '65%', background: 'linear-gradient(to bottom,rgba(0,0,0,.15),rgba(10,10,10,.95))' }} />
      )}
      <div style={{ position: 'absolute', top: 16, left: 16, color: '#22d3ee', fontSize: 24, fontWeight: 900 }}>K</div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '38%', background: '#111', padding: '14px 18px 18px' }}>
        <p style={{ fontSize: 8, letterSpacing: 2, color: '#6b7280', textTransform: 'uppercase', marginBottom: 4 }}>Resumen del entreno</p>
        <p style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 8, lineHeight: 1.1 }}>{content || 'Entrenamiento'}</p>
        <div style={{ height: 2, borderRadius: 2, background: 'linear-gradient(to right,#22d3ee,#3b82f6)', marginBottom: 10 }} />
        {stats && (
          <div style={{ display: 'flex', gap: 20, marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{stats.minutes}</span>
              <span style={{ fontSize: 8, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 }}>min</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{stats.exercises}</span>
              <span style={{ fontSize: 8, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 }}>ejerc.</span>
            </div>
          </div>
        )}
        {note && (
          <div style={{ background: '#1c1c1e', borderRadius: 12, padding: '5px 10px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 10, color: '#6b7280' }}>💬</span>
            <span style={{ fontSize: 10, color: '#e5e7eb', fontStyle: 'italic' }}>{note}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Template 1: Note card ───────────────────────────────────────
function NoteCard({ post, onImageClick }: { post: CommunityPost; onImageClick?: (url: string) => void }) {
  const dateStr = new Date(post.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).toUpperCase();

  return (
    <div
      style={{ width: '100%', aspectRatio: '4/5', maxHeight: 360, position: 'relative', overflow: 'hidden', borderRadius: 20 }}
      onClick={post.photoUrl ? () => onImageClick?.(post.photoUrl!) : undefined}
      className={post.photoUrl ? 'cursor-zoom-in group' : undefined}
    >
      {/* ── Fondo: foto o gradiente ── */}
      {post.photoUrl ? (
        <>
          <img
            src={post.photoUrl} alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '72%', objectFit: 'cover' }}
          />
          {/* Overlay oscuro sobre la foto */}
          <div style={{ position: 'absolute', inset: 0, height: '72%', background: 'linear-gradient(to bottom,rgba(0,0,0,.18),rgba(0,0,0,.72))' }} />
          {/* Botón zoom hover */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full p-1.5 z-10">
            <ZoomIn className="w-4 h-4 text-white" />
          </div>
        </>
      ) : (
        <>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(145deg, #064e3b 0%, #0f766e 50%, #0891b2 100%)' }} />
          <div style={{ position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'absolute', bottom: '38%', left: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        </>
      )}

      {/* ── Avatar + nombre (solo si hay foto) ── */}
      {post.photoUrl && (
        <div style={{ position: 'absolute', top: 14, left: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#22d3ee,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.5)' }}>
            <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>{post.displayName.charAt(0).toUpperCase()}</span>
          </div>
          <span style={{ color: '#fff', fontSize: 11, fontWeight: 600, textShadow: '0 1px 4px rgba(0,0,0,.6)' }}>{post.displayName.split(' ')[0]}</span>
        </div>
      )}

      {/* ── K logo (sin foto: top-left) ── */}
      {!post.photoUrl && (
        <div style={{ position: 'absolute', top: 16, left: 18, color: '#22d3ee', fontSize: 22, fontWeight: 900, letterSpacing: -1 }}>K</div>
      )}

      {/* ── Tag REFLEXIÓN ── */}
      <div style={{ position: 'absolute', top: post.photoUrl ? 14 : 14, right: 16, background: 'rgba(34,211,238,0.18)', backdropFilter: 'blur(8px)', borderRadius: 20, padding: '3px 10px' }}>
        <span style={{ color: '#6ee7b7', fontSize: 9, letterSpacing: 1.5, fontWeight: 700 }}>REFLEXIÓN</span>
      </div>

      {/* ── Sección crema inferior ── */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: post.photoUrl ? '30%' : '44%', background: '#f5f0e8', padding: '12px 18px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ color: '#22d3ee', fontSize: 22, lineHeight: 1, marginBottom: 4, fontStyle: 'italic', fontWeight: 900 }}>"</div>
          <p style={{ fontStyle: 'italic', fontSize: post.photoUrl ? 12 : 13, lineHeight: 1.6, color: '#1c1917', display: '-webkit-box', WebkitLineClamp: post.photoUrl ? 2 : 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {post.content}
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
          <span style={{ fontSize: 9, color: '#a8a29e', letterSpacing: 1 }}>{dateStr}</span>
          <span style={{ fontSize: 11, fontWeight: 900, color: '#22d3ee' }}>Fit K</span>
        </div>
      </div>
    </div>
  );
}

// ─── Template 2: Workout card ────────────────────────────────────
function WorkoutCard({ post, onImageClick }: { post: CommunityPost; onImageClick?: (url: string) => void }) {
  const kcal = post.workoutDuration ? Math.round(post.workoutDuration * 7) : null;
  const bottomH = post.photoUrl ? '38%' : '49%';

  return (
    <div
      style={{ width: '100%', aspectRatio: '4/5', maxHeight: 360, position: 'relative', overflow: 'hidden', borderRadius: 20, background: '#0a0a0a' }}
      onClick={post.photoUrl ? () => onImageClick?.(post.photoUrl!) : undefined}
      className={post.photoUrl ? 'cursor-zoom-in group' : undefined}
    >
      {/* ── Fondo: foto o gradiente ── */}
      {post.photoUrl ? (
        <>
          <img
            src={post.photoUrl} alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '65%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', inset: 0, height: '65%', background: 'linear-gradient(to bottom,rgba(10,10,10,.15),rgba(10,10,10,.95))' }} />
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full p-1.5 z-10">
            <ZoomIn className="w-4 h-4 text-white" />
          </div>
        </>
      ) : (
        <>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '55%', background: 'linear-gradient(135deg, #0a0a0a 0%, #0e7490 55%, #22d3ee 100%)' }} />
          <div style={{ position: 'absolute', top: -25, right: -25, width: 110, height: 110, borderRadius: '50%', background: 'rgba(34,211,238,0.1)' }} />
        </>
      )}

      {/* ── Avatar + nombre (con foto) ── */}
      {post.photoUrl && (
        <div style={{ position: 'absolute', top: 14, left: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#22d3ee,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.4)' }}>
            <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>{post.displayName.charAt(0).toUpperCase()}</span>
          </div>
          <span style={{ color: '#fff', fontSize: 11, fontWeight: 600, textShadow: '0 1px 4px rgba(0,0,0,.8)' }}>{post.displayName.split(' ')[0]}</span>
        </div>
      )}

      {/* ── K logo (sin foto) ── */}
      {!post.photoUrl && (
        <div style={{ position: 'absolute', top: 16, left: 18, color: '#22d3ee', fontSize: 22, fontWeight: 900 }}>K</div>
      )}

      {/* ── Tag ENTRENO ── */}
      <div style={{ position: 'absolute', top: 14, right: 16, background: 'rgba(34,211,238,0.18)', backdropFilter: 'blur(8px)', borderRadius: 20, padding: '3px 10px' }}>
        <span style={{ color: '#22d3ee', fontSize: 9, letterSpacing: 1.5, fontWeight: 700 }}>ENTRENO</span>
      </div>

      {/* ── Sección oscura inferior ── */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: bottomH, background: 'linear-gradient(to bottom, #0f0f0f, #111)', padding: '13px 18px 16px' }}>
        <p style={{ fontSize: 9, letterSpacing: 2, color: '#6b7280', textTransform: 'uppercase', marginBottom: 3 }}>Resumen del entreno</p>
        <p style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 7, lineHeight: 1.15, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {post.workoutName}
        </p>
        <div style={{ height: 2, borderRadius: 2, background: 'linear-gradient(to right, #22d3ee, #3b82f6)', marginBottom: 9 }} />
        <div style={{ display: 'flex', gap: 20, marginBottom: 8 }}>
          {post.workoutDuration && (
            <div>
              <span style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>{post.workoutDuration}</span>
              <span style={{ fontSize: 9, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginLeft: 3 }}>min</span>
            </div>
          )}
          {post.workoutExercises && (
            <div>
              <span style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>{post.workoutExercises}</span>
              <span style={{ fontSize: 9, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginLeft: 3 }}>ejerc.</span>
            </div>
          )}
          {kcal && (
            <div>
              <span style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>~{kcal}</span>
              <span style={{ fontSize: 9, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginLeft: 3 }}>kcal</span>
            </div>
          )}
        </div>
        {post.content && (
          <div style={{ background: '#1c1c1e', borderRadius: 10, padding: '4px 10px', display: 'inline-flex' }}>
            <span style={{ fontSize: 11, color: '#9ca3af', fontStyle: 'italic' }}>"{post.content}"</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Stories strip ───────────────────────────────────────────────
const STORY_GRADIENTS = [
  'from-emerald-400 to-teal-500',
  'from-purple-400 to-pink-500',
  'from-amber-400 to-orange-500',
  'from-blue-400 to-sky-500',
  'from-rose-400 to-pink-500',
  'from-indigo-400 to-violet-500',
];

function StoriesStrip({ posts, currentUserId, userName, onCreateNote, onScrollToPost }: {
  posts: CommunityPost[];
  currentUserId: string;
  userName: string;
  onCreateNote: () => void;
  onScrollToPost: (postId: string) => void;
}) {
  const recentPosters = useMemo(() => {
    const seen = new Set<string>();
    return posts
      .filter(p => p.userId !== currentUserId)
      .filter(p => { if (seen.has(p.userId)) return false; seen.add(p.userId); return true; })
      .slice(0, 5);
  }, [posts, currentUserId]);

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {/* Mi historia / Añadir */}
      <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
        <button onClick={onCreateNote} className="relative w-14 h-14">
          <div className="w-full h-full rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center border-2 border-dashed border-stone-300 dark:border-stone-600">
            <span className="text-base font-black text-stone-500 dark:text-stone-400">{userName.charAt(0).toUpperCase()}</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white dark:border-black shadow">
            <Plus className="w-3 h-3 text-white" />
          </div>
        </button>
        <span className="text-[9px] text-stone-400 text-center w-14 truncate">Añadir</span>
      </div>

      {/* Usuarios recientes */}
      {recentPosters.map((post, idx) => {
        const isNew = Date.now() - new Date(post.createdAt).getTime() < 24 * 3_600_000;
        const grad = STORY_GRADIENTS[idx % STORY_GRADIENTS.length];
        return (
          <div key={post.userId} className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => onScrollToPost(post.id)}
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center p-0.5 ${isNew ? 'shadow-lg shadow-emerald-200 dark:shadow-emerald-900' : ''}`}
            >
              <div className="w-full h-full rounded-[14px] bg-white dark:bg-zinc-900 flex items-center justify-center overflow-hidden">
                {post.avatarUrl
                  ? <img src={post.avatarUrl} alt="" className="w-full h-full object-cover" />
                  : <span className="text-base font-black text-stone-700 dark:text-stone-200">{post.displayName.charAt(0).toUpperCase()}</span>
                }
              </div>
            </button>
            <span className="text-[9px] text-stone-400 text-center w-14 truncate">{post.displayName.split(' ')[0]}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Post destacado de la semana ──────────────────────────────────
function HotPostBanner({ post, onScrollToPost }: { post: CommunityPost; onScrollToPost: (id: string) => void }) {
  if (post.reactionCount < 5) return null;
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      onClick={() => onScrollToPost(post.id)}
      className="w-full text-left rounded-2xl overflow-hidden relative"
      style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}
    >
      <div className="absolute inset-0 opacity-20" style={{ background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
      <div className="relative px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-xs font-bold text-white/90 uppercase tracking-wide">Más caliente esta semana</span>
            <span className="text-sm">🔥</span>
          </div>
          <p className="text-white text-sm font-medium truncate">
            {post.type === 'workout' ? post.workoutName : post.content}
          </p>
          <p className="text-white/60 text-xs">{post.displayName.split(' ')[0]} · {post.reactionCount} reacciones</p>
        </div>
        <ChevronRight className="w-4 h-4 text-white/60 flex-shrink-0" />
      </div>
    </motion.button>
  );
}

// ─── Post menu (three-dot) ────────────────────────────────────────
function PostMenu({
  isOwner,
  canEdit,
  onEdit,
  onDelete,
  onReport,
  onHide,
}: {
  isOwner: boolean;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
  onHide: () => void;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        aria-label="Opciones"
      >
        <MoreVertical className="w-4 h-4 text-stone-400" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={close} />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -4 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 top-9 z-50 glass-modal rounded-2xl py-1.5 w-44 overflow-hidden"
            >
              {isOwner ? (
                <>
                  {canEdit && (
                    <button onClick={() => { onEdit(); close(); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                      <Pencil className="w-4 h-4 text-stone-400" /> Editar
                    </button>
                  )}
                  <button onClick={() => { onDelete(); close(); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors">
                    <Trash2 className="w-4 h-4" /> Eliminar
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => { onHide(); close(); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                    <EyeOff className="w-4 h-4 text-stone-400" /> Ocultar
                  </button>
                  <button onClick={() => { onReport(); close(); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors">
                    <Flag className="w-4 h-4" /> Reportar
                  </button>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Single post card ─────────────────────────────────────────────
function PostCard({
  post,
  currentUserId,
  currentUserName,
  onReact,
  onComment,
  onRequestDelete,
  onEdit,
  onReport,
  onHide,
  onImageClick,
  onShare,
}: {
  post: CommunityPost;
  currentUserId: string;
  currentUserName: string;
  onReact: (postId: string, reaction: CommunityReactionType) => Promise<void> | void;
  onComment: (postId: string, content: string) => Promise<void> | void;
  onRequestDelete: (post: CommunityPost) => void;
  onEdit: (postId: string, content: string) => Promise<void> | void;
  onReport: (post: CommunityPost) => void;
  onHide: (postId: string) => void;
  onImageClick?: (url: string) => void;
  onShare: (post: CommunityPost) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [allComments, setAllComments] = useState<CommunityComment[]>(post.comments || []);
  const [commentText, setCommentText] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [loadingComment, setLoadingComment] = useState(false);
  const [reacting, setReacting] = useState(false);
  const [floaters, setFloaters] = useState<{ id: number; emoji: string }[]>([]);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(post.content || '');
  const [mentionSuggestions, setMentionSuggestions] = useState<string[]>([]);
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const isOwner = post.userId === currentUserId;
  const humanMsg = reactionMessage(post.reactionCount, isOwner);

  // Nombres conocidos para @menciones
  const knownNames = useMemo(() => {
    const names = new Set<string>();
    allComments.forEach(c => names.add(c.displayName.split(' ')[0]));
    names.add(post.displayName.split(' ')[0]);
    return Array.from(names).filter(n => n !== currentUserName.split(' ')[0]);
  }, [allComments, post.displayName, currentUserName]);

  function handleCommentInput(text: string) {
    setCommentText(text.slice(0, 150));
    const atIdx = text.lastIndexOf('@');
    if (atIdx !== -1 && !text.slice(atIdx).includes(' ')) {
      const query = text.slice(atIdx + 1).toLowerCase();
      setMentionStart(atIdx);
      setMentionSuggestions(knownNames.filter(n => n.toLowerCase().startsWith(query)));
    } else {
      setMentionStart(null);
      setMentionSuggestions([]);
    }
  }

  function selectMention(name: string) {
    if (mentionStart === null) return;
    const query = commentText.slice(mentionStart + 1).match(/^\w*/)?.[0] ?? '';
    const before = commentText.slice(0, mentionStart);
    const after = commentText.slice(mentionStart + 1 + query.length);
    setCommentText(`${before}@${name} ${after}`);
    setMentionStart(null);
    setMentionSuggestions([]);
  }

  async function handleLoadAllComments() {
    if (showComments) { setShowComments(false); return; }
    setShowComments(true);
    if (!post.isDemo && allComments.length < post.commentCount) {
      const res = await fetch(`/api/community/comments?postId=${post.id}`);
      const data = await res.json();
      if (data.data) setAllComments(data.data);
    }
  }

  async function handleSendComment(text: string) {
    if (!text.trim() || loadingComment) return;
    setLoadingComment(true);
    await onComment(post.id, text);
    const newComment: CommunityComment = {
      id: `local-${Date.now()}`,
      postId: post.id,
      userId: currentUserId,
      displayName: currentUserName,
      content: text.trim(),
      createdAt: new Date().toISOString(),
    };
    setAllComments(prev => [...prev, newComment]);
    setCommentText('');
    setShowInput(false);
    setLoadingComment(false);
  }

  async function handleReact(reaction: CommunityReactionType) {
    if (reacting) return;
    // Floating emoji solo cuando se añade (no al quitar)
    if (post.myReaction !== reaction) {
      const emoji = REACTIONS.find(r => r.id === reaction)?.emoji || '❤️';
      const id = Date.now() + Math.random();
      setFloaters(f => [...f, { id, emoji }]);
      setTimeout(() => setFloaters(f => f.filter(x => x.id !== id)), 900);
    }
    setReacting(true);
    await onReact(post.id, reaction);
    setReacting(false);
  }

  async function handleSaveEdit() {
    await onEdit(post.id, editText);
    setEditing(false);
  }

  const visibleComments = showComments ? allComments : allComments.slice(0, 3);

  return (
    <Card className="bg-white dark:bg-[#111111] border border-stone-100 dark:border-stone-800/60 rounded-3xl shadow-sm overflow-visible">
      {/* Author */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
        {/* Avatar con anillo de color según tipo */}
        <div className={`p-0.5 rounded-2xl flex-shrink-0 bg-gradient-to-br ${post.type === 'note' ? 'from-purple-400 to-pink-400' : 'from-emerald-400 to-teal-500'}`}>
          <div className="w-8 h-8 rounded-[14px] bg-white dark:bg-[#111] overflow-hidden flex items-center justify-center">
            {post.avatarUrl ? (
              <img src={post.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className={`font-bold text-sm ${post.type === 'note' ? 'text-purple-500' : 'text-emerald-600'}`}>
                {post.displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-stone-900 dark:text-stone-100 text-sm truncate">{post.displayName.split(' ')[0]}</p>
            {post.milestone && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-medium flex-shrink-0">
                {post.milestone}
              </span>
            )}
          </div>
          <p className="text-stone-400 text-[11px]">{timeAgo(post.createdAt)}{isOwner ? ' · Tú' : ''}</p>
        </div>
        <PostMenu
          isOwner={isOwner}
          canEdit={post.type === 'note' || !!post.content}
          onEdit={() => { setEditText(post.content || ''); setEditing(true); }}
          onDelete={() => onRequestDelete(post)}
          onReport={() => onReport(post)}
          onHide={() => onHide(post.id)}
        />
      </div>

      {/* Inline edit */}
      {editing ? (
        <div className="px-4 pb-3 space-y-2">
          <textarea
            value={editText}
            onChange={e => setEditText(e.target.value.slice(0, 280))}
            rows={3}
            autoFocus
            className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-800 dark:text-stone-100 outline-none focus:border-emerald-400 resize-none"
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-sm text-stone-500 hover:text-stone-700 rounded-lg">Cancelar</button>
            <button onClick={handleSaveEdit} className="px-4 py-1.5 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors">Guardar</button>
          </div>
        </div>
      ) : (
        <div className="px-4 pb-3">
          {post.type === 'note'
            ? <NoteCard post={post} onImageClick={onImageClick} />
            : <WorkoutCard post={post} onImageClick={onImageClick} />
          }
        </div>
      )}

      {/* Reactions */}
      <div className="px-4 pb-3 relative">
        {/* Floating emojis */}
        <div className="pointer-events-none absolute left-6 -top-2 z-20">
          <AnimatePresence>
            {floaters.map(f => (
              <motion.span
                key={f.id}
                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                animate={{ opacity: 1, y: -46, scale: 1.4 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className="absolute text-2xl"
              >
                {f.emoji}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        {!isOwner && (
          <div className="flex gap-1.5 flex-wrap">
            {REACTIONS.map(r => {
              const isActive = post.myReaction === r.id;
              return (
                <motion.button
                  key={r.id}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => handleReact(r.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    isActive
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-emerald-300'
                  }`}
                  disabled={reacting}
                >
                  <span>{r.emoji}</span>
                  <span className="hidden sm:inline">{r.label}</span>
                </motion.button>
              );
            })}
          </div>
        )}
        {isOwner && humanMsg && <p className="text-stone-400 text-xs italic">{humanMsg}</p>}
        {isOwner && !humanMsg && post.reactionCount === 0 && (
          <p className="text-stone-300 text-xs italic">Aún nadie ha reaccionado. Está bien, tu camino es tuyo.</p>
        )}
        {/* Reaction count + share */}
        <div className="flex items-center justify-between mt-2">
          {post.reactionCount > 0 ? (
            <p className="text-stone-400 text-[11px]">
              {post.reactionCount} {post.reactionCount === 1 ? 'persona se ha identificado' : 'personas se han identificado'}
            </p>
          ) : <span />}
          <button
            onClick={() => onShare(post)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" /> Compartir
          </button>
        </div>
      </div>

      {/* Comments */}
      {(allComments.length > 0 || !isOwner) && (
        <div className="border-t border-stone-100 dark:border-stone-800 px-4 pt-3 pb-4 space-y-2">
          {visibleComments.map(c => (
            <div key={c.id} className="flex gap-2 items-start">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-stone-300 to-stone-400 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[9px] font-bold">{c.displayName.charAt(0).toUpperCase()}</span>
              </div>
              <div className="bg-stone-50 dark:bg-stone-800 rounded-xl px-3 py-1.5 flex-1">
                <span className="font-semibold text-stone-700 dark:text-stone-200 text-xs">{c.displayName.split(' ')[0]} </span>
                <span className="text-stone-600 dark:text-stone-300 text-xs">{renderWithMentions(c.content)}</span>
              </div>
            </div>
          ))}

          {post.commentCount > 3 && (
            <button onClick={handleLoadAllComments} className="text-xs text-stone-400 hover:text-emerald-600 flex items-center gap-1">
              {showComments ? <><ChevronUp className="w-3 h-3" /> Mostrar menos</> : <><ChevronDown className="w-3 h-3" /> Ver {post.commentCount - 3} comentarios más</>}
            </button>
          )}

          {!isOwner && (
            <>
              {!showInput ? (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {QUICK_REPLIES.slice(0, 4).map(q => (
                    <button
                      key={q}
                      onClick={() => handleSendComment(q)}
                      className="text-xs px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border border-stone-200 dark:border-stone-700"
                    >
                      {q}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowInput(true)}
                    className="text-xs px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border border-stone-200 dark:border-stone-700 flex items-center gap-1"
                  >
                    <PenLine className="w-3 h-3" /> Escribir
                  </button>
                </div>
              ) : (
                <div className="relative mt-1">
                  {/* Autocomplete de @menciones */}
                  {mentionSuggestions.length > 0 && (
                    <div className="absolute bottom-full mb-1 left-0 right-0 glass-modal rounded-xl py-1 shadow-lg z-10">
                      {mentionSuggestions.map(name => (
                        <button
                          key={name}
                          onMouseDown={e => { e.preventDefault(); selectMention(name); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-left"
                        >
                          <AtSign className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          <span className="text-stone-700 dark:text-stone-200">{name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={commentText}
                      onChange={e => handleCommentInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendComment(commentText)}
                      placeholder="Escribe un comentario... usa @nombre"
                      autoFocus
                      className="flex-1 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 outline-none focus:border-emerald-400 text-stone-800 dark:text-stone-100 placeholder-stone-400"
                    />
                    <button
                      onClick={() => handleSendComment(commentText)}
                      disabled={!commentText.trim() || loadingComment}
                      className="w-8 h-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-stone-200 dark:disabled:bg-stone-700 flex items-center justify-center transition-colors flex-shrink-0"
                    >
                      <Send className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Comment toggle for owners with comments */}
          {isOwner && allComments.length > 0 && (
            <div className="flex items-center gap-1.5 text-stone-400 text-xs pt-1">
              <MessageCircle className="w-3.5 h-3.5" />
              {allComments.length} {allComments.length === 1 ? 'respuesta' : 'respuestas'}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// ─── Compositor de Nota ─────────────────────────────────────────────────────
// Solo para notas. Cuando el usuario pulsa "Continuar", abre el ShareCardModal
// con opción de publicar en Comunidad desde dentro.
function CreatePostModal({
  userName,
  avatarUrl,
  promptText,
  onClose,
  onReadyToShare,
}: {
  userName: string;
  avatarUrl?: string;
  promptText?: string;
  onClose: () => void;
  onReadyToShare: (content: string, photoUrl?: string) => void;
}) {
  useScrollLock();
  const [content, setContent] = useState('');
  const [sharePhotoUrl, setSharePhotoUrl] = useState<string | undefined>();
  const isPosting = false; // se deja para no romper el botón disabled

  const NOTE_SUGGESTIONS = [
    'Hoy probé algo nuevo.',
    'Tenía pocas ganas pero fui.',
    'Hoy me sentí mejor de lo esperado.',
    'He aprendido algo nuevo hoy.',
  ];

  function handleContinue() {
    if (!content.trim()) return;
    onReadyToShare(content.trim(), sharePhotoUrl);
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center">
      <motion.div
        initial={{ y: 400 }}
        animate={{ y: 0 }}
        exit={{ y: 400 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="w-full max-w-md bg-white dark:bg-[#111111] rounded-t-3xl px-6 pt-4 pb-10"
      >
        <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mb-5" />
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-stone-900 text-lg">📝 Escribe tu reflexión</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 transition-colors">
            <X className="w-4 h-4 text-stone-600" />
          </button>
        </div>

        {promptText && (
          <div className="mb-4 flex items-start gap-2 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/40 px-4 py-3">
            <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <p className="text-emerald-700 dark:text-emerald-400 text-xs">{promptText}</p>
          </div>
        )}

        {/* Preview en vivo — tarjeta Stories 9:16 */}
        <div className="mb-4 w-2/5 mx-auto">
          <NoteCardMini content={content} userPhotoUrl={sharePhotoUrl} userName={userName} />
        </div>

        <div className="space-y-3">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value.slice(0, 280))}
            placeholder={promptText || '¿Qué quieres compartir con la comunidad?'}
            rows={3}
            autoFocus
            className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-stone-800 dark:text-stone-100 placeholder-stone-400 outline-none focus:border-emerald-400 text-sm resize-none"
          />
          <div className="flex flex-wrap gap-2">
            {NOTE_SUGGESTIONS.map(s => (
              <button key={s} onClick={() => setContent(s)}
                className="text-xs px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-emerald-50 hover:text-emerald-700 border border-stone-200 dark:border-stone-700 transition-colors">
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Foto para tarjeta */}
        <label className={`flex items-center gap-3 p-3 rounded-2xl border border-dashed cursor-pointer transition-colors mt-4 ${sharePhotoUrl ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 hover:border-stone-400'}`}>
          {sharePhotoUrl ? (
            <>
              <img src={sharePhotoUrl} alt="preview" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Foto añadida ✓</p>
                <p className="text-xs text-stone-400">Para la tarjeta de Instagram</p>
              </div>
              <button type="button" onClick={e => { e.preventDefault(); setSharePhotoUrl(undefined); }} className="text-stone-400 hover:text-stone-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-stone-200 dark:bg-stone-700 flex items-center justify-center flex-shrink-0">
                <ImageIcon className="w-5 h-5 text-stone-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">Añadir foto (opcional)</p>
                <p className="text-xs text-stone-400">Para la tarjeta de Instagram / WhatsApp</p>
              </div>
            </>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={e => {
            const file = e.target.files?.[0];
            if (file) setSharePhotoUrl(URL.createObjectURL(file));
          }} />
        </label>

        <Button
          onClick={handleContinue}
          disabled={!content.trim()}
          className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 mt-4 font-semibold"
        >
          Ver tarjeta y compartir →
        </Button>
      </motion.div>
    </div>
  );
}

// ─── Picker de entreno para compartir ────────────────────────────────────────
function WorkoutPickerModal({
  sessions,
  onPick,
  onClose,
}: {
  sessions: import('@/types/user').WeeklySession[];
  onPick: (s: import('@/types/user').WeeklySession) => void;
  onClose: () => void;
}) {
  useScrollLock();
  const completed = sessions.filter(s => s.status === 'completed');
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center">
      <motion.div
        initial={{ y: 400 }} animate={{ y: 0 }} exit={{ y: 400 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="w-full max-w-md bg-white dark:bg-[#111] rounded-t-3xl px-5 pt-4 pb-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mb-5" />
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-stone-900 dark:text-stone-100 text-lg">🏋️ Elige el entreno</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-stone-100 dark:bg-stone-800">
            <X className="w-4 h-4 text-stone-600 dark:text-stone-400" />
          </button>
        </div>
        {completed.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-stone-400 text-sm">Completa al menos un entrenamiento para compartirlo.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {completed.map(s => (
              <button
                key={s.id}
                onClick={() => onPick(s)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-stone-100 dark:border-stone-700 hover:border-emerald-200 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <Dumbbell className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-900 dark:text-stone-100 text-sm">{s.name}</p>
                  <p className="text-stone-400 text-xs">{s.duration} min · {s.exercises.length} ejercicios</p>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ─── Compositor de entreno con preview live de la tarjeta ─────────
function WorkoutComposeModal({
  session,
  userName,
  avatarUrl,
  onClose,
  onReadyToShare,
}: {
  session: import('@/types/user').WeeklySession;
  userName: string;
  avatarUrl?: string;
  onClose: () => void;
  onReadyToShare: (note: string, photoUrl?: string) => void;
}) {
  useScrollLock();
  const [note, setNote] = useState('');
  const [sharePhotoUrl, setSharePhotoUrl] = useState<string | undefined>();

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center">
      <motion.div
        initial={{ y: 400 }}
        animate={{ y: 0 }}
        exit={{ y: 400 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="w-full max-w-md bg-white dark:bg-[#111111] rounded-t-3xl px-6 pt-4 pb-10 max-h-[90vh] overflow-y-auto"
      >
        <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mb-4" />
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-stone-900 dark:text-stone-100 text-lg">🏋️ {session.name}</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 transition-colors">
            <X className="w-4 h-4 text-stone-600 dark:text-stone-400" />
          </button>
        </div>

        {/* Preview en vivo — tarjeta Stories 9:16 */}
        <div className="mb-4 w-2/5 mx-auto">
          <WorkoutCardMini
            content={session.name}
            userPhotoUrl={sharePhotoUrl}
            stats={{ minutes: session.duration, exercises: session.exercises.length }}
            note={note}
          />
        </div>

        {/* Nota opcional */}
        <div className="space-y-3">
          <textarea
            value={note}
            onChange={e => setNote(e.target.value.slice(0, 160))}
            placeholder="Añade una nota (opcional)…"
            rows={2}
            className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-stone-800 dark:text-stone-100 placeholder-stone-400 outline-none focus:border-emerald-400 text-sm resize-none"
          />
        </div>

        {/* Foto */}
        <label className={`flex items-center gap-3 p-3 rounded-2xl border border-dashed cursor-pointer transition-colors mt-3 ${sharePhotoUrl ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 hover:border-stone-400'}`}>
          {sharePhotoUrl ? (
            <>
              <img src={sharePhotoUrl} alt="preview" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Foto añadida ✓</p>
                <p className="text-xs text-stone-400">Para la tarjeta de Instagram</p>
              </div>
              <button type="button" onClick={e => { e.preventDefault(); setSharePhotoUrl(undefined); }} className="text-stone-400 hover:text-stone-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-stone-200 dark:bg-stone-700 flex items-center justify-center flex-shrink-0">
                <ImageIcon className="w-5 h-5 text-stone-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">Añadir foto (opcional)</p>
                <p className="text-xs text-stone-400">Aparecerá en la tarjeta</p>
              </div>
            </>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={e => {
            const file = e.target.files?.[0];
            if (file) setSharePhotoUrl(URL.createObjectURL(file));
          }} />
        </label>

        <Button
          onClick={() => onReadyToShare(note.trim(), sharePhotoUrl)}
          className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 mt-4 font-semibold"
        >
          Ver tarjeta y compartir →
        </Button>
      </motion.div>
    </div>
  );
}

// ─── Achievements strip ───────────────────────────────────────────
function AchievementsCard({ badges }: { badges: ReturnType<typeof computeBadges> }) {
  const unlocked = badges.filter(b => b.unlocked).length;
  return (
    <Card className="bg-white border-0 rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-semibold text-stone-900 text-sm">Tu rincón</p>
          <p className="text-stone-400 text-xs">Tu camino aquí · {unlocked}/{badges.length} logros</p>
        </div>
        <Sparkles className="w-5 h-5 text-emerald-400" />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {badges.map(b => (
          <div
            key={b.id}
            title={b.hint}
            className={`flex flex-col items-center gap-1 min-w-[64px] px-2 py-2.5 rounded-xl border transition-all ${
              b.unlocked
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                : 'bg-stone-50 dark:bg-stone-800/50 border-stone-200 dark:border-stone-700 opacity-60'
            }`}
          >
            <span className={`text-xl ${b.unlocked ? '' : 'grayscale'}`}>{b.emoji}</span>
            <span className={`text-[9px] text-center leading-tight font-medium ${b.unlocked ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-400'}`}>
              {b.label}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────
export function CommunityScreen() {
  const { user, supabaseUserId } = useApp();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createType, setCreateType] = useState<'note' | null>(null);
  const [composerPrompt, setComposerPrompt] = useState<string | undefined>(undefined);
  const [showWorkoutPicker, setShowWorkoutPicker] = useState(false);
  const [workoutCompose, setWorkoutCompose] = useState<{ session: import('@/types/user').WeeklySession } | null>(null);
  const [filter, setFilter] = useState<CommunityFilter>('all');
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<CommunityPost | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [shareCardData, setShareCardData] = useState<import('@/components/community/ShareCardModal').ShareCardData | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [pendingCommunityPost, setPendingCommunityPost] = useState<{
    type: 'note' | 'workout'; content?: string; workoutName?: string;
    workoutDuration?: number; workoutExercises?: number;
  } | null>(null);

  const theme = useMemo(() => getDailyTheme(), []);
  const challenge = useMemo(() => getWeeklyChallenge(), []);

  useEffect(() => {
    async function loadPosts() {
      const demo = getDemoPosts();
      try {
        const res = await fetch('/api/community/posts');
        const data = await res.json();
        const real: CommunityPost[] = data.data || [];
        const merged = [...real, ...demo].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setPosts(merged);
      } catch {
        setPosts(demo);
      } finally {
        setIsLoading(false);
      }
    }
    loadPosts();
  }, []);

  // Marcar comunidad visitada y limpiar notif
  useEffect(() => {
    localStorage.removeItem(COMM_NOTIF_KEY);
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }

  async function handleSharePost(post: CommunityPost) {
    const text = post.type === 'workout'
      ? `${post.workoutName} — ${post.workoutDuration}min, ${post.workoutExercises} ejercicios 💪\n\nFit K`
      : `${post.content || ''}\n\nFit K`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Fit K', text });
      } else {
        await navigator.clipboard.writeText(text);
        showToast('Copiado al portapapeles');
      }
    } catch { /* user cancelled */ }
  }

  function scrollToPost(postId: string) {
    setTimeout(() => {
      const el = document.getElementById(`post-${postId}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  if (!user) return null;

  const currentUserId = supabaseUserId || user.id;
  const userName = user.profile.name || 'Miembro';
  const avatarUrl = user.profile.avatarUrl;

  // ── Derived: badges (pressure-free, personal) ──
  const ownPosts = posts.filter(p => p.userId === currentUserId && !p.isDemo);
  const badges = computeBadges({
    ownPosts: ownPosts.length,
    ownNotes: ownPosts.filter(p => p.type === 'note').length,
    ownWorkouts: ownPosts.filter(p => p.type === 'workout').length,
    reactionsGiven: posts.filter(p => p.myReaction).length,
  });

  const hotPost = useMemo(() => {
    return posts
      .filter(p => !hiddenIds.has(p.id))
      .sort((a, b) => b.reactionCount - a.reactionCount)[0] || null;
  }, [posts, hiddenIds]);

  const visiblePosts = posts
    .filter(p => !hiddenIds.has(p.id))
    .filter(p => filter === 'all' || p.type === filter)
    .filter(p => !showOnlyMine || p.userId === currentUserId)
    .filter(p => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.content?.toLowerCase().includes(q) ||
        p.displayName.toLowerCase().includes(q) ||
        p.workoutName?.toLowerCase().includes(q)
      );
    });

  const counts = {
    all: posts.filter(p => !hiddenIds.has(p.id)).length,
    note: posts.filter(p => !hiddenIds.has(p.id) && p.type === 'note').length,
    workout: posts.filter(p => !hiddenIds.has(p.id) && p.type === 'workout').length,
  };

  // ── Handlers ──
  async function handleReact(postId: string, reaction: CommunityReactionType) {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const wasSame = p.myReaction === reaction;
      // Si añadimos reacción a un post de otro usuario, poner notif para ellos (demo local)
      if (!wasSame && p.userId !== currentUserId) {
        localStorage.setItem(COMM_NOTIF_KEY, 'true');
      }
      return {
        ...p,
        myReaction: wasSame ? null : reaction,
        reactionCount: wasSame ? p.reactionCount - 1 : (p.myReaction ? p.reactionCount : p.reactionCount + 1),
      };
    }));
    const target = posts.find(p => p.id === postId);
    if (target?.isDemo) return; // demo: solo local
    await fetch('/api/community/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, reaction }),
    });
  }

  async function handleComment(postId: string, content: string) {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p
    ));
    const target = posts.find(p => p.id === postId);
    if (target?.isDemo) return; // demo: solo local
    await fetch('/api/community/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, content, displayName: userName }),
    });
  }

  async function handleConfirmDelete() {
    const post = confirmDelete;
    if (!post) return;
    setConfirmDelete(null);
    setPosts(prev => prev.filter(p => p.id !== post.id));
    showToast('Publicación eliminada.');
    if (post.isDemo) return;
    await fetch(`/api/community/posts?postId=${post.id}`, { method: 'DELETE' }).catch(() => {});
  }

  async function handleEdit(postId: string, content: string) {
    const trimmed = content.trim().slice(0, 280);
    setPosts(prev => prev.map(p => (p.id === postId ? { ...p, content: trimmed } : p)));
    showToast('Publicación actualizada.');
    const target = posts.find(p => p.id === postId);
    if (target?.isDemo) return;
    await fetch('/api/community/posts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, content: trimmed }),
    }).catch(() => {});
  }

  function handleHide(postId: string) {
    setHiddenIds(prev => new Set(prev).add(postId));
    showToast('Publicación ocultada.');
  }

  function handleReport(post: CommunityPost) {
    setHiddenIds(prev => new Set(prev).add(post.id));
    showToast('Gracias. Lo revisaremos.');
  }

  // Llega desde el compositor de nota: abre ShareCardModal con opción de publicar en comunidad
  function handleNoteReadyToShare(content: string, userPhotoUrl?: string) {
    setCreateType(null);
    setComposerPrompt(undefined);
    const postData = { type: 'note' as const, content };
    setPendingCommunityPost(postData);
    setShareCardData({
      type: 'note',
      content,
      userName: user?.profile.name ?? 'Usuario',
      initialUserPhotoUrl: userPhotoUrl,
    });
  }

  // Se llama desde el ShareCardModal al pulsar "Publicar en Comunidad"
  // imageUrl = URL pública de la tarjeta capturada con html2canvas y subida a Storage
  async function publishPendingPost(imageUrl?: string) {
    if (!pendingCommunityPost) return;
    const body = {
      type: pendingCommunityPost.type,
      content: pendingCommunityPost.content,
      workoutName: pendingCommunityPost.workoutName,
      workoutDuration: pendingCommunityPost.workoutDuration,
      workoutExercises: pendingCommunityPost.workoutExercises,
      displayName: user?.profile.name ?? 'Usuario',
      avatarUrl: user?.profile.avatarUrl,
      photoUrl: imageUrl,
    };
    const res = await fetch('/api/community/posts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const responseData = await res.json();
    if (responseData.data) {
      const newPost: CommunityPost = {
        id: responseData.data.id, userId: responseData.data.user_id,
        displayName: user?.profile.name ?? 'Usuario',
        avatarUrl: user?.profile.avatarUrl,
        type: pendingCommunityPost.type,
        content: pendingCommunityPost.content,
        workoutName: pendingCommunityPost.workoutName,
        workoutDuration: pendingCommunityPost.workoutDuration,
        workoutExercises: pendingCommunityPost.workoutExercises,
        photoUrl: imageUrl,
        createdAt: responseData.data.created_at,
        myReaction: null, reactionCount: 0, commentCount: 0, comments: [],
      };
      setPosts(prev => [newPost, ...prev]);
      showToast('¡Publicado en la comunidad!');
    }
    setPendingCommunityPost(null);
  }

  // Picker de entreno → abre WorkoutComposeModal con preview live
  function handleWorkoutSelected(session: import('@/types/user').WeeklySession) {
    setShowWorkoutPicker(false);
    setWorkoutCompose({ session });
  }

  function handleWorkoutReadyToShare(session: import('@/types/user').WeeklySession, note: string, userPhotoUrl?: string) {
    setWorkoutCompose(null);
    const postData = {
      type: 'workout' as const,
      content: note || undefined,
      workoutName: session.name,
      workoutDuration: session.duration,
      workoutExercises: session.exercises.length,
    };
    setPendingCommunityPost(postData);
    setShareCardData({
      type: 'workout',
      content: session.name,
      workoutStats: { minutes: session.duration, exercises: session.exercises.length },
      workoutNote: note || undefined,
      userName: user?.profile.name ?? 'Usuario',
      initialUserPhotoUrl: userPhotoUrl,
    });
  }

  function openComposer(t: 'note' | 'workout', prompt?: string) {
    if (t === 'workout') {
      setShowWorkoutPicker(true);
    } else {
      setComposerPrompt(prompt);
      setCreateType('note');
    }
  }

  const FILTERS: { id: CommunityFilter; label: string; count: number }[] = [
    { id: 'all', label: 'Todo', count: counts.all },
    { id: 'note', label: 'Notas', count: counts.note },
    { id: 'workout', label: 'Entrenos', count: counts.workout },
  ];

  return (
    <div className="min-h-dvh glass-bg flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 pt-6 pb-3"
      >
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-stone-900">Tu camino</h1>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowSearch(s => !s); if (showSearch) setSearchQuery(''); }}
              className={`p-2 rounded-xl transition-colors ${showSearch ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-stone-100 dark:bg-stone-800 text-stone-500 hover:bg-stone-200'}`}
            >
              {showSearch ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </button>
            <button
              onClick={() => openComposer('note')}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <PenLine className="w-4 h-4" />
              Nota
            </button>
            <button
              onClick={() => openComposer('workout')}
              className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl text-sm font-medium hover:bg-stone-200 transition-colors"
            >
              <Dumbbell className="w-4 h-4" />
              Entreno
            </button>
          </div>
        </div>
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mt-3"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar por texto, usuario o entreno..."
                  className="w-full glass-input rounded-xl pl-9 pr-4 py-2.5 text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {!showSearch && <p className="text-stone-500 text-sm mt-1">Entrena tu cuerpo. Cuida tu cabeza.</p>}
      </motion.div>

      {/* Stories strip */}
      <div className="px-4 pb-3">
        <StoriesStrip
          posts={posts}
          currentUserId={currentUserId}
          userName={userName}
          onCreateNote={() => openComposer('note')}
          onScrollToPost={scrollToPost}
        />
      </div>

      {/* Achievements + Theme + Filters */}
      <div className="px-4 space-y-3 pb-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <AchievementsCard badges={badges} />
        </motion.div>

        {/* Theme of the day */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="rounded-2xl p-4 bg-gradient-to-br from-emerald-500 to-teal-600 text-white relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{theme.emoji}</span>
                <p className="text-xs uppercase tracking-wide text-emerald-50/90 font-semibold">Tema de hoy</p>
              </div>
              <p className="font-bold text-base mb-1">{theme.title}</p>
              <p className="text-emerald-50/90 text-sm mb-3">{theme.prompt}</p>
              <button
                onClick={() => openComposer('note', theme.prompt)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-emerald-700 rounded-xl text-sm font-semibold hover:bg-emerald-50 transition-colors"
              >
                <PenLine className="w-4 h-4" /> Escribir sobre esto
              </button>
            </div>
          </div>
        </motion.div>

        {/* Post más caliente */}
        {hotPost && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
            <HotPostBanner post={hotPost} onScrollToPost={scrollToPost} />
          </motion.div>
        )}

        {/* Weekly challenge (cooperative, no ranking) */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="flex items-start gap-3 rounded-2xl px-4 py-3 bg-white dark:bg-[#161616] border border-stone-100 dark:border-stone-800">
            <span className="text-lg flex-shrink-0">{challenge.emoji}</span>
            <div>
              <p className="text-xs uppercase tracking-wide text-stone-400 font-semibold">Reto de la semana</p>
              <p className="text-stone-700 dark:text-stone-300 text-sm">{challenge.text}</p>
            </div>
          </div>
        </motion.div>

        {/* Filter chips */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => {
            const active = filter === f.id && !showOnlyMine;
            return (
              <button
                key={f.id}
                onClick={() => { setFilter(f.id); setShowOnlyMine(false); }}
                className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  active ? 'text-white' : 'text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="filterPill"
                    className="absolute inset-0 rounded-full bg-emerald-500"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{f.label} · {f.count}</span>
              </button>
            );
          })}
          {/* Mis posts */}
          <button
            onClick={() => setShowOnlyMine(v => !v)}
            className={`relative flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              showOnlyMine ? 'text-white' : 'text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200'
            }`}
          >
            {showOnlyMine && (
              <motion.div
                layoutId="filterPill"
                className="absolute inset-0 rounded-full bg-purple-500"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <User className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">Mis posts</span>
          </button>
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 px-4 space-y-4 overflow-y-auto pb-32">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : visiblePosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 px-6"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-stone-900 text-lg mb-2">Nada por aquí todavía</h3>
            <p className="text-stone-500 text-sm mb-6 max-w-xs mx-auto">
              {filter === 'all'
                ? 'La comunidad empieza con tu historia. Comparte una nota o tu último entrenamiento.'
                : 'No hay publicaciones de este tipo. Prueba con otro filtro o comparte la primera.'}
            </p>
            <button
              onClick={() => openComposer('note')}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold transition-colors"
            >
              Compartir algo
            </button>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {visiblePosts.map((post, i) => (
              <motion.div
                key={post.id}
                id={`post-${post.id}`}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
              >
                <PostCard
                  post={post}
                  currentUserId={currentUserId}
                  currentUserName={userName}
                  onReact={handleReact}
                  onComment={handleComment}
                  onRequestDelete={setConfirmDelete}
                  onEdit={handleEdit}
                  onReport={handleReport}
                  onHide={handleHide}
                  onImageClick={url => setFullscreenImage(url)}
                  onShare={handleSharePost}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Compositor de nota */}
      <AnimatePresence>
        {createType === 'note' && (
          <CreatePostModal
            userName={userName}
            avatarUrl={avatarUrl}
            promptText={composerPrompt}
            onClose={() => { setCreateType(null); setComposerPrompt(undefined); }}
            onReadyToShare={handleNoteReadyToShare}
          />
        )}
      </AnimatePresence>

      {/* Picker de entreno */}
      <AnimatePresence>
        {showWorkoutPicker && (
          <WorkoutPickerModal
            sessions={user.weeklySessions ?? []}
            onPick={handleWorkoutSelected}
            onClose={() => setShowWorkoutPicker(false)}
          />
        )}
      </AnimatePresence>

      {/* Compositor de entreno con preview live */}
      <AnimatePresence>
        {workoutCompose && (
          <WorkoutComposeModal
            session={workoutCompose.session}
            userName={userName}
            avatarUrl={avatarUrl}
            onClose={() => setWorkoutCompose(null)}
            onReadyToShare={(note, photoUrl) => handleWorkoutReadyToShare(workoutCompose.session, note, photoUrl)}
          />
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-[60]"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass-modal rounded-3xl p-6 max-w-sm w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-2">¿Eliminar publicación?</h3>
              <p className="text-stone-500 mb-6 text-sm">Esta acción no se puede deshacer. Se borrará junto con sus reacciones y comentarios.</p>
              <div className="flex gap-3">
                <Button onClick={() => setConfirmDelete(null)} variant="outline" className="flex-1 py-4 rounded-xl">Cancelar</Button>
                <Button onClick={handleConfirmDelete} className="flex-1 py-4 rounded-xl bg-red-500 hover:bg-red-600">Eliminar</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 inset-x-0 flex justify-center z-[70] pointer-events-none px-6"
          >
            <div className="glass-modal rounded-full px-5 py-2.5 flex items-center gap-2 shadow-lg">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium text-stone-700 dark:text-stone-200">{toast}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav active="community" />

      {/* ── Modal de tarjeta compartible ── */}
      <AnimatePresence>
        {shareCardData && (
          <ShareCardModalLazy
            data={shareCardData}
            onClose={() => { setShareCardData(null); setPendingCommunityPost(null); }}
            onPublishToCommunity={pendingCommunityPost ? publishPendingPost : undefined}
          />
        )}
      </AnimatePresence>

      {/* ── Visor de imagen a pantalla completa ── */}
      <AnimatePresence>
        {fullscreenImage && (
          <ImageViewer url={fullscreenImage} onClose={() => setFullscreenImage(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// Lazy import para no incrementar el bundle principal
function ShareCardModalLazy(props: {
  data: import('@/components/community/ShareCardModal').ShareCardData;
  onClose: () => void;
  onPublishToCommunity?: (imageUrl?: string) => Promise<void>;
}) {
  const [Comp, setComp] = useState<React.ComponentType<{
    data: typeof props.data;
    onClose: () => void;
    onPublishToCommunity?: (imageUrl?: string) => Promise<void>;
  }> | null>(null);
  useState(() => {
    import('@/components/community/ShareCardModal').then(m => setComp(() => m.ShareCardModal));
  });
  if (!Comp) return null;
  return <Comp {...props} />;
}