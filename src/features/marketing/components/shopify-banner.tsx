'use client';

import { ChevronLeft, ChevronRight, ShoppingBag, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { useRef } from 'react';

import { Button } from '@/shared/components/ui/button';
import { SHOPIFY_PRODUCTS } from '@/shared/const/shopify-products.const';
import { cn } from '@/shared/lib/utils';

export const ShopifyBanner = () => {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: number) => {
    scrollerRef.current?.scrollBy({ left: direction * 320, behavior: 'smooth' });
  };

  return (
    <section className="border-t border-border bg-muted/20 px-6 py-12 sm:px-10" aria-label="Kitchen shop">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="size-5 text-muted-foreground" aria-hidden="true" />
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Kitchen shop
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => scroll(-1)}
              aria-label="Scroll left"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => scroll(1)}
              aria-label="Scroll right"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
        >
          {SHOPIFY_PRODUCTS.map((product) => (
            <a
              key={product.id}
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'group flex w-64 shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-border',
                'bg-background transition-shadow hover:shadow-md'
              )}
            >
              <div className="relative flex h-44 items-center justify-center bg-muted">
                {product.tag ? (
                  <span className="absolute left-3 top-3 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                    {product.tag}
                  </span>
                ) : null}
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    sizes="256px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <span className="text-6xl" aria-hidden="true">
                    {product.emoji}
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-3 p-4">
                <h3 className="text-sm font-semibold leading-snug text-foreground">
                  {product.title}
                </h3>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-lg font-bold text-foreground">{product.price}</span>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                    <ShoppingCart className="size-3.5" aria-hidden="true" />
                    Add
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
