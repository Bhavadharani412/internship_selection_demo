export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  collection: string;
  description: string;
  story: string;
  price: number;
  originalPrice?: number;
  metalColor: string;
  metal: string;
  gemstone: string;
  style: string[];
  occasion: string[];
  rating: number;
  reviews: number;
  badge?: string;
  images: string[];
  sizes: string[];
  inventory: number;
  isNew?: boolean;
  popularity: number;
}

export interface CartLine {
  productId: string;
  size: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  items: CartLine[];
  subtotal: number;
  shipping: number;
  total: number;
}

export interface Profile {
  name: string;
  email: string;
  phone: string;
  birthday: string;
  memberSince: string;
  preferences: {
    categories: string[];
    metalColors: string[];
    occasions: string[];
  };
  address: {
    label: string;
    line1: string;
    city: string;
    state: string;
    pincode: string;
  };
  stats: {
    wishlistCount: number;
    cartCount: number;
    appointmentCount: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, number | string>;
  error?: { code: string; message: string } | null;
}
