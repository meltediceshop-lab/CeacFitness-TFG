'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AlignCenter, AlignLeft, Bold, Highlighter, Italic, Check, Download, ImagePlus, Loader2, Move, RotateCcw, Share2, Sparkles, Trash2, Users, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useScrollLock } from '@/hooks/useScrollLock';
import { Button } from '@/components/ui/button';
import { canonicalExerciseId } from '@/lib/fitkMotor';
import { buildShareData, shareableSessions } from '@/lib/shareData';
import {
  ACCENTS, FONTS, FORMATS, TEMPLATES, THEMES, plainText, renderShareCard, shareCardSize,
  type ShareFont, type ShareFormat, type ShareOptions, type ShareTemplate, type ShareTheme,
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
  prompt,
  initialKicker,
  onClose,
  onPublished,
}: {
  sessionId?: string;
  initialTemplate?: ShareTemplate;
  /** Sugerencia para el texto de la reflexión (p. ej. el tema del día). */
  prompt?: string;
  /** Rótulo con el que empieza la reflexión (p. ej. el título del tema del día). */
  initialKicker?: string;
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
  // Textos de cada plantilla por separado, para que no se mezclen al cambiar de una a otra.
  const [texts, setTexts] = useState<Partial<Record<ShareTemplate, { title?: string; caption?: string; kicker?: string }>>>(
    () => (initialKicker ? { note: { kicker: initialKicker } } : {}));
  const [textScale, setTextScale] = useState(1);
  const [align, setAlign] = useState<'left' | 'center'>('left');
  const [quote, setQuote] = useState('');
  const quoteRef = useRef<HTMLTextAreaElement>(null);
  /** Pone (o quita) una marca de formato alrededor de lo seleccionado en el texto. */
  const applyFormat = (mark: '**' | '*' | '==') => {
    const el = quoteRef.current; if (!el) return;
    const a = el.selectionStart, b = el.selectionEnd;
    const sel = quote.slice(a, b) || 'texto';
    const before = quote.slice(0, a), after = quote.slice(b);
    const wrapped = before.endsWith(mark) && after.startsWith(mark);
    const next = wrapped ? before.slice(0, -mark.length) + sel + after.slice(mark.length) : before + mark + sel + mark + after;
    if (next.length > 300) return;
    setQuote(next);
    requestAnimationFrame(() => {
      el.focus();
      const start = wrapped ? a - mark.length : a + mark.length;
      el.setSelectionRange(start, start + sel.length);
    });
  };
  const [accent, setAccent] = useState<string | null>(null);
  const [veil, setVeil] = useState(0.5);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 });
  const [font, setFont] = useState<ShareFont>('moderna');
  const drag = useRef<{ id: number; x: number; y: number; pos: { x: number; y: number } } | null>(null);
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
    return { ...base, caption: undefined };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, exerciseLogs, session]);

  // Plantillas disponibles con los datos que hay (sin gráfica de progreso si no hay registros, etc.)
  const available = TEMPLATES.filter(t =>
    t.id === 'note' ? true : t.id === 'progress' ? !!data?.progress : t.id === 'milestone' ? !!data?.milestone : t.id === 'week' ? !!data?.week : true);
  const active: ShareTemplate = available.some(t => t.id === template) ? template : 'session';
  const [w, h] = shareCardSize(active, format);
  const isNote = active === 'note';
  const tx = texts[active] ?? {};
  const setText = (field: 'title' | 'caption' | 'kicker', value: string) =>
    setTexts(t => ({ ...t, [active]: { ...t[active], [field]: value } }));
  const cardData = useMemo(() => {
    if (!data) return null;
    const d = { ...data, title: tx.title?.trim() ? tx.title : data.title, caption: tx.caption ?? '' };
    if (isNote) return { ...d, title: tx.title ?? '', kicker: undefined, quote };
    if (active === 'progress' && data.progress) return { ...d, title: data.title, progress: { ...data.progress, exercise: tx.title?.trim() || data.progress.exercise } };
    return d;
  }, [data, isNote, active, quote, tx.title, tx.caption]);

  const blobRef = useRef<Blob | null>(null);
  const blobVer = useRef(0);
  const blobTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const draw = useCallback(() => {
    const canvas = canvasRef.current; const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !cardData) return;
    renderShareCard(ctx, cardData, {
      template: active, format, theme, photo, show,
      accent: accent ?? undefined, veil, photoZoom: zoom, photoPos: pos, font, kicker: tx.kicker, textScale, align,
    }, getComputedStyle(document.body).fontFamily);
    // La imagen se prepara para compartir cuando se deja de tocar (no en cada movimiento),
    // y solo vale la del último pintado. Mientras tanto, Compartir la genera del lienzo actual.
    blobRef.current = null;
    const v = ++blobVer.current;
    clearTimeout(blobTimer.current);
    blobTimer.current = setTimeout(() => {
      canvas.toBlob(b => { if (v === blobVer.current) blobRef.current = b; }, 'image/png');
    }, 250);
  }, [cardData, active, format, theme, photo, show, accent, veil, zoom, pos, font, tx.kicker, textScale, align]);
  useEffect(() => {
    draw();
    // Segundo pintado solo si las fuentes aún no habían cargado.
    let alive = true;
    if (document.fonts && document.fonts.status !== 'loaded') document.fonts.ready.then(() => { if (alive) draw(); });
    return () => { alive = false; };
  }, [draw, w, h]);
  useEffect(() => () => clearTimeout(blobTimer.current), []);

  const pickPhoto = (file?: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { setPhoto(img); setPos({ x: 0.5, y: 0.5 }); setZoom(1); URL.revokeObjectURL(url); };
    img.onerror = () => { URL.revokeObjectURL(url); setNotice('No he podido abrir esa foto. Prueba con otra.'); };
    img.src = url;
  };

  // Arrastrar la foto en la vista previa para encuadrarla.
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!photo || active === 'sticker' || drag.current) return; // solo cuenta el primer dedo
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, pos };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const d = drag.current; if (!d || !photo || e.pointerId !== d.id) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const kx = rect.width / w, ky = rect.height / h; // px de pantalla por px de tarjeta, en cada eje
    const iw = photo.naturalWidth || photo.width, ih = photo.naturalHeight || photo.height;
    const sc = Math.max(w / iw, h / ih) * zoom;
    const ox = (iw * sc - w) * kx, oy = (ih * sc - h) * ky; // lo que sobra de foto, en px de pantalla
    setPos({
      x: ox > 1 ? Math.max(0, Math.min(1, d.pos.x - (e.clientX - d.x) / ox)) : 0.5,
      y: oy > 1 ? Math.max(0, Math.min(1, d.pos.y - (e.clientY - d.y) / oy)) : 0.5,
    });
  };
  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => { if (drag.current?.id === e.pointerId) drag.current = null; };
  const field = 'w-full h-11 rounded-xl bg-[rgba(118,118,128,0.10)] px-3.5 text-[15px] text-stone-900 dark:text-white placeholder:text-stone-400 outline-none focus:ring-4 focus:ring-emerald-500/15';
  const pr = data?.progress;
  const captionDefault = active === 'note' ? (data?.userName ?? 'Tu nombre')
    : active === 'session' ? `${data?.userName ?? ''} · con su plan de Fit K`
    : active === 'photo' ? (data?.userName ?? '')
    : active === 'week' ? (data?.week && data.week.done >= data.week.total ? 'Semana completa. Así se construye.' : 'sesiones hechas. Sigo sumando.')
    : active === 'progress' && pr && pr.points.length > 1 ? `De ${pr.points[0].value} a ${pr.points[pr.points.length - 1].value} ${pr.unit} en ${pr.points.length} sesiones`
    : active === 'milestone' ? (data?.milestone?.sub ?? '') : '';
  const kickerDefault = (active === 'note' ? 'Reflexión' : active === 'week' ? 'Mi semana' : active === 'progress' ? 'Mi progreso'
    : active === 'milestone' ? (data?.milestone?.label ?? 'Mi hito') : (data?.kicker ?? 'Entreno completado'));

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
      const text = `${cardData?.title ?? data.title} · Entreno con Fit K 💪 ${window.location.origin}`;
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
    const noteTitle = (texts.note?.title ?? '').trim();
    if (isNote && !quote.trim() && !noteTitle) { setNotice('Escribe tu reflexión antes de publicarla.'); return; }
    setBusy('publish');
    try {
      const blob = await toBlob(); if (!blob) throw new Error('sin imagen');
      const fd = new FormData(); fd.append('file', new File([blob], 'card.png', { type: 'image/png' }));
      const up = await fetch('/api/community/images', { method: 'POST', body: fd });
      const { url } = await up.json(); if (!url) throw new Error('sin url');
      const res = await fetch('/api/community/posts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isNote ? {
          type: 'note', content: [noteTitle, plainText(quote).trim()].filter(Boolean).join('\n\n'),
          displayName: user.profile.name, avatarUrl: user.profile.avatarUrl, photoUrl: url,
        } : {
          type: 'workout', content: cardData?.title ?? data.title, workoutName: cardData?.title ?? data.title, workoutDuration: data.minutes, workoutExercises: data.exercises,
          displayName: user.profile.name, avatarUrl: user.profile.avatarUrl, photoUrl: url,
        }),
      });
      if (!res.ok) throw new Error('post');
      setPublished(true); setNotice('Publicado en la Comunidad'); onPublished?.();
    } catch { setNotice('No se ha podido publicar. Inténtalo de nuevo.'); }
    setBusy(null);
  };

  if (!user || !data) return null;
  const chip = (on: boolean) => `h-9 px-3.5 rounded-full text-xs font-semibold flex-shrink-0 ${on ? 'bg-emerald-500 text-white' : 'bg-[rgba(118,118,128,0.12)] text-stone-600 dark:text-white/70'}`;
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
              <h2 className="text-xl font-bold text-stone-900">Crea tu tarjeta</h2>
              <p className="text-sm text-stone-500">Elige una plantilla y hazla tuya.</p>
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
              <canvas ref={canvasRef} width={w} height={h} aria-label="Vista previa de la tarjeta"
                onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
                style={{ display: 'block', width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: 'min(46dvh, 420px)', touchAction: photo && active !== 'sticker' ? 'none' : 'auto', cursor: photo && active !== 'sticker' ? 'grab' : 'default' }} />
            </div>
          </div>

          <div>
            <p className={label}>Plantilla</p>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-5 px-5 py-2 -my-2">
              {available.map(t => (
                <button key={t.id} type="button" onClick={() => setTemplate(t.id)} aria-pressed={active === t.id} title={t.hint} className={chip(active === t.id)}>{t.label}</button>
              ))}
            </div>
          </div>

          {/* Textos: todo lo que se lee en la tarjeta se puede cambiar */}
          <div className="space-y-2.5">
            <p className={label}>Textos</p>
            {active !== 'sticker' && (
              <label className="block">
                <span className="block text-[11px] text-stone-500 mb-1">Rótulo</span>
                <input id="share-kicker" value={tx.kicker ?? ''} onChange={e => setText('kicker', e.target.value)} maxLength={32} placeholder={kickerDefault}
                  className={field} />
              </label>
            )}
            {isNote && (
              <label className="block">
                <span className="block text-[11px] text-stone-500 mb-1">Título</span>
                <input id="share-note-title" value={tx.title ?? ''} onChange={e => setText('title', e.target.value)} maxLength={70}
                  placeholder="Lo que quieres destacar" className={field} />
              </label>
            )}
            {isNote && (
              <label className="block">
                <span className="flex justify-between text-[11px] text-stone-500 mb-1"><span>Texto</span><span className="tabular-nums">{plainText(quote).length}/220</span></span>
                <span className="flex gap-1.5 mb-1.5" role="toolbar" aria-label="Formato del texto">
                  {([['**', Bold, 'Negrita'], ['*', Italic, 'Cursiva'], ['==', Highlighter, 'Resaltar']] as const).map(([m, Icon, l]) => (
                    <button key={m} type="button" onMouseDown={e => e.preventDefault()} onClick={() => applyFormat(m)} aria-label={l} title={l}
                      className="h-10 px-3 rounded-full bg-[rgba(118,118,128,0.12)] text-stone-700 dark:text-white/80 flex items-center gap-1 text-xs font-semibold">
                      <Icon className="w-3.5 h-3.5" /> {l}
                    </button>
                  ))}
                </span>
                <textarea ref={quoteRef} id="share-quote" value={quote} onChange={e => { const v = e.target.value; if (plainText(v).length <= 220 && v.length <= 300) setQuote(v); }} rows={4}
                  placeholder={prompt || 'Cómo te sientes, qué te ha costado o qué has conseguido…'}
                  className={`bare-input ${field} h-auto py-3 resize-none leading-snug`} />
              </label>
            )}
            {(active === 'session' || active === 'photo' || active === 'sticker' || active === 'progress') && (
              <label className="block">
                <span className="block text-[11px] text-stone-500 mb-1">{active === 'progress' ? 'Ejercicio' : 'Título'}</span>
                <input id="share-title" value={tx.title ?? (active === 'progress' ? data.progress?.exercise ?? '' : data.title)} onChange={e => setText('title', e.target.value)} maxLength={40}
                  placeholder={active === 'progress' ? data.progress?.exercise ?? 'Ejercicio' : data.title} className={field} />
              </label>
            )}
            {active !== 'sticker' && (
              <label className="block">
                <span className="block text-[11px] text-stone-500 mb-1">{isNote ? 'Firma' : active === 'session' || active === 'photo' ? 'Subtítulo' : 'Frase'}</span>
                <input id="share-caption" value={tx.caption ?? ''} onChange={e => setText('caption', e.target.value)} maxLength={60} placeholder={captionDefault} className={field} />
              </label>
            )}
            {active !== 'sticker' && active !== 'week' && active !== 'milestone' && (
              <div className="flex gap-2 pt-0.5">
                <div className="flex-1 grid grid-cols-3 gap-1 p-1 rounded-xl bg-[rgba(118,118,128,0.12)]" role="group" aria-label="Tamaño del texto">
                  {([[0.85, 'Aa−'], [1, 'Aa'], [1.18, 'Aa+']] as const).map(([v, l]) => (
                    <button key={v} type="button" onClick={() => setTextScale(v)} aria-pressed={textScale === v} aria-label={v < 1 ? 'Texto pequeño' : v > 1 ? 'Texto grande' : 'Texto normal'}
                      className={`h-8 rounded-lg text-xs font-bold ${textScale === v ? 'bg-[#fff] dark:bg-[#48484a] text-stone-900 dark:text-white shadow-sm' : 'text-stone-500'}`}>{l}</button>
                  ))}
                </div>
                {isNote && (
                  <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[rgba(118,118,128,0.12)]" role="group" aria-label="Alineación">
                    {(['left', 'center'] as const).map(a => (
                      <button key={a} type="button" onClick={() => setAlign(a)} aria-pressed={align === a} aria-label={a === 'left' ? 'Alinear a la izquierda' : 'Centrar'}
                        className={`h-8 w-10 rounded-lg flex items-center justify-center ${align === a ? 'bg-[#fff] dark:bg-[#48484a] text-stone-900 dark:text-white shadow-sm' : 'text-stone-500'}`}>
                        {a === 'left' ? <AlignLeft className="w-4 h-4" /> : <AlignCenter className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {sessions.length > 1 && !isNote && active !== 'week' && active !== 'progress' && active !== 'milestone' && (
            <div>
              <p className={label}>Sesión</p>
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-5 px-5 py-2 -my-2">
                {sessions.map(s => (
                  <button key={s.id} type="button" onClick={() => { setChosenId(s.id); setTexts(t => ({ ...t, session: { ...t.session, title: undefined }, photo: { ...t.photo, title: undefined }, sticker: { ...t.sticker, title: undefined } })); }} aria-pressed={session?.id === s.id} className={chip(session?.id === s.id)}>{s.name}</button>
                ))}
              </div>
            </div>
          )}

          {active !== 'sticker' && (
            <div>
              <p className={label}>Formato</p>
              <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[rgba(118,118,128,0.12)]">
                {FORMATS.map(f => (
                  <button key={f.id} type="button" onClick={() => setFormat(f.id)} aria-pressed={format === f.id}
                    className={`h-8 rounded-lg text-xs font-semibold ${format === f.id ? 'bg-[#fff] dark:bg-[#48484a] text-stone-900 dark:text-white shadow-sm' : 'text-stone-500'}`}>{f.label}</button>
                ))}
              </div>
            </div>
          )}

          {active !== 'sticker' && (
            <div>
              <p className={label}>{photo ? 'Tono de la foto' : 'Fondo'}</p>
              <div className="flex gap-2.5 overflow-x-auto no-scrollbar -mx-5 px-5 py-1">
                {THEMES.map(t => (
                  <button key={t.id} type="button" onClick={() => setTheme(t.id)} aria-label={`Fondo ${t.label}`} aria-pressed={theme === t.id} title={t.label}
                    className="flex flex-col items-center gap-1 flex-shrink-0">
                    <span className={`w-10 h-10 rounded-full flex items-center justify-center ring-2 ring-offset-2 ring-offset-[#f9f9f8] dark:ring-offset-[#1c1c1e] transition-shadow ${theme === t.id ? 'ring-emerald-500' : 'ring-transparent'}`}
                      style={{ background: `linear-gradient(135deg, ${t.swatch[0]} 50%, ${t.swatch[1]} 50%)`, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.15)' }}>
                      {theme === t.id && <Check className="w-4 h-4 text-white drop-shadow" />}
                    </span>
                    <span className="text-[10px] text-stone-500">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className={label}>Color de acento</p>
            <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar -mx-5 px-5 py-2 -my-1">
              <button type="button" onClick={() => setAccent(null)} aria-pressed={accent === null} title="El de la paleta"
                className={`h-9 px-3 rounded-full text-xs font-semibold flex items-center gap-1 flex-shrink-0 ${accent === null ? 'bg-emerald-500 text-white' : 'bg-[rgba(118,118,128,0.12)] text-stone-600 dark:text-white/70'}`}>
                <Sparkles className="w-3.5 h-3.5" /> Auto
              </button>
              {ACCENTS.map(c => (
                <button key={c.id} type="button" onClick={() => setAccent(c.id)} aria-label={`Acento ${c.label}`} aria-pressed={accent === c.id} title={c.label}
                  className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center ring-2 ring-offset-2 ring-offset-[#f9f9f8] dark:ring-offset-[#1c1c1e] ${accent === c.id ? 'ring-emerald-500' : 'ring-transparent'}`}
                  style={{ background: c.id, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.15)' }}>
                  {accent === c.id && <Check className={`w-4 h-4 ${c.id === '#ffffff' ? 'text-stone-700' : 'text-white drop-shadow'}`} />}
                </button>
              ))}
              <label title="Elige cualquier color" className={`relative w-9 h-9 rounded-full flex-shrink-0 cursor-pointer ring-2 ring-offset-2 ring-offset-[#f9f9f8] dark:ring-offset-[#1c1c1e] ${accent && !ACCENTS.some(c => c.id === accent) ? 'ring-emerald-500' : 'ring-transparent'}`}
                style={{ background: accent && !ACCENTS.some(c => c.id === accent) ? accent : 'conic-gradient(#f43f5e, #f59e0b, #84cc16, #10b981, #06b6d4, #6366f1, #d946ef, #f43f5e)' }}>
                <input type="color" aria-label="Elegir un color de acento" value={accent ?? '#34d399'} onChange={e => setAccent(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </label>
            </div>
          </div>

          {active !== 'sticker' && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <button type="button" onClick={() => fileRef.current?.click()} className="flex-1 h-10 rounded-full bg-[rgba(118,118,128,0.12)] text-sm font-semibold text-stone-800 dark:text-white flex items-center justify-center gap-2">
                  <ImagePlus className="w-4 h-4" /> {photo ? 'Cambiar foto de fondo' : 'Poner una foto de fondo'}
                </button>
                {photo && (
                  <button type="button" onClick={() => setPhoto(null)} aria-label="Quitar la foto" className="w-10 h-10 rounded-full bg-[rgba(118,118,128,0.12)] flex items-center justify-center">
                    <Trash2 className="w-4 h-4 text-stone-600 dark:text-white/70" />
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { pickPhoto(e.target.files?.[0]); e.target.value = ''; }} />
              </div>
              {photo && (
                <div className="rounded-2xl bg-[rgba(118,118,128,0.08)] p-3.5 space-y-3">
                  <label className="block">
                    <span className="flex justify-between text-xs font-semibold text-stone-600 dark:text-white/70 mb-1.5"><span>Oscurecer</span><span className="tabular-nums">{Math.round(veil * 100)}%</span></span>
                    <input id="share-veil" type="range" min={0} max={1} step={0.05} value={veil} onChange={e => setVeil(Number(e.target.value))} className="w-full accent-emerald-500" />
                  </label>
                  <label className="block">
                    <span className="flex justify-between text-xs font-semibold text-stone-600 dark:text-white/70 mb-1.5"><span>Zoom</span><span className="tabular-nums">{Math.round(zoom * 100)}%</span></span>
                    <input id="share-zoom" type="range" min={1} max={3} step={0.05} value={zoom} onChange={e => setZoom(Number(e.target.value))} className="w-full accent-emerald-500" />
                  </label>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-stone-500 flex items-center gap-1.5"><Move className="w-3.5 h-3.5" /> Arrastra la foto en la vista previa para encuadrarla.</span>
                    <button type="button" onClick={() => { setPos({ x: 0.5, y: 0.5 }); setZoom(1); setVeil(0.5); }} className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 flex-shrink-0">
                      <RotateCcw className="w-3.5 h-3.5" /> Restablecer
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <p className={label}>Letra</p>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[rgba(118,118,128,0.12)]">
              {FONTS.map(f => (
                <button key={f.id} type="button" onClick={() => setFont(f.id)} aria-pressed={font === f.id}
                  style={f.stack ? { fontFamily: f.stack } : undefined}
                  className={`h-8 rounded-lg text-xs font-semibold ${font === f.id ? 'bg-[#fff] dark:bg-[#48484a] text-stone-900 dark:text-white shadow-sm' : 'text-stone-500'}`}>{f.label}</button>
              ))}
            </div>
          </div>

          {active === 'photo' && !photo && (
            <p className="text-xs text-stone-500 -mt-2">Esta plantilla luce con una foto tuya de fondo: la del gimnasio, la de después de entrenar…</p>
          )}

          {(active === 'note' || active === 'milestone') && (
            <div>
              <p className={label}>Qué se ve</p>
              <button type="button" onClick={() => setShow(s => ({ ...s, name: !s.name }))} aria-pressed={show.name} className={chip(show.name)}>{isNote ? 'Firma' : 'Mi nombre'}</button>
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
            <Button onClick={handleShare} disabled={!!busy} className="flex-1 h-12 rounded-full text-base">
              {busy === 'share' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />} Compartir
            </Button>
            <Button onClick={handleSave} disabled={!!busy} variant="secondary" aria-label="Guardar la imagen" className="h-12 w-12 rounded-full p-0">
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
