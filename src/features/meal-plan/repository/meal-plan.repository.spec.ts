import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/lib/mongo', () => ({
  mongo: {
    connect: vi.fn(),
  },
}));

vi.mock('@/features/meal-plan/schema/meal-plan.schema', () => ({
  MealPlanModel: {
    findOne: vi.fn(),
    create: vi.fn(),
    deleteMany: vi.fn(),
  },
}));

import { MealPlanModel } from '@/features/meal-plan/schema/meal-plan.schema';
import { mongo } from '@/shared/lib/mongo';

import { mealPlanRepository } from './meal-plan.repository';

const mockMongo = vi.mocked(mongo);
const mockModel = vi.mocked(MealPlanModel);

const fakePlan = {
  _id: '507f1f77bcf86cd799439011',
  userId: '507f1f77bcf86cd799439012',
  height: 180,
  weight: 80,
  age: 30,
  gender: 'male',
  goal: 'gain_muscle',
  days: [],
};

function makeSortLeanQuery<T>(result: T) {
  return {
    sort: () => ({ lean: () => ({ exec: () => Promise.resolve(result) }) }),
  };
}

describe('mealPlanRepository', () => {
  beforeEach(() => vi.clearAllMocks());

  it('findLatestByUserId connects and calls findOne sorted by createdAt', async () => {
    (mockModel.findOne as ReturnType<typeof vi.fn>).mockReturnValueOnce(makeSortLeanQuery(fakePlan));
    const result = await mealPlanRepository.findLatestByUserId('507f1f77bcf86cd799439012');
    expect(mockMongo.connect).toHaveBeenCalled();
    expect(result).toEqual(fakePlan);
  });

  it('findLatestByUserId returns null when not found', async () => {
    (mockModel.findOne as ReturnType<typeof vi.fn>).mockReturnValueOnce(makeSortLeanQuery(null));
    const result = await mealPlanRepository.findLatestByUserId('507f1f77bcf86cd799439099');
    expect(result).toBeNull();
  });

  it('create calls model.create and returns id string', async () => {
    (mockModel.create as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ _id: { toString: () => '507f1f77bcf86cd799439011' } });
    const id = await mealPlanRepository.create({
      userId: '507f1f77bcf86cd799439012',
      height: 180,
      weight: 80,
      age: 30,
      gender: 'male',
      goal: 'gain_muscle',
      days: [],
    });
    expect(mockMongo.connect).toHaveBeenCalled();
    expect(id).toBe('507f1f77bcf86cd799439011');
  });

  it('deleteByUserId connects and calls deleteMany', async () => {
    (mockModel.deleteMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ deletedCount: 1 });
    await mealPlanRepository.deleteByUserId('507f1f77bcf86cd799439012');
    expect(mockMongo.connect).toHaveBeenCalled();
    expect(mockModel.deleteMany).toHaveBeenCalledWith({ userId: '507f1f77bcf86cd799439012' });
  });
});
