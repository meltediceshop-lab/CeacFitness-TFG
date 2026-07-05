'use client';

import { motion } from 'framer-motion';
import type { MacroTargets } from '@/types/user';
import { MACRO_COLORS } from '@/lib/nutritionUtils';

function Ring({
  value, max, size, stroke, color, track,
}: {
  value: number; max: number; size: number; stroke: number; color: string; track: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c * (1 - pct) }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      />
    </svg>
  );
}

function MacroRing({ label, value, target, color }: { label: string; value: number; target: number; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: 58, height: 58 }}>
        <Ring value={value} max={target} size={58} stroke={6} color={color} track="rgba(120,120,120,0.18)" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[11px] font-bold text-stone-700 dark:text-stone-200">{Math.round(value)}</span>
        </div>
      </div>
      <p className="text-[10px] text-stone-500">{label}</p>
      <p className="text-[10px] font-medium" style={{ color }}>{Math.round(value)}/{target}g</p>
    </div>
  );
}

export function DailyRings({
  consumed,
  targets,
}: {
  consumed: MacroTargets;
  targets: MacroTargets;
}) {
  const remaining = Math.max(0, targets.kcal - consumed.kcal);
  const over = consumed.kcal > targets.kcal;

  return (
    <div className="flex flex-col items-center">
      {/* Calorie ring */}
      <div className="relative" style={{ width: 168, height: 168 }}>
        <Ring
          value={consumed.kcal}
          max={targets.kcal}
          size={168}
          stroke={13}
          color={over ? '#ef4444' : MACRO_COLORS.kcal}
          track="rgba(120,120,120,0.16)"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-stone-900">{Math.round(consumed.kcal)}</span>
          <span className="text-xs text-stone-400">de {targets.kcal} kcal</span>
          <span className={`text-xs font-semibold mt-1 ${over ? 'text-red-500' : 'text-emerald-600'}`}>
            {over ? `+${consumed.kcal - targets.kcal} pasado` : `${remaining} restantes`}
          </span>
        </div>
      </div>

      {/* Macro rings */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <MacroRing label="Proteína" value={consumed.protein} target={targets.protein} color={MACRO_COLORS.protein} />
        <MacroRing label="Carbos" value={consumed.carbs} target={targets.carbs} color={MACRO_COLORS.carbs} />
        <MacroRing label="Grasas" value={consumed.fats} target={targets.fats} color={MACRO_COLORS.fats} />
      </div>
    </div>
  );
}