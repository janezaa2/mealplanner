import { redirect } from 'next/navigation';
import { type ReactNode } from 'react';

import { AdminNav } from '@/features/admin/components/admin-nav';
import { auth } from '@/shared/lib/auth';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;

  if (!session || user?.role !== 'admin') redirect('/plan');

  return (
    <div>
      <div className="mb-2">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-sm text-muted-foreground">Manage your application</p>
      </div>
      <AdminNav />
      {children}
    </div>
  );
}
