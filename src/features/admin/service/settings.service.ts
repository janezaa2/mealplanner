import { settingsRepository } from '@/features/admin/repository/settings.repository';
import { AppSettings } from '@/features/admin/types/admin.types';
import { SettingsType } from '@/features/admin/validations/settings.validation';
import { ServiceResult } from '@/shared/types/common';

export async function getSettingsService(): Promise<ServiceResult<AppSettings>> {
  const settings = await settingsRepository.get();
  return {
    data: {
      appName: settings?.appName ?? 'Meal Planner',
      primaryColor: settings?.primaryColor ?? 'zinc',
    },
    status: 200,
  };
}

export async function updateSettingsService(
  input: SettingsType
): Promise<ServiceResult<{ message: string }>> {
  await settingsRepository.upsert(input);
  return { data: { message: 'Settings updated' }, status: 200 };
}
