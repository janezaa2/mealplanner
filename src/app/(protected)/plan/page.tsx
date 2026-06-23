'use client';
import { useEffect } from 'react';

import { PlanDisplay } from '@/features/meal-plan/components/plan-display';
import { PlanForm } from '@/features/meal-plan/components/plan-form';
import { useGeneratePlan } from '@/features/meal-plan/hooks/use-generate-plan';
import { useMealPlanStore } from '@/features/meal-plan/hooks/useMealPlanStore';

export default function PlanPage() {
  const { fetchPlan } = useGeneratePlan();
  const { plan, generating, setPlan } = useMealPlanStore();

  useEffect(() => {
    fetchPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasDays = !!plan && plan.days.length > 0;
  const showPlan = generating || hasDays;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Your meal plan</h1>
        <p className="mt-1 text-muted-foreground">
          A personalized weekly plan tailored to your goal.
        </p>
      </div>

      {showPlan ? (
        <PlanDisplay onRegenerate={() => setPlan(null)} generating={generating} />
      ) : (
        <PlanForm />
      )}
    </div>
  );
}
