// Calorías y macros a partir de los datos de la persona.
// - Metabolismo basal: Katch-McArdle si se conoce el % de grasa (más preciso),
//   si no, Mifflin-St Jeor.
// - Gasto diario = basal × factor de actividad.
// - Objetivo = gasto diario ajustado según la meta y el ritmo.
// - Proteína por kg (o por kg de masa magra), grasas ≥ 0,8 g/kg y el resto hidratos.

import type { AgeRange, BiologicalProfile, MacroTargets } from '@/types/user';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'high' | 'athlete';
export type EnergyGoal = 'lose' | 'maintain' | 'gain' | 'performance';
export type GoalPace = 'gentle' | 'normal' | 'fast';

export interface BodyData {
  sex: BiologicalProfile;
  age: number;
  weightKg: number;
  heightCm: number;
  /** % de grasa corporal (báscula de bioimpedancia o plicómetro). */
  bodyFatPct?: number;
  /** Masa muscular en kg (báscula). Solo informativa. */
  muscleKg?: number;
  activity: ActivityLevel;
  goal: EnergyGoal;
  pace: GoalPace;
}

export const ACTIVITY_LEVELS: { id: ActivityLevel; label: string; hint: string; factor: number }[] = [
  { id: 'sedentary', label: 'Sedentario', hint: 'Trabajo sentado y poco movimiento', factor: 1.2 },
  { id: 'light', label: 'Ligero', hint: 'Entrenas 1–2 días o caminas a diario', factor: 1.375 },
  { id: 'moderate', label: 'Moderado', hint: 'Entrenas 3–4 días a la semana', factor: 1.55 },
  { id: 'high', label: 'Alto', hint: 'Entrenas 5–6 días o trabajo físico', factor: 1.725 },
  { id: 'athlete', label: 'Muy alto', hint: 'Doble sesión o deporte de competición', factor: 1.9 },
];
export const ENERGY_GOALS: { id: EnergyGoal; label: string }[] = [
  { id: 'lose', label: 'Perder grasa' },
  { id: 'maintain', label: 'Mantenerme' },
  { id: 'gain', label: 'Ganar músculo' },
  { id: 'performance', label: 'Rendimiento' },
];
export const GOAL_PACES: { id: GoalPace; label: string }[] = [
  { id: 'gentle', label: 'Suave' },
  { id: 'normal', label: 'Normal' },
  { id: 'fast', label: 'Rápido' },
];

const ADJUST: Record<EnergyGoal, Record<GoalPace, number>> = {
  lose: { gentle: -0.1, normal: -0.18, fast: -0.25 },
  maintain: { gentle: 0, normal: 0, fast: 0 },
  gain: { gentle: 0.05, normal: 0.1, fast: 0.15 },
  performance: { gentle: 0.03, normal: 0.05, fast: 0.08 },
};

/** Edad aproximada a partir del rango del onboarding. */
export function ageFromRange(r: AgeRange | undefined): number {
  return { 'under-25': 22, '25-34': 30, '35-44': 40, '45-54': 50, '55+': 60 }[r ?? '25-34'] ?? 30;
}

export function bmi(weightKg: number, heightCm: number): number | null {
  if (!(weightKg > 0) || !(heightCm > 0)) return null;
  const m = heightCm / 100;
  return weightKg / (m * m);
}
export function bmiCategory(v: number): { label: string; tone: 'low' | 'ok' | 'warn' | 'high' } {
  if (v < 18.5) return { label: 'Bajo peso', tone: 'low' };
  if (v < 25) return { label: 'Normal', tone: 'ok' };
  if (v < 30) return { label: 'Sobrepeso', tone: 'warn' };
  return { label: 'Obesidad', tone: 'high' };
}

export interface EnergyResult {
  bmr: number;
  tdee: number;
  target: number;
  macros: MacroTargets;
  bmi: number | null;
  leanKg: number | null;
  /** Índice de masa libre de grasa (masa magra / altura²). */
  ffmi: number | null;
  formula: 'Katch-McArdle' | 'Mifflin-St Jeor';
  /** Calorías por debajo del mínimo razonable: se avisa. */
  floored: boolean;
}

const clean = (n: number | undefined, min: number, max: number) => (n != null && Number.isFinite(n) && n >= min && n <= max ? n : undefined);

export function computeEnergy(d: BodyData): EnergyResult | null {
  const w = clean(d.weightKg, 25, 350), h = clean(d.heightCm, 100, 250), a = clean(d.age, 12, 100);
  if (!w || !h || !a) return null;
  const fat = clean(d.bodyFatPct, 3, 70);
  const leanKg = fat != null ? w * (1 - fat / 100) : null;
  const bmr = leanKg != null
    ? 370 + 21.6 * leanKg
    : 10 * w + 6.25 * h - 5 * a + (d.sex === 'female' ? -161 : 5);
  const factor = ACTIVITY_LEVELS.find(x => x.id === d.activity)?.factor ?? 1.55;
  const tdee = bmr * factor;
  let target = tdee * (1 + ADJUST[d.goal][d.pace]);
  // Nunca por debajo del metabolismo basal ni de un mínimo prudente.
  const floor = Math.max(bmr, d.sex === 'female' ? 1200 : 1400);
  const floored = target < floor;
  if (floored) target = floor;
  target = Math.round(target / 10) * 10;

  // Proteína: por kg de masa magra si se conoce (más justo con % de grasa alto).
  const protPerKg = d.goal === 'lose' ? 2.0 : d.goal === 'gain' ? 1.8 : 1.6;
  const b = bmi(w, h);
  // Con IMC > 25 se usa un peso de referencia ajustado (peso con IMC 25 + 40 % del exceso),
  // para que la proteína no se dispare y deje los hidratos a cero.
  const w25 = 25 * (h / 100) ** 2;
  const refW = b != null && b > 25 ? w25 + 0.4 * (w - w25) : w;
  const protein = Math.round(leanKg != null ? Math.min(leanKg * (protPerKg + 0.4), refW * 2.4) : refW * protPerKg);
  let fats = Math.round(Math.max(refW * 0.8, (target * 0.22) / 9));
  // Proteína + grasas nunca se comen todo el objetivo (grasas mínimo 20 % de las kcal).
  fats = Math.max(Math.round((target * 0.2) / 9), Math.min(fats, Math.floor((target - protein * 4) / 9)));
  const carbs = Math.max(0, Math.round((target - protein * 4 - fats * 9) / 4));
  return {
    bmr: Math.round(bmr), tdee: Math.round(tdee), target,
    macros: { kcal: target, protein, carbs, fats },
    bmi: b, leanKg: leanKg != null ? Math.round(leanKg * 10) / 10 : null,
    ffmi: leanKg != null ? Math.round((leanKg / ((h / 100) ** 2)) * 10) / 10 : null,
    formula: leanKg != null ? 'Katch-McArdle' : 'Mifflin-St Jeor',
    floored,
  };
}
