import { z } from 'zod';

export const GENDERS = ['male', 'female'] as const;
export const GOALS = [
  'lose_weight',
  'gain_muscle',
  'maintain_weight',
  'improve_health',
] as const;

export const GeneratePlanSchema = z.object({
  height: z.coerce.number().min(80).max(260),
  weight: z.coerce.number().min(25).max(400),
  age: z.coerce.number().int().min(13).max(120),
  gender: z.enum(GENDERS),
  goal: z.enum(GOALS),
});

export type GeneratePlanType = z.infer<typeof GeneratePlanSchema>;

export const MealSchema = z.object({
  name: z.string(),
  type: z.string(),
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  ingredients: z.array(z.string()),
  steps: z.array(z.string()),
});

export const DayPlanSchema = z.object({
  day: z.string(),
  totalCalories: z.number(),
  meals: z.array(MealSchema),
});

export const WeekPlanSchema = z.object({
  days: z.array(DayPlanSchema),
});

export type WeekPlanType = z.infer<typeof WeekPlanSchema>;
