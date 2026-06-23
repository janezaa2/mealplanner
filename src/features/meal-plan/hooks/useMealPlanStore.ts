'use client';
import { createContext, useContext } from 'react';
import { useStore, StoreApi } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

import { MealPlanStore, MealPlanStoreType } from '@/features/meal-plan/types/meal-plan.types';

export const MealPlanStoreContext = createContext<StoreApi<MealPlanStore> | null>(null);

export const useMealPlanStore = () => {
  const store = useContext(MealPlanStoreContext);
  if (!store) throw new Error('useMealPlanStore must be used within StoreProvider');
  return useStore(
    store,
    useShallow((state: MealPlanStoreType) => ({
      plan: state.plan,
      profile: state.profile,
      generating: state.generating,
      error: state.error,
      setPlan: state.setPlan,
      appendDay: state.appendDay,
      setProfile: state.setProfile,
      setGenerating: state.setGenerating,
      setError: state.setError,
    }))
  );
};
