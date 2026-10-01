// Auditoría offline: para cada ficha de la Biblioteca, ¿qué imagen le asigna
// exerciseImages.ts? Las fichas deben resolverse por el mapa exacto
// (exerciseImageMap.ts); también se prueban nombres libres típicos del Coach.
// Uso: npx tsx scripts/audit-exercise-images.ts
import { LIBRARY } from '../src/lib/fitkLibrary';
import { LIBRARY_IMAGE_IDS } from '../src/lib/exerciseImageMap';
import { resolveExercise } from '../src/lib/exerciseImages';

let exact = 0;
const missing: string[] = [];
for (const ex of LIBRARY) {
  const resolved = resolveExercise(ex.name);
  if (LIBRARY_IMAGE_IDS[ex.id] && resolved.id === LIBRARY_IMAGE_IDS[ex.id]) exact++;
  else missing.push(`${ex.id} ${ex.name} -> ${resolved.id}`);
}
console.log(`Biblioteca: ${LIBRARY.length} fichas | imagen exacta=${exact} | sin mapa=${missing.length}`);
missing.forEach(m => console.log('  FALTA', m));

// Nombres libres (Coach / legacy): esperado -> id del dataset
const FREE: [string, string][] = [
  ['Encogimiento de hombros con mancuernas', 'Dumbbell_Shrug'],
  ['Crunch abdominal', 'Crunches'],
  ['Fondos de tríceps en paralelas', 'Dips_-_Triceps_Version'],
  ['Press de banca agarre cerrado', 'Close-Grip_Barbell_Bench_Press'],
  ['Jalón al pecho agarre cerrado', 'Wide-Grip_Lat_Pulldown'],
  ['Curl nórdico', 'Natural_Glute_Ham_Raise'],
  ['Elevación de talones de pie', 'Standing_Calf_Raises'],
  ['Máquina de aductores', 'Thigh_Adductor'],
  ['Buenos días con barra', 'Good_Morning'],
  ['Press francés con barra EZ', 'EZ-Bar_Skullcrusher'],
  ['Sentadilla goblet', 'Goblet_Squat'],
  ['Remo con mancuerna', 'Bent_Over_Two-Dumbbell_Row'],
];
let bad = 0;
for (const [name, want] of FREE) {
  const got = resolveExercise(name).id;
  if (got !== want) bad++;
  console.log(`${got === want ? 'OK  ' : 'MAL '} ${name.padEnd(40)} -> ${got}${got === want ? '' : ` (esperado ${want})`}`);
}
console.log(`\nNombres libres: ${FREE.length - bad}/${FREE.length} correctos`);
if (missing.length || bad) process.exit(1);
