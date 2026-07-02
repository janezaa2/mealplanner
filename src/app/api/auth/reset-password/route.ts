import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { resetPasswordService } from '@/features/auth/service/password-reset.service';
import { validateBody } from '@/shared/middleware/validate-body';

const ResetPasswordApiSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const validated = await validateBody(req, ResetPasswordApiSchema);
    if (validated instanceof NextResponse) return validated;

    const { data, status } = await resetPasswordService(validated.data.token, validated.data.password);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
