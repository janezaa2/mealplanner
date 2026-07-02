import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { productRepository } from '@/features/admin/repository/product.repository';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

const ReorderSchema = z.object({
  updates: z.array(z.object({ id: z.string().min(1), sortOrder: z.number() })),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user as { role?: string } | undefined;
    if (!session || user?.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const validated = await validateBody(req, ReorderSchema);
    if (validated instanceof NextResponse) return validated;

    await Promise.all(
      validated.data.updates.map(({ id, sortOrder }) =>
        productRepository.updateById(id, { sortOrder })
      )
    );

    return NextResponse.json({ message: 'Order updated' });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
