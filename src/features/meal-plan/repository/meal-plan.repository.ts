import { MealPlanDocument, MealPlanModel } from '@/features/meal-plan/schema/meal-plan.schema';
import { mongo } from '@/shared/lib/mongo';

export const mealPlanRepository = {
  async findLatestByUserId(userId: string): Promise<MealPlanDocument | null> {
    await mongo.connect();
    return MealPlanModel.findOne({ userId })
      .sort({ createdAt: -1 })
      .lean<MealPlanDocument>()
      .exec();
  },

  async create(
    data: Omit<MealPlanDocument, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    await mongo.connect();
    const doc = await MealPlanModel.create(data);
    return doc._id.toString();
  },

  async deleteByUserId(userId: string): Promise<void> {
    await mongo.connect();
    await MealPlanModel.deleteMany({ userId });
  },
};
