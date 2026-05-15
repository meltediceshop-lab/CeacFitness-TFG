'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Droplets,
  Apple,
  Coffee,
  Moon,
  Sun,
  Sunset,
  Check,
  Plus,
  Minus,
  Sparkles,
  Dumbbell,
  MessageCircle,
  User,
  Utensils,
  Info,
  ChevronRight,
  Leaf,
  Home
} from 'lucide-react';

// Nutrition tips based on goals
const NUTRITION_TIPS = {
  energy: [
    'Desayuna algo con carbohidratos complejos como avena o pan integral',
    'Come cada 3-4 horas para mantener la energía estable',
    'Incluye frutas como plátano o manzana para un impulso natural',
  ],
  'feel-better': [
    'Prioriza alimentos reales sobre procesados',
    'Incluye verduras en cada comida principal',
    'Come sin prisas y disfruta de la comida',
  ],
  strength: [
    'Incluye proteína en cada comida (huevos, pollo, legumbres)',
    'Come algo con proteína después del entreno',
    'No te saltes comidas, tu cuerpo necesita combustible',
  ],
  routine: [
    'Intenta comer a horas similares cada día',
    'Prepara comidas sencillas con antelación',
    'No te agobies con lo perfecto, busca lo consistente',
  ],
};

const MEAL_TIMES = [
  { id: 'breakfast', label: 'Desayuno', icon: Coffee, time: 'Mañana' },
  { id: 'lunch', label: 'Comida', icon: Sun, time: 'Mediodía' },
  { id: 'snack', label: 'Merienda', icon: Sunset, time: 'Tarde' },
  { id: 'dinner', label: 'Cena', icon: Moon, time: 'Noche' },
];

export function NutritionScreen() {
  const { user, setScreen } = useApp();
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [completedMeals, setCompletedMeals] = useState<string[]>([]);
  const [showTipDetail, setShowTipDetail] = useState<number | null>(null);

  // Load from localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    const savedData = localStorage.getItem('fitmente-nutrition');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.date === today) {
          setWaterGlasses(parsed.waterGlasses || 0);
          setCompletedMeals(parsed.completedMeals || []);
        }
      } catch {
        // Invalid data
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    localStorage.setItem('fitmente-nutrition', JSON.stringify({
      date: today,
      waterGlasses,
      completedMeals,
    }));
  }, [waterGlasses, completedMeals]);

  if (!user) return null;

  const userGoal = (user.onboarding as { goal?: string })?.goal || 'routine';
  const tips = NUTRITION_TIPS[userGoal as keyof typeof NUTRITION_TIPS] || NUTRITION_TIPS.routine;
  const waterGoal = 8; // 8 glasses per day
  const waterProgress = Math.min((waterGlasses / waterGoal) * 100, 100);

  const toggleMeal = (mealId: string) => {
    if (completedMeals.includes(mealId)) {
      setCompletedMeals(completedMeals.filter(m => m !== mealId));
    } else {
      setCompletedMeals([...completedMeals, mealId]);
    }
  };

  const addWater = () => {
    if (waterGlasses < 12) {
      setWaterGlasses(waterGlasses + 1);
    }
  };

  const removeWater = () => {
    if (waterGlasses > 0) {
      setWaterGlasses(waterGlasses - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 flex flex-col pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 pt-8 pb-6"
      >
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setScreen('profile')}
            className="p-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-stone-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-stone-900">Nutrición</h1>
            <p className="text-stone-500 text-sm">Simple y sin agobios</p>
          </div>
        </div>

        {/* Info Card */}
        <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-100 border rounded-2xl">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-green-800 text-sm leading-relaxed">
                No te preocupes por contar calorías. Céntrate en comer bien y mantenerte hidratado.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Content */}
      <div className="flex-1 px-6 space-y-4 overflow-y-auto">
        {/* Hydration Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-5 bg-white border-0 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900">Hidratación</h3>
                  <p className="text-stone-500 text-sm">Objetivo: {waterGoal} vasos</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-600">{waterGlasses}/{waterGoal}</span>
            </div>

            {/* Water progress */}
            <div className="h-3 bg-blue-100 rounded-full overflow-hidden mb-4">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${waterProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Water glasses visual */}
            <div className="flex items-center justify-center gap-1 mb-4 flex-wrap">
              {Array.from({ length: waterGoal }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    i < waterGlasses ? 'bg-blue-500' : 'bg-blue-100'
                  }`}
                >
                  <Droplets className={`w-4 h-4 ${i < waterGlasses ? 'text-white' : 'text-blue-300'}`} />
                </motion.div>
              ))}
            </div>

            {/* Water controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={removeWater}
                variant="outline"
                size="sm"
                className="w-12 h-12 rounded-xl p-0"
                disabled={waterGlasses === 0}
              >
                <Minus className="w-5 h-5" />
              </Button>
              <Button
                onClick={addWater}
                className="w-12 h-12 rounded-xl p-0 bg-blue-500 hover:bg-blue-600"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>

            {waterGlasses >= waterGoal && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-green-600 text-sm mt-4 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                ¡Objetivo de hidratación cumplido!
              </motion.p>
            )}
          </Card>
        </motion.div>

        {/* Meals Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-5 bg-white border-0 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Utensils className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900">Comidas del día</h3>
                <p className="text-stone-500 text-sm">Marca lo que hayas comido</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {MEAL_TIMES.map((meal) => {
                const Icon = meal.icon;
                const isCompleted = completedMeals.includes(meal.id);

                return (
                  <motion.button
                    key={meal.id}
                    onClick={() => toggleMeal(meal.id)}
                    whileTap={{ scale: 0.95 }}
                    className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${
                      isCompleted
                        ? 'bg-green-100 border-2 border-green-300'
                        : 'bg-stone-50 border-2 border-transparent hover:border-stone-200'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isCompleted ? 'bg-green-500' : 'bg-stone-200'
                    }`}>
                      {isCompleted ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <Icon className="w-5 h-5 text-stone-500" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className={`font-medium text-sm ${isCompleted ? 'text-green-700' : 'text-stone-700'}`}>
                        {meal.label}
                      </p>
                      <p className="text-xs text-stone-400">{meal.time}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {completedMeals.length === 4 && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-green-600 text-sm mt-4 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                ¡Has comido bien hoy!
              </motion.p>
            )}
          </Card>
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-5 bg-white border-0 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900">Consejos para ti</h3>
                <p className="text-stone-500 text-sm">Basados en tu objetivo</p>
              </div>
            </div>

            <div className="space-y-2">
              {tips.map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl"
                >
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 text-xs font-bold">{index + 1}</span>
                  </div>
                  <p className="text-stone-600 text-sm leading-relaxed">{tip}</p>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Quick Reminder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100 border rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Apple className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-amber-800 text-sm leading-relaxed">
                  <strong>Recuerda:</strong> Comer bien no significa ser perfecto.
                  Se trata de hacer elecciones que te hagan sentir bien.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Navigation - 4 Tabs */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-stone-200 px-4 py-3">
        <div className="max-w-md mx-auto flex justify-around">
          <button
            onClick={() => setScreen('dashboard')}
            className="flex flex-col items-center gap-1 px-4 py-1"
          >
            <Home className="w-6 h-6 text-stone-400" />
            <span className="text-xs text-stone-400">Inicio</span>
          </button>
          <button
            onClick={() => setScreen('chat')}
            className="flex flex-col items-center gap-1 px-4 py-1"
          >
            <MessageCircle className="w-6 h-6 text-stone-400" />
            <span className="text-xs text-stone-400">Asistente</span>
          </button>
          <button
            onClick={() => setScreen('nutrition')}
            className="flex flex-col items-center gap-1 px-4 py-1"
          >
            <Apple className="w-6 h-6 text-emerald-500" />
            <span className="text-xs text-emerald-600 font-medium">Nutrición</span>
          </button>
          <button
            onClick={() => setScreen('profile')}
            className="flex flex-col items-center gap-1 px-4 py-1"
          >
            <User className="w-6 h-6 text-stone-400" />
            <span className="text-xs text-stone-400">Perfil</span>
          </button>
        </div>
      </div>
    </div>
  );
}
