// ─────────────────────────────────────────────────────────────────────
// Motor Fit-K v1.8
//
// Implementa FIT-K_Instrucciones.docx + hoja "Flujo Motor" de la
// Biblioteca v1.8. Regla central: primero se decide qué necesita la semana
// y cada sesión (estructura → slots funcionales); la elección del ejercicio
// concreto es una fase tardía. El scoring ordena candidatos válidos, no
// manda sobre Safety, Hard Filters ni la estabilidad de lo que funciona.
//
// Flujo (hoja Flujo Motor):
//   1 contexto → 2 Hard Filters/Safety → 3 estructura semanal → 4 rol de
//   sesión → 5 necesidades/dosis → 6 slots → 7 candidatos → 8 scoring +
//   historial + preferencias → 9 redundancia/indirecto → 10 tiempo →
//   11 validación semanal → 12 adaptación (Ajuste → Sustitución → Reprog.)
//
// Determinista: misma entrada y mismo estado → mismas decisiones (sec. 19).
// Los pesos numéricos son parámetros de producto V1 (🟡), no fisiología.
// ─────────────────────────────────────────────────────────────────────
import type {
  Exercise, ExerciseMotorTrace, ExerciseVariation, ExerciseVariationType,
  EnergyLevel, MuscleGroup, SessionMotorTrace, WeeklySession,
} from '@/types/user';
import { LIBRARY, libraryById, variantsFor, type LibraryExercise } from '@/lib/fitkLibrary';
import { KEEP_STATES, type ProgressState } from '@/lib/fitkProgression';

export const MOTOR_VERSION = '1.8';

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

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const roundTo = (n: number, step: number) => Math.round(n / step) * step;

const LEVEL_MAP: Record<string, number> = {
  'Mínimo': 0, 'Bajo': 0, 'Baja': 0,
  'Bajo-Medio': 0.25, 'Baja-Media': 0.25, 'No prioritario': 0.25,
  'Medio': 0.5, 'Media': 0.5, 'Variable': 0.5,
  'Medio-Alto': 0.75, 'Media-Alta': 0.75,
  'Alto': 1, 'Alta': 1,
};
const level = (raw: string | undefined) => (raw ? LEVEL_MAP[raw.trim()] ?? 0.5 : 0.5);

const BLOCK_TO_MUSCLE: Record<string, MuscleGroup> = {
  'Pecho': 'chest', 'Espalda': 'back', 'Trapecio': 'back', 'Hombro': 'shoulders',
  'Bíceps': 'arms', 'Tríceps': 'arms', 'Antebrazo': 'arms',
  'Pierna': 'legs', 'Isquios': 'legs', 'Glúteos': 'legs', 'Gemelos': 'legs', 'Aductores': 'legs',
  'Core': 'core',
};

// ── Equipamiento (Hard Filter) ───────────────────────────────────────
export const ALL_EQUIPMENT = [
  'barra', 'mancuernas', 'maquina', 'polea', 'smith', 'prensa', 'banco',
  'rack', 'dominadas', 'paralelas', 'banda', 'ghd',
] as const;
export type EquipmentCategory = typeof ALL_EQUIPMENT[number];

function equipmentAvailable(ex: LibraryExercise, available?: readonly string[]): boolean {
  if (!available) return true; // sin perfil de equipo = gimnasio completo
  const set = new Set(available);
  return ex.equipmentOptions.some(opt => opt.every(item => set.has(item)));
}

// ── Funciones de slot (MOTOR-SLOT-031 / MOTOR-FUNCTION-012) ──────────
// Un slot expresa una necesidad funcional, no un nombre de ejercicio.
export type SlotFn =
  | 'empuje_horizontal' | 'empuje_inclinado' | 'aduccion_pecho' | 'empuje_vertical'
  | 'deltoide_lateral' | 'deltoide_posterior' | 'tiron_vertical' | 'tiron_horizontal'
  | 'pullover' | 'biceps' | 'triceps' | 'triceps_compuesto' | 'trapecio'
  | 'dominante_rodilla' | 'unilateral_rodilla' | 'extension_rodilla' | 'bisagra'
  | 'flexion_rodilla' | 'extension_cadera' | 'abduccion_cadera' | 'aduccion_cadera'
  | 'gemelo' | 'core' | 'antebrazo';

export type SlotRole = 'principal' | 'secundario' | 'complementario';
type PriorityGroup = 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core' | 'other';

const FUNCTIONS: Record<SlotFn, { label: string; group: PriorityGroup; zone: 'superior' | 'inferior' | 'core'; matches: (e: LibraryExercise) => boolean }> = {
  empuje_horizontal: { label: 'Empuje horizontal', group: 'chest', zone: 'superior', matches: e => e.block === 'Pecho' && e.movementPattern === 'Empuje horizontal' },
  empuje_inclinado: { label: 'Empuje inclinado', group: 'chest', zone: 'superior', matches: e => e.block === 'Pecho' && e.movementPattern === 'Empuje inclinado' },
  aduccion_pecho: { label: 'Aducción de pecho', group: 'chest', zone: 'superior', matches: e => e.movementPattern === 'Aducción horizontal' },
  empuje_vertical: { label: 'Empuje vertical', group: 'shoulders', zone: 'superior', matches: e => e.block === 'Hombro' && e.movementPattern === 'Empuje vertical' },
  deltoide_lateral: { label: 'Deltoide lateral', group: 'shoulders', zone: 'superior', matches: e => e.movementPattern === 'Abducción hombro' },
  // MOTOR-COMPLEMENT-018: deltoide posterior NO cuenta como tirón principal de espalda.
  deltoide_posterior: { label: 'Deltoide posterior / escapular', group: 'shoulders', zone: 'superior', matches: e => e.block === 'Hombro' && (e.movementPattern === 'Abducción horizontal' || e.movementPattern === 'Tirón alto') },
  tiron_vertical: { label: 'Tirón vertical', group: 'back', zone: 'superior', matches: e => e.movementPattern === 'Tirón vertical' },
  tiron_horizontal: { label: 'Remo / tirón horizontal', group: 'back', zone: 'superior', matches: e => e.movementPattern === 'Tirón horizontal' },
  pullover: { label: 'Segundo patrón de espalda (pullover)', group: 'back', zone: 'superior', matches: e => e.movementPattern === 'Extensión hombro' },
  biceps: { label: 'Bíceps directo', group: 'arms', zone: 'superior', matches: e => e.block === 'Bíceps' },
  triceps: { label: 'Tríceps directo', group: 'arms', zone: 'superior', matches: e => e.block === 'Tríceps' && e.movementPattern === 'Extensión codo' },
  triceps_compuesto: { label: 'Tríceps compuesto', group: 'arms', zone: 'superior', matches: e => e.block === 'Tríceps' && e.movementPattern !== 'Extensión codo' },
  trapecio: { label: 'Trapecio', group: 'other', zone: 'superior', matches: e => e.block === 'Trapecio' },
  dominante_rodilla: { label: 'Dominante de rodilla', group: 'legs', zone: 'inferior', matches: e => e.block === 'Pierna' && !e.family.includes('unilateral') && e.movementPattern !== 'Zancada lateral' && e.movementPattern !== 'Extensión rodilla' },
  unilateral_rodilla: { label: 'Unilateral de rodilla', group: 'legs', zone: 'inferior', matches: e => e.block === 'Pierna' && (e.family.includes('unilateral') || e.movementPattern === 'Zancada lateral') },
  extension_rodilla: { label: 'Extensión de rodilla', group: 'legs', zone: 'inferior', matches: e => e.movementPattern === 'Extensión rodilla' },
  bisagra: { label: 'Bisagra de cadera', group: 'legs', zone: 'inferior', matches: e => e.block === 'Isquios' && e.movementPattern.startsWith('Bisagra') },
  flexion_rodilla: { label: 'Flexión de rodilla (femoral)', group: 'legs', zone: 'inferior', matches: e => e.block === 'Isquios' && (e.movementPattern === 'Flexión rodilla' || e.movementPattern === 'Mixto') },
  extension_cadera: { label: 'Extensión de cadera (glúteo)', group: 'legs', zone: 'inferior', matches: e => e.block === 'Glúteos' && e.movementPattern === 'Extensión cadera' },
  abduccion_cadera: { label: 'Abducción de cadera', group: 'legs', zone: 'inferior', matches: e => e.block === 'Glúteos' && (e.movementPattern === 'Abducción' || e.movementPattern === 'Desplazamiento lateral') },
  aduccion_cadera: { label: 'Aducción de cadera', group: 'legs', zone: 'inferior', matches: e => e.block === 'Aductores' },
  gemelo: { label: 'Gemelo', group: 'legs', zone: 'inferior', matches: e => e.block === 'Gemelos' },
  core: { label: 'Core', group: 'core', zone: 'core', matches: e => e.block === 'Core' },
  antebrazo: { label: 'Antebrazo / agarre', group: 'other', zone: 'superior', matches: e => e.block === 'Antebrazo' },
};

function functionOf(ex: LibraryExercise): SlotFn {
  return (Object.keys(FUNCTIONS) as SlotFn[]).find(fn => FUNCTIONS[fn].matches(ex)) ?? 'core';
}

function roleFits(ex: LibraryExercise, role: SlotRole): boolean {
  if (role === 'principal') return ex.compatibleRoles.includes('Principal');
  if (role === 'secundario') return ex.compatibleRoles.includes('Principal') || ex.compatibleRoles.includes('Complementario');
  return true;
}

// ── Plantillas de sesión (sec. 4 de Instrucciones) ───────────────────
// Los slots opcionales no son checklist: solo se llenan si la necesidad
// semanal lo justifica y el tiempo lo permite.
interface SlotDef {
  fn: SlotFn;
  role: SlotRole;
  optional: boolean;
  /** Cubre la prioridad del usuario (orden, scoring, dosis). */
  priority?: boolean;
  /** Parte protegida de la prioridad: no se recorta por tiempo y es esencial. */
  priorityCore?: boolean;
  added?: string;
}
type Zone = 'superior' | 'inferior' | 'completo';
interface SessionTemplate { key: string; name: string; targetMuscles: string; zone: Zone; slots: SlotDef[] }

const S = (fn: SlotFn, role: SlotRole, optional = false): SlotDef => ({ fn, role, optional });

const TEMPLATES: Record<string, SessionTemplate> = {
  fullA: { key: 'fullA', name: 'Full Body A', targetMuscles: 'Todo el cuerpo', zone: 'completo', slots: [
    S('dominante_rodilla', 'principal'), S('empuje_horizontal', 'principal'), S('tiron_horizontal', 'principal'),
    S('bisagra', 'secundario'), S('deltoide_lateral', 'complementario', true), S('core', 'complementario', true)] },
  fullB: { key: 'fullB', name: 'Full Body B', targetMuscles: 'Todo el cuerpo', zone: 'completo', slots: [
    S('bisagra', 'principal'), S('tiron_vertical', 'principal'), S('empuje_inclinado', 'principal'),
    S('unilateral_rodilla', 'secundario'), S('empuje_vertical', 'secundario', true),
    S('biceps', 'complementario', true), S('triceps', 'complementario', true)] },
  pechoTriceps: { key: 'pechoTriceps', name: 'Pecho y tríceps', targetMuscles: 'Pecho, tríceps', zone: 'superior', slots: [
    S('empuje_horizontal', 'principal'), S('empuje_inclinado', 'secundario'), S('aduccion_pecho', 'complementario', true),
    S('triceps', 'complementario'), S('triceps', 'complementario', true)] },
  espaldaBiceps: { key: 'espaldaBiceps', name: 'Espalda y bíceps', targetMuscles: 'Espalda, bíceps', zone: 'superior', slots: [
    S('tiron_vertical', 'principal'), S('tiron_horizontal', 'secundario'), S('pullover', 'complementario', true),
    S('deltoide_posterior', 'complementario', true), S('biceps', 'complementario'), S('biceps', 'complementario', true)] },
  piernaHombro: { key: 'piernaHombro', name: 'Pierna y hombro', targetMuscles: 'Piernas, hombros', zone: 'completo', slots: [
    S('dominante_rodilla', 'principal'), S('empuje_vertical', 'secundario'), S('bisagra', 'secundario'),
    S('deltoide_lateral', 'complementario'), S('flexion_rodilla', 'complementario', true),
    S('extension_rodilla', 'complementario', true), S('gemelo', 'complementario', true)] },
  push: { key: 'push', name: 'Empuje', targetMuscles: 'Pecho, hombros, tríceps', zone: 'superior', slots: [
    S('empuje_horizontal', 'principal'), S('empuje_vertical', 'secundario'), S('empuje_inclinado', 'secundario', true),
    S('deltoide_lateral', 'complementario'), S('triceps', 'complementario'), S('aduccion_pecho', 'complementario', true)] },
  pull: { key: 'pull', name: 'Tirón', targetMuscles: 'Espalda, bíceps, deltoide posterior', zone: 'superior', slots: [
    S('tiron_vertical', 'principal'), S('tiron_horizontal', 'secundario'), S('deltoide_posterior', 'complementario'),
    S('biceps', 'complementario'), S('pullover', 'complementario', true), S('biceps', 'complementario', true)] },
  legs: { key: 'legs', name: 'Pierna', targetMuscles: 'Cuádriceps, isquios, glúteo', zone: 'inferior', slots: [
    S('dominante_rodilla', 'principal'), S('bisagra', 'secundario'), S('unilateral_rodilla', 'secundario', true),
    S('flexion_rodilla', 'complementario'), S('extension_cadera', 'complementario', true),
    S('gemelo', 'complementario', true), S('core', 'complementario', true)] },
  torsoA: { key: 'torsoA', name: 'Torso A', targetMuscles: 'Pecho, espalda, hombros', zone: 'superior', slots: [
    S('empuje_horizontal', 'principal'), S('tiron_horizontal', 'principal'), S('empuje_vertical', 'secundario'),
    S('tiron_vertical', 'secundario'), S('deltoide_lateral', 'complementario', true),
    S('biceps', 'complementario', true), S('triceps', 'complementario', true)] },
  torsoB: { key: 'torsoB', name: 'Torso B', targetMuscles: 'Espalda, pecho, brazos', zone: 'superior', slots: [
    S('tiron_vertical', 'principal'), S('empuje_inclinado', 'principal'), S('tiron_horizontal', 'secundario'),
    S('aduccion_pecho', 'complementario', true), S('deltoide_posterior', 'complementario', true),
    S('triceps', 'complementario', true), S('biceps', 'complementario', true)] },
  piernaA: { key: 'piernaA', name: 'Pierna A (rodilla)', targetMuscles: 'Cuádriceps, isquios', zone: 'inferior', slots: [
    S('dominante_rodilla', 'principal'), S('bisagra', 'secundario'), S('extension_rodilla', 'complementario'),
    S('flexion_rodilla', 'complementario', true), S('gemelo', 'complementario', true), S('core', 'complementario', true)] },
  piernaB: { key: 'piernaB', name: 'Pierna B (cadera)', targetMuscles: 'Glúteo, isquios, cuádriceps', zone: 'inferior', slots: [
    S('bisagra', 'principal'), S('unilateral_rodilla', 'secundario'), S('extension_cadera', 'secundario'),
    S('flexion_rodilla', 'complementario'), S('abduccion_cadera', 'complementario', true),
    S('gemelo', 'complementario', true), S('core', 'complementario', true)] },
};

// ── Política de splits (MOTOR-SPLIT-037, sec. 3) ─────────────────────
interface SplitDef { name: string; reason: string; sessions: string[] }

function splitOptions(days: number, priority: PriorityGroup | null): SplitDef[] {
  switch (days) {
    case 1: return [{ name: 'Full Body', reason: '1 día: una sesión completa', sessions: ['fullA'] }];
    case 2: return [{ name: 'Full Body A/B', reason: '2 días: Full Body es la estructura base', sessions: ['fullA', 'fullB'] }];
    case 3: return [
      { name: 'Pecho+Tríceps / Espalda+Bíceps / Pierna+Hombro', reason: '3 días: split por grupos (no Full Body estándar)', sessions: ['pechoTriceps', 'espaldaBiceps', 'piernaHombro'] },
      { name: 'Empuje / Tirón / Pierna', reason: '3 días: PPL, válido pero no automático', sessions: ['push', 'pull', 'legs'] },
    ];
    case 4: return [
      { name: 'Torso / Pierna x2', reason: '4 días: buena distribución, cada zona 2x/semana', sessions: ['torsoA', 'piernaA', 'torsoB', 'piernaB'] },
      priority === 'legs'
        ? { name: 'Pierna / Empuje / Pierna / Tirón', reason: '4 días híbrido: prioridad de pierna con 2 exposiciones', sessions: ['legs', 'push', 'piernaB', 'pull'] }
        : { name: 'Empuje / Tirón / Pierna / Torso', reason: '4 días híbrido: PPL + torso', sessions: ['push', 'pull', 'legs', 'torsoA'] },
    ];
    case 5: return [{ name: 'Torso / Pierna + Empuje / Tirón / Pierna', reason: '5 días: híbrido según prioridad y contexto (no PPL + 2 días al azar)', sessions: ['torsoA', 'piernaA', 'push', 'pull', 'piernaB'] }];
    case 6: return [{ name: 'PPL x2', reason: '6 días: PPL x2 es candidato, no obligación', sessions: ['push', 'pull', 'legs', 'push', 'pull', 'legs'] }];
    default: return [{ name: 'PPL x2 + Full Body', reason: '7 días: PPL x2 y una sesión completa', sessions: ['push', 'pull', 'legs', 'push', 'pull', 'legs', 'fullB'] }];
  }
}

export function planOptionCount(daysPerWeek: number): number {
  return splitOptions(clampDays(daysPerWeek), null).length;
}

const clampDays = (d: number) => Math.min(Math.max(d || 3, 1), 7);

// ── Hard Filters / Safety (MOTOR-HARD-001, SAFE-001) ─────────────────
const INJURY_RULES: { keywords: string[]; excludes: (ex: LibraryExercise) => boolean; label: string }[] = [
  { label: 'rodilla', keywords: ['rodilla', 'knee', 'menisco', 'ligamento'],
    excludes: ex => ex.block === 'Pierna' && level(ex.stability) < 1 },
  { label: 'hombro', keywords: ['hombro', 'shoulder', 'manguito'],
    excludes: ex => (ex.block === 'Hombro' && ex.family === 'Press vertical') || ex.movementPattern === 'Empuje inclinado' || ex.id === 'triceps_dip' },
  { label: 'espalda', keywords: ['espalda', 'lumbar', 'lumbago', 'hernia', 'ciatica'],
    excludes: ex => ex.family.startsWith('Bisagra cadera') || ['ham_good_morning', 'back_barbell_row', 'back_tbar_row', 'quad_squat', 'quad_front_squat'].includes(ex.id) },
  { label: 'muñeca/codo', keywords: ['muneca', 'wrist', 'codo', 'epicondilitis'],
    excludes: ex => ex.block === 'Antebrazo' || ex.family === 'Extensión codo tumbado' || ex.id === 'triceps_dip' },
  { label: 'cadera', keywords: ['cadera', 'hip'],
    excludes: ex => ex.family === 'Abducción cadera' || ['ham_good_morning', 'leg_bulgarian', 'leg_lateral_lunge'].includes(ex.id) },
];

function hardFilterReason(ex: LibraryExercise, input: MotorInput, temporaryUnavailable: string[] = []): string | null {
  const injuryText = normalize((input.injuries ?? []).join(' '));
  for (const rule of INJURY_RULES) {
    if (rule.keywords.some(k => injuryText.includes(k)) && rule.excludes(ex)) return `SAFETY_${rule.label}`;
  }
  const excluded = (input.excludedExercises ?? []).map(normalize).filter(Boolean);
  if (excluded.some(x => x === ex.id || normalize(ex.name).includes(x))) return 'EXCLUIDO_USUARIO';
  if (!equipmentAvailable(ex, input.availableEquipment)) return 'EQUIPO_NO_DISPONIBLE';
  if (temporaryUnavailable.includes(ex.id)) return 'EQUIPO_OCUPADO';
  return null;
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
  biologicalProfile?: 'male' | 'female';
  otherSports?: string[];
  otherSportsDays?: number;
  /** Equipamiento permanente del gimnasio. Sin definir = gimnasio completo. */
  availableEquipment?: readonly string[];
  /** Preferencias por id o nombre de ejercicio (MOTOR-PREFERENCE-047). */
  preferences?: { liked?: string[]; disliked?: string[] };
  /** Estado de progresión por libraryId (fitkProgression.evaluateProgression). */
  exerciseHistory?: Record<string, ProgressState>;
  startFrom?: number;
  customDays?: number[];
  userId?: string;
  planVersion?: number;
  /** Semana anterior: continuidad de split y de ejercicios que funcionan. */
  previousPlan?: WeeklySession[];
  /** 3-4 días: opción elegida. Sin definir, se hereda del plan anterior. */
  planOption?: number;
}

// ── Otros deportes (MOTOR-RECOVERY-033) ──────────────────────────────
// Carga contextual, NO series equivalentes. Sin fórmulas tipo "-4 series".
const LEG_SPORTS = ['futbol', 'running', 'correr', 'ciclismo', 'bici', 'kick', 'boxeo', 'padel', 'tenis', 'baloncesto',
  'basket', 'crossfit', 'atletismo', 'rugby', 'montana', 'senderismo', 'trail', 'hockey', 'esqui', 'voley', 'balonmano', 'escalada'];

function legSportLoad(input: MotorInput): 'ninguna' | 'media' | 'alta' {
  const sports = normalize((input.otherSports ?? []).join(' '));
  if (!sports || !LEG_SPORTS.some(k => sports.includes(k))) return 'ninguna';
  return (input.otherSportsDays ?? 1) >= 2 ? 'alta' : 'media';
}

// ── Prioridad muscular (MOTOR-PRIORITY-029 / ORDER-038) ──────────────
// Cambia frecuencia, orden, dosis y selección; no se resuelve añadiendo un
// aislamiento. No depende del sexo y nunca se infiere.
const FREQUENCY_FN: Record<Exclude<PriorityGroup, 'other'>, SlotFn[]> = {
  chest: ['empuje_inclinado'], back: ['tiron_horizontal'], shoulders: ['deltoide_lateral'],
  arms: ['biceps', 'triceps'], legs: ['unilateral_rodilla'], core: ['core'],
};

function priorityGroupOf(m?: MuscleGroup): PriorityGroup | null {
  return m && m !== 'none' ? m : null;
}

function applyPriority(sessions: SlotDef[][], templates: SessionTemplate[], group: PriorityGroup | null, notes: string[]): void {
  if (!group || group === 'other') return;
  const isPri = (fn: SlotFn) => FUNCTIONS[fn].group === group;
  // La prioridad protege lo importante (compuestos y el primer trabajo directo
  // de cada función), no convierte cada accesorio en obligatorio.
  const coreFn = (s: SlotDef, firstOfFn: boolean) =>
    s.role !== 'complementario' || (group === 'arms' && firstOfFn) || (group === 'shoulders' && s.fn === 'deltoide_lateral' && firstOfFn);
  for (const slots of sessions) {
    const seen = new Set<SlotFn>();
    for (const s of slots) {
      if (!isPri(s.fn)) continue;
      const first = !seen.has(s.fn);
      seen.add(s.fn);
      s.priority = true;
      s.priorityCore = coreFn(s, first);
      if (s.priorityCore) s.optional = false;
      if (s.role === 'secundario' && !slots.some(o => o.priority && o.role === 'principal')) s.role = 'principal';
    }
  }
  // Frecuencia: cada función prioritaria al menos en 2 sesiones si hay ≥3 días.
  if (sessions.length >= 3) {
    for (const fn of FREQUENCY_FN[group]) {
      const count = sessions.filter(sl => sl.some(s => s.fn === fn || (group !== 'arms' && isPri(s.fn)))).length;
      if (count >= 2) continue;
      const zone = FUNCTIONS[fn].zone;
      const candidates = sessions
        .map((sl, i) => ({ sl, i }))
        .filter(({ sl }) => !sl.some(s => s.fn === fn))
        .sort((a, b) => {
          const za = templates[a.i].zone === zone || templates[a.i].zone === 'completo' ? 0 : 1;
          const zb = templates[b.i].zone === zone || templates[b.i].zone === 'completo' ? 0 : 1;
          return za - zb || a.sl.length - b.sl.length || a.i - b.i;
        });
      const target = candidates[0];
      if (!target) continue;
      const role: SlotRole = ['biceps', 'triceps', 'deltoide_lateral', 'core'].includes(fn) ? 'complementario' : 'secundario';
      target.sl.push({ fn, role, optional: false, priority: true, priorityCore: true, added: 'frecuencia de prioridad' });
      notes.push(`Prioridad: añadida ${FUNCTIONS[fn].label} en ${templates[target.i].name} para 2 exposiciones semanales`);
    }
  }
  // Orden: dentro de cada nivel de rol, lo prioritario primero.
  const rank: Record<SlotRole, number> = { principal: 0, secundario: 1, complementario: 2 };
  for (const slots of sessions) {
    const indexed = slots.map((s, i) => ({ s, i }));
    indexed.sort((a, b) => rank[a.s.role] - rank[b.s.role] || Number(!!b.s.priority) - Number(!!a.s.priority) || a.i - b.i);
    slots.splice(0, slots.length, ...indexed.map(x => x.s));
  }
}

// ── Scoring contextual ───────────────────────────────────────────────
interface Context {
  input: MotorInput;
  userLevel: 'beginner' | 'advanced';
  sportLoad: 'ninguna' | 'media' | 'alta';
  sessionPicks: LibraryExercise[];
  weekPicks: LibraryExercise[];
  previousIds: Set<string>;
  /** Sesiones de ≤30 min: la eficiencia temporal pasa a puntuar. */
  timePressure: boolean;
}

const matchesPref = (ex: LibraryExercise, list?: string[]) =>
  !!list?.some(x => x === ex.id || normalize(ex.name) === normalize(x));

interface Scored { ex: LibraryExercise; score: number; redundancy: string }

function scoreCandidate(ex: LibraryExercise, slot: SlotDef, ctx: Context): Scored {
  const factors: { weight: number; value: number | null }[] = [];
  const beginner = ctx.userLevel === 'beginner';

  // 1) Adecuación (30). Experiencia pondera; no crea listas cerradas (MOTOR-CAPACITY-016).
  const acc = level(ex.accessibility);
  const strengthReq = level(ex.strengthRequirement);
  // MOTOR-BICEPS-023: en bíceps la estabilidad no debe dar ventaja automática.
  const stab = ex.block === 'Bíceps' ? 0.5 : level(ex.stability);
  const scal = level(ex.scalability);
  const prog = level(ex.progressionSuitability);
  // Con experiencia, la estabilidad deja de puntuar: máquina ≠ "mejor" por
  // defecto (barra libre no es "solo avanzada" ni máquina "solo principiante").
  let fit = beginner
    ? 0.3 * acc + 0.2 * stab + 0.15 * scal + 0.15 * prog + 0.2 * (1 - strengthReq)
    : 0.15 * acc + 0.3 * scal + 0.55 * prog;
  const legZone = FUNCTIONS[slot.fn].zone === 'inferior';
  if (legZone && ctx.sportLoad === 'alta') fit *= 1 - 0.4 * level(ex.systemicDemand);
  const bmi = ctx.input.weight && ctx.input.height ? ctx.input.weight / Math.pow(ctx.input.height / 100, 2) : null;
  if (legZone && bmi && bmi >= 32) fit = 0.5 * fit + 0.5 * level(ex.stability); // preferencia, no filtro
  factors.push({ weight: 30, value: clamp01(fit) });

  // 2) Complementariedad / redundancia (25): por función, familia, patrón y
  // lateralidad, no solo por nombre (MOTOR-REDUNDANCY-014 / DIVERSITY-013).
  let comp = 1;
  const notes: string[] = [];
  if (ctx.sessionPicks.some(p => p.family === ex.family)) { comp *= 0.2; notes.push('misma familia en sesión'); }
  else if (ctx.sessionPicks.some(p => p.movementPattern === ex.movementPattern && p.laterality === ex.laterality)) { comp *= 0.6; notes.push('mismo patrón y lateralidad en sesión'); }
  if (ctx.weekPicks.some(p => p.id === ex.id)) { comp *= 0.6; notes.push('ya usado esta semana'); }
  else if (ctx.weekPicks.some(p => p.family === ex.family)) { comp *= 0.85; }
  // Característica de carga (máquina / libre / polea / corporal) también es
  // redundancia: evita sesiones enteras del mismo tipo de equipo.
  const sameLoad = ctx.sessionPicks.filter(p => equipmentType(p) === equipmentType(ex)).length;
  if (sameLoad >= 1) {
    comp *= Math.max(0.55, 1 - 0.12 * sameLoad);
    if (sameLoad >= 2) notes.push(`${sameLoad} ejercicios con el mismo tipo de carga`);
  }
  factors.push({ weight: 25, value: comp });

  // 3) Preferencias (15): ausencia de dato ≠ preferencia negativa.
  const liked = matchesPref(ex, ctx.input.preferences?.liked);
  factors.push({ weight: 15, value: liked ? 1 : null });

  // 4) Prioridad (15): solo si hay prioridad declarada.
  const pg = priorityGroupOf(ctx.input.priorityMuscle);
  if (pg) {
    const primary = BLOCK_TO_MUSCLE[ex.block] === pg;
    const secondary = ex.secondaryMuscles.some(s => s.coefficient > 0 && BLOCK_TO_MUSCLE[blockForMuscle(s.muscle)] === pg);
    factors.push({ weight: 15, value: primary ? 1 : secondary ? 0.5 : 0 });
  } else {
    factors.push({ weight: 15, value: null });
  }

  // 5) Logística / eficiencia temporal (10): solo aplica con tiempo justo.
  // Si puntuara siempre sería un bonus universal para máquinas; fuera de la
  // presión de tiempo la eficiencia queda como desempate (MOTOR-TIE-049).
  factors.push({
    weight: 10,
    value: ctx.timePressure ? clamp01(1 - (0.5 * level(ex.setupCost) + 0.5 * level(ex.executionTimeCost))) : null,
  });

  let raw = 0;
  let avail = 0;
  for (const f of factors) {
    if (f.value === null) continue;
    raw += f.weight * f.value;
    avail += f.weight;
  }
  return { ex, score: avail ? (raw / avail) * 100 : 50, redundancy: notes.length ? notes.join('; ') : 'aceptable' };
}

function blockForMuscle(muscle: string): string {
  const m = normalize(muscle);
  if (m.includes('tricep')) return 'Tríceps';
  if (m.includes('bicep') || m.includes('braquial')) return 'Bíceps';
  if (m.includes('deltoide') || m.includes('hombro')) return 'Hombro';
  if (m.includes('pecho') || m.includes('pectoral')) return 'Pecho';
  if (m.includes('dorsal') || m.includes('espalda') || m.includes('romboide')) return 'Espalda';
  if (m.includes('trapecio')) return 'Trapecio';
  if (m.includes('gluteo')) return 'Glúteos';
  if (m.includes('isquio') || m.includes('femoral')) return 'Isquios';
  if (m.includes('cuadricep') || m.includes('pierna')) return 'Pierna';
  if (m.includes('aductor')) return 'Aductores';
  if (m.includes('gemelo') || m.includes('soleo')) return 'Gemelos';
  if (m.includes('core') || m.includes('abdom') || m.includes('oblicuo') || m.includes('lumbar')) return 'Core';
  if (m.includes('antebrazo') || m.includes('agarre')) return 'Antebrazo';
  return '';
}

// ── Selección para un slot ───────────────────────────────────────────
interface Selection {
  ex: LibraryExercise;
  slot: SlotDef;
  score: number;
  alternative: string | null;
  redundancy: string;
  history: string;
  reason: string;
}

function selectForSlot(slot: SlotDef, ctx: Context, previousForSlot: string | undefined, seed: string): Selection | null {
  const usedIds = new Set(ctx.sessionPicks.map(p => p.id));
  const fnPool = LIBRARY.filter(e => FUNCTIONS[slot.fn].matches(e) && !usedIds.has(e.id));
  let pool = fnPool.filter(e => roleFits(e, slot.role) && hardFilterReason(e, ctx.input) === null);
  if (pool.length === 0) {
    // Sin candidato con ese rol: se relaja el rol (nunca Safety/Hard Filters).
    pool = fnPool.filter(e => hardFilterReason(e, ctx.input) === null);
  }
  const disliked = pool.filter(e => matchesPref(e, ctx.input.preferences?.disliked));
  if (disliked.length && disliked.length < pool.length) pool = pool.filter(e => !disliked.includes(e));
  if (pool.length === 0) return null;

  const scored = pool.map(e => scoreCandidate(e, slot, ctx)).sort((a, b) => b.score - a.score);
  const top = scored[0].score;

  // Estabilidad (MOTOR-STABILITY-015): lo que funciona se mantiene frente a
  // alternativas solo marginalmente mejores (~+8). Si progresa, se mantiene.
  if (previousForSlot) {
    const prev = scored.find(s => s.ex.id === previousForSlot);
    const state = ctx.input.exerciseHistory?.[previousForSlot];
    if (prev && !matchesPref(prev.ex, ctx.input.preferences?.disliked)) {
      const progressing = state !== undefined && KEEP_STATES.includes(state);
      if (state !== 'plateau' && (progressing || top - prev.score < 8)) {
        const alt = scored.find(s => s.ex.id !== prev.ex.id);
        return {
          ex: prev.ex, slot, score: prev.score, alternative: alt?.ex.name ?? null, redundancy: prev.redundancy,
          history: state ? `estado ${state}` : 'continuidad semana anterior',
          reason: progressing ? 'Se mantiene: el ejercicio progresa (MOTOR-STABILITY-015)' : 'Se mantiene: ninguna alternativa es claramente mejor (histéresis +8)',
        };
      }
    }
  }

  // Banda equivalente (top−5) + desempate MOTOR-TIE-049:
  // historial positivo → preferencia → continuidad → progresabilidad → eficiencia temporal → setup.
  const band = scored.filter(s => s.score >= top - 5);
  const history = ctx.input.exerciseHistory ?? {};
  // Paso 9 (redundancia por característica de carga): entre equivalentes,
  // menos repetición del mismo tipo de equipo en la sesión y, para esta
  // misma función, en la semana. Va antes de la eficiencia temporal para
  // que el desempate no convierta toda la rutina en máquinas.
  const loadRedundancy = (e: LibraryExercise) =>
    ctx.sessionPicks.filter(p => equipmentType(p) === equipmentType(e)).length
    + 0.5 * ctx.weekPicks.filter(p => FUNCTIONS[slot.fn].matches(p) && equipmentType(p) === equipmentType(e)).length;
  const key = (s: Scored): number[] => [
    history[s.ex.id] && KEEP_STATES.includes(history[s.ex.id]) ? 1 : 0,
    matchesPref(s.ex, ctx.input.preferences?.liked) ? 1 : 0,
    ctx.previousIds.has(s.ex.id) ? 1 : 0,
    level(s.ex.progressionSuitability),
    -loadRedundancy(s.ex),
    -level(s.ex.executionTimeCost),
    -level(s.ex.setupCost),
    s.score,
    fnv1a(`${seed}|${s.ex.id}`) / 0xffffffff, // empate total: hash estable, no aleatorio
  ];
  band.sort((a, b) => {
    const ka = key(a), kb = key(b);
    for (let i = 0; i < ka.length; i++) if (ka[i] !== kb[i]) return kb[i] - ka[i];
    return 0;
  });
  const chosen = band[0];
  const alt = scored.find(s => s.ex.id !== chosen.ex.id);
  return {
    ex: chosen.ex, slot, score: chosen.score, alternative: alt?.ex.name ?? null, redundancy: chosen.redundancy,
    history: history[chosen.ex.id] ? `estado ${history[chosen.ex.id]}` : 'sin datos',
    reason: band.length > 1
      ? `Mayor encaje contextual entre ${band.length} candidatos equivalentes; no por superioridad universal`
      : 'Mejor encaje contextual para este slot',
  };
}

// ── Prescripción (dosis inicial conservadora, MOTOR-VOLUME-032) ──────
interface Prescription {
  sets: number;
  repRange: [number, number];
  target: number;
  rirTarget: [number, number];
  restSeconds: number;
  unit: 'reps' | 'seconds' | 'steps';
  perSide: boolean;
}

const REP_BANDS: Record<SlotRole | 'fuerza', [number, number][]> = {
  fuerza: [[5, 8], [6, 10], [8, 12]],
  principal: [[6, 10], [8, 12], [5, 8], [10, 15]],
  secundario: [[8, 12], [10, 15], [6, 10]],
  complementario: [[12, 20], [10, 15], [15, 25], [8, 12]],
};

/** Máximo de ejercicios por sesión: "sin exceso de ejercicios" (sec. 18). 🟡 */
const MAX_EXERCISES = { beginner: 6, advanced: 8 };
/** Por debajo de esta fracción del presupuesto, la dosis se completa con prudencia. */
const MIN_FILL = 0.8;

function prescribe(ex: LibraryExercise, slot: SlotDef, userLevel: 'beginner' | 'advanced', goal?: string): Prescription {
  const beginner = userLevel === 'beginner';
  let sets = slot.role === 'principal' ? (beginner ? 3 : 4) : slot.role === 'secundario' ? 3 : (beginner ? 2 : 3);
  if (slot.priorityCore) sets = Math.min(5, sets + 1);

  const spec = ex.repSpec;
  let repRange: [number, number];
  if (spec.byCapacity || spec.min === null || spec.max === null) {
    repRange = beginner ? [5, 10] : [6, 12]; // "según capacidad": base o regresión (MOTOR-PROGRESSION-017)
  } else if (spec.unit !== 'reps') {
    repRange = [spec.min, spec.max];
  } else {
    // Bandas habituales y comprensibles, siempre dentro del rango de la Biblioteca.
    const prefs = REP_BANDS[slot.role === 'principal' && goal === 'strength' ? 'fuerza' : slot.role];
    const min = spec.min, max = spec.max;
    repRange = prefs.find(([lo, hi]) => lo >= min && hi <= max) ?? [min, Math.min(max, min + 8)];
  }
  // Doble progresión: se empieza en la zona baja/media del rango.
  const target = spec.unit === 'reps' ? Math.round(repRange[0] + (repRange[1] - repRange[0]) * 0.4) : repRange[0];

  const nearFailure = level(ex.nearFailureSuitability);
  const rirTarget: [number, number] = beginner || nearFailure <= 0.25
    ? [2, 3]
    : slot.role === 'principal' ? [1, 3] : [1, 2];

  const rMin = ex.restSpec.min ?? 60;
  const rMax = ex.restSpec.max ?? rMin;
  const restSeconds = Math.round(
    slot.role === 'principal' ? rMin + (rMax - rMin) * 0.75 : slot.role === 'secundario' ? (rMin + rMax) / 2 : rMin + (rMax - rMin) * 0.25,
  );
  return { sets, repRange, target, rirTarget, restSeconds, unit: spec.unit, perSide: spec.perSide };
}

// ── Estimador de duración (MOTOR-TIME-034) ───────────────────────────
// Series + descansos + ejecución + unilateralidad + setup + transiciones.
const EXEC_SECONDS = { corta: 25, normal: 35, larga: 45 };
const SETUP_SECONDS = { minimo: 10, bajo: 20, medio: 45, alto: 90 };
const TRANSITION_SECONDS = { mismaZona: 25, normal: 55, costosa: 85 };
const BUFFER = 1.12;
const BUDGET_SHARE = 0.95; // planificar ~90-95 % del tiempo disponible

interface TimedItem { ex: LibraryExercise; sets: number; restSeconds: number; perSide: boolean; unit: string; target: number }

function exerciseSeconds(it: TimedItem): number {
  const execLevel = level(it.ex.executionTimeCost);
  let exec = execLevel <= 0.25 ? EXEC_SECONDS.corta : execLevel <= 0.6 ? EXEC_SECONDS.normal : EXEC_SECONDS.larga;
  if (it.unit === 'seconds') exec = it.target;
  const sides = it.perSide ? 2 : 1;
  const setupRaw = it.ex.setupCost;
  const setup = setupRaw === 'Mínimo' ? SETUP_SECONDS.minimo : level(setupRaw) <= 0.25 ? SETUP_SECONDS.bajo : level(setupRaw) <= 0.6 ? SETUP_SECONDS.medio : SETUP_SECONDS.alto;
  // No se cuenta descanso completo tras la última serie (pasa a transición).
  return setup + it.sets * exec * sides + (it.perSide ? it.sets * 10 : 0) + Math.max(0, it.sets - 1) * it.restSeconds;
}

function sessionSeconds(items: TimedItem[]): number {
  let total = 0;
  items.forEach((it, i) => {
    total += exerciseSeconds(it);
    if (i > 0) {
      const sameZone = it.ex.block === items[i - 1].ex.block;
      total += sameZone ? TRANSITION_SECONDS.mismaZona : level(it.ex.setupCost) >= 1 ? TRANSITION_SECONDS.costosa : TRANSITION_SECONDS.normal;
    }
  });
  return total * BUFFER;
}

// ── Carga inicial estimada ───────────────────────────────────────────
// 🟡 "Carga inicial: no inventarla sin datos; calibrar primera ejecución".
// Por petición de producto se ofrece una ESTIMACIÓN editable (nunca se
// registra sola) a partir de peso/altura/nivel. Peso corporal: sin número.
const PATTERN_LOAD_FACTOR: Record<string, number> = {
  'Sentadilla': 0.5, 'Sentadilla unilateral': 0.25, 'Sentadilla/prensa': 0.7, 'Prensa': 0.9,
  'Zancada': 0.25, 'Zancada lateral': 0.15, 'Step': 0.2, 'Isométrico': 0,
  'Bisagra': 0.6, 'Bisagra/extensión': 0.55, 'Mixto': 0,
  'Extensión cadera': 0.5, 'Extensión rodilla': 0.5, 'Flexión rodilla': 0.45, 'Abducción': 0.4, 'Aducción': 0.4,
  'Empuje horizontal': 0.35, 'Empuje inclinado': 0.3, 'Empuje vertical': 0.2, 'Empuje': 0.3,
  'Tirón horizontal': 0.35, 'Tirón vertical': 0.35, 'Tirón alto': 0.2,
  'Aducción horizontal': 0.4, 'Abducción horizontal': 0.3, 'Abducción hombro': 0.15,
  'Extensión hombro': 0.35, 'Elevación escapular': 0.35,
  'Flexión codo': 0.3, 'Extensión codo': 0.3, 'Flexión plantar': 0.8,
  'Flexión tronco': 0.3, 'Elevación piernas': 0, 'Flexión muñeca': 0.12, 'Extensión muñeca': 0.08,
  'Estabilidad': 0, 'Desplazamiento lateral': 0,
};
const ROLE_LOAD_FACTOR: Record<SlotRole, number> = { principal: 1, secundario: 0.8, complementario: 0.6 };

interface LoadProfile { weight?: number; height?: number; biologicalProfile?: 'male' | 'female' }

function estimateStartingLoad(ex: LibraryExercise, role: SlotRole, userLevel: 'beginner' | 'advanced', profile: LoadProfile):
  { kg: number; unit: 'total' | 'per-dumbbell' } | null {
  if (ex.loadSource !== 'Externa' || !profile.weight) return null;
  const factor = PATTERN_LOAD_FACTOR[ex.movementPattern] ?? 0.2;
  if (factor === 0) return null;
  const heightM = profile.height ? profile.height / 100 : null;
  const bmi = heightM ? profile.weight / (heightM * heightM) : null;
  let effectiveBw = profile.weight;
  if (bmi && heightM && bmi > 27) {
    const ref = 24 * heightM * heightM; // el exceso no es masa funcional para estimar fuerza
    effectiveBw = ref + (profile.weight - ref) * 0.4;
  }
  const raw = effectiveBw * factor * (userLevel === 'advanced' ? 1.4 : 1)
    * (profile.biologicalProfile === 'female' ? 0.75 : 1) * ROLE_LOAD_FACTOR[role];
  const opts = ex.equipmentOptions;
  const first = opts[0] ?? [];
  if (first.includes('mancuernas')) return { kg: Math.max(1, roundTo(raw / 2, 1)), unit: 'per-dumbbell' };
  if (first.includes('barra')) return { kg: Math.max(ex.block === 'Bíceps' || ex.block === 'Tríceps' ? 10 : 20, roundTo(raw, 2.5)), unit: 'total' };
  return { kg: Math.max(5, roundTo(raw, 2.5)), unit: 'total' };
}

// ── Variantes y alternativas ─────────────────────────────────────────
function equipmentType(ex: LibraryExercise): ExerciseVariationType {
  const first = ex.equipmentOptions[0] ?? [];
  if (first.includes('mancuernas')) return 'dumbbells';
  if (first.includes('polea')) return 'cable';
  if (first.includes('maquina') || first.includes('smith') || first.includes('prensa')) return 'machine';
  if (first.includes('barra')) return 'barbell';
  return 'bodyweight';
}

/** Otras fichas del mismo movimiento (máquina / mancuernas / polea / libre). */
function variationsFor(ex: LibraryExercise): ExerciseVariation[] {
  return LIBRARY.filter(o => o.family === ex.family && o.id !== ex.id)
    .map(o => ({ id: `fk-${o.id}`, name: o.name, type: equipmentType(o) }));
}

/** Alternativas funcionales: misma familia → misma familia de sustitución → misma función. */
function alternativesFor(ex: LibraryExercise, count = 3): string[] {
  const fn = functionOf(ex);
  const seen = new Set([ex.id]);
  const out: string[] = [];
  for (const tier of [
    LIBRARY.filter(o => o.family === ex.family),
    LIBRARY.filter(o => o.substitutionFamily === ex.substitutionFamily),
    LIBRARY.filter(o => FUNCTIONS[fn].matches(o)),
  ]) {
    for (const o of tier) {
      if (seen.has(o.id)) continue;
      seen.add(o.id);
      out.push(o.name);
    }
  }
  return out.slice(0, count);
}

// ── Construcción de Exercise ─────────────────────────────────────────
function buildExercise(sel: Selection, p: Prescription, input: MotorInput, userLevel: 'beginner' | 'advanced',
  timeBudget: string, essential: boolean, equipmentNote: string): Exercise {
  const { ex, slot } = sel;
  const load = estimateStartingLoad(ex, slot.role, userLevel, input);
  const trace: ExerciseMotorTrace = {
    slot: `${FUNCTIONS[slot.fn].label} (${slot.role}${slot.priority ? ', prioridad' : ''}${slot.added ? `, ${slot.added}` : ''})`,
    hardFilters: 'OK',
    equipment: equipmentNote,
    priority: slot.priority ? 'prioridad del usuario' : priorityGroupOf(input.priorityMuscle) ? 'compatible' : 'sin prioridad declarada',
    redundancy: sel.redundancy,
    timeBudget,
    history: sel.history,
    alternative: sel.alternative,
    score: Math.round(sel.score),
    reason: sel.reason,
  };
  return {
    id: `fk-${ex.id}`,
    name: ex.name,
    targetMuscle: BLOCK_TO_MUSCLE[ex.block] ?? 'none',
    sets: p.sets,
    reps: Array(p.sets).fill(p.target),
    restSeconds: p.restSeconds,
    instructions: [ex.family, ex.motorNotes].filter(Boolean).join('. '),
    alternatives: alternativesFor(ex),
    variations: variationsFor(ex),
    configurations: variantsFor(ex.id).map(v => v.name),
    libraryId: ex.id,
    movementPattern: ex.movementPattern,
    equipmentCode: ex.equipment,
    repRange: p.repRange,
    repUnit: p.unit,
    perSide: p.perSide,
    rirTarget: p.rirTarget,
    slotFunction: slot.fn,
    slotRole: slot.role,
    essential,
    priority: !!slot.priority,
    reasonCodes: [`SLOT_${slot.fn.toUpperCase()}`, slot.priorityCore ? "PRIORITY_PROTECTED" : slot.priority ? "PRIORITY_FAVOURED" : null, sel.history.startsWith('continuidad') || sel.history.startsWith('estado') ? 'STABILITY_KEEP' : 'CONTEXTUAL_SELECTION'].filter(Boolean) as string[],
    suggestedWeightKg: load?.kg,
    suggestedWeightUnit: load?.unit,
    motorTrace: trace,
  };
}

// ── Planificación semanal ────────────────────────────────────────────
export interface PlanResult {
  sessions: WeeklySession[];
  split: string;
  splitReason: string;
  warnings: string[];
}

function durationMinutes(d: string): number {
  return d === '30min' ? 30 : d === '1hour' ? 60 : 45;
}

function resolveOption(days: number, input: MotorInput, options: SplitDef[]): number {
  if (input.planOption !== undefined) return Math.min(Math.max(0, input.planOption), options.length - 1);
  // Continuidad: hereda la estructura de la semana anterior si coincide.
  const prevKeys = input.previousPlan?.map(s => s.templateKey).filter(Boolean);
  if (prevKeys?.length) {
    const idx = options.findIndex(o => o.sessions.join() === prevKeys.join());
    if (idx >= 0) return idx;
  }
  return 0;
}

export function generatePlanWithTrace(input: MotorInput): PlanResult {
  const days = clampDays(input.daysPerWeek);
  const options = splitOptions(days, priorityGroupOf(input.priorityMuscle));
  return buildPlan(input, options[resolveOption(days, input, options)], true);
}

function buildPlan(input: MotorInput, split: SplitDef, validate: boolean): PlanResult {
  const days = clampDays(input.daysPerWeek);
  const minutes = durationMinutes(input.workoutDuration);
  const budget = minutes * 60 * BUDGET_SHARE;
  const userLevel = input.level ?? 'beginner';
  const priority = priorityGroupOf(input.priorityMuscle);
  const sportLoad = legSportLoad(input);
  const warnings: string[] = [];

  // 3) Estructura semanal
  const templates = split.sessions.map(k => TEMPLATES[k]);

  // 4-6) Roles de sesión y slots (copias: las plantillas no se mutan)
  const slotsBySession = templates.map(t => t.slots.map(s => ({ ...s })));
  const planNotes: string[] = [];
  applyPriority(slotsBySession, templates, priority, planNotes);
  const seenTemplates = new Set<string>();
  const roles = templates.map(t => {
    const role: SessionMotorTrace['sessionRole'] = seenTemplates.has(t.key) ? 'desarrollo' : 'principal';
    seenTemplates.add(t.key);
    if (sportLoad === 'alta' && t.zone === 'inferior') return 'moderada' as const;
    return role;
  });
  if (sportLoad !== 'ninguna') {
    planNotes.push(`Otros deportes con carga de piernas (${sportLoad}): se modera la demanda sistémica en pierna, sin restar series fijas`);
  }

  const weekPicks: LibraryExercise[] = [];
  const allPreviousIds = new Set((input.previousPlan ?? []).flatMap(s => s.exercises.map(e => e.libraryId).filter(Boolean) as string[]));
  const sessions: WeeklySession[] = [];
  const startFrom = input.startFrom ?? 1;
  const equipmentNote = input.availableEquipment ? 'disponible en tu gimnasio' : 'gimnasio completo (sin perfil de equipo)';

  templates.forEach((t, i) => {
    const slots = slotsBySession[i];
    const notes: string[] = [];
    const ctx: Context = { input, userLevel, sportLoad, sessionPicks: [], weekPicks, previousIds: allPreviousIds, timePressure: minutes <= 30 };
    // Continuidad: la n-ésima sesión de esta plantilla se compara con la
    // n-ésima de la semana anterior (en PPL x2 hay dos "Empuje" distintos).
    const occurrence = templates.slice(0, i).filter(x => x.key === t.key).length;
    const prevSession = input.previousPlan?.filter(s => s.templateKey === t.key)[occurrence]
      ?? (input.previousPlan?.some(s => s.templateKey) ? undefined : input.previousPlan?.[i]);
    const prevByFn = new Map<string, string[]>();
    for (const e of prevSession?.exercises ?? []) {
      const lib = e.libraryId ? libraryById.get(e.libraryId) : undefined;
      if (!lib) continue;
      const fn = e.slotFunction ?? functionOf(lib);
      prevByFn.set(fn, [...(prevByFn.get(fn) ?? []), lib.id]);
    }
    const fnCount = new Map<string, number>();
    const picks: { sel: Selection; p: Prescription }[] = [];

    for (const slot of slots) {
      // 9) Trabajo indirecto: un 2º slot directo opcional de brazo se omite si
      // los compuestos ya aportan mucho (señal, no contabilidad exacta).
      const k = fnCount.get(slot.fn) ?? 0;
      if (slot.optional && !slot.priorityCore && k > 0 && (slot.fn === 'triceps' || slot.fn === 'biceps')) {
        const signal = indirectSignal(picks, slot.fn === 'triceps' ? 'tricep' : 'bicep');
        if (signal === 'alto') { notes.push(`${FUNCTIONS[slot.fn].label} extra omitido: trabajo indirecto alto (MOTOR-INDIRECT-021)`); continue; }
      }
      if (slot.optional && !slot.priorityCore && roles[i] === 'moderada' && FUNCTIONS[slot.fn].zone === 'inferior') {
        notes.push(`${FUNCTIONS[slot.fn].label} opcional omitido: sesión moderada por otros deportes`);
        continue;
      }
      const prevId = prevByFn.get(slot.fn)?.[k];
      const sel = selectForSlot(slot, ctx, prevId, `${input.userId ?? 'anon'}|${input.planVersion ?? 1}|${t.key}|${i}|${slot.fn}|${k}`);
      if (!sel) {
        if (!slot.optional) {
          const msg = `${t.name}: sin ejercicio válido para "${FUNCTIONS[slot.fn].label}" (filtros de seguridad/equipo)`;
          notes.push(msg);
          warnings.push(msg);
        }
        continue;
      }
      fnCount.set(slot.fn, k + 1);
      ctx.sessionPicks.push(sel.ex);
      picks.push({ sel, p: prescribe(sel.ex, slot, userLevel, input.goal) });
    }

    // 10) Presupuesto temporal: preservar lo principal; reducir dosis
    // secundaria antes que eliminar; no convertir en circuito.
    const timeNotes = fitToBudget(picks, budget);
    // Sin exceso de ejercicios: se recortan opcionales no prioritarios.
    const cap = MAX_EXERCISES[userLevel];
    for (let j = picks.length - 1; j >= 0 && picks.length > cap; j--) {
      if (picks[j].sel.slot.optional && !picks[j].sel.slot.priorityCore) {
        notes.push(`Omitido para no exceder ${cap} ejercicios: ${picks[j].sel.ex.name}`);
        picks.splice(j, 1);
      }
    }
    timeNotes.push(...fillDose(picks, budget, userLevel));
    notes.push(...timeNotes);
    const items = picks.map(toTimed);
    const seconds = sessionSeconds(items);
    if (seconds > minutes * 60 * 1.05) warnings.push(`${t.name}: estimada en ${Math.round(seconds / 60)} min para un presupuesto de ${minutes} min`);

    picks.forEach(pk => weekPicks.push(pk.sel.ex));
    const hasPrincipal = picks.some(pk => pk.sel.slot.role === 'principal');
    const exercises = picks.map((pk, idx) => {
      const essential = pk.sel.slot.role === "principal" || !!pk.sel.slot.priorityCore
        || (!hasPrincipal && idx === 0);
      const trimmed = timeNotes.some(n => n.includes(pk.sel.ex.name));
      return buildExercise(pk.sel, pk.p, input, userLevel, trimmed ? 'dosis ajustada al tiempo' : 'OK', essential, equipmentNote);
    });

    sessions.push({
      id: crypto.randomUUID(),
      sessionNumber: startFrom + i,
      name: t.name,
      targetMuscles: t.targetMuscles,
      duration: minutes,
      exercises,
      status: i === 0 ? 'available' : 'locked',
      dayOfWeek: input.customDays?.[i] ?? i,
      templateKey: t.key,
      motorTrace: {
        split: split.name,
        splitReason: split.reason,
        sessionRole: roles[i],
        estimatedMinutes: Math.round(seconds / 60),
        budgetMinutes: minutes,
        notes: [...(i === 0 ? planNotes : []), ...notes],
      },
    });
  });

  // 11) Validación semanal: cobertura mínima (avisa, no parchea en silencio).
  if (validate) warnings.push(...validateWeek(sessions, days));
  return { sessions, split: split.name, splitReason: split.reason, warnings };
}

// ── Sesión puntual pedida por el Coach (ARCH-COACH-001) ──────────────
// El Coach no inventa rutinas: elige un enfoque y el Motor construye la
// sesión con los mismos filtros, scoring, dosis y presupuesto de tiempo.
export const SESSION_FOCUS: Record<string, string> = {
  fullA: 'Cuerpo completo (sentadilla, empuje y tirón horizontal)',
  fullB: 'Cuerpo completo (bisagra, tirón vertical, empuje inclinado)',
  pechoTriceps: 'Pecho y tríceps',
  espaldaBiceps: 'Espalda y bíceps',
  piernaHombro: 'Pierna y hombro',
  push: 'Empuje: pecho, hombro, tríceps',
  pull: 'Tirón: espalda, bíceps, deltoide posterior',
  legs: 'Pierna completa',
  torsoA: 'Torso (pecho y espalda horizontal)',
  torsoB: 'Torso (espalda vertical y pecho inclinado)',
  piernaA: 'Pierna con énfasis en cuádriceps',
  piernaB: 'Pierna con énfasis en glúteo e isquios',
};

export function generateFocusSession(input: MotorInput, focus: string): PlanResult | null {
  if (!TEMPLATES[focus]) return null;
  const split: SplitDef = { name: 'Sesión puntual', reason: `Pedida al Coach: ${SESSION_FOCUS[focus] ?? focus}`, sessions: [focus] };
  const result = buildPlan({ ...input, customDays: undefined }, split, false);
  return result.sessions[0]?.exercises.length ? result : null;
}

/** Duración en minutos → valor de workoutDuration que entiende el Motor. */
export function durationFromMinutes(minutes?: number): string {
  if (!minutes) return '45min';
  return minutes <= 35 ? '30min' : minutes >= 55 ? '1hour' : '45min';
}

export function generatePlan(input: MotorInput): WeeklySession[] {
  return generatePlanWithTrace(input).sessions;
}

/** 3-4 días: las 2 estructuras válidas (ninguna degradada). Resto: una. */
export function generatePlanOptions(input: MotorInput): WeeklySession[][] {
  const count = planOptionCount(input.daysPerWeek);
  return Array.from({ length: count }, (_, i) => generatePlan({ ...input, planOption: i }));
}

function toTimed({ sel, p }: { sel: Selection; p: Prescription }): TimedItem {
  return { ex: sel.ex, sets: p.sets, restSeconds: p.restSeconds, perSide: p.perSide, unit: p.unit, target: p.target };
}

function indirectSignal(picks: { sel: Selection; p: Prescription }[], muscleKey: string): 'bajo' | 'medio' | 'alto' {
  let total = 0;
  for (const { sel, p } of picks) {
    for (const s of sel.ex.secondaryMuscles) if (normalize(s.muscle).includes(muscleKey)) total += s.coefficient * p.sets;
  }
  return total >= 6 ? 'alto' : total >= 3 ? 'medio' : 'bajo';
}

function fitToBudget(picks: { sel: Selection; p: Prescription }[], budget: number): string[] {
  const notes: string[] = [];
  const over = () => sessionSeconds(picks.map(toTimed)) > budget;
  const protectedPick = (pk: { sel: Selection }) => pk.sel.slot.role === "principal" || !!pk.sel.slot.priorityCore;
  // 1) quitar opcionales no prioritarios (desde el final)
  for (let i = picks.length - 1; i >= 0 && over(); i--) {
    if (picks[i].sel.slot.optional && !protectedPick(picks[i])) {
      notes.push(`Omitido por tiempo: ${picks[i].sel.ex.name}`);
      picks.splice(i, 1);
    }
  }
  // 2) bajar dosis de complementarios y luego secundarios (mín. 2 series)
  for (const role of ['complementario', 'secundario'] as SlotRole[]) {
    for (let i = picks.length - 1; i >= 0 && over(); i--) {
      const pk = picks[i];
      if (pk.sel.slot.role === role && !protectedPick(pk) && pk.p.sets > 2) {
        pk.p.sets -= 1;
        notes.push(`Dosis reducida por tiempo: ${pk.sel.ex.name} a ${pk.p.sets} series`);
      }
    }
  }
  // 3) quitar complementarios no esenciales
  for (let i = picks.length - 1; i >= 0 && over(); i--) {
    if (picks[i].sel.slot.role === 'complementario' && !protectedPick(picks[i])) {
      notes.push(`Omitido por tiempo: ${picks[i].sel.ex.name}`);
      picks.splice(i, 1);
    }
  }
  // 4) quitar secundarios no prioritarios (los principales nunca)
  for (let i = picks.length - 1; i >= 0 && over(); i--) {
    if (picks[i].sel.slot.role === 'secundario' && !protectedPick(picks[i])) {
      notes.push(`Omitido por tiempo: ${picks[i].sel.ex.name}`);
      picks.splice(i, 1);
    }
  }
  // 5) último recurso: principales/prioritarios a 2 series
  for (let i = picks.length - 1; i >= 0 && over(); i--) {
    if (picks[i].p.sets > 2) {
      picks[i].p.sets -= 1;
      notes.push(`Dosis reducida por tiempo: ${picks[i].sel.ex.name} a ${picks[i].p.sets} series`);
    }
  }
  return notes;
}

/**
 * Sesión demasiado corta para el tiempo declarado: completar dosis con
 * prudencia (una serie cada vez, lo principal primero) hasta ~80 % del
 * presupuesto. "Conservadora pero suficiente para que la sesión se sienta
 * completa" — nunca se añaden ejercicios por rellenar.
 */
function fillDose(picks: { sel: Selection; p: Prescription }[], budget: number, userLevel: 'beginner' | 'advanced'): string[] {
  const notes: string[] = [];
  const maxSets: Record<SlotRole, number> = userLevel === 'beginner'
    ? { principal: 4, secundario: 4, complementario: 3 }
    : { principal: 5, secundario: 4, complementario: 4 };
  const seconds = () => sessionSeconds(picks.map(toTimed));
  let changed = true;
  while (changed && seconds() < budget * MIN_FILL) {
    changed = false;
    for (const role of ['principal', 'secundario', 'complementario'] as SlotRole[]) {
      for (const pk of picks) {
        if (seconds() >= budget * MIN_FILL) break;
        if (pk.sel.slot.role !== role || pk.p.sets >= maxSets[role]) continue;
        pk.p.sets += 1;
        if (seconds() > budget) { pk.p.sets -= 1; continue; }
        changed = true;
        notes.push(`Dosis completada: ${pk.sel.ex.name} a ${pk.p.sets} series`);
      }
    }
  }
  return notes;
}

function validateWeek(sessions: WeeklySession[], days: number): string[] {
  const fns = new Set(sessions.flatMap(s => s.exercises.map(e => e.slotFunction)));
  const has = (...f: SlotFn[]) => f.some(x => fns.has(x));
  const out: string[] = [];
  if (!has('empuje_horizontal', 'empuje_inclinado')) out.push('Semana sin empuje de pecho');
  if (!has('tiron_vertical', 'tiron_horizontal')) out.push('Semana sin tirón de espalda');
  if (!has('dominante_rodilla', 'unilateral_rodilla')) out.push('Semana sin trabajo dominante de rodilla');
  if (!has('bisagra', 'extension_cadera')) out.push('Semana sin bisagra/extensión de cadera');
  if (days >= 3 && !has('empuje_vertical', 'deltoide_lateral')) out.push('Semana sin trabajo de hombro');
  return out;
}

// ── Catálogo (búsquedas del Coach) ───────────────────────────────────
export function motorCatalog(): Exercise[] {
  return LIBRARY.map(ex => {
    const role: SlotRole = ex.compatibleRoles[0] === 'Principal' ? 'principal' : ex.compatibleRoles.includes('Principal') ? 'secundario' : 'complementario';
    const slot: SlotDef = { fn: functionOf(ex), role, optional: false };
    const sel: Selection = { ex, slot, score: 0, alternative: null, redundancy: '—', history: 'catálogo', reason: 'Entrada de catálogo' };
    return buildExercise(sel, prescribe(ex, slot, 'beginner'), {} as MotorInput, 'beginner', 'OK', role === 'principal', 'catálogo');
  });
}

// ── Adaptación diaria: Session Instance ≠ Plan Base (sec. 10) ────────
export interface DailyAdapterInput {
  energy: EnergyLevel;
  minutesAvailable?: number;
}

function roleOf(e: Exercise): SlotRole {
  if (e.slotRole) return e.slotRole;
  const lib = e.libraryId ? libraryById.get(e.libraryId) : undefined;
  return lib?.compatibleRoles[0] === 'Principal' ? 'principal' : 'complementario';
}
const isEssential = (e: Exercise) => e.essential ?? roleOf(e) === 'principal';

function withSets(e: Exercise, sets: number, extraCode?: string): Exercise {
  const reps = Array.from({ length: sets }, (_, i) => e.reps[i] ?? e.reps[e.reps.length - 1] ?? 10);
  return { ...e, sets, reps, reasonCodes: extraCode ? [...(e.reasonCodes ?? []), extraCode] : e.reasonCodes };
}

const relaxRir = (e: Exercise): Exercise =>
  e.rirTarget ? { ...e, rirTarget: [e.rirTarget[0] + 1, e.rirTarget[1] + 1] } : e;

function exerciseTimed(e: Exercise): TimedItem {
  const lib = e.libraryId ? libraryById.get(e.libraryId) : undefined;
  const ex = lib ?? ({ executionTimeCost: 'Medio', setupCost: 'Medio', block: e.targetMuscle } as LibraryExercise);
  return { ex, sets: e.sets, restSeconds: e.restSeconds, perSide: !!e.perSide, unit: e.repUnit ?? 'reps', target: e.reps[0] ?? 10 };
}

export function estimateSessionMinutes(session: WeeklySession): number {
  return Math.round(sessionSeconds(session.exercises.map(exerciseTimed)) / 60);
}

/**
 * Energía baja: mantener estructura y ejercicios; reducir dosis/esfuerzo.
 * Energía muy baja: versión esencial más corta. Energía alta: no añadir
 * trabajo. Poco tiempo: sesión esencial (MOTOR-ESSENTIAL-042).
 * Nunca muta el Plan Base: devuelve una copia (Session Instance).
 */
export function adaptSessionForToday(session: WeeklySession, adapt: DailyAdapterInput): WeeklySession {
  let exercises = session.exercises.map(e => ({ ...e }));

  if (adapt.energy === 'low') {
    exercises = exercises.map(e => {
      const r = roleOf(e);
      if (r === 'principal' || isEssential(e)) return relaxRir(withSets(e, e.sets, 'ENERGY_LOW_DOSE'));
      return relaxRir(withSets(e, Math.max(r === 'secundario' ? 2 : 1, e.sets - 1), 'ENERGY_LOW_DOSE'));
    });
  } else if (adapt.energy === 'very-low') {
    const kept = exercises.filter(e => isEssential(e) || roleOf(e) === 'secundario');
    exercises = (kept.length ? kept : exercises.slice(0, 1))
      .map(e => relaxRir(withSets(e, Math.max(isEssential(e) ? 2 : 1, e.sets - 1), 'ENERGY_VERY_LOW_ESSENTIAL')));
  } else if (adapt.energy === 'high') {
    exercises = exercises.map(e => ({ ...e, reasonCodes: [...(e.reasonCodes ?? []), 'ENERGY_HIGH_PLANNED_PROGRESSION'] }));
  }

  if (adapt.minutesAvailable) {
    const budget = adapt.minutesAvailable * 60 * BUDGET_SHARE;
    const over = () => sessionSeconds(exercises.map(exerciseTimed)) > budget;
    const order: ((e: Exercise) => boolean)[] = [
      e => roleOf(e) === 'complementario' && !isEssential(e),
      e => roleOf(e) === 'secundario' && !isEssential(e),
    ];
    // Primero bajar dosis de lo no esencial, luego quitarlo; lo esencial se queda.
    for (const match of order) {
      for (let i = exercises.length - 1; i >= 0 && over(); i--) {
        if (match(exercises[i]) && exercises[i].sets > 2) exercises[i] = withSets(exercises[i], exercises[i].sets - 1, 'TIME_ESSENTIAL_DOSE');
      }
      for (let i = exercises.length - 1; i >= 0 && over(); i--) {
        if (match(exercises[i])) exercises.splice(i, 1);
      }
    }
    for (let i = exercises.length - 1; i >= 0 && over(); i--) {
      if (exercises[i].sets > 2) exercises[i] = withSets(exercises[i], exercises[i].sets - 1, 'TIME_ESSENTIAL_DOSE');
    }
  }

  const adapted: WeeklySession = { ...session, id: crypto.randomUUID(), exercises };
  adapted.duration = adapt.minutesAvailable
    ? Math.min(adapt.minutesAvailable, Math.max(5, estimateSessionMinutes(adapted)))
    : session.duration;
  return adapted;
}

// ── Sustitución (Nivel 2: cambia el ejercicio, mantiene la función) ──
export interface SubstitutionResult {
  session: WeeklySession;
  substitute: Exercise | null;
  /** Para persistir en el perfil cuando el motivo es preferencia. */
  preferenceUpdate?: { disliked: string };
  note: string;
}

/**
 * - 'equipo_ocupado': sustitución temporal; NO cambia el equipamiento permanente (MOTOR-TEMP-EQUIP-048).
 * - 'no_gusta': cambia si existe alternativa suficientemente buena y registra la preferencia.
 * - Molestia NO usa esta vía: Safety Flow sin sustitución automática (SAFE-001).
 */
export function substituteExercise(
  session: WeeklySession,
  exerciseId: string,
  reason: 'equipo_ocupado' | 'no_gusta',
  input: Partial<MotorInput> = {},
): SubstitutionResult {
  const idx = session.exercises.findIndex(e => e.id === exerciseId);
  const current = session.exercises[idx];
  const lib = current?.libraryId ? libraryById.get(current.libraryId) : undefined;
  if (!current || !lib) return { session, substitute: null, note: 'Ejercicio no encontrado en la sesión' };

  const fullInput: MotorInput = { daysPerWeek: 3, workoutDuration: '45min', ...input };
  if (reason === 'no_gusta') {
    fullInput.preferences = { ...fullInput.preferences, disliked: [...(fullInput.preferences?.disliked ?? []), lib.id] };
  }
  const slot: SlotDef = { fn: (current.slotFunction as SlotFn) ?? functionOf(lib), role: roleOf(current), optional: false, priority: current.priority };
  const others = session.exercises.filter((_, i) => i !== idx)
    .map(e => (e.libraryId ? libraryById.get(e.libraryId) : undefined)).filter(Boolean) as LibraryExercise[];
  const ctx: Context = {
    input: { ...fullInput, excludedExercises: [...(fullInput.excludedExercises ?? []), lib.id] },
    userLevel: fullInput.level ?? 'beginner', sportLoad: 'ninguna',
    sessionPicks: others, weekPicks: [], previousIds: new Set(), timePressure: true,
  };
  const sel = selectForSlot(slot, ctx, undefined, `sub|${session.id}|${lib.id}`);
  if (!sel) return { session, substitute: null, note: `No hay alternativa válida para ${FUNCTIONS[slot.fn].label}` };

  const p = prescribe(sel.ex, slot, ctx.userLevel, fullInput.goal);
  p.sets = current.sets; // misma dosis: es un cambio de ejercicio, no de programación
  const substitute = buildExercise(
    { ...sel, reason: reason === 'equipo_ocupado' ? 'Sustitución temporal: equipo ocupado' : 'Sustitución por preferencia del usuario' },
    p, fullInput, ctx.userLevel, 'recalculado tras sustitución', !!current.essential,
    reason === 'equipo_ocupado' ? 'temporal (no cambia tu gimnasio)' : 'disponible',
  );
  substitute.reasonCodes = [...(substitute.reasonCodes ?? []), reason === 'equipo_ocupado' ? 'TEMP_EQUIPMENT_SUBSTITUTION' : 'PREFERENCE_SUBSTITUTION'];
  const exercises = [...session.exercises];
  exercises[idx] = substitute;
  const updated: WeeklySession = { ...session, exercises };
  updated.duration = Math.max(session.duration, estimateSessionMinutes(updated)); // MOTOR-RECALC-001
  return {
    session: updated,
    substitute,
    preferenceUpdate: reason === 'no_gusta' ? { disliked: lib.id } : undefined,
    note: `${current.name} → ${substitute.name}`,
  };
}

// ── Modo debug (sec. 16) ─────────────────────────────────────────────
export function explainSession(session: WeeklySession): string {
  const t = session.motorTrace;
  const lines = [
    `## ${session.name}${t ? ` — ${t.sessionRole}, ~${t.estimatedMinutes}/${t.budgetMinutes} min` : ''}`,
    ...(t ? [`Split: ${t.split} (${t.splitReason})`, ...t.notes.map(n => `Nota: ${n}`)] : []),
  ];
  for (const e of session.exercises) {
    const tr = e.motorTrace;
    lines.push(`- ${e.name} — ${e.sets}x${e.repRange?.join('-') ?? e.reps[0]}${e.perSide ? '/lado' : ''}${e.repUnit === 'seconds' ? ' s' : ''} RIR ${e.rirTarget?.join('-') ?? '?'}${e.suggestedWeightKg ? ` · ~${e.suggestedWeightKg} kg` : ''}${e.essential ? ' · esencial' : ''}`);
    if (tr) {
      lines.push(`    Slot: ${tr.slot} | Hard Filters: ${tr.hardFilters} | Equipo: ${tr.equipment}`);
      lines.push(`    Prioridad: ${tr.priority} | Redundancia: ${tr.redundancy} | Tiempo: ${tr.timeBudget} | Historial: ${tr.history}`);
      lines.push(`    Alternativa: ${tr.alternative ?? '—'} | Score: ${tr.score} | Motivo: ${tr.reason}`);
    }
  }
  return lines.join('\n');
}
