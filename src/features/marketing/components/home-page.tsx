import { Sparkles, UtensilsCrossed } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { getPublicProductsService } from '@/features/admin/service/product.service';
import { PublicProduct } from '@/features/admin/types/admin.types';
import { ShopifyBanner } from '@/features/marketing/components/shopify-banner';
import { Footer } from '@/shared/components/layout/footer';
import { Header } from '@/shared/components/layout/header';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { HOW_IT_WORKS, SAMPLE_DAY } from '@/shared/const/home.const';
import { SHOPIFY_PRODUCTS } from '@/shared/const/shopify-products.const';
import { cn } from '@/shared/lib/utils';

const FALLBACK_PRODUCTS: PublicProduct[] = SHOPIFY_PRODUCTS.map((p, i) => ({
  id: p.id,
  name: p.title,
  price: parseFloat(p.price.replace(/[^0-9.]/g, '')),
  image: p.image ?? '',
  shopifyUrl: p.url === '#' ? '' : p.url,
  sortOrder: i,
}));

export const HomePage = async () => {
  const sampleTotal = SAMPLE_DAY.reduce((sum, meal) => sum + meal.calories, 0);

  const { data: rawProducts } = await getPublicProductsService();
  const dbProducts = Array.isArray(rawProducts) ? rawProducts : [];
  const products = dbProducts.length > 0 ? dbProducts : FALLBACK_PRODUCTS;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex flex-1 flex-col">
        <section className="relative flex h-screen flex-col overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1600&q=85&auto=format&fit=crop"
            alt="Athlete with trained body representing fitness and health goals"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/60" />

          <div className="relative z-10 flex flex-col h-full">
            <Header glass />

            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center sm:px-10">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-white/70" aria-hidden="true" />
                <span className="text-xs font-medium uppercase tracking-widest text-white/70">
                AI meal planner
                </span>
              </div>

              <h1
                className={cn(
                  'mx-auto max-w-3xl text-white',
                  'text-5xl font-black leading-tight tracking-tight',
                  'sm:text-6xl md:text-7xl'
                )}
              >
              A full week of meals,
                <br />
              planned in seconds.
              </h1>

              <p className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
              Tell us your body stats and goal, and our AI builds a personalized 7-day meal
              plan — calories, macros, ingredients and recipes for every meal.
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <Button size="lg" asChild className="px-8 font-semibold">
                  <Link href="/sign-up">Generate my plan</Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="border-white/30 bg-white/10 px-8 text-white backdrop-blur-sm hover:bg-white/20"
                >
                  <Link href="/sign-in">Sign in</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <ShopifyBanner products={products} />

        <div className="flex flex-col items-center px-6 pb-24 pt-20 text-center sm:px-10">
          <div className="h-px w-full max-w-5xl bg-gradient-to-r from-transparent via-border to-transparent" aria-hidden="true" />

          <section className="mt-20 w-full max-w-5xl" aria-label="How it works">
            <div className="mb-12 text-left">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              How it works
              </p>
            </div>

            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3">
              {HOW_IT_WORKS.map((item) => (
                <Card
                  key={item.step}
                  className="group relative gap-0 rounded-none border-0 shadow-none transition-colors duration-300 hover:bg-accent"
                >
                  <CardHeader className="flex flex-row items-start justify-between px-8 pb-5 pt-8">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-md border border-border bg-muted/40',
                        'px-2 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground'
                      )}
                    >
                    Step {item.step}
                    </span>
                  </CardHeader>
                  <CardContent className="px-8 pb-8 text-left">
                    <h3 className="text-xl font-bold tracking-tight text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="mt-20 w-full max-w-5xl" aria-label="Sample day">
            <div className="mb-12 flex items-center justify-between text-left">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              A sample day
              </p>
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <UtensilsCrossed className="h-4 w-4" aria-hidden="true" />
                {sampleTotal} kcal
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {SAMPLE_DAY.map((meal) => (
                <Card key={meal.type} className="text-left">
                  <CardHeader className="pb-2">
                    <span
                      className={cn(
                        'inline-flex w-fit items-center rounded-full border border-border bg-muted/40',
                        'px-2 py-0.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground'
                      )}
                    >
                      {meal.type}
                    </span>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <h3 className="text-base font-bold leading-snug tracking-tight text-foreground">
                      {meal.name}
                    </h3>
                    <p className="text-2xl font-black text-foreground">
                      {meal.calories}
                      <span className="ml-1 text-sm font-medium text-muted-foreground">kcal</span>
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="rounded-md bg-muted/60 px-2 py-1">P {meal.protein}g</span>
                      <span className="rounded-md bg-muted/60 px-2 py-1">C {meal.carbs}g</span>
                      <span className="rounded-md bg-muted/60 px-2 py-1">F {meal.fat}g</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-12">
              <Button size="lg" asChild className="px-8 font-semibold">
                <Link href="/sign-up">Get your personalized plan</Link>
              </Button>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};
