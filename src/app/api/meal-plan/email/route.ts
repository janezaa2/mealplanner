import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { userRepository } from '@/features/auth/repository/user.repository';
import { mealPlanRepository } from '@/features/meal-plan/repository/meal-plan.repository';
import { DayPlan } from '@/features/meal-plan/types/meal-plan.types';
import { auth } from '@/shared/lib/auth';
import { mailer } from '@/shared/lib/mailer';
import { pdfGenerator } from '@/shared/lib/pdf';
import { validateBody } from '@/shared/middleware/validate-body';

const SendEmailSchema = z.object({
  email: z.string().email().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

    const validated = await validateBody(req, SendEmailSchema);
    if (validated instanceof NextResponse) return validated;

    const doc = await mealPlanRepository.findLatestByUserId(userId);
    if (!doc) return NextResponse.json({ error: 'No meal plan found.' }, { status: 404 });

    const plan = {
      days: doc.days.map((d) => ({
        day: d.day,
        totalCalories: d.totalCalories,
        meals: d.meals.map((m) => ({
          name: m.name,
          type: m.type,
          calories: m.calories,
          protein: m.protein,
          carbs: m.carbs,
          fat: m.fat,
          ingredients: m.ingredients,
          steps: m.steps,
        })),
      })) as DayPlan[],
    };

    const profile = {
      height: doc.height,
      weight: doc.weight,
      age: doc.age,
      gender: doc.gender,
      goal: doc.goal,
    };

    let toEmail = validated.data.email;
    if (!toEmail) {
      const user = await userRepository.findById(userId);
      if (!user?.email) return NextResponse.json({ error: 'No email on account.' }, { status: 400 });
      toEmail = user.email;
    }

    const pdfBuffer = await pdfGenerator.generateMealPlanBuffer(plan, profile);
    await mailer.sendMealPlanPDF(toEmail, pdfBuffer);

    return NextResponse.json({ message: `Meal plan sent to ${toEmail}` });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
