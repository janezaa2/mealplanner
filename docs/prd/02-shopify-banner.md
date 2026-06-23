# PRD 02 — Shopify Promo Banner

## Goal
Sticky promo bar on the public home page that overlays all content and stays visible while
scrolling. Shows a horizontally scrolling strip of Shopify products (kitchen spoon, air
fryer, etc.) the user fills in later. Each product links out to its Shopify URL.

## Data — `src/shared/const/shopify-products.const.ts`
```ts
export type ShopifyProduct = {
  id: string;
  title: string;
  price: string;     // pre-formatted, e.g. "$89.99"
  url: string;       // Shopify product link ("#" placeholder)
  emoji: string;     // fallback glyph when no image
  image?: string;    // optional Shopify CDN image url
  tag?: string;      // optional badge ("Bestseller", "New")
};
export const SHOPIFY_PRODUCTS: ShopifyProduct[] = [ /* placeholders, user replaces */ ];
```
Placeholders: Air Fryer, Kitchen Spoon Set, Chef Knife, Digital Scale, Blender, Meal-Prep
Containers — each with emoji + price + `url: '#'`. User pastes real products later.

## Component — `src/features/marketing/components/shopify-banner.tsx`
- Client component. `fixed top-0 inset-x-0 z-50` so it overlays every component.
- Left: small label with `ShoppingBag` (lucide) icon, e.g. "Kitchen shop".
- Center/right: scrollable row of product chips (`overflow-x-auto`), each chip = emoji/image +
  title + price + optional tag badge, wrapped in an external `<a target="_blank" rel>` link.
- Tailwind only, standard scale, no inline styles, no arbitrary values.
- Uses `next/image` only if a product has `image` set; otherwise render `emoji` text.

## Integration — `src/features/marketing/components/home-page.tsx`
- Render `<ShopifyBanner />` as the first child (above `<Header/>`).
- Add top padding (`pt-12`) to the page's outer wrapper so the fixed banner does not cover
  the header. Standard Tailwind scale only.

## Constraints
- Banner is a component (not inline in a page file) per CLAUDE.md.
- No new dependencies.
- `next.config.ts` must allow `cdn.shopify.com` + `images.unsplash.com` for future images
  (handled in wiring step).
