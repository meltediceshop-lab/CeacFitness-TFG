'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2, Twitter, Image as ImageIcon, Users, Loader2, ZoomIn, Pencil } from 'lucide-react';
import { useScrollLock } from '@/hooks/useScrollLock';

// ─── Tipos ────────────────────────────────────────────────────────────────────
export interface ShareCardData {
  type: 'note' | 'workout';
  content: string;
  workoutStats?: { minutes: number; exercises: number; kcal?: number };
  workoutNote?: string;
  userName: string;
  initialUserPhotoUrl?: string;
}

// ─── Fotos de fondo fitness (Unsplash CORS habilitado) ────────────────────────
// Formato vertical 9:16
const BG_PHOTOS = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=711&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=711&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=711&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&h=711&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=711&fit=crop&auto=format&q=80',
];
function randomBgPhoto() {
  return BG_PHOTOS[Math.floor(Math.random() * BG_PHOTOS.length)];
}

// ─── Tarjeta Nota — vertical 9:16 (400×711) ──────────────────────────────────
function NoteCard({
  data,
  userPhotoUrl,
  bgPhoto,
  cardRef,
}: {
  data: ShareCardData;
  userPhotoUrl?: string;
  bgPhoto: string;
  cardRef: React.RefObject<HTMLDivElement>;
}) {
  const dateStr = new Date()
    .toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase();

  return (
    <div
      ref={cardRef}
      style={{ width: 400, height: 711, fontFamily: 'system-ui,-apple-system,sans-serif' }}
      className="relative overflow-hidden rounded-2xl flex-shrink-0"
    >
      {/* Foto de fondo ocupa el 72% superior */}
      <img
        src={userPhotoUrl || bgPhoto}
        alt="bg"
        crossOrigin="anonymous"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '72%', objectFit: 'cover' }}
      />
      <div style={{ position: 'absolute', inset: 0, height: '72%', background: 'linear-gradient(to bottom,rgba(0,0,0,.25),rgba(0,0,0,.7))' }} />

      {/* Logo K */}
      <div style={{ position: 'absolute', top: 24, left: 24, color: '#22d3ee', fontSize: 32, fontWeight: 900, letterSpacing: -1 }}>K</div>

      {/* Panel crema inferior (28%) */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '31%',
        background: '#f5f0e8', padding: '22px 28px 20px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: '#78716c', textTransform: 'uppercase' }}>Reflexión del día</span>
            <span style={{ fontSize: 16, color: '#22d3ee' }}>❝</span>
          </div>
          <p style={{ fontStyle: 'italic', fontSize: 16, lineHeight: 1.6, color: '#1c1917', display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {data.content || 'Tu reflexión aparecerá aquí…'}
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
          <span style={{ fontSize: 10, color: '#a8a29e', letterSpacing: 1 }}>{dateStr}</span>
          <span style={{ fontSize: 18, fontWeight: 900, color: '#22d3ee' }}>K</span>
        </div>
      </div>
    </div>
  );
}

// ─── Tarjeta Entrenamiento — vertical 9:16 (400×711) ─────────────────────────
function WorkoutCard({
  data,
  userPhotoUrl,
  bgPhoto,
  cardRef,
}: {
  data: ShareCardData;
  userPhotoUrl?: string;
  bgPhoto: string;
  cardRef: React.RefObject<HTMLDivElement>;
}) {
  const { workoutStats, workoutNote, content } = data;
  return (
    <div
      ref={cardRef}
      style={{ width: 400, height: 711, fontFamily: 'system-ui,-apple-system,sans-serif', background: '#0a0a0a', borderRadius: 16, overflow: 'hidden', position: 'relative' }}
    >
      {/* Foto / gradiente ocupan el 65% superior */}
      {userPhotoUrl ? (
        <img src={userPhotoUrl} alt="workout" crossOrigin="anonymous"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '65%', objectFit: 'cover' }} />
      ) : (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '65%', background: 'linear-gradient(135deg,#0a0a0a 0%,#0e7490 60%,#22d3ee 100%)' }} />
      )}
      {userPhotoUrl && (
        <div style={{ position: 'absolute', inset: 0, height: '65%', background: 'linear-gradient(to bottom,rgba(0,0,0,.15),rgba(10,10,10,.95))' }} />
      )}

      {/* Logo */}
      <div style={{ position: 'absolute', top: 24, left: 24, color: '#22d3ee', fontSize: 32, fontWeight: 900 }}>K</div>

      {/* Panel oscuro inferior (35%) */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '38%', background: '#111', padding: '22px 28px 28px' }}>
        <p style={{ fontSize: 10, letterSpacing: 2, color: '#6b7280', textTransform: 'uppercase', marginBottom: 6 }}>Resumen del entreno</p>
        <p style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 10, lineHeight: 1.1 }}>{content || 'Entrenamiento'}</p>
        <div style={{ height: 3, borderRadius: 2, background: 'linear-gradient(to right,#22d3ee,#3b82f6)', marginBottom: 16 }} />
        {workoutStats && (
          <div style={{ display: 'flex', gap: 28, marginBottom: 16 }}>
            {([['minutes', 'min'], ['exercises', 'ejerc.']] as const).map(([k, l]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{workoutStats[k as 'minutes' | 'exercises']}</span>
                <span style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 }}>{l}</span>
              </div>
            ))}
            {workoutStats.kcal && (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{workoutStats.kcal}</span>
                <span style={{ fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 }}>kcal</span>
              </div>
            )}
          </div>
        )}
        {workoutNote && (
          <div style={{ background: '#1c1c1e', borderRadius: 20, padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>💬</span>
            <span style={{ fontSize: 13, color: '#e5e7eb', fontStyle: 'italic' }}>{workoutNote}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Visor de foto a pantalla completa ───────────────────────────────────────
function PhotoViewer({ url, onClose, onReplace }: { url: string; onClose: () => void; onReplace: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] bg-black flex flex-col items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 p-2 bg-white/10 rounded-full text-white z-10"
      >
        <X className="w-5 h-5" />
      </button>
      <button
        onClick={e => { e.stopPropagation(); onReplace(); }}
        className="absolute top-5 left-5 flex items-center gap-2 px-3 py-2 bg-white/10 rounded-full text-white text-xs font-semibold z-10"
      >
        <Pencil className="w-3.5 h-3.5" />
        Cambiar foto
      </button>
      <img
        src={url}
        alt="preview"
        className="max-w-full max-h-full object-contain"
        onClick={e => e.stopPropagation()}
      />
    </motion.div>
  );
}

// ─── Modal principal ───────────────────────────────────────────────────────────
export function ShareCardModal({
  data,
  onClose,
  onPublishToCommunity,
}: {
  data: ShareCardData;
  onClose: () => void;
  /** Recibe la URL pública de la tarjeta capturada (o undefined si no hay foto) */
  onPublishToCommunity?: (imageUrl?: string) => Promise<void>;
}) {
  useScrollLock();

  const [template, setTemplate]         = useState<0 | 1>(data.type === 'workout' ? 1 : 0);
  const [userFile, setUserFile]         = useState<File | null>(null);
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | undefined>(data.initialUserPhotoUrl);
  const [bgPhoto]                       = useState(randomBgPhoto);
  const [sharing, setSharing]           = useState(false);
  const [publishing, setPublishing]     = useState(false);
  const [published, setPublished]       = useState(false);
  const [showViewer, setShowViewer]     = useState(false);

  const noteCardRef    = useRef<HTMLDivElement>(null!);
  const workoutCardRef = useRef<HTMLDivElement>(null!);
  const fileInputRef   = useRef<HTMLInputElement>(null!);
  const activeRef      = template === 0 ? noteCardRef : workoutCardRef;

  const handleFileChange = (file: File | null | undefined) => {
    if (!file) return;
    if (userPhotoUrl) URL.revokeObjectURL(userPhotoUrl);
    setUserFile(file);
    setUserPhotoUrl(URL.createObjectURL(file));
    setShowViewer(false);
  };

  const captureCard = useCallback(async (): Promise<Blob | null> => {
    const el = activeRef.current;
    if (!el) return null;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(el, { useCORS: true, allowTaint: false, scale: 2, backgroundColor: null, logging: false });
      return await new Promise(r => canvas.toBlob(b => r(b), 'image/png', 0.95));
    } catch { return null; }
  }, [activeRef]);

  // Sube la tarjeta capturada a Storage y devuelve la URL pública
  const uploadCardImage = async (blob: Blob): Promise<string | undefined> => {
    try {
      const fd = new FormData();
      fd.append('file', new File([blob], 'card.png', { type: 'image/png' }));
      const res = await fetch('/api/community/images', { method: 'POST', body: fd });
      if (!res.ok) return undefined;
      const json = await res.json();
      return json.url as string;
    } catch { return undefined; }
  };

  const handleDownload = async () => {
    setSharing(true);
    const blob = await captureCard();
    setSharing(false);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitk-${data.type}-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleNativeShare = async () => {
    setSharing(true);
    const blob = await captureCard();
    setSharing(false);
    if (!blob) { handleDownload(); return; }
    const file = new File([blob], 'fitk-share.png', { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Fit K', text: data.type === 'note' ? data.content : `${data.content} · Fit K` });
      } catch { /* cancelado */ }
    } else {
      handleDownload();
    }
  };

  const handleTwitter = () => {
    const text = encodeURIComponent(
      data.type === 'note'
        ? `${data.content} #FitK #fitness`
        : `Acabo de terminar: ${data.content} · ${data.workoutStats?.minutes ?? 0} min 💪 #FitK`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const handlePublishToCommunity = async () => {
    if (!onPublishToCommunity || published) return;
    setPublishing(true);
    let imageUrl: string | undefined;
    // Solo captura y sube si hay foto (o si hay tarjeta con gradiente de entreno)
    if (userPhotoUrl || data.type === 'workout') {
      const blob = await captureCard();
      if (blob) imageUrl = await uploadCardImage(blob);
    }
    await onPublishToCommunity(imageUrl);
    setPublishing(false);
    setPublished(true);
  };

  // Preview escala: el card mide 400×711, lo mostramos a escala ~0.72 → altura real ≈ 512
  const SCALE = 0.72;
  const previewH = Math.round(711 * SCALE);

  return (
    <>
      <AnimatePresence>
        {showViewer && userPhotoUrl && (
          <PhotoViewer
            url={userPhotoUrl}
            onClose={() => setShowViewer(false)}
            onReplace={() => { setShowViewer(false); fileInputRef.current?.click(); }}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/75 z-[80] flex flex-col items-center justify-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="w-full bg-[#111] rounded-t-3xl p-5 pb-10 overflow-y-auto max-h-[94vh]"
          onClick={e => e.stopPropagation()}
        >
          {/* Handle */}
          <div className="w-10 h-1 bg-stone-600 rounded-full mx-auto mb-5" />

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-lg">Compartir</h3>
            <button onClick={onClose} className="p-1 text-stone-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Selector plantilla */}
          <div className="flex gap-2 mb-4">
            {(['Nota / Reflexión', 'Entrenamiento'] as const).map((label, i) => (
              <button
                key={i}
                onClick={() => setTemplate(i as 0 | 1)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${template === i ? 'bg-cyan-500 text-black' : 'bg-stone-800 text-stone-400'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Preview tarjeta vertical */}
          <div className="flex justify-center mb-4 overflow-hidden" style={{ height: previewH }}>
            <div style={{ transform: `scale(${SCALE})`, transformOrigin: 'top center' }}>
              <AnimatePresence mode="wait">
                {template === 0 ? (
                  <motion.div key="note" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                    <NoteCard data={data} userPhotoUrl={userPhotoUrl} bgPhoto={bgPhoto} cardRef={noteCardRef} />
                  </motion.div>
                ) : (
                  <motion.div key="workout" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <WorkoutCard data={data} userPhotoUrl={userPhotoUrl} bgPhoto={bgPhoto} cardRef={workoutCardRef} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Input de archivo oculto */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => handleFileChange(e.target.files?.[0])}
          />

          {/* Añadir / ver foto */}
          {userPhotoUrl ? (
            <div className="flex items-center gap-3 p-3 rounded-2xl border border-cyan-500 bg-cyan-500/10 mb-4">
              {/* Miniatura → abre visor */}
              <button
                type="button"
                onClick={() => setShowViewer(true)}
                className="relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden group"
              >
                <img src={userPhotoUrl} alt="preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ZoomIn className="w-4 h-4 text-white" />
                </div>
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-cyan-400">Foto añadida ✓</p>
                <p className="text-xs text-stone-500">Toca la miniatura para ver o cambiar</p>
              </div>
              <button
                type="button"
                onClick={() => { if (userPhotoUrl) URL.revokeObjectURL(userPhotoUrl); setUserPhotoUrl(undefined); setUserFile(null); }}
                className="text-stone-500 hover:text-white p-1 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-3 p-3 rounded-2xl border border-dashed border-stone-600 hover:border-stone-400 transition-colors mb-4"
            >
              <div className="w-10 h-10 rounded-xl bg-stone-800 flex items-center justify-center flex-shrink-0">
                <ImageIcon className="w-5 h-5 text-stone-400" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-stone-300">Añadir tu foto</p>
                <p className="text-xs text-stone-500">Para la tarjeta de Historias / WhatsApp</p>
              </div>
            </button>
          )}

          {/* Botones RRSS */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <button onClick={handleNativeShare} disabled={sharing}
              className="flex flex-col items-center gap-1.5 py-3 bg-stone-800 rounded-2xl hover:bg-stone-700 transition-colors disabled:opacity-50">
              <Share2 className="w-5 h-5 text-cyan-400" />
              <span className="text-xs text-stone-300">Compartir</span>
            </button>
            <button onClick={handleTwitter}
              className="flex flex-col items-center gap-1.5 py-3 bg-stone-800 rounded-2xl hover:bg-stone-700 transition-colors">
              <Twitter className="w-5 h-5 text-sky-400" />
              <span className="text-xs text-stone-300">Twitter / X</span>
            </button>
            <button onClick={handleDownload} disabled={sharing}
              className="flex flex-col items-center gap-1.5 py-3 bg-stone-800 rounded-2xl hover:bg-stone-700 transition-colors disabled:opacity-50">
              <Download className="w-5 h-5 text-emerald-400" />
              <span className="text-xs text-stone-300">Descargar</span>
            </button>
          </div>

          {/* Publicar en Comunidad */}
          {onPublishToCommunity && (
            <button
              onClick={handlePublishToCommunity}
              disabled={publishing || published}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all ${published ? 'bg-stone-700 text-stone-400' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
            >
              {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
              {published ? 'Publicado en Comunidad ✓' : 'Publicar también en Comunidad'}
            </button>
          )}

          {(sharing || publishing) && (
            <p className="text-center text-stone-500 text-xs mt-3">
              {publishing ? 'Subiendo y publicando…' : 'Generando imagen…'}
            </p>
          )}
        </motion.div>
      </motion.div>
    </>
  );
}
