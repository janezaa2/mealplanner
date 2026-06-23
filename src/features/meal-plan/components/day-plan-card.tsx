import { MealCard } from '@/features/meal-plan/components/meal-card';
import { DayPlan } from '@/features/meal-plan/types/meal-plan.types';

type DayPlanCardProps = {
  day: DayPlan;
};

export const DayPlanCard = ({ day }: DayPlanCardProps) => {
  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between gap-2 border-b pb-2">
        <h3 className="text-xl font-semibold">{day.day}</h3>
        <span className="text-sm font-medium text-muted-foreground">
          {day.totalCalories} kcal total
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {day.meals.map((meal, index) => (
          <MealCard key={index} meal={meal} />
        ))}
      </div>
    </section>
  );
};
