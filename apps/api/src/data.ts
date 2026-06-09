import { readFileSync } from "node:fs";

export type Category = "rings" | "earrings" | "necklaces" | "bracelets" | "mangalsutras";

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: Category;
  collection: string;
  description: string;
  story: string;
  price: number;
  originalPrice?: number;
  metalColor: "Yellow Gold" | "Rose Gold" | "White Gold";
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
}

function loadJson<T>(name: string): T {
  return JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), "utf8")) as T;
}

export const products = loadJson<Product[]>("products.json");
export const defaultProfile = loadJson<Profile>("profile.json");
