import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

const deepseek = new OpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY!,
});

function getModeInstructions(mode?: string): string {
  const envMap: Record<string, string> = {
    nutrition: 'NUTRICIÓN deportiva',
    gym: 'ENTRENAMIENTO EN GIMNASIO (pesas, máquinas, mancuernas)',
    outdoor: 'ENTRENAMIENTO AL AIRE LIBRE (running, HIIT en parque, circuitos)',
    calisthenics: 'CALISTENIA Y BARRAS (dominadas, fondos, muscle-up, etc.)',
  };

  const modeLabel = envMap[mode || ''] || 'ENTRENAMIENTO Y NUTRICIÓN';
  const isNutrition = mode === 'nutrition';
  const isGym = mode === 'gym';
  const isOutdoor = mode === 'outdoor';
  const isCalisthenics = mode === 'calisthenics';

  let instructions = `\n\nMODO ACTIVO: ${modeLabel}
RESTRICCIÓN DE TEMA OBLIGATORIA: Solo debes responder preguntas relacionadas con fitness y nutrición deportiva.`;

  if (isGym) {
    instructions += '\n- Propón ejercicios DE GIMNASIO: pesas libres, barras, máquinas, mancuernas. No propones ejercicios de calistenia de calle ni running.';
  } else if (isOutdoor) {
    instructions += '\n- Propón ejercicios AL AIRE LIBRE: running, HIIT en parque, circuitos con peso corporal. Sin máquinas de gym ni barras de calistenia.';
  } else if (isCalisthenics) {
    instructions += '\n- Propón CALISTENIA Y BARRAS: dominadas, fondos en paralelas, muscle-up, L-sit, front lever, pistol squat, etc. Sin máquinas ni pesas.';
  } else if (isNutrition) {
    instructions += '\n- Céntrate en nutrición: macros, timing de comidas, recetas, suplementos, dietas. Si preguntan sobre entrenamiento, puedes dar una respuesta mínima pero redirige a nutrición.';
  }

  instructions += '\n- Si el usuario pregunta algo ajeno al fitness y la nutrición (tiempo meteorológico, política, tecnología, entretenimiento, salud médica general, etc.), responde EXACTAMENTE esta frase y nada más: "Me limito solo a contestar preguntas sobre entrenamiento y nutrición. ¿En qué puedo ayudarte en esas áreas? 💪"';

  return instructions;
}

function buildSystemPrompt(
  onboarding: Record<string, unknown>,
  profile: Record<string, unknown>,
  context?: { sessions?: Record<string, unknown>[]; lastMeasurement?: Record<string, unknown> | null },
  mode?: string,
): string {
  const name = (profile.name as string) || 'Usuario';
  const isAdvanced = onboarding.level === 'advanced';
  const goal = (isAdvanced ? onboarding.advanced_goal : onboarding.beginner_goal) as string;

  const goalLabels: Record<string, string> = {
    energy: 'ganar energía',
    'feel-better': 'sentirse mejor',
    strength: 'ganar fuerza',
    routine: 'crear una rutina constante',
    physique: 'mejorar su físico',
    performance: 'mejorar rendimiento deportivo',
    maintain: 'mantener su forma',
  };

  const ageLabels: Record<string, string> = {
    'under-25': 'menos de 25',
    '25-34': '25-34',
    '35-44': '35-44',
    '45-54': '45-54',
    '55+': '55 o más',
  };

  const comfortLabels: Record<string, string> = {
    shy: 'muy tímido en el gym',
    insecure: 'algo inseguro',
    depends: 'depende del día',
    comfortable: 'cómodo en el gym',
  };

  const injuries = (profile.injuries as string[]) || [];
  const excluded = (profile.excluded_exercises as string[]) || [];
  const nutritionProfile = profile.nutrition_profile as Record<string, unknown> | null;

  let prompt = `Eres Fit K Coach, el entrenador personal de IA de ${name}. Actúas como un coach personal experto en fitness y nutrición, con un tono ${isAdvanced ? 'directo, técnico y sin rodeos' : 'cercano, motivador y sin tecnicismos innecesarios'}.

PERFIL DE ${name.toUpperCase()}:
- Género: ${profile.biological_profile === 'male' ? 'Hombre' : 'Mujer'}
- Edad: ${ageLabels[(profile.age_range as string)] || profile.age_range} años
- Peso: ${profile.weight}kg | Altura: ${profile.height}cm
- Nivel: ${isAdvanced ? 'Avanzado (entrena con constancia)' : 'Principiante o retomando'}
- Objetivo: ${goalLabels[goal] || goal}
- Días de entrenamiento: ${onboarding.days_per_week} días/semana
- Duración de sesiones: ${(onboarding.workout_duration as string) || '45min'}
- Semana actual de programa: ${1}`;

  if (onboarding.gym_comfort) {
    prompt += `\n- Comodidad en el gym: ${comfortLabels[(onboarding.gym_comfort as string)] || onboarding.gym_comfort}`;
  }
  if (injuries.length > 0) {
    prompt += `\n- Lesiones/limitaciones: ${injuries.join(', ')}`;
  }
  if (excluded.length > 0) {
    prompt += `\n- Ejercicios que no hace: ${excluded.join(', ')}`;
  }

  if (nutritionProfile) {
    const dietLabels: Record<string, string> = {
      omnivore: 'omnívoro',
      vegetarian: 'vegetariano',
      vegan: 'vegano',
      other: 'dieta especial',
    };
    const goalNutrLabels: Record<string, string> = {
      'lose-fat': 'perder grasa',
      'gain-muscle': 'ganar músculo',
      maintain: 'mantener peso',
      performance: 'rendimiento',
    };

    prompt += `\n\nPERFIL NUTRICIONAL:
- Objetivo: ${goalNutrLabels[(nutritionProfile.goal as string)] || nutritionProfile.goal}
- Dieta: ${dietLabels[(nutritionProfile.dietType as string)] || nutritionProfile.dietType}
- Alergias: ${(nutritionProfile.allergies as string[])?.join(', ') || 'Ninguna'}
- Alimentos que no le gustan: ${(nutritionProfile.dislikedFoods as string) || 'Ninguno'}
- Comidas al día: ${nutritionProfile.mealsPerDay}
- Cocina en casa: ${nutritionProfile.cookingFrequency === 'home' ? 'Sí' : nutritionProfile.cookingFrequency === 'outside' ? 'No' : 'A veces'}
- Hora de entreno: ${nutritionProfile.trainingTime === 'morning' ? 'Mañana' : nutritionProfile.trainingTime === 'afternoon' ? 'Tarde' : 'Noche'}
- Suplementos: ${(nutritionProfile.supplements as string) || 'Ninguno'}`;
  }

  // Contexto de entrenamiento actual
  if (context?.sessions && context.sessions.length > 0) {
    const done = context.sessions.filter(s => s.status === 'completed').length;
    const total = context.sessions.length;
    const sessionList = context.sessions
      .map(s => `  · Sesión ${s.session_number}: ${s.name} (${s.duration}min) — ${s.status === 'completed' ? '✅ hecha' : s.status === 'available' ? '⏳ siguiente' : '🔒 pendiente'}`)
      .join('\n');
    prompt += `\n\nSEMANA DE ENTRENAMIENTO ACTUAL (${done}/${total} completadas):\n${sessionList}`;
  }

  // Contexto de métricas corporales
  if (context?.lastMeasurement) {
    const m = context.lastMeasurement;
    const parts = [
      m.weight && `peso ${m.weight}kg`,
      m.chest && `pecho ${m.chest}cm`,
      m.waist && `cintura ${m.waist}cm`,
      m.arms && `brazo ${m.arms}cm`,
      m.thighs && `muslo ${m.thighs}cm`,
    ].filter(Boolean);
    if (parts.length > 0) {
      prompt += `\n\nÚLTIMAS MÉTRICAS CORPORALES: ${parts.join(', ')}.`;
    }
  }

  prompt += `\n\nINSTRUCCIONES IMPORTANTES:
- Responde SIEMPRE en español
- Sé conciso: máximo 3-4 párrafos por respuesta
- Usa siempre el nombre "${name}" al dirigirte al usuario
- TIENES DOS HERRAMIENTAS: "create_workout_session" (crea un entreno que el usuario puede añadir a sus sesiones con un toque) y "create_nutrition_plan" (crea un plan de comidas que se guarda en la pestaña Nutrición). Úsalas SOLO cuando el usuario pida explícitamente un entreno/rutina o una dieta/plan de comidas. Adáptalas SIEMPRE a su perfil, objetivo, nivel, lesiones y preferencias.
- Cuando uses una herramienta, en tu respuesta de texto explica brevemente qué le has preparado y anímale a guardarlo con el botón de la tarjeta. No repitas todos los datos: ya los verá en la tarjeta.
- Para nutrición puedes crear el plan directamente con la herramienta aunque no haya completado el cuestionario, usando los datos de su perfil
- NUNCA diagnostiques enfermedades ni recetes medicamentos
- Si hay lesiones, recomienda consultar a un médico además de dar consejos adaptados
- Tono: ${isAdvanced ? 'directo, sin rodeos, técnico cuando proceda' : 'motivador, cercano, sin agobiar con datos'}`;

  prompt += getModeInstructions(mode);

  return prompt;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { message, history, mode } = await req.json() as {
      message: string;
      history?: { role: string; content: string }[];
      mode?: string;
    };

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 });
    }

    const messages: OpenAI.ChatCompletionMessageParam[] = [];

    if (user) {
      const [{ data: onboarding }, { data: profile }, { data: sessions }, { data: measurements }] = await Promise.all([
        supabase.from('user_onboarding').select('*').eq('user_id', user.id).single(),
        supabase.from('user_profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('weekly_sessions').select('session_number, name, duration, status').eq('user_id', user.id).order('sort_order'),
        supabase.from('body_measurements').select('*').eq('user_id', user.id).order('recorded_at', { ascending: false }).limit(1),
      ]);

      if (onboarding && profile) {
        messages.push({
          role: 'system',
          content: buildSystemPrompt(onboarding, profile, {
            sessions: sessions ?? [],
            lastMeasurement: measurements?.[0] ?? null,
          }, mode),
        });
      }
    }

    if (messages.length === 0) {
      messages.push({
        role: 'system',
        content: 'Eres Fit K Coach, un entrenador personal de IA experto en fitness y nutrición. Responde siempre en español, de forma concisa y motivadora.',
      });
    }

    for (const msg of (history || []).slice(-20)) {
      messages.push({ role: msg.role as 'user' | 'assistant', content: msg.content });
    }
    messages.push({ role: 'user', content: message });

    const nutritionTool: OpenAI.Chat.Completions.ChatCompletionTool = {
      type: 'function',
      function: {
        name: 'create_nutrition_plan',
        description: 'Crea un plan nutricional semanal personalizado. Úsala SOLO cuando el usuario pida explícitamente una dieta, plan de alimentación o nutrición específica.',
        parameters: {
          type: 'object',
          properties: {
            goal: { type: 'string', description: 'Objetivo (ej: "Perder 250g/semana", "Ganar músculo")' },
            dailyCalories: { type: 'number', description: 'Calorías diarias totales' },
            macros: {
              type: 'object',
              properties: {
                protein: { type: 'number', description: 'Gramos de proteína al día' },
                carbs: { type: 'number', description: 'Gramos de carbohidratos al día' },
                fats: { type: 'number', description: 'Gramos de grasas al día' },
              },
              required: ['protein', 'carbs', 'fats'],
            },
            meals: {
              type: 'array',
              description: 'Comidas del día (4-6 comidas)',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: 'Ej: Desayuno, Almuerzo, Merienda' },
                  time: { type: 'string', description: 'Hora orientativa (ej: 08:00)' },
                  foods: { type: 'array', items: { type: 'string' }, description: 'Lista de alimentos sugeridos' },
                  calories: { type: 'number', description: 'Calorías aproximadas de esa comida' },
                },
                required: ['name', 'time', 'foods', 'calories'],
              },
            },
            guidelines: { type: 'array', items: { type: 'string' }, description: 'Pautas clave a seguir (3-5 consejos)' },
            preWorkout: { type: 'string', description: 'Qué comer antes de entrenar' },
            postWorkout: { type: 'string', description: 'Qué comer después de entrenar' },
          },
          required: ['goal', 'dailyCalories', 'macros', 'meals', 'guidelines'],
        },
      },
    };

    const workoutTool: OpenAI.Chat.Completions.ChatCompletionTool = {
      type: 'function',
      function: {
        name: 'create_workout_session',
        description: 'Crea una sesión de entrenamiento personalizada. Úsala SOLO cuando el usuario pida explícitamente un entrenamiento, rutina o sesión específica para hacer.',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Nombre corto de la sesión (ej: "Full Body en Casa")' },
            targetMuscles: { type: 'string', description: 'Músculos objetivo (ej: "Todo el cuerpo", "Pecho y espalda")' },
            duration: { type: 'number', description: 'Duración estimada en minutos' },
            exercises: {
              type: 'array',
              description: 'Lista de ejercicios de la sesión',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  sets: { type: 'number' },
                  reps: { type: 'array', items: { type: 'number' }, description: 'Array de repeticiones por serie (ej: [12,12,10])' },
                  restSeconds: { type: 'number', description: 'Segundos de descanso entre series' },
                  instructions: { type: 'string', description: 'Indicación técnica breve (opcional)' },
                },
                required: ['name', 'sets', 'reps', 'restSeconds'],
              },
            },
          },
          required: ['name', 'targetMuscles', 'duration', 'exercises'],
        },
      },
    };

    const completion = await deepseek.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 1200,
      temperature: 0.7,
      tools: [workoutTool, nutritionTool],
      tool_choice: 'auto',
    });

    const choice = completion.choices[0];
    let aiResponse = '';
    let workoutData = null;
    let nutritionData = null;

    if (choice.finish_reason === 'tool_calls' && choice.message.tool_calls?.length) {
      const toolCall = choice.message.tool_calls[0] as { id: string; type: string; function: { name: string; arguments: string } };
      const fnName = toolCall.function?.name;

      if (fnName === 'create_workout_session' || fnName === 'create_nutrition_plan') {
        try {
          const parsed = JSON.parse(toolCall.function.arguments);
          if (fnName === 'create_workout_session') workoutData = parsed;
          else nutritionData = parsed;
        } catch { /* ignore */ }

        const successMsg = fnName === 'create_workout_session'
          ? 'Sesión de entrenamiento creada correctamente.'
          : 'Plan nutricional creado correctamente.';

        const followUp = await deepseek.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [
            ...messages,
            choice.message,
            { role: 'tool' as const, tool_call_id: toolCall.id, content: successMsg },
          ],
          max_tokens: 400,
          temperature: 0.7,
        });
        aiResponse = followUp.choices[0]?.message?.content || '¡Listo! Aparecerá en la tarjeta de abajo.';
      }
    } else {
      aiResponse = choice.message?.content || 'Lo siento, no pude generar una respuesta.';
    }

    if (user) {
      await supabase.from('chat_messages').insert([
        { user_id: user.id, role: 'user', content: message },
        { user_id: user.id, role: 'assistant', content: aiResponse },
      ]);
    }

    return NextResponse.json({ response: aiResponse, workout: workoutData, nutritionPlan: nutritionData });
  } catch (err) {
    console.error('[chat POST]', err);
    return NextResponse.json({ error: 'Error al procesar el mensaje' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ data: [] });

    const { data, error } = await supabase
      .from('chat_messages')
      .select('id, role, content, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data: data || [] });
  } catch (err) {
    console.error('[chat GET]', err);
    return NextResponse.json({ error: 'Error al cargar mensajes' }, { status: 500 });
  }
}
