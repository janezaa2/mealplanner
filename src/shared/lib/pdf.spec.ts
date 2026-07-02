import { describe, expect, it, vi } from 'vitest';

vi.mock('pdfkit', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const EventEmitter = require('events') as typeof import('events');
  return {
    default: class MockPDFDocument extends EventEmitter {
      fontSize() { return this; }
      font() { return this; }
      text() { return this; }
      fillColor() { return this; }
      strokeColor() { return this; }
      moveDown() { return this; }
      moveTo() { return this; }
      lineTo() { return this; }
      stroke() { return this; }
      addPage() { return this; }
      end() { this.emit('end'); }
    },
  };
});

import { PlanProfile, WeekPlan } from '@/features/meal-plan/types/meal-plan.types';
import { pdfGenerator } from '@/shared/lib/pdf';

const plan: WeekPlan = {
  days: [
    {
      day: 'Monday',
      totalCalories: 2000,
      meals: [
        {
          name: 'Oats',
          type: 'Breakfast',
          calories: 400,
          protein: 15,
          carbs: 60,
          fat: 8,
          ingredients: ['Oats', 'Milk'],
          steps: ['Cook oats', 'Add milk'],
        },
      ],
    },
  ],
};

const profile: PlanProfile = {
  height: 175,
  weight: 70,
  age: 25,
  gender: 'male',
  goal: 'lose_weight',
};

describe('pdfGenerator', () => {
  it('returns a Buffer for a valid plan', async () => {
    const buf = await pdfGenerator.generateMealPlanBuffer(plan, profile);
    expect(buf).toBeInstanceOf(Buffer);
  });
});
