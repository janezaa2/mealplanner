export type AdminStats = {
  totalUsers: number;
  totalPlans: number;
  newUsersThisWeek: number;
  newPlansThisWeek: number;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

export type AdminProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
  image: string;
  shopifyUrl: string;
  sortOrder: number;
  createdAt: string;
};

export type PublicProduct = {
  id: string;
  name: string;
  price: number;
  image: string;
  shopifyUrl: string;
  sortOrder: number;
};

export type AppSettings = {
  appName: string;
  primaryColor: string;
};
