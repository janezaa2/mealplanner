import { z } from 'zod';

export const ProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0),
  category: z.string().min(1),
  inStock: z.boolean().optional().default(true),
  image: z.string().optional().default(''),
  shopifyUrl: z.string().optional().default(''),
});
export type ProductType = z.infer<typeof ProductSchema>;

export const UpdateProductSchema = ProductSchema.partial();
export type UpdateProductType = z.infer<typeof UpdateProductSchema>;
