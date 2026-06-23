export type GenderOption = {
  value: 'male' | 'female';
  label: string;
};

export type GoalOption = {
  value: 'lose_weight' | 'gain_muscle' | 'maintain_weight' | 'improve_health';
  label: string;
  description: string;
};

export const GENDER_OPTIONS: GenderOption[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

export const GOAL_OPTIONS: GoalOption[] = [
  { value: 'lose_weight', label: 'Lose weight', description: 'Calorie deficit plan' },
  { value: 'gain_muscle', label: 'Gain muscle', description: 'High protein, surplus' },
  { value: 'maintain_weight', label: 'Maintain weight', description: 'Balanced maintenance' },
  { value: 'improve_health', label: 'Improve health', description: 'General healthy eating' },
];

export const WEEK_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];
