import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MASTER_PROMPT } from '@/lib/coachPrompt';
import OpenAI from 'openai';

const deepseek = new OpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY!,
});

// BOE-FK v1.0 — Lista oficial y cerrada de ejercicios (71). El Coach solo puede
// asignar ejercicios de gimnasio que estén en esta lista.
const BOE_FK = `LISTA OFICIAL DE EJERCICIOS BOE-FK v1.0 (obligatoria):
PECHO (8): Press banca con barra, Press banca con mancuernas, Press inclinado con barra, Press inclinado con mancuernas, Press en máquina convergente, Aperturas con polea, Aperturas con mancuernas, Fondos para pecho.
ESPALDA (10): Dominadas, Jalón al pecho, Jalón agarre neutro, Remo con barra, Remo con mancuerna, Remo en polea baja, Remo en máquina apoyada, Pullover en polea, Peso muerto rumano, Face Pull.
HOMBROS (8): Press militar con barra, Press militar con mancuernas, Press máquina, Elevaciones laterales con mancuernas, Elevaciones laterales en polea, Pájaros con mancuernas, Reverse Pec Deck, Elevaciones frontales.
BÍCEPS (6): Curl barra recta, Curl barra EZ, Curl alterno mancuernas, Curl inclinado, Curl martillo, Curl en polea.
TRÍCEPS (6): Jalón cuerda, Jalón barra recta, Extensión por encima de la cabeza, Press francés, Fondos en banco, Press cerrado.
CUÁDRICEPS (8): Sentadilla trasera, Sentadilla guiada (Smith), Prensa, Hack Squat, Sentadilla búlgara, Zancadas caminando, Extensión de cuádriceps, Step-Up.
ISQUIOTIBIALES (6): Curl femoral tumbado, Curl femoral sentado, Curl femoral unilateral, Peso muerto rumano con barra, Peso muerto rumano con mancuernas, Buenos días.
GLÚTEOS (5): Hip Thrust, Patada de glúteo en polea, Abducción en máquina, Sentadilla sumo, Puente de glúteo.
GEMELOS (4): Gemelo de pie, Gemelo sentado, Gemelo en prensa, Gemelo unilateral.
ABDOMEN/CORE (10): Crunch en máquina, Crunch en polea, Elevaciones de piernas colgado, Elevaciones de rodillas, Plancha frontal, Plancha lateral, Dead Bug, Pallof Press, Rueda abdominal (Ab Wheel), Mountain Climbers.
REGLA: Al crear entrenamientos o proponer/sustituir ejercicios de gimnasio, usa EXCLUSIVAMENTE ejercicios de esta lista, con estos nombres exactos. Si el usuario menciona un ejercicio que no está, sugiere el equivalente más cercano de la lista.`;

type ExerciseContext = {
  sessionName?: string;
  exerciseName?: string;
  sets?: number;
  reps?: number[];
  targetMuscle?: string;
};

function getModeInstructions(mode?: string, exerciseContext?: ExerciseContext): string {
  if (mode === 'session') {
    const ex = exerciseContext;
    let instructions = `\n\nMODO ACTIVO: CHAT EN MITAD DE UN ENTRENAMIENTO EN DIRECTO
Sesión actual: ${ex?.sessionName || 'entreno de hoy'}`;
    if (ex?.exerciseName) {
      instructions += `\nEjercicio actual: ${ex.exerciseName}${ex.sets ? ` — ${ex.sets} series x ${(ex.reps || []).join('/')} reps` : ''}${ex.targetMuscle ? ` (músculo: ${ex.targetMuscle})` : ''}`;
    }
    instructions += `\nRESTRICCIÓN DE TEMA OBLIGATORIA: SOLO puedes ayudar con: técnica del ejercicio actual, variantes o alternativas (por lesión, falta de material, incomodidad), ajustar series/reps/peso/descanso, o dudas puntuales del entreno de hoy.
- Sé MUY breve: 1-3 frases máximo, el usuario está entrenando ahora mismo y no puede leer mucho.
- Si preguntan cualquier otra cosa (nutrición, otro día, temas ajenos al fitness), responde EXACTAMENTE: "Ahora mismo solo puedo ayudarte con el ejercicio de hoy. ¡Sigue así! 💪"

${BOE_FK}`;
    return instructions;
  }

  const envMap: Record<string, string> = {
    nutrition: 'NUTRICIÓN deportiva',
    gym: 'ENTRENAMIENTO EN GIMNASIO (pesas, máquinas, mancuernas)',
    outdoor: 'ENTRENAMIENTO AL AIRE LIBRE (running, HIIT en parque, circuitos)',
  };

  const modeLabel = envMap[mode || ''] || 'ENTRENAMIENTO Y NUTRICIÓN';
  const isNutrition = mode === 'nutrition';
  const isGym = mode === 'gym';
  const isOutdoor = mode === 'outdoor';

  let instructions = `\n\nMODO ACTIVO: ${modeLabel}
RESTRICCIÓN DE TEMA OBLIGATORIA: Solo debes responder preguntas relacionadas con fitness y nutrición deportiva.`;

  if (isGym) {
    instructions += `\n- Propón ejercicios DE GIMNASIO: pesas libres, barras, máquinas, mancuernas. No propones ejercicios al aire libre ni running.\n\n${BOE_FK}`;
  } else if (isOutdoor) {
    instructions += '\n- Propón ejercicios AL AIRE LIBRE: running, HIIT en parque, circuitos con peso corporal. Sin máquinas de gym.';
  } else if (isNutrition) {
    instructions += '\n- Céntrate en nutrición: macros, timing de comidas, recetas, suplementos, dietas. Si preguntan sobre entrenamiento, puedes dar una respuesta mínima pero redirige a nutrición.';
  }

  instructions += '\n- Si el usuario pregunta algo ajeno al fitness y la nutrición (tiempo meteorológico, política, tecnología, entretenimiento, salud médica general, etc.), responde EXACTAMENTE esta frase y nada más: "Me limito solo a contestar preguntas sobre entrenamiento y nutrición. ¿En qué puedo ayudarte en esas áreas? 💪"';

  return instructions;
}

type KnowledgeEntry = { title: string; content: string };

function buildKnowledgeSection(knowledge: KnowledgeEntry[]): string {
  if (knowledge.length === 0) return '';
  const items = knowledge.map(k => `• ${k.title}: ${k.content}`).join('\n');
  return `\n\nBASE DE CONOCIMIENTO DEL COACH (información curada específicamente para esta app; úsala como referencia principal por encima de tu conocimiento general cuando sea relevante para la pregunta):\n${items}`;
}

function buildSystemPrompt(
  onboarding: Record<string, unknown>,
  profile: Record<string, unknown>,
  context?: { sessions?: Record<string, unknown>[]; lastMeasurement?: Record<string, unknown> | null },
  mode?: string,
  knowledge?: KnowledgeEntry[],
  exerciseContext?: ExerciseContext,
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

  let prompt = `${MASTER_PROMPT}

Actúas para ${name}, con un tono ${isAdvanced ? 'directo, técnico y sin rodeos' : 'cercano, motivador y sin tecnicismos innecesarios'}.

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
- Escribe en TEXTO PLANO: nada de Markdown, asteriscos (**), almohadillas ni listas con símbolos — la app muestra el texto tal cual
- Usa siempre el nombre "${name}" al dirigirte al usuario
- TIENES DOS HERRAMIENTAS: "create_workout_session" (crea un entreno que el usuario puede añadir a sus sesiones con un toque) y "create_nutrition_plan" (crea un plan de comidas que se guarda en la pestaña Nutrición). Úsalas cuando el usuario pida un entreno/rutina o una dieta/plan de comidas. Adáptalas SIEMPRE a su perfil, objetivo, nivel, lesiones y preferencias.
- Si el usuario pide AÑADIR, GUARDAR o METER en sus entrenamientos/sesiones un entreno que le has descrito, DEBES llamar a "create_workout_session" con ese entreno exacto. NUNCA lo repitas solo en texto: sin la tarjeta el usuario no puede guardarlo.
- Cuando uses una herramienta, en tu respuesta de texto explica brevemente qué le has preparado y anímale a guardarlo con el botón de la tarjeta. No repitas todos los datos: ya los verá en la tarjeta.
- Para nutrición puedes crear el plan directamente con la herramienta aunque no haya completado el cuestionario, usando los datos de su perfil
- NUNCA diagnostiques enfermedades ni recetes medicamentos
- Si hay lesiones, recomienda consultar a un médico además de dar consejos adaptados
- Tono: ${isAdvanced ? 'directo, sin rodeos, técnico cuando proceda' : 'motivador, cercano, sin agobiar con datos'}`;

  prompt += getModeInstructions(mode, exerciseContext);
  prompt += buildKnowledgeSection(knowledge ?? []);

  return prompt;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { message, history, mode, context: exerciseContext } = await req.json() as {
      message: string;
      history?: { role: string; content: string }[];
      mode?: string;
      context?: ExerciseContext;
    };

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 });
    }

    const messages: OpenAI.ChatCompletionMessageParam[] = [];

    // Base de conocimiento: prioriza la categoría del modo activo + entradas generales
    let knowledge: KnowledgeEntry[] = [];
    const knowledgeCategories = mode ? [mode, 'general'] : ['general'];
    const { data: matchedKnowledge } = await supabase
      .from('coach_knowledge')
      .select('title, content')
      .in('category', knowledgeCategories)
      .textSearch('search', message, { type: 'websearch', config: 'spanish' })
      .limit(6);
    knowledge = matchedKnowledge ?? [];
    if (knowledge.length === 0) {
      const { data: fallbackKnowledge } = await supabase
        .from('coach_knowledge')
        .select('title, content')
        .in('category', knowledgeCategories)
        .order('created_at', { ascending: false })
        .limit(4);
      knowledge = fallbackKnowledge ?? [];
    }

    if (user) {
      const [{ data: onboarding }, { data: profile }, { data: sessions }, { data: measurements }, { data: lastReview }] = await Promise.all([
        supabase.from('user_onboarding').select('*').eq('user_id', user.id).single(),
        supabase.from('user_profiles').select('*').eq('id', user.id).single(),
        supabase.from('weekly_sessions').select('session_number, name, duration, status').eq('user_id', user.id).order('sort_order'),
        supabase.from('body_measurements').select('*').eq('user_id', user.id).order('recorded_at', { ascending: false }).limit(1),
        supabase.from('user_reviews').select('answers, motor_action, coach_message, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1),
      ]);

      if (onboarding && profile) {
        let prompt = buildSystemPrompt(onboarding, profile, {
          sessions: sessions ?? [],
          lastMeasurement: measurements?.[0] ?? null,
        }, mode, knowledge, exerciseContext);

        const review = lastReview?.[0];
        if (review) {
          const a = review.answers as Record<string, unknown>;
          prompt += `\n\nÚLTIMA REVISIÓN PERIÓDICA (${new Date(review.created_at).toLocaleDateString('es-ES')}):
- Fuerza: ${a.strength} | Energía: ${a.energy} | Recuperación: ${a.recovery} | Sueño: ${a.sleep} | Estrés: ${a.stress} | Motivación: ${a.motivation}
- Molestias: ${(a.discomfort as string) || 'ninguna'}
- Decisión del Motor: ${review.motor_action}
Ten en cuenta esta revisión al aconsejar (p.ej. si hay molestias, estrés alto o mala recuperación, sé más conservador).`;
        }

        messages.push({ role: 'system', content: prompt });
      }
    }

    if (messages.length === 0) {
      messages.push({
        role: 'system',
        content: MASTER_PROMPT
          + '\n\nResponde siempre en español.'
          + getModeInstructions(mode, exerciseContext)
          + buildKnowledgeSection(knowledge),
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
        description: 'Crea una sesión de entrenamiento personalizada que el usuario puede añadir a sus sesiones. Úsala cuando el usuario pida un entrenamiento, rutina o sesión, Y SIEMPRE que pida añadir/guardar/meter en sus entrenamientos un entreno ya comentado en la conversación.',
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

    // Si el usuario pide explícitamente añadir/guardar un entreno, forzamos la
    // herramienta para que siempre salga la tarjeta con el botón de guardar.
    const normalized = message.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const wantsWorkoutSaved =
      /(anad|agreg|guard|apunt|\bmete)/.test(normalized) &&
      /(entren|rutina|sesion)/.test(normalized);

    const completion = await deepseek.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 1200,
      temperature: 0.7,
      tools: [workoutTool, nutritionTool],
      tool_choice: wantsWorkoutSaved
        ? { type: 'function', function: { name: 'create_workout_session' } }
        : 'auto',
    });

    const choice = completion.choices[0];
    let aiResponse = '';
    let workoutData = null;
    let nutritionData = null;

    if (choice.message.tool_calls?.length) {
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
        { user_id: user.id, role: 'user', content: message, mode: mode ?? null },
        { user_id: user.id, role: 'assistant', content: aiResponse, mode: mode ?? null },
      ]);
    }

    return NextResponse.json({ response: aiResponse, workout: workoutData, nutritionPlan: nutritionData });
  } catch (err) {
    console.error('[chat POST]', err);
    return NextResponse.json({ error: 'Error al procesar el mensaje' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ data: [] });

    const mode = req.nextUrl.searchParams.get('mode');

    let query = supabase
      .from('chat_messages')
      .select('id, role, content, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(100);

    if (mode) query = query.eq('mode', mode);

    const { data, error } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data: data || [] });
  } catch (err) {
    console.error('[chat GET]', err);
    return NextResponse.json({ error: 'Error al cargar mensajes' }, { status: 500 });
  }
}
