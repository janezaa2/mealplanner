import { NextRequest, NextResponse } from 'next/server';

import { requestPasswordResetService } from '@/features/auth/service/password-reset.service';
import { ForgotPasswordSchema } from '@/features/auth/validations/password-reset.validation';
import { validateBody } from '@/shared/middleware/validate-body';

export async function POST(req: NextRequest) {
  try {
    const validated = await validateBody(req, ForgotPasswordSchema);
    if (validated instanceof NextResponse) return validated;

    const { data, status } = await requestPasswordResetService(validated.data.email);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
