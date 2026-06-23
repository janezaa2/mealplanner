import { NextRequest, NextResponse } from 'next/server';

import { streamPlanService } from '@/features/meal-plan/service/meal-plan.service';
import { GeneratePlanSchema } from '@/features/meal-plan/validations/meal-plan.validation';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

    const validated = await validateBody(req, GeneratePlanSchema);
    if (validated instanceof NextResponse) return validated;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of streamPlanService(userId, validated.data)) {
            controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
          }
        } catch (err) {
          console.error('Stream route error:', err);
          controller.enqueue(
            encoder.encode(`${JSON.stringify({ type: 'error', error: 'GENERATION_FAILED' })}\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
