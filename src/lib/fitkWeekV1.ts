// ─────────────────────────────────────────────────────────────────────
// Semana V1: reparto de volumen y ajuste al tiempo (Word del 20/11/2026).
//
// Flujo maestro, pasos 7 y 8: "aplicar volumen + matriz + cobertura
// directa" y "verificar tiempo; optimizar según jerarquía".
//
// Trabaja sobre ejercicios ya elegidos (V1Item). No conoce la Biblioteca
// ni elige ejercicios: eso lo hace fitkMotor.ts. Funciones deterministas.
//
// Jerarquía cuando no cabe todo (Word §5):
//   1-3. Estructura y patrones, objetivo y músculo prioritario: protegidos.
//   5.   Reducir series antes de eliminar trabajo directo.
//   6.   Biserie compatible antes de eliminar trabajo directo (Word §4).
//   7.   Recortar los accesorios menos importantes.
//   El punto 4 (ejercicios eficientes) se aplica al elegir; el 8 (rotación
//   A/B entre semanas) queda anotado para la fase de adaptaciones.
// ─────────────────────────────────────────────────────────────────────
import type { SlotRole } from '@/lib/fitkMotor';
import {
  GROUP_LABEL, LADDER, PRIORITY_BONUS_SETS, TIME_MODEL, VOL_GROUPS,
  type MatrixKey, type MatrixRow, type VolGroup,
} from '@/lib/fitkSpecV1';

/** Lo que cambia de un ejercicio al hacerlo con otro equipo. */
export interface V1Variant {
  name: string;
  row: MatrixRow;
  rest: number;
  exec: number;
  setup: number;
  block: string;
  costlySetup: boolean;
  station: 'portable' | 'cable' | 'fixed';
}

/** Un ejercicio de la semana con lo que el reparto necesita saber de él. */
export interface V1Item {
  key: string;
  name: string;
  /** Posición original en la sesión (desempates). */
  order: number;
  /** Grupo al que da trabajo directo. Sin grupo = sin referencia de volumen en el Word. */
  group?: VolGroup;
  /** Protección: 1 fundamental … 6 extra. */
  keep: number;
  role: SlotRole;
  /** Contribución de cada serie según la matriz. */
  row: MatrixRow;
  sets: number;
  min: number;
  max: number;
  /** Descanso entre series, en segundos. */
  rest: number;
  /** Trabajo de una serie, en segundos (ya incluye los dos lados si es unilateral). */
  exec: number;
  setup: number;
  /** Bloque de la Biblioteca: cambiar dentro del mismo bloque cuesta menos. */
  block: string;
  costlySetup: boolean;
  /** Pertenece al músculo prioritario del usuario. */
  priority: boolean;
  /** Solo entra si el grupo no alcanza su referencia con los ejercicios anteriores. */
  optional: boolean;
  active: boolean;
  /** Apto para biserie: accesorio con buena aptitud de densidad en su ficha. */
  pairable: boolean;
  station: 'portable' | 'cable' | 'fixed';
  /** Clave de biserie compartida con el ejercicio contiguo. */
  superset?: string;
  /**
   * Mismo slot con equipo que se puede llevar al lado (mancuernas, peso
   * corporal). Solo se usa si hace falta para montar una biserie.
   */
  pairVariant?: V1Variant;
  usingVariant?: boolean;
}

export type Reference = Record<VolGroup, [number, number]>;

export interface GroupCoverage {
  /** Series en las que el grupo es protagonista (peso 1). */
  direct: number;
  /** Volumen equivalente: series × peso de la matriz. */
  equivalent: number;
  low: number;
  high: number;
}

// ── Tiempo ───────────────────────────────────────────────────────────
type Unit = V1Item[]; // un ejercicio, o dos en biserie

function unitsOf(items: V1Item[]): Unit[] {
  const active = items.filter(i => i.active);
  const out: Unit[] = [];
  for (let i = 0; i < active.length; i++) {
    const a = active[i];
    const b = active[i + 1];
    if (a.superset && b?.superset === a.superset) { out.push([a, b]); i++; } else out.push([a]);
  }
  return out;
}

function unitSeconds(unit: Unit): number {
  const [a, b] = unit;
  if (!b) return a.setup + a.sets * a.exec + Math.max(0, a.sets - 1) * a.rest;
  // Biserie: una serie de cada seguida y un solo descanso por ronda.
  const rounds = Math.min(a.sets, b.sets);
  const rest = Math.max(a.rest, b.rest);
  const longer = a.sets >= b.sets ? a : b;
  const extra = Math.abs(a.sets - b.sets);
  return a.setup + b.setup
    + rounds * (a.exec + b.exec + TIME_MODEL.supersetSwitchSeconds)
    + Math.max(0, rounds - 1) * rest
    + extra * (rest + longer.exec);
}

/** Duración estimada de la sesión, con transiciones y margen de imprevistos. */
export function sessionSeconds(items: V1Item[]): number {
  const units = unitsOf(items);
  const t = TIME_MODEL.transitionSeconds;
  let total = 0;
  units.forEach((unit, i) => {
    total += unitSeconds(unit);
    if (i === 0) return;
    const prev = units[i - 1][units[i - 1].length - 1];
    const next = unit[0];
    // El cambio de ejercicio sustituye al descanso tras la última serie.
    total += next.block === prev.block ? t.sameBlock : next.costlySetup ? t.costly : t.normal;
  });
  return total + Math.min(total * TIME_MODEL.marginShare, TIME_MODEL.marginMaxSeconds);
}

// ── Cobertura ────────────────────────────────────────────────────────
export function weekCoverage(week: V1Item[][], reference: Reference): Record<VolGroup, GroupCoverage> {
  const cov = {} as Record<VolGroup, GroupCoverage>;
  for (const g of VOL_GROUPS) cov[g] = { direct: 0, equivalent: 0, low: reference[g][0], high: reference[g][1] };
  for (const item of week.flat()) {
    if (!item.active) continue;
    for (const g of VOL_GROUPS) {
      const weight = item.row[g] ?? 0;
      if (!weight) continue;
      cov[g].equivalent += weight * item.sets;
      if (weight >= 1) cov[g].direct += item.sets;
    }
  }
  return cov;
}

/** Cuánto del mínimo de referencia recibe ya el grupo, contando el trabajo indirecto. */
function ratio(cov: Record<VolGroup, GroupCoverage>, group: VolGroup | undefined, minus = 0): number {
  if (!group) return Number.POSITIVE_INFINITY; // sin referencia en el Word
  const c = cov[group];
  const equivalent = c.equivalent - minus;
  if (c.low <= 0) return equivalent > 0 ? Number.POSITIVE_INFINITY : 0;
  return equivalent / c.low;
}

const fmt = (n: number) => (Math.round(n * 10) / 10).toString().replace('.', ',');

/** Orden lexicográfico: ¿la clave `a` va antes que `b`? */
function comesFirst(a: number[], b: number[]): boolean {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return a[i] < b[i];
  }
  return false;
}

/** El mayor según una clave lexicográfica (empates: el primero). */
function maxBy<T>(list: T[], key: (item: T) => number[]): T {
  let best = list[0];
  let bestKey = key(best);
  for (const item of list.slice(1)) {
    const k = key(item);
    if (comesFirst(bestKey, k)) { best = item; bestKey = k; }
  }
  return best;
}

// ── Paso 7 del flujo: tabla ideal, sin mirar el reloj ────────────────
/**
 * Reparte el mínimo de referencia de cada grupo entre sus ejercicios, de
 * más a menos importante. Un ejercicio opcional solo se abre si los
 * anteriores, a tope de series, no alcanzan la referencia ("añadir una
 * serie a un ejercicio existente antes de introducir otro").
 */
export function distributeIdeal(week: V1Item[][], reference: Reference): void {
  const all = week.flat();
  const byImportance = (a: V1Item, b: V1Item) => a.keep - b.keep || all.indexOf(a) - all.indexOf(b);
  for (const item of all) {
    if (!item.group) { item.active = !item.optional; item.sets = item.min; }
  }
  // Dos pasadas: la segunda descuenta las series directas que un grupo recibe
  // de ejercicios de otro (p. ej. el face pull también es espalda alta).
  for (let pass = 0; pass < 2; pass++) {
    for (const group of VOL_GROUPS) {
      const slots = all.filter(i => i.group === group).sort(byImportance);
      const cross = pass === 0 ? 0 : all
        .filter(i => i.active && i.group !== group && (i.row[group] ?? 0) >= 1)
        .reduce((sum, i) => sum + i.sets, 0);
      const target = Math.max(0, reference[group][0] - cross);
      let caps = 0;
      for (const s of slots) {
        if (!s.optional) { s.active = true; caps += s.max; }
      }
      for (const s of slots) {
        if (!s.optional) continue;
        // No se abre un ejercicio por menos series de las que tiene sentido hacerle.
        s.active = target - caps >= s.min;
        if (s.active) caps += s.max;
      }
      const active = slots.filter(s => s.active);
      for (const s of active) s.sets = s.min;
      let sum = active.reduce((acc, s) => acc + s.sets, 0);
      while (sum < target) {
        // La serie va al ejercicio que menos tiene; a igualdad, al más importante.
        const next = active.filter(s => s.sets < s.max).sort((a, b) => a.sets - b.sets || byImportance(a, b))[0];
        if (!next) break;
        next.sets++;
        sum++;
      }
    }
  }
}

// ── Biseries ─────────────────────────────────────────────────────────
const protagonists = (row: MatrixRow) =>
  (Object.keys(row) as MatrixKey[]).filter(k => k !== 'espalda' && (row[k] ?? 0) >= 1);

/** Un ejercicio no debe cansar al protagonista del otro. */
const clashes = (a: V1Item, b: V1Item) => protagonists(a.row).some(k => (b.row[k] ?? 0) >= 0.5);

/** No se ocupan dos estaciones fijas a la vez, salvo dos poleas. */
const stationsFit = (a: V1Item, b: V1Item) =>
  a.station === 'portable' || b.station === 'portable' || (a.station === 'cable' && b.station === 'cable');

/** Compatibles por músculos y aptitud; el equipo se resuelve aparte (puede pedir una variante). */
export const canPair = (a: V1Item, b: V1Item) =>
  a.pairable && b.pairable && !a.superset && !b.superset && !clashes(a, b) && !clashes(b, a);

/**
 * Quién debe cambiar de equipo para que la pareja sea practicable:
 * 'none' si ya lo es, el ejercicio que cambia, o null si no hay forma.
 */
function equipmentFix(a: V1Item, b: V1Item): 'none' | V1Item | null {
  if (stationsFit(a, b)) return 'none';
  if (b.pairVariant && !b.usingVariant) return b;
  if (a.pairVariant && !a.usingVariant) return a;
  return null;
}

function switchToVariant(item: V1Item): { from: string; to: string } {
  const from = item.name;
  Object.assign(item, item.pairVariant, { usingVariant: true });
  return { from, to: item.name };
}

const pairCount = (items: V1Item[]) => new Set(items.filter(i => i.active && i.superset).map(i => i.superset)).size;

function placeAfter(items: V1Item[], a: V1Item, b: V1Item): void {
  items.splice(items.indexOf(b), 1);
  items.splice(items.indexOf(a) + 1, 0, b);
}

interface Pairing { a: V1Item; b: V1Item; /** Ejercicio que cambió de equipo para poder emparejar. */ swapped?: { from: string; to: string } }

/**
 * Empareja los dos accesorios compatibles que más tiempo ahorran. Si la
 * pareja ocupa dos estaciones fijas, uno pasa a su variante de equipo
 * ("elegir ejercicios eficientes", Word §5 punto 4).
 */
function pairBest(items: V1Item[], sessionIndex: number): Pairing | null {
  const candidates = items.filter(i => i.active && i.pairable && !i.superset);
  const before = sessionSeconds(items);
  let best: { a: V1Item; b: V1Item; fix: V1Item | null; saved: number } | null = null;
  for (let i = 0; i < candidates.length; i++) {
    for (let j = i + 1; j < candidates.length; j++) {
      const a = candidates[i];
      const b = candidates[j];
      if (!canPair(a, b)) continue;
      const fix = equipmentFix(a, b);
      if (fix === null) continue;
      const trial = items.map(x => ({ ...x }));
      const ta = trial[items.indexOf(a)];
      const tb = trial[items.indexOf(b)];
      if (fix !== 'none') switchToVariant(fix === a ? ta : tb);
      ta.superset = tb.superset = 'trial';
      placeAfter(trial, ta, tb);
      // A igualdad de ahorro, mejor la pareja que no obliga a cambiar de equipo.
      const saved = before - sessionSeconds(trial) - (fix === 'none' ? 0 : 1);
      if (saved > 0 && (!best || saved > best.saved)) best = { a, b, fix: fix === 'none' ? null : fix, saved };
    }
  }
  if (!best) return null;
  const swapped = best.fix ? switchToVariant(best.fix) : undefined;
  const key = `S${sessionIndex + 1}-${pairCount(items) + 1}`;
  best.a.superset = best.b.superset = key;
  placeAfter(items, best.a, best.b);
  return { a: best.a, b: best.b, swapped };
}

function deactivate(items: V1Item[], item: V1Item): void {
  item.active = false;
  if (!item.superset) return;
  for (const other of items) if (other !== item && other.superset === item.superset) other.superset = undefined;
  item.superset = undefined;
}

// ── Paso 8 del flujo: verificar tiempo y optimizar según jerarquía ───
export interface FitOptions {
  budgetSeconds: number;
  reference: Reference;
  /** Registro de ajustes por sesión, en el orden en que se aplican. */
  log: string[][];
}

function fitSession(week: V1Item[][], s: number, opts: FitOptions): void {
  const items = week[s];
  const log = opts.log[s];
  const seconds = () => sessionSeconds(items);
  const minutes = () => Math.round(seconds() / 60);
  if (seconds() <= opts.budgetSeconds) return;

  const idealSets = items.filter(i => i.active).reduce((sum, i) => sum + i.sets, 0);
  log.push(`Con el mínimo de referencia de cada grupo serían ${idealSets} series y ~${minutes()} min; el techo es ${Math.round(opts.budgetSeconds / 60)} min.`);

  let noPairLogged = false;
  for (let guard = 0; guard < 300 && seconds() > opts.budgetSeconds; guard++) {
    const cov = weekCoverage(week, opts.reference);
    const active = items.filter(i => i.active);
    const covered = (i: V1Item) => (i.group
      ? `${GROUP_LABEL[i.group]} recibe ${fmt(cov[i.group].equivalent)} series equivalentes frente a ${cov[i.group].low} de referencia`
      : 'sin referencia de volumen en el Word');
    // Ejercicio adicional de un grupo que ya tiene otro ejercicio directo en la semana.
    const isSpare = (i: V1Item) => i.keep >= 6 && !!i.group
      && week.flat().some(o => o !== i && o.active && (o.row[i.group as VolGroup] ?? 0) >= 1);
    const reduce = (pool: V1Item[], label: string): boolean => {
      if (!pool.length) return false;
      const pick = maxBy(pool, i => [ratio(cov, i.group), i.keep, i.order]);
      pick.sets--;
      log.push(`${label}: ${pick.name} baja de ${pick.sets + 1} a ${pick.sets} series (${covered(pick)}).`);
      return true;
    };
    const remove = (pool: V1Item[], label: string): boolean => {
      if (!pool.length) return false;
      const pick = maxBy(pool, i => [i.keep, ratio(cov, i.group, i.sets * (i.group ? i.row[i.group] ?? 0 : 0)), i.order]);
      const after = pick.group ? cov[pick.group].equivalent - pick.sets * (pick.row[pick.group] ?? 0) : 0;
      const why = !pick.group ? 'sin referencia de volumen en el Word'
        : after >= cov[pick.group].low ? `${GROUP_LABEL[pick.group]} sigue cubierto por trabajo indirecto: ${fmt(after)} de ${cov[pick.group].low}`
        : `${GROUP_LABEL[pick.group]} se queda en ${fmt(after)} de ${cov[pick.group].low}; candidato a rotación A/B`;
      deactivate(items, pick);
      log.push(`${label}: sale ${pick.name} (${why}).`);
      return true;
    };

    // 5. Reducir series antes de eliminar trabajo directo. Las series se
    // quitan al grupo que más trabajo recibe; su ejercicio adicional puede
    // salir entero mientras el grupo conserve otro ejercicio directo.
    const afterMove = (i: V1Item) => (i.group
      ? cov[i.group].equivalent - (i.sets > i.min ? 1 : i.sets) * (i.row[i.group] ?? 0)
      : 0);
    const inZone = (i: V1Item) => !!i.group && afterMove(i) >= cov[i.group].low - LADDER.zoneToleranceSets;
    const reduceSeries = (pool: V1Item[], label: string): boolean => {
      if (!pool.length) return false;
      const pick = maxBy(pool, i => [ratio(cov, i.group), i.keep, i.order]);
      if (pick.sets > pick.min) {
        pick.sets--;
        log.push(`${label}: ${pick.name} baja de ${pick.sets + 1} a ${pick.sets} series (${covered(pick)}).`);
      } else {
        deactivate(items, pick);
        log.push(`${label}: sale ${pick.name}, segundo ejercicio de ${GROUP_LABEL[pick.group as VolGroup]}, que conserva su trabajo directo (${covered(pick)}).`);
      }
      return true;
    };
    const moves = active.filter(i => !i.priority && (i.sets > i.min || isSpare(i)));
    // a) Mientras el grupo siga en su zona de referencia (solapamiento útil).
    if (reduceSeries(moves.filter(inZone), 'Paso 5, reducir series dentro de la referencia')) continue;
    // c) antes que b) solo si así se configura.
    if (!LADDER.supersetsBeforeDeepCuts && reduceSeries(moves, 'Paso 5, reducir series por debajo de la referencia')) continue;

    // 6. Antes de eliminar trabajo directo, comprobar si una biserie lo conserva.
    if (pairCount(items) < TIME_MODEL.maxSupersetsPerSession) {
      const before = seconds();
      const pair = pairBest(items, s);
      if (pair) {
        const change = pair.swapped ? `; en lugar de ${pair.swapped.from}, para no ocupar dos aparatos` : '';
        log.push(`Paso 6, biserie: ${pair.a.name} + ${pair.b.name} (ahorra ~${fmt((before - seconds()) / 60)} min sin quitar trabajo${change}).`);
        continue;
      }
      if (!noPairLogged) {
        log.push('Paso 6, biserie: no quedan dos accesorios compatibles para emparejar.');
        noPairLogged = true;
      }
    }

    // c) Series por debajo de la referencia, antes de eliminar trabajo directo.
    if (reduceSeries(moves, 'Paso 5, reducir series por debajo de la referencia')) continue;

    // 7. Recortar los accesorios menos importantes.
    if (remove(active.filter(i => !i.priority && i.keep >= 5), 'Paso 7, recortar accesorios')) continue;

    // Lo que queda son patrones protegidos y prioridad: se admite la tolerancia.
    if (seconds() <= opts.budgetSeconds * (1 + TIME_MODEL.tolerance)) {
      log.push(`Se admite ~${minutes()} min (tolerancia del 10 %): lo que queda son patrones protegidos y la prioridad.`);
      break;
    }

    // Disponibilidad extrema: primero cede la prioridad, después los patrones
    // no fundamentales y, por último, las series de los principales.
    if (reduce(active.filter(i => i.priority && i.sets > i.min), 'Disponibilidad extrema, prioridad')) continue;
    if (remove(active.filter(i => i.priority && i.keep >= 5), 'Disponibilidad extrema, prioridad')) continue;
    if (remove(active.filter(i => i.keep >= 3), 'Disponibilidad extrema, patrón no fundamental')) continue;
    if (reduce(active.filter(i => i.sets > 2), 'Disponibilidad extrema, principales')) continue;
    break;
  }
}

/**
 * "Si sobra tiempo, usarlo solo si hay motivo": volumen pendiente primero y
 * el +1–2 de la prioridad después. Antes una serie a un ejercicio que ya
 * está que abrir otro. Si no hay motivo, la sesión termina antes.
 */
function refill(week: V1Item[][], opts: FitOptions, priorityGroups: VolGroup[]): void {
  for (let guard = 0; guard < 300; guard++) {
    const cov = weekCoverage(week, opts.reference);
    let best: { item: V1Item; s: number; open: boolean; key: number[] } | null = null;
    week.forEach((items, s) => {
      for (const item of items) {
        const group = item.group;
        if (!group) continue;
        const c = cov[group];
        const isPriority = priorityGroups.includes(group);
        const pending = c.low - c.direct;
        const bonus = isPriority && c.direct < c.low + PRIORITY_BONUS_SETS;
        const open = !item.active;
        if (open ? pending < item.min : item.sets >= item.max || !(pending >= 1 || bonus)) continue;
        const snapshot = { active: item.active, sets: item.sets };
        if (open) { item.active = true; item.sets = item.min; } else item.sets++;
        const fits = sessionSeconds(items) <= opts.budgetSeconds;
        item.active = snapshot.active;
        item.sets = snapshot.sets;
        if (!fits) continue;
        // Menor = antes: volumen pendiente, prioridad, grupo más necesitado, ejercicio existente, más protegido.
        const key = [pending >= 1 ? 0 : 1, isPriority ? 0 : 1, ratio(cov, group), open ? 1 : 0, item.keep, s, item.order];
        if (!best || comesFirst(key, best.key)) best = { item, s, open, key };
      }
    });
    if (!best) return;
    const { item, s, open } = best as { item: V1Item; s: number; open: boolean };
    const group = item.group as VolGroup;
    const pending = cov[group].low - cov[group].direct >= 1;
    if (open) { item.active = true; item.sets = item.min; } else item.sets++;
    opts.log[s].push(open
      ? `Cabe en el tiempo: entra ${item.name} con ${item.sets} series (${GROUP_LABEL[group]} por debajo de su referencia).`
      : pending
        ? `Cabe en el tiempo: ${item.name} sube a ${item.sets} series (${GROUP_LABEL[group]} por debajo de su referencia).`
        : `Sobra tiempo: ${item.name} sube a ${item.sets} series (prioridad, +1–2 series).`);
  }
}

/** Ajusta toda la semana al techo de tiempo y deja el registro de cada decisión. */
export function fitWeek(week: V1Item[][], opts: FitOptions, priorityGroups: VolGroup[]): void {
  week.forEach((_, s) => fitSession(week, s, opts));
  refill(week, opts, priorityGroups);
}
