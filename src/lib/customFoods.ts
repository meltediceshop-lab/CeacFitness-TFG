// Alimentos creados por la persona (con la tabla del envase), sus datos
// corporales y sus objetivos propios. Se guardan en este dispositivo.

import type { FoodItem, NutritionLabel } from '@/lib/foodDatabase';
import type { MacroTargets } from '@/types/user';
import type { BodyData } from '@/lib/energyCalc';

const read = <T,>(key: string, fallback: T): T => {
  try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : fallback; } catch { return fallback; }
};
const write = (key: string, value: unknown) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* sin almacenamiento */ } };

const foodsKey = (uid: string) => `fitk-custom-foods:${uid}`;
const bodyKey = (uid: string) => `fitk-body-data:${uid}`;
const targetsKey = (uid: string) => `fitk-nutrition-targets:${uid}`;

const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : 0);
const opt = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : undefined);

export function loadCustomFoods(uid: string): FoodItem[] {
  const list = read<unknown[]>(foodsKey(uid), []);
  if (!Array.isArray(list)) return [];
  return list.flatMap((f): FoodItem[] => {
    if (!f || typeof f !== 'object') return [];
    const x = f as Record<string, unknown>;
    if (typeof x.id !== 'string' || typeof x.name !== 'string') return [];
    const l = (x.label ?? {}) as Record<string, unknown>;
    const label: NutritionLabel = {
      kcal: num(l.kcal ?? x.kcal), fats: num(l.fats ?? x.fats), carbs: num(l.carbs ?? x.carbs), protein: num(l.protein ?? x.protein),
      saturated: opt(l.saturated), sugars: opt(l.sugars), fiber: opt(l.fiber), salt: opt(l.salt),
    };
    return [{
      id: x.id, name: x.name, brand: typeof x.brand === 'string' ? x.brand : undefined, category: 'Mis alimentos', source: 'custom',
      kcal: label.kcal, protein: label.protein, carbs: label.carbs, fats: label.fats, label,
      portionG: opt(x.portionG), portionLabel: typeof x.portionLabel === 'string' ? x.portionLabel : undefined,
    }];
  });
}
export function saveCustomFoods(uid: string, foods: FoodItem[]) { write(foodsKey(uid), foods); }

/** Pasa los valores de la etiqueta (por 100 g o por ración) a valores por 100 g. */
export function labelPer100(values: NutritionLabel, per: '100g' | 'portion', portionG?: number): NutritionLabel {
  const f = per === 'portion' && portionG && portionG > 0 ? 100 / portionG : 1;
  const r = (v?: number) => (v == null ? undefined : Math.round(v * f * 100) / 100);
  return {
    kcal: Math.round(values.kcal * f), fats: r(values.fats)!, carbs: r(values.carbs)!, protein: r(values.protein)!,
    saturated: r(values.saturated), sugars: r(values.sugars), fiber: r(values.fiber), salt: r(values.salt),
  };
}

export function loadBodyData(uid: string): Partial<BodyData> { return read<Partial<BodyData>>(bodyKey(uid), {}); }
export function saveBodyData(uid: string, d: BodyData) { write(bodyKey(uid), d); }

export function loadCustomTargets(uid: string): MacroTargets | null {
  const t = read<Partial<MacroTargets> | null>(targetsKey(uid), null);
  return t && t.kcal && t.kcal > 0 ? { kcal: num(t.kcal), protein: num(t.protein), carbs: num(t.carbs), fats: num(t.fats) } : null;
}
export function saveCustomTargets(uid: string, t: MacroTargets) { write(targetsKey(uid), t); }
