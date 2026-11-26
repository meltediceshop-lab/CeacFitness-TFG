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
  Users,
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
import { getDailyTheme, getWeeklyChallenge, getDemoPosts, computeBadges, getDemoProfile } from '@/lib/communityDemo';
import { ProfileSheet, FriendsSheet } from '@/components/community/ProfileSheet';
import { ShareStudio } from '@/components/community/ShareStudio';
import type { ShareTemplate } from '@/lib/shareCards';
import { PostMedia, DemoCardCanvas } from '@/components/community/FeedMedia';

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

// ─── Historias: quién ha publicado hace poco ─────────────────────
function Avatar({ name, url, size = 36, ring = false }: { name: string; url?: string; size?: number; ring?: boolean }) {
  const inner = (
    <span className="rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-600 text-white font-bold flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {url ? <img src={url} alt="" className="w-full h-full object-cover" /> : name.charAt(0).toUpperCase()}
    </span>
  );
  if (!ring) return inner;
  return <span className="rounded-full p-[2.5px] bg-gradient-to-tr from-emerald-500 via-teal-400 to-lime-300 flex-shrink-0"><span className="block rounded-full p-[2px] bg-[var(--app-bg)]">{inner}</span></span>;
}

function StoriesStrip({ posts, currentUserId, userName, avatarUrl, onCreate, onScrollToPost }: {
  posts: CommunityPost[];
  currentUserId: string;
  userName: string;
  avatarUrl?: string;
  onCreate: () => void;
  onScrollToPost: (postId: string) => void;
}) {
  const recentPosters = useMemo(() => {
    const seen = new Set<string>();
    return posts
      .filter(p => p.userId !== currentUserId)
      .filter(p => { if (seen.has(p.userId)) return false; seen.add(p.userId); return true; })
      .slice(0, 8);
  }, [posts, currentUserId]);

  return (
    <div className="flex gap-4 overflow-x-auto pb-1 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
      <button type="button" onClick={onCreate} className="flex flex-col items-center gap-1.5 flex-shrink-0">
        <span className="relative">
          <span className="block rounded-full p-[4.5px]"><Avatar name={userName} url={avatarUrl} size={56} /></span>
          <span className="absolute bottom-0.5 right-0.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center ring-2 ring-[var(--app-bg)]">
            <Plus className="w-3 h-3 text-white" strokeWidth={3} />
          </span>
        </span>
        <span className="text-[11px] text-stone-500 w-16 truncate text-center">Publicar</span>
      </button>
      {recentPosters.map(post => {
        const isNew = Date.now() - new Date(post.createdAt).getTime() < 24 * 3_600_000;
        return (
          <button type="button" key={post.userId} onClick={() => onScrollToPost(post.id)} className="flex flex-col items-center gap-1.5 flex-shrink-0">
            {isNew
              ? <Avatar name={post.displayName} url={post.avatarUrl} size={56} ring />
              : <span className="block rounded-full p-[2.5px] bg-[rgba(118,118,128,0.25)]"><span className="block rounded-full p-[2px] bg-[var(--app-bg)]"><Avatar name={post.displayName} url={post.avatarUrl} size={56} /></span></span>}
            <span className="text-[11px] text-stone-600 dark:text-stone-300 w-16 truncate text-center">{post.displayName.split(' ')[0]}</span>
          </button>
        );
      })}
    </div>
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
  onOpenProfile,
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
  onOpenProfile: (userId: string) => void;
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

  const visibleComments = showComments ? allComments : allComments.slice(-2);
  const kindLabel = post.type === 'note' ? 'Reflexión' : 'Entreno';
  const caption = post.type === 'workout' ? post.content : undefined;

  return (
    <article className="glass-card rounded-[28px] overflow-visible">
      {/* Autor */}
      <div className="pl-4 pr-2 pt-3.5 pb-3 flex items-center gap-3">
        <button type="button" onClick={() => onOpenProfile(post.userId)} aria-label={`Ver el perfil de ${post.displayName.split(' ')[0]}`} className="flex-shrink-0">
          <Avatar name={post.displayName} url={post.avatarUrl} size={38} />
        </button>
        <button type="button" onClick={() => onOpenProfile(post.userId)} className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-1.5 min-w-0">
            <p className="font-semibold text-stone-900 dark:text-stone-100 text-[15px] truncate">{post.displayName.split(' ')[0]}</p>
            {post.milestone && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold flex-shrink-0 truncate max-w-[9rem]">
                {post.milestone}
              </span>
            )}
          </div>
          <p className="text-stone-500 text-xs">{kindLabel} · {timeAgo(post.createdAt)}{isOwner ? ' · Tú' : ''}</p>
        </button>
        <PostMenu
          isOwner={isOwner}
          canEdit={post.type === 'note' || !!post.content}
          onEdit={() => { setEditText(post.content || ''); setEditing(true); }}
          onDelete={() => onRequestDelete(post)}
          onReport={() => onReport(post)}
          onHide={() => onHide(post.id)}
        />
      </div>

      {/* Texto del entreno */}
      {caption && !editing && (
        <p className="px-4 pb-3 text-[15px] leading-snug text-stone-800 dark:text-stone-200">{caption}</p>
      )}

      {/* Edición en línea */}
      {editing ? (
        <div className="px-4 pb-3 space-y-2">
          <textarea
            value={editText}
            onChange={e => setEditText(e.target.value.slice(0, 280))}
            rows={3}
            autoFocus
            className="w-full glass-input rounded-xl px-3 py-2 text-sm text-stone-800 dark:text-stone-100 outline-none resize-none"
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-sm text-stone-500 rounded-lg">Cancelar</button>
            <button onClick={handleSaveEdit} className="px-4 py-1.5 text-sm font-semibold text-white bg-emerald-500 rounded-lg">Guardar</button>
          </div>
        </div>
      ) : (
        <div className="px-2.5">
          <PostMedia post={post} onImageClick={onImageClick} />
        </div>
      )}

      {/* Reacciones y acciones */}
      <div className="px-3 pt-2.5 pb-1 relative">
        <div className="pointer-events-none absolute left-6 -top-1 z-20">
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

        <div className="flex items-center gap-1">
          {!isOwner && REACTIONS.map(r => {
            const isActive = post.myReaction === r.id;
            return (
              <motion.button
                key={r.id}
                type="button"
                whileTap={{ scale: 0.8 }}
                onClick={() => handleReact(r.id)}
                disabled={reacting}
                aria-label={r.label}
                aria-pressed={isActive}
                title={r.label}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-[17px] transition-colors ${
                  isActive ? 'bg-emerald-500/15 ring-1 ring-emerald-500/50' : 'hover:bg-[rgba(118,118,128,0.12)]'
                }`}
              >
                <span className={isActive ? '' : 'grayscale-[35%]'}>{r.emoji}</span>
              </motion.button>
            );
          })}
          <span className="flex-1" />
          <button type="button" onClick={() => { setShowInput(true); setShowComments(true); }}
            className="h-9 px-2.5 rounded-full flex items-center gap-1.5 text-stone-500 hover:bg-[rgba(118,118,128,0.12)] text-sm" aria-label="Comentar">
            <MessageCircle className="w-[18px] h-[18px]" />
            {allComments.length > 0 && <span className="tabular-nums">{allComments.length}</span>}
          </button>
          <button type="button" onClick={() => onShare(post)} className="w-9 h-9 rounded-full flex items-center justify-center text-stone-500 hover:bg-[rgba(118,118,128,0.12)]" aria-label="Compartir">
            <Share2 className="w-[18px] h-[18px]" />
          </button>
        </div>

        <p className="px-1 pt-1 text-xs text-stone-500">
          {post.reactionCount > 0
            ? <><span className="font-semibold text-stone-700 dark:text-stone-300 tabular-nums">{post.reactionCount}</span> {post.reactionCount === 1 ? 'persona se ha identificado' : 'personas se han identificado'}</>
            : isOwner ? 'Aún nadie ha reaccionado. Está bien, tu camino es tuyo.' : 'Sé la primera persona en reaccionar.'}
        </p>
        {isOwner && humanMsg && <p className="px-1 pt-0.5 text-xs text-emerald-700 dark:text-emerald-400">{humanMsg}</p>}
      </div>

      {/* Comentarios */}
      <div className="px-4 pt-2 pb-4 space-y-2">
        {visibleComments.map(c => (
          <p key={c.id} className="text-[13px] leading-snug text-stone-700 dark:text-stone-300">
            <span className="font-semibold text-stone-900 dark:text-stone-100">{c.displayName.split(' ')[0]}</span>{' '}
            {renderWithMentions(c.content)}
          </p>
        ))}

        {allComments.length > 2 && (
          <button onClick={handleLoadAllComments} className="text-xs text-stone-500 flex items-center gap-1">
            {showComments ? <><ChevronUp className="w-3 h-3" /> Mostrar menos</> : <>Ver los {Math.max(post.commentCount, allComments.length)} comentarios</>}
          </button>
        )}

        {!isOwner && (
          !showInput ? (
            <button type="button" onClick={() => setShowInput(true)}
              className="w-full flex items-center gap-2.5 pt-1 text-left">
              <Avatar name={currentUserName} size={24} />
              <span className="flex-1 text-[13px] text-stone-400">Escribe un comentario…</span>
            </button>
          ) : (
            <div className="relative pt-1 space-y-2">
              <div className="flex gap-1.5 overflow-x-auto -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
                {QUICK_REPLIES.map(q => (
                  <button key={q} type="button" onClick={() => handleSendComment(q)}
                    className="text-xs px-3 py-1.5 rounded-full bg-[rgba(118,118,128,0.12)] text-stone-700 dark:text-stone-200 flex-shrink-0">
                    {q}
                  </button>
                ))}
              </div>
              {mentionSuggestions.length > 0 && (
                <div className="absolute bottom-full mb-1 left-0 right-0 glass-modal rounded-xl py-1 shadow-lg z-10">
                  {mentionSuggestions.map(name => (
                    <button
                      key={name}
                      onMouseDown={e => { e.preventDefault(); selectMention(name); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left"
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
                  placeholder="Escribe un comentario… usa @nombre"
                  autoFocus
                  className="flex-1 text-sm glass-input rounded-full px-4 py-2 outline-none text-stone-800 dark:text-stone-100 placeholder-stone-400"
                />
                <button
                  onClick={() => handleSendComment(commentText)}
                  disabled={!commentText.trim() || loadingComment}
                  aria-label="Enviar comentario"
                  className="w-9 h-9 rounded-full bg-emerald-500 disabled:bg-stone-300 dark:disabled:bg-stone-700 flex items-center justify-center flex-shrink-0"
                >
                  {loadingComment ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </article>
  );
}

function AchievementsCard({ badges }: { badges: ReturnType<typeof computeBadges> }) {
  const unlocked = badges.filter(b => b.unlocked).length;
  const next = badges.find(b => !b.unlocked);
  return (
    <section className="glass-card rounded-3xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-semibold text-stone-900 dark:text-stone-100 text-[15px]">Tu rincón</p>
          <p className="text-stone-500 text-xs">{next ? `Siguiente: ${next.hint.toLowerCase()}` : 'Has conseguido todos los logros'}</p>
        </div>
        <span className="text-xs font-semibold tabular-nums text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-full">{unlocked}/{badges.length}</span>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {badges.map(b => (
          <div key={b.id} title={b.hint} className="flex flex-col items-center gap-1.5">
            <span className={`w-11 h-11 rounded-full flex items-center justify-center text-xl ${
              b.unlocked ? 'bg-emerald-500/10 ring-1 ring-emerald-500/40' : 'bg-[rgba(118,118,128,0.12)] grayscale opacity-50'
            }`}>{b.emoji}</span>
            <span className={`text-[10px] text-center leading-tight font-medium ${b.unlocked ? 'text-stone-800 dark:text-stone-200' : 'text-stone-400'}`}>{b.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────
export function CommunityScreen() {
  const { user, supabaseUserId } = useApp();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<CommunityFilter>('all');
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<CommunityPost | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showOnlyMine, setShowOnlyMine] = useState(false);

  // Estudio de tarjetas para compartir fuera de Fit K
  const [studio, setStudio] = useState<{ template?: ShareTemplate; prompt?: string; kicker?: string } | null>(null);
  const [feedVersion, setFeedVersion] = useState(0);
  // Perfiles y amigos
  const [profileOf, setProfileOf] = useState<string | null>(null);
  const [showFriends, setShowFriends] = useState(false);
  const [incoming, setIncoming] = useState(0);
  const refreshIncoming = () => {
    fetch('/api/community/friends').then(r => (r.ok ? r.json() : null)).then(j => { if (j?.data) setIncoming(j.data.incoming.length); }).catch(() => {});
  };
  useEffect(() => { refreshIncoming(); }, []);
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
  }, [feedVersion]);

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

  function openStudio(template?: ShareTemplate, prompt?: string, kicker?: string) {
    setStudio({ template, prompt, kicker });
  }

  const SEGMENTS: { id: CommunityFilter | 'mine'; label: string }[] = [
    { id: 'all', label: 'Todo' },
    { id: 'workout', label: 'Entrenos' },
    { id: 'note', label: 'Reflexiones' },
    { id: 'mine', label: 'Míos' },
  ];
  const segment = showOnlyMine ? 'mine' : filter;

  return (
    <div className="min-h-dvh glass-bg flex flex-col">
      {/* Cabecera */}
      <header className="px-4 pt-6 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[30px] leading-tight font-bold tracking-tight text-stone-900 dark:text-stone-50">Comunidad</h1>
            <p className="text-stone-500 text-sm">Entrena tu cuerpo. Cuida tu cabeza.</p>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" aria-label={incoming ? `Amigos, ${incoming} solicitudes` : 'Amigos'} onClick={() => setShowFriends(true)}
              className="relative w-10 h-10 rounded-full glass-card flex items-center justify-center text-stone-700 dark:text-stone-200">
              <Users className="w-[18px] h-[18px]" />
              {incoming > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center tabular-nums">{incoming}</span>}
            </button>
            <button type="button" aria-label="Mi perfil" onClick={() => setProfileOf('me')} className="rounded-full">
              <Avatar name={userName} url={avatarUrl} size={40} />
            </button>
            <button type="button" aria-label={showSearch ? 'Cerrar búsqueda' : 'Buscar'}
              onClick={() => { setShowSearch(s => !s); if (showSearch) setSearchQuery(''); }}
              className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-stone-700 dark:text-stone-200">
              {showSearch ? <X className="w-[18px] h-[18px]" /> : <Search className="w-[18px] h-[18px]" />}
            </button>
            <button type="button" aria-label="Publicar" onClick={() => openStudio()}
              className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-[0_6px_16px_-6px_rgb(var(--acc-500)/0.7)] active:scale-95 transition-transform">
              <Plus className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>
        </div>
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="relative mt-3">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar personas, entrenos o reflexiones"
                  className="w-full glass-input rounded-full pl-10 pr-10 py-2.5 text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} aria-label="Borrar búsqueda" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Historias */}
      <div className="px-4 pb-4">
        <StoriesStrip
          posts={posts}
          currentUserId={currentUserId}
          userName={userName}
          avatarUrl={avatarUrl}
          onCreate={() => openStudio()}
          onScrollToPost={scrollToPost}
        />
      </div>

      <div className="px-4 space-y-3 pb-4">
        {/* Tarjetas para compartir fuera de la app */}
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          onClick={() => openStudio()}
          className="relative w-full overflow-hidden rounded-[28px] text-left active:scale-[0.99] transition-transform"
          style={{ background: 'radial-gradient(130% 120% at 100% 0%, rgb(var(--acc-500)) 0%, rgb(var(--acc-700)) 38%, rgb(var(--acc-950)) 100%)' }}
        >
          <div className="relative flex items-stretch min-h-[164px]">
            <div className="flex-1 min-w-0 p-5 pr-2 flex flex-col">
              <span className="text-[10px] font-bold tracking-[0.16em] text-emerald-200/90">NUEVO</span>
              <span className="mt-1 text-[22px] leading-tight font-bold text-white [text-wrap:balance]">Crea tu tarjeta</span>
              <span className="mt-1 text-[13px] leading-snug text-emerald-50/80">Tu sesión, tu semana o tu progreso, listos para Instagram o WhatsApp.</span>
              <span className="mt-auto pt-3 inline-flex self-start items-center gap-1.5 px-3.5 py-2 rounded-full bg-white text-emerald-800 text-sm font-semibold">
                Crear tarjeta <ChevronRight className="w-4 h-4" />
              </span>
            </div>
            <div className="relative w-[132px] flex-shrink-0" aria-hidden>
              <div className="absolute w-[84px] top-5 right-[54px] rotate-[-8deg] rounded-xl overflow-hidden shadow-[0_10px_24px_-8px_rgba(0,0,0,0.6)] ring-1 ring-white/20">
                <DemoCardCanvas postId="demo-week" width={216} />
              </div>
              <div className="absolute w-[92px] top-8 right-3 rotate-[7deg] rounded-xl overflow-hidden shadow-[0_14px_28px_-8px_rgba(0,0,0,0.7)] ring-1 ring-white/25">
                <DemoCardCanvas postId="demo-session" width={232} />
              </div>
            </div>
          </div>
        </motion.button>

        {/* Tema de hoy y reto de la semana */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card rounded-3xl overflow-hidden">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center text-sm">{theme.emoji}</span>
              <p className="text-[11px] uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-300 font-bold">Tema de hoy</p>
            </div>
            <p className="font-bold text-[17px] text-stone-900 dark:text-stone-100 leading-snug">{theme.title}</p>
            <p className="text-stone-500 text-sm mt-0.5 mb-3">{theme.prompt}</p>
            <button
              onClick={() => openStudio('note', theme.prompt, theme.title)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500 text-white text-sm font-semibold active:scale-95 transition-transform"
            >
              <PenLine className="w-4 h-4" /> Escribir sobre esto
            </button>
          </div>
          <div className="flex items-start gap-3 px-4 py-3 border-t border-black/5 dark:border-white/10">
            <span className="text-base leading-6 flex-shrink-0">{challenge.emoji}</span>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.12em] text-stone-500 font-bold">Reto de la semana</p>
              <p className="text-stone-700 dark:text-stone-300 text-sm leading-snug">{challenge.text}</p>
            </div>
          </div>
        </motion.section>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <AchievementsCard badges={badges} />
        </motion.div>

        {/* Filtro */}
        <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-[rgba(118,118,128,0.12)]" role="tablist" aria-label="Filtrar publicaciones">
          {SEGMENTS.map(sg => (
            <button key={sg.id} type="button" role="tab" aria-selected={segment === sg.id}
              onClick={() => { if (sg.id === 'mine') { setShowOnlyMine(true); setFilter('all'); } else { setFilter(sg.id); setShowOnlyMine(false); } }}
              className={`h-8 rounded-lg text-[13px] font-semibold transition-colors ${segment === sg.id ? 'bg-[#fff] dark:bg-[#48484a] text-stone-900 dark:text-white shadow-sm' : 'text-stone-500'}`}>
              {sg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 px-4 space-y-4 pb-32">
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
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-stone-900 text-lg mb-2">Nada por aquí todavía</h3>
            <p className="text-stone-500 text-sm mb-6 max-w-xs mx-auto">
              {filter === 'all'
                ? 'La comunidad empieza con tu historia. Comparte una nota o tu último entrenamiento.'
                : 'No hay publicaciones de este tipo. Prueba con otro filtro o comparte la primera.'}
            </p>
            <button
              onClick={() => openStudio()}
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
                  onOpenProfile={uid => setProfileOf(uid === currentUserId ? 'me' : uid)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <AnimatePresence>
        {studio && (
          <ShareStudio
            initialTemplate={studio.template ?? ((user.weeklySessions ?? []).length > 0 ? 'session' : 'note')}
            prompt={studio.prompt}
            initialKicker={studio.kicker}
            onClose={() => setStudio(null)}
            onPublished={() => setFeedVersion(v => v + 1)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {profileOf && (
          <ProfileSheet
            key={profileOf}
            userId={profileOf}
            demo={profileOf.startsWith('demo-user-') ? getDemoProfile(profileOf, posts) : undefined}
            onClose={() => setProfileOf(null)}
            onChanged={refreshIncoming}
            onOpenFriends={profileOf === 'me' ? () => { setProfileOf(null); setShowFriends(true); } : undefined}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showFriends && (
          <FriendsSheet
            onClose={() => setShowFriends(false)}
            onOpenProfile={uid => { setShowFriends(false); setProfileOf(uid); }}
            onChanged={n => setIncoming(n)}
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

      {/* ── Visor de imagen a pantalla completa ── */}
      <AnimatePresence>
        {fullscreenImage && (
          <ImageViewer url={fullscreenImage} onClose={() => setFullscreenImage(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
