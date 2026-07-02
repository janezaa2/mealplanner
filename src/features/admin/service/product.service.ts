import { productRepository } from '@/features/admin/repository/product.repository';
import { AdminProduct, PublicProduct } from '@/features/admin/types/admin.types';
import { ProductType } from '@/features/admin/validations/product.validation';
import { ServiceResult } from '@/shared/types/common';

export async function getAllProductsService(): Promise<ServiceResult<AdminProduct[]>> {
  const items = await productRepository.findAll();
  return {
    data: items.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      inStock: p.inStock ?? true,
      image: p.image ?? '',
      shopifyUrl: p.shopifyUrl ?? '',
      sortOrder: (p.sortOrder as number) ?? 0,
      createdAt: (p.createdAt as unknown as Date)?.toISOString?.() ?? '',
    })),
    status: 200,
  };
}

export async function getPublicProductsService(): Promise<ServiceResult<PublicProduct[]>> {
  const items = await productRepository.findPublic();
  return {
    data: items.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      price: p.price,
      image: p.image ?? '',
      shopifyUrl: p.shopifyUrl ?? '',
      sortOrder: (p.sortOrder as number) ?? 0,
    })),
    status: 200,
  };
}

export async function createProductService(
  input: ProductType
): Promise<ServiceResult<{ message: string }>> {
  await productRepository.create({ ...input, sortOrder: 0 } as Parameters<typeof productRepository.create>[0]);
  return { data: { message: 'Product created' }, status: 201 };
}

export async function updateProductService(
  id: string,
  input: Partial<ProductType>
): Promise<ServiceResult<{ message: string }>> {
  const updated = await productRepository.updateById(id, input);
  if (!updated) return { data: { error: 'Product not found' }, status: 404 };
  return { data: { message: 'Product updated' }, status: 200 };
}

export async function deleteProductService(
  id: string
): Promise<ServiceResult<{ message: string }>> {
  const deleted = await productRepository.deleteById(id);
  if (!deleted) return { data: { error: 'Product not found' }, status: 404 };
  return { data: { message: 'Product deleted' }, status: 200 };
}
