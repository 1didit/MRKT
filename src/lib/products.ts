import productsData from "@/data/products.json";
import { NAV_CATEGORIES } from "./nav";

export type Gender = "women" | "men" | "kids";

export interface Product {
  id: string;
  name: string;
  colorName: string;
  sku: string;
  price: number;
  images: string[];
  description: string;
  care?: string;
  styleDescription?: string;
  details: string[];
  sizes: string[];
  gender: Gender;
  style?: string;
  category?: string;
}

export const products = productsData as unknown as Product[];

export interface CategoryDef {
  slug: string;
  label: string;
  match: (p: Product) => boolean;
}

const MATCHERS: Record<string, (p: Product) => boolean> = {
  female: (p) => p.gender === "women",
  masculine: (p) => p.gender === "men",
  children: (p) => p.gender === "kids",
  home: (p) => p.category === "home",
};

/** The four storefront categories requested by the brand. */
export const CATEGORIES: CategoryDef[] = NAV_CATEGORIES.map((c) => ({
  ...c,
  match: MATCHERS[c.slug],
}));

export function getCategory(slug: string): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function productsByCategory(slug: string): Product[] {
  const cat = getCategory(slug);
  if (!cat) return [];
  return products.filter(cat.match);
}

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.id === slug);
}

/** A curated selection for the homepage featured grid. */
export function featuredProducts(limit = 8): Product[] {
  // one representative per color family, spread across genders
  const seen = new Set<Gender>();
  const lead: Product[] = [];
  const rest: Product[] = [];
  for (const p of products) {
    if (!seen.has(p.gender)) {
      seen.add(p.gender);
      lead.push(p);
    } else {
      rest.push(p);
    }
  }
  return [...lead, ...rest].slice(0, limit);
}

export { formatPrice } from "./format";
