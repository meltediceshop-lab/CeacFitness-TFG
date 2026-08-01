// ─────────────────────────────────────────────────────────────────────
// Motor Fit-K — generación de planes de entrenamiento personalizados.
// Usa EXCLUSIVAMENTE la lista oficial BOE-FK v1.0 (71 ejercicios) y
// decide según TODAS las variables del usuario: objetivo (incl. pérdida
// de peso vs pérdida de grasa vs recomposición), nivel, días/semana,
// duración, peso/altura (IMC), lesiones, músculo prioritario y
// ejercicios excluidos. Determinista: mismo perfil → mismo plan.
// ─────────────────────────────────────────────────────────────────────
import type { Exercise, WeeklySession, MuscleGroup } from '@/types/user';

type BoeGroup =
  | 'pecho' | 'espalda' | 'hombros' | 'biceps' | 'triceps'
  | 'cuadriceps' | 'isquios' | 'gluteos' | 'gemelos' | 'core';

interface MotorExercise {
  name: string;
  group: BoeGroup;
  muscle: MuscleGroup;
  machine?: boolean;  // bajo impacto articular / guiado
  timed?: boolean;    // se mide en segundos (planchas, etc.)
  cue: string;
}

// ── Catálogo BOE-FK v1.0 (71) ────────────────────────────────────────
const CATALOG: MotorExercise[] = [
  // PECHO (8)
  { name: 'Press banca con barra',           group: 'pecho', muscle: 'chest', cue: 'Baja la barra controlada hasta el pecho' },
  { name: 'Press banca con mancuernas',      group: 'pecho', muscle: 'chest', cue: 'Codos a unos 45º del cuerpo' },
  { name: 'Press inclinado con barra',       group: 'pecho', muscle: 'chest', cue: 'Banco a 30-45º, baja al pecho superior' },
  { name: 'Press inclinado con mancuernas',  group: 'pecho', muscle: 'chest', cue: 'No choques las mancuernas arriba' },
  { name: 'Press en máquina convergente',    group: 'pecho', muscle: 'chest', machine: true, cue: 'Espalda pegada al respaldo' },
  { name: 'Aperturas con polea',             group: 'pecho', muscle: 'chest', machine: true, cue: 'Abraza un barril imaginario' },
  { name: 'Aperturas con mancuernas',        group: 'pecho', muscle: 'chest', cue: 'Codos ligeramente flexionados siempre' },
  { name: 'Fondos para pecho',               group: 'pecho', muscle: 'chest', cue: 'Inclínate hacia delante para cargar el pecho' },
  // ESPALDA (10)
  { name: 'Dominadas',                       group: 'espalda', muscle: 'back', cue: 'Pecho hacia la barra, sin balanceo' },
  { name: 'Jalón al pecho',                  group: 'espalda', muscle: 'back', machine: true, cue: 'Lleva la barra a la clavícula' },
  { name: 'Jalón agarre neutro',             group: 'espalda', muscle: 'back', machine: true, cue: 'Codos pegados al torso al bajar' },
  { name: 'Remo con barra',                  group: 'espalda', muscle: 'back', cue: 'Espalda recta, tira hacia el ombligo' },
  { name: 'Remo con mancuerna',              group: 'espalda', muscle: 'back', cue: 'Aprieta el omóplato arriba' },
  { name: 'Remo en polea baja',              group: 'espalda', muscle: 'back', machine: true, cue: 'Pecho alto, tira hacia el abdomen' },
  { name: 'Remo en máquina apoyada',         group: 'espalda', muscle: 'back', machine: true, cue: 'Pecho apoyado, sin impulso' },
  { name: 'Pullover en polea',               group: 'espalda', muscle: 'back', machine: true, cue: 'Brazos casi rectos, arco amplio' },
  { name: 'Peso muerto rumano',              group: 'espalda', muscle: 'back', cue: 'Cadera atrás, espalda neutra' },
  { name: 'Face Pull',                       group: 'espalda', muscle: 'back', machine: true, cue: 'Tira hacia la cara con codos altos' },
  // HOMBROS (8)
  { name: 'Press militar con barra',         group: 'hombros', muscle: 'shoulders', cue: 'No arquees la zona lumbar' },
  { name: 'Press militar con mancuernas',    group: 'hombros', muscle: 'shoulders', cue: 'Sube sin chocar arriba' },
  { name: 'Press máquina',                   group: 'hombros', muscle: 'shoulders', machine: true, cue: 'Recorrido completo y controlado' },
  { name: 'Elevaciones laterales con mancuernas', group: 'hombros', muscle: 'shoulders', cue: 'Sube hasta la altura del hombro' },
  { name: 'Elevaciones laterales en polea',  group: 'hombros', muscle: 'shoulders', machine: true, cue: 'Tensión constante, sin impulso' },
  { name: 'Pájaros con mancuernas',          group: 'hombros', muscle: 'shoulders', cue: 'Torso inclinado, abre en arco' },
  { name: 'Reverse Pec Deck',                group: 'hombros', muscle: 'shoulders', machine: true, cue: 'Aprieta la parte posterior del hombro' },
  { name: 'Elevaciones frontales',           group: 'hombros', muscle: 'shoulders', cue: 'Alterna brazos, sin balanceo' },
  // BÍCEPS (6)
  { name: 'Curl barra recta',                group: 'biceps', muscle: 'arms', cue: 'Codos fijos junto al torso' },
  { name: 'Curl barra EZ',                   group: 'biceps', muscle: 'arms', cue: 'Agarre cómodo, baja controlado' },
  { name: 'Curl alterno mancuernas',         group: 'biceps', muscle: 'arms', cue: 'Gira la muñeca al subir' },
  { name: 'Curl inclinado',                  group: 'biceps', muscle: 'arms', cue: 'Banco a 45º, estira bien abajo' },
  { name: 'Curl martillo',                   group: 'biceps', muscle: 'arms', cue: 'Agarre neutro, sin balanceo' },
  { name: 'Curl en polea',                   group: 'biceps', muscle: 'arms', machine: true, cue: 'Tensión constante todo el recorrido' },
  // TRÍCEPS (6)
  { name: 'Jalón cuerda',                    group: 'triceps', muscle: 'arms', machine: true, cue: 'Separa la cuerda abajo' },
  { name: 'Jalón barra recta',               group: 'triceps', muscle: 'arms', machine: true, cue: 'Codos pegados, extiende del todo' },
  { name: 'Extensión por encima de la cabeza', group: 'triceps', muscle: 'arms', cue: 'Codos apuntando al techo' },
  { name: 'Press francés',                   group: 'triceps', muscle: 'arms', cue: 'Baja la barra hacia la frente' },
  { name: 'Fondos en banco',                 group: 'triceps', muscle: 'arms', cue: 'Codos hacia atrás, no abras' },
  { name: 'Press cerrado',                   group: 'triceps', muscle: 'arms', cue: 'Agarre al ancho de hombros' },
  // CUÁDRICEPS (8)
  { name: 'Sentadilla trasera',              group: 'cuadriceps', muscle: 'legs', cue: 'Rompe la paralela si puedes, espalda neutra' },
  { name: 'Sentadilla guiada (Smith)',       group: 'cuadriceps', muscle: 'legs', machine: true, cue: 'Pies ligeramente adelantados' },
  { name: 'Prensa',                          group: 'cuadriceps', muscle: 'legs', machine: true, cue: 'No bloquees las rodillas arriba' },
  { name: 'Hack Squat',                      group: 'cuadriceps', muscle: 'legs', machine: true, cue: 'Baja profundo y controlado' },
  { name: 'Sentadilla búlgara',              group: 'cuadriceps', muscle: 'legs', cue: 'Pie trasero elevado, torso erguido' },
  { name: 'Zancadas caminando',              group: 'cuadriceps', muscle: 'legs', cue: 'Pasos amplios, rodilla al suelo' },
  { name: 'Extensión de cuádriceps',         group: 'cuadriceps', muscle: 'legs', machine: true, cue: 'Aguanta 1s arriba' },
  { name: 'Step-Up',                         group: 'cuadriceps', muscle: 'legs', cue: 'Empuja con la pierna de arriba' },
  // ISQUIOTIBIALES (6)
  { name: 'Curl femoral tumbado',            group: 'isquios', muscle: 'legs', machine: true, cue: 'Cadera pegada al banco' },
  { name: 'Curl femoral sentado',            group: 'isquios', muscle: 'legs', machine: true, cue: 'Aprieta abajo 1 segundo' },
  { name: 'Curl femoral unilateral',         group: 'isquios', muscle: 'legs', machine: true, cue: 'Una pierna cada vez, controla la bajada' },
  { name: 'Peso muerto rumano con barra',    group: 'isquios', muscle: 'legs', cue: 'Cadera atrás, siente el estiramiento' },
  { name: 'Peso muerto rumano con mancuernas', group: 'isquios', muscle: 'legs', cue: 'Mancuernas pegadas a las piernas' },
  { name: 'Buenos días',                     group: 'isquios', muscle: 'legs', cue: 'Barra apoyada, bisagra de cadera' },
  // GLÚTEOS (5)
  { name: 'Hip Thrust',                      group: 'gluteos', muscle: 'legs', cue: 'Aprieta el glúteo arriba 1s' },
  { name: 'Patada de glúteo en polea',       group: 'gluteos', muscle: 'legs', machine: true, cue: 'Extiende sin arquear la lumbar' },
  { name: 'Abducción en máquina',            group: 'gluteos', muscle: 'legs', machine: true, cue: 'Abre controlado, sin rebotes' },
  { name: 'Sentadilla sumo',                 group: 'gluteos', muscle: 'legs', cue: 'Pies anchos, puntas hacia fuera' },
  { name: 'Puente de glúteo',                group: 'gluteos', muscle: 'legs', machine: true, cue: 'Sube la cadera y aprieta arriba' },
  // GEMELOS (4)
  { name: 'Gemelo de pie',                   group: 'gemelos', muscle: 'legs', machine: true, cue: 'Sube hasta la punta, baja lento' },
  { name: 'Gemelo sentado',                  group: 'gemelos', muscle: 'legs', machine: true, cue: 'Estira bien abajo en cada rep' },
  { name: 'Gemelo en prensa',                group: 'gemelos', muscle: 'legs', machine: true, cue: 'Solo la punta del pie en la plataforma' },
  { name: 'Gemelo unilateral',               group: 'gemelos', muscle: 'legs', cue: 'Una pierna, rango completo' },
  // CORE (10)
  { name: 'Crunch en máquina',               group: 'core', muscle: 'core', machine: true, cue: 'Exhala al contraer' },
  { name: 'Crunch en polea',                 group: 'core', muscle: 'core', machine: true, cue: 'Flexiona desde el abdomen, no los brazos' },
  { name: 'Elevaciones de piernas colgado',  group: 'core', muscle: 'core', cue: 'Sin balanceo, sube con el abdomen' },
  { name: 'Elevaciones de rodillas',         group: 'core', muscle: 'core', cue: 'Lleva las rodillas al pecho' },
  { name: 'Plancha frontal',                 group: 'core', muscle: 'core', timed: true, cue: 'Core apretado, cuerpo en línea' },
  { name: 'Plancha lateral',                 group: 'core', muscle: 'core', timed: true, cue: 'Cadera alta, no la dejes caer' },
  { name: 'Dead Bug',                        group: 'core', muscle: 'core', timed: true, cue: 'Lumbar pegada al suelo' },
  { name: 'Pallof Press',                    group: 'core', muscle: 'core', machine: true, cue: 'Resiste la rotación' },
  { name: 'Rueda abdominal (Ab Wheel)',      group: 'core', muscle: 'core', cue: 'No arquees la lumbar al estirar' },
  { name: 'Mountain Climbers',               group: 'core', muscle: 'core', timed: true, cue: 'Ritmo constante, cadera baja' },
];

const byGroup = (g: BoeGroup) => CATALOG.filter(e => e.group === g);

// ── Parámetros de entrenamiento según objetivo ───────────────────────
interface GoalParams { sets: number; reps: number[]; rest: number; }
const GOAL_PARAMS: Record<string, GoalParams> = {
  strength:      { sets: 4, reps: [8, 6, 6, 6],    rest: 120 },
  'lose-weight': { sets: 3, reps: [15, 15, 12],    rest: 45 },
  'lose-fat':    { sets: 3, reps: [12, 12, 12],    rest: 60 },
  recomp:        { sets: 3, reps: [12, 10, 8],     rest: 75 },
  physique:      { sets: 3, reps: [12, 10, 8],     rest: 75 },
  performance:   { sets: 3, reps: [10, 8, 8],      rest: 90 },
  maintain:      { sets: 3, reps: [10, 10, 10],    rest: 75 },
  default:       { sets: 3, reps: [12, 10, 10],    rest: 60 },
};

// ── Divisiones por días/semana ───────────────────────────────────────
interface SessionTemplate { name: string; targetMuscles: string; slots: BoeGroup[]; }

const T: Record<string, SessionTemplate> = {
  fullA:  { name: 'Full Body',      targetMuscles: 'Todo el cuerpo',           slots: ['cuadriceps', 'pecho', 'espalda', 'hombros', 'core', 'biceps', 'triceps'] },
  fullB:  { name: 'Full Body',      targetMuscles: 'Todo el cuerpo',           slots: ['isquios', 'espalda', 'pecho', 'gluteos', 'core', 'triceps', 'biceps'] },
  upperA: { name: 'Tren Superior',  targetMuscles: 'Pecho, espalda, hombros',  slots: ['pecho', 'espalda', 'hombros', 'biceps', 'triceps', 'pecho', 'espalda'] },
  upperB: { name: 'Tren Superior',  targetMuscles: 'Espalda, pecho, brazos',   slots: ['espalda', 'pecho', 'hombros', 'triceps', 'biceps', 'espalda', 'pecho'] },
  lowerA: { name: 'Tren Inferior',  targetMuscles: 'Piernas y glúteo',         slots: ['cuadriceps', 'isquios', 'gluteos', 'gemelos', 'core', 'cuadriceps', 'isquios'] },
  lowerB: { name: 'Tren Inferior',  targetMuscles: 'Piernas y core',           slots: ['isquios', 'cuadriceps', 'gluteos', 'core', 'gemelos', 'isquios', 'core'] },
  push:   { name: 'Empuje',         targetMuscles: 'Pecho, hombros, tríceps',  slots: ['pecho', 'hombros', 'pecho', 'triceps', 'core', 'hombros', 'triceps'] },
  pull:   { name: 'Tirón',          targetMuscles: 'Espalda y bíceps',         slots: ['espalda', 'espalda', 'biceps', 'biceps', 'core', 'espalda', 'hombros'] },
  legs:   { name: 'Pierna',         targetMuscles: 'Piernas completas',        slots: ['cuadriceps', 'isquios', 'gluteos', 'gemelos', 'core', 'cuadriceps', 'gluteos'] },
};

const SPLITS: Record<number, SessionTemplate[]> = {
  1: [T.fullA],
  2: [T.fullA, T.fullB],
  3: [T.fullA, T.upperA, T.lowerA],
  4: [T.upperA, T.lowerA, T.upperB, T.lowerB],
  5: [T.push, T.pull, T.legs, T.upperA, T.lowerB],
  6: [T.push, T.pull, T.legs, T.upperB, T.lowerA, T.fullB],
  7: [T.push, T.pull, T.legs, T.upperA, T.lowerB, T.fullA, T.fullB],
};

// ── Exclusiones por lesión (búsqueda por palabra clave) ──────────────
const INJURY_RULES: { keywords: string[]; exclude: string[] }[] = [
  {
    keywords: ['rodilla', 'knee', 'menisco', 'ligamento'],
    exclude: ['Sentadilla trasera', 'Sentadilla guiada (Smith)', 'Hack Squat', 'Sentadilla búlgara', 'Zancadas caminando', 'Step-Up', 'Sentadilla sumo'],
  },
  {
    keywords: ['hombro', 'shoulder', 'manguito'],
    exclude: ['Press militar con barra', 'Press militar con mancuernas', 'Fondos para pecho', 'Elevaciones frontales', 'Press inclinado con barra'],
  },
  {
    keywords: ['espalda', 'lumbar', 'lumbago', 'hernia', 'ciatica', 'ciática'],
    exclude: ['Peso muerto rumano', 'Peso muerto rumano con barra', 'Peso muerto rumano con mancuernas', 'Buenos días', 'Remo con barra', 'Sentadilla trasera', 'Rueda abdominal (Ab Wheel)'],
  },
  {
    keywords: ['muñeca', 'wrist', 'codo', 'epicondilitis'],
    exclude: ['Curl barra recta', 'Press francés', 'Fondos en banco'],
  },
  {
    keywords: ['cadera', 'hip'],
    exclude: ['Sentadilla sumo', 'Zancadas caminando', 'Sentadilla búlgara', 'Buenos días'],
  },
];

const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// ── Entrada del Motor ────────────────────────────────────────────────
export interface MotorInput {
  daysPerWeek: number;
  workoutDuration: string;             // '30min' | '45min' | '1hour' | 'depends'
  goal?: string;                       // BeginnerGoal | AdvancedGoal
  level?: 'beginner' | 'advanced';
  priorityMuscle?: MuscleGroup;
  injuries?: string[];
  excludedExercises?: string[];
  weight?: number;                     // kg
  height?: number;                     // cm
  startFrom?: number;
  customDays?: number[];
}

const MUSCLE_TO_GROUPS: Partial<Record<MuscleGroup, BoeGroup[]>> = {
  chest: ['pecho'], back: ['espalda'], shoulders: ['hombros'],
  arms: ['biceps', 'triceps'], legs: ['cuadriceps', 'gluteos'], core: ['core'],
};

export function generatePlan(input: MotorInput): WeeklySession[] {
  const days = Math.min(Math.max(input.daysPerWeek || 3, 1), 7);
  const duration = input.workoutDuration === '30min' ? 30 : input.workoutDuration === '1hour' ? 60 : 45;
  const exerciseCount = duration === 30 ? 4 : duration === 60 ? 6 : 5;
  const params = GOAL_PARAMS[input.goal ?? ''] ?? GOAL_PARAMS.default;

  // IMC: con sobrepeso alto + objetivo de pérdida, prioriza máquinas /
  // bajo impacto articular en el tren inferior.
  const bmi = input.weight && input.height ? input.weight / Math.pow(input.height / 100, 2) : null;
  const preferLowImpact = bmi != null && bmi >= 32 && ['lose-weight', 'lose-fat'].includes(input.goal ?? '');

  // Exclusiones: lesiones declaradas + ejercicios vetados por el usuario
  const injuryText = normalize((input.injuries ?? []).join(' '));
  const excluded = new Set<string>();
  for (const rule of INJURY_RULES) {
    if (rule.keywords.some(k => injuryText.includes(k))) rule.exclude.forEach(n => excluded.add(n));
  }
  const userExcluded = (input.excludedExercises ?? []).map(normalize);

  const isAllowed = (e: MotorExercise) =>
    !excluded.has(e.name) && !userExcluded.some(x => x && normalize(e.name).includes(x));

  // Rotación por grupo: sesiones distintas usan ejercicios distintos
  const cursor = new Map<BoeGroup, number>();
  function pick(group: BoeGroup): MotorExercise | null {
    let pool = byGroup(group).filter(isAllowed);
    if (pool.length === 0) pool = byGroup('core').filter(isAllowed);
    if (pool.length === 0) return null;
    if (preferLowImpact && ['cuadriceps', 'isquios', 'gluteos'].includes(group)) {
      const machines = pool.filter(e => e.machine);
      if (machines.length > 0) pool = machines;
    }
    const idx = cursor.get(group) ?? 0;
    cursor.set(group, idx + 1);
    return pool[idx % pool.length];
  }

  function toExercise(e: MotorExercise, sessionNumber: number, slot: number): Exercise {
    const others = byGroup(e.group).filter(o => o.name !== e.name && isAllowed(o)).slice(0, 2).map(o => o.name);
    return {
      id: `boe-${sessionNumber}-${slot}-${normalize(e.name).replace(/[^a-z0-9]+/g, '-')}`,
      name: e.name,
      targetMuscle: e.muscle,
      sets: e.timed ? 3 : params.sets,
      reps: e.timed ? [30, 30, 30] : params.reps,
      restSeconds: e.timed ? 45 : params.rest,
      instructions: e.timed ? `${e.cue} (segundos por serie)` : e.cue,
      alternatives: others,
    };
  }

  const templates = SPLITS[days];
  const startFrom = input.startFrom ?? 1;
  const dayList = input.customDays;

  // Músculo prioritario (avanzado): un ejercicio extra por sesión
  const priorityGroups = input.priorityMuscle && input.priorityMuscle !== 'none'
    ? MUSCLE_TO_GROUPS[input.priorityMuscle] ?? []
    : [];

  const sessions: WeeklySession[] = [];
  for (let i = 0; i < days; i++) {
    const template = templates[i];
    const exercises: Exercise[] = [];
    const used = new Set<string>();

    for (const slotGroup of template.slots) {
      if (exercises.length >= exerciseCount) break;
      const ex = pick(slotGroup);
      if (ex && !used.has(ex.name)) {
        used.add(ex.name);
        exercises.push(toExercise(ex, startFrom + i, exercises.length));
      }
    }

    // Ejercicio extra del músculo prioritario si no está ya bien cubierto
    if (priorityGroups.length > 0 && exercises.length <= exerciseCount) {
      const pGroup = priorityGroups[i % priorityGroups.length];
      const extra = pick(pGroup);
      if (extra && !used.has(extra.name)) {
        used.add(extra.name);
        exercises.push(toExercise(extra, startFrom + i, exercises.length));
      }
    }

    sessions.push({
      id: crypto.randomUUID(),
      sessionNumber: startFrom + i,
      name: template.name,
      targetMuscles: template.targetMuscles,
      duration,
      exercises,
      status: i === 0 ? 'available' : 'locked',
      dayOfWeek: dayList?.[i] ?? i,
    });
  }

  return sessions;
}

// Catálogo BOE-FK como Exercise[] (para búsquedas por nombre del Coach)
export function motorCatalog(): Exercise[] {
  return CATALOG.map((e, i) => ({
    id: `boe-cat-${i}`,
    name: e.name,
    targetMuscle: e.muscle,
    sets: 3,
    reps: e.timed ? [30, 30, 30] : [12, 10, 10],
    restSeconds: e.timed ? 45 : 60,
    instructions: e.cue,
    alternatives: byGroup(e.group).filter(o => o.name !== e.name).slice(0, 2).map(o => o.name),
  }));
}
