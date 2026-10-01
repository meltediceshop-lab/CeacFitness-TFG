// ─────────────────────────────────────────────────────────────────────
// GENERADO por scripts/import-biblioteca.py — NO EDITAR A MANO.
// Fuente de verdad: FIT-K_Biblioteca_InteligenteMOTOR.xlsx (Biblioteca Inteligente v1.8).
// La Biblioteca describe; el Motor (fitkMotor.ts) decide. Para cambiar
// datos, edita el Excel y vuelve a ejecutar el importador.
// ─────────────────────────────────────────────────────────────────────

export interface SecondaryMuscle {
  muscle: string;
  /** Heurística de planificación (0.5 / 0), NO equivalencia fisiológica (LIB-INDIRECT-001). */
  coefficient: number;
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
  equipment: string;
  /** Alternativas de requisitos de equipo: basta con cumplir UNA (Hard Filter). */
  equipmentOptions: string[][];
  loadSource: string;
  laterality: string;
  primaryMuscle: string;
  secondaryMuscles: SecondaryMuscle[];
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
    "secondaryMuscles": [
      {
        "muscle": "Tríceps",
        "coefficient": 0.5
      },
      {
        "muscle": "deltoide anterior",
        "coefficient": 0.5
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
    "secondaryMuscles": [
      {
        "muscle": "Tríceps",
        "coefficient": 0.5
      },
      {
        "muscle": "deltoide anterior",
        "coefficient": 0.5
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
    "id": "chest_machine_press",
    "name": "Press pecho máquina",
    "block": "Pecho",
    "family": "Press horizontal",
    "movementPattern": "Empuje horizontal",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "equipment": "Máquina",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Pecho",
    "secondaryMuscles": [
      {
        "muscle": "Tríceps",
        "coefficient": 0.5
      },
      {
        "muscle": "deltoide anterior",
        "coefficient": 0.5
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
    "id": "chest_incline_barbell",
    "name": "Press inclinado barra",
    "block": "Pecho",
    "family": "Press inclinado",
    "movementPattern": "Empuje inclinado",
    "compatibleRoles": [
      "Principal"
    ],
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
    "secondaryMuscles": [
      {
        "muscle": "Tríceps",
        "coefficient": 0.5
      },
      {
        "muscle": "deltoide anterior",
        "coefficient": 0.5
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
    "secondaryMuscles": [
      {
        "muscle": "Tríceps",
        "coefficient": 0.5
      },
      {
        "muscle": "deltoide anterior",
        "coefficient": 0.5
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
    "id": "chest_incline_machine",
    "name": "Press inclinado máquina",
    "block": "Pecho",
    "family": "Press inclinado",
    "movementPattern": "Empuje inclinado",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "equipment": "Máquina",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Pecho clavicular",
    "secondaryMuscles": [
      {
        "muscle": "Tríceps",
        "coefficient": 0.5
      },
      {
        "muscle": "deltoide anterior",
        "coefficient": 0.5
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
    "id": "chest_cable_fly",
    "name": "Aperturas polea",
    "block": "Pecho",
    "family": "Aducción horizontal",
    "movementPattern": "Aducción horizontal",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "equipment": "Polea",
    "equipmentOptions": [
      [
        "polea"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Pecho",
    "secondaryMuscles": [],
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
    "equipment": "Máquina",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Pecho",
    "secondaryMuscles": [],
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
    "id": "chest_pushup",
    "name": "Flexiones",
    "block": "Pecho",
    "family": "Press horizontal",
    "movementPattern": "Empuje horizontal",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "equipment": "Peso corporal",
    "equipmentOptions": [
      []
    ],
    "loadSource": "Corporal+opcional",
    "laterality": "Bilateral",
    "primaryMuscle": "Pecho",
    "secondaryMuscles": [
      {
        "muscle": "Tríceps",
        "coefficient": 0.5
      },
      {
        "muscle": "deltoide anterior",
        "coefficient": 0.5
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
    "secondaryMuscles": [
      {
        "muscle": "Bíceps",
        "coefficient": 0.5
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
    "motorNotes": "Agarre neutro/estrecho pasa a configuración/variante de esta ficha."
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
    "equipment": "Barra dominadas",
    "equipmentOptions": [
      [
        "dominadas"
      ]
    ],
    "loadSource": "Corporal+opcional",
    "laterality": "Bilateral",
    "primaryMuscle": "Dorsal",
    "secondaryMuscles": [
      {
        "muscle": "Bíceps",
        "coefficient": 0.5
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
    "motorNotes": "Base de progresión. Si no alcanza el rango objetivo con buena técnica → dominada asistida. Si supera claramente el rango de forma consistente → progresar repeticiones/carga; la dominada lastrada no requiere ficha Motor separada."
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
    "equipment": "Máquina/asistencia segura",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Corporal asistida",
    "laterality": "Bilateral",
    "primaryMuscle": "Dorsal",
    "secondaryMuscles": [
      {
        "muscle": "Bíceps",
        "coefficient": 0.5
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
    "motorNotes": "Regresión preferente de dominadas cuando el usuario no alcanza el límite inferior del rango prescrito con buena técnica. La asistencia ajusta la fuerza requerida; experiencia no actúa como filtro absoluto."
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
    "equipment": "Polea",
    "equipmentOptions": [
      [
        "polea"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Espalda media/dorsal",
    "secondaryMuscles": [
      {
        "muscle": "Bíceps",
        "coefficient": 0.5
      },
      {
        "muscle": "deltoide posterior",
        "coefficient": 0
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
    "motorNotes": null
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
    "equipment": "Máquina",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Espalda media/dorsal",
    "secondaryMuscles": [
      {
        "muscle": "Bíceps",
        "coefficient": 0.5
      },
      {
        "muscle": "deltoide posterior",
        "coefficient": 0
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
    "motorNotes": "Máquina de fuerza, no ergómetro/cardio. Trayectoria guiada; no confundir con remo con mancuernas pecho apoyado."
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
    "equipment": "Mancuerna+apoyo",
    "equipmentOptions": [
      [
        "mancuernas"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Unilateral",
    "primaryMuscle": "Dorsal/espalda media",
    "secondaryMuscles": [
      {
        "muscle": "Bíceps",
        "coefficient": 0.5
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
    "motorNotes": "Coste unilateral"
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
    "equipment": "Barra",
    "equipmentOptions": [
      [
        "barra"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Espalda media/dorsal",
    "secondaryMuscles": [
      {
        "muscle": "Bíceps",
        "coefficient": 0.5
      },
      {
        "muscle": "erectores estabilizan",
        "coefficient": 0
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
    "motorNotes": null
  },
  {
    "id": "back_tbar_row",
    "name": "Remo T",
    "block": "Espalda",
    "family": "Tirón horizontal",
    "movementPattern": "Tirón horizontal",
    "compatibleRoles": [
      "Principal"
    ],
    "equipment": "T-bar/máquina",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Espalda media/dorsal",
    "secondaryMuscles": [
      {
        "muscle": "Bíceps",
        "coefficient": 0.5
      }
    ],
    "accessibility": "Media-Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Media-Alta",
    "localFatigue": "Media-Alta",
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
    "motorNotes": null
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
    "equipment": "Polea",
    "equipmentOptions": [
      [
        "polea"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Dorsal",
    "secondaryMuscles": [],
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
    "motorNotes": null
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
    "equipment": "Máquina",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Dorsal",
    "secondaryMuscles": [],
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
    "motorNotes": null
  },
  {
    "id": "shoulder_barbell_press",
    "name": "Press militar barra de pie",
    "block": "Hombro",
    "family": "Press vertical",
    "movementPattern": "Empuje vertical",
    "compatibleRoles": [
      "Principal"
    ],
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
    "secondaryMuscles": [
      {
        "muscle": "Tríceps",
        "coefficient": 0.5
      },
      {
        "muscle": "lateral relevante",
        "coefficient": 0
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
    "motorNotes": "Press vertical estricto de pie; sin impulso deliberado de piernas."
  },
  {
    "id": "shoulder_db_press",
    "name": "Press hombro mancuernas",
    "block": "Hombro",
    "family": "Press vertical",
    "movementPattern": "Empuje vertical",
    "compatibleRoles": [
      "Principal"
    ],
    "equipment": "Mancuernas",
    "equipmentOptions": [
      [
        "mancuernas"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Deltoide anterior",
    "secondaryMuscles": [
      {
        "muscle": "Tríceps",
        "coefficient": 0.5
      },
      {
        "muscle": "lateral relevante",
        "coefficient": 0
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
    "motorNotes": null
  },
  {
    "id": "shoulder_machine_press",
    "name": "Press hombro máquina",
    "block": "Hombro",
    "family": "Press vertical",
    "movementPattern": "Empuje vertical",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "equipment": "Máquina",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Deltoide anterior",
    "secondaryMuscles": [
      {
        "muscle": "Tríceps",
        "coefficient": 0.5
      },
      {
        "muscle": "lateral relevante",
        "coefficient": 0
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
    "motorNotes": null
  },
  {
    "id": "shoulder_db_lateral",
    "name": "Elevación lateral mancuernas",
    "block": "Hombro",
    "family": "Abducción",
    "movementPattern": "Abducción hombro",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "equipment": "Mancuernas",
    "equipmentOptions": [
      [
        "mancuernas"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Deltoide lateral",
    "secondaryMuscles": [],
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
    "motorNotes": null
  },
  {
    "id": "shoulder_cable_lateral",
    "name": "Elevación lateral polea",
    "block": "Hombro",
    "family": "Abducción",
    "movementPattern": "Abducción hombro",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "equipment": "Polea",
    "equipmentOptions": [
      [
        "polea"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Unilateral",
    "primaryMuscle": "Deltoide lateral",
    "secondaryMuscles": [],
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
    "executionTimeCost": "Medio-Alto",
    "densitySuitability": "Media-Alta",
    "substitutionFamily": "Abducción hombro",
    "motorNotes": null
  },
  {
    "id": "shoulder_machine_lateral",
    "name": "Elevación lateral máquina",
    "block": "Hombro",
    "family": "Abducción",
    "movementPattern": "Abducción hombro",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "equipment": "Máquina",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Deltoide lateral",
    "secondaryMuscles": [],
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
    "motorNotes": null
  },
  {
    "id": "shoulder_reverse_pecdeck",
    "name": "Reverse pec deck",
    "block": "Hombro",
    "family": "Deltoide posterior",
    "movementPattern": "Abducción horizontal",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "equipment": "Máquina",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Deltoide posterior",
    "secondaryMuscles": [
      {
        "muscle": "Trapecio/escapulares",
        "coefficient": 0
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
    "motorNotes": null
  },
  {
    "id": "shoulder_rear_delt_db",
    "name": "Pájaros mancuernas",
    "block": "Hombro",
    "family": "Deltoide posterior",
    "movementPattern": "Abducción horizontal",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "equipment": "Mancuernas",
    "equipmentOptions": [
      [
        "mancuernas"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Deltoide posterior",
    "secondaryMuscles": [
      {
        "muscle": "Trapecio/escapulares",
        "coefficient": 0
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
    "motorNotes": null
  },
  {
    "id": "shoulder_facepull",
    "name": "Face pull",
    "block": "Hombro",
    "family": "Tirón alto/control",
    "movementPattern": "Tirón alto",
    "compatibleRoles": [
      "Complementario",
      "Control"
    ],
    "equipment": "Polea",
    "equipmentOptions": [
      [
        "polea"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Deltoide posterior",
    "secondaryMuscles": [
      {
        "muscle": "Trapecio/escapulares",
        "coefficient": 0
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
    "setupCost": "Medio",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Deltoide posterior/escapular",
    "motorNotes": null
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
    "equipment": "Mancuernas",
    "equipmentOptions": [
      [
        "mancuernas"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Trapecio superior",
    "secondaryMuscles": [
      {
        "muscle": "Agarre relevante",
        "coefficient": 0
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
    "motorNotes": null
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
    "equipment": "Barra",
    "equipmentOptions": [
      [
        "barra"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Trapecio superior",
    "secondaryMuscles": [
      {
        "muscle": "Agarre relevante",
        "coefficient": 0
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
    "motorNotes": null
  },
  {
    "id": "trap_machine_shrug",
    "name": "Encogimientos máquina/Smith",
    "block": "Trapecio",
    "family": "Elevación escapular",
    "movementPattern": "Elevación escapular",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "equipment": "Máquina/Smith",
    "equipmentOptions": [
      [
        "maquina"
      ],
      [
        "smith"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Trapecio superior",
    "secondaryMuscles": [
      {
        "muscle": "Agarre relevante",
        "coefficient": 0
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
    "motorNotes": null
  },
  {
    "id": "biceps_bar_curl",
    "name": "Curl barra/EZ",
    "block": "Bíceps",
    "family": "Flexión codo",
    "movementPattern": "Flexión codo",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "equipment": "Barra/EZ",
    "equipmentOptions": [
      [
        "barra"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Bíceps",
    "secondaryMuscles": [
      {
        "muscle": "Antebrazo",
        "coefficient": 0
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
    "substitutionFamily": "Flexión codo",
    "motorNotes": "Recta/EZ puede ser configuración"
  },
  {
    "id": "biceps_db_curl",
    "name": "Curl mancuernas",
    "block": "Bíceps",
    "family": "Flexión codo",
    "movementPattern": "Flexión codo",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "equipment": "Mancuernas",
    "equipmentOptions": [
      [
        "mancuernas"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Bíceps",
    "secondaryMuscles": [
      {
        "muscle": "Antebrazo",
        "coefficient": 0
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
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Flexión codo",
    "motorNotes": "Curl alterno pasa a ser configuración/variante de esta ficha."
  },
  {
    "id": "biceps_hammer",
    "name": "Curl martillo",
    "block": "Bíceps",
    "family": "Flexión codo neutra",
    "movementPattern": "Flexión codo",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "equipment": "Mancuernas",
    "equipmentOptions": [
      [
        "mancuernas"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral/alterno",
    "primaryMuscle": "Braquial/bíceps",
    "secondaryMuscles": [
      {
        "muscle": "Braquiorradial",
        "coefficient": 0
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
    "substitutionFamily": "Flexión codo",
    "motorNotes": null
  },
  {
    "id": "biceps_cable",
    "name": "Curl polea",
    "block": "Bíceps",
    "family": "Flexión codo",
    "movementPattern": "Flexión codo",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "equipment": "Polea",
    "equipmentOptions": [
      [
        "polea"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Bíceps",
    "secondaryMuscles": [
      {
        "muscle": "Antebrazo",
        "coefficient": 0
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
    "substitutionFamily": "Flexión codo",
    "motorNotes": null
  },
  {
    "id": "biceps_preacher",
    "name": "Curl predicador barra/EZ",
    "block": "Bíceps",
    "family": "Flexión codo",
    "movementPattern": "Flexión codo",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "equipment": "Barra/EZ+banco predicador",
    "equipmentOptions": [
      [
        "barra",
        "banco"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Bíceps",
    "secondaryMuscles": [],
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
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Flexión codo",
    "motorNotes": "Predicador con peso libre. No fusionar con predicador máquina: estabilidad, setup y progresión difieren."
  },
  {
    "id": "triceps_pushdown",
    "name": "Extensión tríceps polea",
    "block": "Tríceps",
    "family": "Extensión codo",
    "movementPattern": "Extensión codo",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "equipment": "Polea",
    "equipmentOptions": [
      [
        "polea"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Tríceps",
    "secondaryMuscles": [],
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
    "substitutionFamily": "Extensión codo",
    "motorNotes": "Cuerda/barra = configuración"
  },
  {
    "id": "triceps_overhead_cable",
    "name": "Extensión tríceps overhead polea",
    "block": "Tríceps",
    "family": "Extensión codo overhead",
    "movementPattern": "Extensión codo",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "equipment": "Polea",
    "equipmentOptions": [
      [
        "polea"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Tríceps",
    "secondaryMuscles": [],
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
    "substitutionFamily": "Extensión codo overhead",
    "motorNotes": null
  },
  {
    "id": "triceps_overhead_db",
    "name": "Extensión tríceps sobre cabeza mancuerna",
    "block": "Tríceps",
    "family": "Extensión codo overhead",
    "movementPattern": "Extensión codo",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "equipment": "Mancuerna",
    "equipmentOptions": [
      [
        "mancuernas"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Tríceps",
    "secondaryMuscles": [],
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
    "substitutionFamily": "Extensión codo overhead",
    "motorNotes": null
  },
  {
    "id": "triceps_french_press",
    "name": "Extensión tríceps tumbado barra/EZ",
    "block": "Tríceps",
    "family": "Extensión codo tumbado",
    "movementPattern": "Extensión codo",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "equipment": "Barra/EZ+banco",
    "equipmentOptions": [
      [
        "barra",
        "banco"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Tríceps",
    "secondaryMuscles": [],
    "accessibility": "Media",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Media",
    "localFatigue": "Baja-Media",
    "systemicDemand": "Baja",
    "progressionSuitability": "Alta",
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
    "substitutionFamily": "Extensión codo tumbado",
    "motorNotes": "Skull crusher/press francés tumbado con barra o EZ. La versión con mancuernas se separa por estabilidad y ejecución."
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
    "equipment": "Barra+banco",
    "equipmentOptions": [
      [
        "barra",
        "banco"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Tríceps",
    "secondaryMuscles": [
      {
        "muscle": "Pecho",
        "coefficient": 0.5
      },
      {
        "muscle": "deltoide anterior",
        "coefficient": 0
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
    "substitutionFamily": "Press dominante tríceps",
    "motorNotes": null
  },
  {
    "id": "triceps_dip",
    "name": "Fondos paralelas orientados a tríceps",
    "block": "Tríceps",
    "family": "Empuje corporal",
    "movementPattern": "Empuje",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "equipment": "Paralelas/asistida",
    "equipmentOptions": [
      [
        "paralelas"
      ]
    ],
    "loadSource": "Corporal+opcional",
    "laterality": "Bilateral",
    "primaryMuscle": "Tríceps",
    "secondaryMuscles": [
      {
        "muscle": "Pecho y deltoide anterior",
        "coefficient": 0
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
    "motorNotes": "Tronco relativamente vertical para sesgo hacia tríceps. Asistencia/lastre son métodos de progresión, no fichas nuevas."
  },
  {
    "id": "quad_squat",
    "name": "Sentadilla",
    "block": "Pierna",
    "family": "Dominante rodilla",
    "movementPattern": "Sentadilla",
    "compatibleRoles": [
      "Principal"
    ],
    "equipment": "Smith/barra+rack",
    "equipmentOptions": [
      [
        "smith"
      ],
      [
        "barra",
        "rack"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Cuádriceps",
    "secondaryMuscles": [
      {
        "muscle": "Glúteos",
        "coefficient": 0
      },
      {
        "muscle": "erectores estabilizan",
        "coefficient": 0
      }
    ],
    "accessibility": "Media-Alta",
    "strengthRequirement": "Baja-Media",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Media-Alta",
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
      "max": 240,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "120-240 s"
    },
    "setupCost": "Medio",
    "executionTimeCost": "Medio",
    "densitySuitability": "Media",
    "substitutionFamily": "Dominante rodilla",
    "motorNotes": "Smith prioritaria en hipertrofia cuando encaje; barra libre como variante. Mantener si el usuario progresa/preﬁere libre."
  },
  {
    "id": "quad_front_squat",
    "name": "Sentadilla frontal",
    "block": "Pierna",
    "family": "Dominante rodilla",
    "movementPattern": "Sentadilla",
    "compatibleRoles": [
      "Principal"
    ],
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
    "primaryMuscle": "Cuádriceps",
    "secondaryMuscles": [
      {
        "muscle": "Glúteos",
        "coefficient": 0
      },
      {
        "muscle": "tronco estabiliza",
        "coefficient": 0
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Baja-Media",
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
    "substitutionFamily": "Dominante rodilla",
    "motorNotes": "Ficha distinta por posición de carga y demandas técnicas."
  },
  {
    "id": "quad_goblet_squat",
    "name": "Sentadilla Goblet",
    "block": "Pierna",
    "family": "Dominante rodilla",
    "movementPattern": "Sentadilla",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "equipment": "Mancuerna/kettlebell",
    "equipmentOptions": [
      [
        "mancuernas"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Cuádriceps",
    "secondaryMuscles": [
      {
        "muscle": "Glúteos",
        "coefficient": 0
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Media",
    "systemicDemand": "Media",
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
      "min": 90,
      "max": 180,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "90-180 s"
    },
    "setupCost": "Bajo",
    "executionTimeCost": "Medio",
    "densitySuitability": "Media-Alta",
    "substitutionFamily": "Dominante rodilla",
    "motorNotes": "Muy accesible; la carga disponible puede limitar progresión a largo plazo."
  },
  {
    "id": "quad_bodyweight_squat",
    "name": "Sentadilla peso corporal",
    "block": "Pierna",
    "family": "Dominante rodilla",
    "movementPattern": "Sentadilla",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "equipment": "Peso corporal",
    "equipmentOptions": [
      []
    ],
    "loadSource": "Corporal+opcional",
    "laterality": "Bilateral",
    "primaryMuscle": "Cuádriceps",
    "secondaryMuscles": [
      {
        "muscle": "Glúteos",
        "coefficient": 0
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
      "min": null,
      "max": null,
      "unit": "reps",
      "perSide": false,
      "byCapacity": true,
      "openEnded": false,
      "raw": "Según capacidad"
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
    "setupCost": "Mínimo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Dominante rodilla",
    "motorNotes": "1,5 repeticiones/minibanda son configuraciones, no fichas."
  },
  {
    "id": "quad_hack",
    "name": "Hack squat",
    "block": "Pierna",
    "family": "Dominante rodilla",
    "movementPattern": "Sentadilla/prensa",
    "compatibleRoles": [
      "Principal"
    ],
    "equipment": "Máquina",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Cuádriceps",
    "secondaryMuscles": [
      {
        "muscle": "Glúteos",
        "coefficient": 0
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
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
    "setupCost": "Bajo",
    "executionTimeCost": "Medio",
    "densitySuitability": "Media",
    "substitutionFamily": "Dominante rodilla",
    "motorNotes": "Configuración depende de máquina."
  },
  {
    "id": "quad_pendulum_squat",
    "name": "Sentadilla pendular",
    "block": "Pierna",
    "family": "Dominante rodilla",
    "movementPattern": "Sentadilla/prensa",
    "compatibleRoles": [
      "Principal"
    ],
    "equipment": "Máquina específica",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Cuádriceps",
    "secondaryMuscles": [
      {
        "muscle": "Glúteos",
        "coefficient": 0
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
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
    "setupCost": "Bajo",
    "executionTimeCost": "Medio",
    "densitySuitability": "Media",
    "substitutionFamily": "Dominante rodilla",
    "motorNotes": "Solo elegible si el gimnasio dispone de máquina pendular."
  },
  {
    "id": "quad_legpress",
    "name": "Prensa bilateral",
    "block": "Pierna",
    "family": "Dominante rodilla",
    "movementPattern": "Prensa",
    "compatibleRoles": [
      "Principal"
    ],
    "equipment": "Prensa",
    "equipmentOptions": [
      [
        "prensa"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Cuádriceps",
    "secondaryMuscles": [
      {
        "muscle": "Glúteos/aductores según ejecución",
        "coefficient": 0
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Media-Alta",
    "systemicDemand": "Media-Alta",
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
    "setupCost": "Bajo",
    "executionTimeCost": "Medio",
    "densitySuitability": "Media",
    "substitutionFamily": "Dominante rodilla",
    "motorNotes": "Posición de pies modifica énfasis relativo; no implica aislamiento regional."
  },
  {
    "id": "quad_single_legpress",
    "name": "Prensa unilateral",
    "block": "Pierna",
    "family": "Dominante rodilla unilateral",
    "movementPattern": "Prensa",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "equipment": "Prensa",
    "equipmentOptions": [
      [
        "prensa"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Unilateral",
    "primaryMuscle": "Cuádriceps/glúteos",
    "secondaryMuscles": [
      {
        "muscle": "Ambos relevantes",
        "coefficient": 0
      },
      {
        "muscle": "aductores según ejecución",
        "coefficient": 0
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
      "min": 8,
      "max": 20,
      "unit": "reps",
      "perSide": true,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-20/lado"
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
    "substitutionFamily": "Unilateral rodilla",
    "motorNotes": "Ficha propia por unilateralidad, coste temporal y carga."
  },
  {
    "id": "quad_extension",
    "name": "Extensión cuádriceps",
    "block": "Pierna",
    "family": "Extensión rodilla",
    "movementPattern": "Extensión rodilla",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "equipment": "Máquina",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Cuádriceps",
    "secondaryMuscles": [],
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
    "substitutionFamily": "Extensión rodilla",
    "motorNotes": null
  },
  {
    "id": "quad_extension_single",
    "name": "Extensión cuádriceps unilateral",
    "block": "Pierna",
    "family": "Extensión rodilla",
    "movementPattern": "Extensión rodilla",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "equipment": "Máquina",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Unilateral",
    "primaryMuscle": "Cuádriceps",
    "secondaryMuscles": [],
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
    "executionTimeCost": "Alto",
    "densitySuitability": "Media-Alta",
    "substitutionFamily": "Extensión rodilla",
    "motorNotes": "Útil para trabajo unilateral; mayor coste temporal."
  },
  {
    "id": "leg_bulgarian",
    "name": "Sentadilla búlgara",
    "block": "Pierna",
    "family": "Dominante rodilla unilateral",
    "movementPattern": "Sentadilla unilateral",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "equipment": "Smith/mancuernas/barra/peso corporal",
    "equipmentOptions": [
      [
        "smith"
      ],
      [
        "mancuernas"
      ],
      [
        "barra"
      ],
      []
    ],
    "loadSource": "Externa/corporal",
    "laterality": "Unilateral",
    "primaryMuscle": "Cuádriceps/glúteos",
    "secondaryMuscles": [
      {
        "muscle": "Ambos relevantes",
        "coefficient": 0
      }
    ],
    "accessibility": "Media-Alta",
    "strengthRequirement": "Baja-Media",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Media-Alta",
    "systemicDemand": "Media-Alta",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Alta",
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
    "substitutionFamily": "Unilateral rodilla",
    "motorNotes": "Smith preferente en hipertrofia cuando encaje; DB/barra/corporal como variantes. Técnica puede sesgar demanda relativa rodilla/cadera."
  },
  {
    "id": "leg_static_lunge",
    "name": "Zancada estática",
    "block": "Pierna",
    "family": "Dominante rodilla unilateral",
    "movementPattern": "Zancada",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "equipment": "Smith/mancuernas/peso corporal",
    "equipmentOptions": [
      [
        "smith"
      ],
      [
        "mancuernas"
      ],
      []
    ],
    "loadSource": "Externa/corporal",
    "laterality": "Unilateral",
    "primaryMuscle": "Cuádriceps/glúteos",
    "secondaryMuscles": [
      {
        "muscle": "Ambos relevantes",
        "coefficient": 0
      }
    ],
    "accessibility": "Media-Alta",
    "strengthRequirement": "Baja-Media",
    "scalability": "Alta",
    "stability": "Media-Alta",
    "localFatigue": "Media",
    "systemicDemand": "Media",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Media-Alta",
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
    "substitutionFamily": "Unilateral rodilla",
    "motorNotes": "Longitud de paso y tronco modifican énfasis relativo."
  },
  {
    "id": "leg_reverse_lunge",
    "name": "Zancada inversa",
    "block": "Pierna",
    "family": "Dominante rodilla unilateral",
    "movementPattern": "Zancada",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "equipment": "Smith/mancuernas/peso corporal",
    "equipmentOptions": [
      [
        "smith"
      ],
      [
        "mancuernas"
      ],
      []
    ],
    "loadSource": "Externa/corporal",
    "laterality": "Alterno/unilateral",
    "primaryMuscle": "Cuádriceps/glúteos",
    "secondaryMuscles": [
      {
        "muscle": "Ambos relevantes",
        "coefficient": 0
      }
    ],
    "accessibility": "Media-Alta",
    "strengthRequirement": "Baja-Media",
    "scalability": "Alta",
    "stability": "Media-Alta",
    "localFatigue": "Media",
    "systemicDemand": "Media",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Media-Alta",
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
    "substitutionFamily": "Unilateral rodilla",
    "motorNotes": "Alternativa unilateral con distinta dinámica respecto a zancada caminando."
  },
  {
    "id": "leg_walking_lunge",
    "name": "Zancada caminando",
    "block": "Pierna",
    "family": "Dominante rodilla unilateral",
    "movementPattern": "Zancada",
    "compatibleRoles": [
      "Complementario"
    ],
    "equipment": "Peso corporal/mancuernas",
    "equipmentOptions": [
      [],
      [
        "mancuernas"
      ]
    ],
    "loadSource": "Corporal+opcional",
    "laterality": "Alterno",
    "primaryMuscle": "Cuádriceps/glúteos",
    "secondaryMuscles": [
      {
        "muscle": "Ambos relevantes",
        "coefficient": 0
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Baja-Media",
    "scalability": "Alta",
    "stability": "Media",
    "localFatigue": "Media-Alta",
    "systemicDemand": "Media",
    "progressionSuitability": "Media-Alta",
    "nearFailureSuitability": "Media-Alta",
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
    "densitySuitability": "Baja-Media",
    "substitutionFamily": "Unilateral rodilla",
    "motorNotes": "Requiere espacio."
  },
  {
    "id": "leg_lateral_lunge",
    "name": "Zancada lateral",
    "block": "Pierna",
    "family": "Plano frontal unilateral",
    "movementPattern": "Zancada lateral",
    "compatibleRoles": [
      "Complementario"
    ],
    "equipment": "Peso corporal/mancuernas",
    "equipmentOptions": [
      [],
      [
        "mancuernas"
      ]
    ],
    "loadSource": "Corporal+opcional",
    "laterality": "Unilateral",
    "primaryMuscle": "Glúteos/aductores/cuádriceps",
    "secondaryMuscles": [
      {
        "muscle": "Contribución depende de profundidad y técnica",
        "coefficient": 0
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Baja-Media",
    "scalability": "Alta",
    "stability": "Media",
    "localFatigue": "Media",
    "systemicDemand": "Media",
    "progressionSuitability": "Media-Alta",
    "nearFailureSuitability": "Media",
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
    "substitutionFamily": "Unilateral lateral",
    "motorNotes": "Repertorio ampliado; no sustituye automáticamente a zancadas sagitales."
  },
  {
    "id": "leg_stepup",
    "name": "Step-up",
    "block": "Pierna",
    "family": "Dominante rodilla unilateral",
    "movementPattern": "Step",
    "compatibleRoles": [
      "Complementario"
    ],
    "equipment": "Cajón/banco+mancuernas",
    "equipmentOptions": [
      [
        "banco"
      ]
    ],
    "loadSource": "Corporal+opcional",
    "laterality": "Unilateral",
    "primaryMuscle": "Cuádriceps/glúteos",
    "secondaryMuscles": [
      {
        "muscle": "Ambos relevantes",
        "coefficient": 0
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Baja-Media",
    "scalability": "Alta",
    "stability": "Media",
    "localFatigue": "Media",
    "systemicDemand": "Media",
    "progressionSuitability": "Alta",
    "nearFailureSuitability": "Media-Alta",
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
    "substitutionFamily": "Unilateral rodilla",
    "motorNotes": "Superficie estable conocida; altura modifica mecánica."
  },
  {
    "id": "quad_wall_sit",
    "name": "Sentadilla isométrica en pared",
    "block": "Pierna",
    "family": "Dominante rodilla isométrico",
    "movementPattern": "Isométrico",
    "compatibleRoles": [
      "Complementario"
    ],
    "equipment": "Pared/carga opcional",
    "equipmentOptions": [
      []
    ],
    "loadSource": "Corporal+opcional",
    "laterality": "Bilateral",
    "primaryMuscle": "Cuádriceps",
    "secondaryMuscles": [
      {
        "muscle": "Glúteos secundarios",
        "coefficient": 0
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Media",
    "systemicDemand": "Baja",
    "progressionSuitability": "Baja-Media",
    "nearFailureSuitability": "Media-Alta",
    "repSpec": {
      "min": 20,
      "max": 60,
      "unit": "seconds",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "20-60 s"
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
    "setupCost": "Mínimo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Dominante rodilla",
    "motorNotes": "Complementario; no desplaza por defecto a opciones dinámicas progresables."
  },
  {
    "id": "ham_rdl",
    "name": "Peso muerto rumano (RDL)",
    "block": "Isquios",
    "family": "Bisagra cadera",
    "movementPattern": "Bisagra",
    "compatibleRoles": [
      "Principal"
    ],
    "equipment": "Smith/barra/mancuernas",
    "equipmentOptions": [
      [
        "smith"
      ],
      [
        "barra"
      ],
      [
        "mancuernas"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Isquios",
    "secondaryMuscles": [
      {
        "muscle": "Glúteos",
        "coefficient": 0
      },
      {
        "muscle": "erectores estabilizan",
        "coefficient": 0
      }
    ],
    "accessibility": "Media-Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Alta",
    "systemicDemand": "Alta",
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
    "densitySuitability": "Baja-Media",
    "substitutionFamily": "Bisagra cadera",
    "motorNotes": "Smith/barra/DB son implementaciones de la misma ficha; no cambiar una variante que funciona sin razón."
  },
  {
    "id": "ham_single_rdl",
    "name": "RDL unilateral",
    "block": "Isquios",
    "family": "Bisagra cadera unilateral",
    "movementPattern": "Bisagra",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "equipment": "Mancuerna/Smith compatible",
    "equipmentOptions": [
      [
        "mancuernas"
      ],
      [
        "smith"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Unilateral",
    "primaryMuscle": "Isquios/glúteos",
    "secondaryMuscles": [
      {
        "muscle": "Erectores estabilizan",
        "coefficient": 0
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Media",
    "scalability": "Alta",
    "stability": "Media",
    "localFatigue": "Media-Alta",
    "systemicDemand": "Media",
    "progressionSuitability": "Media-Alta",
    "nearFailureSuitability": "Media",
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
    "substitutionFamily": "Bisagra unilateral",
    "motorNotes": "Ficha propia por estabilidad, unilateralidad y coste temporal."
  },
  {
    "id": "ham_good_morning",
    "name": "Buenos días",
    "block": "Isquios",
    "family": "Bisagra cadera",
    "movementPattern": "Bisagra",
    "compatibleRoles": [
      "Complementario"
    ],
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
    "primaryMuscle": "Isquios/glúteos",
    "secondaryMuscles": [
      {
        "muscle": "Erectores",
        "coefficient": 0
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Baja-Media",
    "scalability": "Alta",
    "stability": "Baja-Media",
    "localFatigue": "Media-Alta",
    "systemicDemand": "Alta",
    "progressionSuitability": "Media-Alta",
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
    "densitySuitability": "Baja-Media",
    "substitutionFamily": "Bisagra cadera",
    "motorNotes": "Prioridad inicial menor que RDL; repertorio ampliado."
  },
  {
    "id": "ham_seated_curl",
    "name": "Curl femoral sentado",
    "block": "Isquios",
    "family": "Flexión rodilla",
    "movementPattern": "Flexión rodilla",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "equipment": "Máquina",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Isquios",
    "secondaryMuscles": [],
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
    "substitutionFamily": "Flexión rodilla",
    "motorNotes": null
  },
  {
    "id": "ham_lying_curl",
    "name": "Curl femoral tumbado",
    "block": "Isquios",
    "family": "Flexión rodilla",
    "movementPattern": "Flexión rodilla",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "equipment": "Máquina",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Isquios",
    "secondaryMuscles": [],
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
    "substitutionFamily": "Flexión rodilla",
    "motorNotes": null
  },
  {
    "id": "ham_single_curl",
    "name": "Curl femoral unilateral/de pie",
    "block": "Isquios",
    "family": "Flexión rodilla",
    "movementPattern": "Flexión rodilla",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "equipment": "Máquina/polea específica",
    "equipmentOptions": [
      [
        "maquina"
      ],
      [
        "polea"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Unilateral",
    "primaryMuscle": "Isquios",
    "secondaryMuscles": [],
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
    "executionTimeCost": "Alto",
    "densitySuitability": "Media-Alta",
    "substitutionFamily": "Flexión rodilla",
    "motorNotes": null
  },
  {
    "id": "ham_nordic",
    "name": "Nordic curl",
    "block": "Isquios",
    "family": "Flexión rodilla",
    "movementPattern": "Flexión rodilla",
    "compatibleRoles": [
      "Complementario"
    ],
    "equipment": "Peso corporal/asistencia",
    "equipmentOptions": [
      []
    ],
    "loadSource": "Corporal+asistido",
    "laterality": "Bilateral",
    "primaryMuscle": "Isquios",
    "secondaryMuscles": [],
    "accessibility": "Baja-Media",
    "strengthRequirement": "Alta",
    "scalability": "Alta",
    "stability": "Media",
    "localFatigue": "Alta",
    "systemicDemand": "Media",
    "progressionSuitability": "Media",
    "nearFailureSuitability": "Baja-Media",
    "repSpec": {
      "min": 3,
      "max": 10,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "3-10"
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
    "substitutionFamily": "Flexión rodilla",
    "motorNotes": "Repertorio ampliado; usar asistencia/regresión según capacidad."
  },
  {
    "id": "ham_ghr",
    "name": "Glute Ham Raise / GHD",
    "block": "Isquios",
    "family": "Flexión rodilla + extensión cadera",
    "movementPattern": "Mixto",
    "compatibleRoles": [
      "Complementario"
    ],
    "equipment": "GHD",
    "equipmentOptions": [
      [
        "ghd"
      ]
    ],
    "loadSource": "Corporal+opcional",
    "laterality": "Bilateral",
    "primaryMuscle": "Isquios/glúteos",
    "secondaryMuscles": [
      {
        "muscle": "Erectores estabilizan",
        "coefficient": 0
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Alta",
    "scalability": "Media-Alta",
    "stability": "Media",
    "localFatigue": "Alta",
    "systemicDemand": "Media",
    "progressionSuitability": "Media",
    "nearFailureSuitability": "Baja-Media",
    "repSpec": {
      "min": 5,
      "max": 15,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "5-15"
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
    "substitutionFamily": "Isquios mixto",
    "motorNotes": "Solo elegible con GHD y capacidad suficiente."
  },
  {
    "id": "ham_45_extension",
    "name": "Extensión 45° de cadera",
    "block": "Isquios",
    "family": "Extensión cadera/tronco",
    "movementPattern": "Bisagra/extensión",
    "compatibleRoles": [
      "Complementario"
    ],
    "equipment": "Banco 45°",
    "equipmentOptions": [
      [
        "banco"
      ]
    ],
    "loadSource": "Corporal+opcional",
    "laterality": "Bilateral",
    "primaryMuscle": "Glúteos/isquios",
    "secondaryMuscles": [
      {
        "muscle": "Erectores",
        "coefficient": 0
      }
    ],
    "accessibility": "Media-Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Media-Alta",
    "localFatigue": "Media",
    "systemicDemand": "Baja-Media",
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
    "setupCost": "Medio",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Media-Alta",
    "substitutionFamily": "Extensión cadera/tronco",
    "motorNotes": "La técnica puede orientar el trabajo relativamente hacia cadera/glúteo; evitar vender aislamiento."
  },
  {
    "id": "glute_hipthrust",
    "name": "Hip thrust",
    "block": "Glúteos",
    "family": "Extensión cadera",
    "movementPattern": "Extensión cadera",
    "compatibleRoles": [
      "Principal"
    ],
    "equipment": "Smith/máquina/barra/mancuerna+banco",
    "equipmentOptions": [
      [
        "smith"
      ],
      [
        "maquina"
      ],
      [
        "barra"
      ],
      [
        "mancuernas",
        "banco"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Glúteos",
    "secondaryMuscles": [
      {
        "muscle": "Isquios secundarios",
        "coefficient": 0
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
    "executionTimeCost": "Medio",
    "densitySuitability": "Media-Alta",
    "substitutionFamily": "Extensión cadera",
    "motorNotes": "Smith preferente cuando encaje; máquina/barra/DB son implementaciones. Estabilidad del programa prevalece si otra variante funciona."
  },
  {
    "id": "glute_single_hipthrust",
    "name": "Hip thrust unilateral",
    "block": "Glúteos",
    "family": "Extensión cadera unilateral",
    "movementPattern": "Extensión cadera",
    "compatibleRoles": [
      "Complementario"
    ],
    "equipment": "Banco+carga opcional",
    "equipmentOptions": [
      [
        "banco"
      ]
    ],
    "loadSource": "Corporal+opcional",
    "laterality": "Unilateral",
    "primaryMuscle": "Glúteos",
    "secondaryMuscles": [
      {
        "muscle": "Isquios secundarios",
        "coefficient": 0
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Media",
    "scalability": "Alta",
    "stability": "Media",
    "localFatigue": "Media",
    "systemicDemand": "Baja-Media",
    "progressionSuitability": "Media-Alta",
    "nearFailureSuitability": "Media-Alta",
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
    "executionTimeCost": "Alto",
    "densitySuitability": "Media",
    "substitutionFamily": "Extensión cadera unilateral",
    "motorNotes": "Ficha propia por unilateralidad y coste temporal."
  },
  {
    "id": "glute_bridge",
    "name": "Puente de glúteos",
    "block": "Glúteos",
    "family": "Extensión cadera",
    "movementPattern": "Extensión cadera",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
    "equipment": "Peso corporal/banda/carga",
    "equipmentOptions": [
      [],
      [
        "banda"
      ],
      [
        "mancuernas"
      ]
    ],
    "loadSource": "Corporal+opcional",
    "laterality": "Bilateral",
    "primaryMuscle": "Glúteos",
    "secondaryMuscles": [
      {
        "muscle": "Isquios secundarios",
        "coefficient": 0
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
      "max": 30,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": false,
      "raw": "10-30"
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
    "setupCost": "Mínimo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Extensión cadera",
    "motorNotes": "Banda/carga son variantes; unilateral puede usarse como progresión/configuración."
  },
  {
    "id": "glute_frog_pump",
    "name": "Frog pump",
    "block": "Glúteos",
    "family": "Extensión cadera",
    "movementPattern": "Extensión cadera",
    "compatibleRoles": [
      "Complementario"
    ],
    "equipment": "Peso corporal/carga/Smith compatible",
    "equipmentOptions": [
      [],
      [
        "mancuernas"
      ],
      [
        "smith"
      ]
    ],
    "loadSource": "Corporal+opcional",
    "laterality": "Bilateral",
    "primaryMuscle": "Glúteos",
    "secondaryMuscles": [],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Baja-Media",
    "systemicDemand": "Baja",
    "progressionSuitability": "Media",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 15,
      "max": 30,
      "unit": "reps",
      "perSide": false,
      "byCapacity": false,
      "openEnded": true,
      "raw": "15-30+"
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
    "substitutionFamily": "Extensión cadera complementaria",
    "motorNotes": "Recurso complementario; no equivalente a un patrón principal."
  },
  {
    "id": "glute_kickback",
    "name": "Patada de glúteo",
    "block": "Glúteos",
    "family": "Extensión cadera",
    "movementPattern": "Extensión cadera",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
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
    "laterality": "Unilateral",
    "primaryMuscle": "Glúteos",
    "secondaryMuscles": [],
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
      "max": 20,
      "unit": "reps",
      "perSide": true,
      "byCapacity": false,
      "openEnded": false,
      "raw": "10-20/lado"
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
    "executionTimeCost": "Alto",
    "densitySuitability": "Media-Alta",
    "substitutionFamily": "Extensión cadera aislada",
    "motorNotes": "Patada de burro corporal/banda puede vivir como variante de contexto."
  },
  {
    "id": "glute_abduction_machine",
    "name": "Abducción máquina",
    "block": "Glúteos",
    "family": "Abducción cadera",
    "movementPattern": "Abducción",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "equipment": "Máquina",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Glúteo medio/min",
    "secondaryMuscles": [],
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
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Abducción cadera",
    "motorNotes": null
  },
  {
    "id": "glute_abduction_cable",
    "name": "Abducción polea",
    "block": "Glúteos",
    "family": "Abducción cadera",
    "movementPattern": "Abducción",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "equipment": "Polea",
    "equipmentOptions": [
      [
        "polea"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Unilateral",
    "primaryMuscle": "Glúteo medio/min",
    "secondaryMuscles": [],
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
      "perSide": true,
      "byCapacity": false,
      "openEnded": false,
      "raw": "10-25/lado"
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
    "executionTimeCost": "Alto",
    "densitySuitability": "Media-Alta",
    "substitutionFamily": "Abducción cadera",
    "motorNotes": null
  },
  {
    "id": "glute_lateral_band_walk",
    "name": "Caminata lateral minibanda",
    "block": "Glúteos",
    "family": "Abducción/estabilidad cadera",
    "movementPattern": "Desplazamiento lateral",
    "compatibleRoles": [
      "Complementario"
    ],
    "equipment": "Minibanda",
    "equipmentOptions": [
      [
        "banda"
      ]
    ],
    "loadSource": "Banda",
    "laterality": "Bilateral/alterno",
    "primaryMuscle": "Glúteo medio/min",
    "secondaryMuscles": [],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Media",
    "stability": "Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Baja-Media",
    "nearFailureSuitability": "Media-Alta",
    "repSpec": {
      "min": 10,
      "max": 30,
      "unit": "steps",
      "perSide": true,
      "byCapacity": false,
      "openEnded": false,
      "raw": "10-30 pasos/lado"
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
    "substitutionFamily": "Abducción cadera",
    "motorNotes": "Útil por contexto/bajo coste; no compite automáticamente con máquina/polea para progresión."
  },
  {
    "id": "glute_clamshell",
    "name": "Clamshell",
    "block": "Glúteos",
    "family": "Abducción/rotación cadera",
    "movementPattern": "Abducción",
    "compatibleRoles": [
      "Complementario"
    ],
    "equipment": "Peso corporal/minibanda",
    "equipmentOptions": [
      [],
      [
        "banda"
      ]
    ],
    "loadSource": "Corporal/banda",
    "laterality": "Unilateral",
    "primaryMuscle": "Glúteo medio/min",
    "secondaryMuscles": [],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Media",
    "stability": "Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Baja",
    "nearFailureSuitability": "Media-Alta",
    "repSpec": {
      "min": 12,
      "max": 30,
      "unit": "reps",
      "perSide": true,
      "byCapacity": false,
      "openEnded": false,
      "raw": "12-30/lado"
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
    "executionTimeCost": "Alto",
    "densitySuitability": "Media-Alta",
    "substitutionFamily": "Abducción cadera",
    "motorNotes": "Complementario/contextual."
  },
  {
    "id": "glute_fire_hydrant",
    "name": "Hidrante",
    "block": "Glúteos",
    "family": "Abducción cadera",
    "movementPattern": "Abducción",
    "compatibleRoles": [
      "Complementario"
    ],
    "equipment": "Peso corporal/banda",
    "equipmentOptions": [
      [],
      [
        "banda"
      ]
    ],
    "loadSource": "Corporal/banda",
    "laterality": "Unilateral",
    "primaryMuscle": "Glúteo medio/min",
    "secondaryMuscles": [
      {
        "muscle": "Core estabiliza",
        "coefficient": 0
      }
    ],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Media",
    "stability": "Media-Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Baja",
    "nearFailureSuitability": "Media-Alta",
    "repSpec": {
      "min": 12,
      "max": 30,
      "unit": "reps",
      "perSide": true,
      "byCapacity": false,
      "openEnded": false,
      "raw": "12-30/lado"
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
    "executionTimeCost": "Alto",
    "densitySuitability": "Media",
    "substitutionFamily": "Abducción cadera",
    "motorNotes": "Complementario/contextual."
  },
  {
    "id": "glute_side_lying_abduction",
    "name": "Elevación lateral tumbado",
    "block": "Glúteos",
    "family": "Abducción cadera",
    "movementPattern": "Abducción",
    "compatibleRoles": [
      "Complementario"
    ],
    "equipment": "Peso corporal/banda",
    "equipmentOptions": [
      [],
      [
        "banda"
      ]
    ],
    "loadSource": "Corporal/banda",
    "laterality": "Unilateral",
    "primaryMuscle": "Glúteo medio/min",
    "secondaryMuscles": [],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Media",
    "stability": "Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Baja",
    "nearFailureSuitability": "Media-Alta",
    "repSpec": {
      "min": 12,
      "max": 30,
      "unit": "reps",
      "perSide": true,
      "byCapacity": false,
      "openEnded": false,
      "raw": "12-30/lado"
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
    "executionTimeCost": "Alto",
    "densitySuitability": "Media-Alta",
    "substitutionFamily": "Abducción cadera",
    "motorNotes": "Complementario/contextual."
  },
  {
    "id": "adductor_machine",
    "name": "Aductor máquina",
    "block": "Aductores",
    "family": "Aducción cadera",
    "movementPattern": "Aducción",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "equipment": "Máquina",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Aductores",
    "secondaryMuscles": [],
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
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Aducción cadera",
    "motorNotes": "El trabajo indirecto en sentadillas/prensa no equivale automáticamente a trabajo directo."
  },
  {
    "id": "adductor_cable",
    "name": "Aducción polea",
    "block": "Aductores",
    "family": "Aducción cadera",
    "movementPattern": "Aducción",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "equipment": "Polea",
    "equipmentOptions": [
      [
        "polea"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Unilateral",
    "primaryMuscle": "Aductores",
    "secondaryMuscles": [],
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
      "perSide": true,
      "byCapacity": false,
      "openEnded": false,
      "raw": "10-25/lado"
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
    "executionTimeCost": "Alto",
    "densitySuitability": "Media-Alta",
    "substitutionFamily": "Aducción cadera",
    "motorNotes": null
  },
  {
    "id": "calf_standing",
    "name": "Elevación de talones de pie",
    "block": "Gemelos",
    "family": "Flexión plantar rodilla extendida",
    "movementPattern": "Flexión plantar",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "equipment": "Smith/máquina/mancuernas",
    "equipmentOptions": [
      [
        "smith"
      ],
      [
        "maquina"
      ],
      [
        "mancuernas"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Gastrocnemio/sóleo",
    "secondaryMuscles": [
      {
        "muscle": "Rodilla extendida permite alta contribución del gastrocnemio",
        "coefficient": 0
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
    "substitutionFamily": "Flexión plantar extendida",
    "motorNotes": "Smith puede ser implementación preferente por estabilidad; usar rango cómodo y controlado."
  },
  {
    "id": "calf_seated",
    "name": "Elevación de talones sentado",
    "block": "Gemelos",
    "family": "Flexión plantar rodilla flexionada",
    "movementPattern": "Flexión plantar",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "equipment": "Máquina/carga sobre rodillas",
    "equipmentOptions": [
      [
        "maquina"
      ],
      [
        "mancuernas"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Sóleo",
    "secondaryMuscles": [
      {
        "muscle": "Gastrocnemio con menor contribución relativa",
        "coefficient": 0
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
    "setupCost": "Bajo",
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Flexión plantar flexionada",
    "motorNotes": "Rodilla flexionada cambia la contribución relativa; no es checklist obligatoria."
  },
  {
    "id": "calf_legpress",
    "name": "Elevación de talones en prensa",
    "block": "Gemelos",
    "family": "Flexión plantar rodilla extendida",
    "movementPattern": "Flexión plantar",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "equipment": "Prensa",
    "equipmentOptions": [
      [
        "prensa"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Gastrocnemio/sóleo",
    "secondaryMuscles": [],
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
    "executionTimeCost": "Bajo",
    "densitySuitability": "Alta",
    "substitutionFamily": "Flexión plantar extendida",
    "motorNotes": "Ficha propia por setup y contexto de máquina."
  },
  {
    "id": "calf_single_standing",
    "name": "Elevación de talón unilateral de pie",
    "block": "Gemelos",
    "family": "Flexión plantar unilateral",
    "movementPattern": "Flexión plantar",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "equipment": "Peso corporal/mancuerna/máquina compatible",
    "equipmentOptions": [
      [],
      [
        "mancuernas"
      ],
      [
        "maquina"
      ]
    ],
    "loadSource": "Corporal+opcional",
    "laterality": "Unilateral",
    "primaryMuscle": "Gastrocnemio/sóleo",
    "secondaryMuscles": [],
    "accessibility": "Alta",
    "strengthRequirement": "Baja-Media",
    "scalability": "Alta",
    "stability": "Media-Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Media-Alta",
    "nearFailureSuitability": "Alta",
    "repSpec": {
      "min": 8,
      "max": 25,
      "unit": "reps",
      "perSide": true,
      "byCapacity": false,
      "openEnded": false,
      "raw": "8-25/lado"
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
    "densitySuitability": "Media-Alta",
    "substitutionFamily": "Flexión plantar unilateral",
    "motorNotes": "Útil para carga unilateral; evitar convertir orientación de puntas en selector regional."
  },
  {
    "id": "forearm_reverse_curl",
    "name": "Curl inverso",
    "block": "Antebrazo",
    "family": "Flexión codo pronada",
    "movementPattern": "Flexión codo",
    "compatibleRoles": [
      "Complementario",
      "Aislamiento"
    ],
    "equipment": "Barra/EZ/polea",
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
    "primaryMuscle": "Braquiorradial/extensores",
    "secondaryMuscles": [
      {
        "muscle": "Bíceps secundario",
        "coefficient": 0
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
    "substitutionFamily": "Antebrazo",
    "motorNotes": null
  },
  {
    "id": "forearm_wrist_curl",
    "name": "Curl muñeca",
    "block": "Antebrazo",
    "family": "Flexión muñeca",
    "movementPattern": "Flexión muñeca",
    "compatibleRoles": [
      "Aislamiento"
    ],
    "equipment": "Mancuerna/barra/polea",
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
    "primaryMuscle": "Flexores antebrazo",
    "secondaryMuscles": [],
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
    "motorNotes": null
  },
  {
    "id": "forearm_wrist_extension",
    "name": "Extensión muñeca",
    "block": "Antebrazo",
    "family": "Extensión muñeca",
    "movementPattern": "Extensión muñeca",
    "compatibleRoles": [
      "Aislamiento"
    ],
    "equipment": "Mancuerna/barra/polea",
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
    "primaryMuscle": "Extensores antebrazo",
    "secondaryMuscles": [],
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
    "motorNotes": null
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
    "equipment": "Máquina",
    "equipmentOptions": [
      [
        "maquina"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Recto abdominal",
    "secondaryMuscles": [],
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
    "motorNotes": null
  },
  {
    "id": "core_cable_crunch",
    "name": "Crunch en polea alta con cuerda",
    "block": "Core",
    "family": "Flexión tronco",
    "movementPattern": "Flexión tronco",
    "compatibleRoles": [
      "Complementario"
    ],
    "equipment": "Polea",
    "equipmentOptions": [
      [
        "polea"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Recto abdominal",
    "secondaryMuscles": [],
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
    "motorNotes": null
  },
  {
    "id": "core_floor_crunch",
    "name": "Crunch",
    "block": "Core",
    "family": "Flexión tronco",
    "movementPattern": "Flexión tronco",
    "compatibleRoles": [
      "Complementario"
    ],
    "equipment": "Peso corporal",
    "equipmentOptions": [
      []
    ],
    "loadSource": "Corporal",
    "laterality": "Bilateral",
    "primaryMuscle": "Recto abdominal",
    "secondaryMuscles": [],
    "accessibility": "Alta",
    "strengthRequirement": "Baja",
    "scalability": "Media",
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
    "motorNotes": null
  },
  {
    "id": "core_leg_raise",
    "name": "Elevación de piernas",
    "block": "Core",
    "family": "Control pelvis/elevación",
    "movementPattern": "Elevación piernas",
    "compatibleRoles": [
      "Complementario"
    ],
    "equipment": "Peso corporal",
    "equipmentOptions": [
      []
    ],
    "loadSource": "Corporal",
    "laterality": "Bilateral",
    "primaryMuscle": "Core",
    "secondaryMuscles": [
      {
        "muscle": "Flexores cadera",
        "coefficient": 0
      }
    ],
    "accessibility": "Media",
    "strengthRequirement": "Media",
    "scalability": "Alta",
    "stability": "Media",
    "localFatigue": "Media",
    "systemicDemand": "Baja-Media",
    "progressionSuitability": "Media",
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
    "densitySuitability": "Media-Alta",
    "substitutionFamily": "Elevación piernas/core",
    "motorNotes": "Elevación de piernas como ficha base; controlar pelvis y participación de flexores de cadera. Encogimiento de rodillas se separa como regresión/ejercicio Motor por demanda distinta."
  },
  {
    "id": "core_plank",
    "name": "Plancha",
    "block": "Core",
    "family": "Anti-extensión",
    "movementPattern": "Estabilidad",
    "compatibleRoles": [
      "Estabilidad",
      "Control"
    ],
    "equipment": "Peso corporal",
    "equipmentOptions": [
      []
    ],
    "loadSource": "Corporal",
    "laterality": "Bilateral",
    "primaryMuscle": "Core anterior",
    "secondaryMuscles": [],
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
    "motorNotes": "Progresar dificultad, no solo tiempo"
  },
  {
    "id": "core_side_plank",
    "name": "Plancha lateral",
    "block": "Core",
    "family": "Estabilidad lateral",
    "movementPattern": "Estabilidad",
    "compatibleRoles": [
      "Estabilidad",
      "Control"
    ],
    "equipment": "Peso corporal",
    "equipmentOptions": [
      []
    ],
    "loadSource": "Corporal",
    "laterality": "Unilateral",
    "primaryMuscle": "Core lateral",
    "secondaryMuscles": [],
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
    "substitutionFamily": "Estabilidad lateral",
    "motorNotes": null
  },
  {
    "id": "core_deadbug",
    "name": "Dead bug",
    "block": "Core",
    "family": "Anti-extensión/control",
    "movementPattern": "Estabilidad",
    "compatibleRoles": [
      "Estabilidad",
      "Control"
    ],
    "equipment": "Peso corporal",
    "equipmentOptions": [
      []
    ],
    "loadSource": "Corporal",
    "laterality": "Contralateral",
    "primaryMuscle": "Core",
    "secondaryMuscles": [],
    "accessibility": "Media",
    "strengthRequirement": "Baja",
    "scalability": "Alta",
    "stability": "Alta",
    "localFatigue": "Baja",
    "systemicDemand": "Baja",
    "progressionSuitability": "Media",
    "nearFailureSuitability": "No prioritario",
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
    "substitutionFamily": "Anti-extensión/control",
    "motorNotes": "No orientar a fallo"
  },
  {
    "id": "core_pallof",
    "name": "Pallof press",
    "block": "Core",
    "family": "Anti-rotación",
    "movementPattern": "Estabilidad",
    "compatibleRoles": [
      "Estabilidad",
      "Control"
    ],
    "equipment": "Polea/banda segura",
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
    "primaryMuscle": "Core",
    "secondaryMuscles": [],
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
    "motorNotes": "No inventar anclajes"
  },
  {
    "id": "back_supinated_pulldown",
    "name": "Jalón supino",
    "block": "Espalda",
    "family": "Tirón vertical",
    "movementPattern": "Tirón vertical",
    "compatibleRoles": [
      "Principal",
      "Complementario"
    ],
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
    "secondaryMuscles": [
      {
        "muscle": "Bíceps",
        "coefficient": 0.5
      },
      {
        "muscle": "mayor solapamiento con flexores de codo",
        "coefficient": 0
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
    "motorNotes": "Agarre supino es información útil para contexto espalda+bíceps; no implica superioridad."
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
    "equipment": "Polea",
    "equipmentOptions": [
      [
        "polea"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Unilateral",
    "primaryMuscle": "Dorsal",
    "secondaryMuscles": [
      {
        "muscle": "Bíceps",
        "coefficient": 0.5
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
    "id": "back_neutral_pullup",
    "name": "Dominadas neutras",
    "block": "Espalda",
    "family": "Tirón vertical",
    "movementPattern": "Tirón vertical",
    "compatibleRoles": [
      "Principal"
    ],
    "equipment": "Barra agarre neutro",
    "equipmentOptions": [
      [
        "dominadas"
      ]
    ],
    "loadSource": "Corporal+opcional",
    "laterality": "Bilateral",
    "primaryMuscle": "Dorsal/general",
    "secondaryMuscles": [
      {
        "muscle": "Bíceps",
        "coefficient": 0.5
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
    "motorNotes": "Aplicar misma lógica de capacidad/regresión que en dominadas base."
  },
  {
    "id": "back_chinup",
    "name": "Dominadas supinas",
    "block": "Espalda",
    "family": "Tirón vertical",
    "movementPattern": "Tirón vertical",
    "compatibleRoles": [
      "Principal"
    ],
    "equipment": "Barra dominadas",
    "equipmentOptions": [
      [
        "dominadas"
      ]
    ],
    "loadSource": "Corporal+opcional",
    "laterality": "Bilateral",
    "primaryMuscle": "Dorsal",
    "secondaryMuscles": [
      {
        "muscle": "Bíceps",
        "coefficient": 0.5
      },
      {
        "muscle": "mayor solapamiento con flexores de codo",
        "coefficient": 0
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
    "motorNotes": "Controlar solapamiento con trabajo directo de bíceps; no prohibirlo."
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
    "equipment": "Smith/multipower",
    "equipmentOptions": [
      [
        "smith"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Espalda media/dorsal",
    "secondaryMuscles": [
      {
        "muscle": "Bíceps",
        "coefficient": 0.5
      },
      {
        "muscle": "erectores estabilizan",
        "coefficient": 0
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
    "motorNotes": "Trayectoria guiada: más estabilidad que barra libre; no es ejercicio exclusivo de principiantes."
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
    "equipment": "Mancuernas",
    "equipmentOptions": [
      [
        "mancuernas"
      ]
    ],
    "loadSource": "Externa",
    "laterality": "Bilateral",
    "primaryMuscle": "Espalda media/dorsal",
    "secondaryMuscles": [
      {
        "muscle": "Bíceps",
        "coefficient": 0.5
      },
      {
        "muscle": "erectores estabilizan",
        "coefficient": 0
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
  }
];

export const VARIANTS: LibraryVariant[] = [
  {
    "baseId": "biceps_db_curl",
    "name": "Curl alterno",
    "type": "Ejecución",
    "changes": "Alternancia y coste temporal",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "back_lat_pulldown",
    "name": "Agarre neutro/estrecho",
    "type": "Agarre/configuración",
    "changes": "Preferencia, comodidad y trayectoria",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "biceps_bar_curl",
    "name": "Barra recta / barra EZ",
    "type": "Implemento/configuración",
    "changes": "Comodidad y agarre",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "triceps_pushdown",
    "name": "Cuerda / barra recta / barra V",
    "type": "Accesorio/configuración",
    "changes": "Cambia agarre y ejecución sin cambiar función Motor principal",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "back_lat_pulldown",
    "name": "Agarre prono ancho",
    "type": "Agarre/configuración",
    "changes": "Cambia ROM, comodidad y trayectoria, pero no la función Motor principal",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "back_barbell_row",
    "name": "Agarre supino",
    "type": "Agarre/configuración",
    "changes": "Cambia participación relativa de flexores de codo, pero por ahora no justifica ficha propia",
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
    "name": "Máquina / banda",
    "type": "Método de asistencia",
    "changes": "Cambia implementación de la regresión, no su función Motor",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "shoulder_cable_lateral",
    "name": "Cable desde detrás / lateral / ligeramente delante",
    "type": "Posición/configuración",
    "changes": "Modifica perfil de resistencia y comodidad sin cambiar función Motor principal",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "shoulder_db_lateral",
    "name": "Inclinada / apoyada",
    "type": "Posición/configuración",
    "changes": "Modifica perfil y estabilidad sin justificar una nueva función Motor",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "biceps_cable",
    "name": "Cuerda / barra recta / barra EZ",
    "type": "Accesorio/configuración",
    "changes": "Cambia agarre y comodidad sin cambiar la función Motor principal",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "biceps_hammer",
    "name": "Mancuernas / cuerda en polea",
    "type": "Implemento/configuración",
    "changes": "Mantiene agarre neutro y función principal; el implemento puede cambiar perfil/setup",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "biceps_preacher",
    "name": "Barra recta / EZ",
    "type": "Implemento/configuración",
    "changes": "Cambia comodidad de muñeca/agarre, no la función Motor",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "biceps_preacher",
    "name": "Unilateral con mancuerna",
    "type": "Ejecución/configuración",
    "changes": "Añade unilateralidad y coste temporal, pero por ahora no justifica ficha Motor propia",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "triceps_pushdown",
    "name": "Agarre inverso/supinado",
    "type": "Agarre/configuración",
    "changes": "Cambia comodidad y orientación del agarre, no justifica ficha propia",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "triceps_overhead_cable",
    "name": "Cuerda / barra / unilateral",
    "type": "Accesorio/configuración",
    "changes": "Mantiene trabajo overhead; unilateralidad puede aumentar coste temporal pero no requiere ficha inicial",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "triceps_dip",
    "name": "Asistidos / peso corporal / lastrados",
    "type": "Método de carga/progresión",
    "changes": "Escala la capacidad manteniendo el patrón principal",
    "rule": "LIB-LOAD-001"
  },
  {
    "baseId": "core_floor_crunch",
    "name": "Crunch con brazos estirados",
    "type": "Palanca/progresión",
    "changes": "Aumenta el brazo de momento y la dificultad sin cambiar la función Motor principal",
    "rule": "LIB-VARIANT-001"
  },
  {
    "baseId": "quad_squat",
    "name": "Smith / barra libre",
    "type": "Implementación/equipamiento",
    "changes": "Estabilidad, setup y habilidad específica; Smith puede priorizarse en hipertrofia",
    "rule": "LIB-EQUIPVAR-003 / MOTOR-STABILITY-015"
  },
  {
    "baseId": "quad_legpress",
    "name": "Pies relativamente bajos / altos / anchura cómoda",
    "type": "Técnica/sesgo",
    "changes": "Modifica demanda relativa de rodilla/cadera y participación muscular sin aislar regiones",
    "rule": "MOTOR-TECHBIAS-028"
  },
  {
    "baseId": "quad_single_legpress",
    "name": "Pies relativamente bajos / altos / anchura cómoda",
    "type": "Técnica/sesgo",
    "changes": "Mismo criterio de sesgo relativo que prensa bilateral",
    "rule": "MOTOR-TECHBIAS-028"
  },
  {
    "baseId": "leg_bulgarian",
    "name": "Smith / mancuernas / barra / peso corporal",
    "type": "Implementación/equipamiento",
    "changes": "Estabilidad, carga, setup y progresión; Smith preferente cuando encaje",
    "rule": "LIB-EQUIPVAR-003"
  },
  {
    "baseId": "leg_bulgarian",
    "name": "Paso/tronco/profundidad ajustados",
    "type": "Técnica/sesgo",
    "changes": "Modifica énfasis relativo rodilla/cadera sin convertirlo en aislamiento",
    "rule": "MOTOR-TECHBIAS-028"
  },
  {
    "baseId": "ham_rdl",
    "name": "Smith / barra / mancuernas",
    "type": "Implementación/equipamiento",
    "changes": "Estabilidad, setup y carga; misma función Motor principal",
    "rule": "LIB-EQUIPVAR-003"
  },
  {
    "baseId": "ham_good_morning",
    "name": "Barra / Smith",
    "type": "Implementación/equipamiento",
    "changes": "Estabilidad y trayectoria guiada; misma función Motor",
    "rule": "LIB-EQUIPVAR-003"
  },
  {
    "baseId": "glute_hipthrust",
    "name": "Smith / máquina / barra / mancuerna",
    "type": "Implementación/equipamiento",
    "changes": "Estabilidad, setup y carga; Smith puede priorizarse cuando encaje",
    "rule": "LIB-EQUIPVAR-003"
  },
  {
    "baseId": "glute_bridge",
    "name": "Peso corporal / banda / carga externa / unilateral",
    "type": "Carga/progresión",
    "changes": "Escala dificultad y contexto manteniendo función principal",
    "rule": "LIB-LOAD-001"
  },
  {
    "baseId": "glute_kickback",
    "name": "Polea / máquina / corporal-banda tipo patada de burro",
    "type": "Implementación/contexto",
    "changes": "Cambia carga y progresabilidad sin cambiar función principal",
    "rule": "LIB-EQUIPVAR-003"
  },
  {
    "baseId": "calf_standing",
    "name": "Smith / máquina / mancuernas",
    "type": "Implementación/equipamiento",
    "changes": "Estabilidad y carga; rodilla permanece extendida",
    "rule": "LIB-EQUIPVAR-003"
  },
  {
    "baseId": "calf_standing",
    "name": "Orientación natural/cómoda del pie",
    "type": "Técnica",
    "changes": "No usar puntas dentro/fuera como selector regional preciso",
    "rule": "MOTOR-TECHBIAS-028"
  }
];

/** Metadatos de importación. `warnings` = contradicciones del Excel a revisar con producto. */
export const LIBRARY_META = {
  "version": "1.8",
  "sourceFile": "FIT-K_Biblioteca_InteligenteMOTOR.xlsx",
  "sheetRows": 147,
  "uniqueExercises": 102,
  "variants": 30,
  "warnings": [
    "45 filas duplicadas idénticas ignoradas (filas 104-148). La hoja tiene 147 filas pero solo 102 fichas únicas.",
    "Variante \"Trayectoria hacia cadera\" (fila 7) apunta a \"back_onearm_cable_row\", que no existe en la Biblioteca -> ignorada",
    "Variante \"Alterna / agarre neutro / dos manos con una mancuerna\" (fila 13) apunta a \"shoulder_db_front_raise\", que no existe en la Biblioteca -> ignorada",
    "Variante \"Polea baja / agarre neutro\" (fila 14) apunta a \"shoulder_cable_front_raise\", que no existe en la Biblioteca -> ignorada",
    "Variante \"Barra recta / EZ\" (fila 19) apunta a \"biceps_spider_bar_curl\", que no existe en la Biblioteca -> ignorada",
    "Variante \"Agarre pronado / neutro / supinado\" (fila 21) apunta a \"triceps_onearm_cable_extension\", que no existe en la Biblioteca -> ignorada",
    "La hoja Resumen declara 147 ejercicios base, pero hay 102 fichas únicas."
  ]
} as const;

export const libraryById = new Map(LIBRARY.map(e => [e.id, e]));
export const variantsFor = (id: string) => VARIANTS.filter(v => v.baseId === id);

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
  return `LISTA OFICIAL DE EJERCICIOS — BIBLIOTECA FIT-K v${LIBRARY_META.version} (obligatoria, ${LIBRARY.length} ejercicios):\n${lines}\nREGLA: Al crear entrenamientos o proponer/sustituir ejercicios de gimnasio, usa EXCLUSIVAMENTE ejercicios de esta lista, con estos nombres exactos. Si el usuario menciona un ejercicio que no está, sugiere el equivalente más cercano de la lista.`;
}
