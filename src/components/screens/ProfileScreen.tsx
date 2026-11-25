'use client';

import { useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/ui/BottomNav';
import { TimePicker } from '@/components/ui/TimePicker';
import { motion, AnimatePresence } from 'framer-motion';
import type { MeasurementReminderFrequency, WorkoutDuration } from '@/types/user';
import {
  ArrowLeft, Camera, ChevronRight, Calendar, Clock, Bell, Moon, Apple, LogOut, Minus, Plus, Loader2,
} from 'lucide-react';

// ── Recordatorio de medidas ───────────────────────────────────────
const FREQUENCIES: MeasurementReminderFrequency[] = ['weekly', '2weeks', '3weeks', 'monthly', '3sessions', '5sessions'];
function frequencyLabel(f: MeasurementReminderFrequency): string {
  const map: Record<MeasurementReminderFrequency, string> = {
    weekly: 'Cada semana', '2weeks': 'Cada 2 semanas', '3weeks': 'Cada 3 semanas',
    monthly: 'Cada mes', '3sessions': 'Cada 3 sesiones', '5sessions': 'Cada 5 sesiones',
  };
  return map[f];
}

// ── Duración habitual (valores que admite la base de datos) ───────
const DURATION_MINUTES: Record<string, number> = { '30min': 30, '40min': 40, '45min': 45, '1hour': 60 };
const minutesToDuration = (m: number): WorkoutDuration => (m === 60 ? '1hour' : (`${m}min` as WorkoutDuration));

/** Reduce la foto en el móvil (lado mayor 512 px, JPEG) antes de subirla. */
async function shrinkImage(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 512 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/jpeg', 0.85));
    return blob ? new File([blob], 'avatar.jpg', { type: 'image/jpeg' }) : file;
  } catch {
    return file;
  }
}

/** Fila de ajustes estilo iOS: icono de color, texto y control a la derecha. */
function Row({ icon: Icon, tint, title, subtitle, children, onClick, danger }: {
  icon: typeof Calendar; tint: string; title: string; subtitle?: string;
  children?: React.ReactNode; onClick?: () => void; danger?: boolean;
}) {
  const content = (
    <>
      <span className={`w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0 ${tint}`}>
        <Icon className="w-4 h-4 text-white" />
      </span>
      <span className="flex-1 min-w-0 text-left">
        <span className={`block text-[15px] ${danger ? 'text-red-600 font-medium' : 'text-stone-900'}`}>{title}</span>
        {subtitle && <span className="block text-xs text-stone-500">{subtitle}</span>}
      </span>
      {children}
    </>
  );
  return onClick
    ? <button type="button" onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3 active:bg-black/5 dark:active:bg-white/5 transition-colors">{content}</button>
    : <div className="flex items-center gap-3 px-4 py-3">{content}</div>;
}

function Section({ title, children, footer }: { title: string; children: React.ReactNode; footer?: string }) {
  return (
    <section>
      <p className="px-4 mb-1.5 text-xs font-semibold uppercase tracking-wide text-stone-500">{title}</p>
      <div className="glass-card rounded-2xl divide-y divide-black/5 dark:divide-white/10">{children}</div>
      {footer && <p className="px-4 mt-1.5 text-xs text-stone-500">{footer}</p>}
    </section>
  );
}

// ── Pantalla ──────────────────────────────────────────────────────
export function ProfileScreen() {
  const { user, setUser, setScreen, logout, isDark, toggleDarkMode, updateAvatar, updateTrainingPrefs } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showReminder, setShowReminder] = useState(false);

  if (!user) return null;

  const onboarding = user.onboarding as { daysPerWeek?: number; workoutDuration?: string };
  const days = onboarding.daysPerWeek ?? user.weeklySessions.length ?? 3;
  const minutes = DURATION_MINUTES[onboarding.workoutDuration ?? ''] ?? 45;
  const frequency: MeasurementReminderFrequency = user.profile.reminderFrequency ?? 'weekly';
  const initial = user.profile.name?.charAt(0).toUpperCase() ?? 'U';

  const pickPhoto = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setPhotoError(false);
    const ok = await updateAvatar(await shrinkImage(file));
    setUploading(false);
    setPhotoError(!ok);
  };

  const stats = [
    { value: String(user.totalCompletedSessions ?? 0), label: 'sesiones' },
    { value: user.profile.weight ? `${user.profile.weight}` : '—', unit: 'kg', label: 'peso' },
    { value: user.profile.height ? `${user.profile.height}` : '—', unit: 'cm', label: 'altura' },
  ];

  return (
    <div className="min-h-dvh glass-bg flex flex-col pb-28">
      <div className="px-4 pt-6 flex items-center justify-between">
        <button onClick={() => setScreen('dashboard')} aria-label="Volver" className="w-10 h-10 rounded-full glass-btn flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-stone-700" />
        </button>
        <p className="text-base font-semibold text-stone-900">Perfil</p>
        <span className="w-10" />
      </div>

      {/* Foto, nombre y cifras */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-4 pt-6 pb-2 flex flex-col items-center text-center">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          aria-label="Cambiar foto de perfil"
          className="relative w-28 h-28 rounded-full p-1 glass-card"
        >
          <span className="block w-full h-full rounded-full overflow-hidden bg-emerald-500 flex items-center justify-center">
            {user.profile.avatarUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={user.profile.avatarUrl} alt="Tu foto de perfil" className="w-full h-full object-cover" />
              : <span className="text-4xl font-semibold text-white">{initial}</span>}
          </span>
          {uploading && (
            <span className="absolute inset-1 rounded-full bg-black/40 flex items-center justify-center">
              <Loader2 className="w-7 h-7 text-white animate-spin" />
            </span>
          )}
          <span className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-emerald-500 ring-4 ring-[var(--app-bg)] flex items-center justify-center shadow">
            <Camera className="w-4 h-4 text-white" />
          </span>
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { pickPhoto(e.target.files?.[0]); e.target.value = ''; }} />
        <h1 className="mt-4 text-2xl font-semibold text-stone-900">{user.profile.name}</h1>
        <p className="text-sm text-stone-500">Semana {user.currentWeek} · {user.level === 'advanced' ? 'Entrena con constancia' : 'Empezando'}</p>
        <button type="button" onClick={() => fileRef.current?.click()} className="mt-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
          {user.profile.avatarUrl ? 'Cambiar foto' : 'Añadir foto'}
        </button>
        {photoError && <p className="mt-1 text-xs text-red-600">No se ha podido subir la foto. Inténtalo de nuevo.</p>}

        <div className="mt-5 w-full glass-card rounded-2xl grid grid-cols-3 divide-x divide-black/5 dark:divide-white/10 py-3">
          {stats.map(s => (
            <div key={s.label}>
              <p className="text-xl font-semibold text-stone-900 tabular-nums">
                {s.value}{s.unit && s.value !== '—' && <span className="text-xs text-stone-400 ml-0.5">{s.unit}</span>}
              </p>
              <p className="text-[11px] uppercase tracking-wide text-stone-500">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="px-4 pt-4 space-y-6">
        <Section title="Entrenamiento" footer="Los cambios se aplican desde la próxima semana. Cada semana también puedes ajustarlos al planificarla.">
          <Row icon={Calendar} tint="bg-emerald-500" title="Días por semana">
            <span className="flex items-center gap-2">
              <button type="button" aria-label="Un día menos" disabled={days <= 1} onClick={() => updateTrainingPrefs({ daysPerWeek: days - 1 })}
                className="w-8 h-8 rounded-full bg-[rgba(118,118,128,0.12)] flex items-center justify-center disabled:opacity-30">
                <Minus className="w-4 h-4 text-stone-700" />
              </button>
              <span className="w-5 text-center font-semibold text-stone-900 tabular-nums">{days}</span>
              <button type="button" aria-label="Un día más" disabled={days >= 6} onClick={() => updateTrainingPrefs({ daysPerWeek: days + 1 })}
                className="w-8 h-8 rounded-full bg-[rgba(118,118,128,0.12)] flex items-center justify-center disabled:opacity-30">
                <Plus className="w-4 h-4 text-stone-700" />
              </button>
            </span>
          </Row>
          <Row icon={Clock} tint="bg-teal-500" title="Duración habitual">
            <TimePicker value={minutes} options={[30, 40, 45, 60]} label="Duración habitual" onChange={m => updateTrainingPrefs({ workoutDuration: minutesToDuration(m) })} />
          </Row>
          <Row icon={Apple} tint="bg-lime-500" title="Nutrición" subtitle="Hidratación y comidas" onClick={() => setScreen('nutrition')}>
            <ChevronRight className="w-4 h-4 text-stone-300" />
          </Row>
        </Section>

        <Section title="Preferencias">
          <Row icon={Moon} tint="bg-indigo-500" title="Modo oscuro" onClick={toggleDarkMode}>
            <span role="switch" aria-checked={isDark} className={`relative w-[51px] h-[31px] rounded-full transition-colors ${isDark ? 'bg-emerald-500' : 'bg-[rgba(120,120,128,0.24)]'}`}>
              <span className={`absolute top-0.5 left-0.5 w-[27px] h-[27px] rounded-full bg-[#fff] shadow transition-transform ${isDark ? 'translate-x-5' : ''}`} />
            </span>
          </Row>
          <Row icon={Bell} tint="bg-amber-500" title="Recordar medidas" subtitle={frequencyLabel(frequency)} onClick={() => setShowReminder(v => !v)}>
            <ChevronRight className={`w-4 h-4 text-stone-300 transition-transform ${showReminder ? 'rotate-90' : ''}`} />
          </Row>
          <AnimatePresence initial={false}>
            {showReminder && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="px-4 py-3 flex flex-wrap gap-2">
                  {FREQUENCIES.map(f => (
                    <button key={f} type="button" aria-pressed={frequency === f}
                      onClick={() => { setUser({ ...user, profile: { ...user.profile, reminderFrequency: f } }); setShowReminder(false); }}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${frequency === f ? 'bg-emerald-500 text-white' : 'bg-[rgba(118,118,128,0.12)] text-stone-600 dark:text-white/70'}`}>
                      {frequencyLabel(f)}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Section>

        <Section title="Cuenta">
          <Row icon={LogOut} tint="bg-red-500" title="Cerrar sesión" danger onClick={() => setShowLogoutConfirm(true)} />
        </Section>

        <p className="text-center text-xs text-stone-400 pt-2">Fit K · Entrena tu cuerpo. Cuida tu cabeza.</p>
      </div>

      <BottomNav active="profile" />

      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass-modal rounded-3xl p-6 max-w-sm w-full"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-stone-900 mb-2">¿Cerrar sesión?</h3>
              <p className="text-stone-500 mb-6">Tendrás que volver a iniciar sesión para acceder a tu cuenta.</p>
              <div className="flex gap-3">
                <Button onClick={() => setShowLogoutConfirm(false)} variant="outline" className="flex-1 h-12 rounded-xl">Cancelar</Button>
                <Button onClick={() => { logout(); setShowLogoutConfirm(false); }} className="flex-1 h-12 rounded-xl bg-red-500 hover:bg-red-600">Cerrar sesión</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
