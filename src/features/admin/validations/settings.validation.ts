import { z } from 'zod';

export const SettingsSchema = z.object({
  appName: z.string().min(1).max(50),
  primaryColor: z.enum(['zinc', 'blue', 'green', 'purple', 'orange', 'rose']),
});
export type SettingsType = z.infer<typeof SettingsSchema>;
