'use client';
import { Loader2 } from 'lucide-react';

import { DayPlanCard } from '@/features/meal-plan/components/day-plan-card';
import { useMealPlanStore } from '@/features/meal-plan/hooks/useMealPlanStore';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { GOAL_OPTIONS, WEEK_DAYS } from '@/shared/const/meal-plan.const';

type PlanDisplayProps = {
  onRegenerate: () => void;
  generating?: boolean;
};

export const PlanDisplay = ({ onRegenerate, generating = false }: PlanDisplayProps) => {
  const { plan, profile } = useMealPlanStore();

  if (!plan || !profile) return null;

  const goalLabel =
    GOAL_OPTIONS.find((option) => option.value === profile.goal)?.label ?? profile.goal;

  const orderedDays = [...plan.days].sort(
    (a, b) => WEEK_DAYS.indexOf(a.day) - WEEK_DAYS.indexOf(b.day)
  );

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-lg font-semibold">{goalLabel}</p>
            <p className="text-sm text-muted-foreground">
              {profile.height} cm · {profile.weight} kg · {profile.age} yrs · {profile.gender}
            </p>
          </div>
          {generating ? (
            <span className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Generating… {orderedDays.length}/7 days
            </span>
          ) : (
            <Button variant="outline" onClick={onRegenerate}>
              Regenerate
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="space-y-8">
        {orderedDays.map((day, index) => (
          <DayPlanCard key={index} day={day} />
        ))}

        {generating && (
          <Card>
            <CardContent className="flex items-center justify-center gap-3 py-10 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              <span className="text-sm">
                {orderedDays.length === 0
                  ? 'Building your week of meals…'
                  : 'Adding more days…'}
              </span>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
