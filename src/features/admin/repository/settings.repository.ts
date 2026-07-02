import { SettingsDocument, SettingsModel } from '@/features/admin/schema/settings.schema';
import { mongo } from '@/shared/lib/mongo';

export const settingsRepository = {
  async get(): Promise<SettingsDocument | null> {
    await mongo.connect();
    return SettingsModel.findOne().lean<SettingsDocument>().exec();
  },

  async upsert(data: Partial<SettingsDocument>): Promise<void> {
    await mongo.connect();
    await SettingsModel.findOneAndUpdate({}, { $set: data }, { upsert: true });
  },
};
