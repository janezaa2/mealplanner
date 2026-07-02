import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

type Props = {
  title: string;
  value: number;
  sub: string;
};

export const StatsCard = ({ title, value, sub }: Props) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
};
