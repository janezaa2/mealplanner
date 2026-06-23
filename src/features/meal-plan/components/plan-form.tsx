'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch, type Resolver } from 'react-hook-form';

import { useGeneratePlan } from '@/features/meal-plan/hooks/use-generate-plan';
import { useMealPlanStore } from '@/features/meal-plan/hooks/useMealPlanStore';
import { GeneratePlanSchema, GeneratePlanType } from '@/features/meal-plan/validations/meal-plan.validation';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { GENDER_OPTIONS, GOAL_OPTIONS } from '@/shared/const/meal-plan.const';
import { cn } from '@/shared/lib/utils';

type PlanFormValues = {
  height?: number;
  weight?: number;
  age?: number;
  gender?: GeneratePlanType['gender'];
  goal?: GeneratePlanType['goal'];
};

export const PlanForm = () => {
  const { generatePlanStream } = useGeneratePlan();
  const { generating, error } = useMealPlanStore();

  const form = useForm<PlanFormValues, undefined, GeneratePlanType>({
    resolver: zodResolver(GeneratePlanSchema) as Resolver<PlanFormValues, undefined, GeneratePlanType>,
    defaultValues: {
      height: undefined,
      weight: undefined,
      age: undefined,
      gender: undefined,
      goal: undefined,
    },
  });

  const selectedGender = useWatch({ control: form.control, name: 'gender' });
  const selectedGoal = useWatch({ control: form.control, name: 'goal' });

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl">Generate your meal plan</CardTitle>
        <CardDescription>Tell us about yourself and your goal.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(generatePlanStream)} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="175"
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                        }
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="70"
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                        }
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="30"
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                        }
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormItem>
              <FormLabel>Gender</FormLabel>
              <div className="grid grid-cols-2 gap-3">
                {GENDER_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={selectedGender === option.value ? 'default' : 'outline'}
                    onClick={() => form.setValue('gender', option.value, { shouldValidate: true })}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
              {form.formState.errors.gender?.message && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.gender.message}
                </p>
              )}
            </FormItem>

            <FormItem>
              <FormLabel>Goal</FormLabel>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {GOAL_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => form.setValue('goal', option.value, { shouldValidate: true })}
                    className={cn(
                      'flex flex-col gap-1 rounded-md border p-4 text-left transition-colors hover:bg-accent',
                      selectedGoal === option.value
                        ? 'border-primary ring-2 ring-primary'
                        : 'border-input'
                    )}
                  >
                    <span className="text-sm font-medium">{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </button>
                ))}
              </div>
              {form.formState.errors.goal?.message && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.goal.message}
                </p>
              )}
            </FormItem>

            {error && <p className="text-sm font-medium text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={generating}>
              {generating ? 'Generating your plan…' : 'Generate plan'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
