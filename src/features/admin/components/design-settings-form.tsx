'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { AppSettings } from '@/features/admin/types/admin.types';
import { SettingsSchema, SettingsType } from '@/features/admin/validations/settings.validation';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { http } from '@/shared/lib/http';

const COLOR_PRESETS = [
  { value: 'zinc', label: 'Zinc (Default)', bg: 'bg-zinc-900' },
  { value: 'blue', label: 'Blue', bg: 'bg-blue-600' },
  { value: 'green', label: 'Green', bg: 'bg-green-600' },
  { value: 'purple', label: 'Purple', bg: 'bg-purple-600' },
  { value: 'orange', label: 'Orange', bg: 'bg-orange-500' },
  { value: 'rose', label: 'Rose', bg: 'bg-rose-500' },
] as const;

type Props = { settings: AppSettings };

export const DesignSettingsForm = ({ settings }: Props) => {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<SettingsType>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: { appName: settings.appName, primaryColor: settings.primaryColor as SettingsType['primaryColor'] },
  });

  const onSubmit = async (data: SettingsType) => {
    setLoading(true);
    setSaved(false);
    try {
      await http.patch('/admin/settings', data);
      setSaved(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">App name</CardTitle>
          <CardDescription>Shown in the browser tab and header</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="appName" render={({ field }) => (
                <FormItem>
                  <FormLabel>App name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="primaryColor" render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary color</FormLabel>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => field.onChange(preset.value)}
                        className={[
                          'flex items-center gap-2 rounded-md border p-3 text-sm transition-colors',
                          field.value === preset.value
                            ? 'border-primary ring-1 ring-primary'
                            : 'border-border hover:bg-muted',
                        ].join(' ')}
                      >
                        <span className={`size-4 rounded-full shrink-0 ${preset.bg}`} />
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )} />

              {saved && <p className="text-sm text-green-600 dark:text-green-400">Settings saved.</p>}
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save settings'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
