// ─────────────────────────────────────────────────────────────────────
// Supervisor Fit-K v1.0 (sección 15 de la Especificación Técnica /
// sección 12 de la Especificación de Implementación).
//
// SUPERVISOR-MASTER-001 🔒 Una revisión no es por sí misma razón para
// modificar el plan.
// SUPERVISOR-MASTER-002 🔒 "Todo funciona; seguimos" es un resultado
// válido.
// SAFE-001 🔒 La molestia gana a cualquier optimización, prioridad,
// scoring o densidad — tiene prioridad máxima en la tabla de reglas.
//
// La decisión (qué acción tomar) es determinista, sin LLM. El Coach
// (Groq) solo redacta el mensaje al usuario a partir de la acción y los
// motivos ya decididos aquí — nunca decide él mismo (ARCH-COACH-001).
// ─────────────────────────────────────────────────────────────────────

export type SupervisorAction =
  | 'mantener'
  | 'ajustar_volumen'
  | 'ajustar_intensidad'
  | 'cambiar_ejercicio'
  | 'semana_descarga'
  | 'adaptar_objetivo_disponibilidad';

export interface SupervisorInput {
  attendancePct: number;
  plannedSessions: number;
  goalChanged: boolean;
  availabilityChanged: boolean;
  hasDiscomfort: boolean;
  pendingSafetyEvents: number;
  strength: string;
  energy: string;
  recovery: string;
  sleep: string;
  stress: string;
  motivation: string;
}

export interface SupervisorDecision {
  action: SupervisorAction;
  reasons: string[];
}

// Nivel de preocupación 0 (bien) .. 2 (mal) por respuesta — escalas de ReviewScreen.tsx
const CONCERN: Record<string, Record<string, number>> = {
  strength:   { 'Mucho mejor': 0, 'Algo mejor': 0, 'Igual': 1, 'Peor': 2 },
  energy:     { 'Alta': 0, 'Normal': 0, 'Baja': 1, 'Muy baja': 2 },
  recovery:   { 'Muy bien': 0, 'Bien': 0, 'Normal': 0, 'Mal': 1, 'Muy mal': 2 },
  sleep:      { 'Muy bien': 0, 'Bien': 0, 'Normal': 0, 'Mal': 1, 'Muy mal': 2 },
  stress:     { 'Muy bajo': 0, 'Bajo': 0, 'Normal': 0, 'Alto': 1, 'Muy alto': 2 },
  motivation: { 'Muy motivado': 0, 'Motivado': 0, 'Normal': 0, 'Me está costando': 1, 'Muy desmotivado': 2 },
};
const concern = (field: keyof typeof CONCERN, value: string) => CONCERN[field][value] ?? 0;

export function decideSupervisorAction(input: SupervisorInput): SupervisorDecision {
  const reasons: string[] = [];

  // SAFE-001 🔒 — máxima prioridad, ignora todo lo demás
  if (input.hasDiscomfort || input.pendingSafetyEvents > 0) {
    reasons.push(input.hasDiscomfort ? 'discomfort_reported' : 'pending_safety_event');
    return { action: 'cambiar_ejercicio', reasons };
  }

  if (input.goalChanged || input.availabilityChanged) {
    if (input.goalChanged) reasons.push('goal_changed');
    if (input.availabilityChanged) reasons.push('availability_changed');
    return { action: 'adaptar_objetivo_disponibilidad', reasons };
  }

  const strengthC = concern('strength', input.strength);
  const energyC = concern('energy', input.energy);
  const recoveryC = concern('recovery', input.recovery);
  const sleepC = concern('sleep', input.sleep);
  const stressC = concern('stress', input.stress);
  const motivationC = concern('motivation', input.motivation);

  const lowAttendance = input.plannedSessions >= 4 && input.attendancePct < 50;
  if (lowAttendance && motivationC >= 1) {
    reasons.push('low_attendance', 'motivation_struggling');
    return { action: 'ajustar_volumen', reasons };
  }

  // Fatiga acumulada (recuperación + sueño + estrés) → semana ligera, no un ajuste fino.
  if (recoveryC + sleepC + stressC >= 4) {
    reasons.push('accumulated_fatigue');
    return { action: 'semana_descarga', reasons };
  }

  // MOTOR-STALL 🔒 — estancamiento localizado antes que cambios globales.
  if (strengthC >= 2 && recoveryC === 0 && energyC === 0) {
    reasons.push('strength_stalled');
    return { action: 'ajustar_intensidad', reasons };
  }

  if (energyC >= 1) {
    reasons.push('low_energy');
    return { action: 'ajustar_volumen', reasons };
  }

  // SUPERVISOR-MASTER-002 🔒
  reasons.push('all_signals_nominal');
  return { action: 'mantener', reasons };
}
