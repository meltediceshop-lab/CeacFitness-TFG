// ─────────────────────────────────────────────────────────────────────
// GENERADO por scripts/import-biblioteca.py — NO EDITAR A MANO.
// Fuente de verdad: FIT-K_Biblioteca_Inteligente_v2.17_Auditoria_Matriz_Muscular.xlsx (Biblioteca Inteligente v2.17).
// La Biblioteca describe; el Motor (fitkMotor.ts) decide. Para cambiar
// datos, edita el Excel y vuelve a ejecutar el importador.
// ─────────────────────────────────────────────────────────────────────

/** P=principal; S=secundario relevante; C=colaborador; E=estabilizador (LIB-MATRIX-LEVELS-101). */
export type MatrixLevel = 'P' | 'S' | 'C' | 'E';

/** Fila de la Matriz muscular: relevancia (nivel) y directitud son dimensiones distintas (MOTOR-MATRIX-DIRECT-102). */
export interface MuscleContribution {
  /** Código del Diccionario muscular (el mismo en trabajo directo e indirecto, MOTOR-MATRIX-CROSSBLOCK-104). */
  code: string;
  level: MatrixLevel;
  direct: boolean;
  function: string;
  bias: string | null;
  confidence: string;
  notes: string | null;
}

export interface MuscleEntry {
  code: string;
  name: string;
  group: string;
  type: string;
  motorUse: string;
  notes: string | null;
}

export interface RangeSpec {
  min: number | null;
  max: number | null;
  unit: 'reps' | 'seconds' | 'steps';
  perSide: boolean;
  /** "Según capacidad/variante": el rango lo decide la capacidad del usuario (MOTOR-CAPACITY-016). */
  byCapacity: boolean;
  openEnded: boolean;
  raw: string;
}

export interface LibraryExercise {
  id: string;
  name: string;
  block: string;
  family: string;
  movementPattern: string;
  compatibleRoles: string[];
  /** Bloqueado por defecto: solo elegible si el usuario lo pide expresamente (MOTOR-NECK-OPTIN-094). */
  optIn: boolean;
  equipment: string;
  /** Alternativas de requisitos de equipo: basta con cumplir UNA (Hard Filter). */
  equipmentOptions: string[][];
  loadSource: string;
  laterality: string;
  primaryMuscle: string;
  /** Texto descriptivo de la Biblioteca; la contribución estructurada vive en `muscles`. */
  secondaryNotes: string | null;
  /** Matriz muscular de la ficha (MOTOR-MATRIX-097). */
  muscles: MuscleContribution[];
  accessibility: string;
  strengthRequirement: string;
  scalability: string;
  stability: string;
  localFatigue: string;
  systemicDemand: string;
  progressionSuitability: string;
  nearFailureSuitability: string;
  repSpec: RangeSpec;
  restSpec: RangeSpec;
  setupCost: string;
  executionTimeCost: string;
  densitySuitability: string;
  substitutionFamily: string;
  motorNotes: string | null;
}

/** Configuración registrada dentro de una ficha (LIB-VARIANT-001): no es un ejercicio aparte. */
export interface LibraryVariant {
  baseId: string;
  name: string;
  type: string;
  changes: string;
  rule: string;
}

export const LIBRARY: LibraryExercise[] = [
  {
    "id": "chest_barbell_bench_press",
    "name": "Press banca barra",
    "block": "Pecho",
    "family": "Press horizontal",
    "movementPattern": "Empuje horizontal",
    "compatibleRoles": [
      "Principal"
    ],
    "optIn": false,
    "equipment": "Barra+banco+rack",
    "equipmentOptions": [
      [
        "barra",
        "banco",
        "rack"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Pecho",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "pec_major",
        "level": "P",
        "direct": true,
        "function": "Aducción horizontal / empuje",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "triceps",
        "level": "S",
        "direct": false,
        "function": "Extensión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "ant_delt",
        "level": "S",
        "direct": false,
        "function": "Flexión/aducción horizontal de hombro",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "serratus",
        "level": "C",
        "direct": false,
        "function": "Control escapular",
        "bias": null,
        "confidence": "Media",
        "notes": "Relevancia dependiente de implementación/libertad escapular."
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Baja-Media",
    "scalability": "Alta",
    "stability": "Media",
    "localFatigue": "Media-Alta",
    "systemicDemand": "Media-Alta",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Media",
    "repSpec": {
      "min": 5,
      "max": 12,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "5-12"
    },
    "restSpec": {
      "min": 120,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "120-180 s"
    },
    "setupCost": "Alto",
    "executionTimeCost": "Medio",
    "densitySuitability": "Baja-Media",
    "substitutionFamily": "Press horizontal",
    "motorNotes": "Sin bonus por barra"
  },
  {
    "id": "chest_db_bench_press",
    "name": "Press banca mancuernas",
    "block": "Pecho",
    "family": "Press horizontal",
    "movementPattern": "Empuje horizontal",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Mancuernas+banco",
    "equipmentOptions": [
      [
        "mancuernas",
        "banco"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Pecho",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "pec_major",
        "level": "P",
        "direct": true,
        "function": "Aducción horizontal / empuje",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "triceps",
        "level": "S",
        "direct": false,
        "function": "Extensión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "ant_delt",
        "level": "S",
        "direct": false,
        "function": "Flexión/aducción horizontal de hombro",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "serratus",
        "level": "C",
        "direct": false,
        "function": "Control escapular",
        "bias": null,
        "confidence": "Media",
        "notes": "Relevancia dependiente de implementación/libertad escapular."
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Baja-Media",
    "scalability": "Alta",
    "stability": "Media",
    "localFatigue": "Media",
    "systemicDemand": "Media",
    "progressionSuitability": "Media-Alta",
    "nearFailureSuitability": "Media-Alta",
    "repSpec": {
      "min": 6,
      "max": 15,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-15"
    },
    "restSpec": {
      "min": 90,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "90-180 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Medio",
    "densitySuitability": "Media",
    "substitutionFamily": "Press horizontal",
    "motorNotes": null
  },
  {
    "id": "chest_smith_bench_press",
    "name": "Press banca Smith",
    "block": "Pecho",
    "family": "Press horizontal",
    "movementPattern": "Empuje horizontal",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Smith+banco",
    "equipmentOptions": [
      [
        "smith",
        "banco"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Pecho",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "pec_major",
        "level": "P",
        "direct": true,
        "function": "Aducción horizontal / empuje",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "triceps",
        "level": "S",
        "direct": false,
        "function": "Extensión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "ant_delt",
        "level": "S",
        "direct": false,
        "function": "Flexión/aducción horizontal de hombro",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "serratus",
        "level": "C",
        "direct": false,
        "function": "Control escapular",
        "bias": null,
        "confidence": "Media",
        "notes": "Relevancia dependiente de implementación/libertad escapular."
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Media",
    "systemicDemand": "Baja-Media",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 6,
      "max": 15,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-15"
    },
    "restSpec": {
      "min": 90,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "90-180 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Bajo-Medio",
    "densitySuitability": "Alta",
    "substitutionFamily": "Press horizontal",
    "motorNotes": "Útil para hipertrofia entrenando solo; usar topes/seguros correctamente."
  },
  {
    "id": "chest_machine_press",
    "name": "Press pecho máquina",
    "block": "Pecho",
    "family": "Press horizontal",
    "movementPattern": "Empuje horizontal",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Máquina",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Pecho",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "pec_major",
        "level": "P",
        "direct": true,
        "function": "Aducción horizontal / empuje",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "triceps",
        "level": "S",
        "direct": false,
        "function": "Extensión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "ant_delt",
        "level": "S",
        "direct": false,
        "function": "Flexión/aducción horizontal de hombro",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "serratus",
        "level": "C",
        "direct": false,
        "function": "Control escapular",
        "bias": null,
        "confidence": "Media",
        "notes": "Relevancia dependiente de implementación/libertad escapular."
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Media",
    "systemicDemand": "Baja-Media",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 6,
      "max": 15,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-15"
    },
    "restSpec": {
      "min": 90,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "90-180 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Press horizontal",
    "motorNotes": null
  },
  {
    "id": "chest_cable_press",
    "name": "Press pecho poleas",
    "block": "Pecho",
    "family": "Press horizontal",
    "movementPattern": "Empuje horizontal",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Poleas+banco opcional",
    "equipmentOptions": [
      [
        "polea"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Pecho",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "pec_major",
        "level": "P",
        "direct": true,
        "function": "Aducción horizontal / empuje",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "triceps",
        "level": "S",
        "direct": false,
        "function": "Extensión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "ant_delt",
        "level": "S",
        "direct": false,
        "function": "Flexión/aducción horizontal de hombro",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "serratus",
        "level": "C",
        "direct": false,
        "function": "Control escapular",
        "bias": null,
        "confidence": "Media",
        "notes": "Relevancia dependiente de implementación/libertad escapular."
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Media-Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Media-Alta",
    "localFatigue": "Media",
    "systemicDemand": "Baja-Media",
    "progressionSuitability": "Media-Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 6,
      "max": 15,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-15"
    },
    "restSpec": {
      "min": 90,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "90-180 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Medio",
    "densitySuitability": "Media-Alta",
    "substitutionFamily": "Press horizontal",
    "motorNotes": "Tumbado/sentado/de pie son configuraciones iniciales; no fichas Motor separadas por ahora."
  },
  {
    "id": "chest_incline_barbell",
    "name": "Press inclinado barra",
    "block": "Pecho",
    "family": "Press inclinado",
    "movementPattern": "Empuje inclinado",
    "compatibleRoles": [
      "Principal"
    ],
    "optIn": false,
    "equipment": "Barra+banco",
    "equipmentOptions": [
      [
        "barra",
        "banco"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Pecho clavicular",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "pec_major",
        "level": "P",
        "direct": true,
        "function": "Aducción horizontal / empuje inclinado",
        "bias": "Clavicular ↑",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "triceps",
        "level": "S",
        "direct": false,
        "function": "Extensión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "ant_delt",
        "level": "S",
        "direct": false,
        "function": "Flexión de hombro",
        "bias": "↑ con mayor inclinación",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "serratus",
        "level": "C",
        "direct": false,
        "function": "Control escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Baja-Media",
    "scalability": "Alta",
    "stability": "Media",
    "localFatigue": "Media-Alta",
    "systemicDemand": "Media-Alta",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Media",
    "repSpec": {
      "min": 5,
      "max": 12,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "5-12"
    },
    "restSpec": {
      "min": 120,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "120-180 s"
    },
    "setupCost": "Alto",
    "executionTimeCost": "Medio",
    "densitySuitability": "Baja-Media",
    "substitutionFamily": "Press inclinado",
    "motorNotes": null
  },
  {
    "id": "chest_incline_db",
    "name": "Press inclinado mancuernas",
    "block": "Pecho",
    "family": "Press inclinado",
    "movementPattern": "Empuje inclinado",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Mancuernas+banco",
    "equipmentOptions": [
      [
        "mancuernas",
        "banco"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Pecho clavicular",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "pec_major",
        "level": "P",
        "direct": true,
        "function": "Aducción horizontal / empuje inclinado",
        "bias": "Clavicular ↑",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "triceps",
        "level": "S",
        "direct": false,
        "function": "Extensión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "ant_delt",
        "level": "S",
        "direct": false,
        "function": "Flexión de hombro",
        "bias": "↑ con mayor inclinación",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "serratus",
        "level": "C",
        "direct": false,
        "function": "Control escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Baja-Media",
    "scalability": "Alta",
    "stability": "Media",
    "localFatigue": "Media",
    "systemicDemand": "Media",
    "progressionSuitability": "Media-Alta",
    "nearFailureSuitability": "Media-Alta",
    "repSpec": {
      "min": 6,
      "max": 15,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-15"
    },
    "restSpec": {
      "min": 90,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "90-180 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Medio",
    "densitySuitability": "Media",
    "substitutionFamily": "Press inclinado",
    "motorNotes": null
  },
  {
    "id": "chest_incline_smith",
    "name": "Press inclinado Smith",
    "block": "Pecho",
    "family": "Press inclinado",
    "movementPattern": "Empuje inclinado",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Smith+banco inclinado",
    "equipmentOptions": [
      [
        "smith",
        "banco"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Pecho clavicular",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "pec_major",
        "level": "P",
        "direct": true,
        "function": "Aducción horizontal / empuje inclinado",
        "bias": "Clavicular ↑",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "triceps",
        "level": "S",
        "direct": false,
        "function": "Extensión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "ant_delt",
        "level": "S",
        "direct": false,
        "function": "Flexión de hombro",
        "bias": "↑ con mayor inclinación",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "serratus",
        "level": "C",
        "direct": false,
        "function": "Control escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Media",
    "systemicDemand": "Baja-Media",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 6,
      "max": 15,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-15"
    },
    "restSpec": {
      "min": 90,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "90-180 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Bajo-Medio",
    "densitySuitability": "Alta",
    "substitutionFamily": "Press inclinado",
    "motorNotes": "Ángulo estándar de referencia ≈30°; inclinaciones altas aumentan contribución del deltoide anterior."
  },
  {
    "id": "chest_incline_machine",
    "name": "Press inclinado máquina",
    "block": "Pecho",
    "family": "Press inclinado",
    "movementPattern": "Empuje inclinado",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Máquina",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Pecho clavicular",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "pec_major",
        "level": "P",
        "direct": true,
        "function": "Aducción horizontal / empuje inclinado",
        "bias": "Clavicular ↑",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "triceps",
        "level": "S",
        "direct": false,
        "function": "Extensión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "ant_delt",
        "level": "S",
        "direct": false,
        "function": "Flexión de hombro",
        "bias": "↑ con mayor inclinación",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "serratus",
        "level": "C",
        "direct": false,
        "function": "Control escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Media",
    "systemicDemand": "Baja-Media",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 6,
      "max": 15,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-15"
    },
    "restSpec": {
      "min": 90,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "90-180 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Press inclinado",
    "motorNotes": null
  },
  {
    "id": "chest_incline_cable",
    "name": "Press inclinado poleas",
    "block": "Pecho",
    "family": "Press inclinado",
    "movementPattern": "Empuje inclinado",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Poleas+banco inclinado",
    "equipmentOptions": [
      [
        "polea",
        "banco"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Pecho clavicular",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "pec_major",
        "level": "P",
        "direct": true,
        "function": "Aducción horizontal / empuje inclinado",
        "bias": "Clavicular ↑",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "triceps",
        "level": "S",
        "direct": false,
        "function": "Extensión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "ant_delt",
        "level": "S",
        "direct": false,
        "function": "Flexión de hombro",
        "bias": "↑ con mayor inclinación",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "serratus",
        "level": "C",
        "direct": false,
        "function": "Control escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Media-Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Media-Alta",
    "localFatigue": "Media",
    "systemicDemand": "Baja-Media",
    "progressionSuitability": "Media-Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 6,
      "max": 15,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-15"
    },
    "restSpec": {
      "min": 90,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "90-180 s"
    },
    "setupCost": "Medio-Alto",
    "executionTimeCost": "Medio",
    "densitySuitability": "Media",
    "substitutionFamily": "Press inclinado",
    "motorNotes": "Ángulo estándar de referencia ≈30°; resistencia por cable."
  },
  {
    "id": "chest_decline_barbell",
    "name": "Press declinado barra",
    "block": "Pecho",
    "family": "Press declinado",
    "movementPattern": "Empuje declinado",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Barra+banco declinado+rack",
    "equipmentOptions": [
      [
        "barra",
        "banco",
        "rack"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Pecho",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "pec_major",
        "level": "P",
        "direct": true,
        "function": "Aducción horizontal / empuje declinado",
        "bias": "Esternocostal",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "triceps",
        "level": "S",
        "direct": false,
        "function": "Extensión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "ant_delt",
        "level": "C",
        "direct": false,
        "function": "Colaboración en empuje",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "serratus",
        "level": "C",
        "direct": false,
        "function": "Control escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Baja-Media",
    "scalability": "Alta",
    "stability": "Media",
    "localFatigue": "Media-Alta",
    "systemicDemand": "Media-Alta",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Media",
    "repSpec": {
      "min": 5,
      "max": 12,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "5-12"
    },
    "restSpec": {
      "min": 120,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "120-180 s"
    },
    "setupCost": "Alto",
    "executionTimeCost": "Medio",
    "densitySuitability": "Baja-Media",
    "substitutionFamily": "Press declinado",
    "motorNotes": "Opción de programación, no requisito de incluir plano+inclinado+declinado en una misma sesión."
  },
  {
    "id": "chest_decline_db",
    "name": "Press declinado mancuernas",
    "block": "Pecho",
    "family": "Press declinado",
    "movementPattern": "Empuje declinado",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Mancuernas+banco declinado",
    "equipmentOptions": [
      [
        "mancuernas",
        "banco"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Pecho",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "pec_major",
        "level": "P",
        "direct": true,
        "function": "Aducción horizontal / empuje declinado",
        "bias": "Esternocostal",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "triceps",
        "level": "S",
        "direct": false,
        "function": "Extensión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "ant_delt",
        "level": "C",
        "direct": false,
        "function": "Colaboración en empuje",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "serratus",
        "level": "C",
        "direct": false,
        "function": "Control escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Baja-Media",
    "scalability": "Alta",
    "stability": "Media",
    "localFatigue": "Media",
    "systemicDemand": "Media",
    "progressionSuitability": "Media-Alta",
    "nearFailureSuitability": "Media-Alta",
    "repSpec": {
      "min": 6,
      "max": 15,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-15"
    },
    "restSpec": {
      "min": 90,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "90-180 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Medio",
    "densitySuitability": "Media",
    "substitutionFamily": "Press declinado",
    "motorNotes": null
  },
  {
    "id": "chest_decline_machine",
    "name": "Press declinado máquina",
    "block": "Pecho",
    "family": "Press declinado",
    "movementPattern": "Empuje declinado",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Máquina",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Pecho",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "pec_major",
        "level": "P",
        "direct": true,
        "function": "Aducción horizontal / empuje declinado",
        "bias": "Esternocostal",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "triceps",
        "level": "S",
        "direct": false,
        "function": "Extensión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "ant_delt",
        "level": "C",
        "direct": false,
        "function": "Colaboración en empuje",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "serratus",
        "level": "C",
        "direct": false,
        "function": "Control escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Media",
    "systemicDemand": "Baja-Media",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 6,
      "max": 15,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-15"
    },
    "restSpec": {
      "min": 90,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "90-180 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Press declinado",
    "motorNotes": null
  },
  {
    "id": "chest_cable_fly",
    "name": "Aperturas polea",
    "block": "Pecho",
    "family": "Aducción horizontal",
    "movementPattern": "Aducción horizontal",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "optIn": false,
    "equipment": "Polea",
    "equipmentOptions": [
      [
        "polea"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Pecho",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "pec_major",
        "level": "P",
        "direct": true,
        "function": "Aducción horizontal",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "ant_delt",
        "level": "C",
        "direct": false,
        "function": "Colaboración en movimiento del hombro",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "biceps_stabilizer",
        "level": "E",
        "direct": false,
        "function": "Estabilización de hombro/codo",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Media-Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Media-Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Media",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 10,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "10-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Bajo-Medio",
    "densitySuitability": "Alta",
    "substitutionFamily": "Aducción pecho",
    "motorNotes": null
  },
  {
    "id": "chest_pec_deck",
    "name": "Peck deck",
    "block": "Pecho",
    "family": "Aducción horizontal",
    "movementPattern": "Aducción horizontal",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "optIn": false,
    "equipment": "Máquina",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Pecho",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "pec_major",
        "level": "P",
        "direct": true,
        "function": "Aducción horizontal",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "ant_delt",
        "level": "C",
        "direct": false,
        "function": "Colaboración en movimiento del hombro",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "biceps_stabilizer",
        "level": "E",
        "direct": false,
        "function": "Estabilización de hombro/codo",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Media-Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 8,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Aducción pecho",
    "motorNotes": null
  },
  {
    "id": "chest_db_fly",
    "name": "Aperturas mancuernas",
    "block": "Pecho",
    "family": "Aducción horizontal",
    "movementPattern": "Aducción horizontal",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "optIn": false,
    "equipment": "Mancuernas+banco",
    "equipmentOptions": [
      [
        "mancuernas",
        "banco"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Pecho",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "pec_major",
        "level": "P",
        "direct": true,
        "function": "Aducción horizontal",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "ant_delt",
        "level": "C",
        "direct": false,
        "function": "Colaboración en movimiento del hombro",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "biceps_stabilizer",
        "level": "E",
        "direct": false,
        "function": "Estabilización de hombro/codo",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Media",
    "localFatigue": "Baja-Media",
    "systemicDemand": "Baja",
    "progressionSuitability": "Media",
    "nearFailureSuitability": "Media-Alta",
    "repSpec": {
      "min": 8,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Aducción pecho",
    "motorNotes": "Evitar perseguir carga/ROM excesivos; ejecución controlada."
  },
  {
    "id": "chest_pushup",
    "name": "Flexiones",
    "block": "Pecho",
    "family": "Press horizontal",
    "movementPattern": "Empuje horizontal",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Peso corporal",
    "equipmentOptions": [
      []
    ],
    "loadSource": "Corporal+opcional",
    "laterality": "Bilateral",
    "primaryMuscle": "Pecho",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "pec_major",
        "level": "P",
        "direct": true,
        "function": "Aducción horizontal / empuje",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "triceps",
        "level": "S",
        "direct": false,
        "function": "Extensión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "ant_delt",
        "level": "S",
        "direct": false,
        "function": "Flexión/aducción horizontal de hombro",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "serratus",
        "level": "S",
        "direct": false,
        "function": "Protracción/control escapular",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización global",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Variable",
    "scalability": "Alta",
    "stability": "Media-Alta",
    "localFatigue": "Baja-Media",
    "systemicDemand": "Baja",
    "progressionSuitability": "Media",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": null,
      "max": null,
      "unit": "reps",
      "perSide": false,
      "byCapacity": true,
      "openEnded": false,
      "raw": "Según variante"
    },
    "restSpec": {
      "min": 60,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-180 s"
    },
    "setupCost": "Mínimo",
    "executionTimeCost": "Bajo-Medio",
    "densitySuitability": "Alta",
    "substitutionFamily": "Press horizontal",
    "motorNotes": "Peso corporal ≠ fácil"
  },
  {
    "id": "back_lat_pulldown",
    "name": "Jalón al pecho",
    "block": "Espalda",
    "family": "Tirón vertical",
    "movementPattern": "Tirón vertical",
    "compatibleRoles": [
      "Principal"
    ],
    "optIn": false,
    "equipment": "Polea/máquina",
    "equipmentOptions": [
      [
        "polea"
      ],
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Dorsal",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "latissimus",
        "level": "P",
        "direct": true,
        "function": "Aducción/extensión de hombro",
        "bias": "Sesgo según agarre y trayectoria del codo",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "biceps_brachii",
        "level": "S",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "Agarre/posición del antebrazo modifica contribución relativa",
        "confidence": "Alta",
        "notes": "Trabajo indirecto de tirones; no equivale automáticamente a trabajo directo de curl."
      },
      {
        "code": "brachialis",
        "level": "S",
        "direct": false,
        "function": "Flexión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": "Trabajo indirecto de tirones."
      },
      {
        "code": "brachioradialis",
        "level": "C",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "↑ relativo con agarres neutros/pronados",
        "confidence": "Media",
        "notes": "Sesgo depende del agarre; no reducir trabajo directo de antebrazo por defecto."
      },
      {
        "code": "mid_trap",
        "level": "C",
        "direct": false,
        "function": "Control/retracción escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "low_trap",
        "level": "C",
        "direct": false,
        "function": "Control/depresión escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "rhomboids",
        "level": "C",
        "direct": false,
        "function": "Control/retracción escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Media",
    "systemicDemand": "Baja-Media",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 6,
      "max": 15,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-15"
    },
    "restSpec": {
      "min": 90,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "90-180 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Media-Alta",
    "substitutionFamily": "Tirón vertical",
    "motorNotes": "MOTOR único para agarre prono amplio, neutro/estrecho y supino. El agarre modifica comodidad, ROM, trayectoria y solapamiento con flexores del codo; no crea fichas separadas."
  },
  {
    "id": "back_onearm_pulldown",
    "name": "Jalón unilateral polea",
    "block": "Espalda",
    "family": "Tirón vertical",
    "movementPattern": "Tirón vertical",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Polea",
    "equipmentOptions": [
      [
        "polea"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Unilateral",
    "primaryMuscle": "Dorsal",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "latissimus",
        "level": "P",
        "direct": true,
        "function": "Aducción/extensión de hombro",
        "bias": "Sesgo según agarre y trayectoria del codo",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "biceps_brachii",
        "level": "S",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "Agarre/posición del antebrazo modifica contribución relativa",
        "confidence": "Alta",
        "notes": "Trabajo indirecto de tirones; no equivale automáticamente a trabajo directo de curl."
      },
      {
        "code": "brachialis",
        "level": "S",
        "direct": false,
        "function": "Flexión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": "Trabajo indirecto de tirones."
      },
      {
        "code": "brachioradialis",
        "level": "C",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "↑ relativo con agarres neutros/pronados",
        "confidence": "Media",
        "notes": "Sesgo depende del agarre; no reducir trabajo directo de antebrazo por defecto."
      },
      {
        "code": "mid_trap",
        "level": "C",
        "direct": false,
        "function": "Control/retracción escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "low_trap",
        "level": "C",
        "direct": false,
        "function": "Control/depresión escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "rhomboids",
        "level": "C",
        "direct": false,
        "function": "Control/retracción escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Media-Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Media",
    "systemicDemand": "Baja-Media",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 6,
      "max": 15,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-15"
    },
    "restSpec": {
      "min": 90,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "90-180 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Alto",
    "densitySuitability": "Media",
    "substitutionFamily": "Tirón vertical",
    "motorNotes": "Coste unilateral. Lateralidad útil, no checklist obligatorio."
  },
  {
    "id": "back_pullup",
    "name": "Dominadas",
    "block": "Espalda",
    "family": "Tirón vertical",
    "movementPattern": "Tirón vertical",
    "compatibleRoles": [
      "Principal"
    ],
    "optIn": false,
    "equipment": "Barra dominadas",
    "equipmentOptions": [
      [
        "dominadas"
      ]
    ],
    "loadSource": "Corporal+opcional",
    "laterality": "Bilateral",
    "primaryMuscle": "Dorsal",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "latissimus",
        "level": "P",
        "direct": true,
        "function": "Aducción/extensión de hombro",
        "bias": "Sesgo según agarre y trayectoria del codo",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "biceps_brachii",
        "level": "S",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "Agarre/posición del antebrazo modifica contribución relativa",
        "confidence": "Alta",
        "notes": "Trabajo indirecto de tirones; no equivale automáticamente a trabajo directo de curl."
      },
      {
        "code": "brachialis",
        "level": "S",
        "direct": false,
        "function": "Flexión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": "Trabajo indirecto de tirones."
      },
      {
        "code": "brachioradialis",
        "level": "C",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "↑ relativo con agarres neutros/pronados",
        "confidence": "Media",
        "notes": "Sesgo depende del agarre; no reducir trabajo directo de antebrazo por defecto."
      },
      {
        "code": "mid_trap",
        "level": "C",
        "direct": false,
        "function": "Control/retracción escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "low_trap",
        "level": "C",
        "direct": false,
        "function": "Control/depresión escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "rhomboids",
        "level": "C",
        "direct": false,
        "function": "Control/retracción escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Alta",
    "scalability": "Media",
    "stability": "Media",
    "localFatigue": "Media-Alta",
    "systemicDemand": "Media",
    "progressionSuitability": "Media-Alta",
    "nearFailureSuitability": "Media-Alta",
    "repSpec": {
      "min": null,
      "max": null,
      "unit": "reps",
      "perSide": false,
      "byCapacity": true,
      "openEnded": false,
      "raw": "Según capacidad"
    },
    "restSpec": {
      "min": 120,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "120-180 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Medio",
    "densitySuitability": "Baja-Media",
    "substitutionFamily": "Tirón vertical",
    "motorNotes": "Pronada, neutra y supina/chin-up son configuraciones. Lastrada = método de carga/progresión. Si no alcanza el rango objetivo con buena técnica → dominada asistida."
  },
  {
    "id": "back_assisted_pullup",
    "name": "Dominadas asistidas",
    "block": "Espalda",
    "family": "Tirón vertical",
    "movementPattern": "Tirón vertical",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Máquina/banda elástica",
    "equipmentOptions": [
      [
        "maquina"
      ],
      [
        "banda"
      ]
    ],
    "loadSource": "Corporal asistida",
    "laterality": "Bilateral",
    "primaryMuscle": "Dorsal",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "latissimus",
        "level": "P",
        "direct": true,
        "function": "Aducción/extensión de hombro",
        "bias": "Sesgo según agarre y trayectoria del codo",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "biceps_brachii",
        "level": "S",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "Agarre/posición del antebrazo modifica contribución relativa",
        "confidence": "Alta",
        "notes": "Trabajo indirecto de tirones; no equivale automáticamente a trabajo directo de curl."
      },
      {
        "code": "brachialis",
        "level": "S",
        "direct": false,
        "function": "Flexión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": "Trabajo indirecto de tirones."
      },
      {
        "code": "brachioradialis",
        "level": "C",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "↑ relativo con agarres neutros/pronados",
        "confidence": "Media",
        "notes": "Sesgo depende del agarre; no reducir trabajo directo de antebrazo por defecto."
      },
      {
        "code": "mid_trap",
        "level": "C",
        "direct": false,
        "function": "Control/retracción escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "low_trap",
        "level": "C",
        "direct": false,
        "function": "Control/depresión escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "rhomboids",
        "level": "C",
        "direct": false,
        "function": "Control/retracción escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Media-Alta",
    "strengthRequirement": "Variable",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Media",
    "systemicDemand": "Baja-Media",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 6,
      "max": 15,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-15"
    },
    "restSpec": {
      "min": 90,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "90-180 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Medio",
    "densitySuitability": "Media",
    "substitutionFamily": "Tirón vertical",
    "motorNotes": "Máquina o banda = método de asistencia. La asistencia ajusta la fuerza requerida; no es una ficha distinta por tipo de asistencia."
  },
  {
    "id": "back_cable_row",
    "name": "Remo sentado polea",
    "block": "Espalda",
    "family": "Tirón horizontal",
    "movementPattern": "Tirón horizontal",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Polea",
    "equipmentOptions": [
      [
        "polea"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Espalda media/dorsal",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "latissimus",
        "level": "P",
        "direct": true,
        "function": "Extensión de hombro / tirón horizontal",
        "bias": "Sesgo relativo según trayectoria del codo",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "mid_trap",
        "level": "P",
        "direct": true,
        "function": "Retracción escapular",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "rhomboids",
        "level": "P",
        "direct": true,
        "function": "Retracción escapular",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "post_delt",
        "level": "S",
        "direct": false,
        "function": "Extensión/abducción horizontal de hombro",
        "bias": "↑ con codo más abierto",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "biceps_brachii",
        "level": "S",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "Agarre/posición del antebrazo modifica contribución relativa",
        "confidence": "Alta",
        "notes": "Trabajo indirecto de tirones; no equivale automáticamente a trabajo directo de curl."
      },
      {
        "code": "brachialis",
        "level": "S",
        "direct": false,
        "function": "Flexión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": "Trabajo indirecto de tirones."
      },
      {
        "code": "brachioradialis",
        "level": "C",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "↑ relativo con agarres neutros/pronados",
        "confidence": "Media",
        "notes": "Sesgo depende del agarre; no reducir trabajo directo de antebrazo por defecto."
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Media",
    "systemicDemand": "Baja-Media",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 6,
      "max": 15,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-15"
    },
    "restSpec": {
      "min": 90,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "90-180 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Media-Alta",
    "substitutionFamily": "Tirón horizontal",
    "motorNotes": "Agarre neutro/estrecho, prono/ancho y cuerda son configuraciones. Trayectoria del codo informa sesgo relativo dorsal ↔ espalda media/alta."
  },
  {
    "id": "back_onearm_cable_row",
    "name": "Remo unilateral polea",
    "block": "Espalda",
    "family": "Tirón horizontal",
    "movementPattern": "Tirón horizontal",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Polea",
    "equipmentOptions": [
      [
        "polea"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Unilateral",
    "primaryMuscle": "Dorsal/espalda media",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "latissimus",
        "level": "P",
        "direct": true,
        "function": "Extensión de hombro / tirón horizontal",
        "bias": "Sesgo relativo según trayectoria del codo",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "mid_trap",
        "level": "P",
        "direct": true,
        "function": "Retracción escapular",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "rhomboids",
        "level": "P",
        "direct": true,
        "function": "Retracción escapular",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "post_delt",
        "level": "S",
        "direct": false,
        "function": "Extensión/abducción horizontal de hombro",
        "bias": "↑ con codo más abierto",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "biceps_brachii",
        "level": "S",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "Agarre/posición del antebrazo modifica contribución relativa",
        "confidence": "Alta",
        "notes": "Trabajo indirecto de tirones; no equivale automáticamente a trabajo directo de curl."
      },
      {
        "code": "brachialis",
        "level": "S",
        "direct": false,
        "function": "Flexión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": "Trabajo indirecto de tirones."
      },
      {
        "code": "brachioradialis",
        "level": "C",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "↑ relativo con agarres neutros/pronados",
        "confidence": "Media",
        "notes": "Sesgo depende del agarre; no reducir trabajo directo de antebrazo por defecto."
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Media-Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Media-Alta",
    "localFatigue": "Media",
    "systemicDemand": "Baja-Media",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 6,
      "max": 15,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-15"
    },
    "restSpec": {
      "min": 90,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "90-180 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Alto",
    "densitySuitability": "Media",
    "substitutionFamily": "Tirón horizontal",
    "motorNotes": "De pie, sentado o con apoyo; polea media/baja o alta/diagonal son configuraciones. Unilateralidad y trayectoria sí informan al Motor."
  },
  {
    "id": "back_onearm_db_row",
    "name": "Remo mancuerna unilateral",
    "block": "Espalda",
    "family": "Tirón horizontal",
    "movementPattern": "Tirón horizontal",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Mancuerna+apoyo",
    "equipmentOptions": [
      [
        "mancuernas"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Unilateral",
    "primaryMuscle": "Dorsal/espalda media",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "latissimus",
        "level": "P",
        "direct": true,
        "function": "Extensión de hombro / tirón horizontal",
        "bias": "Sesgo relativo según trayectoria del codo",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "mid_trap",
        "level": "P",
        "direct": true,
        "function": "Retracción escapular",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "rhomboids",
        "level": "P",
        "direct": true,
        "function": "Retracción escapular",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "post_delt",
        "level": "S",
        "direct": false,
        "function": "Extensión/abducción horizontal de hombro",
        "bias": "↑ con codo más abierto",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "biceps_brachii",
        "level": "S",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "Agarre/posición del antebrazo modifica contribución relativa",
        "confidence": "Alta",
        "notes": "Trabajo indirecto de tirones; no equivale automáticamente a trabajo directo de curl."
      },
      {
        "code": "brachialis",
        "level": "S",
        "direct": false,
        "function": "Flexión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": "Trabajo indirecto de tirones."
      },
      {
        "code": "brachioradialis",
        "level": "C",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "↑ relativo con agarres neutros/pronados",
        "confidence": "Media",
        "notes": "Sesgo depende del agarre; no reducir trabajo directo de antebrazo por defecto."
      },
      {
        "code": "erectors",
        "level": "S",
        "direct": false,
        "function": "Estabilización isométrica del tronco",
        "bias": null,
        "confidence": "Alta",
        "notes": "Mayor demanda que en remos con pecho apoyado."
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Media-Alta",
    "localFatigue": "Media",
    "systemicDemand": "Baja-Media",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Media-Alta",
    "repSpec": {
      "min": 6,
      "max": 15,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-15"
    },
    "restSpec": {
      "min": 90,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "90-180 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Alto",
    "densitySuitability": "Media",
    "substitutionFamily": "Tirón horizontal",
    "motorNotes": "Apoyo de mano/rodilla, apoyo parcial o sin apoyo = configuraciones. Trayectoria del codo informa sesgo relativo."
  },
  {
    "id": "back_bentover_db_row",
    "name": "Remo inclinado dos mancuernas",
    "block": "Espalda",
    "family": "Tirón horizontal",
    "movementPattern": "Tirón horizontal",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Mancuernas",
    "equipmentOptions": [
      [
        "mancuernas"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Espalda media/dorsal",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "latissimus",
        "level": "P",
        "direct": true,
        "function": "Extensión de hombro / tirón horizontal",
        "bias": "Sesgo relativo según trayectoria del codo",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "mid_trap",
        "level": "P",
        "direct": true,
        "function": "Retracción escapular",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "rhomboids",
        "level": "P",
        "direct": true,
        "function": "Retracción escapular",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "post_delt",
        "level": "S",
        "direct": false,
        "function": "Extensión/abducción horizontal de hombro",
        "bias": "↑ con codo más abierto",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "biceps_brachii",
        "level": "S",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "Agarre/posición del antebrazo modifica contribución relativa",
        "confidence": "Alta",
        "notes": "Trabajo indirecto de tirones; no equivale automáticamente a trabajo directo de curl."
      },
      {
        "code": "brachialis",
        "level": "S",
        "direct": false,
        "function": "Flexión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": "Trabajo indirecto de tirones."
      },
      {
        "code": "brachioradialis",
        "level": "C",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "↑ relativo con agarres neutros/pronados",
        "confidence": "Media",
        "notes": "Sesgo depende del agarre; no reducir trabajo directo de antebrazo por defecto."
      },
      {
        "code": "erectors",
        "level": "S",
        "direct": false,
        "function": "Estabilización isométrica del tronco",
        "bias": null,
        "confidence": "Alta",
        "notes": "Mayor demanda que en remos con pecho apoyado."
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Baja-Media",
    "scalability": "Alta",
    "stability": "Media",
    "localFatigue": "Media-Alta",
    "systemicDemand": "Media-Alta",
    "progressionSuitability": "Media-Alta",
    "nearFailureSuitability": "Media",
    "repSpec": {
      "min": 6,
      "max": 15,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-15"
    },
    "restSpec": {
      "min": 90,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "90-180 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Medio",
    "densitySuitability": "Media",
    "substitutionFamily": "Tirón horizontal",
    "motorNotes": "Sin apoyo: mayor demanda de tronco que una variante pecho apoyado."
  },
  {
    "id": "back_chest_supported_db_row",
    "name": "Remo mancuernas pecho apoyado",
    "block": "Espalda",
    "family": "Tirón horizontal",
    "movementPattern": "Tirón horizontal",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Mancuernas+banco inclinado",
    "equipmentOptions": [
      [
        "mancuernas",
        "banco"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Espalda media/dorsal",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "latissimus",
        "level": "P",
        "direct": true,
        "function": "Extensión de hombro / tirón horizontal",
        "bias": "Sesgo relativo según trayectoria del codo",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "mid_trap",
        "level": "P",
        "direct": true,
        "function": "Retracción escapular",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "rhomboids",
        "level": "P",
        "direct": true,
        "function": "Retracción escapular",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "post_delt",
        "level": "S",
        "direct": false,
        "function": "Extensión/abducción horizontal de hombro",
        "bias": "↑ con codo más abierto",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "biceps_brachii",
        "level": "S",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "Agarre/posición del antebrazo modifica contribución relativa",
        "confidence": "Alta",
        "notes": "Trabajo indirecto de tirones; no equivale automáticamente a trabajo directo de curl."
      },
      {
        "code": "brachialis",
        "level": "S",
        "direct": false,
        "function": "Flexión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": "Trabajo indirecto de tirones."
      },
      {
        "code": "brachioradialis",
        "level": "C",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "↑ relativo con agarres neutros/pronados",
        "confidence": "Media",
        "notes": "Sesgo depende del agarre; no reducir trabajo directo de antebrazo por defecto."
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Baja-Media",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Media",
    "systemicDemand": "Baja-Media",
    "progressionSuitability": "Media-Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 6,
      "max": 15,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-15"
    },
    "restSpec": {
      "min": 90,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "90-180 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Medio",
    "densitySuitability": "Alta",
    "substitutionFamily": "Tirón horizontal",
    "motorNotes": "Bilateral con apoyo torácico: reduce demanda postural frente al remo inclinado sin apoyo; mantiene libertad de trayectoria de cada mancuerna."
  },
  {
    "id": "back_barbell_row",
    "name": "Remo barra",
    "block": "Espalda",
    "family": "Tirón horizontal",
    "movementPattern": "Tirón horizontal",
    "compatibleRoles": [
      "Principal"
    ],
    "optIn": false,
    "equipment": "Barra",
    "equipmentOptions": [
      [
        "barra"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Espalda media/dorsal",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "latissimus",
        "level": "P",
        "direct": true,
        "function": "Extensión de hombro / tirón horizontal",
        "bias": "Sesgo relativo según trayectoria del codo",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "mid_trap",
        "level": "P",
        "direct": true,
        "function": "Retracción escapular",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "rhomboids",
        "level": "P",
        "direct": true,
        "function": "Retracción escapular",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "post_delt",
        "level": "S",
        "direct": false,
        "function": "Extensión/abducción horizontal de hombro",
        "bias": "↑ con codo más abierto",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "biceps_brachii",
        "level": "S",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "Agarre/posición del antebrazo modifica contribución relativa",
        "confidence": "Alta",
        "notes": "Trabajo indirecto de tirones; no equivale automáticamente a trabajo directo de curl."
      },
      {
        "code": "brachialis",
        "level": "S",
        "direct": false,
        "function": "Flexión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": "Trabajo indirecto de tirones."
      },
      {
        "code": "brachioradialis",
        "level": "C",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "↑ relativo con agarres neutros/pronados",
        "confidence": "Media",
        "notes": "Sesgo depende del agarre; no reducir trabajo directo de antebrazo por defecto."
      },
      {
        "code": "erectors",
        "level": "S",
        "direct": false,
        "function": "Estabilización isométrica del tronco",
        "bias": null,
        "confidence": "Alta",
        "notes": "Mayor demanda que en remos con pecho apoyado."
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Baja-Media",
    "scalability": "Alta",
    "stability": "Baja-Media",
    "localFatigue": "Alta",
    "systemicDemand": "Alta",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Media",
    "repSpec": {
      "min": 5,
      "max": 12,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "5-12"
    },
    "restSpec": {
      "min": 120,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "120-180 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Medio",
    "densitySuitability": "Baja",
    "substitutionFamily": "Tirón horizontal",
    "motorNotes": "Agarre prono/supino y trayectoria de codos son configuraciones. Peso libre sin apoyo: alta demanda de tronco y libertad de trayectoria."
  },
  {
    "id": "back_smith_row",
    "name": "Remo Smith",
    "block": "Espalda",
    "family": "Tirón horizontal",
    "movementPattern": "Tirón horizontal",
    "compatibleRoles": [
      "Principal"
    ],
    "optIn": false,
    "equipment": "Smith/multipower",
    "equipmentOptions": [
      [
        "smith"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Espalda media/dorsal",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "latissimus",
        "level": "P",
        "direct": true,
        "function": "Extensión de hombro / tirón horizontal",
        "bias": "Sesgo relativo según trayectoria del codo",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "mid_trap",
        "level": "P",
        "direct": true,
        "function": "Retracción escapular",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "rhomboids",
        "level": "P",
        "direct": true,
        "function": "Retracción escapular",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "post_delt",
        "level": "S",
        "direct": false,
        "function": "Extensión/abducción horizontal de hombro",
        "bias": "↑ con codo más abierto",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "biceps_brachii",
        "level": "S",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "Agarre/posición del antebrazo modifica contribución relativa",
        "confidence": "Alta",
        "notes": "Trabajo indirecto de tirones; no equivale automáticamente a trabajo directo de curl."
      },
      {
        "code": "brachialis",
        "level": "S",
        "direct": false,
        "function": "Flexión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": "Trabajo indirecto de tirones."
      },
      {
        "code": "brachioradialis",
        "level": "C",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "↑ relativo con agarres neutros/pronados",
        "confidence": "Media",
        "notes": "Sesgo depende del agarre; no reducir trabajo directo de antebrazo por defecto."
      },
      {
        "code": "erectors",
        "level": "S",
        "direct": false,
        "function": "Estabilización isométrica del tronco",
        "bias": null,
        "confidence": "Alta",
        "notes": "Mayor demanda que en remos con pecho apoyado."
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Media-Alta",
    "strengthRequirement": "Baja-Media",
    "scalability": "Alta",
    "stability": "Media-Alta",
    "localFatigue": "Media-Alta",
    "systemicDemand": "Media",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 6,
      "max": 15,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-15"
    },
    "restSpec": {
      "min": 90,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "90-180 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Medio",
    "densitySuitability": "Media",
    "substitutionFamily": "Tirón horizontal",
    "motorNotes": "Trayectoria guiada y mayor estabilidad que barra libre, pero sin apoyo torácico: la demanda postural sigue siendo relevante. Prono/supino = configuración."
  },
  {
    "id": "back_tbar_row",
    "name": "Remo T libre / Landmine",
    "block": "Espalda",
    "family": "Tirón horizontal",
    "movementPattern": "Tirón horizontal",
    "compatibleRoles": [
      "Principal"
    ],
    "optIn": false,
    "equipment": "T-Bar / barra anclada / landmine",
    "equipmentOptions": [
      [
        "maquina"
      ],
      [
        "barra"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Espalda media/dorsal",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "latissimus",
        "level": "P",
        "direct": true,
        "function": "Extensión de hombro / tirón horizontal",
        "bias": "Sesgo relativo según trayectoria del codo",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "mid_trap",
        "level": "P",
        "direct": true,
        "function": "Retracción escapular",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "rhomboids",
        "level": "P",
        "direct": true,
        "function": "Retracción escapular",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "post_delt",
        "level": "S",
        "direct": false,
        "function": "Extensión/abducción horizontal de hombro",
        "bias": "↑ con codo más abierto",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "biceps_brachii",
        "level": "S",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "Agarre/posición del antebrazo modifica contribución relativa",
        "confidence": "Alta",
        "notes": "Trabajo indirecto de tirones; no equivale automáticamente a trabajo directo de curl."
      },
      {
        "code": "brachialis",
        "level": "S",
        "direct": false,
        "function": "Flexión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": "Trabajo indirecto de tirones."
      },
      {
        "code": "brachioradialis",
        "level": "C",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "↑ relativo con agarres neutros/pronados",
        "confidence": "Media",
        "notes": "Sesgo depende del agarre; no reducir trabajo directo de antebrazo por defecto."
      },
      {
        "code": "erectors",
        "level": "S",
        "direct": false,
        "function": "Estabilización isométrica del tronco",
        "bias": null,
        "confidence": "Alta",
        "notes": "Mayor demanda que en remos con pecho apoyado."
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Media-Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Media",
    "localFatigue": "Media-Alta",
    "systemicDemand": "Media-Alta",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Media-Alta",
    "repSpec": {
      "min": 6,
      "max": 15,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-15"
    },
    "restSpec": {
      "min": 90,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "90-180 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Medio",
    "densitySuitability": "Media",
    "substitutionFamily": "Tirón horizontal",
    "motorNotes": "Sin apoyo torácico. Barra anclada con trayectoria en arco; agarres y trayectoria de codos son configuraciones."
  },
  {
    "id": "back_chest_supported_tbar_row",
    "name": "Remo T con pecho apoyado",
    "block": "Espalda",
    "family": "Tirón horizontal",
    "movementPattern": "Tirón horizontal",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "T-Bar/máquina plate-loaded con apoyo torácico",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Espalda media/dorsal",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "latissimus",
        "level": "P",
        "direct": true,
        "function": "Extensión de hombro / tirón horizontal",
        "bias": "Sesgo relativo según trayectoria del codo",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "mid_trap",
        "level": "P",
        "direct": true,
        "function": "Retracción escapular",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "rhomboids",
        "level": "P",
        "direct": true,
        "function": "Retracción escapular",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "post_delt",
        "level": "S",
        "direct": false,
        "function": "Extensión/abducción horizontal de hombro",
        "bias": "↑ con codo más abierto",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "biceps_brachii",
        "level": "S",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "Agarre/posición del antebrazo modifica contribución relativa",
        "confidence": "Alta",
        "notes": "Trabajo indirecto de tirones; no equivale automáticamente a trabajo directo de curl."
      },
      {
        "code": "brachialis",
        "level": "S",
        "direct": false,
        "function": "Flexión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": "Trabajo indirecto de tirones."
      },
      {
        "code": "brachioradialis",
        "level": "C",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "↑ relativo con agarres neutros/pronados",
        "confidence": "Media",
        "notes": "Sesgo depende del agarre; no reducir trabajo directo de antebrazo por defecto."
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Baja-Media",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 6,
      "max": 15,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-15"
    },
    "restSpec": {
      "min": 90,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "90-180 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Tirón horizontal",
    "motorNotes": "MOTOR independiente por apoyo torácico, estabilidad alta y menor demanda postural; útil para acumular trabajo cuando ya existe fatiga."
  },
  {
    "id": "back_supported_row",
    "name": "Remo sentado en máquina/guiada",
    "block": "Espalda",
    "family": "Tirón horizontal",
    "movementPattern": "Tirón horizontal",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Máquina",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral/Unilateral",
    "primaryMuscle": "Espalda media/dorsal",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "latissimus",
        "level": "P",
        "direct": true,
        "function": "Extensión de hombro / tirón horizontal",
        "bias": "Sesgo relativo según trayectoria del codo",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "mid_trap",
        "level": "P",
        "direct": true,
        "function": "Retracción escapular",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "rhomboids",
        "level": "P",
        "direct": true,
        "function": "Retracción escapular",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "post_delt",
        "level": "S",
        "direct": false,
        "function": "Extensión/abducción horizontal de hombro",
        "bias": "↑ con codo más abierto",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "biceps_brachii",
        "level": "S",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "Agarre/posición del antebrazo modifica contribución relativa",
        "confidence": "Alta",
        "notes": "Trabajo indirecto de tirones; no equivale automáticamente a trabajo directo de curl."
      },
      {
        "code": "brachialis",
        "level": "S",
        "direct": false,
        "function": "Flexión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": "Trabajo indirecto de tirones."
      },
      {
        "code": "brachioradialis",
        "level": "C",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "↑ relativo con agarres neutros/pronados",
        "confidence": "Media",
        "notes": "Sesgo depende del agarre; no reducir trabajo directo de antebrazo por defecto."
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Baja-Media",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 6,
      "max": 15,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-15"
    },
    "restSpec": {
      "min": 90,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "90-180 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Tirón horizontal",
    "motorNotes": "Máquina de fuerza, no ergómetro. Bilateral, unilateral o alterno según máquina; selectorized/plate-loaded, iso-lateral y trayectoria de codos son configuraciones."
  },
  {
    "id": "back_high_row_machine",
    "name": "Remo alto en máquina / High Row",
    "block": "Espalda",
    "family": "Tirón diagonal",
    "movementPattern": "Tirón diagonal",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Máquina High Row",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral/Unilateral",
    "primaryMuscle": "Dorsal/espalda media",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "latissimus",
        "level": "P",
        "direct": true,
        "function": "Extensión/aducción de hombro",
        "bias": "Trayectoria diagonal",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "mid_trap",
        "level": "P",
        "direct": true,
        "function": "Retracción escapular",
        "bias": "Espalda media/alta ↑",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "rhomboids",
        "level": "P",
        "direct": true,
        "function": "Retracción escapular",
        "bias": "Espalda media/alta ↑",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "post_delt",
        "level": "S",
        "direct": false,
        "function": "Extensión/abducción horizontal de hombro",
        "bias": "↑ según apertura del codo",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "biceps_brachii",
        "level": "S",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "Agarre/posición del antebrazo modifica contribución relativa",
        "confidence": "Alta",
        "notes": "Trabajo indirecto de tirones; no equivale automáticamente a trabajo directo de curl."
      },
      {
        "code": "brachialis",
        "level": "S",
        "direct": false,
        "function": "Flexión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": "Trabajo indirecto de tirones."
      },
      {
        "code": "brachioradialis",
        "level": "C",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "↑ relativo con agarres neutros/pronados",
        "confidence": "Media",
        "notes": "Sesgo depende del agarre; no reducir trabajo directo de antebrazo por defecto."
      },
      {
        "code": "low_trap",
        "level": "C",
        "direct": false,
        "function": "Control escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Baja-Media",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 6,
      "max": 15,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-15"
    },
    "restSpec": {
      "min": 90,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "90-180 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Tirón diagonal",
    "motorNotes": "Trayectoria diagonal desde arriba-delante hacia abajo-atrás. Se separa del remo horizontal porque la dirección de tirón cambia la función usada por el Motor."
  },
  {
    "id": "back_inverted_row",
    "name": "Remo invertido",
    "block": "Espalda",
    "family": "Tirón horizontal",
    "movementPattern": "Tirón horizontal",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Barra/Smith/TRX/anillas",
    "equipmentOptions": [
      [
        "barra"
      ],
      [
        "smith"
      ],
      [
        "suspension"
      ]
    ],
    "loadSource": "Corporal+opcional",
    "laterality": "Bilateral",
    "primaryMuscle": "Espalda media/dorsal",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "latissimus",
        "level": "P",
        "direct": true,
        "function": "Extensión de hombro / tirón horizontal",
        "bias": "Sesgo relativo según trayectoria del codo",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "mid_trap",
        "level": "P",
        "direct": true,
        "function": "Retracción escapular",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "rhomboids",
        "level": "P",
        "direct": true,
        "function": "Retracción escapular",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "post_delt",
        "level": "S",
        "direct": false,
        "function": "Extensión/abducción horizontal de hombro",
        "bias": "↑ con codo más abierto",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "biceps_brachii",
        "level": "S",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "Agarre/posición del antebrazo modifica contribución relativa",
        "confidence": "Alta",
        "notes": "Trabajo indirecto de tirones; no equivale automáticamente a trabajo directo de curl."
      },
      {
        "code": "brachialis",
        "level": "S",
        "direct": false,
        "function": "Flexión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": "Trabajo indirecto de tirones."
      },
      {
        "code": "brachioradialis",
        "level": "C",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "↑ relativo con agarres neutros/pronados",
        "confidence": "Media",
        "notes": "Sesgo depende del agarre; no reducir trabajo directo de antebrazo por defecto."
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización corporal",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Variable",
    "scalability": "Alta",
    "stability": "Media",
    "localFatigue": "Media",
    "systemicDemand": "Baja-Media",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Media-Alta",
    "repSpec": {
      "min": null,
      "max": null,
      "unit": "reps",
      "perSide": false,
      "byCapacity": true,
      "openEnded": false,
      "raw": "Según variante"
    },
    "restSpec": {
      "min": 60,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-180 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo-Medio",
    "densitySuitability": "Alta",
    "substitutionFamily": "Tirón horizontal",
    "motorNotes": "Tirón horizontal con peso corporal. Altura/inclinación, pies elevados y lastre son progresiones; barra/Smith/TRX/anillas son configuraciones."
  },
  {
    "id": "back_cable_pullover",
    "name": "Pullover polea",
    "block": "Espalda",
    "family": "Extensión hombro",
    "movementPattern": "Extensión hombro",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "optIn": false,
    "equipment": "Polea",
    "equipmentOptions": [
      [
        "polea"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Dorsal",
    "secondaryNotes": "Redondo mayor; cabeza larga del tríceps secundaria; flexores del codo mínimos",
    "muscles": [
      {
        "code": "latissimus",
        "level": "P",
        "direct": true,
        "function": "Extensión de hombro",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "triceps",
        "level": "C",
        "direct": false,
        "function": "Colaboración de la cabeza larga en extensión de hombro",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "pec_major",
        "level": "C",
        "direct": false,
        "function": "Colaboración en extensión/aducción del hombro",
        "bias": "Dependiente de ROM y técnica",
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Media-Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Media-Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Media",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 10,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "10-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Extensión hombro",
    "motorNotes": "Cuerda/barra y agarre son configuraciones. Extensión de hombro con flexión de codo mínima; útil cuando se busca dorsal con poco solapamiento de bíceps."
  },
  {
    "id": "back_db_pullover",
    "name": "Pullover mancuerna",
    "block": "Espalda",
    "family": "Extensión hombro",
    "movementPattern": "Extensión hombro",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "optIn": false,
    "equipment": "Mancuerna+banco",
    "equipmentOptions": [
      [
        "mancuernas",
        "banco"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Dorsal/pectoral",
    "secondaryNotes": "Pectoral relevante; redondo mayor; cabeza larga del tríceps secundaria",
    "muscles": [
      {
        "code": "latissimus",
        "level": "P",
        "direct": true,
        "function": "Extensión de hombro",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "triceps",
        "level": "C",
        "direct": false,
        "function": "Colaboración de la cabeza larga en extensión de hombro",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "pec_major",
        "level": "C",
        "direct": false,
        "function": "Colaboración en extensión/aducción del hombro",
        "bias": "Dependiente de ROM y técnica",
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Media",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Media",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 10,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "10-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Media-Alta",
    "substitutionFamily": "Extensión hombro",
    "motorNotes": "MOTOR independiente del cable por perfil de resistencia y equipamiento. Fit-K debe contabilizar también la contribución pectoral; no tratarlo como aislamiento puro de dorsal."
  },
  {
    "id": "back_machine_pullover",
    "name": "Pullover máquina",
    "block": "Espalda",
    "family": "Extensión hombro",
    "movementPattern": "Extensión hombro",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "optIn": false,
    "equipment": "Máquina",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Dorsal",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "latissimus",
        "level": "P",
        "direct": true,
        "function": "Extensión de hombro",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "triceps",
        "level": "C",
        "direct": false,
        "function": "Colaboración de la cabeza larga en extensión de hombro",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "pec_major",
        "level": "C",
        "direct": false,
        "function": "Colaboración en extensión/aducción del hombro",
        "bias": "Dependiente de ROM y técnica",
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Media-Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 8,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Extensión hombro",
    "motorNotes": "Máquina específica de pullover: alta estabilidad y extensión de hombro con mínima dependencia de flexores del codo."
  },
  {
    "id": "back_face_pull",
    "name": "Face Pull",
    "block": "Espalda",
    "family": "Tirón alto / escapular",
    "movementPattern": "Retracción escapular + rotación externa",
    "compatibleRoles": [
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Polea+cuerda",
    "equipmentOptions": [
      [
        "polea"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Deltoide posterior/espalda media",
    "secondaryNotes": "Trapecio medio; romboides; rotadores externos. Dorsal bajo.",
    "muscles": [
      {
        "code": "post_delt",
        "level": "P",
        "direct": true,
        "function": "Abducción horizontal / extensión de hombro",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "mid_trap",
        "level": "P",
        "direct": true,
        "function": "Retracción escapular",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "rhomboids",
        "level": "S",
        "direct": true,
        "function": "Retracción escapular",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "rotator_cuff",
        "level": "S",
        "direct": true,
        "function": "Rotación externa / estabilización glenohumeral",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "low_trap",
        "level": "C",
        "direct": false,
        "function": "Control escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "biceps_brachii",
        "level": "S",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "Agarre/posición del antebrazo modifica contribución relativa",
        "confidence": "Alta",
        "notes": "Trabajo indirecto de tirones; no equivale automáticamente a trabajo directo de curl."
      },
      {
        "code": "brachialis",
        "level": "S",
        "direct": false,
        "function": "Flexión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": "Trabajo indirecto de tirones."
      },
      {
        "code": "brachioradialis",
        "level": "C",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "↑ relativo con agarres neutros/pronados",
        "confidence": "Media",
        "notes": "Sesgo depende del agarre; no reducir trabajo directo de antebrazo por defecto."
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Media",
        "notes": "Complementario: no sustituye automáticamente un tirón vertical u horizontal principal."
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Baja-Media",
    "systemicDemand": "Baja",
    "progressionSuitability": "Media",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 10,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "10-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Complemento escapular/posterior",
    "motorNotes": "Complemento, no sustituto automático de un jalón o remo principal. Útil para completar sesiones con énfasis en espalda media, deltoide posterior y rotadores externos."
  },
  {
    "id": "shoulder_barbell_press",
    "name": "Press hombros barra / Press militar",
    "block": "Hombro",
    "family": "Press vertical",
    "movementPattern": "Empuje vertical",
    "compatibleRoles": [
      "Principal"
    ],
    "optIn": false,
    "equipment": "Barra+rack",
    "equipmentOptions": [
      [
        "barra",
        "rack"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Deltoide anterior",
    "secondaryNotes": "Deltoide lateral; tríceps; estabilizadores escapulares/tronco",
    "muscles": [
      {
        "code": "ant_delt",
        "level": "P",
        "direct": true,
        "function": "Flexión/elevación de hombro",
        "bias": "Press vertical",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "lat_delt",
        "level": "S",
        "direct": true,
        "function": "Abducción/elevación de hombro",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "triceps",
        "level": "S",
        "direct": false,
        "function": "Extensión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "upper_trap",
        "level": "C",
        "direct": false,
        "function": "Rotación superior/control escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "serratus",
        "level": "C",
        "direct": false,
        "function": "Rotación superior/control escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": "↑ si de pie / libre",
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Baja-Media",
    "scalability": "Alta",
    "stability": "Media",
    "localFatigue": "Media-Alta",
    "systemicDemand": "Media-Alta",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Media",
    "repSpec": {
      "min": 5,
      "max": 12,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "5-12"
    },
    "restSpec": {
      "min": 120,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "120-180 s"
    },
    "setupCost": "Alto",
    "executionTimeCost": "Medio",
    "densitySuitability": "Baja-Media",
    "substitutionFamily": "Press vertical",
    "motorNotes": "De pie o sentado como configuración. Press estricto; Push Press y tras nuca fuera de V2."
  },
  {
    "id": "shoulder_db_press",
    "name": "Press hombros mancuernas",
    "block": "Hombro",
    "family": "Press vertical",
    "movementPattern": "Empuje vertical",
    "compatibleRoles": [
      "Principal"
    ],
    "optIn": false,
    "equipment": "Mancuernas",
    "equipmentOptions": [
      [
        "mancuernas"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Deltoide anterior",
    "secondaryNotes": "Deltoide lateral; tríceps; estabilizadores",
    "muscles": [
      {
        "code": "ant_delt",
        "level": "P",
        "direct": true,
        "function": "Flexión/elevación de hombro",
        "bias": "Press vertical",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "lat_delt",
        "level": "S",
        "direct": true,
        "function": "Abducción/elevación de hombro",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "triceps",
        "level": "S",
        "direct": false,
        "function": "Extensión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "upper_trap",
        "level": "C",
        "direct": false,
        "function": "Rotación superior/control escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "serratus",
        "level": "C",
        "direct": false,
        "function": "Rotación superior/control escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": "↑ si de pie / libre",
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Baja-Media",
    "scalability": "Alta",
    "stability": "Media",
    "localFatigue": "Media",
    "systemicDemand": "Media",
    "progressionSuitability": "Media-Alta",
    "nearFailureSuitability": "Media-Alta",
    "repSpec": {
      "min": 6,
      "max": 15,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-15"
    },
    "restSpec": {
      "min": 90,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "90-180 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Medio",
    "densitySuitability": "Media",
    "substitutionFamily": "Press vertical",
    "motorNotes": "Sentado/de pie y agarres como configuraciones. Arnold Press = variante avanzada seleccionable, no MOTOR independiente."
  },
  {
    "id": "shoulder_smith_press",
    "name": "Press hombros Smith",
    "block": "Hombro",
    "family": "Press vertical",
    "movementPattern": "Empuje vertical guiado",
    "compatibleRoles": [
      "Principal"
    ],
    "optIn": false,
    "equipment": "Smith",
    "equipmentOptions": [
      [
        "smith"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Deltoide anterior",
    "secondaryNotes": "Deltoide lateral; tríceps",
    "muscles": [
      {
        "code": "ant_delt",
        "level": "P",
        "direct": true,
        "function": "Flexión/elevación de hombro",
        "bias": "Press vertical",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "lat_delt",
        "level": "S",
        "direct": true,
        "function": "Abducción/elevación de hombro",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "triceps",
        "level": "S",
        "direct": false,
        "function": "Extensión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "upper_trap",
        "level": "C",
        "direct": false,
        "function": "Rotación superior/control escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "serratus",
        "level": "C",
        "direct": false,
        "function": "Rotación superior/control escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": "↑ si de pie / libre",
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Media",
    "systemicDemand": "Baja-Media",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 6,
      "max": 15,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-15"
    },
    "restSpec": {
      "min": 90,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "90-180 s"
    },
    "setupCost": "Bajo-Medio",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Press vertical",
    "motorNotes": "Ejecución de referencia Fit-K: sentado con respaldo. De pie = configuración secundaria."
  },
  {
    "id": "shoulder_machine_press",
    "name": "Press hombros máquina",
    "block": "Hombro",
    "family": "Press vertical",
    "movementPattern": "Empuje vertical guiado",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Máquina",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Deltoide anterior",
    "secondaryNotes": "Deltoide lateral; tríceps",
    "muscles": [
      {
        "code": "ant_delt",
        "level": "P",
        "direct": true,
        "function": "Flexión/elevación de hombro",
        "bias": "Press vertical",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "lat_delt",
        "level": "S",
        "direct": true,
        "function": "Abducción/elevación de hombro",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "triceps",
        "level": "S",
        "direct": false,
        "function": "Extensión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "upper_trap",
        "level": "C",
        "direct": false,
        "function": "Rotación superior/control escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "serratus",
        "level": "C",
        "direct": false,
        "function": "Rotación superior/control escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": "↑ si de pie / libre",
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Media",
    "systemicDemand": "Baja-Media",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 6,
      "max": 15,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-15"
    },
    "restSpec": {
      "min": 90,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "90-180 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Press vertical",
    "motorNotes": "Convergente, iso-lateral, plate-loaded y selectorized son configuraciones/atributos salvo diferencia Motor material."
  },
  {
    "id": "shoulder_db_lateral",
    "name": "Elevación lateral mancuernas",
    "block": "Hombro",
    "family": "Abducción",
    "movementPattern": "Abducción/elevación hombro",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "optIn": false,
    "equipment": "Mancuernas",
    "equipmentOptions": [
      [
        "mancuernas"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Deltoide lateral",
    "secondaryNotes": "Supraespinoso; trapecio/serrato como colaboradores escapulares",
    "muscles": [
      {
        "code": "lat_delt",
        "level": "P",
        "direct": true,
        "function": "Abducción/elevación de hombro",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "supraspinatus",
        "level": "S",
        "direct": false,
        "function": "Abducción / estabilidad glenohumeral",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "upper_trap",
        "level": "C",
        "direct": false,
        "function": "Rotación superior escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "serratus",
        "level": "C",
        "direct": false,
        "function": "Rotación superior escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Media-Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Media",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 10,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "10-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Abducción hombro",
    "motorNotes": "Referencia simple: de pie bilateral. Sentado, unilateral, apoyado e inclinado/tumbado son configuraciones; esta última gana elegibilidad con experiencia."
  },
  {
    "id": "shoulder_cable_lateral",
    "name": "Elevación lateral polea",
    "block": "Hombro",
    "family": "Abducción",
    "movementPattern": "Abducción/elevación hombro",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "optIn": false,
    "equipment": "Polea",
    "equipmentOptions": [
      [
        "polea"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Unilateral/Bilateral",
    "primaryMuscle": "Deltoide lateral",
    "secondaryNotes": "Supraespinoso; trapecio/serrato como colaboradores escapulares",
    "muscles": [
      {
        "code": "lat_delt",
        "level": "P",
        "direct": true,
        "function": "Abducción/elevación de hombro",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "supraspinatus",
        "level": "S",
        "direct": false,
        "function": "Abducción / estabilidad glenohumeral",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "upper_trap",
        "level": "C",
        "direct": false,
        "function": "Rotación superior escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "serratus",
        "level": "C",
        "direct": false,
        "function": "Rotación superior escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Media-Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 10,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "10-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Medio",
    "densitySuitability": "Media-Alta",
    "substitutionFamily": "Abducción hombro",
    "motorNotes": "Convencional, behind-body, lean-away, unilateral/bilateral y cuff/agarre son configuraciones."
  },
  {
    "id": "shoulder_machine_lateral",
    "name": "Elevación lateral máquina",
    "block": "Hombro",
    "family": "Abducción",
    "movementPattern": "Abducción/elevación hombro guiada",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "optIn": false,
    "equipment": "Máquina",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral/Unilateral",
    "primaryMuscle": "Deltoide lateral",
    "secondaryNotes": "Supraespinoso; colaboradores escapulares",
    "muscles": [
      {
        "code": "lat_delt",
        "level": "P",
        "direct": true,
        "function": "Abducción/elevación de hombro",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "supraspinatus",
        "level": "S",
        "direct": false,
        "function": "Abducción / estabilidad glenohumeral",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "upper_trap",
        "level": "C",
        "direct": false,
        "function": "Rotación superior escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "serratus",
        "level": "C",
        "direct": false,
        "function": "Rotación superior escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 10,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "10-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Abducción hombro",
    "motorNotes": "Pads de codo/brazo, asas, selectorized, plate-loaded e iso-lateral = configuraciones/atributos."
  },
  {
    "id": "shoulder_reverse_pecdeck",
    "name": "Reverse Pec Deck",
    "block": "Hombro",
    "family": "Deltoide posterior",
    "movementPattern": "Abducción horizontal",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "optIn": false,
    "equipment": "Máquina",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Deltoide posterior",
    "secondaryNotes": "Trapecio medio; romboides",
    "muscles": [
      {
        "code": "post_delt",
        "level": "P",
        "direct": true,
        "function": "Abducción horizontal / extensión de hombro",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "mid_trap",
        "level": "S",
        "direct": false,
        "function": "Retracción escapular",
        "bias": "↑ si se enfatiza retracción",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "rhomboids",
        "level": "S",
        "direct": false,
        "function": "Retracción escapular",
        "bias": "↑ si se enfatiza retracción",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "rotator_cuff",
        "level": "C",
        "direct": false,
        "function": "Estabilización glenohumeral",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 10,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "10-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Deltoide posterior",
    "motorNotes": "La retracción escapular modifica contribución de espalda alta; sesgo técnico, no MOTOR nuevo."
  },
  {
    "id": "shoulder_rear_delt_db",
    "name": "Pájaros mancuernas / Reverse Fly",
    "block": "Hombro",
    "family": "Deltoide posterior",
    "movementPattern": "Abducción horizontal",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "optIn": false,
    "equipment": "Mancuernas",
    "equipmentOptions": [
      [
        "mancuernas"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Deltoide posterior",
    "secondaryNotes": "Trapecio medio; romboides; estabilizadores escapulares",
    "muscles": [
      {
        "code": "post_delt",
        "level": "P",
        "direct": true,
        "function": "Abducción horizontal / extensión de hombro",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "mid_trap",
        "level": "S",
        "direct": false,
        "function": "Retracción escapular",
        "bias": "↑ si se enfatiza retracción",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "rhomboids",
        "level": "S",
        "direct": false,
        "function": "Retracción escapular",
        "bias": "↑ si se enfatiza retracción",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "rotator_cuff",
        "level": "C",
        "direct": false,
        "function": "Estabilización glenohumeral",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Media",
    "localFatigue": "Baja-Media",
    "systemicDemand": "Baja",
    "progressionSuitability": "Media",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 10,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "10-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Deltoide posterior",
    "motorNotes": "Torso inclinado, sentado inclinado y pecho apoyado son configuraciones; pecho apoyado puede priorizarse cuando interesa estabilidad."
  },
  {
    "id": "shoulder_reverse_fly_cable",
    "name": "Reverse Fly polea / Aperturas inversas",
    "block": "Hombro",
    "family": "Deltoide posterior",
    "movementPattern": "Abducción horizontal",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "optIn": false,
    "equipment": "Polea",
    "equipmentOptions": [
      [
        "polea"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Unilateral/Bilateral",
    "primaryMuscle": "Deltoide posterior",
    "secondaryNotes": "Trapecio medio; romboides; estabilizadores escapulares",
    "muscles": [
      {
        "code": "post_delt",
        "level": "P",
        "direct": true,
        "function": "Abducción horizontal / extensión de hombro",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "mid_trap",
        "level": "S",
        "direct": false,
        "function": "Retracción escapular",
        "bias": "↑ si se enfatiza retracción",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "rhomboids",
        "level": "S",
        "direct": false,
        "function": "Retracción escapular",
        "bias": "↑ si se enfatiza retracción",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "rotator_cuff",
        "level": "C",
        "direct": false,
        "function": "Estabilización glenohumeral",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Media-Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 10,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "10-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Medio",
    "densitySuitability": "Media-Alta",
    "substitutionFamily": "Deltoide posterior",
    "motorNotes": "Bilateral cruzado, unilateral, agarre/cuff y apoyos son configuraciones."
  },
  {
    "id": "shoulder_rear_delt_row",
    "name": "Remo para deltoide posterior / Rear-Delt Row",
    "block": "Hombro",
    "family": "Deltoide posterior / tirón horizontal",
    "movementPattern": "Remo con codos abiertos",
    "compatibleRoles": [
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Mancuernas/Polea/Máquina",
    "equipmentOptions": [
      [
        "mancuernas"
      ],
      [
        "polea"
      ],
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral/Unilateral",
    "primaryMuscle": "Deltoide posterior",
    "secondaryNotes": "Trapecio medio; romboides; flexores del codo",
    "muscles": [
      {
        "code": "post_delt",
        "level": "P",
        "direct": true,
        "function": "Abducción horizontal / extensión de hombro",
        "bias": "Codos abiertos",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "mid_trap",
        "level": "P",
        "direct": true,
        "function": "Retracción escapular",
        "bias": "Espalda alta ↑",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "rhomboids",
        "level": "S",
        "direct": true,
        "function": "Retracción escapular",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "biceps_brachii",
        "level": "S",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "Agarre/posición del antebrazo modifica contribución relativa",
        "confidence": "Alta",
        "notes": "Trabajo indirecto de tirones; no equivale automáticamente a trabajo directo de curl."
      },
      {
        "code": "brachialis",
        "level": "S",
        "direct": false,
        "function": "Flexión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": "Trabajo indirecto de tirones."
      },
      {
        "code": "brachioradialis",
        "level": "C",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "↑ relativo con agarres neutros/pronados",
        "confidence": "Media",
        "notes": "Sesgo depende del agarre; no reducir trabajo directo de antebrazo por defecto."
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": "Según apoyo/implemento",
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Media-Alta",
    "localFatigue": "Baja-Media",
    "systemicDemand": "Baja-Media",
    "progressionSuitability": "Media-Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 8,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Medio",
    "densitySuitability": "Media",
    "substitutionFamily": "Deltoide posterior / espalda alta",
    "motorNotes": "MOTOR funcional propio. Implemento y apoyo son configuraciones; la matriz reconoce también su trabajo de espalda alta."
  },
  {
    "id": "shoulder_front_raise",
    "name": "Elevación frontal",
    "block": "Hombro",
    "family": "Flexión hombro",
    "movementPattern": "Flexión hombro",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "optIn": false,
    "equipment": "Mancuernas/Polea/Barra-EZ/Disco",
    "equipmentOptions": [
      [
        "mancuernas"
      ],
      [
        "polea"
      ],
      [
        "barra"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral/Unilateral",
    "primaryMuscle": "Deltoide anterior",
    "secondaryNotes": "Estabilizadores escapulares",
    "muscles": [
      {
        "code": "ant_delt",
        "level": "P",
        "direct": true,
        "function": "Flexión de hombro",
        "bias": null,
        "confidence": "Alta",
        "notes": "Prioridad basal baja cuando el pressing semanal ya aporta exposición suficiente."
      },
      {
        "code": "serratus",
        "level": "C",
        "direct": false,
        "function": "Control/rotación escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "upper_trap",
        "level": "C",
        "direct": false,
        "function": "Control/rotación escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Media-Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Media",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 10,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "10-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Bajo-Medio",
    "executionTimeCost": "Bajo-Medio",
    "densitySuitability": "Media-Alta",
    "substitutionFamily": "Flexión hombro",
    "motorNotes": "Prioridad basal baja si ya existe suficiente pressing. Implementos y bilateral/alterno/unilateral = configuraciones."
  },
  {
    "id": "shoulder_external_rotation",
    "name": "Rotación externa de hombro",
    "block": "Hombro",
    "family": "Manguito rotador",
    "movementPattern": "Rotación externa glenohumeral",
    "compatibleRoles": [
      "Complementario",
      "Control"
    ],
    "optIn": false,
    "equipment": "Polea/Banda/Mancuerna",
    "equipmentOptions": [
      [
        "polea"
      ],
      [
        "banda"
      ],
      [
        "mancuernas"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Unilateral",
    "primaryMuscle": "Infraespinoso; redondo menor",
    "secondaryNotes": "Deltoide posterior según posición",
    "muscles": [
      {
        "code": "rotator_cuff",
        "level": "P",
        "direct": true,
        "function": "Rotación externa glenohumeral",
        "bias": "Infraespinoso/redondo menor",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "post_delt",
        "level": "C",
        "direct": false,
        "function": "Colaboración según posición del brazo",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Media",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 10,
      "max": 25,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "10-25"
    },
    "restSpec": {
      "min": 45,
      "max": 90,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "45-90 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Rotación externa",
    "motorNotes": "No programar por checklist. Brazo junto al torso, brazo elevado ~90° y tumbado lateral son configuraciones. No sustituye automáticamente al Face Pull."
  },
  {
    "id": "shoulder_upright_row",
    "name": "Remo al mentón / Upright Row",
    "block": "Hombro",
    "family": "Abducción + elevación escapular",
    "movementPattern": "Tirón vertical corto / abducción",
    "compatibleRoles": [
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Barra/EZ/Polea",
    "equipmentOptions": [
      [
        "barra"
      ],
      [
        "polea"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Deltoide lateral",
    "secondaryNotes": "Trapecio superior; deltoide anterior; flexores del codo",
    "muscles": [
      {
        "code": "lat_delt",
        "level": "P",
        "direct": true,
        "function": "Abducción/elevación de hombro",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "upper_trap",
        "level": "P",
        "direct": true,
        "function": "Elevación/rotación escapular",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "ant_delt",
        "level": "C",
        "direct": false,
        "function": "Elevación de hombro",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "biceps_brachii",
        "level": "S",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "Agarre/posición del antebrazo modifica contribución relativa",
        "confidence": "Alta",
        "notes": "Trabajo indirecto de tirones; no equivale automáticamente a trabajo directo de curl."
      },
      {
        "code": "brachialis",
        "level": "S",
        "direct": false,
        "function": "Flexión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": "Trabajo indirecto de tirones."
      },
      {
        "code": "brachioradialis",
        "level": "C",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "↑ relativo con agarres neutros/pronados",
        "confidence": "Media",
        "notes": "Sesgo depende del agarre; no reducir trabajo directo de antebrazo por defecto."
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Media-Alta",
    "localFatigue": "Media",
    "systemicDemand": "Baja-Media",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Media-Alta",
    "repSpec": {
      "min": 8,
      "max": 15,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-15"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Bajo-Medio",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Lateral / trapecio",
    "motorNotes": "Usar agarre y ROM cómodos; no imponer agarre estrecho ni altura máxima universal. Implemento = configuración."
  },
  {
    "id": "shoulder_landmine_press",
    "name": "Landmine Press",
    "block": "Hombro",
    "family": "Press diagonal",
    "movementPattern": "Empuje diagonal",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Landmine+barra",
    "equipmentOptions": [
      [
        "barra"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Unilateral/Bilateral",
    "primaryMuscle": "Deltoide anterior",
    "secondaryNotes": "Tríceps; pectoral; musculatura escapular",
    "muscles": [
      {
        "code": "ant_delt",
        "level": "P",
        "direct": true,
        "function": "Flexión/elevación de hombro",
        "bias": "Trayectoria diagonal",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "triceps",
        "level": "S",
        "direct": false,
        "function": "Extensión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "pec_major",
        "level": "S",
        "direct": false,
        "function": "Empuje/aducción",
        "bias": "Clavicular relativo",
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "serratus",
        "level": "S",
        "direct": false,
        "function": "Protracción/rotación superior escapular",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": "↑ unilateral/de pie/half-kneeling",
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja-Media",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Media",
    "systemicDemand": "Media",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 6,
      "max": 15,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-15"
    },
    "restSpec": {
      "min": 90,
      "max": 150,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "90-150 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Medio",
    "densitySuitability": "Media-Alta",
    "substitutionFamily": "Press diagonal",
    "motorNotes": "Útil como trayectoria distinta al press vertical. De pie, half-kneeling, unilateral/bilateral = configuraciones."
  },
  {
    "id": "shoulder_y_raise",
    "name": "Y-Raise",
    "block": "Hombro",
    "family": "Elevación escapular funcional",
    "movementPattern": "Elevación en plano escapular / rotación superior",
    "compatibleRoles": [
      "Complementario",
      "Control"
    ],
    "optIn": false,
    "equipment": "Polea/Mancuernas",
    "equipmentOptions": [
      [
        "polea"
      ],
      [
        "mancuernas"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral/Unilateral",
    "primaryMuscle": "Complejo deltoides-escápula",
    "secondaryNotes": "Trapecio; serrato anterior; estabilizadores escapulares",
    "muscles": [
      {
        "code": "low_trap",
        "level": "P",
        "direct": true,
        "function": "Rotación superior/control escapular",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "serratus",
        "level": "S",
        "direct": false,
        "function": "Rotación superior/control escapular",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "post_delt",
        "level": "C",
        "direct": false,
        "function": "Elevación en plano escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "rotator_cuff",
        "level": "C",
        "direct": false,
        "function": "Estabilización glenohumeral",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Media-Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Media",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 10,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "10-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Bajo-Medio",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Media-Alta",
    "substitutionFamily": "Control escapular / elevación",
    "motorNotes": "MOTOR propio. Gana elegibilidad con experiencia/repertorio; polea y mancuerna/banco inclinado son implementaciones."
  },
  {
    "id": "shoulder_lu_raise",
    "name": "Lu Raise",
    "block": "Hombro",
    "family": "Elevación gran recorrido",
    "movementPattern": "Abducción/elevación por encima de cabeza",
    "compatibleRoles": [
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Mancuernas/Discos",
    "equipmentOptions": [
      [
        "mancuernas"
      ],
      [
        "barra"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Deltoides",
    "secondaryNotes": "Trapecio; serrato anterior; musculatura de rotación superior escapular",
    "muscles": [
      {
        "code": "lat_delt",
        "level": "P",
        "direct": true,
        "function": "Abducción/elevación de gran recorrido",
        "bias": "ROM por encima de cabeza",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "upper_trap",
        "level": "S",
        "direct": false,
        "function": "Rotación superior/elevación escapular",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "serratus",
        "level": "S",
        "direct": false,
        "function": "Rotación superior escapular",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "ant_delt",
        "level": "C",
        "direct": false,
        "function": "Elevación de hombro",
        "bias": "Según plano de movimiento",
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "supraspinatus",
        "level": "C",
        "direct": false,
        "function": "Abducción / estabilidad",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Baja",
    "scalability": "Media-Alta",
    "stability": "Media",
    "localFatigue": "Baja-Media",
    "systemicDemand": "Baja",
    "progressionSuitability": "Media",
    "nearFailureSuitability": "Media-Alta",
    "repSpec": {
      "min": 10,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "10-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Elevación gran recorrido",
    "motorNotes": "MOTOR propio de repertorio avanzado. Elegibilidad preferente con experiencia media-alta y tolerancia/movilidad adecuadas."
  },
  {
    "id": "trap_db_shrug",
    "name": "Encogimientos mancuernas",
    "block": "Trapecio",
    "family": "Elevación escapular",
    "movementPattern": "Elevación escapular",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "optIn": false,
    "equipment": "Mancuernas",
    "equipmentOptions": [
      [
        "mancuernas"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral/Unilateral",
    "primaryMuscle": "Trapecio superior",
    "secondaryNotes": "Agarre; estabilizadores escapulares",
    "muscles": [
      {
        "code": "upper_trap",
        "level": "P",
        "direct": true,
        "function": "Elevación escapular",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "mid_trap",
        "level": "C",
        "direct": false,
        "function": "Control escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "low_trap",
        "level": "E",
        "direct": false,
        "function": "Estabilización/control escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": "Menor en variantes muy apoyadas/guiadas",
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Baja-Media",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 8,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Elevación escapular",
    "motorNotes": "MOTOR propio. Bilateral/unilateral = configuración. Straps = accesorio; no nueva ficha."
  },
  {
    "id": "trap_barbell_shrug",
    "name": "Encogimientos barra",
    "block": "Trapecio",
    "family": "Elevación escapular",
    "movementPattern": "Elevación escapular",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "optIn": false,
    "equipment": "Barra",
    "equipmentOptions": [
      [
        "barra"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Trapecio superior",
    "secondaryNotes": "Agarre; estabilizadores escapulares",
    "muscles": [
      {
        "code": "upper_trap",
        "level": "P",
        "direct": true,
        "function": "Elevación escapular",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "mid_trap",
        "level": "C",
        "direct": false,
        "function": "Control escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "low_trap",
        "level": "E",
        "direct": false,
        "function": "Estabilización/control escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": "Menor en variantes muy apoyadas/guiadas",
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Media",
    "systemicDemand": "Baja-Media",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 6,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Media-Alta",
    "substitutionFamily": "Elevación escapular",
    "motorNotes": "MOTOR propio de alta afinidad con otros shrugs. No programar junto a otro shrug solo por cambiar implemento."
  },
  {
    "id": "trap_smith_shrug",
    "name": "Encogimientos Smith",
    "block": "Trapecio",
    "family": "Elevación escapular guiada",
    "movementPattern": "Elevación escapular",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "optIn": false,
    "equipment": "Smith",
    "equipmentOptions": [
      [
        "smith"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Trapecio superior",
    "secondaryNotes": "Agarre; estabilizadores escapulares",
    "muscles": [
      {
        "code": "upper_trap",
        "level": "P",
        "direct": true,
        "function": "Elevación escapular",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "mid_trap",
        "level": "C",
        "direct": false,
        "function": "Control escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "low_trap",
        "level": "E",
        "direct": false,
        "function": "Estabilización/control escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": "Menor en variantes muy apoyadas/guiadas",
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Muy alta",
    "localFatigue": "Baja-Media",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Muy alta",
    "repSpec": {
      "min": 8,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Elevación escapular",
    "motorNotes": "MOTOR propio por trayectoria guiada, alta estabilidad y buena adecuación cerca del fallo."
  },
  {
    "id": "trap_machine_shrug",
    "name": "Encogimientos máquina",
    "block": "Trapecio",
    "family": "Elevación escapular guiada",
    "movementPattern": "Elevación escapular",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "optIn": false,
    "equipment": "Máquina",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral/Variable",
    "primaryMuscle": "Trapecio superior",
    "secondaryNotes": "Agarre; estabilizadores escapulares",
    "muscles": [
      {
        "code": "upper_trap",
        "level": "P",
        "direct": true,
        "function": "Elevación escapular",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "mid_trap",
        "level": "C",
        "direct": false,
        "function": "Control escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "low_trap",
        "level": "E",
        "direct": false,
        "function": "Estabilización/control escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": "Menor en variantes muy apoyadas/guiadas",
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Muy alta",
    "localFatigue": "Baja-Media",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Muy alta",
    "repSpec": {
      "min": 8,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Elevación escapular",
    "motorNotes": "MOTOR propio. Selectorized/plate-loaded/iso-lateral, sentado/de pie y tipos de asa = configuraciones/atributos."
  },
  {
    "id": "trap_kelso_shrug",
    "name": "Kelso Shrug / Chest-Supported Scapular Shrug",
    "block": "Trapecio",
    "family": "Retracción escapular",
    "movementPattern": "Retracción escapular",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "optIn": false,
    "equipment": "Mancuernas/Barra/Polea/Máquina compatible",
    "equipmentOptions": [
      [
        "mancuernas"
      ],
      [
        "barra"
      ],
      [
        "polea"
      ],
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral/Variable",
    "primaryMuscle": "Trapecio medio",
    "secondaryNotes": "Romboides; estabilizadores escapulares",
    "muscles": [
      {
        "code": "mid_trap",
        "level": "P",
        "direct": true,
        "function": "Retracción escapular",
        "bias": "Función principal diferenciada de shrug convencional",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "rhomboids",
        "level": "P",
        "direct": true,
        "function": "Retracción escapular",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "post_delt",
        "level": "C",
        "direct": false,
        "function": "Control de hombro/escápula",
        "bias": "Movimiento glenohumeral mínimo",
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "low_trap",
        "level": "C",
        "direct": false,
        "function": "Control escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "upper_trap",
        "level": "C",
        "direct": false,
        "function": "Estabilización escapular",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Media-Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Media-Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 8,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Retracción escapular",
    "motorNotes": "MOTOR propio por función diferenciada: retracción escapular con mínima flexión de codo, no un remo convencional."
  },
  {
    "id": "biceps_bar_curl",
    "name": "Curl barra/EZ",
    "block": "Bíceps",
    "family": "Curl general · brazo neutro",
    "movementPattern": "Flexión codo",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "optIn": false,
    "equipment": "Barra/EZ",
    "equipmentOptions": [
      [
        "barra"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Bíceps",
    "secondaryNotes": "Braquial; braquiorradial/antebrazo",
    "muscles": [
      {
        "code": "biceps_brachii",
        "level": "P",
        "direct": true,
        "function": "Flexión de codo / supinación",
        "bias": null,
        "confidence": "Alta",
        "notes": "El sesgo posicional no se interpreta como aislamiento de cabeza larga/corta."
      },
      {
        "code": "brachialis",
        "level": "S",
        "direct": true,
        "function": "Flexión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "brachioradialis",
        "level": "C",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "Dependiente de agarre/posición del antebrazo",
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Baja-Media",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 6,
      "max": 15,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-15"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Curl general",
    "motorNotes": "Brazo aprox. junto al torso. Barra recta/EZ = configuración. Drag curl = variante técnica, no ficha Motor."
  },
  {
    "id": "biceps_db_curl",
    "name": "Curl mancuernas",
    "block": "Bíceps",
    "family": "Curl general · brazo neutro",
    "movementPattern": "Flexión codo",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "optIn": false,
    "equipment": "Mancuernas",
    "equipmentOptions": [
      [
        "mancuernas"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral/alterno/unilateral",
    "primaryMuscle": "Bíceps",
    "secondaryNotes": "Braquial; braquiorradial/antebrazo",
    "muscles": [
      {
        "code": "biceps_brachii",
        "level": "P",
        "direct": true,
        "function": "Flexión de codo / supinación",
        "bias": null,
        "confidence": "Alta",
        "notes": "El sesgo posicional no se interpreta como aislamiento de cabeza larga/corta."
      },
      {
        "code": "brachialis",
        "level": "S",
        "direct": true,
        "function": "Flexión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "brachioradialis",
        "level": "C",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "Dependiente de agarre/posición del antebrazo",
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Media-Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 8,
      "max": 15,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-15"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo-Medio",
    "densitySuitability": "Alta",
    "substitutionFamily": "Curl general",
    "motorNotes": "Brazo aprox. junto al torso. Alterno/unilateral = configuración; permite supinación libre durante el recorrido."
  },
  {
    "id": "biceps_hammer",
    "name": "Curl martillo mancuernas",
    "block": "Bíceps",
    "family": "Curl neutro · brazo neutro",
    "movementPattern": "Flexión codo neutra",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "optIn": false,
    "equipment": "Mancuernas",
    "equipmentOptions": [
      [
        "mancuernas"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral/alterno/unilateral",
    "primaryMuscle": "Braquial/bíceps",
    "secondaryNotes": "Braquiorradial; antebrazo",
    "muscles": [
      {
        "code": "brachialis",
        "level": "P",
        "direct": true,
        "function": "Flexión de codo",
        "bias": "Agarre neutro ↑ protagonismo relativo",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "brachioradialis",
        "level": "P",
        "direct": true,
        "function": "Flexión de codo",
        "bias": "Agarre neutro ↑",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "biceps_brachii",
        "level": "S",
        "direct": true,
        "function": "Flexión de codo",
        "bias": "Menor ventaja de supinación que curl convencional",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 8,
      "max": 15,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-15"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo-Medio",
    "densitySuitability": "Alta",
    "substitutionFamily": "Curl neutro",
    "motorNotes": "Agarre neutro. Alterno, unilateral, sentado o cross-body pueden vivir como configuraciones."
  },
  {
    "id": "biceps_hammer_cable",
    "name": "Curl martillo polea/cuerda",
    "block": "Bíceps",
    "family": "Curl neutro · brazo neutro",
    "movementPattern": "Flexión codo neutra",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "optIn": false,
    "equipment": "Polea+cuerda",
    "equipmentOptions": [
      [
        "polea"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral/unilateral",
    "primaryMuscle": "Braquial/bíceps",
    "secondaryNotes": "Braquiorradial; antebrazo",
    "muscles": [
      {
        "code": "brachialis",
        "level": "P",
        "direct": true,
        "function": "Flexión de codo",
        "bias": "Agarre neutro ↑ protagonismo relativo",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "brachioradialis",
        "level": "P",
        "direct": true,
        "function": "Flexión de codo",
        "bias": "Agarre neutro ↑",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "biceps_brachii",
        "level": "S",
        "direct": true,
        "function": "Flexión de codo",
        "bias": "Menor ventaja de supinación que curl convencional",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 8,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Curl neutro",
    "motorNotes": "MOTOR separado del martillo con mancuernas por implemento, perfil de resistencia, setup y progresión."
  },
  {
    "id": "biceps_cable",
    "name": "Curl polea convencional",
    "block": "Bíceps",
    "family": "Curl general · brazo neutro",
    "movementPattern": "Flexión codo",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "optIn": false,
    "equipment": "Polea",
    "equipmentOptions": [
      [
        "polea"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral/unilateral",
    "primaryMuscle": "Bíceps",
    "secondaryNotes": "Braquial; antebrazo",
    "muscles": [
      {
        "code": "biceps_brachii",
        "level": "P",
        "direct": true,
        "function": "Flexión de codo / supinación",
        "bias": null,
        "confidence": "Alta",
        "notes": "El sesgo posicional no se interpreta como aislamiento de cabeza larga/corta."
      },
      {
        "code": "brachialis",
        "level": "S",
        "direct": true,
        "function": "Flexión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "brachioradialis",
        "level": "C",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "Dependiente de agarre/posición del antebrazo",
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 8,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Curl general",
    "motorNotes": "Brazo aprox. junto al torso. Barra recta/EZ o agarres individuales = configuración. Cuerda neutra pertenece a martillo polea."
  },
  {
    "id": "biceps_bayesian_cable",
    "name": "Curl Bayesian polea",
    "block": "Bíceps",
    "family": "Brazo retrasado",
    "movementPattern": "Flexión codo",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "optIn": false,
    "equipment": "Polea",
    "equipmentOptions": [
      [
        "polea"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Unilateral",
    "primaryMuscle": "Bíceps",
    "secondaryNotes": "Braquial; antebrazo",
    "muscles": [
      {
        "code": "biceps_brachii",
        "level": "P",
        "direct": true,
        "function": "Flexión de codo / supinación",
        "bias": "Hombro en extensión / brazo retrasado",
        "confidence": "Alta",
        "notes": "El sesgo posicional no se interpreta como aislamiento de cabeza larga/corta."
      },
      {
        "code": "brachialis",
        "level": "S",
        "direct": true,
        "function": "Flexión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "brachioradialis",
        "level": "C",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "Dependiente de agarre/posición del antebrazo",
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "ant_delt",
        "level": "E",
        "direct": false,
        "function": "Control de posición del hombro",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Media-Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Media-Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 8,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Medio",
    "densitySuitability": "Alta",
    "substitutionFamily": "Brazo retrasado",
    "motorNotes": "Hombro en extensión / brazo detrás del torso. No etiquetar como aislamiento de una cabeza del bíceps."
  },
  {
    "id": "biceps_preacher",
    "name": "Curl predicador peso libre",
    "block": "Bíceps",
    "family": "Brazo adelantado/apoyado",
    "movementPattern": "Flexión codo",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "optIn": false,
    "equipment": "Barra/EZ o mancuerna+banco predicador",
    "equipmentOptions": [
      [
        "barra",
        "banco"
      ],
      [
        "mancuernas",
        "banco"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral/unilateral",
    "primaryMuscle": "Bíceps",
    "secondaryNotes": "Braquial; antebrazo",
    "muscles": [
      {
        "code": "biceps_brachii",
        "level": "P",
        "direct": true,
        "function": "Flexión de codo / supinación",
        "bias": "Brazo adelantado o estabilizado",
        "confidence": "Alta",
        "notes": "El sesgo posicional no se interpreta como aislamiento de cabeza larga/corta."
      },
      {
        "code": "brachialis",
        "level": "S",
        "direct": true,
        "function": "Flexión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "brachioradialis",
        "level": "C",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "Dependiente de agarre/posición del antebrazo",
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 8,
      "max": 15,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-15"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Bajo-Medio",
    "densitySuitability": "Alta",
    "substitutionFamily": "Brazo adelantado/estabilizado",
    "motorNotes": "Barra recta/EZ y unilateral con mancuerna = configuraciones. No fusionar con predicador máquina."
  },
  {
    "id": "biceps_preacher_machine",
    "name": "Curl predicador máquina",
    "block": "Bíceps",
    "family": "Brazo adelantado/apoyado",
    "movementPattern": "Flexión codo",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "optIn": false,
    "equipment": "Máquina predicador",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral/unilateral según máquina",
    "primaryMuscle": "Bíceps",
    "secondaryNotes": "Braquial; antebrazo",
    "muscles": [
      {
        "code": "biceps_brachii",
        "level": "P",
        "direct": true,
        "function": "Flexión de codo / supinación",
        "bias": "Brazo adelantado o estabilizado",
        "confidence": "Alta",
        "notes": "El sesgo posicional no se interpreta como aislamiento de cabeza larga/corta."
      },
      {
        "code": "brachialis",
        "level": "S",
        "direct": true,
        "function": "Flexión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "brachioradialis",
        "level": "C",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "Dependiente de agarre/posición del antebrazo",
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Muy alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Muy alta",
    "repSpec": {
      "min": 8,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Bajo-Medio",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Brazo adelantado/estabilizado",
    "motorNotes": "MOTOR separado por trayectoria guiada, estabilidad, setup y progresión. Selectorized/plate-loaded = atributos."
  },
  {
    "id": "biceps_spider_curl",
    "name": "Spider Curl",
    "block": "Bíceps",
    "family": "Brazo adelantado/torso apoyado",
    "movementPattern": "Flexión codo",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "optIn": false,
    "equipment": "Banco inclinado+barra/EZ/mancuernas",
    "equipmentOptions": [
      [
        "banco",
        "barra"
      ],
      [
        "banco",
        "mancuernas"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral/unilateral",
    "primaryMuscle": "Bíceps",
    "secondaryNotes": "Braquial; braquiorradial/antebrazo",
    "muscles": [
      {
        "code": "biceps_brachii",
        "level": "P",
        "direct": true,
        "function": "Flexión de codo / supinación",
        "bias": "Brazo adelantado o estabilizado",
        "confidence": "Alta",
        "notes": "El sesgo posicional no se interpreta como aislamiento de cabeza larga/corta."
      },
      {
        "code": "brachialis",
        "level": "S",
        "direct": true,
        "function": "Flexión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "brachioradialis",
        "level": "C",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "Dependiente de agarre/posición del antebrazo",
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Media-Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 8,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Bajo-Medio",
    "densitySuitability": "Alta",
    "substitutionFamily": "Brazo adelantado/estabilizado",
    "motorNotes": "Pecho apoyado; brazo sin apoyo directo. Barra/EZ/mancuernas = configuraciones. No usar etiqueta simplista de cabeza corta."
  },
  {
    "id": "biceps_incline_db_curl",
    "name": "Curl inclinado mancuernas",
    "block": "Bíceps",
    "family": "Brazo retrasado",
    "movementPattern": "Flexión codo",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "optIn": false,
    "equipment": "Mancuernas+banco inclinado",
    "equipmentOptions": [
      [
        "mancuernas",
        "banco"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral/alterno",
    "primaryMuscle": "Bíceps",
    "secondaryNotes": "Braquial; antebrazo",
    "muscles": [
      {
        "code": "biceps_brachii",
        "level": "P",
        "direct": true,
        "function": "Flexión de codo / supinación",
        "bias": "Hombro en extensión / brazo retrasado",
        "confidence": "Alta",
        "notes": "El sesgo posicional no se interpreta como aislamiento de cabeza larga/corta."
      },
      {
        "code": "brachialis",
        "level": "S",
        "direct": true,
        "function": "Flexión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "brachioradialis",
        "level": "C",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "Dependiente de agarre/posición del antebrazo",
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "ant_delt",
        "level": "E",
        "direct": false,
        "function": "Control de posición del hombro",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Media-Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 8,
      "max": 15,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-15"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Bajo-Medio",
    "densitySuitability": "Alta",
    "substitutionFamily": "Brazo retrasado",
    "motorNotes": "Brazo detrás del torso por posición del banco. Afinidad alta con Bayesian; controlar redundancia."
  },
  {
    "id": "biceps_concentration",
    "name": "Curl concentración",
    "block": "Bíceps",
    "family": "Brazo adelantado/apoyado",
    "movementPattern": "Flexión codo",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "optIn": false,
    "equipment": "Mancuerna+banco/asiento",
    "equipmentOptions": [
      [
        "mancuernas",
        "banco"
      ],
      [
        "mancuernas"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Unilateral",
    "primaryMuscle": "Bíceps",
    "secondaryNotes": "Braquial; braquiorradial/antebrazo",
    "muscles": [
      {
        "code": "biceps_brachii",
        "level": "P",
        "direct": true,
        "function": "Flexión de codo / supinación",
        "bias": "Brazo adelantado o estabilizado",
        "confidence": "Alta",
        "notes": "El sesgo posicional no se interpreta como aislamiento de cabeza larga/corta."
      },
      {
        "code": "brachialis",
        "level": "S",
        "direct": true,
        "function": "Flexión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "brachioradialis",
        "level": "C",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "Dependiente de agarre/posición del antebrazo",
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Muy alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Media-Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 8,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Alto",
    "densitySuitability": "Media",
    "substitutionFamily": "Brazo adelantado/estabilizado",
    "motorNotes": "Unilateral obligatorio, muy estable y con poco equipamiento; penalizar coste temporal cuando el tiempo sea limitante."
  },
  {
    "id": "biceps_machine_curl",
    "name": "Curl bíceps máquina",
    "block": "Bíceps",
    "family": "Curl general · guiado",
    "movementPattern": "Flexión codo",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "optIn": false,
    "equipment": "Máquina",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral/unilateral según máquina",
    "primaryMuscle": "Bíceps",
    "secondaryNotes": "Braquial; antebrazo",
    "muscles": [
      {
        "code": "biceps_brachii",
        "level": "P",
        "direct": true,
        "function": "Flexión de codo / supinación",
        "bias": null,
        "confidence": "Alta",
        "notes": "El sesgo posicional no se interpreta como aislamiento de cabeza larga/corta."
      },
      {
        "code": "brachialis",
        "level": "S",
        "direct": true,
        "function": "Flexión de codo",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "brachioradialis",
        "level": "C",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "Dependiente de agarre/posición del antebrazo",
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Muy alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Muy alta",
    "repSpec": {
      "min": 8,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Bajo-Medio",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Curl general",
    "motorNotes": "Máquina convencional, distinta del predicador máquina. Selectorized/plate-loaded/iso-lateral = atributos según diseño."
  },
  {
    "id": "triceps_pushdown",
    "name": "Extensión tríceps polea / Pushdown",
    "block": "Tríceps",
    "family": "Extensión · brazo junto al torso",
    "movementPattern": "Extensión codo",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "optIn": false,
    "equipment": "Polea",
    "equipmentOptions": [
      [
        "polea"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral/unilateral",
    "primaryMuscle": "Tríceps braquial",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "triceps",
        "level": "P",
        "direct": true,
        "function": "Extensión de codo",
        "bias": "Brazo junto al torso",
        "confidence": "Alta",
        "notes": "Sesgo por posición del húmero; no interpretar como aislamiento completo de una cabeza."
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 8,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Extensión · brazo neutro",
    "motorNotes": "Cuerda/barra recta/barra V/agarre individual = configuraciones. Unilateral y cross-body = configuraciones; no MOTOR separados."
  },
  {
    "id": "triceps_overhead_cable",
    "name": "Extensión tríceps overhead polea",
    "block": "Tríceps",
    "family": "Extensión · brazo elevado",
    "movementPattern": "Extensión codo",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "optIn": false,
    "equipment": "Polea",
    "equipmentOptions": [
      [
        "polea"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral/unilateral",
    "primaryMuscle": "Tríceps braquial",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "triceps",
        "level": "P",
        "direct": true,
        "function": "Extensión de codo",
        "bias": "Húmero elevado; cabeza larga en mayor longitud",
        "confidence": "Alta",
        "notes": "Sesgo por posición del húmero; no interpretar como aislamiento completo de una cabeza."
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Media-Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Media-Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 8,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Extensión · brazo elevado",
    "motorNotes": "Cuerda/barra/EZ y bilateral/unilateral = configuraciones. Posición overhead relevante para afinidad; no etiquetar como aislamiento de una cabeza."
  },
  {
    "id": "triceps_overhead_db",
    "name": "Extensión overhead mancuerna / Press francés",
    "block": "Tríceps",
    "family": "Extensión · brazo elevado",
    "movementPattern": "Extensión codo",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "optIn": false,
    "equipment": "Mancuerna",
    "equipmentOptions": [
      [
        "mancuernas"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral/unilateral",
    "primaryMuscle": "Tríceps braquial",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "triceps",
        "level": "P",
        "direct": true,
        "function": "Extensión de codo",
        "bias": "Húmero elevado; cabeza larga en mayor longitud",
        "confidence": "Alta",
        "notes": "Sesgo por posición del húmero; no interpretar como aislamiento completo de una cabeza."
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Media",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Media-Alta",
    "nearFailureSuitability": "Media-Alta",
    "repSpec": {
      "min": 8,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Extensión · brazo elevado",
    "motorNotes": "Una mancuerna a dos manos o unilateral; sentado/de pie = configuraciones. Alta afinidad con overhead polea; controlar redundancia."
  },
  {
    "id": "triceps_french_press",
    "name": "Extensión tumbada / Skull Crusher / Press francés tumbado",
    "block": "Tríceps",
    "family": "Extensión tumbada/intermedia",
    "movementPattern": "Extensión codo",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "optIn": false,
    "equipment": "Barra/EZ/mancuernas/polea/Smith+banco",
    "equipmentOptions": [
      [
        "barra",
        "banco"
      ],
      [
        "mancuernas",
        "banco"
      ],
      [
        "polea",
        "banco"
      ],
      [
        "smith",
        "banco"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral/unilateral",
    "primaryMuscle": "Tríceps braquial",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "triceps",
        "level": "P",
        "direct": true,
        "function": "Extensión de codo",
        "bias": "Húmero en posición intermedia/tumbada",
        "confidence": "Alta",
        "notes": "Sesgo por posición del húmero; no interpretar como aislamiento completo de una cabeza."
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Media-Alta",
    "localFatigue": "Baja-Media",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Media-Alta",
    "repSpec": {
      "min": 6,
      "max": 15,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-15"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Bajo-Medio",
    "densitySuitability": "Media-Alta",
    "substitutionFamily": "Extensión tumbada",
    "motorNotes": "EZ/barra recta/mancuernas/polea/Smith = implementaciones. Hacia frente/coronilla o detrás de cabeza y unilateral/cross-body tumbado = configuraciones."
  },
  {
    "id": "triceps_closegrip_press",
    "name": "Press banca agarre cerrado",
    "block": "Tríceps",
    "family": "Press dominante tríceps",
    "movementPattern": "Empuje horizontal",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Barra/Smith/mancuernas+banco",
    "equipmentOptions": [
      [
        "barra",
        "banco"
      ],
      [
        "smith",
        "banco"
      ],
      [
        "mancuernas",
        "banco"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Tríceps",
    "secondaryNotes": "Pecho; deltoide anterior",
    "muscles": [
      {
        "code": "triceps",
        "level": "P",
        "direct": true,
        "function": "Extensión de codo / empuje",
        "bias": "Dominancia tríceps según técnica",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "pec_major",
        "level": "S",
        "direct": false,
        "function": "Aducción horizontal / empuje",
        "bias": "Variable según técnica y aparato",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "ant_delt",
        "level": "S",
        "direct": false,
        "function": "Flexión/aducción horizontal de hombro",
        "bias": "Variable según técnica",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización corporal",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Baja-Media",
    "scalability": "Alta",
    "stability": "Media-Alta",
    "localFatigue": "Media-Alta",
    "systemicDemand": "Media-Alta",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Media-Alta",
    "repSpec": {
      "min": 5,
      "max": 12,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "5-12"
    },
    "restSpec": {
      "min": 120,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "120-180 s"
    },
    "setupCost": "Medio-Alto",
    "executionTimeCost": "Medio",
    "densitySuitability": "Baja-Media",
    "substitutionFamily": "Press dominante tríceps",
    "motorNotes": "Barra, Smith y mancuernas = configuraciones del mismo MOTOR. Agarre estrecho cómodo, no manos juntas. Contabilizar contribución a pecho y deltoide anterior."
  },
  {
    "id": "triceps_dip",
    "name": "Fondos en paralelas",
    "block": "Tríceps",
    "family": "Empuje · peso corporal",
    "movementPattern": "Empuje",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Paralelas",
    "equipmentOptions": [
      [
        "paralelas"
      ]
    ],
    "loadSource": "Corporal+opcional",
    "laterality": "Bilateral",
    "primaryMuscle": "Tríceps",
    "secondaryNotes": "Pecho; deltoide anterior",
    "muscles": [
      {
        "code": "triceps",
        "level": "P",
        "direct": true,
        "function": "Extensión de codo / empuje",
        "bias": "Dominancia tríceps según técnica",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "pec_major",
        "level": "S",
        "direct": false,
        "function": "Aducción horizontal / empuje",
        "bias": "Variable según técnica y aparato",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "ant_delt",
        "level": "S",
        "direct": false,
        "function": "Flexión/aducción horizontal de hombro",
        "bias": "Variable según técnica",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización corporal",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Alta",
    "scalability": "Media",
    "stability": "Media",
    "localFatigue": "Media-Alta",
    "systemicDemand": "Media",
    "progressionSuitability": "Media-Alta",
    "nearFailureSuitability": "Media",
    "repSpec": {
      "min": null,
      "max": null,
      "unit": "reps",
      "perSide": false,
      "byCapacity": true,
      "openEnded": false,
      "raw": "Según capacidad"
    },
    "restSpec": {
      "min": 120,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "120-180 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Medio",
    "densitySuitability": "Baja-Media",
    "substitutionFamily": "Empuje dominante tríceps",
    "motorNotes": "Un único MOTOR de fondos; sesgo técnico pecho/tríceps no crea otra ficha. Peso corporal y lastre = progresión/configuración."
  },
  {
    "id": "triceps_dip_assisted",
    "name": "Fondos asistidos",
    "block": "Tríceps",
    "family": "Empuje · asistido",
    "movementPattern": "Empuje",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Máquina asistida/banda",
    "equipmentOptions": [
      [
        "maquina"
      ],
      [
        "banda"
      ]
    ],
    "loadSource": "Corporal asistida",
    "laterality": "Bilateral",
    "primaryMuscle": "Tríceps",
    "secondaryNotes": "Pecho; deltoide anterior",
    "muscles": [
      {
        "code": "triceps",
        "level": "P",
        "direct": true,
        "function": "Extensión de codo / empuje",
        "bias": "Dominancia tríceps según técnica",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "pec_major",
        "level": "S",
        "direct": false,
        "function": "Aducción horizontal / empuje",
        "bias": "Variable según técnica y aparato",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "ant_delt",
        "level": "S",
        "direct": false,
        "function": "Flexión/aducción horizontal de hombro",
        "bias": "Variable según técnica",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización corporal",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja-Media",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Media",
    "systemicDemand": "Media",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": null,
      "max": null,
      "unit": "reps",
      "perSide": false,
      "byCapacity": true,
      "openEnded": false,
      "raw": "Según capacidad"
    },
    "restSpec": {
      "min": 90,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "90-180 s"
    },
    "setupCost": "Bajo-Medio",
    "executionTimeCost": "Medio",
    "densitySuitability": "Media",
    "substitutionFamily": "Empuje dominante tríceps",
    "motorNotes": "MOTOR separado por accesibilidad, fuerza mínima y escalabilidad. Máquina asistida/banda = métodos; selección por capacidad, no por etiqueta de nivel."
  },
  {
    "id": "triceps_bench_dip",
    "name": "Fondos en banco",
    "block": "Tríceps",
    "family": "Empuje · hombro extendido",
    "movementPattern": "Empuje",
    "compatibleRoles": [
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Banco",
    "equipmentOptions": [
      [
        "banco"
      ]
    ],
    "loadSource": "Corporal+opcional",
    "laterality": "Bilateral",
    "primaryMuscle": "Tríceps",
    "secondaryNotes": "Pecho; deltoide anterior",
    "muscles": [
      {
        "code": "triceps",
        "level": "P",
        "direct": true,
        "function": "Extensión de codo / empuje",
        "bias": "Dominancia tríceps según técnica",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "pec_major",
        "level": "S",
        "direct": false,
        "function": "Aducción horizontal / empuje",
        "bias": "Variable según técnica y aparato",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "ant_delt",
        "level": "S",
        "direct": false,
        "function": "Flexión/aducción horizontal de hombro",
        "bias": "Variable según técnica",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "post_delt",
        "level": "E",
        "direct": false,
        "function": "Control de hombro en extensión",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización corporal",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Media-Alta",
    "strengthRequirement": "Baja-Media",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Media",
    "systemicDemand": "Baja-Media",
    "progressionSuitability": "Media",
    "nearFailureSuitability": "Media",
    "repSpec": {
      "min": 8,
      "max": 25,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-25"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo-Medio",
    "densitySuitability": "Media-Alta",
    "substitutionFamily": "Empuje dominante tríceps",
    "motorNotes": "Rodillas flexionadas/piernas extendidas/pies elevados/carga externa = progresiones. Considerar comodidad individual por extensión de hombro."
  },
  {
    "id": "triceps_kickback_db",
    "name": "Patada de tríceps mancuerna",
    "block": "Tríceps",
    "family": "Extensión · brazo retrasado",
    "movementPattern": "Extensión codo",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "optIn": false,
    "equipment": "Mancuerna",
    "equipmentOptions": [
      [
        "mancuernas"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Unilateral/bilateral",
    "primaryMuscle": "Tríceps braquial",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "triceps",
        "level": "P",
        "direct": true,
        "function": "Extensión de codo",
        "bias": "Brazo retrasado / hombro extendido",
        "confidence": "Alta",
        "notes": "Sesgo por posición del húmero; no interpretar como aislamiento completo de una cabeza."
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "post_delt",
        "level": "E",
        "direct": false,
        "function": "Control de posición del hombro",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Media-Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Media",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 10,
      "max": 25,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "10-25"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Medio",
    "densitySuitability": "Alta",
    "substitutionFamily": "Extensión · brazo retrasado",
    "motorNotes": "Unilateral estándar; bilateral y con/sin apoyo = configuraciones. Perfil gravitatorio característico; alta afinidad con kickback polea."
  },
  {
    "id": "triceps_kickback_cable",
    "name": "Patada de tríceps polea",
    "block": "Tríceps",
    "family": "Extensión · brazo retrasado",
    "movementPattern": "Extensión codo",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "optIn": false,
    "equipment": "Polea",
    "equipmentOptions": [
      [
        "polea"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Unilateral/bilateral",
    "primaryMuscle": "Tríceps braquial",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "triceps",
        "level": "P",
        "direct": true,
        "function": "Extensión de codo",
        "bias": "Brazo retrasado / hombro extendido",
        "confidence": "Alta",
        "notes": "Sesgo por posición del húmero; no interpretar como aislamiento completo de una cabeza."
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "post_delt",
        "level": "E",
        "direct": false,
        "function": "Control de posición del hombro",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 10,
      "max": 25,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "10-25"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Medio",
    "densitySuitability": "Alta",
    "substitutionFamily": "Extensión · brazo retrasado",
    "motorNotes": "Agarre individual/cuff y con/sin apoyo = configuraciones. MOTOR separado de mancuerna por perfil de resistencia, setup y progresión."
  },
  {
    "id": "triceps_extension_machine",
    "name": "Extensión tríceps máquina",
    "block": "Tríceps",
    "family": "Extensión guiada",
    "movementPattern": "Extensión codo",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "optIn": false,
    "equipment": "Máquina",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral/unilateral según máquina",
    "primaryMuscle": "Tríceps braquial",
    "secondaryNotes": null,
    "muscles": [
      {
        "code": "triceps",
        "level": "P",
        "direct": true,
        "function": "Extensión de codo",
        "bias": "Según diseño y posición del húmero",
        "confidence": "Alta",
        "notes": "Sesgo por posición del húmero; no interpretar como aislamiento completo de una cabeza."
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Muy alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Muy alta",
    "repSpec": {
      "min": 8,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Bajo-Medio",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Extensión guiada",
    "motorNotes": "Máquina específica de extensión, no seated dip. Selectorized/plate-loaded/iso-lateral y posición del húmero = atributos/configuraciones según diseño."
  },
  {
    "id": "triceps_dip_machine",
    "name": "Máquina de fondos / Seated Dip",
    "block": "Tríceps",
    "family": "Empuje guiado",
    "movementPattern": "Empuje",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Máquina de fondos",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral/unilateral según máquina",
    "primaryMuscle": "Tríceps",
    "secondaryNotes": "Pecho; deltoide anterior",
    "muscles": [
      {
        "code": "triceps",
        "level": "P",
        "direct": true,
        "function": "Extensión de codo / empuje",
        "bias": "Dominancia tríceps según técnica",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "pec_major",
        "level": "S",
        "direct": false,
        "function": "Aducción horizontal / empuje",
        "bias": "Variable según técnica y aparato",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "ant_delt",
        "level": "S",
        "direct": false,
        "function": "Flexión/aducción horizontal de hombro",
        "bias": "Variable según técnica",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "core",
        "level": "E",
        "direct": false,
        "function": "Estabilización corporal",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Muy alta",
    "localFatigue": "Media",
    "systemicDemand": "Media",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Muy alta",
    "repSpec": {
      "min": 6,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-20"
    },
    "restSpec": {
      "min": 90,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "90-180 s"
    },
    "setupCost": "Bajo-Medio",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Media-Alta",
    "substitutionFamily": "Empuje dominante tríceps",
    "motorNotes": "Distinta de fondos asistidos: el cuerpo permanece apoyado y se mueve carga externa. Selectorized/plate-loaded/iso-lateral = configuraciones."
  },
  {
    "id": "legs_barbell_squat",
    "name": "Sentadilla trasera con barra",
    "block": "Pierna",
    "family": "Sentadilla",
    "movementPattern": "Dominante de rodilla/cadera",
    "compatibleRoles": [
      "Principal"
    ],
    "optIn": false,
    "equipment": "Barra+rack",
    "equipmentOptions": [
      [
        "barra",
        "rack"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Cuádriceps",
    "secondaryNotes": "Glúteo mayor; aductor mayor; core/erectores",
    "muscles": [
      {
        "code": "quadriceps",
        "level": "P",
        "direct": true,
        "function": "Extensión de rodilla",
        "bias": "Sesgo según ROM, técnica y configuración",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "glute_max",
        "level": "S",
        "direct": true,
        "function": "Extensión de cadera",
        "bias": "Contribución ↑ generalmente con mayor demanda de extensión de cadera/ROM",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "adductors",
        "level": "S",
        "direct": false,
        "function": "Extensión/estabilización de cadera",
        "bias": "Aductor mayor relevante",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "hamstrings",
        "level": "C",
        "direct": false,
        "function": "Co-contracción/estabilización y extensión de cadera",
        "bias": "No sustituye flexión de rodilla ni bisagra específica",
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "erectors",
        "level": "S",
        "direct": false,
        "function": "Estabilización del tronco",
        "bias": "Mayor en carga libre/axial",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "deep_core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Media-Baja",
    "strengthRequirement": "Media-Alta",
    "scalability": "Alta",
    "stability": "Media",
    "localFatigue": "Alta",
    "systemicDemand": "Alta",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Media",
    "repSpec": {
      "min": 5,
      "max": 12,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "5-12"
    },
    "restSpec": {
      "min": 120,
      "max": 240,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "120-240 s"
    },
    "setupCost": "Alto",
    "executionTimeCost": "Medio",
    "densitySuitability": "Baja",
    "substitutionFamily": "Sentadilla bilateral",
    "motorNotes": "High/low bar = configuraciones. Isquios colaboran pero no sustituyen trabajo directo."
  },
  {
    "id": "legs_front_squat",
    "name": "Sentadilla frontal",
    "block": "Pierna",
    "family": "Sentadilla",
    "movementPattern": "Dominante de rodilla/cadera",
    "compatibleRoles": [
      "Principal"
    ],
    "optIn": false,
    "equipment": "Barra+rack",
    "equipmentOptions": [
      [
        "barra",
        "rack"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Cuádriceps",
    "secondaryNotes": "Glúteo mayor; aductor mayor; core/espalda alta",
    "muscles": [
      {
        "code": "quadriceps",
        "level": "P",
        "direct": true,
        "function": "Extensión de rodilla",
        "bias": "Sesgo según ROM, técnica y configuración",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "glute_max",
        "level": "S",
        "direct": true,
        "function": "Extensión de cadera",
        "bias": "Contribución ↑ generalmente con mayor demanda de extensión de cadera/ROM",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "adductors",
        "level": "S",
        "direct": false,
        "function": "Extensión/estabilización de cadera",
        "bias": "Aductor mayor relevante",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "hamstrings",
        "level": "C",
        "direct": false,
        "function": "Co-contracción/estabilización y extensión de cadera",
        "bias": "No sustituye flexión de rodilla ni bisagra específica",
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "erectors",
        "level": "S",
        "direct": false,
        "function": "Estabilización del tronco",
        "bias": "Mayor en carga libre/axial",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "deep_core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Baja-Media",
    "strengthRequirement": "Media-Alta",
    "scalability": "Alta",
    "stability": "Media",
    "localFatigue": "Alta",
    "systemicDemand": "Alta",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Media",
    "repSpec": {
      "min": 5,
      "max": 12,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "5-12"
    },
    "restSpec": {
      "min": 120,
      "max": 240,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "120-240 s"
    },
    "setupCost": "Alto",
    "executionTimeCost": "Medio",
    "densitySuitability": "Baja",
    "substitutionFamily": "Sentadilla bilateral",
    "motorNotes": "Mayor demanda técnica/front rack; no es solo para avanzados, pero pierde prioridad si la accesibilidad es baja."
  },
  {
    "id": "legs_smith_squat",
    "name": "Sentadilla Smith",
    "block": "Pierna",
    "family": "Sentadilla guiada",
    "movementPattern": "Dominante de rodilla/cadera",
    "compatibleRoles": [
      "Principal"
    ],
    "optIn": false,
    "equipment": "Smith",
    "equipmentOptions": [
      [
        "smith"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Cuádriceps",
    "secondaryNotes": "Glúteo mayor; aductor mayor",
    "muscles": [
      {
        "code": "quadriceps",
        "level": "P",
        "direct": true,
        "function": "Extensión de rodilla",
        "bias": "Sesgo según ROM, técnica y configuración",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "glute_max",
        "level": "S",
        "direct": true,
        "function": "Extensión de cadera",
        "bias": "Contribución ↑ generalmente con mayor demanda de extensión de cadera/ROM",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "adductors",
        "level": "S",
        "direct": false,
        "function": "Extensión/estabilización de cadera",
        "bias": "Aductor mayor relevante",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "hamstrings",
        "level": "C",
        "direct": false,
        "function": "Co-contracción/estabilización y extensión de cadera",
        "bias": "No sustituye flexión de rodilla ni bisagra específica",
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "erectors",
        "level": "C",
        "direct": false,
        "function": "Estabilización del tronco",
        "bias": "Mayor en carga libre/axial",
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "deep_core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Media",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Alta",
    "systemicDemand": "Media-Alta",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 6,
      "max": 15,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-15"
    },
    "restSpec": {
      "min": 120,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "120-180 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Medio",
    "densitySuitability": "Media",
    "substitutionFamily": "Sentadilla bilateral",
    "motorNotes": "Posición de pies, elevación de talón y diseño Smith = configuraciones con sesgo biomecánico."
  },
  {
    "id": "legs_hack_squat",
    "name": "Hack Squat",
    "block": "Pierna",
    "family": "Sentadilla guiada",
    "movementPattern": "Dominante de rodilla/cadera",
    "compatibleRoles": [
      "Principal"
    ],
    "optIn": false,
    "equipment": "Hack squat",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Cuádriceps",
    "secondaryNotes": "Glúteo mayor; aductor mayor",
    "muscles": [
      {
        "code": "quadriceps",
        "level": "P",
        "direct": true,
        "function": "Extensión de rodilla",
        "bias": "Sesgo según ROM, técnica y configuración",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "glute_max",
        "level": "S",
        "direct": true,
        "function": "Extensión de cadera",
        "bias": "Contribución ↑ generalmente con mayor demanda de extensión de cadera/ROM",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "adductors",
        "level": "S",
        "direct": false,
        "function": "Extensión/estabilización de cadera",
        "bias": "Aductor mayor relevante",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "hamstrings",
        "level": "C",
        "direct": false,
        "function": "Co-contracción/estabilización y extensión de cadera",
        "bias": "No sustituye flexión de rodilla ni bisagra específica",
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "erectors",
        "level": "C",
        "direct": false,
        "function": "Estabilización del tronco",
        "bias": "Mayor en carga libre/axial",
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "deep_core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Media",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Alta",
    "systemicDemand": "Media-Alta",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 6,
      "max": 15,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-15"
    },
    "restSpec": {
      "min": 120,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "120-180 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Medio",
    "densitySuitability": "Media",
    "substitutionFamily": "Sentadilla guiada",
    "motorNotes": "Altura/anchura de pies, talón y ROM = configuraciones; no usar reglas simplistas de aislamiento."
  },
  {
    "id": "legs_leg_press",
    "name": "Prensa de piernas",
    "block": "Pierna",
    "family": "Prensa",
    "movementPattern": "Dominante de rodilla/cadera",
    "compatibleRoles": [
      "Principal"
    ],
    "optIn": false,
    "equipment": "Prensa",
    "equipmentOptions": [
      [
        "prensa"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Cuádriceps",
    "secondaryNotes": "Glúteo mayor; aductor mayor",
    "muscles": [
      {
        "code": "quadriceps",
        "level": "P",
        "direct": true,
        "function": "Extensión de rodilla",
        "bias": "Sesgo según ROM, técnica y configuración",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "glute_max",
        "level": "S",
        "direct": true,
        "function": "Extensión de cadera",
        "bias": "Contribución ↑ generalmente con mayor demanda de extensión de cadera/ROM",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "adductors",
        "level": "S",
        "direct": false,
        "function": "Extensión/estabilización de cadera",
        "bias": "Aductor mayor relevante",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "hamstrings",
        "level": "C",
        "direct": false,
        "function": "Co-contracción/estabilización y extensión de cadera",
        "bias": "No sustituye flexión de rodilla ni bisagra específica",
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "erectors",
        "level": "C",
        "direct": false,
        "function": "Estabilización del tronco",
        "bias": "Mayor en carga libre/axial",
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "deep_core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Media",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Alta",
    "systemicDemand": "Media",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 6,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-20"
    },
    "restSpec": {
      "min": 120,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "120-180 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Medio",
    "densitySuitability": "Media",
    "substitutionFamily": "Prensa",
    "motorNotes": "45°, horizontal y vertical = implementaciones. Posición de pies y ROM = configuraciones biomecánicas."
  },
  {
    "id": "legs_leg_extension",
    "name": "Extensión de cuádriceps",
    "block": "Pierna",
    "family": "Extensión de rodilla",
    "movementPattern": "Extensión de rodilla",
    "compatibleRoles": [
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Máquina",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral/Unilateral",
    "primaryMuscle": "Cuádriceps",
    "secondaryNotes": "Recto femoral y vastos",
    "muscles": [
      {
        "code": "quadriceps",
        "level": "P",
        "direct": true,
        "function": "Extensión de rodilla",
        "bias": "Dominante de rodilla",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "deep_core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Alta",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 8,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Extensión de rodilla",
    "motorNotes": "Bilateral/unilateral y ajustes de asiento = configuraciones. No crear variantes VMO por orientación del pie."
  },
  {
    "id": "legs_bulgarian_split_squat",
    "name": "Sentadilla búlgara",
    "block": "Pierna",
    "family": "Unilateral",
    "movementPattern": "Dominante de rodilla/cadera unilateral",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Mancuernas/Smith/Barra",
    "equipmentOptions": [
      [
        "mancuernas"
      ],
      [
        "smith"
      ],
      [
        "barra"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Unilateral",
    "primaryMuscle": "Cuádriceps",
    "secondaryNotes": "Glúteo mayor; aductor mayor; glúteo medio/estabilizadores",
    "muscles": [
      {
        "code": "quadriceps",
        "level": "P",
        "direct": true,
        "function": "Extensión de rodilla",
        "bias": "Sesgo según zancada/altura/torso/ROM",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "glute_max",
        "level": "S",
        "direct": true,
        "function": "Extensión de cadera",
        "bias": "Puede ganar protagonismo según configuración",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "adductors",
        "level": "S",
        "direct": false,
        "function": "Extensión/estabilización de cadera",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "glute_med_min",
        "level": "C",
        "direct": false,
        "function": "Estabilización pélvica frontal",
        "bias": "Demanda unilateral",
        "confidence": "Alta",
        "notes": "Estabilización relevante, pero no sustituye por defecto trabajo directo de abducción."
      },
      {
        "code": "hamstrings",
        "level": "C",
        "direct": false,
        "function": "Extensión de cadera/estabilización",
        "bias": "No sustituye trabajo específico",
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "deep_core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Media",
    "scalability": "Alta",
    "stability": "Media",
    "localFatigue": "Alta",
    "systemicDemand": "Media-Alta",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Media-Alta",
    "repSpec": {
      "min": 6,
      "max": 15,
      "unit": "reps",
      "perSide": true,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-15/lado"
    },
    "restSpec": {
      "min": 90,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "90-180 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Alto",
    "densitySuitability": "Baja-Media",
    "substitutionFamily": "Unilateral dominante rodilla",
    "motorNotes": "Pie, torso, ROM y altura apoyo = configuraciones; Smith es implementación."
  },
  {
    "id": "legs_forward_lunge",
    "name": "Zancada hacia delante",
    "block": "Pierna",
    "family": "Zancada",
    "movementPattern": "Unilateral dinámico",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Mancuernas/Barra/Peso corporal",
    "equipmentOptions": [
      []
    ],
    "loadSource": "Externa/Corporal",
    "laterality": "Alterna/Unilateral",
    "primaryMuscle": "Cuádriceps",
    "secondaryNotes": "Glúteo mayor; aductores; estabilizadores de cadera",
    "muscles": [
      {
        "code": "quadriceps",
        "level": "P",
        "direct": true,
        "function": "Extensión de rodilla",
        "bias": "Sesgo según zancada/altura/torso/ROM",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "glute_max",
        "level": "S",
        "direct": true,
        "function": "Extensión de cadera",
        "bias": "Puede ganar protagonismo según configuración",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "adductors",
        "level": "S",
        "direct": false,
        "function": "Extensión/estabilización de cadera",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "glute_med_min",
        "level": "C",
        "direct": false,
        "function": "Estabilización pélvica frontal",
        "bias": "Demanda unilateral",
        "confidence": "Alta",
        "notes": "Estabilización relevante, pero no sustituye por defecto trabajo directo de abducción."
      },
      {
        "code": "hamstrings",
        "level": "C",
        "direct": false,
        "function": "Extensión de cadera/estabilización",
        "bias": "No sustituye trabajo específico",
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "deep_core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Media",
    "scalability": "Alta",
    "stability": "Media",
    "localFatigue": "Alta",
    "systemicDemand": "Media-Alta",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Media",
    "repSpec": {
      "min": 6,
      "max": 15,
      "unit": "reps",
      "perSide": true,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-15/lado"
    },
    "restSpec": {
      "min": 90,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "90-180 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Alto",
    "densitySuitability": "Baja",
    "substitutionFamily": "Zancadas",
    "motorNotes": "Entrada hacia delante añade demanda de desaceleración; alta afinidad con otras zancadas."
  },
  {
    "id": "legs_reverse_lunge",
    "name": "Zancada inversa",
    "block": "Pierna",
    "family": "Zancada",
    "movementPattern": "Unilateral dinámico",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Mancuernas/Barra/Smith/Peso corporal",
    "equipmentOptions": [
      []
    ],
    "loadSource": "Externa/Corporal",
    "laterality": "Alterna/Unilateral",
    "primaryMuscle": "Cuádriceps",
    "secondaryNotes": "Glúteo mayor; aductores; estabilizadores de cadera",
    "muscles": [
      {
        "code": "quadriceps",
        "level": "P",
        "direct": true,
        "function": "Extensión de rodilla",
        "bias": "Sesgo según zancada/altura/torso/ROM",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "glute_max",
        "level": "S",
        "direct": true,
        "function": "Extensión de cadera",
        "bias": "Puede ganar protagonismo según configuración",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "adductors",
        "level": "S",
        "direct": false,
        "function": "Extensión/estabilización de cadera",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "glute_med_min",
        "level": "C",
        "direct": false,
        "function": "Estabilización pélvica frontal",
        "bias": "Demanda unilateral",
        "confidence": "Alta",
        "notes": "Estabilización relevante, pero no sustituye por defecto trabajo directo de abducción."
      },
      {
        "code": "hamstrings",
        "level": "C",
        "direct": false,
        "function": "Extensión de cadera/estabilización",
        "bias": "No sustituye trabajo específico",
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "deep_core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Media-Alta",
    "strengthRequirement": "Media",
    "scalability": "Alta",
    "stability": "Media-Alta",
    "localFatigue": "Alta",
    "systemicDemand": "Media",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Media-Alta",
    "repSpec": {
      "min": 6,
      "max": 15,
      "unit": "reps",
      "perSide": true,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-15/lado"
    },
    "restSpec": {
      "min": 90,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "90-180 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Alto",
    "densitySuitability": "Baja-Media",
    "substitutionFamily": "Zancadas",
    "motorNotes": "Entrada hacia atrás cambia control/accesibilidad frente a forward lunge."
  },
  {
    "id": "legs_walking_lunge",
    "name": "Zancada caminando",
    "block": "Pierna",
    "family": "Zancada",
    "movementPattern": "Unilateral locomotor",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Mancuernas/Barra",
    "equipmentOptions": [
      [
        "mancuernas"
      ],
      [
        "barra"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Alterna",
    "primaryMuscle": "Cuádriceps",
    "secondaryNotes": "Glúteo mayor; aductores; estabilizadores de cadera",
    "muscles": [
      {
        "code": "quadriceps",
        "level": "P",
        "direct": true,
        "function": "Extensión de rodilla",
        "bias": "Sesgo según zancada/altura/torso/ROM",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "glute_max",
        "level": "S",
        "direct": true,
        "function": "Extensión de cadera",
        "bias": "Puede ganar protagonismo según configuración",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "adductors",
        "level": "S",
        "direct": false,
        "function": "Extensión/estabilización de cadera",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "glute_med_min",
        "level": "C",
        "direct": false,
        "function": "Estabilización pélvica frontal",
        "bias": "Demanda unilateral",
        "confidence": "Alta",
        "notes": "Estabilización relevante, pero no sustituye por defecto trabajo directo de abducción."
      },
      {
        "code": "hamstrings",
        "level": "C",
        "direct": false,
        "function": "Extensión de cadera/estabilización",
        "bias": "No sustituye trabajo específico",
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "deep_core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Media",
    "scalability": "Alta",
    "stability": "Media",
    "localFatigue": "Alta",
    "systemicDemand": "Alta",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Media",
    "repSpec": {
      "min": 8,
      "max": 20,
      "unit": "steps",
      "perSide": true,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-20 pasos/lado"
    },
    "restSpec": {
      "min": 90,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "90-180 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Alto",
    "densitySuitability": "Baja",
    "substitutionFamily": "Zancadas",
    "motorNotes": "Locomoción, espacio y fatiga sistémica justifican MOTOR propio."
  },
  {
    "id": "legs_goblet_squat",
    "name": "Sentadilla Goblet",
    "block": "Pierna",
    "family": "Sentadilla",
    "movementPattern": "Dominante de rodilla/cadera",
    "compatibleRoles": [
      "Principal",
      "Aprendizaje"
    ],
    "optIn": false,
    "equipment": "Mancuerna/Kettlebell",
    "equipmentOptions": [
      [
        "mancuernas"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Cuádriceps",
    "secondaryNotes": "Glúteo mayor; aductor mayor; core",
    "muscles": [
      {
        "code": "quadriceps",
        "level": "P",
        "direct": true,
        "function": "Extensión de rodilla",
        "bias": "Sesgo según ROM, técnica y configuración",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "glute_max",
        "level": "S",
        "direct": true,
        "function": "Extensión de cadera",
        "bias": "Contribución ↑ generalmente con mayor demanda de extensión de cadera/ROM",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "adductors",
        "level": "S",
        "direct": false,
        "function": "Extensión/estabilización de cadera",
        "bias": "Aductor mayor relevante",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "hamstrings",
        "level": "C",
        "direct": false,
        "function": "Co-contracción/estabilización y extensión de cadera",
        "bias": "No sustituye flexión de rodilla ni bisagra específica",
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "erectors",
        "level": "S",
        "direct": false,
        "function": "Estabilización del tronco",
        "bias": "Mayor en carga libre/axial",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "deep_core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja-Media",
    "scalability": "Media-Alta",
    "stability": "Alta",
    "localFatigue": "Media",
    "systemicDemand": "Media",
    "progressionSuitability": "Media",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 8,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-20"
    },
    "restSpec": {
      "min": 60,
      "max": 150,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-150 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Sentadilla bilateral",
    "motorNotes": "Muy accesible; progresión puede limitarse por sostener cargas altas. Talón elevado = configuración."
  },
  {
    "id": "legs_step_up",
    "name": "Step-Up",
    "block": "Pierna",
    "family": "Unilateral",
    "movementPattern": "Subida unilateral",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Mancuernas/Barra/Smith/Peso corporal",
    "equipmentOptions": [
      []
    ],
    "loadSource": "Externa/Corporal",
    "laterality": "Unilateral",
    "primaryMuscle": "Cuádriceps",
    "secondaryNotes": "Glúteo mayor; aductores; glúteo medio/estabilizadores",
    "muscles": [
      {
        "code": "quadriceps",
        "level": "P",
        "direct": true,
        "function": "Extensión de rodilla",
        "bias": "Sesgo según zancada/altura/torso/ROM",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "glute_max",
        "level": "S",
        "direct": true,
        "function": "Extensión de cadera",
        "bias": "Puede ganar protagonismo según configuración",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "adductors",
        "level": "S",
        "direct": false,
        "function": "Extensión/estabilización de cadera",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "glute_med_min",
        "level": "C",
        "direct": false,
        "function": "Estabilización pélvica frontal",
        "bias": "Demanda unilateral",
        "confidence": "Alta",
        "notes": "Estabilización relevante, pero no sustituye por defecto trabajo directo de abducción."
      },
      {
        "code": "hamstrings",
        "level": "C",
        "direct": false,
        "function": "Extensión de cadera/estabilización",
        "bias": "No sustituye trabajo específico",
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "deep_core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Media",
    "scalability": "Alta",
    "stability": "Media",
    "localFatigue": "Alta",
    "systemicDemand": "Media-Alta",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Media",
    "repSpec": {
      "min": 6,
      "max": 15,
      "unit": "reps",
      "perSide": true,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-15/lado"
    },
    "restSpec": {
      "min": 90,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "90-180 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Alto",
    "densitySuitability": "Baja-Media",
    "substitutionFamily": "Unilateral dominante rodilla",
    "motorNotes": "Altura del cajón es configuración clave; evitar impulso excesivo de la pierna inferior."
  },
  {
    "id": "legs_sissy_squat",
    "name": "Sissy Squat",
    "block": "Pierna",
    "family": "Extensión de rodilla",
    "movementPattern": "Dominante de rodilla",
    "compatibleRoles": [
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Peso corporal/Máquina compatible",
    "equipmentOptions": [
      []
    ],
    "loadSource": "Corporal/Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Cuádriceps",
    "secondaryNotes": "Core/estabilizadores",
    "muscles": [
      {
        "code": "quadriceps",
        "level": "P",
        "direct": true,
        "function": "Extensión de rodilla",
        "bias": "Dominante de rodilla",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "deep_core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Baja-Media",
    "strengthRequirement": "Media",
    "scalability": "Media",
    "stability": "Media",
    "localFatigue": "Alta",
    "systemicDemand": "Baja-Media",
    "progressionSuitability": "Media",
    "nearFailureSuitability": "Media",
    "repSpec": {
      "min": 8,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Medio",
    "densitySuitability": "Media",
    "substitutionFamily": "Extensión de rodilla",
    "motorNotes": "Prioridad secundaria. Asistida/no asistida/carga = configuraciones; exige control y tolerancia."
  },
  {
    "id": "legs_belt_squat",
    "name": "Belt Squat",
    "block": "Pierna",
    "family": "Sentadilla",
    "movementPattern": "Dominante de rodilla/cadera",
    "compatibleRoles": [
      "Principal"
    ],
    "optIn": false,
    "equipment": "Belt squat",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Cuádriceps",
    "secondaryNotes": "Glúteo mayor; aductor mayor",
    "muscles": [
      {
        "code": "quadriceps",
        "level": "P",
        "direct": true,
        "function": "Extensión de rodilla",
        "bias": "Sesgo según ROM, técnica y configuración",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "glute_max",
        "level": "S",
        "direct": true,
        "function": "Extensión de cadera",
        "bias": "Contribución ↑ generalmente con mayor demanda de extensión de cadera/ROM",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "adductors",
        "level": "S",
        "direct": false,
        "function": "Extensión/estabilización de cadera",
        "bias": "Aductor mayor relevante",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "hamstrings",
        "level": "C",
        "direct": false,
        "function": "Co-contracción/estabilización y extensión de cadera",
        "bias": "No sustituye flexión de rodilla ni bisagra específica",
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "erectors",
        "level": "C",
        "direct": false,
        "function": "Estabilización del tronco",
        "bias": "Mayor en carga libre/axial",
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "deep_core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Media",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Alta",
    "systemicDemand": "Media",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 6,
      "max": 15,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-15"
    },
    "restSpec": {
      "min": 120,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "120-180 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Medio",
    "densitySuitability": "Media",
    "substitutionFamily": "Sentadilla bilateral",
    "motorNotes": "Carga en pelvis reduce demanda de soporte axial del tronco; sistemas lever/cable/pin = implementaciones."
  },
  {
    "id": "hamstrings_seated_leg_curl",
    "name": "Curl femoral sentado",
    "block": "Isquios",
    "family": "Flexión de rodilla",
    "movementPattern": "Flexión de rodilla",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Máquina",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral/Unilateral",
    "primaryMuscle": "Isquiosurales",
    "secondaryNotes": "Gastrocnemio colaborador",
    "muscles": [
      {
        "code": "hamstrings",
        "level": "P",
        "direct": true,
        "function": "Flexión de rodilla",
        "bias": "Posición de cadera diferencia longitud/mecánica",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "gastrocnemius",
        "level": "C",
        "direct": false,
        "function": "Flexión de rodilla",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Alta",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 8,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Curl femoral",
    "motorNotes": "Cadera flexionada coloca biarticulares a mayor longitud; bilateral/unilateral = configuración."
  },
  {
    "id": "hamstrings_lying_leg_curl",
    "name": "Curl femoral tumbado",
    "block": "Isquios",
    "family": "Flexión de rodilla",
    "movementPattern": "Flexión de rodilla",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Máquina",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral/Unilateral",
    "primaryMuscle": "Isquiosurales",
    "secondaryNotes": "Gastrocnemio colaborador",
    "muscles": [
      {
        "code": "hamstrings",
        "level": "P",
        "direct": true,
        "function": "Flexión de rodilla",
        "bias": "Posición de cadera diferencia longitud/mecánica",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "gastrocnemius",
        "level": "C",
        "direct": false,
        "function": "Flexión de rodilla",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Alta",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 8,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Curl femoral",
    "motorNotes": "Alta afinidad con sentado; posición de cadera distinta justifica MOTOR separado."
  },
  {
    "id": "hamstrings_standing_leg_curl",
    "name": "Curl femoral de pie unilateral",
    "block": "Isquios",
    "family": "Flexión de rodilla",
    "movementPattern": "Flexión de rodilla unilateral",
    "compatibleRoles": [
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Máquina",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Unilateral",
    "primaryMuscle": "Isquiosurales",
    "secondaryNotes": "Gastrocnemio colaborador",
    "muscles": [
      {
        "code": "hamstrings",
        "level": "P",
        "direct": true,
        "function": "Flexión de rodilla",
        "bias": "Posición de cadera diferencia longitud/mecánica",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "gastrocnemius",
        "level": "C",
        "direct": false,
        "function": "Flexión de rodilla",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Alta",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 8,
      "max": 20,
      "unit": "reps",
      "perSide": true,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-20/lado"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Medio",
    "densitySuitability": "Alta",
    "substitutionFamily": "Curl femoral",
    "motorNotes": "Unilateral inherente; setup/estabilidad y posición de cadera distintos."
  },
  {
    "id": "hamstrings_romanian_deadlift",
    "name": "Peso muerto rumano (RDL)",
    "block": "Isquios",
    "family": "Bisagra de cadera",
    "movementPattern": "Extensión de cadera/bisagra",
    "compatibleRoles": [
      "Principal"
    ],
    "optIn": false,
    "equipment": "Barra/Mancuernas/Smith",
    "equipmentOptions": [
      [
        "barra"
      ],
      [
        "mancuernas"
      ],
      [
        "smith"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Isquiosurales",
    "secondaryNotes": "Glúteo mayor; aductor mayor; erectores/core",
    "muscles": [
      {
        "code": "hamstrings",
        "level": "P",
        "direct": true,
        "function": "Extensión de cadera / bisagra",
        "bias": "Trabajo a longitudes altas según ROM/técnica",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "glute_max",
        "level": "S",
        "direct": true,
        "function": "Extensión de cadera",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "adductors",
        "level": "S",
        "direct": false,
        "function": "Extensión de cadera",
        "bias": "Aductor mayor",
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "erectors",
        "level": "S",
        "direct": false,
        "function": "Estabilización/extensión isométrica del tronco",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "deep_core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Media-Alta",
    "scalability": "Alta",
    "stability": "Media",
    "localFatigue": "Alta",
    "systemicDemand": "Alta",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Media",
    "repSpec": {
      "min": 5,
      "max": 12,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "5-12"
    },
    "restSpec": {
      "min": 120,
      "max": 240,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "120-240 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Medio",
    "densitySuitability": "Baja",
    "substitutionFamily": "Bisagra de cadera",
    "motorNotes": "Barra referencia; DB/Smith implementaciones. Stiff-Leg Deadlift = variante técnica, no MOTOR."
  },
  {
    "id": "hamstrings_single_leg_rdl",
    "name": "RDL unilateral",
    "block": "Isquios",
    "family": "Bisagra unilateral",
    "movementPattern": "Extensión de cadera unilateral",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Mancuerna/Kettlebell/Barra",
    "equipmentOptions": [
      [
        "mancuernas"
      ],
      [
        "barra"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Unilateral",
    "primaryMuscle": "Isquiosurales",
    "secondaryNotes": "Glúteo mayor; glúteo medio; aductor mayor; core",
    "muscles": [
      {
        "code": "hamstrings",
        "level": "P",
        "direct": true,
        "function": "Extensión de cadera / bisagra",
        "bias": "Trabajo a longitudes altas según ROM/técnica",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "glute_max",
        "level": "S",
        "direct": true,
        "function": "Extensión de cadera",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "adductors",
        "level": "S",
        "direct": false,
        "function": "Extensión de cadera",
        "bias": "Aductor mayor",
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "erectors",
        "level": "S",
        "direct": false,
        "function": "Estabilización/extensión isométrica del tronco",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "deep_core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "glute_med_min",
        "level": "C",
        "direct": false,
        "function": "Estabilización pélvica",
        "bias": "Demanda unilateral",
        "confidence": "Alta",
        "notes": "Estabilización relevante, pero no sustituye por defecto trabajo directo de abducción."
      }
    ],
    "accessibility": "Media-Baja",
    "strengthRequirement": "Media",
    "scalability": "Alta",
    "stability": "Baja-Media",
    "localFatigue": "Alta",
    "systemicDemand": "Media",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Media",
    "repSpec": {
      "min": 6,
      "max": 15,
      "unit": "reps",
      "perSide": true,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-15/lado"
    },
    "restSpec": {
      "min": 90,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "90-180 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Alto",
    "densitySuitability": "Baja",
    "substitutionFamily": "Bisagra de cadera",
    "motorNotes": "MOTOR separado por balance, estabilización de cadera y menor carga absoluta."
  },
  {
    "id": "hamstrings_good_morning",
    "name": "Good Morning / Buenos días",
    "block": "Isquios",
    "family": "Bisagra de cadera",
    "movementPattern": "Extensión de cadera/bisagra",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Barra/Smith",
    "equipmentOptions": [
      [
        "barra"
      ],
      [
        "smith"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Isquiosurales",
    "secondaryNotes": "Glúteo mayor; aductor mayor; erectores",
    "muscles": [
      {
        "code": "hamstrings",
        "level": "P",
        "direct": true,
        "function": "Extensión de cadera / bisagra",
        "bias": "Trabajo a longitudes altas según ROM/técnica",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "glute_max",
        "level": "S",
        "direct": true,
        "function": "Extensión de cadera",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "adductors",
        "level": "S",
        "direct": false,
        "function": "Extensión de cadera",
        "bias": "Aductor mayor",
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "erectors",
        "level": "S",
        "direct": false,
        "function": "Estabilización/extensión isométrica del tronco",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "deep_core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Baja-Media",
    "strengthRequirement": "Media",
    "scalability": "Alta",
    "stability": "Media",
    "localFatigue": "Alta",
    "systemicDemand": "Alta",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Baja-Media",
    "repSpec": {
      "min": 6,
      "max": 15,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-15"
    },
    "restSpec": {
      "min": 120,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "120-180 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Medio",
    "densitySuitability": "Baja",
    "substitutionFamily": "Bisagra de cadera",
    "motorNotes": "Carga sobre hombros cambia demandas respecto a RDL. Smith = implementación."
  },
  {
    "id": "hamstrings_45deg_hip_extension",
    "name": "Extensión de cadera a 45° / Back Extension",
    "block": "Isquios",
    "family": "Extensión de cadera",
    "movementPattern": "Bisagra/extensión de cadera",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Banco 45°",
    "equipmentOptions": [
      [
        "banco"
      ]
    ],
    "loadSource": "Corporal/Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Isquiosurales",
    "secondaryNotes": "Glúteo mayor; erectores",
    "muscles": [
      {
        "code": "hamstrings",
        "level": "P",
        "direct": true,
        "function": "Extensión de cadera / bisagra",
        "bias": "Trabajo a longitudes altas según ROM/técnica",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "glute_max",
        "level": "P",
        "direct": true,
        "function": "Extensión de cadera",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "adductors",
        "level": "C",
        "direct": false,
        "function": "Extensión de cadera",
        "bias": "Aductor mayor",
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "erectors",
        "level": "S",
        "direct": false,
        "function": "Estabilización/extensión isométrica del tronco",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "deep_core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja-Media",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Alta",
    "systemicDemand": "Baja-Media",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 8,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Bisagra de cadera",
    "motorNotes": "Ejecutar como bisagra de cadera; posición de rodilla/ROM/carga = configuraciones. No llamarlo solo hiperextensión lumbar."
  },
  {
    "id": "glutes_hip_thrust",
    "name": "Hip Thrust",
    "block": "Glúteos",
    "family": "Extensión horizontal de cadera",
    "movementPattern": "Extensión de cadera",
    "compatibleRoles": [
      "Principal"
    ],
    "optIn": false,
    "equipment": "Barra/Smith/Máquina",
    "equipmentOptions": [
      [
        "barra"
      ],
      [
        "smith"
      ],
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral/Unilateral",
    "primaryMuscle": "Glúteo mayor",
    "secondaryNotes": "Isquios; aductor mayor; core",
    "muscles": [
      {
        "code": "glute_max",
        "level": "P",
        "direct": true,
        "function": "Extensión de cadera",
        "bias": "Extensión horizontal; alta especificidad glútea",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "hamstrings",
        "level": "S",
        "direct": false,
        "function": "Extensión de cadera",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "adductors",
        "level": "C",
        "direct": false,
        "function": "Colaboración en extensión/estabilización",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "deep_core",
        "level": "E",
        "direct": false,
        "function": "Control lumbo-pélvico",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja-Media",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Alta",
    "systemicDemand": "Baja-Media",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 6,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-20"
    },
    "restSpec": {
      "min": 90,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "90-180 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Medio",
    "densitySuitability": "Media-Alta",
    "substitutionFamily": "Extensión horizontal de cadera",
    "motorNotes": "Glute Bridge, unilateral y Frog Pump = variantes/configuraciones; no MOTOR separados."
  },
  {
    "id": "glutes_cable_kickback",
    "name": "Patada de glúteo en polea",
    "block": "Glúteos",
    "family": "Extensión unilateral de cadera",
    "movementPattern": "Extensión de cadera unilateral",
    "compatibleRoles": [
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Polea baja+cuff",
    "equipmentOptions": [
      [
        "polea"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Unilateral",
    "primaryMuscle": "Glúteo mayor",
    "secondaryNotes": "Isquios; aductor mayor; estabilizadores pélvicos",
    "muscles": [
      {
        "code": "glute_max",
        "level": "P",
        "direct": true,
        "function": "Extensión de cadera unilateral",
        "bias": "Trayectoria diagonal puede añadir abducción",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "hamstrings",
        "level": "S",
        "direct": false,
        "function": "Extensión de cadera",
        "bias": "Dependiente de posición de rodilla",
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "adductors",
        "level": "C",
        "direct": false,
        "function": "Estabilización/colaboración",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "glute_med_min",
        "level": "C",
        "direct": false,
        "function": "Estabilización/abducción si trayectoria diagonal",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Media-Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Media",
    "localFatigue": "Alta",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 10,
      "max": 25,
      "unit": "reps",
      "perSide": true,
      "byCapacity": false,
      "openEnded": false,
      "raw": "10-25/lado"
    },
    "restSpec": {
      "min": 45,
      "max": 90,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "45-90 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Medio",
    "densitySuitability": "Alta",
    "substitutionFamily": "Extensión unilateral de cadera",
    "motorNotes": "Trayectoria posterior/diagonal y posición de rodilla = configuraciones; diagonal añade componente de abducción."
  },
  {
    "id": "glutes_kickback_machine",
    "name": "Patada de glúteo en máquina",
    "block": "Glúteos",
    "family": "Extensión unilateral de cadera",
    "movementPattern": "Extensión de cadera unilateral",
    "compatibleRoles": [
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Máquina",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Unilateral",
    "primaryMuscle": "Glúteo mayor",
    "secondaryNotes": "Isquios; aductor mayor",
    "muscles": [
      {
        "code": "glute_max",
        "level": "P",
        "direct": true,
        "function": "Extensión de cadera unilateral",
        "bias": "Trayectoria diagonal puede añadir abducción",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "hamstrings",
        "level": "S",
        "direct": false,
        "function": "Extensión de cadera",
        "bias": "Dependiente de posición de rodilla",
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "adductors",
        "level": "C",
        "direct": false,
        "function": "Estabilización/colaboración",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "glute_med_min",
        "level": "C",
        "direct": false,
        "function": "Estabilización/abducción si trayectoria diagonal",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Alta",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 8,
      "max": 20,
      "unit": "reps",
      "perSide": true,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-20/lado"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Medio",
    "densitySuitability": "Alta",
    "substitutionFamily": "Extensión unilateral de cadera",
    "motorNotes": "MOTOR separado de polea por estabilidad, trayectoria guiada, setup y progresión."
  },
  {
    "id": "glutes_abduction_machine",
    "name": "Abducción de cadera en máquina",
    "block": "Glúteos",
    "family": "Abducción de cadera",
    "movementPattern": "Abducción",
    "compatibleRoles": [
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Máquina",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral/Unilateral",
    "primaryMuscle": "Glúteo medio/menor",
    "secondaryNotes": "Porción superior glúteo mayor; TFL",
    "muscles": [
      {
        "code": "glute_med_min",
        "level": "P",
        "direct": true,
        "function": "Abducción de cadera",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "glute_max",
        "level": "S",
        "direct": false,
        "function": "Abducción",
        "bias": "Porciones superiores; depende de posición/ángulo",
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Alta",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 10,
      "max": 25,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "10-25"
    },
    "restSpec": {
      "min": 45,
      "max": 90,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "45-90 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Abducción de cadera",
    "motorNotes": "Tronco/posición de cadera = configuraciones; no asignar músculos por inclinaciones simplistas."
  },
  {
    "id": "glutes_cable_abduction",
    "name": "Abducción de cadera en polea",
    "block": "Glúteos",
    "family": "Abducción de cadera",
    "movementPattern": "Abducción unilateral",
    "compatibleRoles": [
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Polea baja+cuff",
    "equipmentOptions": [
      [
        "polea"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Unilateral",
    "primaryMuscle": "Glúteo medio/menor",
    "secondaryNotes": "Porción superior glúteo mayor; TFL; estabilizadores pierna apoyo",
    "muscles": [
      {
        "code": "glute_med_min",
        "level": "P",
        "direct": true,
        "function": "Abducción de cadera",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "glute_max",
        "level": "S",
        "direct": false,
        "function": "Abducción",
        "bias": "Porciones superiores; depende de posición/ángulo",
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "deep_core",
        "level": "E",
        "direct": false,
        "function": "Estabilización unilateral",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Media",
    "localFatigue": "Alta",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 10,
      "max": 25,
      "unit": "reps",
      "perSide": true,
      "byCapacity": false,
      "openEnded": false,
      "raw": "10-25/lado"
    },
    "restSpec": {
      "min": 45,
      "max": 90,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "45-90 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Medio",
    "densitySuitability": "Alta",
    "substitutionFamily": "Abducción de cadera",
    "motorNotes": "Trayectoria lateral o ligeramente posterior = configuraciones; no imponer rotación del pie."
  },
  {
    "id": "glutes_cable_pull_through",
    "name": "Cable Pull-Through",
    "block": "Glúteos",
    "family": "Bisagra de cadera",
    "movementPattern": "Extensión de cadera/bisagra",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Polea baja+cuerda",
    "equipmentOptions": [
      [
        "polea"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Glúteo mayor",
    "secondaryNotes": "Isquios; aductor mayor; erectores/core",
    "muscles": [
      {
        "code": "glute_max",
        "level": "P",
        "direct": true,
        "function": "Extensión de cadera / bisagra",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "hamstrings",
        "level": "P",
        "direct": true,
        "function": "Extensión de cadera / bisagra",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "adductors",
        "level": "S",
        "direct": false,
        "function": "Extensión de cadera",
        "bias": "Aductor mayor",
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "erectors",
        "level": "C",
        "direct": false,
        "function": "Estabilización del tronco",
        "bias": "Menor demanda que bisagras con carga axial/libre",
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "deep_core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja-Media",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Alta",
    "systemicDemand": "Media",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 8,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Bisagra de cadera",
    "motorNotes": "MOTOR propio por vector de polea, setup y menor limitación de agarre respecto a RDL."
  },
  {
    "id": "glutes_sumo_deadlift",
    "name": "Peso muerto sumo",
    "block": "Glúteos",
    "family": "Peso muerto",
    "movementPattern": "Extensión cadera+rodilla",
    "compatibleRoles": [
      "Principal"
    ],
    "optIn": false,
    "equipment": "Barra",
    "equipmentOptions": [
      [
        "barra"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Glúteo mayor",
    "secondaryNotes": "Aductor mayor; cuádriceps; isquios; erectores/core",
    "muscles": [
      {
        "code": "glute_max",
        "level": "P",
        "direct": true,
        "function": "Extensión de cadera",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "adductors",
        "level": "P",
        "direct": true,
        "function": "Extensión/aducción de cadera",
        "bias": "Aductor mayor especialmente relevante",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "quadriceps",
        "level": "S",
        "direct": true,
        "function": "Extensión de rodilla",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "hamstrings",
        "level": "S",
        "direct": false,
        "function": "Extensión de cadera",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "erectors",
        "level": "S",
        "direct": false,
        "function": "Estabilización del tronco",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "deep_core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Media-Baja",
    "strengthRequirement": "Alta",
    "scalability": "Alta",
    "stability": "Media",
    "localFatigue": "Alta",
    "systemicDemand": "Alta",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Media",
    "repSpec": {
      "min": 4,
      "max": 10,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "4-10"
    },
    "restSpec": {
      "min": 150,
      "max": 300,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "150-300 s"
    },
    "setupCost": "Alto",
    "executionTimeCost": "Medio",
    "densitySuitability": "Baja",
    "substitutionFamily": "Peso muerto",
    "motorNotes": "Postura amplia y mecánica multiarticular justifican MOTOR propio. DB/KB = implementaciones/regresiones."
  },
  {
    "id": "calves_standing_raise",
    "name": "Elevación de talones de pie",
    "block": "Gemelos",
    "family": "Flexión plantar rodilla extendida",
    "movementPattern": "Flexión plantar",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Máquina/Smith/Mancuerna/Barra",
    "equipmentOptions": [
      [
        "maquina"
      ],
      [
        "smith"
      ],
      [
        "mancuernas"
      ],
      [
        "barra"
      ]
    ],
    "loadSource": "Externa/Corporal",
    "laterality": "Bilateral/Unilateral",
    "primaryMuscle": "Gastrocnemio",
    "secondaryNotes": "Sóleo; estabilizadores tobillo",
    "muscles": [
      {
        "code": "gastrocnemius",
        "level": "P",
        "direct": true,
        "function": "Flexión plantar",
        "bias": "Rodilla extendida",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "soleus",
        "level": "S",
        "direct": true,
        "function": "Flexión plantar",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Alta",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 8,
      "max": 25,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-25"
    },
    "restSpec": {
      "min": 45,
      "max": 90,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "45-90 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Gemelo rodilla extendida",
    "motorNotes": "Mancuerna en escalón, unilateral, Smith y máquina = implementaciones/configuraciones; ROM amplio controlado."
  },
  {
    "id": "calves_seated_raise",
    "name": "Elevación de talones sentado",
    "block": "Gemelos",
    "family": "Flexión plantar rodilla flexionada",
    "movementPattern": "Flexión plantar",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Máquina/Mancuerna/Barra",
    "equipmentOptions": [
      [
        "maquina"
      ],
      [
        "mancuernas"
      ],
      [
        "barra"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral/Unilateral",
    "primaryMuscle": "Sóleo",
    "secondaryNotes": "Gastrocnemio con contribución reducida",
    "muscles": [
      {
        "code": "soleus",
        "level": "P",
        "direct": true,
        "function": "Flexión plantar",
        "bias": "Rodilla flexionada",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "gastrocnemius",
        "level": "C",
        "direct": true,
        "function": "Flexión plantar",
        "bias": "Contribución relativa reducida con rodilla flexionada",
        "confidence": "Alta",
        "notes": "Contribución presente pero reducida por la rodilla flexionada; no cubre por defecto el patrón de rodilla extendida."
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Alta",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 10,
      "max": 30,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "10-30"
    },
    "restSpec": {
      "min": 45,
      "max": 90,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "45-90 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Gemelo rodilla flexionada",
    "motorNotes": "Rodilla flexionada reduce protagonismo del gastrocnemio; no afirmar aislamiento absoluto del sóleo."
  },
  {
    "id": "calves_leg_press_raise",
    "name": "Elevación de talones en prensa",
    "block": "Gemelos",
    "family": "Flexión plantar rodilla extendida",
    "movementPattern": "Flexión plantar",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Prensa",
    "equipmentOptions": [
      [
        "prensa"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral/Unilateral",
    "primaryMuscle": "Gastrocnemio",
    "secondaryNotes": "Sóleo",
    "muscles": [
      {
        "code": "gastrocnemius",
        "level": "P",
        "direct": true,
        "function": "Flexión plantar",
        "bias": "Rodilla extendida",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "soleus",
        "level": "S",
        "direct": true,
        "function": "Flexión plantar",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Alta",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 8,
      "max": 25,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-25"
    },
    "restSpec": {
      "min": 45,
      "max": 90,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "45-90 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Gemelo rodilla extendida",
    "motorNotes": "MOTOR distinto de leg press de piernas: cambia completamente la función a flexión plantar."
  },
  {
    "id": "calves_hack_squat_raise",
    "name": "Elevación de talones en Hack Squat",
    "block": "Gemelos",
    "family": "Flexión plantar rodilla extendida",
    "movementPattern": "Flexión plantar",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Hack squat",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Gastrocnemio",
    "secondaryNotes": "Sóleo",
    "muscles": [
      {
        "code": "gastrocnemius",
        "level": "P",
        "direct": true,
        "function": "Flexión plantar",
        "bias": "Rodilla extendida",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "soleus",
        "level": "S",
        "direct": true,
        "function": "Flexión plantar",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Alta",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 8,
      "max": 25,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-25"
    },
    "restSpec": {
      "min": 45,
      "max": 90,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "45-90 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Gemelo rodilla extendida",
    "motorNotes": "Muy estable y progresable; alta afinidad con standing calf raise."
  },
  {
    "id": "adductors_machine",
    "name": "Máquina de aductores",
    "block": "Aductores",
    "family": "Aducción de cadera",
    "movementPattern": "Aducción",
    "compatibleRoles": [
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Máquina",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral/Unilateral",
    "primaryMuscle": "Aductores de cadera",
    "secondaryNotes": "Aductor mayor; grácil; pectíneo",
    "muscles": [
      {
        "code": "adductors",
        "level": "P",
        "direct": true,
        "function": "Aducción de cadera",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Alta",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 10,
      "max": 25,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "10-25"
    },
    "restSpec": {
      "min": 45,
      "max": 90,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "45-90 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Aducción de cadera",
    "motorNotes": "ROM/ángulo inicial y unilateralidad = configuraciones; considerar trabajo indirecto de sentadillas, sumo, RDL, etc."
  },
  {
    "id": "adductors_cable_adduction",
    "name": "Aducción de cadera en polea",
    "block": "Aductores",
    "family": "Aducción de cadera",
    "movementPattern": "Aducción unilateral",
    "compatibleRoles": [
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Polea baja+cuff/Banda",
    "equipmentOptions": [
      [
        "polea"
      ],
      [
        "banda"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Unilateral",
    "primaryMuscle": "Aductores de cadera",
    "secondaryNotes": "Grácil; pectíneo; estabilizadores pierna apoyo",
    "muscles": [
      {
        "code": "adductors",
        "level": "P",
        "direct": true,
        "function": "Aducción de cadera",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "glute_med_min",
        "level": "E",
        "direct": false,
        "function": "Estabilización de pierna de apoyo",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "deep_core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Media",
    "localFatigue": "Alta",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 10,
      "max": 25,
      "unit": "reps",
      "perSide": true,
      "byCapacity": false,
      "openEnded": false,
      "raw": "10-25/lado"
    },
    "restSpec": {
      "min": 45,
      "max": 90,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "45-90 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Medio",
    "densitySuitability": "Alta",
    "substitutionFamily": "Aducción de cadera",
    "motorNotes": "Polea/banda y ROM = configuraciones. No cruzar exageradamente la línea media."
  },
  {
    "id": "tibialis_raise",
    "name": "Tibialis Raise / Elevación de tibial",
    "block": "Tibial anterior",
    "family": "Dorsiflexión",
    "movementPattern": "Dorsiflexión tobillo",
    "compatibleRoles": [
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Pared/Banda/Máquina/Tib bar",
    "equipmentOptions": [
      []
    ],
    "loadSource": "Corporal/Externa",
    "laterality": "Bilateral/Unilateral",
    "primaryMuscle": "Tibial anterior",
    "secondaryNotes": "Otros dorsiflexores del tobillo",
    "muscles": [
      {
        "code": "tibialis_anterior",
        "level": "P",
        "direct": true,
        "function": "Dorsiflexión de tobillo",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Media",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 12,
      "max": 30,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "12-30"
    },
    "restSpec": {
      "min": 30,
      "max": 75,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "30-75 s"
    },
    "setupCost": "Mínimo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Dorsiflexión",
    "motorNotes": "Pared como referencia accesible; máquina/banda/tib bar = implementaciones. Disponible, no obligatorio."
  },
  {
    "id": "hip_flexors_cable_flexion",
    "name": "Flexión de cadera en polea",
    "block": "Flexores de cadera",
    "family": "Flexión de cadera",
    "movementPattern": "Flexión de cadera",
    "compatibleRoles": [
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Polea baja+cuff",
    "equipmentOptions": [
      [
        "polea"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Unilateral",
    "primaryMuscle": "Iliopsoas",
    "secondaryNotes": "Recto femoral; sartorio; TFL; estabilizadores pélvicos",
    "muscles": [
      {
        "code": "iliopsoas",
        "level": "P",
        "direct": true,
        "function": "Flexión de cadera",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "quadriceps",
        "level": "C",
        "direct": false,
        "function": "Flexión de cadera",
        "bias": "Recto femoral como componente biarticular",
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "glute_med_min",
        "level": "E",
        "direct": false,
        "function": "Estabilización pélvica de pierna de apoyo",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "deep_core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Media-Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Media",
    "localFatigue": "Media-Alta",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 10,
      "max": 20,
      "unit": "reps",
      "perSide": true,
      "byCapacity": false,
      "openEnded": false,
      "raw": "10-20/lado"
    },
    "restSpec": {
      "min": 45,
      "max": 90,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "45-90 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Medio",
    "densitySuitability": "Alta",
    "substitutionFamily": "Flexión de cadera",
    "motorNotes": "Trabajo directo opcional; banda y ajustes de posición = configuraciones/implementaciones."
  },
  {
    "id": "forearm_reverse_curl",
    "name": "Curl inverso",
    "block": "Antebrazo",
    "family": "Flexión codo pronada",
    "movementPattern": "Flexión codo pronada",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "optIn": false,
    "equipment": "Barra EZ/Barra/Mancuernas/Polea",
    "equipmentOptions": [
      [
        "barra"
      ],
      [
        "mancuernas"
      ],
      [
        "polea"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral/Unilateral",
    "primaryMuscle": "Braquiorradial/braquial",
    "secondaryNotes": "Bíceps braquial; musculatura de agarre/estabilización de muñeca",
    "muscles": [
      {
        "code": "brachioradialis",
        "level": "P",
        "direct": true,
        "function": "Flexión de codo",
        "bias": "Antebrazo pronado",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "brachialis",
        "level": "P",
        "direct": true,
        "function": "Flexión de codo",
        "bias": "Antebrazo pronado",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "biceps_brachii",
        "level": "C",
        "direct": false,
        "function": "Flexión de codo",
        "bias": "Menor ventaja mecánica en pronación",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "wrist_extensors",
        "level": "S",
        "direct": false,
        "function": "Estabilización de muñeca",
        "bias": "Agarre pronado",
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 8,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Flexión codo pronada",
    "motorNotes": "MOTOR propio. EZ como referencia práctica; barra recta, mancuernas y polea = implementaciones/configuraciones. La matriz reconoce contribución a flexores del codo."
  },
  {
    "id": "forearm_wrist_curl",
    "name": "Curl de muñeca / Wrist Curl",
    "block": "Antebrazo",
    "family": "Flexión muñeca",
    "movementPattern": "Flexión muñeca",
    "compatibleRoles": [
      "Aislamiento"
    ],
    "optIn": false,
    "equipment": "Mancuernas/Barra/Polea",
    "equipmentOptions": [
      [
        "mancuernas"
      ],
      [
        "barra"
      ],
      [
        "polea"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Variable",
    "primaryMuscle": "Flexores de muñeca/dedos",
    "secondaryNotes": "Musculatura de agarre",
    "muscles": [
      {
        "code": "wrist_flexors",
        "level": "P",
        "direct": true,
        "function": "Flexión de muñeca / dedos",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Media-Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 10,
      "max": 25,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "10-25"
    },
    "restSpec": {
      "min": 45,
      "max": 90,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "45-90 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Flexión muñeca",
    "motorNotes": "MOTOR propio. Barra, mancuernas, polea y unilateralidad = configuraciones."
  },
  {
    "id": "forearm_wrist_extension",
    "name": "Extensión de muñeca / Reverse Wrist Curl",
    "block": "Antebrazo",
    "family": "Extensión muñeca",
    "movementPattern": "Extensión muñeca",
    "compatibleRoles": [
      "Aislamiento"
    ],
    "optIn": false,
    "equipment": "Mancuernas/Barra/Polea",
    "equipmentOptions": [
      [
        "mancuernas"
      ],
      [
        "barra"
      ],
      [
        "polea"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Variable",
    "primaryMuscle": "Extensores de muñeca",
    "secondaryNotes": "Extensores del compartimento posterior del antebrazo",
    "muscles": [
      {
        "code": "wrist_extensors",
        "level": "P",
        "direct": true,
        "function": "Extensión de muñeca",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Media-Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 10,
      "max": 25,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "10-25"
    },
    "restSpec": {
      "min": 45,
      "max": 90,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "45-90 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Extensión muñeca",
    "motorNotes": "MOTOR propio. Barra, mancuernas, polea y unilateralidad = configuraciones."
  },
  {
    "id": "forearm_pronation_supination",
    "name": "Pronación / supinación de antebrazo",
    "block": "Antebrazo",
    "family": "Rotación antebrazo",
    "movementPattern": "Pronación / supinación",
    "compatibleRoles": [
      "Aislamiento",
      "Control"
    ],
    "optIn": false,
    "equipment": "Mancuerna/Palanca/Polea/Banda",
    "equipmentOptions": [
      [
        "mancuernas"
      ],
      [
        "maquina"
      ],
      [
        "polea"
      ],
      [
        "banda"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Unilateral/Variable",
    "primaryMuscle": "Pronadores / supinador",
    "secondaryNotes": "Bíceps braquial en supinación; estabilizadores de muñeca",
    "muscles": [
      {
        "code": "pronators",
        "level": "P",
        "direct": true,
        "function": "Pronación",
        "bias": "Configuración pronación",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "supinator",
        "level": "P",
        "direct": true,
        "function": "Supinación",
        "bias": "Configuración supinación",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "biceps_brachii",
        "level": "S",
        "direct": false,
        "function": "Supinación",
        "bias": "Especialmente con codo flexionado",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "wrist_flexors",
        "level": "E",
        "direct": false,
        "function": "Estabilización de muñeca",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "wrist_extensors",
        "level": "E",
        "direct": false,
        "function": "Estabilización de muñeca",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Media-Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Media",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 10,
      "max": 20,
      "unit": "reps",
      "perSide": true,
      "byCapacity": false,
      "openEnded": false,
      "raw": "10-20/lado"
    },
    "restSpec": {
      "min": 45,
      "max": 90,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "45-90 s"
    },
    "setupCost": "Bajo-Medio",
    "executionTimeCost": "Medio",
    "densitySuitability": "Media-Alta",
    "substitutionFamily": "Rotación antebrazo",
    "motorNotes": "Un único MOTOR. Pronación y supinación son configuraciones funcionales del mismo ejercicio; no crear dos fichas."
  },
  {
    "id": "core_machine_crunch",
    "name": "Abdominales en máquina",
    "block": "Core",
    "family": "Flexión tronco",
    "movementPattern": "Flexión tronco",
    "compatibleRoles": [
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Máquina",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Recto abdominal",
    "secondaryNotes": "Oblicuos y musculatura profunda estabilizan",
    "muscles": [
      {
        "code": "rectus_abdominis",
        "level": "P",
        "direct": true,
        "function": "Flexión de tronco",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "obliques",
        "level": "S",
        "direct": false,
        "function": "Flexión/control del tronco",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "deep_core",
        "level": "E",
        "direct": false,
        "function": "Estabilización lumbo-pélvica",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 8,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Flexión tronco",
    "motorNotes": "MOTOR propio. Máquina guiada y progresable; diseños selectorized/plate-loaded = configuraciones."
  },
  {
    "id": "core_cable_crunch",
    "name": "Crunch en polea alta / Cable Crunch",
    "block": "Core",
    "family": "Flexión tronco",
    "movementPattern": "Flexión tronco",
    "compatibleRoles": [
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Polea",
    "equipmentOptions": [
      [
        "polea"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Recto abdominal",
    "secondaryNotes": "Oblicuos; musculatura profunda estabiliza",
    "muscles": [
      {
        "code": "rectus_abdominis",
        "level": "P",
        "direct": true,
        "function": "Flexión de tronco",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "obliques",
        "level": "S",
        "direct": false,
        "function": "Flexión/control del tronco",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "deep_core",
        "level": "E",
        "direct": false,
        "function": "Estabilización lumbo-pélvica",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Media-Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Media-Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 8,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Flexión tronco",
    "motorNotes": "MOTOR propio. Arrodillado como referencia; de pie y accesorios = configuraciones. Evitar convertirlo en bisagra de cadera."
  },
  {
    "id": "core_floor_crunch",
    "name": "Crunch en suelo",
    "block": "Core",
    "family": "Flexión tronco",
    "movementPattern": "Flexión tronco",
    "compatibleRoles": [
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Peso corporal",
    "equipmentOptions": [
      []
    ],
    "loadSource": "Corporal/Externa opcional",
    "laterality": "Bilateral",
    "primaryMuscle": "Recto abdominal",
    "secondaryNotes": "Oblicuos; musculatura profunda estabiliza",
    "muscles": [
      {
        "code": "rectus_abdominis",
        "level": "P",
        "direct": true,
        "function": "Flexión de tronco",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "obliques",
        "level": "S",
        "direct": false,
        "function": "Flexión/control del tronco",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "deep_core",
        "level": "E",
        "direct": false,
        "function": "Estabilización lumbo-pélvica",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Media-Alta",
    "stability": "Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Media",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 10,
      "max": 30,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "10-30"
    },
    "restSpec": {
      "min": 45,
      "max": 90,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "45-90 s"
    },
    "setupCost": "Mínimo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Flexión tronco",
    "motorNotes": "MOTOR propio sin equipamiento. Lastre y posiciones de brazos = progresiones/configuraciones."
  },
  {
    "id": "core_hanging_leg_raise",
    "name": "Elevación de piernas/rodillas colgado",
    "block": "Core",
    "family": "Control pélvico/elevación",
    "movementPattern": "Elevación + retroversión pélvica",
    "compatibleRoles": [
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Barra dominadas",
    "equipmentOptions": [
      [
        "dominadas"
      ]
    ],
    "loadSource": "Corporal",
    "laterality": "Bilateral",
    "primaryMuscle": "Recto abdominal",
    "secondaryNotes": "Flexores de cadera; oblicuos; agarre y estabilización escapular",
    "muscles": [
      {
        "code": "rectus_abdominis",
        "level": "P",
        "direct": true,
        "function": "Retroversión pélvica / control pélvico",
        "bias": "La calidad depende de que exista retroversión, no solo flexión de cadera",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "hip_flexors",
        "level": "P",
        "direct": true,
        "function": "Flexión de cadera",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "obliques",
        "level": "S",
        "direct": false,
        "function": "Control pélvico/tronco",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "deep_core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "latissimus",
        "level": "E",
        "direct": false,
        "function": "Estabilización escapular/humeral",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "wrist_flexors",
        "level": "E",
        "direct": false,
        "function": "Agarre",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Media-Alta",
    "scalability": "Alta",
    "stability": "Media",
    "localFatigue": "Media",
    "systemicDemand": "Baja-Media",
    "progressionSuitability": "Media-Alta",
    "nearFailureSuitability": "Media-Alta",
    "repSpec": {
      "min": 6,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Media",
    "substitutionFamily": "Control pélvico/elevación",
    "motorNotes": "MOTOR propio. Rodillas flexionadas y piernas extendidas = progresiones/configuraciones; exige agarre y control escapular."
  },
  {
    "id": "core_captains_chair_raise",
    "name": "Elevación de rodillas/piernas en silla romana",
    "block": "Core",
    "family": "Control pélvico/elevación",
    "movementPattern": "Elevación + retroversión pélvica",
    "compatibleRoles": [
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Silla romana / Captain's Chair",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Corporal",
    "laterality": "Bilateral",
    "primaryMuscle": "Recto abdominal",
    "secondaryNotes": "Flexores de cadera; oblicuos",
    "muscles": [
      {
        "code": "rectus_abdominis",
        "level": "P",
        "direct": true,
        "function": "Retroversión pélvica / control pélvico",
        "bias": "La calidad depende de que exista retroversión, no solo flexión de cadera",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "hip_flexors",
        "level": "P",
        "direct": true,
        "function": "Flexión de cadera",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "obliques",
        "level": "S",
        "direct": false,
        "function": "Control pélvico/tronco",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "deep_core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Media-Alta",
    "strengthRequirement": "Media",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Media",
    "systemicDemand": "Baja",
    "progressionSuitability": "Media-Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 6,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-20"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Media-Alta",
    "substitutionFamily": "Control pélvico/elevación",
    "motorNotes": "MOTOR propio. El apoyo reduce la limitación de agarre respecto a la versión colgado."
  },
  {
    "id": "core_plank",
    "name": "Plancha frontal",
    "block": "Core",
    "family": "Anti-extensión",
    "movementPattern": "Estabilidad anti-extensión",
    "compatibleRoles": [
      "Estabilidad",
      "Control"
    ],
    "optIn": false,
    "equipment": "Peso corporal",
    "equipmentOptions": [
      []
    ],
    "loadSource": "Corporal/Externa opcional",
    "laterality": "Bilateral",
    "primaryMuscle": "Core anterior",
    "secondaryNotes": "Glúteos; serrato y estabilizadores escapulares",
    "muscles": [
      {
        "code": "rectus_abdominis",
        "level": "P",
        "direct": true,
        "function": "Anti-extensión",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "obliques",
        "level": "S",
        "direct": true,
        "function": "Anti-extensión/control",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "deep_core",
        "level": "P",
        "direct": true,
        "function": "Estabilización lumbo-pélvica",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "serratus",
        "level": "S",
        "direct": false,
        "function": "Estabilización/protracción escapular",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Media",
    "nearFailureSuitability": "Media-Alta",
    "repSpec": {
      "min": 20,
      "max": 60,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "20-60 s/variante"
    },
    "restSpec": {
      "min": 45,
      "max": 90,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "45-90 s"
    },
    "setupCost": "Mínimo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Anti-extensión",
    "motorNotes": "MOTOR propio. Antebrazos referencia; plancha alta, lastrada y RKC = configuraciones/progresiones. Progresar dificultad, no solo tiempo."
  },
  {
    "id": "core_side_plank",
    "name": "Plancha lateral",
    "block": "Core",
    "family": "Anti-flexión lateral",
    "movementPattern": "Estabilidad anti-flexión lateral",
    "compatibleRoles": [
      "Estabilidad",
      "Control"
    ],
    "optIn": false,
    "equipment": "Peso corporal",
    "equipmentOptions": [
      []
    ],
    "loadSource": "Corporal/Externa opcional",
    "laterality": "Unilateral",
    "primaryMuscle": "Oblicuos / cuadrado lumbar",
    "secondaryNotes": "Glúteo medio; musculatura profunda; estabilizadores de hombro",
    "muscles": [
      {
        "code": "obliques",
        "level": "P",
        "direct": true,
        "function": "Anti-flexión lateral",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "quadratus_lumborum",
        "level": "P",
        "direct": true,
        "function": "Anti-flexión lateral",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "deep_core",
        "level": "S",
        "direct": true,
        "function": "Estabilización lumbo-pélvica",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "post_delt",
        "level": "E",
        "direct": false,
        "function": "Estabilización del hombro",
        "bias": "Según apoyo",
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Media-Alta",
    "strengthRequirement": "Baja-Media",
    "scalability": "Alta",
    "stability": "Media-Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Media",
    "nearFailureSuitability": "Media-Alta",
    "repSpec": {
      "min": 15,
      "max": 60,
      "unit": "seconds",
      "perSide": true,
      "byCapacity": false,
      "openEnded": false,
      "raw": "15-60 s/lado"
    },
    "restSpec": {
      "min": 45,
      "max": 90,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "45-90 s"
    },
    "setupCost": "Mínimo",
    "executionTimeCost": "Medio",
    "densitySuitability": "Alta",
    "substitutionFamily": "Anti-flexión lateral",
    "motorNotes": "MOTOR propio. Rodillas apoyadas = regresión; carga y palanca = progresiones."
  },
  {
    "id": "core_pallof",
    "name": "Pallof Press",
    "block": "Core",
    "family": "Anti-rotación",
    "movementPattern": "Estabilidad anti-rotación",
    "compatibleRoles": [
      "Estabilidad",
      "Control"
    ],
    "optIn": false,
    "equipment": "Polea/Banda",
    "equipmentOptions": [
      [
        "polea"
      ],
      [
        "banda"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Por lados",
    "primaryMuscle": "Oblicuos / core profundo",
    "secondaryNotes": "Recto abdominal; estabilizadores lumbo-pélvicos y cadera",
    "muscles": [
      {
        "code": "obliques",
        "level": "P",
        "direct": true,
        "function": "Anti-rotación",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "deep_core",
        "level": "P",
        "direct": true,
        "function": "Anti-rotación / estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "rectus_abdominis",
        "level": "S",
        "direct": false,
        "function": "Control del tronco",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Media-Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Media",
    "nearFailureSuitability": "No prioritario",
    "repSpec": {
      "min": 8,
      "max": 15,
      "unit": "reps",
      "perSide": true,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-15/lado"
    },
    "restSpec": {
      "min": 45,
      "max": 90,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "45-90 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Medio",
    "densitySuitability": "Alta",
    "substitutionFamily": "Anti-rotación",
    "motorNotes": "MOTOR propio. De pie referencia; tall/half-kneeling y banda = configuraciones. No inventar anclajes."
  },
  {
    "id": "core_cable_woodchop",
    "name": "Cable Wood Chop / Woodchopper",
    "block": "Core",
    "family": "Rotación/diagonal activa",
    "movementPattern": "Rotación/diagonal",
    "compatibleRoles": [
      "Complementario",
      "Control"
    ],
    "optIn": false,
    "equipment": "Polea/Banda",
    "equipmentOptions": [
      [
        "polea"
      ],
      [
        "banda"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Por lados",
    "primaryMuscle": "Oblicuos",
    "secondaryNotes": "Recto abdominal; core profundo; cadera/glúteos y cintura escapular colaboran",
    "muscles": [
      {
        "code": "obliques",
        "level": "P",
        "direct": true,
        "function": "Rotación/diagonal activa",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "rectus_abdominis",
        "level": "S",
        "direct": false,
        "function": "Control/flexión del tronco",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "deep_core",
        "level": "S",
        "direct": false,
        "function": "Control lumbo-pélvico",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Baja-Media",
    "scalability": "Alta",
    "stability": "Media-Alta",
    "localFatigue": "Baja-Media",
    "systemicDemand": "Baja-Media",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 8,
      "max": 20,
      "unit": "reps",
      "perSide": true,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-20/lado"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Medio",
    "densitySuitability": "Media-Alta",
    "substitutionFamily": "Rotación/diagonal activa",
    "motorNotes": "MOTOR propio. High-to-low, low-to-high y horizontal = configuraciones; no confundir con anti-rotación Pallof."
  },
  {
    "id": "core_ab_wheel",
    "name": "Ab Wheel Rollout",
    "block": "Core",
    "family": "Anti-extensión dinámica",
    "movementPattern": "Rollout / anti-extensión",
    "compatibleRoles": [
      "Complementario",
      "Control"
    ],
    "optIn": false,
    "equipment": "Ab wheel",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Corporal",
    "laterality": "Bilateral",
    "primaryMuscle": "Recto abdominal",
    "secondaryNotes": "Oblicuos; dorsal ancho; serrato; estabilizadores de hombro/cadera",
    "muscles": [
      {
        "code": "rectus_abdominis",
        "level": "P",
        "direct": true,
        "function": "Anti-extensión dinámica",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "deep_core",
        "level": "P",
        "direct": true,
        "function": "Anti-extensión / estabilización",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "obliques",
        "level": "S",
        "direct": true,
        "function": "Anti-extensión/control",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "latissimus",
        "level": "S",
        "direct": false,
        "function": "Extensión/control de hombro",
        "bias": "Especialmente durante retorno/control",
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "serratus",
        "level": "S",
        "direct": false,
        "function": "Control escapular",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Media-Alta",
    "scalability": "Alta",
    "stability": "Media",
    "localFatigue": "Media",
    "systemicDemand": "Media",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Media-Alta",
    "repSpec": {
      "min": 6,
      "max": 15,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "6-15"
    },
    "restSpec": {
      "min": 60,
      "max": 120,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-120 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Media",
    "substitutionFamily": "Anti-extensión dinámica",
    "motorNotes": "MOTOR propio. De rodillas con ROM reducido/completo y de pie = progresiones. Barbell rollout fuera de V2."
  },
  {
    "id": "core_reverse_crunch",
    "name": "Reverse Crunch / Crunch inverso",
    "block": "Core",
    "family": "Control pélvico",
    "movementPattern": "Retroversión pélvica",
    "compatibleRoles": [
      "Complementario"
    ],
    "optIn": false,
    "equipment": "Peso corporal",
    "equipmentOptions": [
      []
    ],
    "loadSource": "Corporal",
    "laterality": "Bilateral",
    "primaryMuscle": "Recto abdominal",
    "secondaryNotes": "Oblicuos; flexores de cadera según ejecución",
    "muscles": [
      {
        "code": "rectus_abdominis",
        "level": "P",
        "direct": true,
        "function": "Retroversión pélvica",
        "bias": null,
        "confidence": "Alta",
        "notes": null
      },
      {
        "code": "obliques",
        "level": "S",
        "direct": false,
        "function": "Control pélvico",
        "bias": null,
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "hip_flexors",
        "level": "C",
        "direct": false,
        "function": "Flexión de cadera",
        "bias": "Reducir protagonismo relativo buscando retroversión pélvica",
        "confidence": "Media",
        "notes": null
      },
      {
        "code": "deep_core",
        "level": "E",
        "direct": false,
        "function": "Estabilización",
        "bias": null,
        "confidence": "Media",
        "notes": null
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Media",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 8,
      "max": 25,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-25"
    },
    "restSpec": {
      "min": 45,
      "max": 90,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "45-90 s"
    },
    "setupCost": "Mínimo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Control pélvico/elevación",
    "motorNotes": "MOTOR propio. Buscar retroversión pélvica, no solo acercar rodillas. Alta afinidad con elevaciones, pero mayor accesibilidad y apoyo."
  },
  {
    "id": "neck_flexion",
    "name": "Flexión cervical / Neck Curl",
    "block": "Cuello",
    "family": "Flexión cervical",
    "movementPattern": "Flexión cervical resistida",
    "compatibleRoles": [
      "Complementario"
    ],
    "optIn": true,
    "equipment": "Disco / banda / resistencia manual / arnés-polea opcional",
    "equipmentOptions": [
      []
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Flexores cervicales",
    "secondaryNotes": "Esternocleidomastoideo; flexores cervicales profundos",
    "muscles": [
      {
        "code": "neck_flexors",
        "level": "P",
        "direct": true,
        "function": "Flexión cervical",
        "bias": null,
        "confidence": "Alta",
        "notes": "OPT-IN: solo elegible tras petición expresa del usuario; carga conservadora y ROM cómodo."
      },
      {
        "code": "deep_neck_stabilizers",
        "level": "S",
        "direct": true,
        "function": "Control cervical",
        "bias": null,
        "confidence": "Media",
        "notes": "No usar como justificación para aumentar volumen automáticamente."
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Baja",
    "scalability": "Media-Alta",
    "stability": "Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Media",
    "nearFailureSuitability": "Media",
    "repSpec": {
      "min": 10,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "10-20"
    },
    "restSpec": {
      "min": 60,
      "max": 90,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-90 s"
    },
    "setupCost": "Bajo-Medio",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Flexión cervical",
    "motorNotes": "MOTOR opt-in. Bloqueado por defecto: solo elegible si el usuario pide expresamente entrenar cuello. Carga conservadora, movimiento lento, ROM cómodo y sin rebotes."
  },
  {
    "id": "neck_extension",
    "name": "Extensión cervical / Neck Extension",
    "block": "Cuello",
    "family": "Extensión cervical",
    "movementPattern": "Extensión cervical resistida",
    "compatibleRoles": [
      "Complementario"
    ],
    "optIn": true,
    "equipment": "Disco / banda / resistencia manual / arnés-polea opcional",
    "equipmentOptions": [
      []
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Extensores cervicales",
    "secondaryNotes": "Esplenios; semiespinosos; multífidos cervicales",
    "muscles": [
      {
        "code": "neck_extensors",
        "level": "P",
        "direct": true,
        "function": "Extensión cervical",
        "bias": null,
        "confidence": "Alta",
        "notes": "OPT-IN: solo elegible tras petición expresa del usuario; carga conservadora y ROM cómodo."
      },
      {
        "code": "upper_trap",
        "level": "C",
        "direct": false,
        "function": "Estabilización/extensión cervical",
        "bias": null,
        "confidence": "Media",
        "notes": "Participación accesoria; no sustituye trabajo de trapecio."
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Baja",
    "scalability": "Media-Alta",
    "stability": "Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Media",
    "nearFailureSuitability": "Media",
    "repSpec": {
      "min": 10,
      "max": 20,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "10-20"
    },
    "restSpec": {
      "min": 60,
      "max": 90,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-90 s"
    },
    "setupCost": "Bajo-Medio",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Extensión cervical",
    "motorNotes": "MOTOR opt-in. Bloqueado por defecto: solo elegible si el usuario pide expresamente entrenar cuello. Evitar hiperextensión cargada; carga conservadora y controlada."
  },
  {
    "id": "neck_lateral_flexion",
    "name": "Flexión lateral cervical",
    "block": "Cuello",
    "family": "Flexión lateral cervical",
    "movementPattern": "Flexión lateral cervical resistida",
    "compatibleRoles": [
      "Complementario"
    ],
    "optIn": true,
    "equipment": "Disco / banda / resistencia manual / máquina opcional",
    "equipmentOptions": [
      []
    ],
    "loadSource": "Externa",
    "laterality": "Por lados",
    "primaryMuscle": "Flexores laterales cervicales",
    "secondaryNotes": "Esternocleidomastoideo; escalenos; esplenios",
    "muscles": [
      {
        "code": "neck_lateral_flexors",
        "level": "P",
        "direct": true,
        "function": "Flexión lateral cervical",
        "bias": "Lado izquierdo/derecho = configuración",
        "confidence": "Alta",
        "notes": "OPT-IN: programar ambos lados según contexto; no rotación resistida."
      },
      {
        "code": "upper_trap",
        "level": "C",
        "direct": false,
        "function": "Estabilización/flexión lateral",
        "bias": null,
        "confidence": "Media",
        "notes": "Participación accesoria; no sustituye shrug."
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Baja",
    "scalability": "Media-Alta",
    "stability": "Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Media",
    "nearFailureSuitability": "Media",
    "repSpec": {
      "min": 10,
      "max": 20,
      "unit": "reps",
      "perSide": true,
      "byCapacity": false,
      "openEnded": false,
      "raw": "10-20/lado"
    },
    "restSpec": {
      "min": 60,
      "max": 90,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "60-90 s"
    },
    "setupCost": "Bajo-Medio",
    "executionTimeCost": "Medio",
    "densitySuitability": "Alta",
    "substitutionFamily": "Flexión lateral cervical",
    "motorNotes": "MOTOR opt-in. Un solo ejercicio para ambos lados. Solo elegible por petición expresa de entrenar cuello; ROM cómodo, carga conservadora y sin rebotes."
  }
];

export const VARIANTS: LibraryVariant[] = [
  {
    "baseId": "back_lat_pulldown",
    "name": "Prono amplio / neutro-estrecho / supino",
    "type": "Agarre/configuración",
    "changes": "Cambia comodidad, ROM, trayectoria y solapamiento con flexores del codo; mism...",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "back_onearm_pulldown",
    "name": "Altura/posición y trayectoria hacia cadera",
    "type": "Posición/trayectoria",
    "changes": "Ajusta línea de fuerza y sesgo relativo manteniendo tirón vertical unilateral",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "back_pullup",
    "name": "Pronada / neutra / supina (chin-up)",
    "type": "Agarre/configuración",
    "changes": "Cambia comodidad y participación relativa de flexores del codo; misma ficha M...",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "back_pullup",
    "name": "Dominada lastrada",
    "type": "Método de carga/progresión",
    "changes": "Mismo patrón base con carga externa adicional",
    "rule": "LIB-LOAD-001"
  },
  {
    "baseId": "back_assisted_pullup",
    "name": "Máquina / banda elástica",
    "type": "Método de asistencia",
    "changes": "Cambia implementación de la regresión, no su función Motor",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "back_cable_row",
    "name": "Neutro-estrecho / prono-ancho / cuerda",
    "type": "Agarre/accesorio",
    "changes": "Cambia trayectoria y sesgo relativo dorsal ↔ espalda media/alta sin crear otr...",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "back_onearm_cable_row",
    "name": "De pie / sentado / con apoyo; polea media-baja / alta-diagonal",
    "type": "Posición/configuración",
    "changes": "Modifica estabilidad, setup y línea de fuerza manteniendo el remo unilateral ...",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "back_onearm_cable_row",
    "name": "Trayectoria hacia cadera / torso",
    "type": "Trayectoria/sesgo",
    "changes": "Modifica sesgo relativo dorsal ↔ espalda media/alta",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "back_onearm_db_row",
    "name": "Apoyo completo / parcial / sin apoyo",
    "type": "Posición/configuración",
    "changes": "Modifica demanda de estabilización sin cambiar la función principal",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "back_onearm_db_row",
    "name": "Codo próximo / más abierto",
    "type": "Trayectoria/sesgo",
    "changes": "Modifica sesgo relativo dorsal ↔ espalda media/alta",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "back_barbell_row",
    "name": "Prono / supino",
    "type": "Agarre/configuración",
    "changes": "Cambia participación relativa de flexores del codo; misma función Motor",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "back_smith_row",
    "name": "Prono / supino",
    "type": "Agarre/configuración",
    "changes": "Cambia agarre y solapamiento con flexores; misma ficha Motor",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "back_tbar_row",
    "name": "Neutro estrecho / más ancho; trayectoria de codos",
    "type": "Agarre/trayectoria",
    "changes": "Modifica sesgo relativo sin cambiar la función Motor",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "back_supported_row",
    "name": "Bilateral / unilateral / alterno",
    "type": "Ejecución/configuración",
    "changes": "La unilateralidad cambia coste temporal y control por lado; la máquina base s...",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "back_supported_row",
    "name": "Selectorized / plate-loaded / iso-lateral / convergente-divergente",
    "type": "Implementación/atributos máquina",
    "changes": "Cambia setup, resistencia y trayectoria según máquina sin crear fichas por ma...",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "back_high_row_machine",
    "name": "Bilateral / unilateral según máquina",
    "type": "Ejecución/configuración",
    "changes": "Permite trabajo por lado manteniendo la trayectoria diagonal propia del High Row",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "back_inverted_row",
    "name": "Barra/Smith / TRX / anillas",
    "type": "Implementación/equipamiento",
    "changes": "Mismo tirón horizontal corporal con distinta libertad/estabilidad",
    "rule": "LIB-EQUIPVAR-003"
  },
  {
    "baseId": "back_inverted_row",
    "name": "Altura/inclinación / pies elevados / lastre",
    "type": "Progresión/configuración",
    "changes": "Escala dificultad sin crear fichas Motor adicionales",
    "rule": "LIB-LOAD-001"
  },
  {
    "baseId": "back_cable_pullover",
    "name": "Cuerda / barra / agarre cómodo",
    "type": "Accesorio/configuración",
    "changes": "Cambia agarre y recorrido práctico manteniendo extensión de hombro",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "back_face_pull",
    "name": "Altura de polea y agarre con cuerda ajustados",
    "type": "Posición/configuración",
    "changes": "Ajusta comodidad y trayectoria manteniendo su función complementaria escapula...",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "core_floor_crunch",
    "name": "Crunch con brazos estirados / manos al pecho / junto a cabeza",
    "type": "Palanca/configuración",
    "changes": "Modifica brazo de momento y dificultad manteniendo la función",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "chest_machine_press",
    "name": "Selectorized / plate-loaded / convergente / iso-lateral",
    "type": "Implementación/atributos máquina",
    "changes": "Cambia implementación, estabilidad/trayectoria y setup; puede combinar más de...",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "chest_cable_press",
    "name": "Tumbado / sentado / de pie",
    "type": "Posición/configuración",
    "changes": "Cambia apoyo, estabilidad y setup manteniendo el patrón de press horizontal c...",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "chest_incline_barbell",
    "name": "Banco aprox. 20–35°; referencia ≈30°",
    "type": "Ángulo/configuración",
    "changes": "Modifica énfasis regional; inclinaciones altas aumentan participación del del...",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "chest_incline_db",
    "name": "Banco aprox. 20–35°; referencia ≈30°",
    "type": "Ángulo/configuración",
    "changes": "Modifica énfasis regional; no crear fichas por cada ángulo",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "chest_incline_smith",
    "name": "Banco aprox. 20–35°; referencia ≈30°",
    "type": "Ángulo/configuración",
    "changes": "Modifica énfasis regional; no crear fichas por cada ángulo",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "chest_incline_machine",
    "name": "Convergente / iso-lateral / plate-loaded / selectorized",
    "type": "Implementación/atributos máquina",
    "changes": "La máquina concreta puede combinar atributos sin requerir ficha Motor propia",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "chest_incline_cable",
    "name": "Banco aprox. 20–35°; referencia ≈30°",
    "type": "Ángulo/configuración",
    "changes": "Modifica énfasis regional; resistencia por cable",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "chest_cable_fly",
    "name": "Horizontal / low-to-high / high-to-low",
    "type": "Trayectoria/sesgo",
    "changes": "Cambia dirección de fuerza y posible sesgo regional; Motor debe conocerlo sin...",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "chest_cable_fly",
    "name": "De pie / sentado / tumbado",
    "type": "Posición/configuración",
    "changes": "Cambia apoyo, estabilidad y setup sin cambiar la función principal",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "chest_db_fly",
    "name": "Banco plano / inclinado",
    "type": "Ángulo/configuración",
    "changes": "Cambia orientación y posible sesgo regional sin justificar ficha Motor adicional",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "biceps_bar_curl",
    "name": "Barra recta / barra EZ",
    "type": "Implemento/configuración",
    "changes": "Cambia comodidad y agarre sin cambiar la función Motor",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "biceps_bar_curl",
    "name": "Drag Curl",
    "type": "Ejecución/posición hombro",
    "changes": "Desplazamiento posterior del codo durante la repetición; variante técnica del curl con barra",
    "rule": "LIB-VARIANT-001 / MOTOR-TECHBIAS-028"
  },
  {
    "baseId": "biceps_db_curl",
    "name": "Bilateral / alterno / unilateral",
    "type": "Ejecución",
    "changes": "Cambia lateralidad y coste temporal sin cambiar la función Motor",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "biceps_hammer",
    "name": "Bilateral / alterno / unilateral / sentado / cross-body",
    "type": "Ejecución/configuración",
    "changes": "Mantiene agarre neutro; cambia lateralidad, apoyo o trayectoria práctica",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "biceps_hammer_cable",
    "name": "Bilateral / unilateral",
    "type": "Ejecución/configuración",
    "changes": "Mantiene agarre neutro y resistencia por cable",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "biceps_cable",
    "name": "Barra recta / barra EZ / agarres individuales",
    "type": "Accesorio/configuración",
    "changes": "Cambia agarre y comodidad manteniendo curl convencional; cuerda neutra se clasifica como martillo polea",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "biceps_cable",
    "name": "De pie / sentado / tumbado",
    "type": "Posición/configuración",
    "changes": "Cambia apoyo y estabilidad sin justificar otra ficha Motor en V2",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "biceps_cable",
    "name": "High cable / crucifix curl",
    "type": "Posición/configuración avanzada",
    "changes": "Hombro elevado/abducido y vector distinto; no aporta suficiente decisión nueva para ficha propia",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "biceps_preacher",
    "name": "Barra recta / EZ / unilateral con mancuerna",
    "type": "Implemento/ejecución",
    "changes": "Cambia agarre o unilateralidad manteniendo brazo apoyado y resistencia por gravedad",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "biceps_preacher",
    "name": "Predicador con cable",
    "type": "Implementación/configuración",
    "changes": "Se conserva dentro del patrón predicador en V2; no crear ficha Motor adicional",
    "rule": "LIB-EQUIPVAR-003"
  },
  {
    "baseId": "biceps_preacher_machine",
    "name": "Selectorized / plate-loaded / bilateral / unilateral",
    "type": "Implementación/atributos máquina",
    "changes": "Diseño concreto cambia resistencia/setup sin crear ficha por cada máquina",
    "rule": "LIB-EQUIPVAR-003"
  },
  {
    "baseId": "biceps_spider_curl",
    "name": "Barra recta / EZ / mancuernas / cable",
    "type": "Implemento/configuración",
    "changes": "Mantiene torso apoyado y brazo adelantado; no crear ficha por implemento",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "biceps_incline_db_curl",
    "name": "Bilateral / alterno",
    "type": "Ejecución",
    "changes": "Mantiene brazo retrasado por el banco; cambia coste temporal",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "biceps_concentration",
    "name": "Agarre/ángulo cómodo",
    "type": "Configuración",
    "changes": "Ajustes menores sin cambiar unilateralidad y apoyo característicos",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "biceps_machine_curl",
    "name": "Selectorized / plate-loaded / iso-lateral / bilateral / unilateral",
    "type": "Implementación/atributos máquina",
    "changes": "La máquina concreta puede cambiar trayectoria y perfil; no crear fichas por diseño comercial",
    "rule": "LIB-EQUIPVAR-003"
  },
  {
    "baseId": "triceps_pushdown",
    "name": "Accesorio",
    "type": "Cuerda",
    "changes": "Configuración",
    "rule": ""
  },
  {
    "baseId": "triceps_pushdown",
    "name": "Accesorio",
    "type": "Barra",
    "changes": "Configuración",
    "rule": ""
  },
  {
    "baseId": "triceps_pushdown",
    "name": "Lateralidad",
    "type": "Agarre individual",
    "changes": "Configuración",
    "rule": ""
  },
  {
    "baseId": "triceps_pushdown",
    "name": "Trayectoria",
    "type": "Polea unilateral cruzada",
    "changes": "Configuración",
    "rule": ""
  },
  {
    "baseId": "triceps_overhead_cable",
    "name": "Accesorio",
    "type": "Polea",
    "changes": "Configuración",
    "rule": ""
  },
  {
    "baseId": "triceps_overhead_cable",
    "name": "Lateralidad",
    "type": "Polea",
    "changes": "Configuración",
    "rule": ""
  },
  {
    "baseId": "triceps_overhead_db",
    "name": "Implementación",
    "type": "Mancuerna",
    "changes": "Configuración",
    "rule": ""
  },
  {
    "baseId": "triceps_overhead_db",
    "name": "Lateralidad",
    "type": "Mancuerna",
    "changes": "Configuración",
    "rule": ""
  },
  {
    "baseId": "triceps_french_press",
    "name": "Implementación",
    "type": "Barra+banco",
    "changes": "Configuración",
    "rule": ""
  },
  {
    "baseId": "triceps_french_press",
    "name": "Implementación",
    "type": "Mancuernas+banco",
    "changes": "Configuración",
    "rule": ""
  },
  {
    "baseId": "triceps_french_press",
    "name": "Implementación",
    "type": "Polea+banco",
    "changes": "Configuración",
    "rule": ""
  },
  {
    "baseId": "triceps_french_press",
    "name": "Implementación",
    "type": "Smith+banco",
    "changes": "Configuración",
    "rule": ""
  },
  {
    "baseId": "triceps_french_press",
    "name": "Trayectoria",
    "type": "Según implementación",
    "changes": "Configuración",
    "rule": ""
  },
  {
    "baseId": "triceps_closegrip_press",
    "name": "Implementación",
    "type": "Según opción",
    "changes": "Configuración",
    "rule": ""
  },
  {
    "baseId": "triceps_dip",
    "name": "Carga",
    "type": "Paralelas",
    "changes": "Progresión",
    "rule": ""
  },
  {
    "baseId": "triceps_dip_assisted",
    "name": "Asistencia",
    "type": "Asistencia",
    "changes": "Configuración",
    "rule": ""
  },
  {
    "baseId": "triceps_bench_dip",
    "name": "Dificultad",
    "type": "Banco",
    "changes": "Progresión",
    "rule": ""
  },
  {
    "baseId": "triceps_kickback_db",
    "name": "Lateralidad",
    "type": "Mancuerna",
    "changes": "Configuración",
    "rule": ""
  },
  {
    "baseId": "triceps_kickback_cable",
    "name": "Accesorio",
    "type": "Polea",
    "changes": "Configuración",
    "rule": ""
  },
  {
    "baseId": "triceps_extension_machine",
    "name": "Diseño máquina",
    "type": "Máquina",
    "changes": "Configuración",
    "rule": ""
  },
  {
    "baseId": "triceps_dip_machine",
    "name": "Diseño máquina",
    "type": "Máquina",
    "changes": "Configuración",
    "rule": ""
  },
  {
    "baseId": "shoulder_barbell_press",
    "name": "De pie / sentado",
    "type": "Posición",
    "changes": "Cambia estabilidad y demanda de tronco; misma función de press vertical",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "shoulder_db_press",
    "name": "Sentado / de pie; agarre pronado / neutro / intermedio",
    "type": "Posición/agarre",
    "changes": "Ajusta estabilidad, comodidad y trayectoria manteniendo el press vertical",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "shoulder_db_press",
    "name": "Arnold Press",
    "type": "Variante avanzada seleccionable",
    "changes": "Añade rotación y recorrido particular; disponible sin crear otro MOTOR",
    "rule": "MOTOR-SHOULDER-ADV-063"
  },
  {
    "baseId": "shoulder_smith_press",
    "name": "Sentado con respaldo",
    "type": "Ejecución de referencia",
    "changes": "Mayor estabilidad y reproducibilidad; referencia Fit-K para este MOTOR",
    "rule": "MOTOR-SHOULDER-SMITH-061"
  },
  {
    "baseId": "shoulder_smith_press",
    "name": "De pie",
    "type": "Posición secundaria",
    "changes": "Mayor demanda de estabilización; misma trayectoria guiada base",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "shoulder_machine_press",
    "name": "Convergente / iso-lateral / plate-loaded / selectorized; agarre neutro/pronado",
    "type": "Implementación/atributos máquina",
    "changes": "Cambia trayectoria, carga y setup según diseño sin crear ficha por fabricante",
    "rule": "LIB-EQUIPVAR-003"
  },
  {
    "baseId": "shoulder_db_lateral",
    "name": "De pie / sentado / unilateral / apoyada",
    "type": "Posición/configuración",
    "changes": "Cambia estabilidad y coste temporal sin cambiar la función principal",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "shoulder_db_lateral",
    "name": "Tumbada / banco inclinado",
    "type": "Variante media-avanzada",
    "changes": "Modifica perfil de resistencia por orientación corporal; gana elegibilidad con experiencia",
    "rule": "MOTOR-SHOULDER-ADV-063"
  },
  {
    "baseId": "shoulder_cable_lateral",
    "name": "Convencional / cable detrás del cuerpo / lean-away",
    "type": "Posición/configuración",
    "changes": "Modifica línea y perfil de resistencia manteniendo la función",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "shoulder_cable_lateral",
    "name": "Unilateral / bilateral; agarre / cuff",
    "type": "Ejecución/accesorio",
    "changes": "Cambia coste temporal y punto de aplicación sin crear otro MOTOR",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "shoulder_machine_lateral",
    "name": "Pads de codo/brazo / asas; selectorized / plate-loaded / iso-lateral",
    "type": "Implementación/atributos máquina",
    "changes": "Cambia contacto, resistencia y trayectoria según máquina",
    "rule": "LIB-EQUIPVAR-003"
  },
  {
    "baseId": "shoulder_reverse_pecdeck",
    "name": "Mayor/menor retracción escapular según objetivo técnico",
    "type": "Técnica/sesgo",
    "changes": "Modifica contribución relativa de espalda alta y deltoide posterior",
    "rule": "MOTOR-TECHBIAS-028"
  },
  {
    "baseId": "shoulder_rear_delt_db",
    "name": "Torso inclinado / sentado inclinado / pecho apoyado",
    "type": "Posición/configuración",
    "changes": "Modifica estabilidad y demanda de tronco; misma abducción horizontal",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "shoulder_reverse_fly_cable",
    "name": "Bilateral cruzado / unilateral; agarre / cuff; con/sin apoyo",
    "type": "Ejecución/configuración",
    "changes": "Modifica setup, estabilidad y coste temporal sin cambiar la función",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "shoulder_rear_delt_row",
    "name": "Mancuernas / polea / máquina; con o sin apoyo",
    "type": "Implementación/configuración",
    "changes": "Mantiene remo con codos abiertos orientado a deltoide posterior/espalda alta",
    "rule": "LIB-EQUIPVAR-003"
  },
  {
    "baseId": "shoulder_front_raise",
    "name": "Mancuernas / polea / barra-EZ / disco",
    "type": "Implementación/equipamiento",
    "changes": "Cambia resistencia y setup sin justificar fragmentar MOTOR",
    "rule": "LIB-EQUIPVAR-003"
  },
  {
    "baseId": "shoulder_front_raise",
    "name": "Bilateral / alterna / unilateral",
    "type": "Ejecución",
    "changes": "Cambia coste temporal y control por lado; misma función",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "shoulder_external_rotation",
    "name": "Polea / banda; brazo junto al torso / elevado ~90°",
    "type": "Implementación/posición",
    "changes": "Cambia posición glenohumeral y resistencia manteniendo función",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "shoulder_external_rotation",
    "name": "Tumbado lateral con mancuerna",
    "type": "Implementación/posición",
    "changes": "Alternativa con gravedad para la misma función principal",
    "rule": "LIB-EQUIPVAR-003"
  },
  {
    "baseId": "shoulder_upright_row",
    "name": "Barra recta / EZ / polea; agarre y ROM cómodos",
    "type": "Implementación/técnica",
    "changes": "Cambia libertad de trayectoria y comodidad; no imponer altura universal",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "shoulder_landmine_press",
    "name": "De pie / half-kneeling; unilateral / bilateral",
    "type": "Posición/lateralidad",
    "changes": "Cambia estabilidad y demanda del tronco manteniendo press diagonal",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "shoulder_y_raise",
    "name": "Polea / mancuernas en banco inclinado",
    "type": "Implementación",
    "changes": "Misma función de elevación/control escapular con distinto perfil y setup",
    "rule": "MOTOR-SHOULDER-ADV-063"
  },
  {
    "baseId": "shoulder_lu_raise",
    "name": "Mancuernas / discos; carga y ROM compatibles con control",
    "type": "Implementación/progresión",
    "changes": "Mantiene elevación de gran recorrido; elegibilidad depende de experiencia y tolerancia",
    "rule": "MOTOR-SHOULDER-ADV-063"
  },
  {
    "baseId": "shoulder_db_lateral",
    "name": "Lu-style/full ROM NO se fusiona aquí",
    "type": "Límite de variante",
    "changes": "Lu Raise queda como MOTOR propio por selección específica de gran recorrido",
    "rule": "MOTOR-SHOULDER-ADV-063"
  },
  {
    "baseId": "trap_db_shrug",
    "name": "Bilateral / unilateral",
    "type": "Lateralidad/configuración",
    "changes": "Cambia coste temporal y trabajo por lado sin cambiar elevación escapular",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "trap_db_shrug",
    "name": "Straps",
    "type": "Accesorio",
    "changes": "Reduce la probabilidad de que el agarre limite la serie; no cambia el ejercicio MOTOR",
    "rule": "LIB-TRAP-CONFIG-068"
  },
  {
    "baseId": "trap_machine_shrug",
    "name": "Selectorized / plate-loaded / iso-lateral; sentado / de pie; distintas asas",
    "type": "Implementación/atributos máquina",
    "changes": "Cambia setup, apoyo y resistencia según diseño sin crear ficha por fabricante",
    "rule": "LIB-EQUIPVAR-003"
  },
  {
    "baseId": "trap_kelso_shrug",
    "name": "Mancuernas / barra / polea / máquina compatible",
    "type": "Implementación/configuración",
    "changes": "Mantiene la retracción escapular como función principal con mínima flexión de codo",
    "rule": "LIB-TRAP-CONFIG-068"
  },
  {
    "baseId": "forearm_reverse_curl",
    "name": "Barra EZ / barra recta / mancuernas / polea",
    "type": "Implementación/configuración",
    "changes": "Misma flexión de codo pronada con diferencias de comodidad, perfil y setup",
    "rule": "LIB-FOREARM-CONFIG-072"
  },
  {
    "baseId": "forearm_wrist_curl",
    "name": "Barra / mancuernas / polea; bilateral / unilateral",
    "type": "Implementación/configuración",
    "changes": "Mantiene flexión de muñeca; cambia implemento y coste temporal",
    "rule": "LIB-FOREARM-CONFIG-072"
  },
  {
    "baseId": "forearm_wrist_extension",
    "name": "Barra / mancuernas / polea; bilateral / unilateral",
    "type": "Implementación/configuración",
    "changes": "Mantiene extensión de muñeca; cambia implemento y coste temporal",
    "rule": "LIB-FOREARM-CONFIG-072"
  },
  {
    "baseId": "forearm_pronation_supination",
    "name": "Pronación / supinación",
    "type": "Función/configuración",
    "changes": "Dos direcciones de rotación dentro de una misma ficha MOTOR",
    "rule": "MOTOR-FOREARM-ROT-071"
  },
  {
    "baseId": "forearm_pronation_supination",
    "name": "Mancuerna/palanca / polea / banda",
    "type": "Implementación/configuración",
    "changes": "Cambia resistencia y setup manteniendo rotación del antebrazo",
    "rule": "LIB-FOREARM-CONFIG-072"
  },
  {
    "baseId": "core_machine_crunch",
    "name": "Selectorized / plate-loaded / diseños de asiento y apoyo",
    "type": "Implementación/atributos máquina",
    "changes": "Cambia setup y resistencia sin cambiar la función principal de flexión de tronco",
    "rule": "LIB-EQUIPVAR-003"
  },
  {
    "baseId": "core_cable_crunch",
    "name": "Arrodillado / de pie",
    "type": "Posición/configuración",
    "changes": "Modifica estabilidad y setup manteniendo flexión de tronco",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "core_cable_crunch",
    "name": "Cuerda / barra u otro accesorio cómodo",
    "type": "Accesorio/configuración",
    "changes": "Cambia agarre y comodidad sin crear otro MOTOR",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "core_floor_crunch",
    "name": "Lastre externo",
    "type": "Progresión de carga",
    "changes": "Permite progresar sin crear otra ficha MOTOR",
    "rule": "LIB-LOAD-001"
  },
  {
    "baseId": "core_hanging_leg_raise",
    "name": "Rodillas flexionadas / piernas progresivamente extendidas",
    "type": "Progresión/configuración",
    "changes": "Escala palanca y dificultad dentro del mismo MOTOR",
    "rule": "MOTOR-CAPACITY-016"
  },
  {
    "baseId": "core_captains_chair_raise",
    "name": "Rodillas flexionadas / piernas progresivamente extendidas",
    "type": "Progresión/configuración",
    "changes": "Escala palanca y dificultad con apoyo de antebrazos",
    "rule": "MOTOR-CAPACITY-016"
  },
  {
    "baseId": "core_plank",
    "name": "Antebrazos / plancha alta",
    "type": "Posición/configuración",
    "changes": "Cambia apoyo y demanda secundaria manteniendo anti-extensión",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "core_plank",
    "name": "Lastrada",
    "type": "Progresión de carga",
    "changes": "Aumenta dificultad sin crear otro MOTOR",
    "rule": "LIB-LOAD-001"
  },
  {
    "baseId": "core_plank",
    "name": "RKC / hardstyle",
    "type": "Variante técnica avanzada",
    "changes": "Aumenta tensión global manteniendo la función anti-extensión",
    "rule": "MOTOR-ADVVAR-020"
  },
  {
    "baseId": "core_side_plank",
    "name": "Rodillas apoyadas",
    "type": "Regresión",
    "changes": "Reduce palanca y fuerza requerida",
    "rule": "MOTOR-CAPACITY-016"
  },
  {
    "baseId": "core_side_plank",
    "name": "Piernas extendidas / carga externa / mayor palanca",
    "type": "Progresión/configuración",
    "changes": "Escala dificultad sin fragmentar la ficha",
    "rule": "LIB-LOAD-001"
  },
  {
    "baseId": "core_side_plank",
    "name": "Elevación/descenso controlado de pelvis",
    "type": "Ejecución/configuración",
    "changes": "Versión dinámica dentro de la misma función lateral",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "core_pallof",
    "name": "De pie / tall-kneeling / half-kneeling",
    "type": "Posición/configuración",
    "changes": "Modifica base de apoyo manteniendo anti-rotación",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "core_pallof",
    "name": "Polea / banda",
    "type": "Implementación/equipamiento",
    "changes": "Polea facilita progresión cuantificable; banda amplía accesibilidad",
    "rule": "LIB-EQUIPVAR-003"
  },
  {
    "baseId": "core_cable_woodchop",
    "name": "High-to-low / low-to-high / horizontal",
    "type": "Dirección/configuración",
    "changes": "Modifica vector de la diagonal sin crear otro MOTOR",
    "rule": "MOTOR-TECHBIAS-028"
  },
  {
    "baseId": "core_cable_woodchop",
    "name": "De pie / tall-kneeling / half-kneeling",
    "type": "Posición/configuración",
    "changes": "Modifica participación de cadera/base de apoyo manteniendo patrón rotacional",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "core_cable_woodchop",
    "name": "Polea / banda",
    "type": "Implementación/equipamiento",
    "changes": "Misma familia funcional con distinta resistencia/setup",
    "rule": "LIB-EQUIPVAR-003"
  },
  {
    "baseId": "core_ab_wheel",
    "name": "Rodillas ROM reducido / rodillas ROM completo / de pie",
    "type": "Progresión de palanca/ROM",
    "changes": "La capacidad real determina la progresión elegible; no crear MOTOR separados",
    "rule": "MOTOR-CAPACITY-016"
  },
  {
    "baseId": "legs_barbell_squat",
    "name": "High-bar / low-bar",
    "type": "Posición barra/configuración",
    "changes": "Modifica tronco y momentos articulares; no crea otro MOTOR",
    "rule": "MOTOR-TECHBIAS-028"
  },
  {
    "baseId": "legs_smith_squat",
    "name": "Pies más cerca/lejos; talones elevados",
    "type": "Técnica/sesgo",
    "changes": "Modifica relación rodilla-cadera y contribución relativa sin aislar músculos",
    "rule": "MOTOR-TECHBIAS-028"
  },
  {
    "baseId": "legs_hack_squat",
    "name": "Pies más altos/bajos; anchura cómoda; talón elevado",
    "type": "Técnica/sesgo",
    "changes": "Modifica momentos de rodilla/cadera y sesgo relativo; sin porcentajes universales",
    "rule": "MOTOR-TECHBIAS-028"
  },
  {
    "baseId": "legs_leg_press",
    "name": "45° / horizontal / vertical",
    "type": "Implementación/equipamiento",
    "changes": "Distinto diseño de máquina manteniendo patrón de prensa",
    "rule": "LIB-EQUIPVAR-003"
  },
  {
    "baseId": "legs_leg_press",
    "name": "Altura/anchura de pies y ROM",
    "type": "Técnica/sesgo",
    "changes": "Modifica demanda relativa rodilla/cadera; no usar reglas simplistas",
    "rule": "MOTOR-TECHBIAS-028"
  },
  {
    "baseId": "legs_leg_extension",
    "name": "Bilateral / unilateral; ajustes asiento/rodillo",
    "type": "Configuración",
    "changes": "Cambia unilateralidad y posición articular sin nuevo MOTOR",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "legs_bulgarian_split_squat",
    "name": "Mancuernas / Smith / barra / peso corporal",
    "type": "Implementación",
    "changes": "Cambia estabilidad, carga y setup",
    "rule": "LIB-EQUIPVAR-003"
  },
  {
    "baseId": "legs_bulgarian_split_squat",
    "name": "Paso, inclinación de tronco, ROM y altura apoyo",
    "type": "Técnica/sesgo",
    "changes": "Modifica sesgo relativo rodilla/cadera y estabilización",
    "rule": "MOTOR-TECHBIAS-028"
  },
  {
    "baseId": "legs_forward_lunge",
    "name": "Mancuernas / barra / peso corporal; longitud de paso",
    "type": "Implementación/técnica",
    "changes": "Cambia carga y sesgo relativo manteniendo entrada hacia delante",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "legs_reverse_lunge",
    "name": "Mancuernas / barra / Smith / peso corporal; longitud de paso",
    "type": "Implementación/técnica",
    "changes": "Cambia carga y sesgo relativo manteniendo entrada hacia atrás",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "legs_walking_lunge",
    "name": "Mancuernas / barra; longitud de paso",
    "type": "Implementación/técnica",
    "changes": "Cambia carga y sesgo relativo manteniendo locomoción",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "legs_goblet_squat",
    "name": "Mancuerna / kettlebell; talones elevados",
    "type": "Implementación/configuración",
    "changes": "Cambia implemento y puede aumentar demanda de rodilla con talón elevado",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "legs_step_up",
    "name": "Altura cajón; DB/barra/Smith/peso corporal",
    "type": "Configuración/implementación",
    "changes": "Altura modifica demanda articular; carga cambia estabilidad/setup",
    "rule": "MOTOR-TECHBIAS-028"
  },
  {
    "baseId": "legs_sissy_squat",
    "name": "Asistida / no asistida / lastrada",
    "type": "Regresión/progresión",
    "changes": "Escala fuerza y control requeridos",
    "rule": "MOTOR-CAPACITY-016"
  },
  {
    "baseId": "legs_belt_squat",
    "name": "Lever / cable / loading pin",
    "type": "Implementación/equipamiento",
    "changes": "Distintos sistemas de carga pélvica, misma función MOTOR",
    "rule": "LIB-EQUIPVAR-003"
  },
  {
    "baseId": "hamstrings_seated_leg_curl",
    "name": "Bilateral / unilateral; ajustes respaldo/rodillo/ROM",
    "type": "Configuración",
    "changes": "Ajusta posición y lateralidad sin nuevo MOTOR",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "hamstrings_lying_leg_curl",
    "name": "Bilateral / unilateral; ajustes de rodillo/ROM",
    "type": "Configuración",
    "changes": "Ajusta posición y lateralidad sin nuevo MOTOR",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "hamstrings_romanian_deadlift",
    "name": "Barra / mancuernas / Smith",
    "type": "Implementación/equipamiento",
    "changes": "Cambia estabilidad, carga y agarre; misma bisagra",
    "rule": "LIB-EQUIPVAR-003"
  },
  {
    "baseId": "hamstrings_romanian_deadlift",
    "name": "Stiff-Leg Deadlift / déficit controlado",
    "type": "Variante técnica/ROM",
    "changes": "Menor flexión de rodilla o mayor ROM; no crear MOTOR separado",
    "rule": "MOTOR-TECHBIAS-028"
  },
  {
    "baseId": "hamstrings_single_leg_rdl",
    "name": "Carga ipsilateral / contralateral; DB/KB/barra",
    "type": "Configuración",
    "changes": "Modifica estabilización y distribución de carga",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "hamstrings_good_morning",
    "name": "Barra / Smith",
    "type": "Implementación",
    "changes": "Cambia estabilidad y trayectoria manteniendo bisagra",
    "rule": "LIB-EQUIPVAR-003"
  },
  {
    "baseId": "hamstrings_45deg_hip_extension",
    "name": "Peso corporal / disco / mancuerna; rodilla/ROM",
    "type": "Carga/técnica",
    "changes": "Escala carga y modifica sesgo relativo isquios-glúteo sin crear otro MOTOR",
    "rule": "MOTOR-TECHBIAS-028"
  },
  {
    "baseId": "glutes_hip_thrust",
    "name": "Barra / Smith / máquina",
    "type": "Implementación/equipamiento",
    "changes": "Cambia estabilidad, setup y progresión",
    "rule": "LIB-EQUIPVAR-003"
  },
  {
    "baseId": "glutes_hip_thrust",
    "name": "Glute Bridge",
    "type": "Variante de patrón",
    "changes": "Menor ROM por apoyo en suelo; misma familia de extensión horizontal",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "glutes_hip_thrust",
    "name": "Unilateral / Frog Pump",
    "type": "Variante/configuración",
    "changes": "Aumenta unilateralidad o cambia posición de cadera; no nuevo MOTOR V2",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "glutes_cable_kickback",
    "name": "Rodilla extendida/ligeramente flexionada; posterior/diagonal",
    "type": "Técnica/sesgo",
    "changes": "Modifica contribución relativa y componente de abducción",
    "rule": "MOTOR-TECHBIAS-028"
  },
  {
    "baseId": "glutes_kickback_machine",
    "name": "Apoyo pie/rodilla; lever/selectorized/plate-loaded",
    "type": "Implementación máquina",
    "changes": "Diseños distintos sin crear ficha por fabricante",
    "rule": "LIB-EQUIPVAR-003"
  },
  {
    "baseId": "glutes_abduction_machine",
    "name": "Tronco neutro / ligera inclinación; bilateral/unilateral",
    "type": "Posición/configuración",
    "changes": "Posición de cadera puede cambiar condiciones mecánicas; no asignar músculos de forma simplista",
    "rule": "MOTOR-TECHBIAS-028"
  },
  {
    "baseId": "glutes_cable_abduction",
    "name": "Lateral / ligeramente posterior-diagonal",
    "type": "Trayectoria/sesgo",
    "changes": "Diagonal añade componente de extensión manteniendo abducción como función base",
    "rule": "MOTOR-TECHBIAS-028"
  },
  {
    "baseId": "glutes_cable_pull_through",
    "name": "Cuerda / agarre compatible; stance y ROM cómodos",
    "type": "Accesorio/configuración",
    "changes": "Ajusta setup manteniendo bisagra con polea",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "glutes_sumo_deadlift",
    "name": "Anchura/orientación pies individual; barra / DB / KB",
    "type": "Técnica/implementación",
    "changes": "Antropometría y comodidad guían postura; DB/KB pueden servir como regresión",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "calves_standing_raise",
    "name": "Máquina / Smith / mancuerna / barra / peso corporal",
    "type": "Implementación",
    "changes": "Misma flexión plantar con rodilla extendida",
    "rule": "LIB-EQUIPVAR-003"
  },
  {
    "baseId": "calves_standing_raise",
    "name": "Unilateral con mancuerna en escalón",
    "type": "Lateralidad/ROM",
    "changes": "Permite carga unilateral y mayor dorsiflexión con apoyo estable",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "calves_seated_raise",
    "name": "Máquina / mancuerna / barra; bilateral/unilateral",
    "type": "Implementación",
    "changes": "Mantiene flexión plantar con rodilla flexionada",
    "rule": "LIB-EQUIPVAR-003"
  },
  {
    "baseId": "calves_leg_press_raise",
    "name": "Bilateral / unilateral; ROM amplio controlado",
    "type": "Configuración",
    "changes": "Escala lateralidad y recorrido sin cambiar función",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "calves_hack_squat_raise",
    "name": "Posición estable y ROM amplio controlado",
    "type": "Configuración",
    "changes": "Alta afinidad con standing raise; no rotar por variedad",
    "rule": "MOTOR-STABILITY-015"
  },
  {
    "baseId": "adductors_machine",
    "name": "ROM / ángulo inicial",
    "type": "ROM/configuración",
    "changes": "Ajustar apertura inicial a movilidad y tolerancia",
    "rule": "MOTOR-TECHBIAS-028"
  },
  {
    "baseId": "adductors_machine",
    "name": "Bilateral / unilateral",
    "type": "Lateralidad",
    "changes": "Cambia trabajo por lado sin cambiar función",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "adductors_machine",
    "name": "Posición de cadera/asiento",
    "type": "Posición/configuración",
    "changes": "Puede modificar condiciones mecánicas de los aductores",
    "rule": "MOTOR-TECHBIAS-028"
  },
  {
    "baseId": "adductors_cable_adduction",
    "name": "Polea / banda",
    "type": "Implementación",
    "changes": "Cambia perfil de resistencia y accesibilidad",
    "rule": "LIB-EQUIPVAR-003"
  },
  {
    "baseId": "adductors_cable_adduction",
    "name": "ROM / posición inicial",
    "type": "ROM/configuración",
    "changes": "Ajustar apertura y cruce a control/tolerancia",
    "rule": "MOTOR-TECHBIAS-028"
  },
  {
    "baseId": "adductors_cable_adduction",
    "name": "Apoyo/posición corporal",
    "type": "Estabilidad/configuración",
    "changes": "Modifica demanda de estabilización manteniendo aducción unilateral",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "tibialis_raise",
    "name": "Pared / banda / máquina / tib bar; bilateral/unilateral",
    "type": "Implementación/configuración",
    "changes": "Distintas formas de cargar dorsiflexión sin fragmentar MOTOR",
    "rule": "LIB-EQUIPVAR-003"
  },
  {
    "baseId": "hip_flexors_cable_flexion",
    "name": "Polea / banda; altura/posición corporal cómoda",
    "type": "Implementación/configuración",
    "changes": "Ajusta resistencia y estabilidad manteniendo flexión de cadera",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "neck_flexion",
    "name": "Disco / banda / resistencia manual / arnés-polea",
    "type": "Implementación",
    "changes": "Cambia la fuente y facilidad de carga manteniendo flexión cervical resistida",
    "rule": "LIB-EQUIPVAR-003"
  },
  {
    "baseId": "neck_flexion",
    "name": "ROM cómodo / carga conservadora",
    "type": "ROM/intensidad",
    "changes": "Ajusta recorrido y carga a control/tolerancia; evitar rebotes y extremos cargados",
    "rule": "MOTOR-NECK-SAFETY-095"
  },
  {
    "baseId": "neck_extension",
    "name": "Disco / banda / resistencia manual / arnés-polea",
    "type": "Implementación",
    "changes": "Cambia la fuente y facilidad de carga manteniendo extensión cervical resistida",
    "rule": "LIB-EQUIPVAR-003"
  },
  {
    "baseId": "neck_extension",
    "name": "ROM cómodo hasta posición controlada",
    "type": "ROM/configuración",
    "changes": "Evitar buscar hiperextensión cervical máxima bajo carga",
    "rule": "MOTOR-NECK-SAFETY-095"
  },
  {
    "baseId": "neck_lateral_flexion",
    "name": "Disco / banda / resistencia manual / máquina",
    "type": "Implementación",
    "changes": "Cambia la fuente de resistencia manteniendo flexión lateral cervical",
    "rule": "LIB-EQUIPVAR-003"
  },
  {
    "baseId": "neck_lateral_flexion",
    "name": "Lado izquierdo / derecho",
    "type": "Lateralidad",
    "changes": "Mismo MOTOR programado por ambos lados; no crear fichas separadas",
    "rule": "LIB-VARIANT-001"
  }
];

/** Diccionario muscular: códigos comunes a todas las fichas. */
export const MUSCLES: MuscleEntry[] = [
  {
    "code": "pec_major",
    "name": "Pectoral mayor",
    "group": "Pecho",
    "type": "Músculo",
    "motorUse": "Base anatómica",
    "notes": "No dividir en músculos ficticios; los sesgos regionales se registran aparte."
  },
  {
    "code": "pec_clavicular",
    "name": "Región clavicular del pectoral mayor",
    "group": "Pecho",
    "type": "Región",
    "motorUse": "Sesgo regional",
    "notes": "Sesgo, no aislamiento."
  },
  {
    "code": "pec_sternocostal",
    "name": "Región esternocostal del pectoral mayor",
    "group": "Pecho",
    "type": "Región",
    "motorUse": "Sesgo regional",
    "notes": "Sesgo, no aislamiento."
  },
  {
    "code": "triceps",
    "name": "Tríceps braquial",
    "group": "Tríceps",
    "type": "Músculo",
    "motorUse": "Contribución directa/indirecta",
    "notes": "Extensión de codo."
  },
  {
    "code": "ant_delt",
    "name": "Deltoides anterior",
    "group": "Hombros",
    "type": "Región",
    "motorUse": "Contribución directa/indirecta",
    "notes": "Flexión/aducción horizontal según patrón."
  },
  {
    "code": "serratus",
    "name": "Serrato anterior",
    "group": "Cintura escapular",
    "type": "Músculo",
    "motorUse": "Contribución/estabilización",
    "notes": "Especialmente relevante cuando hay libertad escapular."
  },
  {
    "code": "core",
    "name": "Core / tronco",
    "group": "Core",
    "type": "Sistema funcional",
    "motorUse": "Estabilización",
    "notes": "Etiqueta funcional V1; no sustituye el detalle de músculos del core."
  },
  {
    "code": "biceps_stabilizer",
    "name": "Bíceps braquial",
    "group": "Bíceps",
    "type": "Músculo",
    "motorUse": "Estabilización/colaboración",
    "notes": "En aperturas puede colaborar estabilizando hombro/codo; no estímulo directo relevante."
  },
  {
    "code": "latissimus",
    "name": "Dorsal ancho",
    "group": "Espalda",
    "type": "Músculo",
    "motorUse": "Contribución directa/indirecta",
    "notes": "Extensión/aducción de hombro; los sesgos de trayectoria no crean músculos nuevos."
  },
  {
    "code": "mid_trap",
    "name": "Trapecio medio",
    "group": "Trapecio",
    "type": "Región",
    "motorUse": "Contribución/retracción escapular",
    "notes": "Relevante en remos y trabajo escapular."
  },
  {
    "code": "low_trap",
    "name": "Trapecio inferior",
    "group": "Trapecio",
    "type": "Región",
    "motorUse": "Contribución/control escapular",
    "notes": "Control/depresión/rotación escapular según patrón."
  },
  {
    "code": "rhomboids",
    "name": "Romboides",
    "group": "Espalda alta",
    "type": "Músculo",
    "motorUse": "Contribución/retracción escapular",
    "notes": "Alta afinidad funcional con trapecio medio en retracción."
  },
  {
    "code": "post_delt",
    "name": "Deltoides posterior",
    "group": "Hombros",
    "type": "Región",
    "motorUse": "Contribución directa/indirecta",
    "notes": "Extensión/abducción horizontal del hombro según trayectoria."
  },
  {
    "code": "erectors",
    "name": "Erectores espinales",
    "group": "Core/espalda",
    "type": "Sistema muscular",
    "motorUse": "Estabilización/extensión",
    "notes": "Especialmente relevantes en remos sin apoyo y bisagras."
  },
  {
    "code": "rotator_cuff",
    "name": "Rotadores externos / manguito rotador",
    "group": "Hombros",
    "type": "Sistema muscular",
    "motorUse": "Contribución/estabilización",
    "notes": "Especialmente relevante en Face Pull y control glenohumeral."
  },
  {
    "code": "biceps_brachii",
    "name": "Bíceps braquial",
    "group": "Bíceps",
    "type": "Músculo",
    "motorUse": "Contribución directa/indirecta",
    "notes": "Flexión de codo y supinación; posición del hombro puede modificar mecánica, no implica aislamiento de cabezas."
  },
  {
    "code": "brachialis",
    "name": "Braquial",
    "group": "Bíceps/brazo",
    "type": "Músculo",
    "motorUse": "Contribución directa/indirecta",
    "notes": "Flexor de codo; especialmente relevante en curls independientemente de la supinación."
  },
  {
    "code": "brachioradialis",
    "name": "Braquiorradial",
    "group": "Antebrazo",
    "type": "Músculo",
    "motorUse": "Contribución directa/indirecta",
    "notes": "Flexión de codo; mayor sesgo relativo con agarres neutros/pronados."
  },
  {
    "code": "lat_delt",
    "name": "Deltoides lateral",
    "group": "Hombros",
    "type": "Región",
    "motorUse": "Contribución directa/indirecta",
    "notes": "Abducción/elevación del hombro; interacción con rotación escapular."
  },
  {
    "code": "supraspinatus",
    "name": "Supraespinoso",
    "group": "Manguito rotador",
    "type": "Músculo",
    "motorUse": "Contribución/estabilización",
    "notes": "Colabora en abducción y estabilidad glenohumeral."
  },
  {
    "code": "upper_trap",
    "name": "Trapecio superior",
    "group": "Trapecio",
    "type": "Región",
    "motorUse": "Contribución/elevación escapular",
    "notes": "Elevación y rotación superior escapular."
  },
  {
    "code": "wrist_flexors",
    "name": "Flexores de muñeca y dedos",
    "group": "Antebrazo",
    "type": "Sistema muscular",
    "motorUse": "Contribución directa/agarre",
    "notes": "Flexión de muñeca/dedos y contribución al agarre."
  },
  {
    "code": "wrist_extensors",
    "name": "Extensores de muñeca",
    "group": "Antebrazo",
    "type": "Sistema muscular",
    "motorUse": "Contribución directa/estabilización",
    "notes": "Extensión y estabilización de muñeca."
  },
  {
    "code": "pronators",
    "name": "Pronadores del antebrazo",
    "group": "Antebrazo",
    "type": "Sistema muscular",
    "motorUse": "Contribución directa",
    "notes": "Pronación del antebrazo."
  },
  {
    "code": "supinator",
    "name": "Supinador",
    "group": "Antebrazo",
    "type": "Músculo/sistema",
    "motorUse": "Contribución directa",
    "notes": "Supinación junto al bíceps braquial según posición/carga."
  },
  {
    "code": "rectus_abdominis",
    "name": "Recto abdominal",
    "group": "Core",
    "type": "Músculo",
    "motorUse": "Contribución directa/estabilización",
    "notes": "Flexión de tronco y control pélvico; también anti-extensión."
  },
  {
    "code": "obliques",
    "name": "Oblicuos",
    "group": "Core",
    "type": "Sistema muscular",
    "motorUse": "Contribución directa/estabilización",
    "notes": "Rotación, anti-rotación, flexión lateral y control del tronco."
  },
  {
    "code": "deep_core",
    "name": "Core profundo / estabilizadores lumbo-pélvicos",
    "group": "Core",
    "type": "Sistema funcional",
    "motorUse": "Estabilización",
    "notes": "Etiqueta funcional V1 para control lumbo-pélvico; no implica un único músculo."
  },
  {
    "code": "quadratus_lumborum",
    "name": "Cuadrado lumbar",
    "group": "Core",
    "type": "Músculo",
    "motorUse": "Contribución/estabilización",
    "notes": "Especialmente relevante en anti-flexión lateral."
  },
  {
    "code": "hip_flexors",
    "name": "Flexores de cadera",
    "group": "Cadera",
    "type": "Sistema muscular",
    "motorUse": "Contribución directa/indirecta",
    "notes": "Participan en elevaciones de piernas/rodillas; distinguir de retroversión pélvica."
  },
  {
    "code": "quadriceps",
    "name": "Cuádriceps",
    "group": "Pierna",
    "type": "Grupo muscular",
    "motorUse": "Contribución directa/indirecta",
    "notes": "Extensión de rodilla; recto femoral también cruza cadera."
  },
  {
    "code": "glute_max",
    "name": "Glúteo mayor",
    "group": "Glúteos",
    "type": "Músculo",
    "motorUse": "Contribución directa/indirecta",
    "notes": "Extensión de cadera; contribución dependiente de ROM y patrón."
  },
  {
    "code": "glute_med_min",
    "name": "Glúteo medio/menor",
    "group": "Glúteos",
    "type": "Sistema muscular",
    "motorUse": "Contribución directa/estabilización",
    "notes": "Abducción y estabilización pélvica, especialmente unilateral."
  },
  {
    "code": "hamstrings",
    "name": "Isquiosurales",
    "group": "Isquios",
    "type": "Grupo muscular",
    "motorUse": "Contribución directa/indirecta",
    "notes": "Flexión de rodilla y extensión de cadera; distinguir función entrenada."
  },
  {
    "code": "adductors",
    "name": "Aductores de cadera",
    "group": "Aductores",
    "type": "Grupo muscular",
    "motorUse": "Contribución directa/indirecta",
    "notes": "Aducción; aductor mayor también contribuye a extensión de cadera."
  },
  {
    "code": "gastrocnemius",
    "name": "Gastrocnemio",
    "group": "Gemelos",
    "type": "Músculo",
    "motorUse": "Contribución directa/indirecta",
    "notes": "Flexión plantar; cruza rodilla, por lo que su mecánica cambia con flexión de rodilla."
  },
  {
    "code": "soleus",
    "name": "Sóleo",
    "group": "Gemelos",
    "type": "Músculo",
    "motorUse": "Contribución directa",
    "notes": "Flexión plantar; no cruza la rodilla."
  },
  {
    "code": "tibialis_anterior",
    "name": "Tibial anterior",
    "group": "Pierna inferior",
    "type": "Músculo",
    "motorUse": "Contribución directa",
    "notes": "Dorsiflexión del tobillo."
  },
  {
    "code": "iliopsoas",
    "name": "Iliopsoas",
    "group": "Flexores de cadera",
    "type": "Sistema muscular",
    "motorUse": "Contribución directa",
    "notes": "Flexión de cadera."
  },
  {
    "code": "neck_flexors",
    "name": "Flexores cervicales",
    "group": "Cuello",
    "type": "Sistema muscular",
    "motorUse": "Contribución directa",
    "notes": "Flexión cervical; uso exclusivo del bloque opt-in."
  },
  {
    "code": "deep_neck_stabilizers",
    "name": "Estabilizadores cervicales profundos",
    "group": "Cuello",
    "type": "Sistema muscular",
    "motorUse": "Contribución/control",
    "notes": "Control cervical; no tratar como objetivo de hipertrofia independiente."
  },
  {
    "code": "neck_extensors",
    "name": "Extensores cervicales",
    "group": "Cuello",
    "type": "Sistema muscular",
    "motorUse": "Contribución directa",
    "notes": "Extensión cervical; uso exclusivo del bloque opt-in."
  },
  {
    "code": "neck_lateral_flexors",
    "name": "Flexores laterales cervicales",
    "group": "Cuello",
    "type": "Sistema muscular",
    "motorUse": "Contribución directa",
    "notes": "Flexión lateral cervical; izquierda/derecha son configuraciones."
  }
];

/**
 * IDs de versiones anteriores que siguen siendo el mismo ejercicio
 * (renombrados o fusionados como configuración). Permiten leer planes,
 * historial y preferencias guardados con el ID viejo.
 */
export const LEGACY_ID_ALIASES: Record<string, string> = {
  "shoulder_facepull": "back_face_pull",
  "quad_squat": "legs_barbell_squat",
  "quad_front_squat": "legs_front_squat",
  "quad_goblet_squat": "legs_goblet_squat",
  "quad_hack": "legs_hack_squat",
  "quad_legpress": "legs_leg_press",
  "quad_extension": "legs_leg_extension",
  "leg_bulgarian": "legs_bulgarian_split_squat",
  "leg_reverse_lunge": "legs_reverse_lunge",
  "leg_walking_lunge": "legs_walking_lunge",
  "leg_stepup": "legs_step_up",
  "ham_rdl": "hamstrings_romanian_deadlift",
  "ham_single_rdl": "hamstrings_single_leg_rdl",
  "ham_good_morning": "hamstrings_good_morning",
  "ham_seated_curl": "hamstrings_seated_leg_curl",
  "ham_lying_curl": "hamstrings_lying_leg_curl",
  "ham_single_curl": "hamstrings_standing_leg_curl",
  "ham_45_extension": "hamstrings_45deg_hip_extension",
  "glute_hipthrust": "glutes_hip_thrust",
  "glute_kickback": "glutes_cable_kickback",
  "glute_abduction_machine": "glutes_abduction_machine",
  "glute_abduction_cable": "glutes_cable_abduction",
  "adductor_machine": "adductors_machine",
  "adductor_cable": "adductors_cable_adduction",
  "calf_standing": "calves_standing_raise",
  "calf_seated": "calves_seated_raise",
  "calf_legpress": "calves_leg_press_raise",
  "quad_single_legpress": "legs_leg_press",
  "quad_extension_single": "legs_leg_extension",
  "calf_single_standing": "calves_standing_raise",
  "glute_single_hipthrust": "glutes_hip_thrust",
  "glute_bridge": "glutes_hip_thrust",
  "glute_frog_pump": "glutes_hip_thrust",
  "back_supinated_pulldown": "back_lat_pulldown",
  "back_neutral_pullup": "back_pullup",
  "back_chinup": "back_pullup"
};

/** Metadatos de importación. `warnings` = contradicciones del Excel a revisar con producto. */
export const LIBRARY_META = {
  "version": "2.17",
  "sourceFile": "FIT-K_Biblioteca_Inteligente_v2.17_Auditoria_Matriz_Muscular.xlsx",
  "sheetRows": 137,
  "uniqueExercises": 137,
  "variants": 168,
  "matrixRows": 622,
  "muscles": 43,
  "warnings": []
} as const;

/** ID actual de una ficha (traduce IDs antiguos; deja igual los desconocidos). */
export const resolveLibraryId = (id: string): string => LEGACY_ID_ALIASES[id] ?? id;

/** Busca por ID actual o antiguo. */
export const libraryById = new Map<string, LibraryExercise>([
  ...LIBRARY.map(e => [e.id, e] as [string, LibraryExercise]),
  ...Object.entries(LEGACY_ID_ALIASES).map(([old, id]) => [old, LIBRARY.find(e => e.id === id)!] as [string, LibraryExercise]),
]);
export const variantsFor = (id: string) => VARIANTS.filter(v => v.baseId === id);
export const muscleByCode = new Map(MUSCLES.map(m => [m.code, m]));

// Resumen en texto para el system prompt del Coach — misma fuente de verdad
// que el Motor; se regenera siempre desde LIBRARY.
export function libraryPromptSummary(): string {
  const byBlock = new Map<string, string[]>();
  for (const ex of LIBRARY) {
    if (!byBlock.has(ex.block)) byBlock.set(ex.block, []);
    byBlock.get(ex.block)?.push(ex.name);
  }
  const lines = Array.from(byBlock.entries())
    .map(([block, names]) => `${block.toUpperCase()} (${names.length}): ${names.join(', ')}.`)
    .join('\n');
  return `LISTA OFICIAL DE EJERCICIOS — BIBLIOTECA FIT-K v${LIBRARY_META.version} (obligatoria, ${LIBRARY.length} ejercicios):\n${lines}\nREGLA: Al crear entrenamientos o proponer/sustituir ejercicios de gimnasio, usa EXCLUSIVAMENTE ejercicios de esta lista, con estos nombres exactos. Si el usuario menciona un ejercicio que no está, sugiere el equivalente más cercano de la lista. Los ejercicios de CUELLO solo se incluyen si el usuario pide expresamente entrenar cuello.`;
}
