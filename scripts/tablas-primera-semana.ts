// Tablas de la primera semana (Motor V1, Word del 20/11/2026).
// Imprime lo que genera realmente el Motor para un perfil: ejercicios,
// series, repeticiones, descansos, duración estimada, alternativas, ajustes
// al tiempo y cobertura semanal frente a la referencia del Word.
//
// Uso: npx tsx scripts/tablas-primera-semana.ts [perfil] [--json]
//      (sin perfil: los dos casos de la primera prueba)
import { generatePlanWithTrace, planOptionCount, type MotorInput, type PlanResult } from '../src/lib/fitkMotor';
import { SITUATION_LABEL } from '../src/lib/fitkSpecV1';
import { formatRepLine } from '../src/lib/exerciseFormat';

export const CASES: Record<string, { title: string; input: MotorInput }> = {
  'principiante-2d': {
    title: 'Principiante, 2 días de 40 min (empieza de cero)',
    // Lo mismo que envía la app tras el onboarding: principiante, "nunca he entrenado", 2 días, 40 min.
    input: { daysPerWeek: 2, workoutDuration: '40min', level: 'beginner', experienceLevel: 'never', goal: 'routine', injuries: [], excludedExercises: [], weight: 72, height: 176, biologicalProfile: 'male', otherSports: [], otherSportsDays: 0, startFrom: 1, customDays: [0, 3] },
  },
  'hombro-3d': {
    title: 'Usuario de 3 días de 40 min con prioridad de hombro (avanzado, constante)',
    // Lo mismo que envía la app: "ya entreno con constancia", mejorar el físico, 3 días, 40 min, prioridad hombros.
    input: { daysPerWeek: 3, workoutDuration: '40min', level: 'advanced', goal: 'physique', priorityMuscle: 'shoulders', injuries: [], excludedExercises: [], weight: 78, height: 178, biologicalProfile: 'male', otherSports: [], otherSportsDays: 0, startFrom: 1 },
  },
};

const rest = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export function planOptions(input: MotorInput): PlanResult[] {
  return Array.from({ length: planOptionCount(input.daysPerWeek) }, (_, i) => generatePlanWithTrace({ ...input, planOption: i }));
}

function printPlan(r: PlanResult, label: string): void {
  console.log(`\n### ${label}${r.split}`);
  for (const s of r.sessions) {
    const t = s.motorTrace;
    console.log(`\n**${s.name}** · ${s.exercises.reduce((a, e) => a + e.sets, 0)} series · estimada ${t?.estimatedMinutes} min (techo ${t?.budgetMinutes})\n`);
    console.log('| # | Ejercicio | Series × reps | Descanso | Alternativas |');
    console.log('|---|---|---|---|---|');
    s.exercises.forEach((e, i) => {
      const pair = e.superset ? ' ⟲ biserie' : '';
      console.log(`| ${i + 1} | ${e.name}${pair} | ${e.sets} × ${formatRepLine(e)} | ${rest(e.restSeconds)} | ${(e.alternatives ?? []).join(' · ') || '—'} |`);
    });
    if (t?.notes.length) console.log(`\n${t.notes.map(n => `- ${n}`).join('\n')}`);
  }
  if (r.coverage) {
    console.log('\n| Grupo | Directas | Equivalentes | Referencia |');
    console.log('|---|---|---|---|');
    for (const c of r.coverage) console.log(`| ${c.label}${c.priority ? ' (prioridad)' : ''} | ${c.direct} | ${String(c.equivalent).replace('.', ',')} | ${c.reference[0]}–${c.reference[1]} |`);
  }
  if (r.warnings.length) console.log(`\nAVISOS: ${r.warnings.join(' · ')}`);
}

if (process.argv[1]?.includes('tablas-primera-semana')) {
  const args = process.argv.slice(2);
  const names = args.filter(a => !a.startsWith('--'));
  const selected = names.length ? names : Object.keys(CASES);
  if (args.includes('--json')) {
    console.log(JSON.stringify(selected.map(name => ({ name, ...CASES[name], options: planOptions(CASES[name].input) })), null, 1));
  } else {
    for (const name of selected) {
      const c = CASES[name];
      if (!c) { console.log(`Perfil desconocido: ${name}. Disponibles: ${Object.keys(CASES).join(', ')}`); continue; }
      const options = planOptions(c.input);
      console.log(`\n## ${c.title}`);
      if (options[0].situation) console.log(`Situación: ${SITUATION_LABEL[options[0].situation]}`);
      options.forEach((r, i) => printPlan(r, options.length > 1 ? `Opción ${i === 0 ? 'A' : 'B'}: ` : ''));
    }
  }
}
