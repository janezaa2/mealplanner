'use client';
import { useMealPlanStore } from '@/features/meal-plan/hooks/useMealPlanStore';
import { MealPlanResponse, MealPlanStreamEvent } from '@/features/meal-plan/types/meal-plan.types';
import { GeneratePlanType } from '@/features/meal-plan/validations/meal-plan.validation';
import { http } from '@/shared/lib/http';

export const useGeneratePlan = () => {
  const { setPlan, appendDay, setProfile, setGenerating, setError } = useMealPlanStore();

  const generatePlan = async (data: GeneratePlanType) => {
    setGenerating(true);
    setError(null);
    try {
      const res = await http.post<MealPlanResponse>('/meal-plan', data);
      setPlan(res.plan);
      setProfile(res.profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate plan');
    } finally {
      setGenerating(false);
    }
  };

  const generatePlanStream = async (data: GeneratePlanType) => {
    setGenerating(true);
    setError(null);
    // Show the profile header and an empty plan immediately while we stream.
    setProfile({
      height: data.height,
      weight: data.weight,
      age: data.age,
      gender: data.gender,
      goal: data.goal,
    });
    setPlan({ days: [] });

    const applyEvent = (event: MealPlanStreamEvent) => {
      if (event.type === 'status') {
        setPlan({ days: [] });
      } else if (event.type === 'day') {
        appendDay(event.day);
      } else if (event.type === 'done') {
        setPlan(event.plan);
        setProfile(event.profile);
      } else {
        setError(
          event.error === 'INSUFFICIENT_CREDITS'
            ? 'Out of AI credits — top up your OpenRouter account.'
            : 'Failed to generate plan'
        );
        setPlan(null);
      }
    };

    try {
      const res = await fetch('/api/meal-plan/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok || !res.body) throw new Error('Failed to generate plan');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        const ready = lines.filter((line) => line.trim());
        for (const line of ready) applyEvent(JSON.parse(line) as MealPlanStreamEvent);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate plan');
      setPlan(null);
    } finally {
      setGenerating(false);
    }
  };

  const fetchPlan = async () => {
    try {
      const res = await http.get<MealPlanResponse>('/meal-plan');
      setPlan(res.plan);
      setProfile(res.profile);
    } catch {
      // No plan yet — leave plan null.
    }
  };

  return { generatePlan, generatePlanStream, fetchPlan };
};
