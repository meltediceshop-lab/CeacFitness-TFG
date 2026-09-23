// ─────────────────────────────────────────────────────────────────────
// Safety Flow Fit-K v1.0 (sección 11 de la Especificación de
// Implementación). SAFE-001 🔒: la molestia gana a cualquier
// optimización, prioridad, scoring o densidad.
//
// Pasos del flujo (deterministas, sin LLM):
//  1. Finalizar/cancelar ese ejercicio.
//  2. Mensaje breve y prudente (sin diagnosticar).
//  3. No bajar carga automáticamente, no sustituir en cadena.
//  4. Permitir continuar el resto de la sesión con normalidad.
//  5. Registrar ejercicio + evento de molestia + incompleto.
//  6. Ofrecer exclusión temporal + revisión posterior.
// ─────────────────────────────────────────────────────────────────────
import type { Exercise } from '@/types/user';

export interface SafetyEventPayload {
  exerciseId: string;
  exerciseName: string;
  workoutSessionId?: string;
  eventType: 'discomfort';
  temporaryExclusion: boolean;
}

export interface DiscomfortResult {
  message: string;
  event: SafetyEventPayload;
}

const PRUDENT_MESSAGE =
  'Mejor no sigas con este ejercicio ahora. Si la molestia persiste, empeora o te preocupa, consulta a un profesional sanitario. Puedes continuar con el resto de la sesión con normalidad.';

// SAFE-006 🔒 — Un evento de molestia no equivale a diagnóstico de lesión.
export function handleDiscomfort(exercise: Exercise, workoutSessionId?: string): DiscomfortResult {
  return {
    message: PRUDENT_MESSAGE,
    event: {
      exerciseId: exercise.libraryId ?? exercise.id,
      exerciseName: exercise.name,
      workoutSessionId,
      eventType: 'discomfort',
      temporaryExclusion: true,
    },
  };
}
