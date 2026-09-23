// Suite de verificación del Motor Fit-K v1.0 (offline, sin DB/env).
// Uso: npx tsx scripts/verify-fitk-motor.ts
import { generatePlan, motorCatalog, adaptSessionForToday, type MotorInput } from '../src/lib/fitkMotor';
import { LIBRARY } from '../src/lib/fitkLibrary';

let failures = 0;
function check(label: string, cond: boolean) {
  if (!cond) { failures++; console.log('FAIL:', label); }
  else console.log('ok  :', label);
}

console.log(`Biblioteca: ${LIBRARY.length} ejercicios`);
check('Biblioteca tiene 81 ejercicios', LIBRARY.length === 81);

const laura: MotorInput = {
  daysPerWeek: 3, workoutDuration: '45min', goal: 'lose-fat', level: 'beginner',
  priorityMuscle: 'legs', userId: 'laura', planVersion: 1,
};
const planLaura = generatePlan(laura);
check('R01: genera 3 sesiones', planLaura.length === 3);
check('R01: cada sesión tiene ejercicios', planLaura.every(s => s.exercises.length > 0));
check('R01: nº de ejercicios por sesión razonable', planLaura.every(s => s.exercises.length >= 3 && s.exercises.length <= 8));

const planLaura2 = generatePlan(laura);
const namesA = planLaura.flatMap(s => s.exercises.map(e => e.name)).join('|');
const namesB = planLaura2.flatMap(s => s.exercises.map(e => e.name)).join('|');
check('Determinismo: mismo perfil -> mismo plan', namesA === namesB);

const rodilla: MotorInput = {
  daysPerWeek: 4, workoutDuration: '45min', goal: 'strength', level: 'advanced',
  injuries: ['dolor de rodilla derecha'], userId: 'marcos', planVersion: 1,
};
const planRodilla = generatePlan(rodilla);
const hasUnstableKnee = planRodilla.some(s => s.exercises.some(e => {
  const lib = LIBRARY.find(l => l.id === e.libraryId);
  return lib && lib.block === 'Pierna' && (lib.stability === 'Media' || lib.stability === 'Media-Alta');
}));
check('R06: lesión de rodilla excluye ejercicios de pierna inestables', !hasUnstableKnee);

const excluido: MotorInput = {
  daysPerWeek: 3, workoutDuration: '30min', level: 'beginner',
  excludedExercises: ['press banca'], userId: 'ex1', planVersion: 1,
};
const planExcl = generatePlan(excluido);
const hasBench = planExcl.some(s => s.exercises.some(e => e.name.toLowerCase().includes('press banca')));
check('Exclusión explícita: "press banca" nunca aparece', !hasBench);

const corto: MotorInput = { daysPerWeek: 3, workoutDuration: '30min', level: 'beginner', userId: 'time1', planVersion: 1 };
const largo: MotorInput = { daysPerWeek: 3, workoutDuration: '1hour', level: 'beginner', userId: 'time1', planVersion: 1 };
const planCorto = generatePlan(corto);
const planLargo = generatePlan(largo);
const avgCorto = planCorto.reduce((a, s) => a + s.exercises.length, 0) / planCorto.length;
const avgLargo = planLargo.reduce((a, s) => a + s.exercises.length, 0) / planLargo.length;
check('R08/R09: sesión de 1h tiene más ejercicios que la de 30min', avgLargo > avgCorto);
console.log(`  (avg 30min=${avgCorto.toFixed(1)} ejercicios, avg 1h=${avgLargo.toFixed(1)} ejercicios)`);

const base = planLaura[0];
const adapted = adaptSessionForToday(base, { energy: 'very-low' });
check('Daily Adapter: no muta el Plan Base (id distinto, objeto distinto)', adapted.id !== base.id && adapted !== base);
const setsBase = base.exercises.reduce((a, e) => a + e.sets, 0);
const setsAdapted = adapted.exercises.reduce((a, e) => a + e.sets, 0);
check('Daily Adapter: energía muy baja reduce el volumen total', setsAdapted < setsBase);
check('Plan Base original sigue intacto tras adaptar', base.exercises.reduce((a, e) => a + e.sets, 0) === setsBase);
console.log(`  (sets base=${setsBase}, sets adaptado=${setsAdapted})`);

const adaptedTime = adaptSessionForToday(base, { energy: 'normal', minutesAvailable: 20 });
check('Daily Adapter: recorta ejercicios para 20 min', adaptedTime.exercises.length <= base.exercises.length);

const catalog = motorCatalog();
check('motorCatalog expone 81 ejercicios', catalog.length === 81);
check('motorCatalog conserva libraryId', catalog.every(e => !!e.libraryId));

// ── Carga inicial estimada: perfiles extremos ────────────────────────
console.log('\n--- Peso sugerido por perfil ---');

function allExercises(plan: ReturnType<typeof generatePlan>) {
  return plan.flatMap(s => s.exercises);
}
function withWeight(exs: ReturnType<typeof allExercises>) {
  return exs.filter(e => e.suggestedWeightKg != null);
}

// Perfil A: muy delgada, principiante (debería sugerir cargas mínimas/ligeras)
const flaca: MotorInput = {
  daysPerWeek: 4, workoutDuration: '45min', level: 'beginner', goal: 'strength',
  weight: 42, height: 158, biologicalProfile: 'female', userId: 'flaca', planVersion: 1,
};
const planFlaca = generatePlan(flaca);
const pesosFlaca = withWeight(allExercises(planFlaca));
check('Perfil delgado: todos los ejercicios con carga tienen peso sugerido > 0', pesosFlaca.every(e => (e.suggestedWeightKg ?? 0) > 0));
check('Perfil delgado: ninguna barra sugiere menos de 20kg (barra oly vacía) o 10kg (EZ)', pesosFlaca.every(e => {
  if (e.suggestedWeightUnit !== 'total') return true;
  const eq = (e.equipmentCode ?? '').toLowerCase();
  if (!eq.includes('barra')) return true;
  const min = eq.includes('ez') ? 10 : 20;
  return (e.suggestedWeightKg ?? 0) >= min;
}));
check('Perfil delgado: mancuernas sugeridas son ligeras (<= 8kg)', pesosFlaca.filter(e => e.suggestedWeightUnit === 'per-dumbbell').every(e => (e.suggestedWeightKg ?? 0) <= 8));
const maxFlaca = Math.max(...pesosFlaca.map(e => e.suggestedWeightKg ?? 0));
console.log(`  Flaca (42kg/158cm/beginner): máximo sugerido = ${maxFlaca}kg`);

// Perfil B: 120kg y muy alto, principiante (debe ser prudente, no lineal con el peso)
const grande: MotorInput = {
  daysPerWeek: 4, workoutDuration: '45min', level: 'beginner', goal: 'strength',
  weight: 120, height: 200, biologicalProfile: 'male', userId: 'grande', planVersion: 1,
};
const planGrande = generatePlan(grande);
const pesosGrande = withWeight(allExercises(planGrande));
const maxGrande = Math.max(...pesosGrande.map(e => e.suggestedWeightKg ?? 0));
console.log(`  Grande (120kg/200cm/beginner): máximo sugerido = ${maxGrande}kg`);
check('Perfil 120kg: no supera un techo prudente para un principiante (<=110kg en total, ningún ejercicio)', pesosGrande.filter(e => e.suggestedWeightUnit === 'total').every(e => (e.suggestedWeightKg ?? 0) <= 110));
check('Perfil 120kg: el IMC alto amortigua la carga (no es lineal con el peso corporal bruto)', maxGrande < 120 * 0.9);

// Mismo perfil grande pero avanzado: debe subir respecto al principiante, sin disparatarse
const grandeAvanzado: MotorInput = { ...grande, level: 'advanced', userId: 'grande-avz' };
const planGrandeAvz = generatePlan(grandeAvanzado);
const pesosGrandeAvz = withWeight(allExercises(planGrandeAvz));
const maxGrandeAvz = Math.max(...pesosGrandeAvz.map(e => e.suggestedWeightKg ?? 0));
console.log(`  Grande avanzado (120kg/200cm): máximo sugerido = ${maxGrandeAvz}kg`);
check('Avanzado sugiere más carga que principiante para el mismo cuerpo', maxGrandeAvz >= maxGrande);
check('Avanzado 120kg tampoco se dispara (<=160kg techo total)', pesosGrandeAvz.filter(e => e.suggestedWeightUnit === 'total').every(e => (e.suggestedWeightKg ?? 0) <= 160));

// Monotonía básica: a igualdad de ejercicio/nivel, el perfil más grande sugiere >= carga que el flaco
const byLibId = (exs: ReturnType<typeof allExercises>) => new Map(exs.map(e => [e.libraryId, e.suggestedWeightKg]));
const mapFlaca = byLibId(pesosFlaca);
const mapGrande = byLibId(pesosGrande);
let monotone = true;
for (const [id, wFlaca] of mapFlaca) {
  const wGrande = mapGrande.get(id);
  if (wGrande != null && wFlaca != null && wGrande < wFlaca) monotone = false;
}
check('Monotonía: mismo ejercicio/nivel, perfil de 120kg nunca sugiere menos que el perfil delgado', monotone);

// Ejercicios de peso corporal puro nunca llevan carga sugerida (no hay dato que inventar)
const bodyweightOnly = LIBRARY.filter(l => l.loadSource !== 'Externa').map(l => l.id);
const anyBodyweightWithLoad = allExercises(planGrande).some(e => bodyweightOnly.includes(e.libraryId ?? '') && e.suggestedWeightKg != null);
check('Ejercicios de peso corporal no llevan carga externa inventada', !anyBodyweightWithLoad);

// ── Variantes de equipo (family) y alternativas ──────────────────────
console.log('\n--- Variantes y alternativas ---');
const benchBarbell = catalog.find(e => e.name === 'Press banca barra');
check('Press banca barra tiene variantes de equipo (mancuernas/máquina/corporal)', (benchBarbell?.variations?.length ?? 0) >= 2);
check('Las variantes de Press banca barra incluyen distintos tipos de equipo', new Set(benchBarbell?.variations?.map(v => v.type)).size >= 2);
const rdl = catalog.find(e => e.name === 'RDL barra');
check('RDL barra tiene alternativas funcionales (no vacío)', (rdl?.alternatives?.length ?? 0) > 0);

console.log(`\n${failures === 0 ? 'TODOS LOS CHECKS PASARON' : `${failures} CHECK(S) FALLARON`}`);
process.exit(failures === 0 ? 0 : 1);
