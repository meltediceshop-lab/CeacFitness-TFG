'use client';

import type { ClockStyle } from '@/types/user';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function toXY(angleDeg: number, cx: number, cy: number, length: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + length * Math.cos(rad), y: cy + length * Math.sin(rad) };
}

// ─── Reloj analógico ──────────────────────────────────────────────────────────
function AnalogClock({ elapsed, size = 44 }: { elapsed: number; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const r  = size / 2 - 2;

  const secDeg  = (elapsed % 60)        * 6;         // 6° por segundo
  const minDeg  = ((elapsed / 60) % 60) * 6;         // 6° por minuto
  const hourDeg = ((elapsed / 3600) % 12) * 30;      // 30° por hora

  const sec  = toXY(secDeg,  cx, cy, r * 0.80);
  const min  = toXY(minDeg,  cx, cy, r * 0.68);
  const hour = toXY(hourDeg, cx, cy, r * 0.48);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Cara */}
      <circle cx={cx} cy={cy} r={r} fill="white" stroke="#d1fae5" strokeWidth="1.5" />

      {/* Marcas de hora */}
      {Array.from({ length: 12 }, (_, i) => {
        const dot = toXY(i * 30, cx, cy, r * 0.80);
        return (
          <circle key={i} cx={dot.x} cy={dot.y}
            r={i % 3 === 0 ? 1.8 : 1}
            fill={i % 3 === 0 ? '#10b981' : '#d1d5db'} />
        );
      })}

      {/* Manecilla hora */}
      <line x1={cx} y1={cy} x2={hour.x} y2={hour.y}
        stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" />

      {/* Manecilla minuto */}
      <line x1={cx} y1={cy} x2={min.x} y2={min.y}
        stroke="#44403c" strokeWidth="1.8" strokeLinecap="round" />

      {/* Manecilla segundo — suave continuo */}
      <line x1={cx} y1={cy} x2={sec.x} y2={sec.y}
        stroke="#10b981" strokeWidth="1.1" strokeLinecap="round" />

      {/* Pivote central */}
      <circle cx={cx} cy={cy} r="2.2" fill="#10b981" />
    </svg>
  );
}

// ─── Reloj digital ────────────────────────────────────────────────────────────
function DigitalClock({ elapsed }: { elapsed: number }) {
  return (
    <div className="bg-white rounded-xl px-2.5 py-1 shadow-sm text-center min-w-[60px]">
      <span className="text-emerald-600 font-mono font-bold text-sm tracking-wider tabular-nums">
        {formatTime(elapsed)}
      </span>
    </div>
  );
}

// ─── Componente exportado ─────────────────────────────────────────────────────
export function WorkoutClock({
  elapsed,
  style,
  targetMinutes,
}: {
  elapsed: number;
  style: ClockStyle;
  targetMinutes?: number;
}) {
  const isOverTarget = targetMinutes != null && elapsed >= targetMinutes * 60;

  return (
    <div className="relative">
      {style === 'analog'
        ? <AnalogClock elapsed={elapsed} size={44} />
        : <DigitalClock elapsed={elapsed} />}

      {/* Punto indicador cuando supera el objetivo */}
      {isOverTarget && (
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-white" />
      )}
    </div>
  );
}

// ─── Versión grande para modal/expandida ──────────────────────────────────────
export function WorkoutClockLarge({
  elapsed,
  style,
  targetMinutes,
}: {
  elapsed: number;
  style: ClockStyle;
  targetMinutes?: number;
}) {
  const isOverTarget = targetMinutes != null && elapsed >= targetMinutes * 60;

  return (
    <div className="flex flex-col items-center gap-2">
      {style === 'analog'
        ? <AnalogClock elapsed={elapsed} size={120} />
        : (
          <div className="bg-stone-900 rounded-2xl px-6 py-4">
            <span className="text-emerald-400 font-mono font-bold text-4xl tracking-widest tabular-nums">
              {formatTime(elapsed)}
            </span>
          </div>
        )}
      {isOverTarget && targetMinutes && (
        <p className="text-amber-600 text-xs font-medium">
          Objetivo de {targetMinutes} min superado
        </p>
      )}
    </div>
  );
}

export { formatTime };
