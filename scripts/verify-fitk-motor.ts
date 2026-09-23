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

console.log(`\n${failures === 0 ? 'TODOS LOS CHECKS PASARON' : `${failures} CHECK(S) FALLARON`}`);
process.exit(failures === 0 ? 0 : 1);
