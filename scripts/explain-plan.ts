// Modo debug del Motor (FIT-K_Instrucciones sec. 16): imprime la rutina de
// un perfil con la traza de cada decisión (split, slot, filtros, redundancia,
// tiempo, historial, alternativa y motivo).
// Uso: npx tsx scripts/explain-plan.ts [perfil]   (sin argumento: lista perfiles)
import { generatePlanWithTrace, explainSession, type MotorInput } from '../src/lib/fitkMotor';
import { LIBRARY_META } from '../src/lib/fitkLibrary';

export const PROFILES: Record<string, MotorInput> = {
  'principiante-2d': { daysPerWeek: 2, workoutDuration: '45min', level: 'beginner', goal: 'routine', weight: 70, height: 175, biologicalProfile: 'male' },
  'principiante-3d': { daysPerWeek: 3, workoutDuration: '45min', level: 'beginner', goal: 'lose-fat', weight: 62, height: 165, biologicalProfile: 'female' },
  'constante-4d': { daysPerWeek: 4, workoutDuration: '1hour', level: 'advanced', goal: 'physique', weight: 80, height: 180, biologicalProfile: 'male' },
  'brazos-5d': { daysPerWeek: 5, workoutDuration: '1hour', level: 'advanced', goal: 'physique', priorityMuscle: 'arms', weight: 78, height: 178, biologicalProfile: 'male' },
  'pierna-deporte-4d': { daysPerWeek: 4, workoutDuration: '45min', level: 'advanced', goal: 'performance', priorityMuscle: 'legs', otherSports: ['fútbol'], otherSportsDays: 2, weight: 64, height: 168, biologicalProfile: 'female' },
  'corto-30min': { daysPerWeek: 3, workoutDuration: '30min', level: 'beginner', goal: 'routine', weight: 70, height: 172, biologicalProfile: 'male' },
  'gimnasio-casa': { daysPerWeek: 3, workoutDuration: '45min', level: 'beginner', goal: 'routine', availableEquipment: ['mancuernas', 'banco', 'banda'], weight: 75, height: 178, biologicalProfile: 'male' },
};

if (process.argv[1]?.includes('explain-plan')) {
  const name = process.argv[2];
  if (!name || !PROFILES[name]) {
    console.log(`Biblioteca v${LIBRARY_META.version}: ${LIBRARY_META.uniqueExercises} ejercicios. Perfiles: ${Object.keys(PROFILES).join(', ')}`);
  } else {
    const r = generatePlanWithTrace({ ...PROFILES[name], userId: name });
    console.log(`# ${name} — split: ${r.split}\n`);
    for (const s of r.sessions) console.log(explainSession(s) + '\n');
    console.log(r.warnings.length ? `AVISOS:\n- ${r.warnings.join('\n- ')}` : 'Sin avisos de validación semanal.');
  }
}
