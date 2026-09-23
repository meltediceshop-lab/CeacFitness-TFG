// Auditoría offline: para cada uno de los 81 ejercicios reales, ¿qué imagen
// le asigna exerciseImages.ts? Marca los que caen a fallback genérico (sin
// regla de palabra clave que coincida) para revisión manual.
// Uso: npx tsx scripts/audit-exercise-images.ts
import { motorCatalog } from '../src/lib/fitkMotor';
import { resolveExercise, RULES } from '../src/lib/exerciseImages';

const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

const catalog = motorCatalog();
let matched = 0;
let fallback = 0;

for (const ex of catalog) {
  const n = normalize(ex.name);
  const ruleHit = RULES.find(r => r.kw.some(k => n.includes(k)));
  const resolved = resolveExercise(ex.name, { muscle: ex.targetMuscle });
  const tag = ruleHit ? 'matched' : 'NO-RULE (fallback)';
  if (ruleHit) matched++; else fallback++;
  console.log(`[${tag.padEnd(20)}] ${ex.name.padEnd(38)} muscle=${ex.targetMuscle.padEnd(10)} kw=${(ruleHit?.kw[0] ?? '-').padEnd(14)} -> ${resolved.id}`);
}

console.log(`\nTotal: ${catalog.length} | matched-by-keyword=${matched} | no-rule-fallback=${fallback}`);
