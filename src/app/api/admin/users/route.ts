import { NextResponse } from 'next/server';

import { getAllUsersService } from '@/features/admin/service/admin.service';
import { auth } from '@/shared/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    const user = session?.user as { role?: string } | undefined;
    if (!session || user?.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }
    const { data, status } = await getAllUsersService();
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
