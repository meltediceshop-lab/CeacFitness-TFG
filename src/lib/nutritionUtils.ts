import type { NutritionPlan, MacroTargets, MealSlot } from '@/types/user';

// Extrae el primer número entero de strings tipo "150g" → 150
export function parseGrams(value: string | number | undefined): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const m = value.toString().match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
}

// Objetivos de macros: del plan si existe, si no una estimación de mantenimiento por peso
export function getTargets(plan: NutritionPlan | null, weightKg: number): MacroTargets {
  if (plan) {
    return {
      kcal: plan.dailyCalories || 2000,
      protein: parseGrams(plan.macros?.protein),
      carbs: parseGrams(plan.macros?.carbs),
      fats: parseGrams(plan.macros?.fats),
    };
  }
  const w = weightKg || 70;
  const kcal = Math.round(w * 31);
  const protein = Math.round(w * 1.8);
  const fats = Math.round(w * 0.9);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fats * 9) / 4));
  return { kcal, protein, carbs, fats };
}

// Hidratación recomendada: ~35 ml/kg en vasos de 250 ml, acotado a [6, 12]
export function personalWaterGoal(weightKg: number): number {
  const glasses = Math.round((weightKg || 70) * 35 / 250);
  return Math.max(6, Math.min(12, glasses));
}

export const MEAL_SLOTS: { id: MealSlot; label: string; emoji: string }[] = [
  { id: 'breakfast', label: 'Desayuno', emoji: '🌅' },
  { id: 'lunch', label: 'Comida', emoji: '☀️' },
  { id: 'snack', label: 'Merienda', emoji: '🌇' },
  { id: 'dinner', label: 'Cena', emoji: '🌙' },
  { id: 'other', label: 'Otros', emoji: '🍎' },
];

// Color de macro consistente en toda la pantalla
export const MACRO_COLORS = {
  kcal: '#10b981',
  protein: '#3b82f6',
  carbs: '#f59e0b',
  fats: '#ec4899',
};