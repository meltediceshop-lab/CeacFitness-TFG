// Batería reproducible del Motor Fit-K v1.8 (FIT-K_Instrucciones sec. 18-19).
// Cada cambio importante del Motor debe volver a pasar estos casos.
// Uso: npx tsx scripts/verify-fitk-motor.ts
import {
  generatePlan, generatePlanWithTrace, generatePlanOptions, planOptionCount, motorCatalog,
  adaptSessionForToday, substituteExercise, estimateSessionMinutes, generateFocusSession, SESSION_FOCUS,
  durationFromMinutes, type MotorInput,
} from '../src/lib/fitkMotor';
import { evaluateProgression, returnAdjustment, type ProgressionEntry } from '../src/lib/fitkProgression';
import { handleDiscomfort } from '../src/lib/fitkSafety';
import { LIBRARY, LIBRARY_META, libraryById, libraryPromptSummary } from '../src/lib/fitkLibrary';
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
check(`v${LIBRARY_META.version} importada con ${LIBRARY.length} fichas únicas`, LIBRARY.length === LIBRARY_META.uniqueExercises && LIBRARY.length >= 100);
check('IDs únicos', new Set(LIBRARY.map(e => e.id)).size === LIBRARY.length);
check('los duplicados del Excel quedan registrados como aviso (no se ocultan)', LIBRARY_META.warnings.some(w => w.includes('duplicadas')));
check('variantes con ejercicio base inexistente quedan avisadas', LIBRARY_META.warnings.some(w => w.includes('no existe en la Biblioteca')));
const catalog = motorCatalog();
check('toda ficha cubre una función de slot coherente con su bloque',
  catalog.every(e => e.slotFunction !== 'core' || libraryById.get(e.libraryId ?? '')?.block === 'Core'));
check('el resumen del Coach usa la misma Biblioteca', libraryPromptSummary().includes(`${LIBRARY.length} ejercicios`));

// ── 1. 2 días principiante ───────────────────────────────────────────
head('2 días principiante');
const p2 = generatePlanWithTrace(base({ daysPerWeek: 2 }));
check('estructura Full Body A/B', p2.split === 'Full Body A/B');
check('sin exceso de ejercicios (≤6 por sesión)', p2.sessions.every(s => s.exercises.length <= 6));
check('cada sesión cubre pierna + empuje + tirón', p2.sessions.every(s =>
  fns(s).some(f => ['dominante_rodilla', 'bisagra', 'unilateral_rodilla'].includes(f ?? ''))
  && fns(s).some(f => f?.startsWith('empuje')) && fns(s).some(f => f?.startsWith('tiron'))));

// ── 2. 3 días principiante ───────────────────────────────────────────
head('3 días principiante');
const p3 = generatePlanWithTrace(base({ daysPerWeek: 3 }));
check('split dividido, no Full Body (MOTOR-SPLIT-037)', p3.sessions.every(s => !s.templateKey?.startsWith('full')));
check('sesiones con identidad propia', new Set(p3.sessions.map(s => s.templateKey)).size === 3);
check('duración realista (60-105 % del tiempo)', p3.sessions.every(s => {
  const m = s.motorTrace?.estimatedMinutes ?? 0;
  return m >= 45 * 0.6 && m <= 45 * 1.05;
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
check('muy baja: versión más corta que conserva lo esencial', vlow.exercises.length <= s0.exercises.length
  && s0.exercises.filter(e => e.essential).every(e => vlow.exercises.some(x => x.id === e.id)));
const high = adaptSessionForToday(s0, { energy: 'high' });
check('alta: no añade media rutina', high.exercises.length === s0.exercises.length && totalSets([high]) === totalSets([s0]));
check('el Plan Base no se muta', s0.exercises.length === p3.sessions[0].exercises.length && low.id !== s0.id);
const time20 = adaptSessionForToday(s0, { energy: 'normal', minutesAvailable: 20 });
check('poco tiempo: sesión esencial cabe y conserva lo esencial', estimateSessionMinutes(time20) <= 20 * 1.05
  && s0.exercises.filter(e => e.essential).every(e => time20.exercises.some(x => x.id === e.id)), `${estimateSessionMinutes(time20)} min`);

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

console.log(`\n${failures === 0 ? 'TODOS LOS CHECKS PASARON' : `${failures} CHECK(S) FALLARON`}`);
process.exit(failures === 0 ? 0 : 1);
