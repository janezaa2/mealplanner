/* eslint-disable max-lines */
'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDown, ArrowUp } from 'lucide-react';
import Image from 'next/image';
import { Fragment, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { z } from 'zod';

import { AdminProduct } from '@/features/admin/types/admin.types';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { http } from '@/shared/lib/http';

const FormSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.coerce.number().min(0),
  category: z.string().min(1),
  image: z.string().optional(),
  shopifyUrl: z.string().optional(),
});
type FormType = z.infer<typeof FormSchema>;

type Props = { products: AdminProduct[] };

export const ProductsTable = ({ products: initial }: Props) => {
  const [list, setList] = useState(
    [...initial].sort((a, b) => a.sortOrder - b.sortOrder)
  );
  const [loading, setLoading] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [shopifyUrl, setShopifyUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');

  const form = useForm<FormType>({
    resolver: zodResolver(FormSchema) as Resolver<FormType>,
    defaultValues: { name: '', description: '', price: 0, category: '', image: '', shopifyUrl: '' },
  });

  const editForm = useForm<FormType>({
    resolver: zodResolver(FormSchema) as Resolver<FormType>,
    defaultValues: { name: '', description: '', price: 0, category: '', image: '', shopifyUrl: '' },
  });

  const importFromShopify = async () => {
    if (!shopifyUrl.trim()) return;
    setImporting(true);
    setImportError('');
    try {
      const data = await http.post<FormType>('/admin/products/shopify', { url: shopifyUrl });
      form.reset(data);
      setShopifyUrl('');
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Could not fetch product');
    } finally {
      setImporting(false);
    }
  };

  const createProduct = async (data: FormType) => {
    setLoading('create');
    try {
      await http.post('/admin/products', { ...data, inStock: true });
      const fresh = await http.get<AdminProduct[]>('/admin/products');
      setList([...fresh].sort((a, b) => a.sortOrder - b.sortOrder));
      form.reset({ name: '', description: '', price: 0, category: '', image: '', shopifyUrl: '' });
      setShowForm(false);
    } finally {
      setLoading(null);
    }
  };

  const saveEdit = async (id: string, data: FormType) => {
    setLoading(id + '-edit');
    try {
      await http.patch(`/admin/products/${id}`, data);
      setList((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...data, price: Number(data.price) } : p))
      );
      setEditingId(null);
    } finally {
      setLoading(null);
    }
  };

  const startEdit = (product: AdminProduct) => {
    editForm.reset({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      shopifyUrl: product.shopifyUrl,
    });
    setEditingId(product.id);
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= list.length) return;

    const updated = [...list];
    const aOrder = updated[index].sortOrder;
    const bOrder = updated[target].sortOrder;

    // If sortOrders are equal, assign distinct ones first
    const newA = direction === -1 ? Math.min(aOrder, bOrder) - 1 : Math.max(aOrder, bOrder) + 1;
    updated[index] = { ...updated[index], sortOrder: newA };
    updated[target] = { ...updated[target], sortOrder: bOrder === aOrder ? newA + 1 : aOrder };

    const sorted = [...updated].sort((a, b) => a.sortOrder - b.sortOrder);
    // Re-assign clean sequential sortOrders
    const reindexed = sorted.map((p, i) => ({ ...p, sortOrder: i }));
    setList(reindexed);

    setLoading('reorder');
    try {
      await http.post('/admin/products/reorder', {
        updates: reindexed.map((p) => ({ id: p.id, sortOrder: p.sortOrder })),
      });
    } finally {
      setLoading(null);
    }
  };

  const toggleStock = async (id: string, inStock: boolean) => {
    setLoading(id);
    try {
      await http.patch(`/admin/products/${id}`, { inStock: !inStock });
      setList((prev) => prev.map((p) => (p.id === id ? { ...p, inStock: !inStock } : p)));
    } finally {
      setLoading(null);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    setLoading(id);
    try {
      await http.delete(`/admin/products/${id}`);
      setList((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => { setShowForm((v) => !v); form.reset(); setImportError(''); }}>
          {showForm ? 'Cancel' : 'Add product'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add product</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium">Import from Shopify</p>
              <div className="flex gap-2">
                <Input
                  placeholder="https://your-store.myshopify.com/products/product-name"
                  value={shopifyUrl}
                  onChange={(e) => setShopifyUrl(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={importing || !shopifyUrl.trim()}
                  onClick={importFromShopify}
                >
                  {importing ? 'Importing...' : 'Import'}
                </Button>
              </div>
              {importError && <p className="text-xs text-destructive">{importError}</p>}
              <p className="text-xs text-muted-foreground">
                Paste a Shopify product URL — name, price, description and image auto-fill below.
              </p>
            </div>

            <div className="h-px bg-border" />

            <Form {...form}>
              <form onSubmit={form.handleSubmit(createProduct)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem><FormLabel>Category</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="image" render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Image URL</FormLabel>
                      <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                {form.watch('image') && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Image preview</p>
                    <div className="relative h-32 w-32 overflow-hidden rounded-md border border-border">
                      <Image src={form.watch('image') as string} alt="Product" fill className="object-cover" unoptimized />
                    </div>
                  </div>
                )}

                <Button type="submit" disabled={loading === 'create'}>
                  {loading === 'create' ? 'Creating...' : 'Create product'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <div className="rounded-md border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground w-8">Order</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Stock</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Source</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No products yet</td></tr>
            )}
            {list.map((product, index) => (
              <Fragment key={product.id}>
                <tr className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-2 py-3">
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => move(index, -1)}
                        disabled={index === 0 || loading === 'reorder'}
                        className="rounded p-0.5 hover:bg-accent disabled:opacity-30"
                        aria-label="Move up"
                      >
                        <ArrowUp className="size-3.5" />
                      </button>
                      <button
                        onClick={() => move(index, 1)}
                        disabled={index === list.length - 1 || loading === 'reorder'}
                        className="rounded p-0.5 hover:bg-accent disabled:opacity-30"
                        aria-label="Move down"
                      >
                        <ArrowDown className="size-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.image && (
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-md border border-border">
                          <Image src={product.image} alt={product.name} fill className="object-cover" unoptimized />
                        </div>
                      )}
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{product.category}</td>
                  <td className="px-4 py-3">${product.price.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={[
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      product.inStock
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                    ].join(' ')}>
                      {product.inStock ? 'In stock' : 'Out of stock'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {product.shopifyUrl ? (
                      <a
                        href={product.shopifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary underline underline-offset-2 hover:opacity-80"
                      >
                        Shopify
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">Manual</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => editingId === product.id ? setEditingId(null) : startEdit(product)}
                      >
                        {editingId === product.id ? 'Cancel' : 'Edit'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={loading === product.id}
                        onClick={() => toggleStock(product.id, product.inStock)}
                      >
                        {product.inStock ? 'Mark out' : 'Mark in'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={loading === product.id}
                        onClick={() => deleteProduct(product.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>

                {editingId === product.id && (
                  <tr className="border-b border-border bg-muted/20">
                    <td colSpan={7} className="px-4 py-4">
                      <Form {...editForm}>
                        <form onSubmit={editForm.handleSubmit((data) => saveEdit(product.id, data))} className="space-y-3">
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            <FormField control={editForm.control} name="name" render={({ field }) => (
                              <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={editForm.control} name="category" render={({ field }) => (
                              <FormItem><FormLabel>Category</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={editForm.control} name="price" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Price ($)</FormLabel>
                                <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={editForm.control} name="description" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={editForm.control} name="image" render={({ field }) => (
                              <FormItem className="sm:col-span-2">
                                <FormLabel>Photo URL</FormLabel>
                                <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>
                          {editForm.watch('image') && (
                            <div className="relative h-24 w-24 overflow-hidden rounded-md border border-border">
                              <Image src={editForm.watch('image') as string} alt="preview" fill className="object-cover" unoptimized />
                            </div>
                          )}
                          <Button type="submit" size="sm" disabled={loading === product.id + '-edit'}>
                            {loading === product.id + '-edit' ? 'Saving...' : 'Save changes'}
                          </Button>
                        </form>
                      </Form>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
