import { createStore } from 'zustand/vanilla';

import { MealPlanState, MealPlanStore } from '@/features/meal-plan/types/meal-plan.types';

export const createMealPlanStore = (initState: Partial<MealPlanState> = {}) => {
  const DEFAULT_STATE: MealPlanState = {
    plan: null,
    profile: null,
    generating: false,
    error: null,
  };

  return createStore<MealPlanStore>()((set) => ({
    ...DEFAULT_STATE,
    ...initState,
    setPlan: (plan) => set({ plan }),
    appendDay: (day) =>
      set((state) => ({ plan: { days: [...(state.plan?.days ?? []), day] } })),
    setProfile: (profile) => set({ profile }),
    setGenerating: (generating) => set({ generating }),
    setError: (error) => set({ error }),
  }));
};
