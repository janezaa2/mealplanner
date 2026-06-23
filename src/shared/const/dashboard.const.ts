export type DashboardMetric = {
  title: string;
  value: string;
  description: string;
  icon: 'activity' | 'clock' | 'trending-up' | 'users';
};

export const DASHBOARD_METRICS: DashboardMetric[] = [
  {
    title: 'Plans Generated',
    value: '1,234',
    description: '+12% from last month',
    icon: 'activity',
  },
  {
    title: 'Active Planners',
    value: '320',
    description: 'Users with a live plan',
    icon: 'users',
  },
  {
    title: 'Meals Suggested',
    value: '34,552',
    description: 'Across all plans',
    icon: 'trending-up',
  },
  {
    title: 'Avg. Daily Calories',
    value: '2,180',
    description: 'Across generated plans',
    icon: 'clock',
  },
];
