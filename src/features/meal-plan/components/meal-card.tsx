import { Meal } from '@/features/meal-plan/types/meal-plan.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

type MealCardProps = {
  meal: Meal;
};

export const MealCard = ({ meal }: MealCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground uppercase">
            {meal.type}
          </span>
          <span className="text-sm font-medium text-muted-foreground">{meal.calories} kcal</span>
        </div>
        <CardTitle className="text-lg">{meal.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-md bg-muted p-2">
            <div className="text-sm font-semibold">{meal.protein}g</div>
            <div className="text-xs text-muted-foreground">Protein</div>
          </div>
          <div className="rounded-md bg-muted p-2">
            <div className="text-sm font-semibold">{meal.carbs}g</div>
            <div className="text-xs text-muted-foreground">Carbs</div>
          </div>
          <div className="rounded-md bg-muted p-2">
            <div className="text-sm font-semibold">{meal.fat}g</div>
            <div className="text-xs text-muted-foreground">Fat</div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Ingredients</h4>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {meal.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Recipe</h4>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
            {meal.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
