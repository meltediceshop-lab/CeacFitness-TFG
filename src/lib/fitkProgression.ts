// ─────────────────────────────────────────────────────────────────────
// Progresión, estancamiento y retorno — Motor Fit-K v1.8
// Hoja "Motor Progresión" + FIT-K_Instrucciones sec. 12-13.
//
// Funciones puras: leen el historial de UN ejercicio y devuelven el estado
// y la acción mínima (jerarquía Ajuste → Sustitución → Reprogramación,
// MOTOR-CHANGE-035). El RIR es una señal útil pero imperfecta: nunca es la
// única fuente de decisión.
// ─────────────────────────────────────────────────────────────────────

export type ProgressState =
  | 'sin_datos'
  | 'progreso'           // mejora: mantener ejercicio y progresión
  | 'candidato_subida'   // techo del rango con esfuerzo compatible: subir carga
  | 'estable'            // sin mejora pocas sesiones: observar, NO es plateau
  | 'revisar_contexto'   // caída grande o caída + esfuerzo mayor: revisar fatiga/descanso
  | 'plateau';           // patrón persistente confirmado: intervención mínima

export interface ProgressionEntry {
  date: string;
  load: number;          // kg (0 si peso corporal)
  reps: number[];        // reps por serie
  rirReported?: number[];
}

export interface ProgressionTarget {
  repRange: [number, number];
  rirTarget: [number, number];
}

export interface ProgressionResult {
  state: ProgressState;
  action: string;
  rule: string;
  changeLevel: 'ajuste' | 'sustitucion' | null;
}

/** Exposiciones seguidas sin mejora a partir de las cuales SÍ hay plateau (🟡 calibrable). */
export const PLATEAU_EXPOSURES = 4;
/** Caída primera→última serie a partir de la cual hay que revisar contexto (10|7|5). */
export const LARGE_SET_DROP = 5;

const sum = (a: number[]) => a.reduce((s, x) => s + x, 0);
const performance = (e: ProgressionEntry) => (e.load > 0 ? e.load : 1) * sum(e.reps);

export function evaluateProgression(history: ProgressionEntry[], target: ProgressionTarget): ProgressionResult {
  if (history.length === 0) {
    return { state: 'sin_datos', action: 'Calibrar con la primera ejecución', rule: 'MOTOR-PROGRESS-043', changeLevel: null };
  }
  const last = history[history.length - 1];
  const [, hi] = target.repRange;
  const [rirMin] = target.rirTarget;
  const rirLow = last.rirReported?.length ? Math.min(...last.rirReported) : undefined;
  const effortBeyond = rirLow !== undefined && rirLow < rirMin;

  // Techo del rango en todas (o casi todas) las series
  const atTop = last.reps.filter(r => r >= hi).length;
  const allTop = atTop === last.reps.length
    || (last.reps.length >= 3 && atTop >= last.reps.length - 1 && Math.min(...last.reps) >= hi - 1);

  if (allTop) {
    if (effortBeyond) {
      return {
        state: 'estable',
        action: 'No subir todavía: el esfuerzo fue mayor del prescrito (RIR por debajo del objetivo)',
        rule: 'MOTOR-PROGRESS-043', changeLevel: 'ajuste',
      };
    }
    return {
      state: 'candidato_subida',
      action: 'Subir carga razonablemente y volver a la zona baja/media del rango',
      rule: 'MOTOR-PROGRESS-043', changeLevel: 'ajuste',
    };
  }

  const drop = last.reps[0] - last.reps[last.reps.length - 1];
  if (drop >= LARGE_SET_DROP) {
    return {
      state: 'revisar_contexto',
      action: 'Gran caída entre series: revisar primera serie, descansos, carga y fatiga (no cambiar ejercicio)',
      rule: 'MOTOR-PLATEAU-044', changeLevel: 'ajuste',
    };
  }

  if (history.length >= 2) {
    const prev = history[history.length - 2];
    if (performance(last) > performance(prev)) {
      return { state: 'progreso', action: 'Mantener ejercicio y seguir acumulando reps/carga', rule: 'MOTOR-PROGRESS-043', changeLevel: null };
    }
    if (performance(last) < performance(prev) && effortBeyond) {
      return {
        state: 'revisar_contexto',
        action: 'Rendimiento a la baja con esfuerzo mayor: revisar fatiga/recuperación antes de cambiar el ejercicio',
        rule: 'MOTOR-PLATEAU-044', changeLevel: 'ajuste',
      };
    }
  }

  // Exposiciones seguidas sin superar el mejor rendimiento previo
  let stalled = 0;
  let best = -Infinity;
  for (const e of history) {
    const p = performance(e);
    if (p > best) { best = p; stalled = 0; } else { stalled++; }
  }
  if (stalled >= PLATEAU_EXPOSURES) {
    return {
      state: 'plateau',
      action: 'Plateau persistente: ajustar reps/volumen/fatiga; sustituir solo si procede',
      rule: 'MOTOR-PLATEAU-044', changeLevel: 'ajuste',
    };
  }
  if (history.length === 1) {
    return { state: 'progreso', action: 'Primera referencia registrada: mantener y progresar', rule: 'MOTOR-PROGRESS-043', changeLevel: null };
  }
  return {
    state: 'estable',
    action: 'Sin mejora en pocas sesiones: mantener y observar (no es estancamiento)',
    rule: 'MOTOR-PLATEAU-044', changeLevel: null,
  };
}

/** Estados en los que el ejercicio debe mantenerse frente a alternativas (MOTOR-STABILITY-015). */
export const KEEP_STATES: ProgressState[] = ['progreso', 'candidato_subida', 'estable', 'revisar_contexto'];

// ── Retorno tras interrupción (MOTOR-RETURN-046) ─────────────────────
export interface ReturnAdjustment {
  loadFactor: number;  // multiplicador temporal de carga
  setsDelta: number;   // cambio de series en trabajo NO esencial
  note: string;
  rule: 'MOTOR-RETURN-046';
}

/** No reinicia nunca como principiante: solo baja temporalmente carga/dosis. 🟡 calibrable. */
export function returnAdjustment(daysSinceLastSession: number): ReturnAdjustment {
  if (daysSinceLastSession <= 10) return { loadFactor: 1, setsDelta: 0, note: 'Sin ajuste: ausencia corta, sin deuda', rule: 'MOTOR-RETURN-046' };
  if (daysSinceLastSession <= 21) return { loadFactor: 0.9, setsDelta: 0, note: 'Retomar conservador (~1-3 semanas fuera)', rule: 'MOTOR-RETURN-046' };
  if (daysSinceLastSession <= 42) return { loadFactor: 0.8, setsDelta: -1, note: 'Interrupción significativa: reducir carga y dosis temporalmente', rule: 'MOTOR-RETURN-046' };
  return { loadFactor: 0.7, setsDelta: -1, note: 'Interrupción larga: reconstruir progresión sin reiniciar como principiante', rule: 'MOTOR-RETURN-046' };
}
