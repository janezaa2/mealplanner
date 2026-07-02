import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

const ShopifyImportSchema = z.object({
  url: z.string().url(),
});

type ShopifyProduct = {
  title: string;
  body_html: string;
  product_type: string;
  variants: Array<{ price: string }>;
  images: Array<{ src: string }>;
};

function parseShopifyUrl(url: string): { domain: string; handle: string } | null {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split('/').filter(Boolean);
    const productsIdx = parts.indexOf('products');
    if (productsIdx === -1 || !parts[productsIdx + 1]) return null;
    return { domain: parsed.hostname, handle: parts[productsIdx + 1] };
  } catch {
    return null;
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const user = session?.user as { role?: string } | undefined;
    if (!session || user?.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const validated = await validateBody(req, ShopifyImportSchema);
    if (validated instanceof NextResponse) return validated;

    const parsed = parseShopifyUrl(validated.data.url);
    if (!parsed) {
      return NextResponse.json({ error: 'Invalid Shopify product URL' }, { status: 400 });
    }

    const jsonUrl = `https://${parsed.domain}/products/${parsed.handle}.json`;
    const response = await fetch(jsonUrl, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Could not fetch product from Shopify. Make sure the URL is correct and the product is public.' },
        { status: 400 }
      );
    }

    const json = (await response.json()) as { product: ShopifyProduct };
    const p = json.product;

    return NextResponse.json({
      name: p.title ?? '',
      description: stripHtml(p.body_html ?? ''),
      price: parseFloat(p.variants?.[0]?.price ?? '0'),
      category: p.product_type ?? 'General',
      image: p.images?.[0]?.src ?? '',
      shopifyUrl: validated.data.url,
      inStock: true,
    });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
