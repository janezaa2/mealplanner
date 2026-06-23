import {
  Activity,
  Clock,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { DASHBOARD_METRICS, type DashboardMetric } from '@/shared/const/dashboard.const';

const DASHBOARD_ICON_MAP: Record<DashboardMetric['icon'], LucideIcon> = {
  activity: Activity,
  clock: Clock,
  'trending-up': TrendingUp,
  users: Users,
};

type DashboardOverviewProps = {
  userName: string;
};

export const DashboardOverview = ({ userName }: DashboardOverviewProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {userName}</h1>
        <p className="mt-1 text-muted-foreground">
          Here is an overview of your meal planning metrics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {DASHBOARD_METRICS.map(({ title, value, description, icon }) => {
          const Icon = DASHBOARD_ICON_MAP[icon];

          return (
            <Card key={title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
