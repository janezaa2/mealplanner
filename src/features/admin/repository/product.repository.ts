import { ProductDocument, ProductModel } from '@/features/admin/schema/product.schema';
import { mongo } from '@/shared/lib/mongo';

export const productRepository = {
  async findAll(): Promise<ProductDocument[]> {
    await mongo.connect();
    return ProductModel.find().sort({ sortOrder: 1, createdAt: -1 }).lean<ProductDocument[]>().exec();
  },

  async findPublic(): Promise<ProductDocument[]> {
    await mongo.connect();
    return ProductModel.find({ inStock: true }).sort({ sortOrder: 1, createdAt: -1 }).lean<ProductDocument[]>().exec();
  },

  async findById(id: string): Promise<ProductDocument | null> {
    await mongo.connect();
    return ProductModel.findById(id).lean<ProductDocument>().exec();
  },

  async create(data: Omit<ProductDocument, '_id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    await mongo.connect();
    const doc = await ProductModel.create(data);
    return doc._id.toString();
  },

  async updateById(id: string, data: Partial<ProductDocument>): Promise<boolean> {
    await mongo.connect();
    const result = await ProductModel.findByIdAndUpdate(id, { $set: data });
    return result !== null;
  },

  async deleteById(id: string): Promise<boolean> {
    await mongo.connect();
    const result = await ProductModel.findByIdAndDelete(id);
    return result !== null;
  },
};
