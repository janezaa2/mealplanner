'use client';
import { useState } from 'react';

import { AdminUser } from '@/features/admin/types/admin.types';
import { Button } from '@/shared/components/ui/button';
import { http } from '@/shared/lib/http';

type Props = { users: AdminUser[]; currentUserId: string };

export const UsersTable = ({ users, currentUserId }: Props) => {
  const [list, setList] = useState(users);
  const [loading, setLoading] = useState<string | null>(null);

  const toggleRole = async (id: string, currentRole: string) => {
    setLoading(id);
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      await http.patch(`/admin/users/${id}`, { role: newRole });
      setList((prev) => prev.map((u) => (u.id === id ? { ...u, role: newRole } : u)));
    } finally {
      setLoading(null);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    setLoading(id);
    try {
      await http.delete(`/admin/users/${id}`);
      setList((prev) => prev.filter((u) => u.id !== id));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="rounded-md border border-border overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Joined</th>
            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.map((user) => (
            <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/30">
              <td className="px-4 py-3">{user.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
              <td className="px-4 py-3">
                <span className={[
                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                  user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
                ].join(' ')}>
                  {user.role}
                </span>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={loading === user.id || user.id === currentUserId}
                    onClick={() => toggleRole(user.id, user.role)}
                  >
                    {user.role === 'admin' ? 'Make user' : 'Make admin'}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={loading === user.id || user.id === currentUserId}
                    onClick={() => deleteUser(user.id)}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
