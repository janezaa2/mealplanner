import { AdminStats, AdminUser } from '@/features/admin/types/admin.types';
import { userRepository } from '@/features/auth/repository/user.repository';
import { MealPlanModel } from '@/features/meal-plan/schema/meal-plan.schema';
import { mongo } from '@/shared/lib/mongo';
import { ServiceResult } from '@/shared/types/common';

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export async function getAnalyticsService(): Promise<ServiceResult<AdminStats>> {
  await mongo.connect();
  const weekAgo = new Date(Date.now() - ONE_WEEK_MS);

  const { items: allUsers } = await userRepository.findAll();

  const [totalPlans, newPlansThisWeek] = await Promise.all([
    MealPlanModel.countDocuments(),
    MealPlanModel.countDocuments({ createdAt: { $gte: weekAgo } }),
  ]);

  const newUsersThisWeek = allUsers.filter(
    (u) => u.createdAt && new Date(u.createdAt as unknown as string) >= weekAgo
  ).length;

  return {
    data: {
      totalUsers: allUsers.length,
      totalPlans,
      newUsersThisWeek,
      newPlansThisWeek,
    },
    status: 200,
  };
}

export async function getAllUsersService(): Promise<ServiceResult<AdminUser[]>> {
  const { items } = await userRepository.findAll();
  return {
    data: items.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: (u.createdAt as unknown as Date)?.toISOString?.() ?? '',
    })),
    status: 200,
  };
}

export async function updateUserRoleService(
  id: string,
  role: 'user' | 'admin'
): Promise<ServiceResult<{ message: string }>> {
  const updated = await userRepository.updateById(id, { role });
  if (!updated) return { data: { error: 'User not found' }, status: 404 };
  return { data: { message: 'Role updated' }, status: 200 };
}

export async function deleteUserService(
  id: string
): Promise<ServiceResult<{ message: string }>> {
  const deleted = await userRepository.deleteById(id);
  if (!deleted) return { data: { error: 'User not found' }, status: 404 };
  return { data: { message: 'User deleted' }, status: 200 };
}
