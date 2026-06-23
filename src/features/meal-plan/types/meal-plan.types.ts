export type Meal = {
  name: string;
  type: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  steps: string[];
};

export type DayPlan = {
  day: string;
  totalCalories: number;
  meals: Meal[];
};

export type WeekPlan = {
  days: DayPlan[];
};

export type PlanProfile = {
  height: number;
  weight: number;
  age: number;
  gender: string;
  goal: string;
};

export type MealPlanResponse = {
  plan: WeekPlan;
  profile: PlanProfile;
};

export type MealPlanState = {
  plan: WeekPlan | null;
  profile: PlanProfile | null;
  generating: boolean;
  error: string | null;
};

export type MealPlanActions = {
  setPlan: (plan: WeekPlan | null) => void;
  appendDay: (day: DayPlan) => void;
  setProfile: (profile: PlanProfile | null) => void;
  setGenerating: (generating: boolean) => void;
  setError: (error: string | null) => void;
};

export type MealPlanStreamEvent =
  | { type: 'status'; message: string }
  | { type: 'day'; day: DayPlan }
  | { type: 'done'; plan: WeekPlan; profile: PlanProfile }
  | { type: 'error'; error: string };

export type MealPlanStore = MealPlanState & MealPlanActions;
export type MealPlanStoreType = MealPlanStore;
