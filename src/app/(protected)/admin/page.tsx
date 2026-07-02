import { StatsCard } from '@/features/admin/components/stats-card';
import { getAnalyticsService } from '@/features/admin/service/admin.service';

export default async function AdminPage() {
  const { data } = await getAnalyticsService();
  const stats = data as {
    totalUsers: number;
    totalPlans: number;
    newUsersThisWeek: number;
    newPlansThisWeek: number;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard title="Total users" value={stats.totalUsers} sub="All registered accounts" />
        <StatsCard title="New users" value={stats.newUsersThisWeek} sub="Last 7 days" />
        <StatsCard title="Total plans" value={stats.totalPlans} sub="Meal plans generated" />
        <StatsCard title="New plans" value={stats.newPlansThisWeek} sub="Last 7 days" />
      </div>
    </div>
  );
}
