// ─────────────────────────────────────────────────────────────────────
// Motor Fit-K v1.0 — Hard Filters → Scoring ponderado → banda equivalente
// → selección estable → construcción secuencial con recálculo de contexto
// → prescripción → estimador de duración → guardrails ligeros.
//
// Implementa FIT-K_Especificacion_Tecnica_Motor_Biblioteca_v1.0 y
// FIT-K_Motor_v1.0_Especificacion_Implementacion sobre la Biblioteca real
// de 81 ejercicios (fitkLibrary.ts). Determinista: mismo perfil + misma
// planVersion → mismo plan (selección estable por hash, sin Math.random).
//
// Los parámetros numéricos exactos del scoring (sub-pesos dentro de cada
// factor, umbrales de estancamiento, etc.) están marcados como abiertos 🟡
// en el propio documento de especificación — aquí se fijan valores V1
// razonables y documentados, no constantes fisiológicas.
// ─────────────────────────────────────────────────────────────────────
import type { Exercise, WeeklySession, MuscleGroup, EnergyLevel } from '@/types/user';
import { LIBRARY, type LibraryExercise } from '@/lib/fitkLibrary';

// ── Utilidades ───────────────────────────────────────────────────────
const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function stablePick<T>(pool: T[], seedParts: (string | number)[]): T {
  if (pool.length === 1) return pool[0];
  const h = fnv1a(seedParts.join('|'));
  return pool[h % pool.length];
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

// Escala discreta 0..1 sobre los niveles cualitativos de la Biblioteca.
// MOTOR-SCORE-LEVELS 🟡 — pesos exactos abiertos; niveles V1 documentados.
const LEVEL_MAP: Record<string, number> = {
  'Mínimo': 0,
  'Bajo': 0, 'Baja': 0,
  'Bajo-Medio': 0.25, 'Baja-Media': 0.25,
  'Medio': 0.5, 'Media': 0.5,
  'Medio-Alto': 0.75, 'Media-Alta': 0.75,
  'Alto': 1, 'Alta': 1,
  'Variable': 0.5,
};
const level = (raw: string | undefined) => (raw ? LEVEL_MAP[raw.trim()] ?? 0.5 : 0.5);

// ── Bloques de la Biblioteca → agrupación de la App (6 categorías UI) ──
const BLOCK_TO_MUSCLE: Record<string, MuscleGroup> = {
  'Pecho': 'chest', 'Espalda': 'back', 'Hombro': 'shoulders', 'Trapecio': 'back',
  'Bíceps': 'arms', 'Tríceps': 'arms', 'Antebrazo': 'arms',
  'Pierna': 'legs', 'Isquios': 'legs', 'Glúteos': 'legs', 'Gemelos': 'legs',
  'Core': 'core',
};

// Un slot lógico "pecho" incluye Pecho; "espalda" arrastra Trapecio;
// "biceps"/"triceps" arrastran Antebrazo como accesorio ocasional.
type SlotBlock =
  | 'pecho' | 'espalda' | 'hombros' | 'biceps' | 'triceps'
  | 'cuadriceps' | 'isquios' | 'gluteos' | 'gemelos' | 'core';

const SLOT_TO_LIBRARY_BLOCKS: Record<SlotBlock, string[]> = {
  pecho: ['Pecho'],
  espalda: ['Espalda', 'Trapecio'],
  hombros: ['Hombro'],
  biceps: ['Bíceps', 'Antebrazo'],
  triceps: ['Tríceps'],
  cuadriceps: ['Pierna'],
  isquios: ['Isquios'],
  gluteos: ['Glúteos'],
  gemelos: ['Gemelos'],
  core: ['Core'],
};

function candidatesForSlot(slot: SlotBlock): LibraryExercise[] {
  const blocks = SLOT_TO_LIBRARY_BLOCKS[slot];
  return LIBRARY.filter(e => blocks.includes(e.block));
}

// ── Divisiones semanales (igual estructura que v0, ahora sobre slots) ──
interface SessionTemplate { name: string; targetMuscles: string; slots: SlotBlock[]; }

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

// ── Hard Filters: lesión / exclusión explícita ──────────────────────
// MOTOR-HARD-001 🔒 — se resuelven antes del scoring, no negociables.
const INJURY_RULES: { keywords: string[]; excludeIds: (ex: LibraryExercise) => boolean }[] = [
  {
    keywords: ['rodilla', 'knee', 'menisco', 'ligamento'],
    excludeIds: ex => ex.block === 'Pierna' && level(ex.stability) < 1,
  },
  {
    keywords: ['hombro', 'shoulder', 'manguito'],
    excludeIds: ex => (ex.block === 'Hombro' && ex.family === 'Press vertical') || ex.family === 'Press inclinado' || ex.name === 'Fondos para pecho',
  },
  {
    keywords: ['espalda', 'lumbar', 'lumbago', 'hernia', 'ciatica', 'ciática'],
    excludeIds: ex => ex.family === 'Bisagra cadera' || ex.name === 'Buenos días' || ex.name === 'Remo con barra' || (ex.block === 'Pierna' && ex.family === 'Dominante rodilla' && ex.name.toLowerCase().includes('trasera')) || ex.family === 'Anti-extensión',
  },
  {
    keywords: ['muñeca', 'wrist', 'codo', 'epicondilitis'],
    excludeIds: ex => ex.block === 'Antebrazo' || ex.family === 'Extensión codo overhead' || ex.family === 'Empuje corporal',
  },
  {
    keywords: ['cadera', 'hip'],
    excludeIds: ex => ex.family === 'Abducción cadera' || ex.name === 'Buenos días' || ex.name.toLowerCase().includes('sumo') || ex.name.toLowerCase().includes('búlgara'),
  },
];

function hardFilter(pool: LibraryExercise[], input: MotorInput): LibraryExercise[] {
  const injuryText = normalize((input.injuries ?? []).join(' '));
  const excludedNames = (input.excludedExercises ?? []).map(normalize).filter(Boolean);
  return pool.filter(ex => {
    for (const rule of INJURY_RULES) {
      if (rule.keywords.some(k => injuryText.includes(k)) && rule.excludeIds(ex)) return false;
    }
    if (excludedNames.some(x => normalize(ex.name).includes(x))) return false;
    return true;
  });
}

// ── Scoring contextual (0-100, pesos 30/25/15/15/10/5) ──────────────
// SCORE-MISSING/APPLICABILITY 🔒 — factor no aplicable se excluye y se
// normaliza sobre el peso disponible; no se inventa una puntuación neutral.
interface SessionContext {
  usedThisSession: Set<string>;          // library ids
  patternCountSession: Map<string, number>;
  muscleCountWeek: Map<string, number>;   // primaryMuscle -> nº de veces esta semana
  usedThisWeek: Map<string, number>;      // library id -> veces esta semana
}

function newWeekContext(): { muscleCountWeek: Map<string, number>; usedThisWeek: Map<string, number> } {
  return { muscleCountWeek: new Map(), usedThisWeek: new Map() };
}
function newSessionContext(week: { muscleCountWeek: Map<string, number>; usedThisWeek: Map<string, number> }): SessionContext {
  return { usedThisSession: new Set(), patternCountSession: new Map(), ...week };
}

interface ScoreBreakdown { score: number; reasonCodes: string[]; }

function scoreCandidate(
  ex: LibraryExercise,
  input: MotorInput,
  ctx: SessionContext,
): ScoreBreakdown {
  const reasonCodes: string[] = ['FUNCTION_MATCH'];
  const factors: { weight: number; value: number | null }[] = [];

  // 1) Adecuación usuario/ejercicio (30)
  const acc = level(ex.accessibility);
  const strengthReq = level(ex.strengthRequirement);
  const stab = level(ex.stability);
  const scal = level(ex.scalability);
  const fit = input.level === 'advanced'
    ? clamp01(0.25 * acc + 0.25 * stab + 0.20 * scal + 0.30 * (0.5 + strengthReq * 0.5))
    : clamp01(0.35 * acc + 0.30 * stab + 0.20 * scal + 0.15 * (1 - strengthReq));
  factors.push({ weight: 30, value: fit });

  // 2) Complementariedad sesión/semana (25) — penaliza redundancia de patrón
  const patternUses = ctx.patternCountSession.get(ex.movementPattern) ?? 0;
  const complementarity = clamp01(1 - patternUses * 0.4);
  factors.push({ weight: 25, value: complementarity });
  if (complementarity >= 1) reasonCodes.push('COMPLEMENTARY_SLOT');

  // 3) Preferencias conocidas (15) — sin señal de preferencia positiva/negativa
  // por ejercicio en el modelo de datos actual (más allá de exclusiones, que ya
  // son Hard Filter). No se inventa un valor neutral: factor no aplicable.
  factors.push({ weight: 15, value: null });

  // 4) Prioridad muscular (15) — solo aplica si el usuario tiene una definida
  const priority = input.priorityMuscle;
  if (priority && priority !== 'none') {
    const primaryMatches = BLOCK_TO_MUSCLE[ex.block] === priority;
    const secondaryMatches = ex.secondaryMuscles.some(s => normalize(s.muscle).includes(normalize(priority)));
    const value = primaryMatches ? 1 : secondaryMatches ? 0.5 : 0;
    factors.push({ weight: 15, value });
    if (primaryMatches) reasonCodes.push('PRIORITY_PROTECTED');
  } else {
    factors.push({ weight: 15, value: null });
  }

  // 5) Logística/tiempo (10) — coste de setup + ejecución, invertido
  const logistics = clamp01(1 - (level(ex.setupCost) * 0.5 + level(ex.executionTimeCost) * 0.5));
  factors.push({ weight: 10, value: logistics });

  // 6) Variedad controlada (5) — penaliza repetir el mismo ejercicio ya usado
  const usesThisWeek = ctx.usedThisWeek.get(ex.id) ?? 0;
  const variety = clamp01(1 - usesThisWeek * 0.5);
  factors.push({ weight: 5, value: variety });

  let raw = 0;
  let availableWeight = 0;
  for (const f of factors) {
    if (f.value === null) continue;
    raw += f.weight * f.value;
    availableWeight += f.weight;
  }
  const normalizedScore = availableWeight > 0 ? (raw / availableWeight) * 100 : 50;
  return { score: normalizedScore, reasonCodes };
}

// ── Construcción secuencial de una sesión ────────────────────────────
interface MotorExercise {
  ex: LibraryExercise;
  reasonCodes: string[];
}

function pickForSlot(
  slot: SlotBlock,
  input: MotorInput,
  ctx: SessionContext,
  seedParts: (string | number)[],
  previousExerciseId?: string,
): MotorExercise | null {
  let pool = hardFilter(candidatesForSlot(slot), input);
  if (pool.length === 0) pool = hardFilter(candidatesForSlot('core'), input);
  if (pool.length === 0) return null;

  // IMC alto + objetivo de pérdida: prioriza ejercicios guiados/estables en tren inferior
  const bmi = input.weight && input.height ? input.weight / Math.pow(input.height / 100, 2) : null;
  const preferLowImpact = bmi != null && bmi >= 32 && ['lose-weight', 'lose-fat'].includes(input.goal ?? '');
  if (preferLowImpact && ['cuadriceps', 'isquios', 'gluteos'].includes(slot)) {
    const stable = pool.filter(e => level(e.stability) >= 0.75);
    if (stable.length > 0) pool = stable;
  }

  const scored = pool.map(ex => ({ ex, ...scoreCandidate(ex, input, ctx) }));
  const top = Math.max(...scored.map(s => s.score));
  // MOTOR-SELECT-011 🔒 — banda equivalente ±5 antes de elegir
  let equivalentPool = scored.filter(s => s.score >= top - 5);

  // MOTOR-STATE-MASTER / histéresis: mantiene continuidad salvo ventaja ~+8
  if (previousExerciseId) {
    const prev = scored.find(s => s.ex.id === previousExerciseId);
    if (prev && top - prev.score < 8) {
      equivalentPool = [prev];
    }
  }

  const chosen = stablePick(equivalentPool, seedParts);
  return { ex: chosen.ex, reasonCodes: [...chosen.reasonCodes, equivalentPool.length > 1 ? 'EQUIVALENT_POOL' : 'STABLE_SELECTION'] };
}

// ── Prescripción: series/reps/RIR por rol y experiencia (sección 7) ──
interface Prescription { sets: number; repRange: [number, number]; rirTarget: [number, number]; restSeconds: number; }

function prescribe(ex: LibraryExercise, role: string, level_: 'beginner' | 'advanced', timed: boolean): Prescription {
  const isPrincipal = role === 'Principal';
  const isAccesorio = role === 'Aislamiento' || role === 'Control' || role === 'Estabilidad';
  const sets = timed ? 3 : isPrincipal ? (level_ === 'beginner' ? 3 : 4) : isAccesorio ? 2 : 3;
  const repRange: [number, number] = timed ? [30, 45] : ex.repRangeV1;
  const rirTarget: [number, number] = level_ === 'beginner' ? [2, 3] : isPrincipal ? [1, 3] : [1, 2];
  const restSeconds = timed ? 45 : Math.round((ex.restRangeSeconds[0] + ex.restRangeSeconds[1]) / 2);
  return { sets, repRange, rirTarget, restSeconds };
}

function repsArrayFromRange(range: [number, number], sets: number): number[] {
  // Double progression: primera serie hacia el techo, luego decrece levemente.
  const [lo, hi] = range;
  const arr: number[] = [];
  for (let i = 0; i < sets; i++) {
    arr.push(i === 0 ? hi : Math.max(lo, hi - i));
  }
  return arr;
}

// ── Estimador de duración v1.0 (sección 9) ───────────────────────────
const EXEC_SECONDS = { corta: 25, normal: 35, larga: 45 };
const SETUP_SECONDS = { bajo: 20, medio: 45, alto: 90 };
const TRANSITION_SECONDS = { mismaZona: 25, normal: 55, costosa: 85 };
const BUFFER = 1.12;

function estimateExerciseSeconds(ex: LibraryExercise, sets: number, restSeconds: number): number {
  const execLevel = level(ex.executionTimeCost);
  const execPerSet = execLevel <= 0.25 ? EXEC_SECONDS.corta : execLevel <= 0.6 ? EXEC_SECONDS.normal : EXEC_SECONDS.larga;
  const setupLevel = level(ex.setupCost);
  const setup = setupLevel <= 0.25 ? SETUP_SECONDS.bajo : setupLevel <= 0.6 ? SETUP_SECONDS.medio : SETUP_SECONDS.alto;
  const unilateralExtra = ex.laterality.toLowerCase().includes('unilateral') || ex.laterality.toLowerCase().includes('lado') ? 10 * sets : 0;
  return setup + sets * (execPerSet + restSeconds) + unilateralExtra;
}

function estimateSessionSeconds(picks: { ex: LibraryExercise; sets: number; restSeconds: number }[]): number {
  let total = 0;
  for (let i = 0; i < picks.length; i++) {
    total += estimateExerciseSeconds(picks[i].ex, picks[i].sets, picks[i].restSeconds);
    if (i > 0) {
      const sameZone = picks[i].ex.block === picks[i - 1].ex.block;
      const costly = level(picks[i].ex.setupCost) >= 1;
      total += sameZone ? TRANSITION_SECONDS.mismaZona : costly ? TRANSITION_SECONDS.costosa : TRANSITION_SECONDS.normal;
    }
  }
  return total * BUFFER;
}

// ── Entrada del Motor ────────────────────────────────────────────────
export interface MotorInput {
  daysPerWeek: number;
  workoutDuration: string;             // '30min' | '45min' | '1hour' | 'depends'
  goal?: string;
  level?: 'beginner' | 'advanced';
  priorityMuscle?: MuscleGroup;
  injuries?: string[];
  excludedExercises?: string[];
  weight?: number;
  height?: number;
  startFrom?: number;
  customDays?: number[];
  /** GUARD-STATE: id estable del usuario, para selección determinista reproducible. */
  userId?: string;
  /** Se incrementa en cada regeneración deliberada de la semana (histéresis). */
  planVersion?: number;
  /** Semana anterior, para aplicar continuidad (MOTOR-STATE-MASTER). */
  previousPlan?: WeeklySession[];
}

function toExercise(pick: MotorExercise, role: string, level_: 'beginner' | 'advanced', sessionNumber: number, slot: number, alternatives: string[]): Exercise {
  const { ex, reasonCodes } = pick;
  const timed = ex.family.includes('Anti-') || ex.name.toLowerCase().includes('plancha') || ex.name.toLowerCase().includes('dead bug');
  const p = prescribe(ex, role, level_, timed);
  return {
    id: `fk-${sessionNumber}-${slot}-${ex.id}`,
    name: ex.name,
    targetMuscle: BLOCK_TO_MUSCLE[ex.block] ?? 'none',
    sets: p.sets,
    reps: timed ? Array(p.sets).fill(p.repRange[0]) : repsArrayFromRange(p.repRange, p.sets),
    restSeconds: p.restSeconds,
    instructions: ex.motorNotes ? `${ex.family}. ${ex.motorNotes}` : ex.family,
    alternatives,
    // Campos aditivos del Motor v1.0 (no rompen la UI actual, que sigue leyendo
    // sets/reps/restSeconds como antes):
    libraryId: ex.id,
    movementPattern: ex.movementPattern,
    equipmentCode: ex.equipment,
    repRange: p.repRange,
    rirTarget: p.rirTarget,
    reasonCodes,
  };
}

export function generatePlan(input: MotorInput): WeeklySession[] {
  const days = Math.min(Math.max(input.daysPerWeek || 3, 1), 7);
  const duration = input.workoutDuration === '30min' ? 30 : input.workoutDuration === '1hour' ? 60 : 45;
  const targetSeconds = duration * 60;
  const userLevel = input.level ?? 'beginner';
  const templates = SPLITS[days];
  const startFrom = input.startFrom ?? 1;
  const dayList = input.customDays;
  const planVersion = input.planVersion ?? 1;
  const userSeed = input.userId ?? 'anon';

  const weekCtx = newWeekContext();
  const priorityGroups = input.priorityMuscle && input.priorityMuscle !== 'none' ? [input.priorityMuscle] : [];

  const sessions: WeeklySession[] = [];
  for (let i = 0; i < days; i++) {
    const template = templates[i];
    const sessionCtx = newSessionContext(weekCtx);
    const picks: { ex: LibraryExercise; sets: number; restSeconds: number; role: string; reasonCodes: string[] }[] = [];
    const previousSession = input.previousPlan?.[i];

    let slotIndex = 0;
    for (const slotGroup of template.slots) {
      const seedParts = [userSeed, planVersion, startFrom + i, slotIndex];
      const previousExId = previousSession?.exercises?.[slotIndex]?.libraryId;
      const result = pickForSlot(slotGroup, input, sessionCtx, seedParts, previousExId);
      slotIndex++;
      if (!result || sessionCtx.usedThisSession.has(result.ex.id)) continue;

      const role = result.ex.compatibleRoles[0] ?? 'Complementario';
      const timed = result.ex.family.includes('Anti-') || result.ex.name.toLowerCase().includes('plancha') || result.ex.name.toLowerCase().includes('dead bug');
      const p = prescribe(result.ex, role, userLevel, timed);
      const candidate = { ex: result.ex, sets: p.sets, restSeconds: p.restSeconds, role, reasonCodes: result.reasonCodes };

      // GUARD-TIME-001 🔒 — no seguir añadiendo si ya se excede el presupuesto
      const projected = estimateSessionSeconds([...picks, candidate]);
      if (picks.length > 0 && projected > targetSeconds * 0.98) break;

      picks.push(candidate);
      sessionCtx.usedThisSession.add(result.ex.id);
      sessionCtx.patternCountSession.set(result.ex.movementPattern, (sessionCtx.patternCountSession.get(result.ex.movementPattern) ?? 0) + 1);
      weekCtx.muscleCountWeek.set(result.ex.primaryMuscle, (weekCtx.muscleCountWeek.get(result.ex.primaryMuscle) ?? 0) + 1);
      weekCtx.usedThisWeek.set(result.ex.id, (weekCtx.usedThisWeek.get(result.ex.id) ?? 0) + 1);
    }

    // Ejercicio extra de prioridad muscular si aún cabe en el presupuesto de tiempo
    if (priorityGroups.length > 0) {
      const pGroup = Object.entries(SLOT_TO_LIBRARY_BLOCKS).find(([, blocks]) =>
        blocks.some(b => BLOCK_TO_MUSCLE[b] === priorityGroups[0]))?.[0] as SlotBlock | undefined;
      if (pGroup) {
        const seedParts = [userSeed, planVersion, startFrom + i, 'priority'];
        const extra = pickForSlot(pGroup, input, sessionCtx, seedParts);
        if (extra && !sessionCtx.usedThisSession.has(extra.ex.id)) {
          const role = extra.ex.compatibleRoles[0] ?? 'Complementario';
          const p = prescribe(extra.ex, role, userLevel, false);
          const candidate = { ex: extra.ex, sets: p.sets, restSeconds: p.restSeconds, role, reasonCodes: [...extra.reasonCodes, 'PRIORITY_PROTECTED'] };
          const projected = estimateSessionSeconds([...picks, candidate]);
          if (projected <= targetSeconds * 1.02) {
            picks.push(candidate);
            sessionCtx.usedThisSession.add(extra.ex.id);
          }
        }
      }
    }

    const exercises: Exercise[] = picks.map((pk, idx) => {
      const alternatives = candidatesForSlot(
        (Object.entries(SLOT_TO_LIBRARY_BLOCKS).find(([, blocks]) => blocks.includes(pk.ex.block))?.[0] as SlotBlock) ?? 'core',
      ).filter(o => o.id !== pk.ex.id).slice(0, 2).map(o => o.name);
      return toExercise({ ex: pk.ex, reasonCodes: pk.reasonCodes }, pk.role, userLevel, startFrom + i, idx, alternatives);
    });

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

// ── Catálogo completo como Exercise[] (búsquedas del Coach) ──────────
export function motorCatalog(): Exercise[] {
  return LIBRARY.map((ex, i) => {
    const role = ex.compatibleRoles[0] ?? 'Complementario';
    const timed = ex.family.includes('Anti-') || ex.name.toLowerCase().includes('plancha') || ex.name.toLowerCase().includes('dead bug');
    const p = prescribe(ex, role, 'beginner', timed);
    return toExercise({ ex, reasonCodes: ['CATALOG'] }, role, 'beginner', 0, i,
      LIBRARY.filter(o => o.block === ex.block && o.id !== ex.id).slice(0, 2).map(o => o.name));
  });
}

// ── Daily Adapter — Session Instance ≠ Plan Base (sección 10) ────────
// MOTOR-STATE-MASTER 🔒 — nunca muta el Plan Base; devuelve una copia.
export interface DailyAdapterInput {
  energy: EnergyLevel;
  minutesAvailable?: number;
}

const ROLE_PRIORITY: Record<string, number> = { 'Principal': 0, 'Complementario': 1, 'Aislamiento': 2, 'Estabilidad': 2, 'Control': 2 };

function exerciseRolePriority(ex: Exercise): number {
  // El nombre del rol no se persiste en Exercise; se infiere del libraryId.
  const lib = LIBRARY.find(l => l.id === ex.libraryId);
  const role = lib?.compatibleRoles[0] ?? 'Complementario';
  return ROLE_PRIORITY[role] ?? 1;
}

export function adaptSessionForToday(session: WeeklySession, adapt: DailyAdapterInput): WeeklySession {
  let exercises = session.exercises.map(e => ({ ...e }));

  // Energía baja/muy baja: reduce trabajo secundario/accesorio primero,
  // preservando el núcleo (ejercicios Principal) — TIME-RECALC 🔒.
  if (adapt.energy === 'low' || adapt.energy === 'very-low') {
    const dropRatio = adapt.energy === 'very-low' ? 0.35 : 0.18;
    const sorted = [...exercises].sort((a, b) => exerciseRolePriority(b) - exerciseRolePriority(a));
    const toDrop = Math.round(exercises.length * dropRatio);
    const dropIds = new Set(sorted.slice(0, toDrop).map(e => e.id));
    exercises = exercises
      .filter(e => !dropIds.has(e.id))
      .map(e => (exerciseRolePriority(e) > 0
        ? { ...e, sets: Math.max(1, e.sets - 1), reps: e.reps.slice(0, Math.max(1, e.sets - 1)) }
        : e));
  }

  // Poco tiempo: reconstruye por presupuesto real (20/30/40 min) hasta caber.
  if (adapt.minutesAvailable) {
    const budgetSeconds = adapt.minutesAvailable * 60;
    const sorted = [...exercises].sort((a, b) => exerciseRolePriority(a) - exerciseRolePriority(b));
    const kept: Exercise[] = [];
    for (const ex of sorted) {
      const lib = LIBRARY.find(l => l.id === ex.libraryId);
      const projected = estimateSessionSeconds([
        ...kept.map(k => ({ ex: LIBRARY.find(l => l.id === k.libraryId)!, sets: k.sets, restSeconds: k.restSeconds })),
        ...(lib ? [{ ex: lib, sets: ex.sets, restSeconds: ex.restSeconds }] : []),
      ]);
      if (!lib || (kept.length > 0 && projected > budgetSeconds * 0.98)) continue;
      kept.push(ex);
    }
    exercises = kept.length > 0 ? kept : exercises.slice(0, 1);
  }

  return {
    ...session,
    id: crypto.randomUUID(),
    exercises,
    duration: adapt.minutesAvailable ?? session.duration,
  };
}
