export type ShopifyProduct = {
  id: string;
  title: string;
  price: string;
  url: string;
  emoji: string;
  image?: string;
  tag?: string;
};

// Placeholder products — replace with real Shopify products (set title, price, url, image).
export const SHOPIFY_PRODUCTS: ShopifyProduct[] = [
  { id: '1', title: 'Air Fryer XL 5.8L', price: '$89.99', url: '#', emoji: '🍟', tag: 'Bestseller' },
  { id: '2', title: 'Kitchen Spoon Set', price: '$19.99', url: '#', emoji: '🥄' },
  { id: '3', title: 'Chef Knife 8"', price: '$49.99', url: '#', emoji: '🔪', tag: 'New' },
  { id: '4', title: 'Digital Food Scale', price: '$24.99', url: '#', emoji: '⚖️' },
  { id: '5', title: 'High-Speed Blender', price: '$129.99', url: '#', emoji: '🥤' },
  { id: '6', title: 'Meal-Prep Containers', price: '$29.99', url: '#', emoji: '🍱' },
];
