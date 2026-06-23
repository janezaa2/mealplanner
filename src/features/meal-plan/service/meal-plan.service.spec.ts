import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/features/meal-plan/repository/meal-plan.repository', () => ({
  mealPlanRepository: {
    findLatestByUserId: vi.fn(),
    create: vi.fn(),
    deleteByUserId: vi.fn(),
  },
}));

vi.mock('@/shared/lib/openrouter', () => ({
  openrouter: {
    chatJSON: vi.fn(),
  },
  getModelChain: () => ['model-a', 'model-b', 'model-c'],
}));

import { mealPlanRepository } from '@/features/meal-plan/repository/meal-plan.repository';
import { openrouter } from '@/shared/lib/openrouter';

import { generatePlanService, getLatestPlanService } from './meal-plan.service';

const mockRepo = vi.mocked(mealPlanRepository);
const mockOpenrouter = vi.mocked(openrouter);

const validInput = {
  height: 180,
  weight: 80,
  age: 30,
  gender: 'male' as const,
  goal: 'gain_muscle' as const,
};

const validWeek = {
  days: [
    {
      day: 'Monday',
      totalCalories: 2000,
      meals: [
        {
          name: 'Oatmeal',
          type: 'Breakfast',
          calories: 500,
          protein: 20,
          carbs: 60,
          fat: 10,
          ingredients: ['oats', 'milk'],
          steps: ['mix', 'cook'],
        },
      ],
    },
  ],
};

const userId = '507f1f77bcf86cd799439012';

describe('generatePlanService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 201 and saves the plan on success', async () => {
    mockOpenrouter.chatJSON.mockResolvedValueOnce(validWeek);
    mockRepo.deleteByUserId.mockResolvedValueOnce(undefined);
    mockRepo.create.mockResolvedValueOnce('507f1f77bcf86cd799439011');

    const result = await generatePlanService(userId, validInput);

    expect(result.status).toBe(201);
    expect(mockRepo.deleteByUserId).toHaveBeenCalledWith(userId);
    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId, height: 180, days: validWeek.days })
    );
    expect(result.data).toMatchObject({
      plan: { days: validWeek.days },
      profile: { height: 180, goal: 'gain_muscle' },
    });
  });

  it('returns 502 when every model returns invalid JSON', async () => {
    mockOpenrouter.chatJSON.mockResolvedValue({ days: 'not-an-array' });
    const result = await generatePlanService(userId, validInput);
    expect(result.status).toBe(502);
    expect(result.data).toEqual({ error: 'GENERATION_FAILED' });
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  it('returns 502 when every model throws', async () => {
    mockOpenrouter.chatJSON.mockRejectedValue(new Error('network down'));
    const result = await generatePlanService(userId, validInput);
    expect(result.status).toBe(502);
    expect(result.data).toEqual({ error: 'GENERATION_FAILED' });
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  it('falls back to the next model when the first returns an unusable plan', async () => {
    mockOpenrouter.chatJSON
      .mockResolvedValueOnce({ days: [] })
      .mockResolvedValueOnce(validWeek);
    mockRepo.deleteByUserId.mockResolvedValueOnce(undefined);
    mockRepo.create.mockResolvedValueOnce('507f1f77bcf86cd799439011');

    const result = await generatePlanService(userId, validInput);

    expect(result.status).toBe(201);
    expect(mockOpenrouter.chatJSON).toHaveBeenCalledTimes(2);
    expect(mockRepo.create).toHaveBeenCalledTimes(1);
  });

  it('returns 402 INSUFFICIENT_CREDITS when openrouter responds 402', async () => {
    const err = Object.assign(new Error('insufficient credits'), { status: 402 });
    mockOpenrouter.chatJSON.mockRejectedValueOnce(err);
    const result = await generatePlanService(userId, validInput);
    expect(result.status).toBe(402);
    expect(result.data).toEqual({ error: 'INSUFFICIENT_CREDITS' });
    expect(mockRepo.create).not.toHaveBeenCalled();
  });
});

describe('getLatestPlanService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 404 when no plan exists', async () => {
    mockRepo.findLatestByUserId.mockResolvedValueOnce(null);
    const result = await getLatestPlanService(userId);
    expect(result.status).toBe(404);
    expect(result.data).toEqual({ error: 'NOT_FOUND' });
  });

  it('returns 200 with mapped plan and profile when found', async () => {
    mockRepo.findLatestByUserId.mockResolvedValueOnce({
      _id: { toString: () => '507f1f77bcf86cd799439011' },
      userId,
      height: 180,
      weight: 80,
      age: 30,
      gender: 'male',
      goal: 'gain_muscle',
      days: validWeek.days,
    } as never);

    const result = await getLatestPlanService(userId);
    expect(result.status).toBe(200);
    expect(result.data).toMatchObject({
      plan: { days: validWeek.days },
      profile: { height: 180, weight: 80, age: 30, gender: 'male', goal: 'gain_muscle' },
    });
  });
});
