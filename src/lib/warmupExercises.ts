import type { MuscleGroup } from '@/types/user';

export interface WarmupExercise {
  name: string;
  targetMuscle: MuscleGroup;
  duration: string;
  instructions: string;
}

export const WARMUP_EXERCISES: WarmupExercise[] = [
  {
    name: 'Círculos de hombros y cadera',
    targetMuscle: 'shoulders',
    duration: '1 min',
    instructions: 'Rota hombros y cadera en círculos amplios para activar las articulaciones antes de cargar peso.',
  },
  {
    name: 'Jumping jacks',
    targetMuscle: 'core',
    duration: '2 min',
    instructions: 'Salta abriendo brazos y piernas a la vez, a ritmo suave, para elevar el pulso poco a poco.',
  },
  {
    name: 'Sentadilla sin peso',
    targetMuscle: 'legs',
    duration: '2 min',
    instructions: 'Sentadillas con tu propio peso para activar piernas y glúteos antes del entreno.',
  },
];
