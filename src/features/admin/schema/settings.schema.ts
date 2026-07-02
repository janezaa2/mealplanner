import mongoose, { InferSchemaType, Schema } from 'mongoose';

const SettingsSchema = new Schema(
  {
    appName: { type: String, default: 'Meal Planner' },
    primaryColor: { type: String, default: 'zinc' },
  },
  { timestamps: true }
);

export type SettingsDocument = InferSchemaType<typeof SettingsSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const SettingsModel =
  mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
