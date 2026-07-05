import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

const deepseek = new OpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { nutritionProfile, userProfile } = await req.json();

    const goalLabels: Record<string, string> = {
      'lose-fat': 'perder grasa corporal',
      'gain-muscle': 'ganar masa muscular',
      maintain: 'mantener el peso actual',
      performance: 'mejorar el rendimiento deportivo',
    };

    const dietLabels: Record<string, string> = {
      omnivore: 'omnívora (come de todo)',
      vegetarian: 'vegetariana (sin carne)',
      vegan: 'vegana (sin productos animales)',
      other: 'dieta especial/personalizada',
    };

    const cookLabels: Record<string, string> = {
      home: 'cocina habitualmente en casa',
      outside: 'come fuera de casa frecuentemente',
      mixed: 'combina cocinar en casa y comer fuera',
    };

    const timeLabels: Record<string, string> = {
      morning: 'por la mañana',
      afternoon: 'por la tarde',
      evening: 'por la noche',
    };

    const prompt = `Eres un nutricionista deportivo experto. Crea un plan nutricional personalizado y práctico en español.

DATOS DEL USUARIO:
- Peso: ${userProfile?.weight || 70}kg | Altura: ${userProfile?.height || 170}cm
- Objetivo principal: ${goalLabels[nutritionProfile.goal] || nutritionProfile.goal}
- Tipo de dieta: ${dietLabels[nutritionProfile.dietType] || nutritionProfile.dietType}
- Alergias/intolerancias: ${nutritionProfile.allergies?.join(', ') || 'Ninguna'}
- Alimentos que no le gustan: ${nutritionProfile.dislikedFoods || 'Ninguno indicado'}
- Número de comidas al día: ${nutritionProfile.mealsPerDay}
- Hábito de cocina: ${cookLabels[nutritionProfile.cookingFrequency] || nutritionProfile.cookingFrequency}
- Presupuesto: ${nutritionProfile.budget === 'low' ? 'ajustado (económico)' : nutritionProfile.budget === 'medium' ? 'moderado' : 'sin restricción'}
- Hora de entrenamiento: ${timeLabels[nutritionProfile.trainingTime] || nutritionProfile.trainingTime}
- Suplementos actuales: ${nutritionProfile.supplements || 'Ninguno'}
- Condiciones médicas relevantes: ${nutritionProfile.medicalConditions || 'Ninguna'}

Genera un plan nutricional en formato JSON con esta estructura EXACTA (sin texto fuera del JSON):
{
  "dailyCalories": número_entero,
  "macros": {
    "protein": "Xg",
    "carbs": "Xg",
    "fats": "Xg"
  },
  "meals": [
    {
      "name": "nombre de la comida",
      "time": "hora aproximada",
      "description": "descripción breve de qué comer",
      "examples": ["opción concreta 1", "opción concreta 2", "opción concreta 3"]
    }
  ],
  "guidelines": [
    "consejo práctico 1",
    "consejo práctico 2",
    "consejo práctico 3",
    "consejo práctico 4",
    "consejo práctico 5"
  ],
  "supplements": ["suplemento recomendado si aplica, si no dejar array vacío"],
  "preWorkout": "qué y cuándo comer antes del entrenamiento",
  "postWorkout": "qué y cuándo comer después del entrenamiento"
}

IMPORTANTE: Incluye exactamente ${nutritionProfile.mealsPerDay} comidas. Usa alimentos comunes y fáciles de encontrar en España. Adapta todo estrictamente a las restricciones y preferencias indicadas. El plan debe ser realista y sostenible, no perfecto.`;

    const completion = await deepseek.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'Eres un nutricionista deportivo experto. Responde ÚNICAMENTE con el JSON solicitado, sin texto adicional antes ni después.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 2000,
      temperature: 0.4,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Respuesta inválida de la IA');

    const plan = JSON.parse(jsonMatch[0]);
    const planWithDate = { ...plan, generatedAt: new Date().toISOString() };

    if (user) {
      await supabase
        .from('user_profiles')
        .update({
          nutrition_profile: nutritionProfile,
          nutrition_plan: planWithDate,
          nutrition_questionnaire_completed: true,
        })
        .eq('id', user.id);
    }

    return NextResponse.json({ plan: planWithDate });
  } catch (err) {
    console.error('[nutrition POST]', err);
    return NextResponse.json({ error: 'Error al generar el plan nutricional' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ data: null });

    const { data, error } = await supabase
      .from('user_profiles')
      .select('nutrition_profile, nutrition_plan, nutrition_questionnaire_completed')
      .eq('id', user.id)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data });
  } catch (err) {
    console.error('[nutrition GET]', err);
    return NextResponse.json({ error: 'Error al cargar el plan' }, { status: 500 });
  }
}

// Guardar plan generado directamente por el Coach (sin cuestionario)
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const { plan } = await req.json();

    // El plan puede llegar en dos formatos:
    //  a) NutritionPlan ya formateado (meals con `examples`) → guardar tal cual (edición manual)
    //  b) CoachNutritionPlan (meals con `foods`) → convertir
    const isDisplayFormat = Array.isArray(plan.meals) && plan.meals[0] && 'examples' in plan.meals[0];

    const nutritionPlan = isDisplayFormat
      ? { ...plan, generatedAt: plan.generatedAt || new Date().toISOString() }
      : {
          dailyCalories: plan.dailyCalories,
          macros: {
            protein: `${plan.macros.protein}g`,
            carbs: `${plan.macros.carbs}g`,
            fats: `${plan.macros.fats}g`,
          },
          meals: plan.meals.map((m: { name: string; time: string; foods: string[]; calories: number }) => ({
            name: m.name,
            time: m.time,
            description: `${m.calories} kcal`,
            examples: m.foods,
          })),
          guidelines: plan.guidelines,
          preWorkout: plan.preWorkout || '',
          postWorkout: plan.postWorkout || '',
          generatedAt: new Date().toISOString(),
        };

    const { error } = await supabase
      .from('user_profiles')
      .update({ nutrition_plan: nutritionPlan })
      .eq('id', user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data: nutritionPlan });
  } catch (err) {
    console.error('[nutrition PUT]', err);
    return NextResponse.json({ error: 'Error al guardar el plan' }, { status: 500 });
  }
}

// PATCH → tres modos: regenerar comida | intercambiar alimento | añadir comida
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json() as {
      type?: string;
      meal?: { name: string; time: string; description?: string; examples?: string[] };
      food?: string;
      planContext?: { dailyCalories?: number; goal?: string; dietType?: string; mealsCount?: number; existingMeals?: string[] };
    };
    const { type = 'regenerate_meal', meal, food, planContext } = body;

    // ── Intercambiar un alimento concreto ──
    if (type === 'swap_food') {
      const prompt = `Eres un nutricionista. Sugiere 1 alimento alternativo para la comida "${meal?.name}".
Alimento actual: "${food}"
Propón 1 alternativa saludable y equivalente en calorías. Solo el nombre, sin descripción adicional.
Responde ÚNICAMENTE con JSON válido: { "food": "nombre del alimento alternativo" }`;

      const completion = await deepseek.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'Responde SOLO con el JSON pedido.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 80,
        temperature: 0.9,
      });
      const text = completion.choices[0]?.message?.content || '';
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('Respuesta inválida');
      return NextResponse.json({ food: JSON.parse(match[0]).food });
    }

    // ── Añadir nueva comida al plan ──
    if (type === 'add_meal') {
      const existing = (planContext?.existingMeals || []).join(', ');
      const prompt = `Eres un nutricionista. El plan ya tiene: ${existing}.
Calorías diarias totales: ${planContext?.dailyCalories || 2000} kcal.
Genera 1 comida o snack ADICIONAL diferente y complementaria a las existentes.
Responde ÚNICAMENTE con JSON válido:
{
  "name": "nombre",
  "time": "hora aproximada",
  "description": "descripción / kcal aproximadas",
  "examples": ["opción 1", "opción 2", "opción 3"]
}`;

      const completion = await deepseek.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'Eres un nutricionista deportivo. Responde SOLO con el JSON pedido.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 350,
        temperature: 0.7,
      });
      const text = completion.choices[0]?.message?.content || '';
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('Respuesta inválida');
      return NextResponse.json({ meal: JSON.parse(match[0]) });
    }

    // ── Regenerar comida completa (comportamiento original) ──
    if (!meal) throw new Error('meal es requerido');
    const prompt = `Eres un nutricionista. Genera UNA alternativa para esta comida de un plan nutricional, en español.

COMIDA A SUSTITUIR: ${meal.name} (${meal.time})
${planContext?.dailyCalories ? `Calorías diarias totales del plan: ${planContext.dailyCalories} kcal` : ''}
${planContext?.mealsCount ? `Nº de comidas al día: ${planContext.mealsCount}` : ''}
${planContext?.dietType ? `Tipo de dieta: ${planContext.dietType}` : ''}

Mantén el mismo tipo de comida (${meal.name}) y una carga calórica similar, pero propón opciones DIFERENTES y variadas.

Responde ÚNICAMENTE con JSON válido, sin texto adicional:
{
  "name": "${meal.name}",
  "time": "${meal.time}",
  "description": "breve descripción / kcal aproximadas",
  "examples": ["opción 1", "opción 2", "opción 3"]
}`;

    const completion = await deepseek.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'Eres un nutricionista deportivo. Responde SOLO con el JSON pedido.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.8,
    });

    const text = completion.choices[0]?.message?.content || '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Respuesta inválida de la IA');
    return NextResponse.json({ meal: JSON.parse(match[0]) });
  } catch (err) {
    console.error('[nutrition PATCH]', err);
    return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 });
  }
}
