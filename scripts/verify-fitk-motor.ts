// Batería reproducible del Motor Fit-K — Biblioteca v2.17 (FIT-K_Instrucciones sec. 18-19).
// Cada cambio importante del Motor debe volver a pasar estos casos.
// Uso: npx tsx scripts/verify-fitk-motor.ts
import {
  generatePlan, generatePlanWithTrace, generatePlanOptions, planOptionCount, motorCatalog,
  adaptSessionForToday, sessionForMinutes, substituteExercise, estimateSessionMinutes, generateFocusSession, SESSION_FOCUS,
  durationFromMinutes, slotFunctionsOf, canonicalExerciseId, EXTRA_FUNCTIONS, type MotorInput,
} from '../src/lib/fitkMotor';
import { evaluateProgression, returnAdjustment, type ProgressionEntry } from '../src/lib/fitkProgression';
import { handleDiscomfort } from '../src/lib/fitkSafety';
import { planSessionId, secondsUntil } from '../src/lib/activeWorkout';
import { nextGuidedStep, supersetPartner } from '../src/lib/workoutFlow';
import { SPECIAL_STATIONS, VOLUME_REFERENCE, matrixOf } from '../src/lib/fitkSpecV1';
import { LIBRARY, LIBRARY_META, LEGACY_ID_ALIASES, MUSCLES, libraryById, libraryPromptSummary } from '../src/lib/fitkLibrary';
import type { WeeklySession } from '../src/types/user';

let failures = 0;
let section = '';
function check(label: string, cond: boolean, detail = '') {
  if (!cond) { failures++; console.log(`FAIL [${section}] ${label}${detail ? ` — ${detail}` : ''}`); }
  else console.log(`ok   [${section}] ${label}`);
}
const head = (s: string) => { section = s; console.log(`\n── ${s}`); };

const ids = (plan: WeeklySession[]) => plan.flatMap(s => s.exercises.map(e => e.libraryId));
const fns = (s: WeeklySession) => s.exercises.map(e => e.slotFunction);
const totalSets = (plan: WeeklySession[]) => plan.reduce((a, s) => a + s.exercises.reduce((b, e) => b + e.sets, 0), 0);
const minutes = (d: string) => (d === '30min' ? 30 : d === '1hour' ? 60 : 45);
const base = (o: Partial<MotorInput>): MotorInput => ({
  daysPerWeek: 3, workoutDuration: '45min', level: 'beginner', goal: 'routine',
  weight: 72, height: 176, biologicalProfile: 'male', userId: 'test', ...o,
});

// ── Biblioteca ───────────────────────────────────────────────────────
head('Biblioteca');
check(`v${LIBRARY_META.version} importada con ${LIBRARY.length} fichas únicas`, LIBRARY_META.version === '2.17' && LIBRARY.length === 137 && LIBRARY.length === LIBRARY_META.uniqueExercises);
check('IDs únicos', new Set(LIBRARY.map(e => e.id)).size === LIBRARY.length);
check('importación sin avisos (equipo, niveles, variantes y Resumen cuadran)', LIBRARY_META.warnings.length === 0, LIBRARY_META.warnings.join(' | '));
check('168 variantes y 622 filas de Matriz muscular', LIBRARY_META.variants === 168 && LIBRARY_META.matrixRows === 622);
const muscleCodes = new Set(MUSCLES.map(m => m.code));
check('toda ficha tiene músculo principal (P) en la Matriz', LIBRARY.every(e => e.muscles.some(c => c.level === 'P')));
check('la Matriz solo usa códigos del Diccionario muscular', LIBRARY.every(e => e.muscles.every(c => muscleCodes.has(c.code))));
check('toda ficha cae en exactamente una función de slot', LIBRARY.every(e => slotFunctionsOf(e).length === 1),
  LIBRARY.filter(e => slotFunctionsOf(e).length !== 1).map(e => `${e.id}:${slotFunctionsOf(e).join('+') || '∅'}`).join(', '));
check('equipo parseado: toda ficha tiene al menos una opción', LIBRARY.every(e => e.equipmentOptions.length > 0));
check('solo el cuello es opt-in', LIBRARY.filter(e => e.optIn).every(e => e.block === 'Cuello') && LIBRARY.filter(e => e.block === 'Cuello').every(e => e.optIn));
const catalog = motorCatalog();
check('el catálogo expone las 137 fichas', catalog.length === LIBRARY.length);
check('el resumen del Coach usa la misma Biblioteca', libraryPromptSummary().includes(`${LIBRARY.length} ejercicios`));

// ── 1. 2 días principiante ───────────────────────────────────────────
head('2 días principiante');
const p2 = generatePlanWithTrace(base({ daysPerWeek: 2 }));
check('estructura Full Body A/B', p2.split === 'Full Body A/B');
// Word del 20/11: no hay tope de ejercicios; manda el techo de tiempo.
check('ninguna sesión supera el techo de tiempo', p2.sessions.every(s => (s.motorTrace?.estimatedMinutes ?? 99) <= 45));
check('cada sesión cubre pierna + empuje + tirón', p2.sessions.every(s =>
  fns(s).some(f => ['dominante_rodilla', 'bisagra', 'unilateral_rodilla'].includes(f ?? ''))
  && fns(s).some(f => f?.startsWith('empuje')) && fns(s).some(f => f?.startsWith('tiron'))));

// ── 2. 3 días principiante ───────────────────────────────────────────
head('3 días principiante');
const p3 = generatePlanWithTrace(base({ daysPerWeek: 3 }));
check('split dividido, no Full Body (MOTOR-SPLIT-037)', p3.sessions.every(s => !s.templateKey?.startsWith('full')));
check('sesiones con identidad propia', new Set(p3.sessions.map(s => s.templateKey)).size === 3);
// Word del 20/11: el tiempo es un techo, no una duración que rellenar.
check('ninguna sesión supera el techo (y no se rellena)', p3.sessions.every(s => {
  const m = s.motorTrace?.estimatedMinutes ?? 0;
  return m >= 15 && m <= 45;
}), p3.sessions.map(s => s.motorTrace?.estimatedMinutes).join('/'));

// ── 3. 4 días constante ──────────────────────────────────────────────
head('4 días constante');
const p4 = generatePlanWithTrace(base({ daysPerWeek: 4, level: 'advanced', workoutDuration: '1hour' }));
check('Torso / Pierna x2 por defecto', p4.split === 'Torso / Pierna x2');
const freq = (plan: WeeklySession[], pred: (f: string) => boolean) => plan.filter(s => fns(s).some(f => f && pred(f))).length;
check('pecho, espalda y pierna 2x/semana', freq(p4.sessions, f => f.startsWith('empuje')) >= 2
  && freq(p4.sessions, f => f.startsWith('tiron')) >= 2 && freq(p4.sessions, f => ['dominante_rodilla', 'bisagra'].includes(f)) >= 2);
check('mezcla de tipos de carga (no todo máquina)', new Set(p4.sessions.flatMap(s => s.exercises.map(e => {
  const opt = libraryById.get(e.libraryId ?? '')?.equipmentOptions[0] ?? [];
  return opt[0] ?? 'corporal';
}))).size >= 3);

// ── 4. 5 días prioridad brazos ───────────────────────────────────────
head('5 días prioridad brazos');
const pArms = generatePlan(base({ daysPerWeek: 5, level: 'advanced', workoutDuration: '1hour', priorityMuscle: 'arms' }));
const pNoPri = generatePlan(base({ daysPerWeek: 5, level: 'advanced', workoutDuration: '1hour' }));
const armFn = (f?: string) => f === 'biceps' || f === 'triceps';
check('bíceps y tríceps directos ≥2 sesiones', freq(pArms, f => f === 'biceps') >= 2 && freq(pArms, f => f === 'triceps') >= 2);
check('la prioridad se ve en la programación (más series de brazo que sin prioridad)',
  pArms.flatMap(s => s.exercises).filter(e => armFn(e.slotFunction)).reduce((a, e) => a + e.sets, 0)
  > pNoPri.flatMap(s => s.exercises).filter(e => armFn(e.slotFunction)).reduce((a, e) => a + e.sets, 0));
check('sin volumen absurdo (≤3 ejercicios directos de brazo por sesión)', pArms.every(s => s.exercises.filter(e => armFn(e.slotFunction)).length <= 3));

// ── 5. 4 días prioridad pierna + deporte ─────────────────────────────
head('4 días prioridad pierna + fútbol');
const pSport = generatePlanWithTrace(base({ daysPerWeek: 4, level: 'advanced', priorityMuscle: 'legs', otherSports: ['fútbol'], otherSportsDays: 2 }));
check('sesiones de pierna moderadas por el deporte', pSport.sessions.filter(s => s.templateKey?.startsWith('pierna')).every(s => s.motorTrace?.sessionRole === 'moderada'));
check('no se descuentan series fijas por el deporte (pierna sigue con compuestos)', pSport.sessions.filter(s => s.templateKey?.startsWith('pierna')).every(s => s.exercises.some(e => e.slotRole === 'principal')));
check('sin aislamientos de glúteo redundantes (≤1 por sesión)', pSport.sessions.every(s => s.exercises.filter(e => e.slotFunction === 'abduccion_cadera').length <= 1));
check('todas las sesiones caben en 45 min', pSport.sessions.every(s => (s.motorTrace?.estimatedMinutes ?? 99) <= 45 * 1.05));

// ── 6. 30 min ────────────────────────────────────────────────────────
head('30 minutos');
const p30 = generatePlan(base({ workoutDuration: '30min' }));
check('todas caben en 30 min', p30.every(s => (s.motorTrace?.estimatedMinutes ?? 99) <= 30 * 1.05), p30.map(s => s.motorTrace?.estimatedMinutes).join('/'));
check('se conserva el trabajo principal', p30.every(s => s.exercises.some(e => e.slotRole === 'principal' && e.essential)));

// ── 7. Energía baja / muy baja / alta ────────────────────────────────
head('Energía');
const s0 = p3.sessions[0];
const low = adaptSessionForToday(s0, { energy: 'low' });
check('baja: mismos ejercicios (estructura intacta)', low.exercises.map(e => e.id).join() === s0.exercises.map(e => e.id).join());
check('baja: reduce dosis', low.exercises.reduce((a, e) => a + e.sets, 0) < s0.exercises.reduce((a, e) => a + e.sets, 0));
check('baja: el trabajo principal conserva sus series', low.exercises.filter(e => e.slotRole === 'principal').every(e => e.sets === s0.exercises.find(x => x.id === e.id)?.sets));
check('baja: RIR objetivo más conservador', low.exercises.every((e, i) => (e.rirTarget?.[0] ?? 0) > (s0.exercises[i].rirTarget?.[0] ?? 0)));
const vlow = adaptSessionForToday(s0, { energy: 'very-low' });
check('muy baja: mínimo de 2 ejercicios y 7 series, uno con 4', vlow.exercises.length === 2
  && totalSets([vlow]) >= 7 && vlow.exercises.some(e => e.sets >= 4), vlow.exercises.map(e => `${e.name} ${e.sets}`).join(' + '));
check('muy baja: se queda el trabajo principal', vlow.exercises.some(e => e.slotRole === 'principal' || e.essential));
const vlowShort = adaptSessionForToday(s0, { energy: 'very-low', minutesAvailable: 10 });
check('muy baja con poco tiempo: no baja del mínimo', vlowShort.exercises.length === 2 && totalSets([vlowShort]) >= 7);
const high = adaptSessionForToday(s0, { energy: 'high' });
check('alta: no añade media rutina', high.exercises.length === s0.exercises.length && totalSets([high]) === totalSets([s0]));
check('el Plan Base no se muta', s0.exercises.length === p3.sessions[0].exercises.length && low.id !== s0.id);
check('la versión de hoy recuerda su sesión del plan (para marcarla hecha y reanudarla)', low.baseSessionId === s0.id
  && planSessionId(low) === s0.id && planSessionId(s0) === s0.id
  && adaptSessionForToday(low, { energy: 'very-low' }).baseSessionId === s0.id);
check('el descanso se mide con la hora real de fin', secondsUntil(Date.now() + 90_400) === 91 && secondsUntil(Date.now() - 5_000) === 0);
const time20 = adaptSessionForToday(s0, { energy: 'normal', minutesAvailable: 20 });
check('poco tiempo: sesión esencial cabe y conserva lo esencial', estimateSessionMinutes(time20) <= 20 * 1.05
  && s0.exercises.filter(e => e.essential).every(e => time20.exercises.some(x => x.id === e.id)), `${estimateSessionMinutes(time20)} min`);

// Tiempo elegido para hoy: el Motor rehace la sesión con ese techo.
{
  const input3 = base({ daysPerWeek: 3, workoutDuration: '40min' as never, level: 'advanced', priorityMuscle: 'shoulders' });
  const plan3 = generatePlan(input3);
  const s1 = plan3[2];
  const corto = sessionForMinutes(s1, input3, 25);
  const largo = sessionForMinutes(s1, input3, 75);
  check('tiempo de hoy: menos tiempo, misma sesión y cabe', corto.name === s1.name && corto.baseSessionId === s1.id
    && (corto.motorTrace?.estimatedMinutes ?? 99) <= 25 && corto.duration === 25, `${corto.motorTrace?.estimatedMinutes} min, ${totalSets([corto])} series`);
  check('tiempo de hoy: más tiempo, más trabajo y cabe', largo.name === s1.name && totalSets([largo]) > totalSets([s1])
    && (largo.motorTrace?.estimatedMinutes ?? 99) <= 75, `${totalSets([s1])} → ${totalSets([largo])} series`);
  check('tiempo de hoy: el plan no cambia', plan3[2].exercises.length === s1.exercises.length);
}

// ── 8. Sesión perdida ────────────────────────────────────────────────
head('Sesión perdida');
const week1 = generatePlan(base({ daysPerWeek: 3 }));
const missed = week1.map((s, i) => (i === 1 ? { ...s, status: 'locked' as const } : { ...s, status: 'completed' as const }));
const week2 = generatePlan(base({ daysPerWeek: 3, previousPlan: missed, startFrom: 4 }));
check('no genera deuda: misma dosis semanal', totalSets(week2) === totalSets(week1));
check('no reprograma la semana: misma estructura', week2.map(s => s.templateKey).join() === week1.map(s => s.templateKey).join());

// ── 9. Equipo ocupado ────────────────────────────────────────────────
head('Equipo ocupado');
const target = s0.exercises[0];
const busy = substituteExercise(s0, target.id, 'equipo_ocupado');
check('sustitución temporal con la misma función', !!busy.substitute && busy.substitute.slotFunction === target.slotFunction && busy.substitute.libraryId !== target.libraryId, busy.note);
check('no cambia preferencias ni equipo permanente', busy.preferenceUpdate === undefined);
check('misma dosis (ajuste de ejercicio, no de programación)', busy.substitute?.sets === target.sets);
check('el Plan Base queda intacto', s0.exercises[0].id === target.id);

// ── 10. Cambio de gimnasio ───────────────────────────────────────────
head('Cambio de gimnasio');
const homeEq = ['mancuernas', 'banco', 'banda'];
const home = generatePlanWithTrace(base({ availableEquipment: homeEq }));
check('ningún ejercicio requiere equipo inexistente', home.sessions.every(s => s.exercises.every(e =>
  (libraryById.get(e.libraryId ?? '')?.equipmentOptions ?? []).some(opt => opt.every(x => homeEq.includes(x))))));
check('lo que no se puede cubrir se avisa, no se inventa (GUARD-EQUIPMENT-001)', home.warnings.length > 0 || home.sessions.every(s => s.exercises.length > 0));

// ── 11. No gusta ─────────────────────────────────────────────────────
head('No gusta el ejercicio');
const dislike = substituteExercise(s0, target.id, 'no_gusta');
check('alternativa válida con la misma función', dislike.substitute?.slotFunction === target.slotFunction);
check('se registra la preferencia', dislike.preferenceUpdate?.disliked === target.libraryId);
const withPref = generatePlan(base({ daysPerWeek: 3, preferences: { disliked: [target.libraryId ?? ''] } }));
check('al regenerar no vuelve a aparecer', !ids(withPref).includes(target.libraryId));

// ── 12. Molestia ─────────────────────────────────────────────────────
head('Molestia');
const disc = handleDiscomfort(target);
check('Safety Flow: evento registrado sin diagnóstico ni sustitución automática', disc.event.eventType === 'discomfort'
  && disc.event.temporaryExclusion && /profesional sanitario/.test(disc.message));

// ── 13-15. Progresión y estabilidad ──────────────────────────────────
head('Progresión (hoja Estado Motor)');
const t812: [number, number] = [8, 12];
const ej1: ProgressionEntry[] = [
  { date: '2026-09-01', load: 20, reps: [10, 9, 8], rirReported: [2, 2, 2] },
  { date: '2026-09-08', load: 20, reps: [10, 10, 9], rirReported: [2, 2, 2] },
  { date: '2026-09-15', load: 20, reps: [12, 11, 10], rirReported: [2, 2, 2] },
  { date: '2026-09-22', load: 20, reps: [12, 12, 12], rirReported: [3, 2, 2] },
];
check('EJEMPLO-001 10|10|9: progreso', evaluateProgression(ej1.slice(0, 2), { repRange: t812, rirTarget: [2, 3] }).state === 'progreso');
check('EJEMPLO-001 12|12|12 RIR ok: candidato_subida', evaluateProgression(ej1, { repRange: t812, rirTarget: [2, 3] }).state === 'candidato_subida');
check('12|12|12 a RIR 0 con objetivo RIR 2: no subir', evaluateProgression([...ej1.slice(0, 3), { date: 'x', load: 20, reps: [12, 12, 12], rirReported: [0, 0, 0] }], { repRange: t812, rirTarget: [2, 3] }).state !== 'candidato_subida');
const ej2: ProgressionEntry[] = [
  { date: '2026-09-01', load: 80, reps: [8, 8, 8], rirReported: [2, 2, 2] },
  { date: '2026-09-08', load: 80, reps: [8, 8, 8], rirReported: [2, 2, 2] },
  { date: '2026-09-15', load: 80, reps: [8, 7, 7], rirReported: [1, 1, 1] },
];
check('EJEMPLO-002 sin mejora 2 sesiones: estable (no plateau)', evaluateProgression(ej2.slice(0, 2), { repRange: [6, 15], rirTarget: [2, 3] }).state === 'estable');
check('EJEMPLO-002 caída + esfuerzo mayor: revisar_contexto', evaluateProgression(ej2, { repRange: [6, 15], rirTarget: [2, 3] }).state === 'revisar_contexto');
check('10|7|5: revisar contexto, no cambiar ejercicio', evaluateProgression([{ date: 'x', load: 50, reps: [10, 7, 5] }], { repRange: t812, rirTarget: [2, 3] }).state === 'revisar_contexto');
const flat = Array.from({ length: 6 }, (_, i) => ({ date: `${i}`, load: 60, reps: [9, 9, 9] }));
const pers = evaluateProgression(flat, { repRange: t812, rirTarget: [2, 3] });
check('plateau persistente: intervención mínima (ajuste, no sustitución por defecto)', pers.state === 'plateau' && pers.changeLevel === 'ajuste');

head('8 semanas progresando');
const prog1 = generatePlan(base({ daysPerWeek: 4, level: 'advanced' }));
const history = Object.fromEntries(ids(prog1).map(id => [id ?? '', 'progreso' as const]));
const prog2 = generatePlan(base({ daysPerWeek: 4, level: 'advanced', previousPlan: prog1, exerciseHistory: history, planVersion: 9 }));
check('mantiene los ejercicios que progresan (no rota por calendario)', ids(prog2).join() === ids(prog1).join());
const prog3 = generatePlan(base({ daysPerWeek: 4, level: 'advanced', previousPlan: prog1 }));
check('sin historial, la continuidad también mantiene la semana', ids(prog3).join() === ids(prog1).join());

head('3 semanas sin entrenar');
const ret = returnAdjustment(21);
check('retorno conservador sin reinicio total', ret.loadFactor < 1 && ret.loadFactor >= 0.8);
check('una ausencia corta no ajusta nada', returnAdjustment(5).loadFactor === 1);

// ── Invariantes (sec. 19) ────────────────────────────────────────────
head('Invariantes');
const a = generatePlan(base({ daysPerWeek: 4 }));
const b = generatePlan(base({ daysPerWeek: 4 }));
check('reproducible: misma entrada → mismas decisiones', ids(a).join() === ids(b).join());
const unstableLeg = (p: WeeklySession[]) => p.some(s => s.exercises.some(e => {
  const l = libraryById.get(e.libraryId ?? '');
  return l?.block === 'Pierna' && l.stability !== 'Alta';
}));
const kneeBase = base({ daysPerWeek: 4, level: 'advanced', workoutDuration: '1hour' });
// Control: sin lesión, este perfil SÍ recibe pierna inestable (si no, el test no probaría nada).
check('control: sin lesión aparece pierna inestable', unstableLeg(generatePlan(kneeBase)));
check('Safety: lesión de rodilla nunca recibe pierna inestable', !unstableLeg(generatePlan({ ...kneeBase, injuries: ['dolor de rodilla'] })));
const shoulderCtl = generatePlan({ ...kneeBase, daysPerWeek: 5 });
const shoulderInj = generatePlan({ ...kneeBase, daysPerWeek: 5, injuries: ['manguito rotador del hombro'] });
const pressV = (p: WeeklySession[]) => p.some(s => s.exercises.some(e => e.slotFunction === 'empuje_vertical' || e.slotFunction === 'empuje_inclinado'));
check('control: sin lesión hay press vertical/inclinado', pressV(shoulderCtl));
check('Safety: lesión de hombro elimina press vertical e inclinado', !pressV(shoulderInj));
const excl = generatePlan(base({ daysPerWeek: 4, excludedExercises: ['jalón al pecho', 'chest_machine_press'] }));
check('exclusiones del usuario nunca aparecen', !ids(excl).includes('back_lat_pulldown') && !ids(excl).includes('chest_machine_press'));
check('ningún ejercicio repetido dentro de una sesión', [p2, p3, p4].every(p => p.sessions.every(s => new Set(s.exercises.map(e => e.id)).size === s.exercises.length)));
check('deltoide posterior no ocupa plazas de tirón (MOTOR-COMPLEMENT-018)', [p3, p4].every(p => p.sessions.every(s =>
  s.exercises.every(e => !(e.slotFunction?.startsWith('tiron') && libraryById.get(e.libraryId ?? '')?.block === 'Hombro')))));
const female = generatePlan(base({ daysPerWeek: 4, biologicalProfile: 'female' }));
check('no se infieren prioridades por sexo (mismos ejercicios)', ids(female).join() === ids(a).join());
check('≥3 días nunca usan Full Body como estándar', [3, 4, 5, 6].every(d => generatePlan(base({ daysPerWeek: d })).every(s => !s.templateKey?.startsWith('full'))));
for (const [d, dur] of [[2, '45min'], [3, '1hour'], [4, '30min'], [5, '45min'], [6, '1hour']] as const) {
  const plan = generatePlan(base({ daysPerWeek: d, workoutDuration: dur, level: 'advanced' }));
  check(`${d} días/${dur}: todas las sesiones caben`, plan.every(s => (s.motorTrace?.estimatedMinutes ?? 99) <= minutes(dur) * 1.05), plan.map(s => s.motorTrace?.estimatedMinutes).join('/'));
}
check('cada ejercicio lleva traza de debug', p4.sessions.every(s => s.exercises.every(e => !!e.motorTrace?.reason && !!e.motorTrace.slot)));

// ── Opciones de plan (3-4 días) ──────────────────────────────────────
head('Opciones de plan');
check('2 opciones para 3 y 4 días; 1 para el resto', planOptionCount(3) === 2 && planOptionCount(4) === 2 && [1, 2, 5, 6, 7].every(d => planOptionCount(d) === 1));
const o3 = generatePlanOptions(base({ daysPerWeek: 3 }));
check('las opciones de 3 días son estructuras distintas y ninguna es Full Body', o3.length === 2
  && o3[0].map(s => s.templateKey).join() !== o3[1].map(s => s.templateKey).join()
  && o3.every(p => p.every(s => !s.templateKey?.startsWith('full'))));
const keep = generatePlan(base({ daysPerWeek: 3, previousPlan: o3[1] }));
check('la semana siguiente hereda la estructura elegida', keep.map(s => s.templateKey).join() === o3[1].map(s => s.templateKey).join());

// ── Peso sugerido (perfiles extremos) ────────────────────────────────
head('Peso sugerido');
const flaca = generatePlan(base({ daysPerWeek: 4, weight: 42, height: 158, biologicalProfile: 'female' }));
const grande = generatePlan(base({ daysPerWeek: 4, weight: 120, height: 200 }));
const grandeAvz = generatePlan(base({ daysPerWeek: 4, weight: 120, height: 200, level: 'advanced' }));
const loads = (p: WeeklySession[]) => p.flatMap(s => s.exercises).filter(e => e.suggestedWeightKg != null);
check('perfil delgado: mancuernas ligeras (≤8 kg)', loads(flaca).filter(e => e.suggestedWeightUnit === 'per-dumbbell').every(e => (e.suggestedWeightKg ?? 0) <= 8));
check('perfil delgado: barras ≥ peso de la barra', loads(flaca).filter(e => libraryById.get(e.libraryId ?? '')?.equipmentOptions[0]?.includes('barra')).every(e => (e.suggestedWeightKg ?? 0) >= 10));
check('120 kg principiante: techo prudente (≤110 kg)', loads(grande).every(e => (e.suggestedWeightKg ?? 0) <= 110));
check('120 kg: el IMC alto amortigua (máx < 90 % del peso)', Math.max(...loads(grande).map(e => e.suggestedWeightKg ?? 0)) < 120 * 0.9);
check('avanzado sugiere más que principiante', Math.max(...loads(grandeAvz).map(e => e.suggestedWeightKg ?? 0)) >= Math.max(...loads(grande).map(e => e.suggestedWeightKg ?? 0)));
const byId = (p: WeeklySession[]) => new Map(loads(p).map(e => [e.libraryId, e.suggestedWeightKg ?? 0]));
const mf = byId(flaca), mg = byId(grande);
check('monotonía: mismo ejercicio, el perfil grande nunca sugiere menos', [...mf].every(([id, w]) => !mg.has(id) || (mg.get(id) ?? 0) >= w));
check('peso corporal: sin carga inventada', grande.flatMap(s => s.exercises).every(e =>
  libraryById.get(e.libraryId ?? '')?.loadSource === 'Externa' || e.suggestedWeightKg == null));

// ── Coach → Motor (ARCH-COACH-001) ───────────────────────────────────
head('Coach pide al Motor');
const focusOk = Object.keys(SESSION_FOCUS).every(f => {
  const r = generateFocusSession(base({ level: 'advanced' }), f);
  return !!r && r.sessions.length === 1 && r.sessions[0].exercises.length >= 3 && r.sessions[0].exercises.every(e => e.libraryId);
});
check('cada enfoque produce una sesión de la Biblioteca (≥3 ejercicios)', focusOk);
check('enfoque desconocido → null (el Coach no inventa)', generateFocusSession(base({}), 'inventado') === null);
const focusA = generateFocusSession(base({}), 'push')!.sessions[0];
const focusB = generateFocusSession(base({}), 'push')!.sessions[0];
check('sesión puntual reproducible', focusA.exercises.map(e => e.libraryId).join() === focusB.exercises.map(e => e.libraryId).join());
const casa = generateFocusSession(base({ availableEquipment: ['mancuernas', 'banco'] }), 'fullA')!.sessions[0];
check('solo mancuernas+banco: todo hacible con ese material', casa.exercises.every(e =>
  libraryById.get(e.libraryId!)!.equipmentOptions.some(o => o.every(i => ['mancuernas', 'banco'].includes(i)))));
const parque = generateFocusSession(base({ availableEquipment: [] }), 'fullA');
check('peso corporal: sin material o null, nunca máquinas', !parque || parque.sessions[0].exercises.every(e =>
  libraryById.get(e.libraryId!)!.equipmentOptions.some(o => o.length === 0)));
const rodillaPuntual = generateFocusSession(base({ injuries: ['rodilla'] }), 'legs');
const sinFiltro = generateFocusSession(base({}), 'legs')!.sessions[0];
check('lesión de rodilla: la sesión puntual respeta Safety', !rodillaPuntual || rodillaPuntual.sessions[0].exercises.map(e => e.libraryId).join() !== sinFiltro.exercises.map(e => e.libraryId).join());
const corta = generateFocusSession(base({ workoutDuration: durationFromMinutes(25) }), 'torsoA')!.sessions[0];
check('20-30 min: la sesión cabe en 30 min', estimateSessionMinutes(corta) <= 31, `${estimateSessionMinutes(corta)} min`);
check('sesión puntual marcada en la traza', corta.templateKey === 'torsoA' && corta.motorTrace?.split === 'Sesión puntual');


// ── Biblioteca v2.17: IDs antiguos ───────────────────────────────────
head('IDs de la v1.8');
check('los alias apuntan a fichas existentes', Object.values(LEGACY_ID_ALIASES).every(id => LIBRARY.some(e => e.id === id)));
check('quad_squat → Sentadilla trasera con barra', libraryById.get('quad_squat')?.id === 'legs_barbell_squat');
check('back_chinup → Dominadas (configuración supina)', libraryById.get('back_chinup')?.id === 'back_pullup');
check('historial de pesos: fk-ham_rdl = fk-hamstrings_romanian_deadlift', canonicalExerciseId('fk-ham_rdl') === 'fk-hamstrings_romanian_deadlift'
  && canonicalExerciseId('fk-chest_pec_deck') === 'fk-chest_pec_deck' && canonicalExerciseId('custom-1') === 'custom-1');
const exclOld = generatePlan(base({ daysPerWeek: 4, level: 'advanced', excludedExercises: ['quad_squat', 'ham_rdl'] }));
check('una exclusión guardada con ID antiguo sigue excluyendo', !ids(exclOld).includes('legs_barbell_squat') && !ids(exclOld).includes('hamstrings_romanian_deadlift'));
const reverseAlias = new Map<string, string>();
for (const [old, id] of Object.entries(LEGACY_ID_ALIASES)) if (!reverseAlias.has(id)) reverseAlias.set(id, old);
const prevNew = generatePlan(base({ daysPerWeek: 4, level: 'advanced' }));
const prevOld = prevNew.map(s => ({ ...s, exercises: s.exercises.map(e => ({ ...e, libraryId: reverseAlias.get(e.libraryId ?? '') ?? e.libraryId })) }));
check('control: el plan anterior de prueba contiene IDs antiguos', prevOld.some(s => s.exercises.some(e => e.libraryId && !LIBRARY.some(l => l.id === e.libraryId))));
const histOld = Object.fromEntries(ids(prevOld).map(id => [id ?? '', 'progreso' as const]));
const contNew = generatePlan(base({ daysPerWeek: 4, level: 'advanced', previousPlan: prevNew, planVersion: 7 }));
const contOld = generatePlan(base({ daysPerWeek: 4, level: 'advanced', previousPlan: prevOld, exerciseHistory: histOld, planVersion: 7 }));
check('un plan guardado con IDs v1.8 mantiene la continuidad', ids(contOld).join() === ids(contNew).join() && ids(contOld).join() === ids(prevNew).join());

// ── Biblioteca v2.17: cobertura, cuello y extras ─────────────────────
head('Biblioteca v2.17 en el Motor');
const everyPlan = [1, 2, 3, 4, 5, 6, 7].flatMap(d => (['beginner', 'advanced'] as const).flatMap(level =>
  generatePlanOptions(base({ daysPerWeek: d, level, workoutDuration: '1hour' })).flat()));
check('ningún slot obligatorio queda vacío con gimnasio completo', [1, 2, 3, 4, 5, 6, 7].every(d =>
  generatePlanWithTrace(base({ daysPerWeek: d, level: 'advanced', workoutDuration: '1hour' })).warnings.every(w => !w.includes('sin ejercicio válido'))));
const used = new Set(everyPlan.flatMap(s => s.exercises.map(e => e.libraryId)));
check('fichas nuevas de la v2.17 entran en planes reales', ['back_face_pull', 'chest_smith_bench_press', 'legs_leg_extension', 'hamstrings_seated_leg_curl'].filter(id => used.has(id)).length >= 2,
  `${used.size} fichas distintas usadas`);
check('el cuello nunca aparece sin pedirlo (MOTOR-NECK-OPTIN-094)', everyPlan.every(s => s.exercises.every(e => libraryById.get(e.libraryId ?? '')?.block !== 'Cuello'))
  && Object.keys(SESSION_FOCUS).every(f => generateFocusSession(base({}), f)!.sessions[0].exercises.every(e => libraryById.get(e.libraryId ?? '')?.block !== 'Cuello')));
const neck = generateFocusSession(base({}), 'piernaHombro', ['cuello'])!.sessions[0];
check('pedido expresamente al Coach, el cuello entra', neck.exercises.some(e => libraryById.get(e.libraryId ?? '')?.block === 'Cuello'));
const neckSafe = generateFocusSession(base({ injuries: ['dolor cervical'] }), 'piernaHombro', ['cuello'])!;
check('con síntomas cervicales no hay cuello aunque lo pida (Safety)', neckSafe.sessions[0].exercises.every(e => libraryById.get(e.libraryId ?? '')?.block !== 'Cuello'));
const tib = generateFocusSession(base({}), 'legs', ['tibial', 'flexores_cadera'])!.sessions[0];
check('extras pedidos (tibial, flexores de cadera) entran y no se recortan', ['tibial', 'flexores_cadera'].every(fn => tib.exercises.some(e => e.slotFunction === fn)));
check('extras desconocidos se ignoran', generateFocusSession(base({}), 'legs', ['inventado'])!.sessions[0].exercises.length === generateFocusSession(base({}), 'legs')!.sessions[0].exercises.length);
check('todas las funciones extra tienen candidatos', Object.keys(EXTRA_FUNCTIONS).every(fn => catalog.some(e => e.slotFunction === fn)));


// ── Todas las fichas pueden entrar en una rutina ─────────────────────
head('Todas las fichas entran');
const reachable = (id: string) => {
  const fn = slotFunctionsOf(libraryById.get(id)!)[0];
  const others = LIBRARY.filter(o => o.id !== id && slotFunctionsOf(o)[0] === fn).map(o => o.id);
  for (const d of [3, 4, 5, 6, 2]) for (const level of ['advanced', 'beginner'] as const) for (const sp of [[], ['fútbol']])
    for (const plan of generatePlanOptions(base({ daysPerWeek: d, workoutDuration: '1hour', level, otherSports: sp, otherSportsDays: 1, preferences: { liked: [id], disliked: others } })))
      if (plan.some(s => s.exercises.some(e => e.libraryId === id))) return true;
  return false;
};
const blocked = LIBRARY.filter(e => !e.optIn && !reachable(e.id)).map(e => e.id);
check('toda ficha (salvo cuello) puede entrar sola en una rutina semanal', blocked.length === 0, blocked.join(', '));
const plain = generatePlan(base({ daysPerWeek: 3, level: 'advanced', workoutDuration: '1hour' }));
check('sin deporte ni preferencia, no se añaden flexores de cadera (MOTOR-HIPFLEX-093)', plain.every(s => s.exercises.every(e => e.slotFunction !== 'flexores_cadera')));
check('con presses en la sesión, no se añade deltoide anterior directo (MOTOR-SHOULDER-INDIRECT-059)', [3, 4, 5, 6].every(d =>
  generatePlan(base({ daysPerWeek: d, level: 'advanced', workoutDuration: '1hour' })).every(s =>
    !s.exercises.some(e => e.slotFunction === 'deltoide_anterior') || !s.exercises.some(e => ['empuje_vertical', 'empuje_horizontal', 'empuje_inclinado'].includes(e.slotFunction ?? '')))));

// ── Motor V1: semana de 2 y 3 días (Word del 20/11/2026) ─────────────
head('Motor V1 · estructura y patrones (Word §3 y §4)');
const v1 = (o: Partial<MotorInput>) => generatePlanWithTrace(base({ workoutDuration: '40min', userId: 'v1', ...o }));
const fnsOfWeek = (r: { sessions: WeeklySession[] }) => new Set(r.sessions.flatMap(x => x.exercises.map(e => e.slotFunction)));
const hasAll = (r: { sessions: WeeklySession[] }, ...f: string[]) => f.every(x => fnsOfWeek(r).has(x));
const FUNDAMENTAL = ['empuje_horizontal', 'tiron_horizontal', 'dominante_rodilla', 'bisagra'];
const direct = (r: ReturnType<typeof v1>, g: string) => r.coverage?.find(c => c.group === g)?.direct ?? -1;
const setsOf = (r: { sessions: WeeklySession[] }) => r.sessions.reduce((a, x) => a + x.exercises.reduce((b, e) => b + e.sets, 0), 0);
const minutesOf = (r: { sessions: WeeklySession[] }) => r.sessions.map(x => x.motorTrace?.estimatedMinutes ?? 99);
const noob2 = v1({ daysPerWeek: 2, experienceLevel: 'never' });
const shoulderA = v1({ daysPerWeek: 3, level: 'advanced', goal: 'physique', priorityMuscle: 'shoulders', planOption: 0 });
const shoulderB = v1({ daysPerWeek: 3, level: 'advanced', goal: 'physique', priorityMuscle: 'shoulders', planOption: 1 });
check('40 minutos se entiende como techo de 40', noob2.sessions.every(x => x.motorTrace?.budgetMinutes === 40));
check('2 días: Full Body A/B', noob2.split === 'Full Body A/B' && noob2.sessions.map(x => x.name).join() === 'Full Body A,Full Body B');
check('3 días: las dos estructuras del Word', shoulderA.sessions.map(x => x.name).join(' / ') === 'Pecho, tríceps y hombro / Espalda, bíceps y trapecio / Pierna'
  && shoulderB.sessions.map(x => x.name).join(' / ') === 'Empuje y cuádriceps / Tirón y cadena posterior / Mixto y complementario');
check('los patrones fundamentales están en las tres semanas', [noob2, shoulderA, shoulderB].every(r => hasAll(r, ...FUNDAMENTAL)));
check('también tirón vertical y flexión de rodilla (el RDL no la sustituye)', [noob2, shoulderA, shoulderB].every(r => hasAll(r, 'tiron_vertical', 'flexion_rodilla')));
check('empuje vertical es contextual: sin prioridad de hombro no entra', !fnsOfWeek(noob2).has('empuje_vertical') && hasAll(shoulderA, 'empuje_vertical') && hasAll(shoulderB, 'empuje_vertical'));
check('sin avisos de validación', [noob2, shoulderA, shoulderB].every(r => r.warnings.length === 0), [noob2, shoulderA, shoulderB].flatMap(r => r.warnings).join(' | '));

head('Motor V1 · volumen por situación (Word §5)');
check('situación: desde cero / irregular / constante', noob2.situation === 'cero' && v1({ daysPerWeek: 2, experienceLevel: 'inconsistent' }).situation === 'irregular' && shoulderA.situation === 'constante');
const roomy = (o: Partial<MotorInput>) => v1({ workoutDuration: '1hour', ...o });
const zero60 = roomy({ daysPerWeek: 2, experienceLevel: 'never' });
check('con tiempo de sobra se llega al mínimo de referencia y no se pasa de ahí', (['pecho', 'espalda', 'cuadriceps', 'biceps', 'triceps', 'gemelos', 'core', 'deltLateral', 'deltPosterior'] as const)
  .every(g => direct(zero60, g) === VOLUME_REFERENCE.cero[g][0]), zero60.coverage?.map(c => `${c.group} ${c.direct}`).join(' '));
check('el tiempo no se rellena: desde cero con 60 min termina mucho antes', minutesOf(zero60).every(m => m <= 50), minutesOf(zero60).join('/'));
check('más situación, más volumen (cero < irregular < constante)', setsOf(zero60) < setsOf(roomy({ daysPerWeek: 2, experienceLevel: 'inconsistent' }))
  && setsOf(roomy({ daysPerWeek: 2, experienceLevel: 'inconsistent' })) < setsOf(roomy({ daysPerWeek: 2, level: 'advanced' })));
check('más tiempo nunca da menos trabajo', [2, 3].every(d => setsOf(v1({ daysPerWeek: d, level: 'advanced', workoutDuration: '30min' })) <= setsOf(v1({ daysPerWeek: d, level: 'advanced' }))
  && setsOf(v1({ daysPerWeek: d, level: 'advanced' })) <= setsOf(roomy({ daysPerWeek: d, level: 'advanced' }))));

head('Motor V1 · cuando no cabe todo (Word §5 jerarquía)');
check('40 min: ninguna sesión supera el techo', [noob2, shoulderA, shoulderB].every(r => minutesOf(r).every(m => m <= 40)), [noob2, shoulderA, shoulderB].map(r => minutesOf(r).join('/')).join(' · '));
check('prioridad de hombro: lateral y posterior conservan su mínimo de referencia', [shoulderA, shoulderB].every(r => direct(r, 'deltLateral') >= 6 && direct(r, 'deltPosterior') >= 4));
check('la prioridad cuesta al resto, no a sí misma (pecho por debajo de su referencia)', [shoulderA, shoulderB].every(r => direct(r, 'pecho') < 10));
check('mejor colocación: el press de hombro abre su sesión', [shoulderA, shoulderB].every(r => r.sessions[0].exercises[0].slotFunction === 'empuje_vertical'));
check('la prioridad tiene dos exposiciones de deltoide lateral', [shoulderA, shoulderB].every(r => r.sessions.filter(x => x.exercises.some(e => e.slotFunction === 'deltoide_lateral')).length === 2));
const pairs = (x: WeeklySession) => x.exercises.map((e, i) => ({ e, partner: supersetPartner(x.exercises, i) })).filter(p => p.e.superset);
check('se usan biseries antes de eliminar trabajo directo', [shoulderA, shoulderB].every(r => r.sessions.some(x => pairs(x).length > 0)));
check('biseries: solo accesorios, siempre contiguos y nunca más de dos por sesión', [noob2, shoulderA, shoulderB].every(r => r.sessions.every(x =>
  pairs(x).every(p => p.partner !== -1 && p.e.slotRole === 'complementario') && new Set(pairs(x).map(p => p.e.superset)).size <= 2)));
check('biseries: ninguno es protagonista de lo que trabaja el otro', [shoulderA, shoulderB].every(r => r.sessions.every(x => pairs(x).every(p => {
  const a = matrixOf(libraryById.get(p.e.libraryId as string)!).row;
  const b = matrixOf(libraryById.get(x.exercises[p.partner].libraryId as string)!).row;
  return Object.entries(a).every(([k, v]) => k === 'espalda' || (v ?? 0) < 1 || ((b as Record<string, number>)[k] ?? 0) < 0.5);
}))));
const tiny = v1({ daysPerWeek: 2, experienceLevel: 'never', workoutDuration: '20min' });
check('20 min: caen los accesorios, no los patrones fundamentales', hasAll(tiny, ...FUNDAMENTAL) && minutesOf(tiny).every(m => m <= 22), minutesOf(tiny).join('/'));
check('el registro explica cada ajuste con el paso de la jerarquía', shoulderA.sessions.every(x => (x.motorTrace?.notes ?? []).some(n => n.startsWith('Paso 5') || n.startsWith('Paso 6'))));

head('Motor V1 · descansos, alternativas y seguridad (Word §7, §8 y §9)');
const allV1 = [noob2, shoulderA, shoulderB, zero60, tiny];
const libOf = (e: { libraryId?: string }) => libraryById.get(e.libraryId as string)!;
check('descansos: compuestos 2:00–2:30 y accesorios hasta 1:30, dentro del rango de la ficha', allV1.every(r => r.sessions.every(x => x.exercises.every(e => {
  const lib = libOf(e);
  const compound = e.slotRole !== 'complementario' && lib.compatibleRoles.includes('Principal');
  const inSpec = e.restSeconds >= (lib.restSpec.min ?? 0) && e.restSeconds <= (lib.restSpec.max ?? 999);
  return inSpec && (compound ? e.restSeconds >= 60 && e.restSeconds <= 150 : e.restSeconds <= 90);
}))));
check('los patrones principales tienen dos alternativas', allV1.every(r => r.sessions.every(x => x.exercises.filter(e => e.slotRole === 'principal').every(e => (e.alternatives ?? []).length === 2))));
check('nunca más de dos alternativas, y ninguna repite un ejercicio de la sesión', allV1.every(r => r.sessions.every(x => x.exercises.every(e =>
  (e.alternatives ?? []).length <= 2 && (e.alternatives ?? []).every(a => a !== e.name && !x.exercises.some(o => o.name === a))))));
check('las alternativas resuelven el mismo slot (misma función o una equivalente del mismo grupo)', allV1.every(r => r.sessions.every(x => x.exercises.every(e =>
  (e.alternatives ?? []).every(a => {
    const alt = LIBRARY.find(l => l.name === a);
    if (!alt) return false;
    const own = Object.entries(matrixOf(libOf(e)).row).filter(([, v]) => (v ?? 0) >= 1).map(([k]) => k);
    return own.length === 0 || own.some(k => ((matrixOf(alt).row as Record<string, number>)[k] ?? 0) >= 1);
  })))));
const caution = (name: string) => ['Baja', 'Baja-Media', 'Media-Baja', 'Media'].includes(LIBRARY.find(l => l.name === name)?.nearFailureSuitability ?? 'Alta');
check('principiante: los ejercicios elegidos no llevan etiqueta de precaución', noob2.sessions.every(x => x.exercises.every(e => !caution(e.name))));
check('principiante: la primera alternativa nunca lleva etiqueta de precaución', noob2.sessions.every(x => x.exercises.every(e => !e.alternatives?.[0] || !caution(e.alternatives[0]))));
const knee = v1({ daysPerWeek: 2, experienceLevel: 'never', injuries: ['dolor de rodilla'] });
check('las alternativas respetan las lesiones', knee.sessions.every(x => x.exercises.every(e => (e.alternatives ?? []).every(a => {
  const alt = LIBRARY.find(l => l.name === a)!;
  return !(alt.block === 'Pierna' && !['Alta', 'Muy alta'].includes(alt.stability));
}))));
check('equipo poco habitual: no se elige por defecto ni se ofrece como alternativa', allV1.every(r => r.sessions.every(x => x.exercises.every(e =>
  !SPECIAL_STATIONS.includes(e.libraryId as string) && (e.alternatives ?? []).every(a => !SPECIAL_STATIONS.includes(LIBRARY.find(l => l.name === a)?.id ?? ''))))));
check('…pero entra si el usuario lo prefiere', v1({ daysPerWeek: 2, preferences: { liked: ['legs_belt_squat'] } }).sessions.some(x => x.exercises.some(e => e.libraryId === 'legs_belt_squat')));

head('Motor V1 · continuidad y determinismo');
const again = v1({ daysPerWeek: 3, level: 'advanced', goal: 'physique', priorityMuscle: 'shoulders', planOption: 0 });
check('misma entrada, misma tabla', JSON.stringify(again.sessions.map(x => x.exercises.map(e => [e.libraryId, e.sets, e.restSeconds, e.superset]))) === JSON.stringify(shoulderA.sessions.map(x => x.exercises.map(e => [e.libraryId, e.sets, e.restSeconds, e.superset]))));
const stripKeys = (r: { sessions: WeeklySession[] }) => r.sessions.map(x => ({ ...x, templateKey: undefined }));
check('la opción elegida se mantiene la semana siguiente aunque no se conserve la plantilla', generatePlanWithTrace(base({ workoutDuration: '40min', level: 'advanced', previousPlan: stripKeys(shoulderB) })).split === shoulderB.split
  && generatePlanWithTrace(base({ workoutDuration: '40min', level: 'advanced', previousPlan: stripKeys(shoulderA) })).split === shoulderA.split);
const oldPPL = ['Empuje', 'Tirón', 'Pierna'].map((name, i) => ({ ...shoulderB.sessions[i], name, templateKey: undefined }));
check('quien tenía "Empuje / Tirón / Pierna" pasa a la opción B', generatePlanWithTrace(base({ workoutDuration: '40min', previousPlan: oldPPL })).split === shoulderB.split);
const next = generatePlanWithTrace(base({ workoutDuration: '40min', daysPerWeek: 2, experienceLevel: 'never', userId: 'v1', previousPlan: noob2.sessions }));
check('la semana siguiente mantiene los ejercicios', ids(next.sessions).join() === ids(noob2.sessions).join());

head('Biserie en el modo guiado');
const flow = (list: { sets: number; restSeconds: number; superset?: string }[]) => {
  const out: string[] = [];
  let step: { exerciseIndex: number; setIndex: number; rest: number } | null = { exerciseIndex: 0, setIndex: 0, rest: 0 };
  while (step && out.length < 40) { out.push(`${step.exerciseIndex}.${step.setIndex}${step.rest ? `r${step.rest}` : ''}`); step = nextGuidedStep(list, step.exerciseIndex, step.setIndex); }
  return out.join(' ');
};
check('sin biserie: series seguidas con su descanso y 90 s entre ejercicios', flow([{ sets: 2, restSeconds: 120 }, { sets: 1, restSeconds: 90 }]) === '0.0 0.1r120 1.0r90');
check('biserie: una serie de cada seguida y descanso al acabar la ronda', flow([{ sets: 2, restSeconds: 90, superset: 'S' }, { sets: 2, restSeconds: 75, superset: 'S' }, { sets: 1, restSeconds: 90 }]) === '0.0 1.0 0.1r90 1.1 2.0r90');
check('biserie con series desiguales: las que sobran se hacen con descanso', flow([{ sets: 3, restSeconds: 90, superset: 'S' }, { sets: 2, restSeconds: 90, superset: 'S' }]) === '0.0 1.0 0.1r90 1.1 0.2r90'
  && flow([{ sets: 1, restSeconds: 90, superset: 'S' }, { sets: 3, restSeconds: 90, superset: 'S' }]) === '0.0 1.0 1.1r90 1.2r90');
check('si el compañero ya no está, el ejercicio se hace normal', supersetPartner([{ superset: 'S' }, {}], 0) === -1 && flow([{ sets: 2, restSeconds: 60, superset: 'S' }]) === '0.0 0.1r60');

console.log(`\n${failures === 0 ? 'TODOS LOS CHECKS PASARON' : `${failures} CHECK(S) FALLARON`}`);
process.exit(failures === 0 ? 0 : 1);
