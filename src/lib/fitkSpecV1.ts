// ─────────────────────────────────────────────────────────────────────
// Parámetros del Motor de Programación V1 (Word del 20/11/2026).
//
// Todo lo que el Word da como número o tabla vive aquí, para poder corregir
// una decisión concreta sin tocar el Motor. Lo marcado con 🟡 es una
// decisión propia donde el Word es ambiguo o no llega; cada una está
// explicada en el informe de la primera prueba.
//
// Este archivo solo describe. Quien decide es fitkWeekV1.ts (reparto de
// volumen y ajuste al tiempo) y fitkMotor.ts (elección de ejercicios).
// ─────────────────────────────────────────────────────────────────────
import type { LibraryExercise } from '@/lib/fitkLibrary';
import type { SlotFn, SlotRole } from '@/lib/fitkMotor';

// ── §1 Situación actual ──────────────────────────────────────────────
export type Situation = 'cero' | 'irregular' | 'retoma' | 'constante';

export const SITUATION_LABEL: Record<Situation, string> = {
  cero: 'Empieza de cero', irregular: 'Irregular', retoma: 'Retoma', constante: 'Constante',
};

/**
 * 🟡 El onboarding solo pregunta la situación a quien entra en modo
 * Principiante (desde cero / irregular). En modo Avanzado se asume
 * "constante". "Retoma" no se puede declarar todavía.
 */
export function situationOf(level?: 'beginner' | 'advanced', experienceLevel?: string): Situation {
  if (level === 'advanced') return 'constante';
  return experienceLevel === 'inconsistent' ? 'irregular' : 'cero';
}

// ── §5 Volumen: series directas por semana (referencia, no cuota) ────
export type VolGroup =
  | 'pecho' | 'espalda' | 'cuadriceps' | 'isquios' | 'gluteos'
  | 'biceps' | 'triceps' | 'gemelos' | 'core'
  | 'deltAnterior' | 'deltLateral' | 'deltPosterior';

export const VOL_GROUPS: VolGroup[] = [
  'pecho', 'espalda', 'cuadriceps', 'isquios', 'gluteos', 'deltAnterior', 'deltLateral', 'deltPosterior',
  'biceps', 'triceps', 'gemelos', 'core',
];

export const GROUP_LABEL: Record<VolGroup, string> = {
  pecho: 'Pecho', espalda: 'Espalda', cuadriceps: 'Cuádriceps', isquios: 'Isquios', gluteos: 'Glúteos',
  biceps: 'Bíceps', triceps: 'Tríceps', gemelos: 'Gemelos', core: 'Core',
  deltAnterior: 'Deltoide anterior', deltLateral: 'Deltoide lateral', deltPosterior: 'Deltoide posterior',
};

type Range = [number, number];
const volumeRow = (big: Range, posterior: Range, arms: Range, calves: Range, core: Range, ant: Range, lat: Range, rear: Range): Record<VolGroup, Range> => ({
  pecho: big, espalda: big, cuadriceps: big, isquios: posterior, gluteos: posterior,
  biceps: arms, triceps: arms, gemelos: calves, core,
  deltAnterior: ant, deltLateral: lat, deltPosterior: rear,
});

export const VOLUME_REFERENCE: Record<Situation, Record<VolGroup, Range>> = {
  cero:      volumeRow([6, 8],   [4, 6],  [2, 4], [2, 4], [2, 4], [0, 2], [2, 4], [2, 3]),
  irregular: volumeRow([8, 10],  [6, 8],  [4, 6], [3, 5], [3, 5], [0, 3], [4, 6], [3, 5]),
  retoma:    volumeRow([8, 10],  [6, 8],  [4, 6], [3, 5], [3, 5], [0, 3], [4, 6], [3, 5]),
  constante: volumeRow([10, 12], [8, 10], [6, 8], [4, 6], [4, 6], [0, 4], [6, 8], [4, 6]),
};

/** 🟡 La primera semana apunta al mínimo del rango; el resto queda para progresar. */
export const INITIAL_TARGET: 'min' | 'max' = 'min';

/** §2 Prioridad: +1–2 series directas "si tiempo y recuperación lo permiten". */
export const PRIORITY_BONUS_SETS = 2;

/** Grupos de volumen de cada prioridad del onboarding; el primero es el principal. */
export const PRIORITY_GROUPS: Record<string, VolGroup[]> = {
  chest: ['pecho'], back: ['espalda'], shoulders: ['deltLateral', 'deltPosterior', 'deltAnterior'],
  legs: ['cuadriceps', 'isquios', 'gluteos'], arms: ['biceps', 'triceps'], core: ['core'],
};

/** Series por ejercicio. 🟡 El Word no fija estos límites. */
export const SETS = { principalMin: 3, min: 2, max: 4 };

/**
 * Jerarquía cuando no cabe todo (Word §5).
 * 🟡 El Word lista "reducir series" (5) antes que las "estrategias de
 * eficiencia" (6), y a la vez pide comprobar una biserie antes de eliminar
 * trabajo directo (§4). Lectura aplicada:
 *   a) se recortan series mientras el grupo siga en su zona de referencia
 *      (lo que le sobra por trabajo indirecto: "solapamiento útil");
 *   b) biseries entre accesorios compatibles, que no cuestan volumen;
 *   c) series por debajo de la referencia;
 *   d) accesorios menos importantes.
 * Con `supersetsBeforeDeepCuts: false` el paso c) va antes que el b).
 */
export const LADDER = {
  /** "Se usan zonas/tolerancias": una serie por debajo del mínimo sigue en zona. */
  zoneToleranceSets: 1,
  supersetsBeforeDeepCuts: true,
};

// ── §6 Matriz muscular por familias ──────────────────────────────────
// 1 = protagonista; 0,5 = secundario fuerte; 0,3 = secundario moderado.
export type MatrixKey = VolGroup | 'dorsal' | 'espaldaAlta';
export type MatrixRow = Partial<Record<MatrixKey, number>>;

// 🟡 La Biblioteca marca todos los remos igual (dorsal y espalda alta como
// principales); la orientación es una variante de agarre. Se tratan como
// "remo orientado a dorsal" hasta que se catalogue (Word §12).
const ROW_DORSAL: MatrixRow = { dorsal: 1, espaldaAlta: 0.5, biceps: 0.5, deltPosterior: 0.3 };
const KNEE_UNILATERAL: MatrixRow = { cuadriceps: 1, isquios: 0.3, gluteos: 0.5 };
const HINGE: MatrixRow = { isquios: 1, gluteos: 0.5 };

/** Clave: "Bloque|Familia" de la Biblioteca cuando la familia se repite entre bloques, o solo "Familia". */
const WORD_BY_FAMILY: Record<string, MatrixRow> = {
  // Pecho
  'Press horizontal': { pecho: 1, triceps: 0.5, deltAnterior: 0.3 }, // incluye flexiones
  'Press inclinado': { pecho: 1, triceps: 0.5, deltAnterior: 0.5 },
  'Press declinado': { pecho: 1, triceps: 0.5, deltAnterior: 0.3 },
  'Aducción horizontal': { pecho: 1, deltAnterior: 0.3 },
  // Espalda
  'Tirón vertical': { dorsal: 1, espaldaAlta: 0.3, biceps: 0.5 },
  'Tirón horizontal': ROW_DORSAL,
  'Tirón diagonal': ROW_DORSAL,
  'Extensión hombro': { dorsal: 1, biceps: 0.3 },
  'Tirón alto / escapular': { espaldaAlta: 1, biceps: 0.3, deltPosterior: 1, deltLateral: 0.3 }, // face pull
  // Hombro
  'Press vertical': { deltAnterior: 1, deltLateral: 0.3, triceps: 0.5 },
  'Abducción': { deltLateral: 1 },
  'Flexión hombro': { deltAnterior: 1 },
  'Deltoide posterior': { deltPosterior: 1, deltLateral: 0.3 },
  // Pierna
  'Sentadilla': { cuadriceps: 1, gluteos: 0.5 },
  'Sentadilla guiada': { cuadriceps: 1, gluteos: 0.5 },
  'Prensa': { cuadriceps: 1, gluteos: 0.5 },
  'Unilateral': KNEE_UNILATERAL,
  'Zancada': KNEE_UNILATERAL,
  'Extensión de rodilla': { cuadriceps: 1 },
  'Isquios|Bisagra de cadera': HINGE, // RDL y buenos días
  'Bisagra unilateral': HINGE,
  'Flexión de rodilla': { isquios: 1 },
  'Extensión horizontal de cadera': { gluteos: 1, isquios: 0.3 }, // hip thrust
  'Abducción de cadera': { gluteos: 1 }, // directo de glúteo; no sustituye la extensión de cadera
  'Aducción de cadera': {}, // el Word no los contabiliza
};

const WORD_BY_ID: Record<string, MatrixRow> = {
  back_inverted_row: { dorsal: 0.5, espaldaAlta: 1, biceps: 0.5, deltPosterior: 0.5 },
  legs_hack_squat: { cuadriceps: 1, gluteos: 0.4 }, // 🟡 el Word da 0,3–0,5
};

/** Músculos del Diccionario de la Biblioteca → columnas de la matriz del Word. */
const CODE_TO_KEY: Record<string, MatrixKey> = {
  pec_major: 'pecho', pec_clavicular: 'pecho', pec_sternocostal: 'pecho',
  triceps: 'triceps', ant_delt: 'deltAnterior', lat_delt: 'deltLateral', post_delt: 'deltPosterior',
  latissimus: 'dorsal', mid_trap: 'espaldaAlta', rhomboids: 'espaldaAlta', low_trap: 'espaldaAlta',
  biceps_brachii: 'biceps', brachialis: 'biceps',
  quadriceps: 'cuadriceps', hamstrings: 'isquios', glute_max: 'gluteos', glute_med_min: 'gluteos',
  gastrocnemius: 'gemelos', soleus: 'gemelos',
  rectus_abdominis: 'core', obliques: 'core', deep_core: 'core',
};

/** "Curls = bíceps 1. Trabajo directo de tríceps = tríceps 1. Gemelos = 1. Core = 1." */
function wordRuleByBlock(ex: LibraryExercise): MatrixRow | null {
  if (ex.block === 'Bíceps') return { biceps: 1 };
  if (ex.block === 'Tríceps' && ex.movementPattern === 'Extensión codo') return { triceps: 1 };
  if (ex.block === 'Gemelos') return { gemelos: 1 };
  if (ex.block === 'Core') return { core: 1 };
  return null;
}

/**
 * 🟡 Fichas sin fila en la matriz del Word (su asignación está pendiente,
 * Word §12): se usa la Matriz de la Biblioteca con P = 1 y S = 0,5.
 */
function rowFromLibrary(ex: LibraryExercise): MatrixRow {
  const row: MatrixRow = {};
  for (const m of ex.muscles) {
    const key = CODE_TO_KEY[m.code];
    const value = m.level === 'P' ? 1 : m.level === 'S' ? 0.5 : 0;
    if (key && value > (row[key] ?? 0)) row[key] = value;
  }
  return row;
}

export interface ExerciseMatrix { row: MatrixRow; source: 'word' | 'biblioteca' }

/**
 * Contribución de una serie del ejercicio a cada grupo. "Espalda" es el
 * mayor de dorsal y espalda alta: las subdivisiones no se suman (Word §6).
 */
export function matrixOf(ex: LibraryExercise): ExerciseMatrix {
  const word = WORD_BY_ID[ex.id] ?? WORD_BY_FAMILY[`${ex.block}|${ex.family}`] ?? WORD_BY_FAMILY[ex.family] ?? wordRuleByBlock(ex);
  const row: MatrixRow = { ...(word ?? rowFromLibrary(ex)) };
  const back = Math.max(row.dorsal ?? 0, row.espaldaAlta ?? 0);
  if (back > 0) row.espalda = back;
  return { row, source: word ? 'word' : 'biblioteca' };
}

// ── §7 Tiempo y descansos ────────────────────────────────────────────
/**
 * Descanso de referencia en segundos. 🟡 Dentro de "compuestos 2:00–2:30"
 * se da 2:30 a los de demanda sistémica alta y 2:00 al resto.
 */
export const REST_SECONDS = { heavyCompound: 150, compound: 120, accessory: 90 };

export const TIME_MODEL = {
  /** Serie de 8–12 repeticiones: ~30–45 s, según el coste de ejecución de la ficha. */
  execSeconds: { low: 30, medium: 38, high: 45 },
  /** Montaje según la ficha. */
  setupSeconds: { minimal: 10, low: 20, medium: 45, high: 90 },
  /** Cambio de ejercicio; sustituye al descanso tras la última serie (no se cuenta dos veces). */
  transitionSeconds: { sameBlock: 25, normal: 55, costly: 85 },
  /** "Margen real: menos de 5 min": imprevistos incluidos en la estimación. */
  marginShare: 0.12,
  marginMaxSeconds: 270,
  /** 🟡 "Tolerancia ~10 %": solo se admite si recortar más rompe un patrón protegido o la prioridad. */
  tolerance: 0.10,
  /** Biserie: cambio entre los dos ejercicios. */
  supersetSwitchSeconds: 15,
  /** 🟡 Máximo de biseries por sesión; nunca con los ejercicios principales. */
  maxSupersetsPerSession: 2,
  /** Minutos medios por serie, para saber de antemano si la semana va justa de tiempo. */
  minutesPerSet: 2.6,
};

// ── Equipo poco habitual ─────────────────────────────────────────────
/**
 * 🟡 La Biblioteca trata toda máquina como "máquina". Estas fichas piden
 * una estación que muchos gimnasios no tienen: no se eligen por defecto
 * (sí si el usuario las prefiere o ya las venía haciendo).
 */
export const SPECIAL_STATIONS = [
  'legs_belt_squat', 'shoulder_landmine_press', 'back_tbar_row', 'back_chest_supported_tbar_row', 'back_high_row_machine',
];

// ── §3 y §4 Estructuras y patrones ───────────────────────────────────
/**
 * Protección del slot cuando no cabe todo (Word §4 y §5); menor = más protegido.
 * 1 fundamental · 2 alta · 3 muy deseable · 4 cobertura importante y segundas
 * exposiciones · 5 accesorio directo · 6 extra o segundo ejercicio del grupo.
 */
export type Keep = 1 | 2 | 3 | 4 | 5 | 6;

export interface V1SlotSpec {
  /** Funciones que resuelven el slot; el Motor elige el ejercicio entre todas. */
  fn: SlotFn[];
  role: SlotRole;
  keep: Keep;
  /** Grupo de volumen al que da trabajo directo. Sin grupo = sin referencia en el Word. */
  group?: VolGroup;
  /**
   * 'volume': solo entra si los ejercicios anteriores del grupo no alcanzan su referencia.
   * 'context': empuje vertical, "contextual; sube con prioridad de hombro o fuerza".
   */
  when?: 'volume' | 'context';
}

export interface V1Template { key: string; name: string; targetMuscles: string; slots: V1SlotSpec[] }
export interface V1Structure { name: string; reason: string; sessions: V1Template[] }

const slot = (fn: SlotFn | SlotFn[], role: SlotRole, keep: Keep, group?: VolGroup, when?: V1SlotSpec['when']): V1SlotSpec =>
  ({ fn: Array.isArray(fn) ? fn : [fn], role, keep, group, when });

// Segunda exposición de rodilla: el Motor elige entre prensa/sentadilla,
// zancadas o extensión según nivel y tiempo.
const SECOND_KNEE: SlotFn[] = ['unilateral_rodilla', 'dominante_rodilla', 'extension_rodilla'];
// Tercer ejercicio de pecho: aperturas; el press declinado, solo si el usuario lo prefiere.
const EXTRA_CHEST: SlotFn[] = ['aduccion_pecho', 'empuje_declinado'];

/**
 * Funciones que un slot puede aceptar pero que no se programan por
 * defecto: solo entran si el usuario prefiere uno de sus ejercicios o ya
 * lo venía haciendo.
 */
export const ONLY_BY_PREFERENCE: SlotFn[] = ['empuje_declinado'];

const FULL_A: V1Template = { key: 'v1FullA', name: 'Full Body A', targetMuscles: 'Todo el cuerpo', slots: [
  slot('dominante_rodilla', 'principal', 1, 'cuadriceps'),
  slot('empuje_horizontal', 'principal', 1, 'pecho'),
  slot('tiron_horizontal', 'principal', 1, 'espalda'),
  slot('empuje_vertical', 'secundario', 4, 'deltAnterior', 'context'),
  slot('flexion_rodilla', 'complementario', 4, 'isquios'),
  slot('deltoide_lateral', 'complementario', 5, 'deltLateral'),
  slot('triceps', 'complementario', 5, 'triceps'),
  slot('core', 'complementario', 5, 'core'),
  slot('extension_cadera', 'complementario', 5, 'gluteos', 'volume'),
] };

const FULL_B: V1Template = { key: 'v1FullB', name: 'Full Body B', targetMuscles: 'Todo el cuerpo', slots: [
  slot('bisagra', 'principal', 2, 'isquios'),
  slot('tiron_vertical', 'principal', 3, 'espalda'),
  slot('empuje_inclinado', 'principal', 4, 'pecho'),
  slot(SECOND_KNEE, 'secundario', 4, 'cuadriceps'),
  slot('deltoide_posterior', 'complementario', 5, 'deltPosterior'),
  slot('biceps', 'complementario', 5, 'biceps'),
  slot('gemelo', 'complementario', 5, 'gemelos'),
  slot('core', 'complementario', 5, 'core', 'volume'),
] };

// 3 días · Opción A (Word §3): Pecho-Tríceps-Hombro / Espalda-Bíceps-Trapecio / Pierna
const A_PUSH: V1Template = { key: 'v1PechoTricepsHombro', name: 'Pecho, tríceps y hombro', targetMuscles: 'Pecho, tríceps, hombro', slots: [
  slot('empuje_horizontal', 'principal', 1, 'pecho'),
  slot('empuje_inclinado', 'secundario', 4, 'pecho'),
  slot('empuje_vertical', 'secundario', 4, 'deltAnterior', 'context'),
  slot('deltoide_lateral', 'complementario', 5, 'deltLateral'),
  slot('triceps', 'complementario', 5, 'triceps'),
  slot(EXTRA_CHEST, 'complementario', 6, 'pecho', 'volume'),
  slot('triceps', 'complementario', 6, 'triceps', 'volume'),
] };

const A_PULL: V1Template = { key: 'v1EspaldaBicepsTrapecio', name: 'Espalda, bíceps y trapecio', targetMuscles: 'Espalda, bíceps, trapecio', slots: [
  slot('tiron_vertical', 'principal', 3, 'espalda'),
  slot('tiron_horizontal', 'principal', 1, 'espalda'),
  slot('deltoide_posterior', 'complementario', 5, 'deltPosterior'),
  slot('biceps', 'complementario', 5, 'biceps'),
  // 🟡 El Word nombra el trapecio en la estructura pero no le da rango de volumen.
  slot('trapecio', 'complementario', 5),
  slot('pullover', 'complementario', 6, 'espalda', 'volume'),
  slot('biceps', 'complementario', 6, 'biceps', 'volume'),
] };

const A_LEGS: V1Template = { key: 'v1Pierna', name: 'Pierna', targetMuscles: 'Cuádriceps, isquios, glúteo, gemelos', slots: [
  slot('dominante_rodilla', 'principal', 1, 'cuadriceps'),
  slot('bisagra', 'principal', 2, 'isquios'),
  slot(SECOND_KNEE, 'secundario', 4, 'cuadriceps'),
  slot('flexion_rodilla', 'complementario', 4, 'isquios'),
  slot('gemelo', 'complementario', 5, 'gemelos'),
  slot('core', 'complementario', 5, 'core'),
  slot('extension_cadera', 'complementario', 5, 'gluteos', 'volume'),
  slot('extension_rodilla', 'complementario', 6, 'cuadriceps', 'volume'),
  slot('abduccion_cadera', 'complementario', 6, 'gluteos', 'volume'),
] };

// 3 días · Opción B (Word §3): Push+cuádriceps / Pull+cadena posterior / Mixto-complementario
const B_PUSH: V1Template = { key: 'v1PushCuadriceps', name: 'Empuje y cuádriceps', targetMuscles: 'Pecho, hombro, tríceps, cuádriceps', slots: [
  slot('empuje_horizontal', 'principal', 1, 'pecho'),
  slot('dominante_rodilla', 'principal', 1, 'cuadriceps'),
  slot('empuje_vertical', 'secundario', 4, 'deltAnterior', 'context'),
  slot('deltoide_lateral', 'complementario', 5, 'deltLateral'),
  slot('triceps', 'complementario', 5, 'triceps'),
  slot('extension_rodilla', 'complementario', 6, 'cuadriceps', 'volume'),
] };

const B_PULL: V1Template = { key: 'v1PullPosterior', name: 'Tirón y cadena posterior', targetMuscles: 'Espalda, bíceps, isquios, glúteo', slots: [
  slot('bisagra', 'principal', 2, 'isquios'),
  slot('tiron_vertical', 'principal', 3, 'espalda'),
  slot('tiron_horizontal', 'principal', 1, 'espalda'),
  slot('flexion_rodilla', 'complementario', 4, 'isquios'),
  slot('deltoide_posterior', 'complementario', 5, 'deltPosterior'),
  slot('biceps', 'complementario', 5, 'biceps'),
] };

// 🟡 El Word no define el contenido de "Mixto-complementario": segunda
// exposición de pecho, espalda y pierna con otros patrones, más accesorios
// directos y, si la hay, la prioridad.
const B_MIXED: V1Template = { key: 'v1Mixto', name: 'Mixto y complementario', targetMuscles: 'Segunda vuelta de pecho, espalda y pierna; accesorios', slots: [
  slot('empuje_inclinado', 'secundario', 4, 'pecho'),
  slot(['tiron_horizontal', 'tiron_vertical'], 'secundario', 4, 'espalda', 'volume'),
  slot(SECOND_KNEE, 'secundario', 4, 'cuadriceps'),
  slot('gemelo', 'complementario', 5, 'gemelos'),
  slot('core', 'complementario', 5, 'core'),
  slot('extension_cadera', 'complementario', 5, 'gluteos', 'volume'),
  slot('deltoide_lateral', 'complementario', 6, 'deltLateral', 'volume'),
  slot('biceps', 'complementario', 6, 'biceps', 'volume'),
  slot('triceps', 'complementario', 6, 'triceps', 'volume'),
  slot(EXTRA_CHEST, 'complementario', 6, 'pecho', 'volume'),
] };

/** Estructuras de la V1 por número de días. 4–6 días llegan en la siguiente fase. */
export const V1_STRUCTURES: Record<number, V1Structure[]> = {
  2: [{ name: 'Full Body A/B', reason: '2 días: Full Body A/B (Word §3)', sessions: [FULL_A, FULL_B] }],
  3: [
    { name: 'Pecho-Tríceps-Hombro / Espalda-Bíceps-Trapecio / Pierna', reason: '3 días, opción A: por grupos musculares (Word §3)', sessions: [A_PUSH, A_PULL, A_LEGS] },
    { name: 'Empuje+cuádriceps / Tirón+cadena posterior / Mixto', reason: '3 días, opción B: empuje, tirón y día mixto (Word §3)', sessions: [B_PUSH, B_PULL, B_MIXED] },
  ],
};

/** Slot que se añade para dar una segunda exposición al grupo prioritario. */
export const PRIORITY_EXTRA_FN: Partial<Record<VolGroup, SlotFn>> = {
  pecho: 'aduccion_pecho', espalda: 'pullover', cuadriceps: 'extension_rodilla', isquios: 'flexion_rodilla',
  gluteos: 'extension_cadera', biceps: 'biceps', triceps: 'triceps', core: 'core',
  deltLateral: 'deltoide_lateral', deltPosterior: 'deltoide_posterior',
};
