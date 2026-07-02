import { ProductsTable } from '@/features/admin/components/products-table';
import { getAllProductsService } from '@/features/admin/service/product.service';
import { AdminProduct } from '@/features/admin/types/admin.types';

export default async function AdminProductsPage() {
  const { data } = await getAllProductsService();
  const products = (Array.isArray(data) ? data : []) as AdminProduct[];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Products</h2>
        <p className="text-sm text-muted-foreground">{products.length} products</p>
      </div>
      <ProductsTable products={products} />
    </div>
  );
}
