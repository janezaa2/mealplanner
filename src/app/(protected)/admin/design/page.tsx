import { DesignSettingsForm } from '@/features/admin/components/design-settings-form';
import { getSettingsService } from '@/features/admin/service/settings.service';

export default async function AdminDesignPage() {
  const { data } = await getSettingsService();
  const settings = data as { appName: string; primaryColor: string };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Design settings</h2>
        <p className="text-sm text-muted-foreground">Customize your app appearance</p>
      </div>
      <DesignSettingsForm settings={settings} />
    </div>
  );
}
