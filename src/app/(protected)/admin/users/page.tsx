import { UsersTable } from '@/features/admin/components/users-table';
import { getAllUsersService } from '@/features/admin/service/admin.service';
import { auth } from '@/shared/lib/auth';

export default async function AdminUsersPage() {
  const [{ data }, session] = await Promise.all([getAllUsersService(), auth()]);
  const users = data as Array<{ id: string; name: string; email: string; role: string; createdAt: string }>;
  const currentUser = session?.user as { id?: string } | undefined;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Users</h2>
        <p className="text-sm text-muted-foreground">{users.length} registered accounts</p>
      </div>
      <UsersTable users={users} currentUserId={currentUser?.id ?? ''} />
    </div>
  );
}
