import { NextRequest, NextResponse } from 'next/server';

import { getSettingsService, updateSettingsService } from '@/features/admin/service/settings.service';
import { SettingsSchema } from '@/features/admin/validations/settings.validation';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

export async function GET() {
  try {
    const { data, status } = await getSettingsService();
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user as { role?: string } | undefined;
    if (!session || user?.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }
    const validated = await validateBody(req, SettingsSchema);
    if (validated instanceof NextResponse) return validated;
    const { data, status } = await updateSettingsService(validated.data);
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
