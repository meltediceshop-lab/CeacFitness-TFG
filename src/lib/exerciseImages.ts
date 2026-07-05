// Resolutor de imágenes de ejercicios.
// Mapea cualquier nombre (catálogo, IA, Coach — en español) a imágenes reales de
// free-exercise-db (CDN jsDelivr, fiable). Cada ejercicio tiene 2 fotogramas
// (0 = inicio, 1 = fin) que el componente alterna para simular el movimiento.

const CDN = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/';

export type Equipment = 'barbell' | 'dumbbells' | 'machine' | 'cable' | 'bodyweight' | undefined;

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
}

// Familias de movimiento con variante por equipo (ids verificados en el dataset)
type Family = Partial<Record<NonNullable<Equipment>, string>> & { default: string };
const fam = (m: Family) => (eq: Equipment): string => (eq && m[eq]) || m.default;

const SQUAT = fam({ barbell: 'Barbell_Squat', dumbbells: 'Dumbbell_Squat', bodyweight: 'Bodyweight_Squat', default: 'Barbell_Full_Squat' });
const BENCH = fam({ barbell: 'Barbell_Bench_Press_-_Medium_Grip', dumbbells: 'Dumbbell_Bench_Press', default: 'Barbell_Bench_Press_-_Medium_Grip' });
const ROW = fam({ barbell: 'Bent_Over_Barbell_Row', dumbbells: 'Bent_Over_Two-Dumbbell_Row', cable: 'Seated_Cable_Rows', machine: 'Seated_Cable_Rows', default: 'Bent_Over_Barbell_Row' });
const SHOULDER = fam({ barbell: 'Standing_Military_Press', dumbbells: 'Seated_Dumbbell_Press', default: 'Seated_Dumbbell_Press' });
const CURL = fam({ barbell: 'Barbell_Curl', dumbbells: 'Dumbbell_Bicep_Curl', default: 'Dumbbell_Bicep_Curl' });
const DEADLIFT = fam({ barbell: 'Barbell_Deadlift', dumbbells: 'Romanian_Deadlift', default: 'Barbell_Deadlift' });
const LUNGE = fam({ dumbbells: 'Dumbbell_Lunges', barbell: 'Barbell_Lunge', default: 'Dumbbell_Lunges' });

// Reglas ordenadas de más específica a más general
interface Rule { kw: string[]; pick: (eq: Equipment) => string; }
const RULES: Rule[] = [
  { kw: ['goblet'], pick: () => 'Goblet_Squat' },
  { kw: ['femoral', 'curl de pierna', 'curl femoral', 'leg curl'], pick: () => 'Lying_Leg_Curls' },
  { kw: ['martillo', 'hammer'], pick: () => 'Hammer_Curls' },
  { kw: ['rumano', 'romanian'], pick: () => 'Romanian_Deadlift' },
  { kw: ['peso muerto', 'deadlift'], pick: DEADLIFT },
  { kw: ['prensa', 'leg press'], pick: () => 'Leg_Press' },
  { kw: ['extension de cuadriceps', 'extension de pierna', 'extensiones', 'leg extension', 'cuadriceps'], pick: () => 'Leg_Extensions' },
  { kw: ['gemelo', 'pantorrilla', 'calf', 'soleo'], pick: () => 'Standing_Calf_Raises' },
  { kw: ['hip thrust', 'empuje de cadera', 'puente de gluteo', 'glute bridge', 'gluteo'], pick: () => 'Barbell_Hip_Thrust' },
  { kw: ['zancada', 'lunge', 'desplante', 'bulgara', 'split squat', 'estocada'], pick: LUNGE },
  { kw: ['sentadilla', 'squat'], pick: SQUAT },
  { kw: ['press inclinado', 'incline'], pick: () => 'Incline_Dumbbell_Press' },
  { kw: ['press de banca', 'press banca', 'bench press'], pick: BENCH },
  { kw: ['arnold'], pick: () => 'Arnold_Dumbbell_Press' },
  { kw: ['elevaciones laterales', 'elevacion lateral', 'laterales', 'lateral raise'], pick: () => 'Side_Lateral_Raise' },
  { kw: ['press militar', 'press de hombro', 'press hombro', 'press de hombros', 'shoulder press', 'military', 'overhead press'], pick: SHOULDER },
  { kw: ['face pull', 'pajaro', 'rear delt', 'pull apart'], pick: () => 'Face_Pull' },
  { kw: ['jalon', 'lat pulldown', 'polea al pecho', 'dorsal en polea', 'pulldown'], pick: () => 'Wide-Grip_Lat_Pulldown' },
  { kw: ['dominada', 'pull up', 'pull-up', 'pullup', 'jalon dominada'], pick: () => 'Pullups' },
  { kw: ['remo', 'row'], pick: ROW },
  { kw: ['press frances', 'frances', 'skull', 'patada de triceps', 'patada triceps'], pick: () => 'Triceps_Pushdown' },
  { kw: ['extension de triceps', 'triceps', 'pushdown', 'jalon de triceps'], pick: () => 'Triceps_Pushdown' },
  { kw: ['fondos', 'dips', 'fondo'], pick: () => 'Dips_-_Triceps_Version' },
  { kw: ['curl de biceps', 'curl con barra', 'curl', 'biceps'], pick: CURL },
  { kw: ['flexion', 'flexiones', 'push up', 'push-up', 'pushup', 'lagartija'], pick: () => 'Pushups' },
  { kw: ['plancha', 'plank'], pick: () => 'Plank' },
  { kw: ['crunch', 'abdominal', 'encogimiento', 'abdominales'], pick: () => 'Crunches' },
  { kw: ['elevacion de piernas', 'leg raise', 'elevaciones de pierna'], pick: () => 'Crunches' },
  { kw: ['mountain climber', 'escalador', 'burpee', 'jumping jack', 'saltos'], pick: () => 'Pushups' },
  { kw: ['aperturas', 'apertura', 'fly', 'contractor', 'pec deck'], pick: () => 'Dumbbell_Bench_Press' },
];

const MUSCLE_FALLBACK: Record<string, string> = {
  legs: 'Barbell_Full_Squat',
  chest: 'Barbell_Bench_Press_-_Medium_Grip',
  back: 'Bent_Over_Barbell_Row',
  shoulders: 'Seated_Dumbbell_Press',
  arms: 'Barbell_Curl',
  core: 'Plank',
};

function detectEquipment(n: string): Equipment {
  if (/(mancuerna|dumbbell)/.test(n)) return 'dumbbells';
  if (/(barra|barbell)/.test(n)) return 'barbell';
  if (/(maquina|machine|smith)/.test(n)) return 'machine';
  if (/(cable|polea)/.test(n)) return 'cable';
  if (/(sin peso|peso corporal|corporal|bodyweight)/.test(n)) return 'bodyweight';
  return undefined;
}

const framesFor = (id: string) => ({ start: `${CDN}${id}/0.jpg`, end: `${CDN}${id}/1.jpg` });

// Imagen genérica garantizada (existe en el CDN) — último recurso para que
// NUNCA se quede un ejercicio sin preview.
const DEFAULT_ID = 'Barbell_Full_Squat';

export interface ResolvedPreview {
  id: string | null;          // id principal (o null si no hay match)
  start: string;              // url fotograma inicio
  end: string;                // url fotograma fin
  fallback: string;           // url de respaldo (músculo o genérico global)
}

export function resolveExercise(
  name: string,
  opts: { equipment?: Equipment; muscle?: string } = {}
): ResolvedPreview {
  const n = normalize(name || '');
  const eq = opts.equipment || detectEquipment(n);
  const muscleId = opts.muscle ? MUSCLE_FALLBACK[opts.muscle] : undefined;
  // El respaldo SIEMPRE apunta a una imagen válida: el grupo muscular si lo
  // conocemos, o la imagen genérica global en cualquier otro caso.
  const fallback = framesFor(muscleId ?? DEFAULT_ID).start;

  for (const rule of RULES) {
    if (rule.kw.some(k => n.includes(k))) {
      const id = rule.pick(eq);
      const f = framesFor(id);
      return { id, start: f.start, end: f.end, fallback };
    }
  }

  if (muscleId) {
    const f = framesFor(muscleId);
    return { id: muscleId, start: f.start, end: f.end, fallback: framesFor(DEFAULT_ID).start };
  }

  // Sin coincidencia de regla ni músculo → imagen genérica garantizada
  const f = framesFor(DEFAULT_ID);
  return { id: DEFAULT_ID, start: f.start, end: f.end, fallback: '' };
}

// Miniatura (un solo fotograma) para listas
export function exerciseThumb(name: string, muscle?: string): string {
  return resolveExercise(name, { muscle }).start;
}