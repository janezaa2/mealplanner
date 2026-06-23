'use client';
import { type ReactNode, useState } from 'react';
import { type StoreApi } from 'zustand';

import { AuthStoreContext } from '@/features/auth/hooks/useAuthStore';
import { createAuthStore } from '@/features/auth/store/auth-store';
import { AuthStore } from '@/features/auth/types/auth.types';
import { MealPlanStoreContext } from '@/features/meal-plan/hooks/useMealPlanStore';
import { createMealPlanStore } from '@/features/meal-plan/store/meal-plan-store';
import { MealPlanStore } from '@/features/meal-plan/types/meal-plan.types';

export type StoreProviderProps = { children: ReactNode };

export const StoreProvider = ({ children }: StoreProviderProps) => {
  const [authStore] = useState<StoreApi<AuthStore>>(() => createAuthStore());
  const [mealPlanStore] = useState<StoreApi<MealPlanStore>>(() => createMealPlanStore());

  return (
    <AuthStoreContext.Provider value={authStore}>
      <MealPlanStoreContext.Provider value={mealPlanStore}>
        {children}
      </MealPlanStoreContext.Provider>
    </AuthStoreContext.Provider>
  );
};
