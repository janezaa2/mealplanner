import mongoose, { Schema, InferSchemaType } from 'mongoose';

import { DayPlan } from '@/features/meal-plan/types/meal-plan.types';

const MealSubSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
    ingredients: { type: [String], required: true },
    steps: { type: [String], required: true },
  },
  { _id: false }
);

const DaySubSchema = new Schema(
  {
    day: { type: String, required: true },
    totalCalories: { type: Number, required: true },
    meals: { type: [MealSubSchema], required: true },
  },
  { _id: false }
);

const MealPlanSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    height: { type: Number, required: true },
    weight: { type: Number, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    goal: { type: String, required: true },
    days: { type: [DaySubSchema], required: true },
  },
  { timestamps: true }
);

export type MealPlanDocument = Omit<InferSchemaType<typeof MealPlanSchema>, 'days'> & {
  _id: mongoose.Types.ObjectId;
  days: DayPlan[];
};

export const MealPlanModel =
  mongoose.models.MealPlan || mongoose.model('MealPlan', MealPlanSchema);
