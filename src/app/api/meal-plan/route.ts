import { NextRequest, NextResponse } from 'next/server';

import { generatePlanService, getLatestPlanService } from '@/features/meal-plan/service/meal-plan.service';
import { GeneratePlanSchema } from '@/features/meal-plan/validations/meal-plan.validation';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

    const validated = await validateBody(req, GeneratePlanSchema);
    if (validated instanceof NextResponse) return validated;

    const { data, status } = await generatePlanService(userId, validated.data);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

    const { data, status } = await getLatestPlanService(userId);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
