'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Download, ImagePlus, Loader2, Share2, Trash2, Users, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useScrollLock } from '@/hooks/useScrollLock';
import { Button } from '@/components/ui/button';
import { canonicalExerciseId } from '@/lib/fitkMotor';
import { buildShareData, shareableSessions } from '@/lib/shareData';
import {
  FORMATS, TEMPLATES, THEMES, renderShareCard, shareCardSize,
  type ShareFormat, type ShareOptions, type ShareTemplate, type ShareTheme,
} from '@/lib/shareCards';

const STAT_TOGGLES: { id: keyof ShareOptions['show']; label: string }[] = [
  { id: 'minutes', label: 'Duración' },
  { id: 'exercises', label: 'Ejercicios' },
  { id: 'sets', label: 'Series' },
  { id: 'volume', label: 'Volumen' },
  { id: 'chart', label: 'Gráfico' },
  { id: 'name', label: 'Texto' },
];

/**
 * Estudio de tarjetas: el usuario elige plantilla, formato, colores, foto y
 * qué cifras enseñar, y la comparte fuera (historias, WhatsApp…), la guarda
 * o la publica en la Comunidad. Cada tarjeta lleva la marca y la dirección
 * de Fit K.
 */
export function ShareStudio({
  sessionId,
  initialTemplate = 'session',
  onClose,
  onPublished,
}: {
  sessionId?: string;
  initialTemplate?: ShareTemplate;
  onClose: () => void;
  onPublished?: () => void;
}) {
  useScrollLock();
  const { user, exerciseLogs, getExerciseCatalog } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const sessions = useMemo(() => (user ? shareableSessions(user) : []), [user]);
  const [chosenId, setChosenId] = useState<string | undefined>(sessionId ?? sessions[0]?.id);
  const session = user?.weeklySessions.find(s => s.id === chosenId) ?? sessions[0];

  const [template, setTemplate] = useState<ShareTemplate>(initialTemplate);
  const [format, setFormat] = useState<ShareFormat>('story');
  const [theme, setTheme] = useState<ShareTheme>('esmeralda');
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [show, setShow] = useState<ShareOptions['show']>({ minutes: true, exercises: true, sets: true, volume: true, chart: true, name: true });
  const [busy, setBusy] = useState<'share' | 'save' | 'publish' | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  const data = useMemo(() => {
    if (!user) return null;
    const names = new Map<string, string>();
    for (const e of getExerciseCatalog()) names.set(canonicalExerciseId(e.id), e.name);
    for (const s of user.weeklySessions) for (const e of s.exercises) names.set(canonicalExerciseId(e.id), e.name);
    const base = buildShareData(user, exerciseLogs, session, id => names.get(id), canonicalExerciseId, window.location.host);
    return { ...base, title: title ?? base.title, caption };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, exerciseLogs, session, title, caption]);

  // Plantillas disponibles con los datos que hay (sin gráfica de progreso si no hay registros, etc.)
  const available = TEMPLATES.filter(t =>
    t.id === 'progress' ? !!data?.progress : t.id === 'milestone' ? !!data?.milestone : t.id === 'week' ? !!data?.week : true);
  const active: ShareTemplate = available.some(t => t.id === template) ? template : 'session';
  const [w, h] = shareCardSize(active, format);

  const blobRef = useRef<Blob | null>(null);
  const draw = useCallback(() => {
    const canvas = canvasRef.current; const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !data) return;
    renderShareCard(ctx, data, { template: active, format, theme, photo, show }, getComputedStyle(document.body).fontFamily);
    // La imagen queda preparada para compartir al instante.
    blobRef.current = null;
    canvas.toBlob(b => { blobRef.current = b; }, 'image/png');
  }, [data, active, format, theme, photo, show]);
  useEffect(() => { draw(); document.fonts?.ready.then(draw); }, [draw, w, h]);

  const pickPhoto = (file?: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { setPhoto(img); URL.revokeObjectURL(url); };
    img.onerror = () => { URL.revokeObjectURL(url); setNotice('No he podido abrir esa foto. Prueba con otra.'); };
    img.src = url;
  };

  const toBlob = () => new Promise<Blob | null>(resolve => canvasRef.current?.toBlob(b => resolve(b), 'image/png') ?? resolve(null));
  const fileName = `fitk-${active}-${new Date().toISOString().slice(0, 10)}.png`;
  const save = (blob: Blob) => {
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = fileName; a.click(); setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const handleSave = async () => {
    setBusy('save'); const blob = blobRef.current ?? await toBlob(); setBusy(null);
    if (blob) { save(blob); setNotice('Imagen guardada'); } else setNotice('No se ha podido crear la imagen. Inténtalo de nuevo.');
  };
  const handleShare = async () => {
    if (!data) return;
    setBusy('share');
    try {
      const blob = blobRef.current ?? await toBlob();
      if (!blob) { setNotice('No se ha podido crear la imagen. Inténtalo de nuevo.'); return; }
      const file = new File([blob], fileName, { type: 'image/png' });
      // El texto lleva la dirección de la app: quien lo vea puede llegar a Fit K.
      const text = `${data.title} · Entreno con Fit K 💪 ${window.location.origin}`;
      if (!navigator.canShare?.({ files: [file] })) { save(blob); setNotice('Tu navegador no comparte imágenes: la he guardado'); return; }
      try {
        await navigator.share({ files: [file], title: 'Fit K', text });
      } catch (err) {
        if ((err as Error)?.name !== 'AbortError') { save(blob); setNotice('No se ha podido abrir el menú de compartir: la he guardado'); }
      }
    } finally {
      setBusy(null);
    }
  };
  const handlePublish = async () => {
    if (!user || !data || published) return;
    setBusy('publish');
    try {
      const blob = await toBlob(); if (!blob) throw new Error('sin imagen');
      const fd = new FormData(); fd.append('file', new File([blob], 'card.png', { type: 'image/png' }));
      const up = await fetch('/api/community/images', { method: 'POST', body: fd });
      const { url } = await up.json(); if (!url) throw new Error('sin url');
      const res = await fetch('/api/community/posts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'workout', content: data.title, workoutName: data.title, workoutDuration: data.minutes, workoutExercises: data.exercises,
          displayName: user.profile.name, avatarUrl: user.profile.avatarUrl, photoUrl: url,
        }),
      });
      if (!res.ok) throw new Error('post');
      setPublished(true); setNotice('Publicado en la Comunidad'); onPublished?.();
    } catch { setNotice('No se ha podido publicar. Inténtalo de nuevo.'); }
    setBusy(null);
  };

  if (!user || !data) return null;
  const chip = (on: boolean) => `px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex-shrink-0 ${on ? 'bg-emerald-500 text-white' : 'bg-[rgba(118,118,128,0.12)] text-stone-600 dark:text-white/70'}`;
  const label = 'text-[11px] font-semibold uppercase tracking-wide text-stone-500 mb-1.5';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] bg-black/50 flex items-end justify-center" onClick={onClose}>
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="glass-modal w-full max-w-md rounded-t-3xl max-h-[96dvh] flex flex-col" onClick={e => e.stopPropagation()}
      >
        <div className="px-5 pt-3 flex-shrink-0">
          <div className="w-10 h-1 bg-stone-300 dark:bg-white/20 rounded-full mx-auto mb-3" />
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-stone-900">Comparte tu entreno</h2>
              <p className="text-sm text-stone-500">Elige una tarjeta y hazla tuya.</p>
            </div>
            <button onClick={onClose} aria-label="Cerrar" className="w-9 h-9 rounded-full bg-[rgba(118,118,128,0.12)] flex items-center justify-center flex-shrink-0">
              <X className="w-5 h-5 text-stone-600 dark:text-white/70" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-4 pb-4 space-y-4">
          {/* Vista previa: es el mismo lienzo que se exporta */}
          <div className="flex justify-center">
            <div
              className="rounded-3xl overflow-hidden shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)]"
              style={active === 'sticker' ? { backgroundImage: 'repeating-conic-gradient(#3f3f46 0% 25%, #52525b 0% 50%)', backgroundSize: '24px 24px' } : undefined}
            >
              <canvas ref={canvasRef} width={w} height={h} aria-label="Vista previa de la tarjeta" style={{ display: 'block', height: 'min(46dvh, 420px)', width: 'auto', maxWidth: '100%' }} />
            </div>
          </div>

          <div>
            <p className={label}>Plantilla</p>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-5 px-5">
              {available.map(t => (
                <button key={t.id} type="button" onClick={() => setTemplate(t.id)} aria-pressed={active === t.id} title={t.hint} className={chip(active === t.id)}>{t.label}</button>
              ))}
            </div>
          </div>

          {sessions.length > 1 && active !== 'week' && active !== 'progress' && active !== 'milestone' && (
            <div>
              <p className={label}>Sesión</p>
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-5 px-5">
                {sessions.map(s => (
                  <button key={s.id} type="button" onClick={() => { setChosenId(s.id); setTitle(null); }} aria-pressed={session?.id === s.id} className={chip(session?.id === s.id)}>{s.name}</button>
                ))}
              </div>
            </div>
          )}

          {active !== 'sticker' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={label}>Formato</p>
                <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[rgba(118,118,128,0.12)]">
                  {FORMATS.map(f => (
                    <button key={f.id} type="button" onClick={() => setFormat(f.id)} aria-pressed={format === f.id}
                      className={`h-8 rounded-lg text-[11px] font-semibold ${format === f.id ? 'bg-[#fff] dark:bg-[#48484a] text-stone-900 shadow-sm' : 'text-stone-500'}`}>{f.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className={label}>Color</p>
                <div className="flex items-center gap-2 h-10">
                  {THEMES.map(t => (
                    <button key={t.id} type="button" onClick={() => setTheme(t.id)} aria-label={`Color ${t.label}`} aria-pressed={theme === t.id}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ring-2 ring-offset-2 ring-offset-transparent ${theme === t.id && !photo ? 'ring-emerald-500' : 'ring-transparent'}`}
                      style={{ background: `linear-gradient(135deg, ${t.swatch[0]} 50%, ${t.swatch[1]} 50%)`, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.15)' }}>
                      {theme === t.id && !photo && <Check className="w-4 h-4 text-white drop-shadow" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {active !== 'sticker' && (
            <div className="flex gap-2">
              <button type="button" onClick={() => fileRef.current?.click()} className="flex-1 h-10 rounded-xl bg-[rgba(118,118,128,0.12)] text-sm font-semibold text-stone-800 dark:text-white flex items-center justify-center gap-2">
                <ImagePlus className="w-4 h-4" /> {photo ? 'Cambiar foto de fondo' : 'Poner una foto de fondo'}
              </button>
              {photo && (
                <button type="button" onClick={() => setPhoto(null)} aria-label="Quitar la foto" className="w-10 h-10 rounded-xl bg-[rgba(118,118,128,0.12)] flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-stone-600 dark:text-white/70" />
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { pickPhoto(e.target.files?.[0]); e.target.value = ''; }} />
            </div>
          )}
          {active === 'photo' && !photo && (
            <p className="text-xs text-stone-500 -mt-2">Esta plantilla luce con una foto tuya de fondo: la del gimnasio, la de después de entrenar…</p>
          )}

          {(active === 'session' || active === 'photo' || active === 'sticker') && (
            <div className="space-y-2">
              <p className={label}>Texto</p>
              <input id="share-title" value={title ?? data.title} onChange={e => setTitle(e.target.value)} maxLength={40} placeholder="Título"
                className="w-full h-11 rounded-xl bg-[rgba(118,118,128,0.10)] px-3.5 text-stone-900 outline-none focus:ring-4 focus:ring-emerald-500/15" />
              {active !== 'sticker' && (
                <input id="share-caption" value={caption} onChange={e => setCaption(e.target.value)} maxLength={60} placeholder={`${data.userName} · con su plan de Fit K`}
                  className="w-full h-11 rounded-xl bg-[rgba(118,118,128,0.10)] px-3.5 text-stone-900 outline-none focus:ring-4 focus:ring-emerald-500/15" />
              )}
            </div>
          )}

          {(active === 'session' || active === 'photo' || active === 'sticker' || active === 'week') && (
            <div>
              <p className={label}>Qué se ve</p>
              <div className="flex flex-wrap gap-1.5">
                {STAT_TOGGLES.filter(t => (t.id === 'volume' ? !!(active === 'week' ? data.week?.volumeKg : data.volumeKg) : true) && (active === 'week' ? ['chart', 'volume'].includes(t.id) : active === 'sticker' ? !['chart', 'name'].includes(t.id) : active === 'photo' ? t.id !== 'chart' : true)).map(t => (
                  <button key={t.id} type="button" onClick={() => setShow(s => ({ ...s, [t.id]: !s[t.id] }))} aria-pressed={show[t.id]} className={chip(show[t.id])}>{t.label}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] border-t border-black/5 dark:border-white/10 space-y-2">
          {notice && <p className="text-xs text-center font-medium text-emerald-700 dark:text-emerald-400">{notice}</p>}
          <div className="flex gap-2">
            <Button onClick={handleShare} disabled={!!busy} className="flex-1 h-12 rounded-2xl text-base">
              {busy === 'share' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />} Compartir
            </Button>
            <Button onClick={handleSave} disabled={!!busy} variant="secondary" aria-label="Guardar la imagen" className="h-12 w-12 rounded-2xl p-0">
              {busy === 'save' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-5 h-5" />}
            </Button>
          </div>
          {active !== 'sticker' && (
            <button type="button" onClick={handlePublish} disabled={!!busy || published} className="w-full h-10 rounded-xl text-sm font-semibold text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-2 disabled:opacity-50">
              {busy === 'publish' ? <Loader2 className="w-4 h-4 animate-spin" /> : published ? <Check className="w-4 h-4" /> : <Users className="w-4 h-4" />} {published ? 'Publicado en la Comunidad' : 'Publicar también en la Comunidad'}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
