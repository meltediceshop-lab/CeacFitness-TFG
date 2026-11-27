'use client';

import { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { BottomNav } from '@/components/ui/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Droplets,
  Plus,
  Minus,
  Check,
  ChevronRight,
  Utensils,
  Zap,
  RefreshCw,
  ShoppingCart,
  Trash2,
  Loader2,
  Flame,
  Pencil,
  X,
  SlidersHorizontal,
  PlusCircle,
} from 'lucide-react';
import type { NutritionProfile, NutritionPlan, NutritionLogEntry, MealSlot, WeekDaySummary, MacroTargets } from '@/types/user';
import { DailyRings } from '@/components/nutrition/DailyRings';
import { FoodSearchModal, type NewFoodLog } from '@/components/nutrition/FoodSearchModal';
import { ShoppingListModal } from '@/components/nutrition/ShoppingListModal';
import { getTargets, personalWaterGoal, MEAL_SLOTS, MACRO_COLORS } from '@/lib/nutritionUtils';
import { GoalsSheet } from '@/components/nutrition/GoalsSheet';
import { ageFromRange, type BodyData } from '@/lib/energyCalc';
import { loadBodyData, loadCustomTargets, saveBodyData, saveCustomTargets } from '@/lib/customFoods';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// ─── Questionnaire ─────────────────────────────────────────────
const QUESTIONS = [
  { id: 'goal', question: '¿Cuál es tu objetivo principal con la alimentación?', type: 'choice', options: [
    { value: 'lose-fat', label: 'Perder grasa', emoji: '🔥' },
    { value: 'gain-muscle', label: 'Ganar músculo', emoji: '💪' },
    { value: 'maintain', label: 'Mantenerme', emoji: '⚖️' },
    { value: 'performance', label: 'Rendimiento deportivo', emoji: '⚡' },
  ] },
  { id: 'dietType', question: '¿Sigues algún tipo de dieta específica?', type: 'choice', options: [
    { value: 'omnivore', label: 'Como de todo', emoji: '🍗' },
    { value: 'vegetarian', label: 'Vegetariano', emoji: '🥦' },
    { value: 'vegan', label: 'Vegano', emoji: '🌱' },
    { value: 'other', label: 'Dieta especial', emoji: '✨' },
  ] },
  { id: 'allergies', question: '¿Tienes alergias o intolerancias alimentarias?', type: 'multicheck', options: [
    { value: 'gluten', label: 'Gluten/Celiaquía' },
    { value: 'lactosa', label: 'Lactosa' },
    { value: 'frutos secos', label: 'Frutos secos' },
    { value: 'mariscos', label: 'Mariscos' },
    { value: 'huevo', label: 'Huevo' },
    { value: 'ninguna', label: 'Ninguna' },
  ] },
  { id: 'dislikedFoods', question: '¿Hay alimentos que no te gusten o no puedas comer?', type: 'text', placeholder: 'Ej: brócoli, hígado, pescado... (o deja en blanco)' },
  { id: 'mealsPerDay', question: '¿Cuántas veces al día sueles comer?', type: 'choice', options: [
    { value: '2', label: '2 comidas', emoji: '2️⃣' },
    { value: '3', label: '3 comidas', emoji: '3️⃣' },
    { value: '4', label: '4 comidas', emoji: '4️⃣' },
    { value: '5', label: '5 o más', emoji: '5️⃣' },
  ] },
  { id: 'cookingFrequency', question: '¿Cocinas habitualmente en casa?', type: 'choice', options: [
    { value: 'home', label: 'Sí, casi siempre', emoji: '🏠' },
    { value: 'mixed', label: 'A veces', emoji: '🔄' },
    { value: 'outside', label: 'Poco, como fuera', emoji: '🍽️' },
  ] },
  { id: 'budget', question: '¿Cómo es tu presupuesto para la comida?', type: 'choice', options: [
    { value: 'low', label: 'Ajustado', emoji: '💰' },
    { value: 'medium', label: 'Normal', emoji: '💳' },
    { value: 'high', label: 'Sin restricción', emoji: '🤑' },
  ] },
  { id: 'trainingTime', question: '¿A qué hora del día sueles entrenar?', type: 'choice', options: [
    { value: 'morning', label: 'Por la mañana', emoji: '🌅' },
    { value: 'afternoon', label: 'Por la tarde', emoji: '☀️' },
    { value: 'evening', label: 'Por la noche', emoji: '🌙' },
  ] },
  { id: 'supplements', question: '¿Tomas algún suplemento actualmente?', type: 'text', placeholder: 'Ej: proteína, creatina, vitamina D... (o deja en blanco)' },
  { id: 'medicalConditions', question: '¿Tienes alguna condición médica relacionada con la alimentación?', type: 'text', placeholder: 'Ej: diabetes, colesterol alto... (o deja en blanco)' },
] as const;

// ─── Weekly adherence strip ───────────────────────────────────────
const DAY_INITIALS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

function WeekStrip({ week, targetKcal }: { week: WeekDaySummary[]; targetKcal: number }) {
  return (
    <div className="flex items-end justify-between gap-1.5 h-28">
      {week.map((d) => {
        const ratio = targetKcal > 0 ? d.kcal / targetKcal : 0;
        const height = Math.max(6, Math.min(ratio, 1.15) * 80);
        const good = ratio >= 0.85 && ratio <= 1.15;
        const some = ratio > 0;
        const color = !some ? 'bg-stone-200 dark:bg-stone-700' : good ? 'bg-emerald-500' : 'bg-amber-400';
        const dayIdx = new Date(d.date + 'T00:00:00').getDay();
        const isToday = d.date === todayStr();
        return (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5">
            <div className="w-full flex flex-col justify-end items-center" style={{ height: 92 }}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height }}
                transition={{ duration: 0.5 }}
                className={`w-full max-w-[26px] rounded-lg ${color}`}
              />
            </div>
            <span className={`text-[10px] ${isToday ? 'text-emerald-600 font-bold' : 'text-stone-400'}`}>
              {DAY_INITIALS[dayIdx]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Nutrition Plan Display ───────────────────────────────────────
function PlanDisplay({ plan, onReset, onShopping, onEditMeal, onRegenerateMeal, regeneratingMeal, onLogMeal, onDeleteMeal, onAddMeal, addingMeal, loggedMealIndex, onAdjustMacros }: {
  plan: NutritionPlan;
  onReset: () => void;
  onShopping: () => void;
  onEditMeal: (index: number) => void;
  onRegenerateMeal: (index: number) => void;
  regeneratingMeal: number | null;
  onLogMeal: (index: number) => void;
  onDeleteMeal: (index: number) => void;
  onAddMeal: () => void;
  addingMeal: boolean;
  loggedMealIndex: number | null;
  onAdjustMacros: () => void;
}) {
  return (
    <div className="space-y-4">
      <Card className="p-5 bg-emerald-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">Tu plan nutricional</h3>
              <p className="text-stone-500 text-xs">Generado por IA · personalizado</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onAdjustMacros} className="w-9 h-9 flex items-center justify-center flex-shrink-0 rounded-full bg-[rgba(118,118,128,0.12)]" title="Ajustar macros y calorías">
              <SlidersHorizontal className="w-4 h-4 text-stone-500" />
            </button>
            <button onClick={onShopping} className="w-9 h-9 flex items-center justify-center flex-shrink-0 rounded-full bg-[rgba(118,118,128,0.12)]" title="Lista de la compra">
              <ShoppingCart className="w-4 h-4 text-stone-500" />
            </button>
            <button onClick={onReset} className="w-9 h-9 flex items-center justify-center flex-shrink-0 rounded-full bg-[rgba(118,118,128,0.12)]" title="Regenerar plan completo">
              <RefreshCw className="w-4 h-4 text-stone-500" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-white/70 dark:bg-black/20 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-stone-900">{plan.dailyCalories}</p>
            <p className="text-xs text-stone-500">kcal</p>
          </div>
          <div className="bg-white/70 dark:bg-black/20 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-blue-600">{plan.macros.protein}</p>
            <p className="text-xs text-stone-500">proteína</p>
          </div>
          <div className="bg-white/70 dark:bg-black/20 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-amber-600">{plan.macros.carbs}</p>
            <p className="text-xs text-stone-500">carbs</p>
          </div>
          <div className="bg-white/70 dark:bg-black/20 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-orange-500">{plan.macros.fats}</p>
            <p className="text-xs text-stone-500">grasas</p>
          </div>
        </div>
      </Card>

      <Card className="p-5 bg-white dark:bg-[#111111] border-0 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
            <Utensils className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="font-bold text-stone-900">Distribución de comidas</h3>
        </div>
        <div className="space-y-3">
          {plan.meals.map((meal, i) => (
            <div key={i} className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="min-w-0 break-words font-semibold text-stone-900 dark:text-white text-sm">{meal.name}</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-stone-400 mr-1">{meal.time}</span>
                  <button
                    onClick={() => onLogMeal(i)}
                    className={`w-9 h-9 flex items-center justify-center flex-shrink-0 rounded-full ${loggedMealIndex === i ? 'bg-emerald-500' : 'bg-[rgba(118,118,128,0.12)]'}`}
                    title="Registrar en tu diario de hoy"
                  >
                    {loggedMealIndex === i
                      ? <Check className="w-3.5 h-3.5 text-white" />
                      : <PlusCircle className="w-3.5 h-3.5 text-emerald-500" />}
                  </button>
                  <button
                    onClick={() => onRegenerateMeal(i)}
                    disabled={regeneratingMeal === i}
                    className="w-9 h-9 flex items-center justify-center flex-shrink-0 rounded-full bg-[rgba(118,118,128,0.12)] disabled:opacity-50"
                    title="Regenerar con IA"
                  >
                    {regeneratingMeal === i
                      ? <Loader2 className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
                      : <Sparkles className="w-3.5 h-3.5 text-emerald-500" />}
                  </button>
                  <button
                    onClick={() => onEditMeal(i)}
                    className="w-9 h-9 flex items-center justify-center flex-shrink-0 rounded-full bg-[rgba(118,118,128,0.12)]"
                    title="Editar comida"
                  >
                    <Pencil className="w-3.5 h-3.5 text-stone-500" />
                  </button>
                  <button
                    onClick={() => onDeleteMeal(i)}
                    className="w-9 h-9 flex items-center justify-center flex-shrink-0 rounded-full bg-[rgba(118,118,128,0.12)]"
                    title="Eliminar comida"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-stone-400 hover:text-red-500" />
                  </button>
                </div>
              </div>
              <p className="text-stone-600 dark:text-stone-400 text-xs mb-2">{meal.description}</p>
              <div className="flex flex-wrap gap-1">
                {meal.examples.map((ex, j) => (
                  <span key={j} className="px-2 py-0.5 bg-white dark:bg-stone-700 rounded-full text-xs text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-600">
                    {ex}
                  </span>
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={onAddMeal}
            disabled={addingMeal}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[rgba(118,118,128,0.12)] text-stone-800 dark:text-white text-sm disabled:opacity-50"
          >
            {addingMeal ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {addingMeal ? 'Generando comida con IA...' : 'Añadir comida'}
          </button>
        </div>
      </Card>

      <Card className="p-5 bg-white dark:bg-[#111111] border-0 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="font-bold text-stone-900">Nutrición peritraining</h3>
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
            <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-1">⬆️ Antes del entreno</p>
            <p className="text-stone-700 dark:text-stone-300 text-sm">{plan.preWorkout}</p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
            <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">⬇️ Después del entreno</p>
            <p className="text-stone-700 dark:text-stone-300 text-sm">{plan.postWorkout}</p>
          </div>
        </div>
      </Card>

      <Card className="p-5 bg-white dark:bg-[#111111] border-0 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-bold text-stone-900">Consejos clave</h3>
        </div>
        <div className="space-y-2">
          {plan.guidelines.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-xs font-bold">{i + 1}</span>
              </div>
              <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </Card>

      {plan.supplements && plan.supplements.length > 0 && plan.supplements[0] && (
        <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-stone-900 text-sm mb-1">Suplementos sugeridos</p>
              <p className="text-stone-600 dark:text-stone-300 text-sm">{plan.supplements.join(' · ')}</p>
              <p className="text-xs text-stone-400 mt-1">Consulta con un profesional antes de tomarlos.</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Modal de edición de comida ───────────────────────────────────
function MealEditModal({ meal, onSave, onClose }: {
  meal: NutritionPlan['meals'][number];
  onSave: (m: NutritionPlan['meals'][number]) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(meal.name);
  const [time, setTime] = useState(meal.time);
  const [description, setDescription] = useState(meal.description);
  const [examples, setExamples] = useState<string[]>(meal.examples.length ? meal.examples : ['']);
  const [swappingFoodIndex, setSwappingFoodIndex] = useState<number | null>(null);

  function updateExample(i: number, v: string) {
    setExamples(prev => prev.map((e, j) => (j === i ? v : e)));
  }
  function addExample() { setExamples(prev => [...prev, '']); }
  function removeExample(i: number) { setExamples(prev => prev.filter((_, j) => j !== i)); }

  async function handleSwapFood(i: number) {
    if (swappingFoodIndex !== null) return;
    setSwappingFoodIndex(i);
    try {
      const res = await fetch('/api/nutrition', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'swap_food', meal: { name, time, description }, food: examples[i] }),
      });
      const data = await res.json();
      if (data.food) setExamples(prev => prev.map((e, j) => j === i ? data.food : e));
    } catch { /* silent */ } finally { setSwappingFoodIndex(null); }
  }

  function handleSave() {
    onSave({
      name: name.trim() || meal.name,
      time: time.trim(),
      description: description.trim(),
      examples: examples.map(e => e.trim()).filter(Boolean),
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-[60] flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="w-full max-w-md glass-modal rounded-t-3xl max-h-[88vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
          <h2 className="font-bold text-stone-900 dark:text-white text-lg">Editar comida</h2>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center flex-shrink-0 rounded-full bg-stone-100">
            <X className="w-4 h-4 text-stone-600 dark:text-white/70" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 pb-5 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-stone-500 dark:text-white/50 mb-1 block">Nombre</label>
              <input value={name} onChange={e => setName(e.target.value)}
                className="glass-input w-full rounded-xl px-3 py-2.5 text-sm" placeholder="Desayuno" />
            </div>
            <div className="w-28">
              <label className="text-xs font-medium text-stone-500 dark:text-white/50 mb-1 block">Hora</label>
              <input value={time} onChange={e => setTime(e.target.value)}
                className="glass-input w-full rounded-xl px-3 py-2.5 text-sm" placeholder="08:00" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-stone-500 dark:text-white/50 mb-1 block">Descripción / kcal</label>
            <input value={description} onChange={e => setDescription(e.target.value)}
              className="glass-input w-full rounded-xl px-3 py-2.5 text-sm" placeholder="450 kcal aprox." />
          </div>

          <div>
            <label className="text-xs font-medium text-stone-500 dark:text-white/50 mb-2 block">Opciones de alimentos</label>
            <div className="space-y-2">
              {examples.map((ex, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input value={ex} onChange={e => updateExample(i, e.target.value)}
                    className="glass-input flex-1 rounded-xl px-3 py-2.5 text-sm" placeholder={`Opción ${i + 1}`} />
                  <button onClick={() => handleSwapFood(i)} disabled={swappingFoodIndex !== null}
                    className="w-9 h-9 flex items-center justify-center flex-shrink-0 rounded-full bg-stone-100 text-stone-400 hover:text-emerald-500 disabled:opacity-50"
                    title="Cambiar por alternativa IA">
                    {swappingFoodIndex === i
                      ? <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                      : <RefreshCw className="w-4 h-4" />}
                  </button>
                  <button onClick={() => removeExample(i)} className="w-9 h-9 flex items-center justify-center flex-shrink-0 rounded-full bg-stone-100 text-stone-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button onClick={addExample}
                className="w-full flex items-center justify-center gap-1.5 h-10 rounded-full bg-[rgba(118,118,128,0.12)] text-stone-800 dark:text-white text-sm">
                <Plus className="w-4 h-4" /> Añadir opción
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 pb-6 pt-2 flex-shrink-0">
          <Button onClick={handleSave} className="w-full h-12 rounded-full bg-emerald-500 font-semibold">
            Guardar cambios
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}


// ─── Main Screen ──────────────────────────────────────────────────
export function NutritionScreen() {
  const { user, supabaseUserId, setUser } = useApp();
  const uid = supabaseUserId || user?.id || 'anon';
  // Objetivos propios (sin plan de IA) y datos corporales del cálculo
  const [customTargets, setCustomTargets] = useState<MacroTargets | null>(null);
  const [bodyData, setBodyData] = useState<Partial<BodyData>>({});
  const [showGoals, setShowGoals] = useState(false);
  useEffect(() => { setCustomTargets(loadCustomTargets(uid)); setBodyData(loadBodyData(uid)); }, [uid]);

  // Tracking state
  const [logs, setLogs] = useState<NutritionLogEntry[]>([]);
  const [week, setWeek] = useState<WeekDaySummary[]>([]);
  const [water, setWater] = useState(0);
  const [storedGoal, setStoredGoal] = useState<number | null>(null);
  const [foodSlot, setFoodSlot] = useState<MealSlot | null>(null);
  const [showShopping, setShowShopping] = useState(false);
  const [showPlan, setShowPlan] = useState(false);

  // Plan + questionnaire
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const [editingMealIndex, setEditingMealIndex] = useState<number | null>(null);
  const [regeneratingMeal, setRegeneratingMeal] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [multiSelected, setMultiSelected] = useState<string[]>([]);
  const [textInput, setTextInput] = useState('');
  const [addingMeal, setAddingMeal] = useState(false);
  const [loggedMealIndex, setLoggedMealIndex] = useState<number | null>(null);

  // Load plan
  useEffect(() => {
    async function loadPlan() {
      try {
        const res = await fetch('/api/nutrition');
        const data = await res.json();
        if (data.data?.nutrition_plan) setNutritionPlan(data.data.nutrition_plan as NutritionPlan);
        else {
          const local = localStorage.getItem('fitmente-nutrition-plan');
          if (local) setNutritionPlan(JSON.parse(local) as NutritionPlan);
        }
      } catch {
        const local = localStorage.getItem('fitmente-nutrition-plan');
        if (local) setNutritionPlan(JSON.parse(local) as NutritionPlan);
      } finally {
        setIsLoading(false);
      }
    }
    loadPlan();
  }, []);

  // Load tracking (logs, water, week)
  useEffect(() => {
    async function loadTracking() {
      try {
        const [logsRes, waterRes, weekRes] = await Promise.all([
          fetch('/api/nutrition/logs'),
          fetch('/api/nutrition/water'),
          fetch('/api/nutrition/logs?range=week'),
        ]);
        const logsData = await logsRes.json();
        const waterData = await waterRes.json();
        const weekData = await weekRes.json();
        if (Array.isArray(logsData.data)) {
          setLogs(logsData.data.map((r: Record<string, unknown>) => ({
            id: r.id as string,
            mealSlot: (r.meal_slot as MealSlot) || 'other',
            foodName: r.food_name as string,
            quantityG: r.quantity_g != null ? Number(r.quantity_g) : undefined,
            kcal: Number(r.kcal), protein: Number(r.protein), carbs: Number(r.carbs), fats: Number(r.fats),
          })));
        }
        if (waterData.data) {
          setWater(waterData.data.water_glasses || 0);
          if (waterData.data.water_goal) setStoredGoal(waterData.data.water_goal);
        }
        if (Array.isArray(weekData.data)) setWeek(weekData.data);
      } catch { /* offline */ }
    }
    loadTracking();
  }, []);

  const consumed: MacroTargets = useMemo(() => logs.reduce(
    (acc, l) => ({ kcal: acc.kcal + l.kcal, protein: acc.protein + l.protein, carbs: acc.carbs + l.carbs, fats: acc.fats + l.fats }),
    { kcal: 0, protein: 0, carbs: 0, fats: 0 }
  ), [logs]);

  if (!user) return null;

  const targets = nutritionPlan ? getTargets(nutritionPlan, user.profile.weight) : (customTargets ?? getTargets(null, user.profile.weight));

  async function saveGoals(t: MacroTargets, body: BodyData | null, saveWeight: boolean) {
    setShowGoals(false);
    saveCustomTargets(uid, t); setCustomTargets(t);
    if (body) { saveBodyData(uid, body); setBodyData(body); }
    if (nutritionPlan) await persistPlan({ ...nutritionPlan, dailyCalories: t.kcal, macros: { protein: `${t.protein}g`, carbs: `${t.carbs}g`, fats: `${t.fats}g` } });
    if (saveWeight && body && body.weightKg > 0) {
      if (user) setUser({ ...user, lastWeightUpdate: new Date(), profile: { ...user.profile, weight: body.weightKg } });
      fetch('/api/metrics', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight: body.weightKg, recordedAt: new Date().toLocaleDateString('sv-SE') }),
      }).catch(() => {});
    }
  }
  const waterGoal = storedGoal ?? personalWaterGoal(user.profile.weight);
  const waterProgress = Math.min((water / waterGoal) * 100, 100);
  const currentQ = QUESTIONS[step];

  // Streak: días consecutivos (hasta hoy) con algo registrado
  const streak = (() => {
    let s = 0;
    for (let i = week.length - 1; i >= 0; i--) {
      if (week[i].entries > 0) s++; else break;
    }
    return s;
  })();

  function bumpWeekToday(d: { kcal: number; protein: number; carbs: number; fats: number }, entriesDelta: number) {
    const today = todayStr();
    setWeek(prev => prev.map(w => w.date === today
      ? { ...w, kcal: w.kcal + d.kcal, protein: w.protein + d.protein, carbs: w.carbs + d.carbs, fats: w.fats + d.fats, entries: Math.max(0, w.entries + entriesDelta) }
      : w));
  }

  async function addFood(log: NewFoodLog) {
    setFoodSlot(null);
    const tempId = `temp-${Date.now()}`;
    setLogs(prev => [...prev, { id: tempId, ...log }]);
    bumpWeekToday(log, 1);
    try {
      const res = await fetch('/api/nutrition/logs', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...log, date: todayStr() }),
      });
      const data = await res.json();
      if (data.data?.id) setLogs(prev => prev.map(e => e.id === tempId ? { ...e, id: data.data.id } : e));
    } catch { /* keep optimistic */ }
  }

  async function removeFood(id: string) {
    const removed = logs.find(e => e.id === id);
    setLogs(prev => prev.filter(e => e.id !== id));
    if (removed) bumpWeekToday({ kcal: -removed.kcal, protein: -removed.protein, carbs: -removed.carbs, fats: -removed.fats }, -1);
    if (!id.startsWith('temp-')) await fetch(`/api/nutrition/logs?id=${id}`, { method: 'DELETE' }).catch(() => {});
  }

  async function changeWater(next: number) {
    const v = Math.max(0, Math.min(15, next));
    setWater(v);
    await fetch('/api/nutrition/water', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: todayStr(), waterGlasses: v, waterGoal }),
    }).catch(() => {});
  }

  // ── Questionnaire handlers ──
  function handleChoice(value: string) { const n = { ...answers, [currentQ.id]: value }; setAnswers(n); advanceStep(n); }
  function handleMultiCheck(value: string) {
    if (value === 'ninguna') { setMultiSelected(['ninguna']); return; }
    setMultiSelected(prev => { const w = prev.filter(v => v !== 'ninguna'); return w.includes(value) ? w.filter(v => v !== value) : [...w, value]; });
  }
  function handleTextNext() { const n = { ...answers, [currentQ.id]: textInput }; setAnswers(n); setTextInput(''); advanceStep(n); }
  function handleMultiNext() { const value = multiSelected.includes('ninguna') ? [] : multiSelected; const n = { ...answers, [currentQ.id]: value }; setAnswers(n); setMultiSelected([]); advanceStep(n); }
  function advanceStep(cur: Record<string, unknown>) { if (step < QUESTIONS.length - 1) setStep(s => s + 1); else generatePlan(cur); }

  async function generatePlan(finalAnswers: Record<string, unknown>) {
    if (!user) return;
    setShowQuestionnaire(false);
    setIsGenerating(true);
    const profile: NutritionProfile = {
      goal: (finalAnswers.goal as NutritionProfile['goal']) || 'maintain',
      dietType: (finalAnswers.dietType as NutritionProfile['dietType']) || 'omnivore',
      allergies: (finalAnswers.allergies as string[]) || [],
      dislikedFoods: (finalAnswers.dislikedFoods as string) || '',
      mealsPerDay: Number(finalAnswers.mealsPerDay) || 3,
      cookingFrequency: (finalAnswers.cookingFrequency as NutritionProfile['cookingFrequency']) || 'mixed',
      budget: (finalAnswers.budget as NutritionProfile['budget']) || 'medium',
      trainingTime: (finalAnswers.trainingTime as NutritionProfile['trainingTime']) || 'afternoon',
      supplements: (finalAnswers.supplements as string) || '',
      medicalConditions: (finalAnswers.medicalConditions as string) || '',
      completedAt: new Date().toISOString(),
    };
    try {
      const res = await fetch('/api/nutrition', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nutritionProfile: profile, userProfile: { weight: user.profile.weight, height: user.profile.height } }),
      });
      const data = await res.json();
      if (data.plan) {
        setNutritionPlan(data.plan as NutritionPlan);
        localStorage.setItem('fitmente-nutrition-plan', JSON.stringify(data.plan));
        setShowPlan(true);
      }
    } catch { /* silent */ } finally {
      setIsGenerating(false);
    }
  }

  function resetQuestionnaire() {
    setNutritionPlan(null);
    localStorage.removeItem('fitmente-nutrition-plan');
    setAnswers({}); setStep(0); setMultiSelected([]); setTextInput('');
    setShowQuestionnaire(true);
  }

  // Persiste un plan editado (manual o regenerado): estado + localStorage + Supabase
  async function persistPlan(updated: NutritionPlan) {
    setNutritionPlan(updated);
    localStorage.setItem('fitmente-nutrition-plan', JSON.stringify(updated));
    await fetch('/api/nutrition', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: updated }),
    }).catch(() => {});
  }

  function handleSaveMeal(meal: NutritionPlan['meals'][number]) {
    if (!nutritionPlan || editingMealIndex === null) return;
    const meals = nutritionPlan.meals.map((m, i) => (i === editingMealIndex ? meal : m));
    persistPlan({ ...nutritionPlan, meals });
    setEditingMealIndex(null);
  }

  async function handleRegenerateMeal(index: number) {
    if (!nutritionPlan) return;
    setRegeneratingMeal(index);
    try {
      const res = await fetch('/api/nutrition', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meal: nutritionPlan.meals[index],
          planContext: {
            dailyCalories: nutritionPlan.dailyCalories,
            mealsCount: nutritionPlan.meals.length,
          },
        }),
      });
      const data = await res.json();
      if (data.meal) {
        const meals = nutritionPlan.meals.map((m, i) => (i === index ? { ...m, ...data.meal } : m));
        await persistPlan({ ...nutritionPlan, meals });
      }
    } catch { /* silent */ } finally {
      setRegeneratingMeal(null);
    }
  }

  // ── Plan IA handlers ──
  function detectMealSlot(meal: NutritionPlan['meals'][number]): MealSlot {
    const n = meal.name.toLowerCase();
    if (/(desayuno|breakfast)/.test(n)) return 'breakfast';
    if (/(comida|almuerzo|lunch)/.test(n)) return 'lunch';
    if (/(cena|dinner)/.test(n)) return 'dinner';
    if (/(merienda|snack|tentempié)/.test(n)) return 'snack';
    return 'other';
  }

  function handleLogMeal(index: number) {
    if (!nutritionPlan) return;
    const meal = nutritionPlan.meals[index];
    const kcalMatch = meal.description.match(/(\d+)/);
    const totalMeals = nutritionPlan.meals.length || 1;
    const kcal = kcalMatch ? parseInt(kcalMatch[1]) : Math.round(nutritionPlan.dailyCalories / totalMeals);
    const proteinG = Math.round(parseInt(nutritionPlan.macros.protein) / totalMeals);
    const carbsG = Math.round(parseInt(nutritionPlan.macros.carbs) / totalMeals);
    const fatsG = Math.round(parseInt(nutritionPlan.macros.fats) / totalMeals);
    addFood({ mealSlot: detectMealSlot(meal), foodName: meal.name, quantityG: 0, kcal, protein: proteinG, carbs: carbsG, fats: fatsG });
    setLoggedMealIndex(index);
    setTimeout(() => setLoggedMealIndex(null), 2000);
  }

  function handleDeleteMeal(index: number) {
    if (!nutritionPlan) return;
    persistPlan({ ...nutritionPlan, meals: nutritionPlan.meals.filter((_, i) => i !== index) });
  }

  async function handleAddMeal() {
    if (!nutritionPlan) return;
    setAddingMeal(true);
    try {
      const res = await fetch('/api/nutrition', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'add_meal',
          planContext: { dailyCalories: nutritionPlan.dailyCalories, existingMeals: nutritionPlan.meals.map(m => m.name) },
        }),
      });
      const data = await res.json();
      if (data.meal) await persistPlan({ ...nutritionPlan, meals: [...nutritionPlan.meals, data.meal] });
    } catch { /* silent */ } finally { setAddingMeal(false); }
  }

  // ── Questionnaire view ──
  if (showQuestionnaire) {
    const progress = (step / QUESTIONS.length) * 100;
    return (
      <div className="min-h-dvh glass-bg flex flex-col px-5 pt-6 pb-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-stone-500">{step + 1} / {QUESTIONS.length}</span>
            <span className="text-sm font-semibold text-emerald-600">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
            <motion.div className="h-full bg-emerald-500 rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }} className="flex-1 flex flex-col">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center mb-6">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl font-bold text-stone-900 mb-6">{currentQ.question}</h2>
            {currentQ.type === 'choice' && (
              <div className="space-y-3">
                {'options' in currentQ && currentQ.options.map((opt) => (
                  <button key={opt.value} onClick={() => handleChoice(opt.value)} className="w-full p-4 bg-white dark:bg-[#1a1a1a] border-2 border-transparent hover:border-emerald-300 rounded-2xl text-left flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
                    {'emoji' in opt && <span className="text-2xl">{opt.emoji}</span>}
                    <span className="font-medium text-stone-900">{opt.label}</span>
                    <ChevronRight className="w-5 h-5 text-stone-300 ml-auto" />
                  </button>
                ))}
              </div>
            )}
            {currentQ.type === 'multicheck' && (
              <div className="space-y-3">
                {'options' in currentQ && currentQ.options.map((opt) => {
                  const isSelected = multiSelected.includes(opt.value);
                  return (
                    <button key={opt.value} onClick={() => handleMultiCheck(opt.value)} className={`w-full p-4 rounded-2xl text-left flex items-center gap-4 border-2 transition-all ${isSelected ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'border-transparent bg-white dark:bg-[#1a1a1a] shadow-sm'}`}>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-emerald-400 bg-emerald-400' : 'border-stone-300'}`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="font-medium text-stone-900">{opt.label}</span>
                    </button>
                  );
                })}
                <Button onClick={handleMultiNext} className="w-full h-12 rounded-full bg-emerald-500 mt-4" disabled={multiSelected.length === 0}>Continuar</Button>
              </div>
            )}
            {currentQ.type === 'text' && (
              <div className="space-y-4">
                <input type="text" value={textInput} onChange={(e) => setTextInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleTextNext()} placeholder={'placeholder' in currentQ ? currentQ.placeholder : ''} className="w-full p-4 bg-white dark:bg-[#1a1a1a] border-2 border-stone-200 dark:border-stone-700 focus:border-emerald-400 rounded-2xl text-stone-900 placeholder-stone-400 outline-none text-sm" />
                <Button onClick={handleTextNext} className="w-full h-12 rounded-full bg-emerald-500">{step === QUESTIONS.length - 1 ? 'Generar mi plan' : 'Continuar'}</Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen glass-bg flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 rounded-3xl bg-emerald-500 flex items-center justify-center mb-6">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-2 text-center">Creando tu plan</h2>
        <p className="text-stone-500 text-center text-sm max-w-xs">La IA está analizando tu perfil y preparando un plan personalizado...</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen glass-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  // ── Main view ──
  return (
    <div className="min-h-dvh glass-bg flex flex-col">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="px-4 pt-6 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-stone-900">Nutrición</h1>
            <p className="text-stone-500 text-sm">Tu día de hoy</p>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{streak} {streak === 1 ? 'día' : 'días'}</span>
            </div>
          )}
        </div>
      </motion.div>

      <div className="flex-1 px-4 space-y-3 overflow-y-auto pb-32">
        {/* Plan nutricional IA — lo primero de la página */}
        {nutritionPlan ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <button
              onClick={() => setShowPlan(s => !s)}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-emerald-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-stone-900 dark:text-white">Tu plan nutricional IA</p>
                  <p className="text-stone-500 text-xs">{showPlan ? 'Ocultar detalles' : 'Ver, editar y regenerar comidas'}</p>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 text-stone-400 transition-transform ${showPlan ? 'rotate-90' : ''}`} />
            </button>
            <AnimatePresence>
              {showPlan && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="pt-4">
                    <PlanDisplay
                      plan={nutritionPlan}
                      onReset={resetQuestionnaire}
                      onShopping={() => setShowShopping(true)}
                      onEditMeal={setEditingMealIndex}
                      onRegenerateMeal={handleRegenerateMeal}
                      regeneratingMeal={regeneratingMeal}
                      onLogMeal={handleLogMeal}
                      onDeleteMeal={handleDeleteMeal}
                      onAddMeal={handleAddMeal}
                      addingMeal={addingMeal}
                      loggedMealIndex={loggedMealIndex}
                      onAdjustMacros={() => setShowGoals(true)}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6 bg-emerald-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl cursor-pointer" onClick={() => setShowQuestionnaire(true)}>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-stone-900 dark:text-white text-lg mb-1">Crea tu plan con IA</h3>
                  <p className="text-stone-600 dark:text-stone-300 text-sm mb-3">Responde 10 preguntas y la IA generará un plan adaptado a ti, con objetivos de macros precisos.</p>
                  <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">Comenzar cuestionario <ChevronRight className="w-4 h-4" /></div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Daily summary rings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-5 bg-white dark:bg-[#111111] border-0 rounded-2xl shadow-sm">
            <DailyRings consumed={consumed} targets={targets} />
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-xs text-stone-500 min-w-0">
                {nutritionPlan ? 'Objetivos de tu plan' : customTargets ? 'Tus objetivos' : 'Objetivos estimados por tu peso'}
                {' · '}<span className="tabular-nums">{targets.kcal} kcal</span>
              </p>
              <button type="button" onClick={() => setShowGoals(true)}
                className="h-10 px-4 rounded-full bg-[rgba(118,118,128,0.12)] text-stone-800 dark:text-white text-xs font-semibold flex items-center gap-1.5 flex-shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5" /> Ajustar objetivos
              </button>
            </div>
          </Card>
        </motion.div>

        {/* Meal logging */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="p-5 bg-white dark:bg-[#111111] border-0 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                <Utensils className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900">Lo que has comido</h3>
                <p className="text-stone-500 text-sm">Registra cada alimento</p>
              </div>
            </div>

            <div className="space-y-4">
              {MEAL_SLOTS.map(slot => {
                const slotLogs = logs.filter(l => l.mealSlot === slot.id);
                const slotKcal = slotLogs.reduce((a, l) => a + l.kcal, 0);
                if (slot.id === 'other' && slotLogs.length === 0) return null;
                return (
                  <div key={slot.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">{slot.emoji} {slot.label}</p>
                      {slotKcal > 0 && <span className="text-xs text-stone-400">{slotKcal} kcal</span>}
                    </div>
                    <div className="space-y-1.5">
                      <AnimatePresence>
                        {slotLogs.map(l => (
                          <motion.div
                            key={l.id}
                            layout
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800/50"
                          >
                            <div className="min-w-0">
                              <p className="text-sm text-stone-800 dark:text-stone-100 truncate">{l.foodName}</p>
                              <p className="text-[11px] text-stone-400">
                                {l.quantityG ? `${l.quantityG}g · ` : ''}{l.kcal} kcal · P{l.protein} C{l.carbs} G{l.fats}
                              </p>
                            </div>
                            <button onClick={() => removeFood(l.id)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex-shrink-0">
                              <Trash2 className="w-3.5 h-3.5 text-stone-400 hover:text-red-500" />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      <button
                        onClick={() => setFoodSlot(slot.id)}
                        className="w-full flex items-center justify-center gap-1.5 h-10 rounded-full bg-[rgba(118,118,128,0.12)] text-stone-800 dark:text-white text-sm"
                      >
                        <Plus className="w-4 h-4" /> Añadir alimento
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Weekly adherence */}
        {week.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="p-5 bg-white dark:bg-[#111111] border-0 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stone-900">Tu semana</h3>
                <span className="text-xs text-stone-400">objetivo {targets.kcal} kcal</span>
              </div>
              <WeekStrip week={week} targetKcal={targets.kcal} />
              <div className="flex items-center justify-center gap-4 mt-3 text-[11px] text-stone-400">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> En objetivo</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400" /> Lejos</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-stone-200 dark:bg-stone-700" /> Sin registro</span>
              </div>
            </Card>
          </motion.div>
        )}

      </div>

      {/* Macro adjust modal */}
      <AnimatePresence>
        {showGoals && (
          <GoalsSheet
            initialTargets={targets}
            initialBody={bodyData}
            profile={{ sex: user.profile.biologicalProfile ?? 'male', age: ageFromRange(user.profile.ageRange), weightKg: user.profile.weight, heightCm: user.profile.height }}
            onSave={saveGoals}
            onClose={() => setShowGoals(false)}
          />
        )}
      </AnimatePresence>

      {/* Meal edit modal */}
      <AnimatePresence>
        {editingMealIndex !== null && nutritionPlan?.meals[editingMealIndex] && (
          <MealEditModal
            meal={nutritionPlan.meals[editingMealIndex]}
            onSave={handleSaveMeal}
            onClose={() => setEditingMealIndex(null)}
          />
        )}
      </AnimatePresence>

      {/* Food search modal */}
      <AnimatePresence>
        {foodSlot && (
          <FoodSearchModal uid={uid} defaultSlot={foodSlot} onClose={() => setFoodSlot(null)} onAdd={addFood} />
        )}
      </AnimatePresence>

      {/* Shopping list modal */}
      <AnimatePresence>
        {showShopping && nutritionPlan && (
          <ShoppingListModal plan={nutritionPlan} onClose={() => setShowShopping(false)} />
        )}
      </AnimatePresence>

      <BottomNav active="nutrition" />
    </div>
  );
}