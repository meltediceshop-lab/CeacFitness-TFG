'use client';

// Lo que se ve dentro de cada publicación del feed de Comunidad.
// - Publicaciones de ejemplo: la tarjeta del estudio dibujada en un canvas, con su foto.
// - Publicaciones reales con imagen: la tarjeta que subió la persona, tal cual, sin recortes.
// - Notas sin imagen y entrenos antiguos sin imagen: una tarjeta propia.

import React, { useEffect, useRef, useState } from 'react';
import { Dumbbell, Clock, Quote } from 'lucide-react';
import type { CommunityPost } from '@/types/user';
import { renderShareCard, shareCardSize, type ShareFormat } from '@/lib/shareCards';
import { getDemoCard } from '@/lib/communityDemo';

// Las fotos se cargan una sola vez aunque aparezcan en varios sitios.
const photoCache = new Map<string, Promise<HTMLImageElement | null>>();
function loadPhoto(src: string): Promise<HTMLImageElement | null> {
  let p = photoCache.get(src);
  if (!p) {
    p = new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.decoding = 'async';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
    photoCache.set(src, p);
  }
  return p;
}

const SHOW_ALL = { minutes: true, exercises: true, sets: true, volume: true, name: true, chart: true };

/** Tarjeta de ejemplo dibujada con el motor del estudio. `width` = píxeles reales del lienzo. */
export function DemoCardCanvas({ postId, width = 864, format = 'post', className, style }: {
  postId: string; width?: number; format?: ShareFormat; className?: string; style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const card = typeof window === 'undefined' ? null : getDemoCard(postId, window.location.host);
  const template = card?.template ?? 'session';
  const [cw, ch] = shareCardSize(template, format);
  const height = Math.round((width * ch) / cw);

  useEffect(() => {
    const canvas = ref.current; const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !card) return;
    let cancelled = false;
    const draw = (photo: HTMLImageElement | null) => {
      if (cancelled) return;
      ctx.setTransform(width / cw, 0, 0, width / cw, 0, 0);
      renderShareCard(ctx, card.data, { template: card.template, format, theme: 'noche', photo, show: SHOW_ALL }, getComputedStyle(document.body).fontFamily);
    };
    draw(null); // primero sin foto, para que nunca se vea vacío
    loadPhoto(card.photo).then(img => { if (img) draw(img); });
    document.fonts?.ready.then(() => loadPhoto(card.photo).then(draw));
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, width, format]);

  if (!card) return null;
  return (
    <canvas
      ref={ref} width={width} height={height}
      className={className}
      style={{ width: '100%', height: 'auto', aspectRatio: `${cw} / ${ch}`, display: 'block', background: '#09090b', ...style }}
      aria-label={`Tarjeta de ${card.data.userName}: ${card.data.title}`}
      role="img"
    />
  );
}

/** Nota (reflexión): la foto a sangre con la frase encima. */
function NoteMedia({ post }: { post: CommunityPost }) {
  const date = new Date(post.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).toUpperCase();
  const long = (post.content?.length ?? 0) > 110;
  return (
    <div className="relative w-full overflow-hidden rounded-2xl" style={{ aspectRatio: '4 / 5', maxHeight: 460 }}>
      {post.photoUrl ? (
        <img src={post.photoUrl} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      ) : (
        <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 90% at 85% 0%, #10b981 0%, #065f46 45%, #022c22 100%)' }} />
      )}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.55) 62%, rgba(0,0,0,0.85) 100%)' }} />
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <span className="text-white font-black text-lg tracking-tight drop-shadow">Fit K</span>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-[0.14em] text-white bg-white/15 backdrop-blur-md border border-white/20">REFLEXIÓN</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-5">
        <Quote className="w-7 h-7 text-emerald-300 mb-2" fill="currentColor" strokeWidth={0} />
        <p className={`text-white font-semibold leading-snug [text-wrap:balance] drop-shadow ${long ? 'text-lg' : 'text-[22px]'}`}
          style={{ display: '-webkit-box', WebkitLineClamp: 6, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {post.content}
        </p>
        <p className="mt-4 text-[11px] font-semibold tracking-wider text-white/70">
          {post.displayName.split(' ')[0].toUpperCase()} · {date}
        </p>
      </div>
    </div>
  );
}

/** Entreno antiguo sin imagen: resumen compacto y honesto (sin calorías inventadas). */
function WorkoutMedia({ post }: { post: CommunityPost }) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl p-5" style={{ background: 'radial-gradient(120% 120% at 100% 0%, #065f46 0%, #0a0a0a 60%)' }}>
      <div className="flex items-center justify-between mb-6">
        <span className="text-white font-black text-lg tracking-tight">Fit K</span>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-[0.14em] text-emerald-300 bg-emerald-400/10 border border-emerald-400/25">ENTRENO COMPLETADO</span>
      </div>
      <p className="text-white text-2xl font-bold leading-tight [text-wrap:balance] mb-5">{post.workoutName || 'Entrenamiento'}</p>
      <div className="flex gap-6">
        {!!post.workoutDuration && (
          <div className="flex items-center gap-2 text-white">
            <Clock className="w-4 h-4 text-emerald-300" />
            <span className="text-lg font-bold tabular-nums">{post.workoutDuration}</span><span className="text-xs text-white/60">min</span>
          </div>
        )}
        {!!post.workoutExercises && (
          <div className="flex items-center gap-2 text-white">
            <Dumbbell className="w-4 h-4 text-emerald-300" />
            <span className="text-lg font-bold tabular-nums">{post.workoutExercises}</span><span className="text-xs text-white/60">ejercicios</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function PostMedia({ post, onImageClick }: { post: CommunityPost; onImageClick?: (url: string) => void }) {
  const [broken, setBroken] = useState(false);
  if (post.isDemo && getDemoCard(post.id, '')) {
    return <DemoCardCanvas postId={post.id} className="rounded-2xl" />;
  }
  if (post.type === 'note' && (post.isDemo || !post.photoUrl || broken)) return <NoteMedia post={{ ...post, photoUrl: broken ? undefined : post.photoUrl }} />;
  if (post.photoUrl && !broken) {
    return (
      <button type="button" onClick={() => onImageClick?.(post.photoUrl!)} className="block w-full rounded-2xl overflow-hidden bg-[rgba(118,118,128,0.12)] cursor-zoom-in">
        <img src={post.photoUrl} alt={post.workoutName || 'Publicación'} loading="lazy" onError={() => setBroken(true)}
          className="w-full h-auto max-h-[600px] object-contain mx-auto" />
      </button>
    );
  }
  return <WorkoutMedia post={post} />;
}
