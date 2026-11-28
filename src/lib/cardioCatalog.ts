// Ejercicios extra para el Coach, Entrenamiento libre y Calle y barras:
// cardio (bici, cinta, correr, remo, comba…) y funcional (saltos, barras y
// calistenia, CrossFit). La Biblioteca del Motor (fitkLibrary.ts) es la
// importada del Excel y no se toca: esto va aparte.
// Cardio: continuo (minutos) o por intervalos (series de segundos con descanso).
// Funcional: series × repeticiones (o segundos) con su descanso.

import type { Exercise, WeeklySession } from '@/types/user';
import { estimateSessionMinutes } from '@/lib/fitkMotor';

export type CardioPlace = 'gym' | 'outdoor' | 'home';
export type CardioStyle = 'suave' | 'intervalos' | 'mixto';

interface CardioDef {
  id: string;
  name: string;
  places: CardioPlace[];
  style: 'continuo' | 'intervalos';
  /** Continuo: minutos. Intervalos: segundos de trabajo por serie. */
  work: number;
  sets?: number;
  restSeconds?: number;
  /** Pauta de intensidad que se enseña al usuario. */
  how: string;
  /** Palabras con las que la gente lo pide. */
  aliases: string[];
  family: string;
}

const DEFS: CardioDef[] = [
  // ── Gimnasio ──
  { id: 'cardio-bici-suave', name: 'Bicicleta estática suave', places: ['gym', 'home'], style: 'continuo', work: 25, family: 'bici',
    how: 'Ritmo cómodo: puedes hablar en frases cortas (zona 2, esfuerzo 5-6 sobre 10). Cadencia de 80-90 rpm.',
    aliases: ['bici', 'bicicleta', 'estatica', 'spinning', 'ciclo indoor'] },
  { id: 'cardio-bici-intervalos', name: 'Bicicleta estática por intervalos', places: ['gym', 'home'], style: 'intervalos', work: 30, sets: 8, restSeconds: 90, family: 'bici',
    how: '30 s fuerte (esfuerzo 8-9 sobre 10) y 90 s pedaleando suave. Calienta 5 minutos antes.',
    aliases: ['bici', 'bicicleta', 'spinning', 'intervalos', 'hiit bici'] },
  { id: 'cardio-cinta-inclinada', name: 'Caminar en cinta inclinada', places: ['gym'], style: 'continuo', work: 20, family: 'cinta',
    how: 'Inclinación 8-12 % a 4,5-5,5 km/h sin agarrarte a las barras. Exigente pero sin impacto.',
    aliases: ['cinta', 'caminar', 'inclinada', 'inclinacion', 'treadmill', '12 3 30'] },
  { id: 'cardio-cinta-carrera', name: 'Carrera en cinta', places: ['gym'], style: 'continuo', work: 20, family: 'carrera',
    how: 'Ritmo constante en el que puedas hablar a ratos (esfuerzo 6 sobre 10). Pon un 1 % de inclinación.',
    aliases: ['cinta', 'correr', 'carrera', 'running', 'treadmill'] },
  { id: 'cardio-eliptica', name: 'Elíptica', places: ['gym'], style: 'continuo', work: 20, family: 'eliptica',
    how: 'Ritmo cómodo y constante, empujando también con los brazos. Sin impacto en las rodillas.',
    aliases: ['eliptica', 'eliptico', 'bicicleta eliptica'] },
  { id: 'cardio-remo', name: 'Remo ergómetro', places: ['gym'], style: 'continuo', work: 15, family: 'remo',
    how: 'Empuja primero con las piernas, luego espalda y por último brazos. 22-26 paladas por minuto.',
    aliases: ['remo', 'ergometro', 'maquina de remo', 'rowing'] },
  { id: 'cardio-escaladora', name: 'Escaladora', places: ['gym'], style: 'continuo', work: 15, family: 'escaleras',
    how: 'Paso completo sin apoyarte en las barras. Ritmo que puedas mantener todo el tiempo.',
    aliases: ['escaladora', 'stairmaster', 'escaleras', 'step mill'] },
  { id: 'cardio-airbike', name: 'Air bike por intervalos', places: ['gym'], style: 'intervalos', work: 20, sets: 6, restSeconds: 100, family: 'bici',
    how: '20 s a tope empujando y tirando con los brazos y 100 s muy suave. Muy intenso: solo si ya tienes base.',
    aliases: ['air bike', 'assault', 'airbike', 'bici de aire', 'echo bike'] },
  // ── Aire libre ──
  { id: 'cardio-correr-suave', name: 'Correr suave al aire libre', places: ['outdoor'], style: 'continuo', work: 30, family: 'carrera',
    how: 'Ritmo conversacional (zona 2). Si te ahogas, alterna 4 min corriendo y 1 min andando.',
    aliases: ['correr', 'carrera', 'running', 'trotar', 'footing', 'rodaje', 'aire libre'] },
  { id: 'cardio-series-carrera', name: 'Series de carrera', places: ['outdoor'], style: 'intervalos', work: 60, sets: 6, restSeconds: 90, family: 'carrera',
    how: '1 min rápido (esfuerzo 8 sobre 10) y 90 s trotando o andando. Calienta 10 minutos suave antes.',
    aliases: ['series', 'intervalos', 'fartlek', 'correr', 'carrera', 'sprints'] },
  { id: 'cardio-caminata', name: 'Caminata rápida', places: ['outdoor'], style: 'continuo', work: 40, family: 'caminar',
    how: 'Paso vivo, que notes que respiras más fuerte pero puedas hablar. Mejor con cuestas.',
    aliases: ['caminar', 'andar', 'paseo', 'caminata', 'marcha'] },
  { id: 'cardio-ciclismo', name: 'Ciclismo al aire libre', places: ['outdoor'], style: 'continuo', work: 45, family: 'bici',
    how: 'Ritmo cómodo y constante; en las subidas baja de marcha antes de que se te disparen las pulsaciones.',
    aliases: ['ciclismo', 'bici', 'bicicleta', 'carretera', 'mtb', 'montana'] },
  { id: 'cardio-escaleras', name: 'Subir escaleras', places: ['outdoor', 'home'], style: 'intervalos', work: 60, sets: 8, restSeconds: 60, family: 'escaleras',
    how: 'Sube 1 min a buen ritmo (un escalón cada vez) y baja andando con calma para recuperar.',
    aliases: ['escaleras', 'escalones', 'subir escaleras', 'gradas'] },
  { id: 'cardio-natacion', name: 'Natación continua', places: ['outdoor'], style: 'continuo', work: 30, family: 'natacion',
    how: 'Ritmo cómodo, respirando cada 3 brazadas. Si hace falta, descansa 20 s cada 100 m.',
    aliases: ['nadar', 'natacion', 'piscina', 'largos'] },
  // ── Casa / sin material ──
  { id: 'cardio-comba', name: 'Saltar a la comba', places: ['home', 'outdoor', 'gym'], style: 'intervalos', work: 60, sets: 10, restSeconds: 30, family: 'comba',
    how: '1 min saltando con saltos bajos y muñecas sueltas, 30 s de descanso. Calzado con buena amortiguación.',
    aliases: ['comba', 'cuerda', 'saltar a la comba', 'saltar la cuerda', 'jump rope'] },
  { id: 'cardio-hiit-casa', name: 'HIIT sin material', places: ['home', 'outdoor'], style: 'intervalos', work: 40, sets: 8, restSeconds: 20, family: 'hiit',
    how: 'Alterna en cada serie: jumping jacks, rodillas arriba, burpees sin salto y escaladores. 40 s a buen ritmo y 20 s de descanso.',
    aliases: ['hiit', 'tabata', 'sin material', 'en casa', 'burpees', 'jumping jacks', 'circuito'] },
];


// ── Funcional: saltos, barras y calistenia, CrossFit ──────────────────
type FuncCategory = 'saltos' | 'barras' | 'calistenia' | 'crossfit';
interface FuncDef {
  id: string;
  name: string;
  places: CardioPlace[];
  category: FuncCategory;
  muscle: Exercise['targetMuscle'];
  sets: number;
  reps: number;
  unit?: 'reps' | 'seconds';
  restSeconds: number;
  perSide?: boolean;
  /** Exige base: el Coach lo avisa y no lo mete en sesiones automáticas de principiante. */
  advanced?: boolean;
  how: string;
  aliases: string[];
}

const FUNC: FuncDef[] = [
  // Saltos y pliometría
  { id: 'func-saltos-cajon', name: 'Saltos al cajón', places: ['gym', 'outdoor'], category: 'saltos', muscle: 'legs', sets: 4, reps: 8, restSeconds: 75,
    how: 'Salta con los dos pies, aterriza suave con las rodillas hacia fuera y baja andando. En la calle, un banco firme.', aliases: ['box jump', 'cajon', 'saltos al cajon', 'saltar al banco'] },
  { id: 'func-sentadilla-salto', name: 'Sentadilla con salto', places: ['gym', 'outdoor', 'home'], category: 'saltos', muscle: 'legs', sets: 4, reps: 10, restSeconds: 60,
    how: 'Baja a sentadilla y salta explosivo; aterriza flexionando y enlaza la siguiente.', aliases: ['jump squat', 'sentadilla salto', 'saltos', 'sentadillas con salto'] },
  { id: 'func-zancada-salto', name: 'Zancadas con salto', places: ['gym', 'outdoor', 'home'], category: 'saltos', muscle: 'legs', sets: 3, reps: 8, restSeconds: 60, perSide: true,
    how: 'Desde zancada, salta y cambia de pierna en el aire. Rodilla de atrás cerca del suelo.', aliases: ['jumping lunges', 'zancadas saltando', 'tijeras', 'saltos'] },
  { id: 'func-skater', name: 'Saltos laterales (skater)', places: ['gym', 'outdoor', 'home'], category: 'saltos', muscle: 'legs', sets: 3, reps: 10, restSeconds: 45, perSide: true,
    how: 'Salta de lado a lado aterrizando sobre una pierna, como un patinador. Controla el aterrizaje.', aliases: ['skater', 'saltos laterales', 'patinador'] },
  { id: 'func-salto-longitud', name: 'Salto de longitud', places: ['gym', 'outdoor'], category: 'saltos', muscle: 'legs', sets: 4, reps: 5, restSeconds: 90,
    how: 'Brazos atrás, salta hacia delante lo más lejos que puedas y aterriza clavado. Vuelve andando.', aliases: ['broad jump', 'salto horizontal', 'salto de longitud'] },
  { id: 'func-double-unders', name: 'Comba doble (double unders)', places: ['gym', 'outdoor', 'home'], category: 'saltos', muscle: 'legs', sets: 5, reps: 20, restSeconds: 60, advanced: true,
    how: 'Dos pasadas de cuerda por salto: muñecas rápidas y salto algo más alto. Si no te salen, 3 saltos simples por cada intento.', aliases: ['double unders', 'dobles', 'comba doble', 'du'] },
  // Barras
  { id: 'func-dominadas-supinas', name: 'Dominadas supinas (chin-ups)', places: ['gym', 'outdoor'], category: 'barras', muscle: 'back', sets: 4, reps: 6, restSeconds: 120,
    how: 'Palmas hacia ti, a la anchura de los hombros. Sube hasta pasar la barbilla y baja controlando.', aliases: ['chin up', 'chin ups', 'dominadas supinas', 'dominadas agarre supino', 'barra'] },
  { id: 'func-dominadas-anchas', name: 'Dominadas agarre ancho', places: ['gym', 'outdoor'], category: 'barras', muscle: 'back', sets: 4, reps: 6, restSeconds: 120,
    how: 'Agarre más ancho que los hombros, pecho hacia la barra y escápulas abajo.', aliases: ['dominadas abiertas', 'dominadas anchas', 'pull ups', 'barra'] },
  { id: 'func-dominadas-negativas', name: 'Dominadas negativas', places: ['gym', 'outdoor'], category: 'barras', muscle: 'back', sets: 4, reps: 5, restSeconds: 90,
    how: 'Sube de un salto o con un banco y baja lo más lento que puedas (3-5 s). Ideal si aún no haces dominadas.', aliases: ['negativas', 'dominadas excentricas', 'dominadas con salto', 'barra'] },
  { id: 'func-muscle-up', name: 'Muscle-up en barra', places: ['gym', 'outdoor'], category: 'barras', muscle: 'back', sets: 4, reps: 3, restSeconds: 150, advanced: true,
    how: 'Dominada explosiva hasta la cadera y transición por encima de la barra. Solo con 10 dominadas limpias de base.', aliases: ['muscle up', 'muscle ups', 'subida a la barra'] },
  { id: 'func-toes-to-bar', name: 'Pies a la barra (toes to bar)', places: ['gym', 'outdoor'], category: 'barras', muscle: 'core', sets: 4, reps: 8, restSeconds: 90, advanced: true,
    how: 'Colgado, lleva los pies a tocar la barra con un pequeño balanceo controlado.', aliases: ['toes to bar', 't2b', 'pies a la barra'] },
  { id: 'func-knees-to-elbows', name: 'Rodillas a los codos', places: ['gym', 'outdoor'], category: 'barras', muscle: 'core', sets: 3, reps: 10, restSeconds: 75,
    how: 'Colgado de la barra, sube las rodillas hasta tocar los codos y baja sin balancearte.', aliases: ['knees to elbows', 'k2e', 'rodillas al pecho colgado'] },
  { id: 'func-dead-hang', name: 'Colgarse de la barra', places: ['gym', 'outdoor'], category: 'barras', muscle: 'back', sets: 3, reps: 30, unit: 'seconds', restSeconds: 60,
    how: 'Colgado con los brazos estirados y hombros activos. Mejora el agarre y descomprime la espalda.', aliases: ['dead hang', 'colgarse', 'colgado', 'agarre'] },
  { id: 'func-burpee-dominada', name: 'Burpee con dominada', places: ['gym', 'outdoor'], category: 'barras', muscle: 'back', sets: 4, reps: 6, restSeconds: 90,
    how: 'Burpee debajo de la barra, salta a agarrarla y haz una dominada.', aliases: ['burpee pull up', 'burpee dominada'] },
  { id: 'func-l-sit', name: 'L-sit en paralelas', places: ['gym', 'outdoor'], category: 'barras', muscle: 'core', sets: 4, reps: 15, unit: 'seconds', restSeconds: 60,
    how: 'Brazos bloqueados en las paralelas y piernas estiradas al frente. Si cuesta, rodillas dobladas.', aliases: ['l sit', 'lsit', 'escuadra', 'paralelas'] },
  // Calistenia sin material
  { id: 'func-burpees', name: 'Burpees', places: ['gym', 'outdoor', 'home'], category: 'calistenia', muscle: 'legs', sets: 4, reps: 10, restSeconds: 60,
    how: 'Al suelo, flexión, pies a las manos y salto con palmada arriba. Ritmo constante, sin pararte.', aliases: ['burpee', 'burpees'] },
  { id: 'func-escaladores', name: 'Escaladores', places: ['gym', 'outdoor', 'home'], category: 'calistenia', muscle: 'core', sets: 4, reps: 30, unit: 'seconds', restSeconds: 30,
    how: 'En plancha, lleva las rodillas al pecho alternando rápido sin levantar la cadera.', aliases: ['mountain climbers', 'escaladores', 'climbers'] },
  { id: 'func-flexiones-diamante', name: 'Flexiones diamante', places: ['gym', 'outdoor', 'home'], category: 'calistenia', muscle: 'arms', sets: 3, reps: 10, restSeconds: 75,
    how: 'Manos juntas formando un diamante bajo el pecho; codos pegados al cuerpo. Mucho tríceps.', aliases: ['diamond push ups', 'flexiones diamante', 'flexiones cerradas'] },
  { id: 'func-flexiones-declinadas', name: 'Flexiones declinadas', places: ['gym', 'outdoor', 'home'], category: 'calistenia', muscle: 'chest', sets: 3, reps: 10, restSeconds: 75,
    how: 'Pies en un banco o escalón y manos en el suelo. Trabaja más la parte alta del pecho y el hombro.', aliases: ['decline push ups', 'flexiones declinadas', 'flexiones pies elevados'] },
  { id: 'func-pino-flexiones', name: 'Flexiones en pino contra la pared', places: ['gym', 'outdoor', 'home'], category: 'calistenia', muscle: 'shoulders', sets: 4, reps: 5, restSeconds: 120, advanced: true,
    how: 'En pino apoyado en la pared, baja la cabeza al suelo y empuja. Escala con flexiones pike si no salen.', aliases: ['handstand push up', 'hspu', 'flexiones pino', 'pino'] },
  { id: 'func-flexiones-pike', name: 'Flexiones pike', places: ['gym', 'outdoor', 'home'], category: 'calistenia', muscle: 'shoulders', sets: 3, reps: 8, restSeconds: 90,
    how: 'Cadera alta formando una V invertida; baja la cabeza entre las manos. Hombro sin material.', aliases: ['pike push ups', 'flexiones pike', 'flexiones en v'] },
  { id: 'func-pistol', name: 'Sentadilla a una pierna (pistol)', places: ['gym', 'outdoor', 'home'], category: 'calistenia', muscle: 'legs', sets: 3, reps: 5, restSeconds: 90, perSide: true, advanced: true,
    how: 'Una pierna estirada al frente y baja controlando. Agárrate a algo o baja a un banco para escalarla.', aliases: ['pistol squat', 'pistol', 'sentadilla una pierna'] },
  { id: 'func-air-squat', name: 'Sentadilla sin peso (air squat)', places: ['gym', 'outdoor', 'home'], category: 'calistenia', muscle: 'legs', sets: 4, reps: 20, restSeconds: 45,
    how: 'Rodillas hacia fuera, cadera por debajo de las rodillas y talones en el suelo. A buen ritmo.', aliases: ['air squat', 'sentadilla al aire', 'sentadillas sin peso'] },
  // CrossFit
  { id: 'func-wall-ball', name: 'Wall ball', places: ['gym'], category: 'crossfit', muscle: 'legs', sets: 4, reps: 15, restSeconds: 60,
    how: 'Sentadilla con el balón al pecho y lánzalo a la diana al subir. Recógelo y enlaza la siguiente.', aliases: ['wall ball', 'wallball', 'balon medicinal', 'wall balls'] },
  { id: 'func-kb-swing', name: 'Kettlebell swing', places: ['gym'], category: 'crossfit', muscle: 'legs', sets: 4, reps: 15, restSeconds: 60,
    how: 'Bisagra de cadera: la fuerza sale del glúteo, no de los brazos. Espalda neutra y la pesa a la altura del pecho.', aliases: ['kettlebell swing', 'kb swing', 'swing', 'pesa rusa', 'kettlebell'] },
  { id: 'func-thruster', name: 'Thruster con mancuernas', places: ['gym'], category: 'crossfit', muscle: 'legs', sets: 4, reps: 10, restSeconds: 75,
    how: 'Sentadilla frontal con las mancuernas en los hombros y, al subir, empuja por encima de la cabeza en un solo movimiento.', aliases: ['thruster', 'thrusters', 'sentadilla con press'] },
  { id: 'func-thruster-barra', name: 'Thruster con barra', places: ['gym'], category: 'crossfit', muscle: 'legs', sets: 4, reps: 8, restSeconds: 90,
    how: 'Igual que con mancuernas pero con la barra en rack frontal. Codos altos al bajar.', aliases: ['thruster barra', 'thrusters barra'] },
  { id: 'func-power-clean', name: 'Cargada de potencia (power clean)', places: ['gym'], category: 'crossfit', muscle: 'back', sets: 5, reps: 3, restSeconds: 120, advanced: true,
    how: 'Desde el suelo, extensión explosiva de cadera y recibe la barra en los hombros con media sentadilla. Técnica antes que peso.', aliases: ['power clean', 'cargada', 'clean', 'cargadas'] },
  { id: 'func-db-snatch', name: 'Arrancada con mancuerna', places: ['gym'], category: 'crossfit', muscle: 'shoulders', sets: 4, reps: 8, restSeconds: 75, perSide: true,
    how: 'Desde el suelo, sube la mancuerna en un solo tirón hasta arriba con el brazo estirado. Alterna brazos.', aliases: ['dumbbell snatch', 'snatch mancuerna', 'arrancada mancuerna', 'snatch'] },
  { id: 'func-devil-press', name: 'Devil press', places: ['gym'], category: 'crossfit', muscle: 'shoulders', sets: 4, reps: 8, restSeconds: 90,
    how: 'Burpee con las manos en dos mancuernas y, al levantarte, súbelas por encima de la cabeza en un solo movimiento.', aliases: ['devil press', 'devils press'] },
  { id: 'func-push-press', name: 'Push press con barra', places: ['gym'], category: 'crossfit', muscle: 'shoulders', sets: 4, reps: 6, restSeconds: 90,
    how: 'Pequeña flexión de rodillas y empuja la barra por encima de la cabeza aprovechando las piernas.', aliases: ['push press'] },
  { id: 'func-sit-up', name: 'Sit-up (abdominales completos)', places: ['gym', 'outdoor', 'home'], category: 'crossfit', muscle: 'core', sets: 3, reps: 20, restSeconds: 45,
    how: 'Plantas de los pies juntas, brazos atrás y sube hasta tocar los pies. Con abmat si hay.', aliases: ['sit up', 'sit ups', 'abmat', 'abdominales'] },
  { id: 'func-farmer', name: 'Paseo del granjero', places: ['gym'], category: 'crossfit', muscle: 'back', sets: 4, reps: 40, unit: 'seconds', restSeconds: 60,
    how: 'Una mancuerna o kettlebell pesada en cada mano, camina erguido con pasos cortos.', aliases: ['farmer walk', 'farmer carry', 'paseo del granjero', 'granjero'] },
  { id: 'func-trineo', name: 'Empuje de trineo', places: ['gym'], category: 'crossfit', muscle: 'legs', sets: 5, reps: 20, unit: 'seconds', restSeconds: 90,
    how: 'Brazos estirados, cuerpo inclinado y pasos cortos y potentes empujando con las piernas.', aliases: ['sled push', 'trineo', 'empuje de trineo', 'prowler'] },
  { id: 'func-box-step-over', name: 'Subidas al cajón (step-over)', places: ['gym', 'home'], category: 'crossfit', muscle: 'legs', sets: 4, reps: 12, restSeconds: 60,
    how: 'Sube al cajón o banco, pasa al otro lado y vuelve. Con mancuernas si lo quieres más duro.', aliases: ['box step over', 'step over', 'subidas al cajon'] },
];

const funcAlternatives = (d: FuncDef) => FUNC.filter(o => o.id !== d.id && o.category === d.category && o.places.some(p => d.places.includes(p)))
  .slice(0, 3).map(o => o.name);

function funcToExercise(d: FuncDef): Exercise {
  return {
    id: d.id,
    name: d.name,
    targetMuscle: d.muscle,
    sets: d.sets,
    reps: Array.from({ length: d.sets }, () => d.reps),
    repUnit: d.unit ?? 'reps',
    perSide: d.perSide,
    restSeconds: d.restSeconds,
    instructions: d.advanced ? `${d.how} Exige base: hazlo solo si dominas el movimiento.` : d.how,
    alternatives: funcAlternatives(d),
    variations: [],
    slotFunction: 'funcional',
    slotRole: 'complementario',
    reasonCodes: ['FUNCIONAL', `FUNC_${d.category.toUpperCase()}`],
  };
}

export const FUNCTIONAL_CATALOG: Exercise[] = FUNC.map(funcToExercise);

const norm = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

function toExercise(d: CardioDef): Exercise {
  const continuous = d.style === 'continuo';
  const sets = continuous ? 1 : d.sets ?? 6;
  const alternatives = DEFS.filter(o => o.id !== d.id && (o.family === d.family || o.style === d.style) && o.places.some(p => d.places.includes(p)))
    .slice(0, 3).map(o => o.name);
  return {
    id: d.id,
    name: d.name,
    targetMuscle: 'legs',
    sets,
    reps: Array.from({ length: sets }, () => d.work),
    repUnit: continuous ? 'minutes' : 'seconds',
    restSeconds: continuous ? 0 : d.restSeconds ?? 60,
    instructions: d.how,
    alternatives,
    variations: [],
    slotFunction: 'cardio',
    slotRole: 'complementario',
    reasonCodes: ['CARDIO'],
  };
}

export const CARDIO_CATALOG: Exercise[] = DEFS.map(toExercise);
const byId = new Map(DEFS.map(d => [d.id, d]));

/** Cardio + funcional: lo que no está en la Biblioteca del Motor. */
export const EXTRA_CATALOG: Exercise[] = [...CARDIO_CATALOG, ...FUNCTIONAL_CATALOG];

/** ¿Es un ejercicio de cardio? */
export const isCardio = (e: Pick<Exercise, 'id' | 'slotFunction'>) => e.slotFunction === 'cardio' || e.id.startsWith('cardio-');
/** ¿Es un ejercicio del catálogo extra (cardio o funcional)? */
export const isExtra = (e: Pick<Exercise, 'id' | 'slotFunction'>) => isCardio(e) || e.slotFunction === 'funcional' || e.id.startsWith('func-');

/** Busca en cardio y funcional por cómo lo dice el usuario («burpees», «wall ball», «bici»…). */
export function findExtraExercise(query: string): { exercise: Exercise | null; score: number; similar: string[] } {
  const cardio = findCardioExercise(query);
  const q = norm(query);
  const words = q.split(' ').filter(w => w.length > 2);
  const scored = FUNC.map(d => {
    const name = norm(d.name);
    const keys = [name, ...d.aliases.map(norm)];
    let score = name === q ? 100 : keys.some(k => k === q) ? 80 : keys.some(k => q.includes(k) && k.length > 3) ? 50 : 0;
    score += words.filter(w => keys.some(k => k.includes(w))).length * 12;
    return { d, score };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);
  const best = scored[0];
  const funcHit = best && best.score >= 30 ? funcToExercise(best.d) : null;
  if (funcHit && (best.score >= cardio.score || !cardio.exercise)) {
    return { exercise: funcHit, score: best.score, similar: [...scored.slice(0, 3).map(x => x.d.name), ...cardio.similar].slice(0, 4) };
  }
  return { exercise: cardio.exercise, score: cardio.score, similar: [...cardio.similar, ...scored.slice(0, 2).map(x => x.d.name)].slice(0, 4) };
}

/** Busca un ejercicio de cardio por cómo lo dice el usuario («bici», «correr», «remo»…). */
export function findCardioExercise(query: string): { exercise: Exercise | null; score: number; similar: string[] } {
  const q = norm(query);
  const words = q.split(' ').filter(w => w.length > 2);
  const scored = DEFS.map(d => {
    const name = norm(d.name);
    const keys = [name, ...d.aliases.map(norm)];
    let score = name === q ? 100 : keys.some(k => k === q) ? 80 : keys.some(k => q.includes(k) && k.length > 3) ? 50 : 0;
    score += words.filter(w => keys.some(k => k.includes(w))).length * 12;
    if (/interval|series|hiit|tabata|sprint/.test(q) && d.style === 'intervalos') score += 15;
    if (/suave|continu|zona 2|tranquil/.test(q) && d.style === 'continuo') score += 15;
    return { d, score };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);
  const best = scored[0];
  const asked = Number(/(\d{1,3})\s*(min|minutos|mins)\b/.exec(q)?.[1]);
  const ex = best && best.score >= 30 ? toExercise(best.d) : null;
  if (ex && ex.repUnit === 'minutes' && asked >= 5 && asked <= 120) ex.reps = [asked];
  return {
    exercise: ex,
    score: best?.score ?? 0,
    similar: scored.slice(0, 4).map(x => x.d.name),
  };
}

const est = (exercises: Exercise[]) =>
  estimateSessionMinutes({ id: 'x', sessionNumber: 0, name: '', targetMuscles: '', duration: 0, exercises, status: 'available' });

/**
 * Ajusta una sesión a los minutos elegidos: primero quita el final opcional,
 * luego baja series (mínimo 2) y por último acorta los bloques continuos.
 */
export function fitToMinutes(exercises: Exercise[], minutes: number, optionalLast = false): Exercise[] {
  let list = exercises.map(e => ({ ...e, reps: [...e.reps] }));
  const limit = minutes + 2;
  if (optionalLast && list.length > 2 && est(list) > limit) list = list.slice(0, -1);
  for (let guard = 0; guard < 80 && est(list) > limit; guard++) {
    const most = list.filter(e => e.repUnit !== 'minutes' && e.sets > 2).sort((a, b) => b.sets - a.sets)[0];
    if (most) { most.sets -= 1; most.reps = most.reps.slice(0, most.sets); continue; }
    const longest = list.filter(e => e.repUnit === 'minutes' && (e.reps[0] ?? 0) > 5).sort((a, b) => (b.reps[0] ?? 0) - (a.reps[0] ?? 0))[0];
    if (longest) { longest.reps = [Math.max(5, (longest.reps[0] ?? 0) - 2)]; continue; }
    break;
  }
  return list;
}

/** Minutos totales de un ejercicio de cardio (trabajo + descansos). */
export function cardioMinutes(e: Exercise): number {
  if (e.repUnit === 'minutes') return e.reps[0] ?? 0;
  const work = (e.reps[0] ?? 0) * e.sets;
  return Math.round((work + (e.restSeconds ?? 0) * Math.max(0, e.sets - 1)) / 60);
}

/**
 * Sesión de cardio para el Coach: calentamiento, bloque principal y vuelta a
 * la calma, ajustada a los minutos y al sitio. Respeta la máquina pedida.
 */
export function buildCardioSession(opts: { place?: CardioPlace; minutes?: number; style?: CardioStyle; machine?: string }): WeeklySession {
  const place: CardioPlace = opts.place ?? 'gym';
  const minutes = Math.max(15, Math.min(90, Math.round(opts.minutes ?? 30)));
  const style: CardioStyle = opts.style ?? 'suave';
  const pool = DEFS.filter(d => d.places.includes(place));
  const wanted = opts.machine ? findCardioExercise(opts.machine).exercise : null;
  const wantedDef = wanted ? byId.get(wanted.id) : undefined;
  const family = wantedDef?.family;

  const pick = (s: 'continuo' | 'intervalos') =>
    (wantedDef && wantedDef.style === s ? wantedDef : undefined)
    ?? pool.find(d => d.style === s && (!family || d.family === family))
    ?? pool.find(d => d.style === s)
    ?? DEFS.find(d => d.style === s)!;

  const warm = 5, cool = 5;
  const main = Math.max(8, minutes - warm - cool);
  const exercises: Exercise[] = [];
  const easy = pick('continuo');
  const warmUp = { ...toExercise(easy), id: `${easy.id}-calentamiento`, name: `Calentamiento · ${easy.name.toLowerCase()}`, reps: [warm],
    instructions: 'Muy suave, subiendo poco a poco el ritmo para preparar el cuerpo.' };

  if (style === 'suave') {
    exercises.push({ ...toExercise(easy), reps: [main + warm + cool] });
  } else if (style === 'intervalos') {
    const hard = pick('intervalos');
    const ex = toExercise(hard);
    const block = ex.reps[0] + (ex.restSeconds ?? 0);
    const sets = Math.max(4, Math.min(12, Math.floor((main * 60 + (ex.restSeconds ?? 0)) / block)));
    exercises.push(warmUp, { ...ex, sets, reps: Array.from({ length: sets }, () => ex.reps[0]) });
    exercises.push({ ...toExercise(easy), id: `${easy.id}-calma`, name: `Vuelta a la calma · ${easy.name.toLowerCase()}`, reps: [cool],
      instructions: 'Baja el ritmo hasta recuperar la respiración normal.' });
  } else {
    const hard = pick('intervalos');
    const ex = toExercise(hard);
    const half = Math.round(main / 2);
    const block = ex.reps[0] + (ex.restSeconds ?? 0);
    const sets = Math.max(3, Math.min(8, Math.floor((half * 60) / block)));
    exercises.push(warmUp, { ...toExercise(easy), reps: [main - half] }, { ...ex, sets, reps: Array.from({ length: sets }, () => ex.reps[0]) });
  }

  const fitted = fitToMinutes(exercises, minutes);
  exercises.splice(0, exercises.length, ...fitted);
  const total = Math.min(minutes, est(exercises));
  const label = style === 'suave' ? 'Cardio suave' : style === 'intervalos' ? 'Cardio por intervalos' : 'Cardio mixto';
  return {
    id: crypto.randomUUID(),
    sessionNumber: 0,
    name: label,
    targetMuscles: 'Cardio',
    duration: total,
    exercises,
    status: 'available',
  };
}

/**
 * Sesión al estilo CrossFit: calentamiento de cardio, un bloque de fuerza
 * explosiva y un circuito metabólico corto. Sin ejercicios avanzados salvo
 * que se pidan.
 */
export function buildWodSession(opts: { minutes?: number; advanced?: boolean; place?: CardioPlace; seed?: number }): WeeklySession {
  const minutes = Math.max(20, Math.min(75, Math.round(opts.minutes ?? 40)));
  const place: CardioPlace = opts.place ?? 'gym';
  const seed = opts.seed ?? Math.floor(Date.now() / 86_400_000);
  const ok = (d: FuncDef) => d.places.includes(place) && (opts.advanced || !d.advanced);
  const rot = <T,>(arr: T[], k: number) => (arr.length ? arr[(seed + k) % arr.length] : undefined);
  const strength = FUNC.filter(d => ok(d) && ['func-thruster', 'func-thruster-barra', 'func-push-press', 'func-power-clean', 'func-kb-swing', 'func-dominadas-supinas', 'func-pistol'].includes(d.id));
  const metcon = FUNC.filter(d => ok(d) && (d.category === 'crossfit' || d.category === 'saltos' || d.id === 'func-burpees') && !strength.includes(d));
  const warm = DEFS.find(d => d.places.includes(place) && d.style === 'continuo')!;
  const exercises: Exercise[] = [{ ...toExercise(warm), id: `${warm.id}-calentamiento`, name: `Calentamiento · ${warm.name.toLowerCase()}`, reps: [6],
    instructions: 'Suave, subiendo el ritmo poco a poco.' }];
  const main = rot(strength, 0);
  if (main) exercises.push(funcToExercise(main));
  const picks = new Set<string>();
  const nCircuit = minutes >= 45 ? 4 : 3;
  for (let k = 0; picks.size < nCircuit && k < metcon.length * 2; k++) { const d = rot(metcon, k * 3 + 1); if (d) picks.add(d.id); }
  for (const id of picks) { const d = FUNC.find(x => x.id === id)!; const e = funcToExercise(d); exercises.push({ ...e, restSeconds: 30 }); }
  const fin = DEFS.find(d => d.places.includes(place) && d.style === 'intervalos') ?? DEFS.find(d => d.style === 'intervalos')!;
  exercises.push(toExercise(fin));
  const fitted = fitToMinutes(exercises, minutes, true);
  return { id: crypto.randomUUID(), sessionNumber: 0, name: 'Entreno estilo CrossFit', targetMuscles: 'Cuerpo completo', duration: Math.min(minutes, est(fitted)), exercises: fitted, status: 'available' };
}

/** Ejercicios de barras, saltos y metabólicos para dar variedad a «Calle y barras» (cambian cada día). */
export function outdoorExtras(opts: { minutes: number; advanced?: boolean; seed?: number }): Exercise[] {
  const seed = opts.seed ?? Math.floor(Date.now() / 86_400_000);
  const ok = (d: FuncDef) => d.places.includes('outdoor') && (opts.advanced || !d.advanced);
  const from = (cat: FuncCategory, k: number) => { const l = FUNC.filter(d => ok(d) && d.category === cat); return l.length ? l[(seed + k) % l.length] : undefined; };
  // Primero saltos y calistenia (la Biblioteca ya trae dominadas y fondos), luego una variante de barras.
  const picks = [from('saltos', 1), from('calistenia', 2), from('barras', 0)].filter((d): d is FuncDef => !!d);
  const out = picks.map(funcToExercise);
  if (opts.minutes >= 40) {
    const fin = DEFS.filter(d => d.places.includes('outdoor') && d.style === 'intervalos');
    if (fin.length) out.push(toExercise(fin[seed % fin.length]));
  }
  return out;
}
