import { mealPlanRepository } from '@/features/meal-plan/repository/meal-plan.repository';
import { createDayExtractor } from '@/features/meal-plan/service/day-stream-extractor';
import {
  DayPlan,
  MealPlanResponse,
  MealPlanStreamEvent,
  PlanProfile,
  WeekPlan,
} from '@/features/meal-plan/types/meal-plan.types';
import {
  DayPlanSchema,
  GeneratePlanType,
  WeekPlanSchema,
} from '@/features/meal-plan/validations/meal-plan.validation';
import { getModelChain, openrouter } from '@/shared/lib/openrouter';
import { ServiceResult } from '@/shared/types/common';

const SYSTEM_PROMPT = `You are a professional nutritionist. Generate a personalized weekly meal plan.
Return ONLY valid JSON (no markdown, no prose) matching exactly this shape:
{
  "days": [
    {
      "day": "Monday",
      "totalCalories": number,
      "meals": [
        {
          "name": string,
          "type": "Breakfast" | "Lunch" | "Dinner" | "Snack",
          "calories": number,
          "protein": number,
          "carbs": number,
          "fat": number,
          "ingredients": [string],
          "steps": [string]
        }
      ]
    }
  ]
}
Rules:
- Include exactly 7 days, named Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday in order.
- Each day must contain exactly 4 meals: one Breakfast, one Lunch, one Dinner, and one Snack.
- "totalCalories" for each day must equal the sum of its meals' calories.
- Calories and macros (protein, carbs, fat in grams) must be realistic and tuned to the user's height, weight, age, gender, and goal.
- All numeric fields must be numbers, not strings.`;

function buildUserPrompt(input: GeneratePlanType): string {
  return `Create a weekly meal plan for this person:
- Height: ${input.height} cm
- Weight: ${input.weight} kg
- Age: ${input.age}
- Gender: ${input.gender}
- Goal: ${input.goal}`;
}

export async function generatePlanService(
  userId: string,
  input: GeneratePlanType
): Promise<ServiceResult<MealPlanResponse>> {
  const userPrompt = buildUserPrompt(input);
  const profile: PlanProfile = {
    height: input.height,
    weight: input.weight,
    age: input.age,
    gender: input.gender,
    goal: input.goal,
  };

  // Try each model in the fallback chain until one returns a usable plan.
  for (const model of getModelChain()) {
    let raw: Record<string, unknown>;
    try {
      raw = await openrouter.chatJSON(SYSTEM_PROMPT, userPrompt, model);
    } catch (err) {
      console.error(`Meal plan generation failed for model "${model}":`, err);
      // Credit exhaustion affects every model — stop and report it.
      if ((err as { status?: number }).status === 402) {
        return { data: { error: 'INSUFFICIENT_CREDITS' }, status: 402 };
      }
      continue;
    }

    const parsed = WeekPlanSchema.safeParse(raw);
    if (!parsed.success || parsed.data.days.length === 0) {
      console.warn(`Model "${model}" returned an unusable plan, trying next model.`);
      continue;
    }

    await mealPlanRepository.deleteByUserId(userId);
    await mealPlanRepository.create({
      userId,
      height: input.height,
      weight: input.weight,
      age: input.age,
      gender: input.gender,
      goal: input.goal,
      days: parsed.data.days,
    });

    const plan: WeekPlan = { days: parsed.data.days };
    return { data: { plan, profile }, status: 201 };
  }

  return { data: { error: 'GENERATION_FAILED' }, status: 502 };
}

export async function getLatestPlanService(
  userId: string
): Promise<ServiceResult<MealPlanResponse>> {
  const doc = await mealPlanRepository.findLatestByUserId(userId);
  if (!doc) return { data: { error: 'NOT_FOUND' }, status: 404 };

  const plan: WeekPlan = {
    days: doc.days.map(day => ({
      day: day.day,
      totalCalories: day.totalCalories,
      meals: day.meals.map(meal => ({
        name: meal.name,
        type: meal.type,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        ingredients: meal.ingredients,
        steps: meal.steps,
      })),
    })),
  };

  const profile: PlanProfile = {
    height: doc.height,
    weight: doc.weight,
    age: doc.age,
    gender: doc.gender,
    goal: doc.goal,
  };

  return { data: { plan, profile }, status: 200 };
}

// Keep only candidates that pass the day schema.
function validateDays(candidates: Record<string, unknown>[]): DayPlan[] {
  const out: DayPlan[] = [];
  for (const candidate of candidates) {
    const parsed = DayPlanSchema.safeParse(candidate);
    if (parsed.success) out.push(parsed.data);
  }
  return out;
}

// Streams complete, schema-valid days from a single model as they arrive.
async function* streamModelDays(model: string, userPrompt: string): AsyncGenerator<DayPlan> {
  const extractor = createDayExtractor();
  for await (const token of openrouter.chatStreamTokens(SYSTEM_PROMPT, userPrompt, model)) {
    for (const day of validateDays(extractor.push(token))) {
      yield day;
    }
  }
}

// Streams a plan generation: tries each model in the chain, emitting days as
// they arrive, then persists and emits a final plan.
export async function* streamPlanService(
  userId: string,
  input: GeneratePlanType
): AsyncGenerator<MealPlanStreamEvent> {
  const userPrompt = buildUserPrompt(input);
  const profile: PlanProfile = {
    height: input.height,
    weight: input.weight,
    age: input.age,
    gender: input.gender,
    goal: input.goal,
  };

  for (const model of getModelChain()) {
    yield { type: 'status', message: 'Generating your plan…' };

    const days: DayPlan[] = [];
    let failed = false;

    try {
      for await (const day of streamModelDays(model, userPrompt)) {
        days.push(day);
        yield { type: 'day', day };
      }
    } catch (err) {
      console.error(`Streaming generation failed for model "${model}":`, err);
      if ((err as { status?: number }).status === 402) {
        yield { type: 'error', error: 'INSUFFICIENT_CREDITS' };
        return;
      }
      failed = true;
    }

    if (failed || days.length === 0) continue;

    await mealPlanRepository.deleteByUserId(userId);
    await mealPlanRepository.create({
      userId,
      height: input.height,
      weight: input.weight,
      age: input.age,
      gender: input.gender,
      goal: input.goal,
      days,
    });

    yield { type: 'done', plan: { days }, profile };
    return;
  }

  yield { type: 'error', error: 'GENERATION_FAILED' };
}
