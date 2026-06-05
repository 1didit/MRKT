export type Gender = "women" | "men" | "kids";
export type ProductStatus = "draft" | "active" | "archived";

export interface Variant {
  id: string;
  colorwayId: string;
  size: string;
  sku: string;
  stock: number;
  priceOverride: number | null;
}

export interface Colorway {
  id: string;
  colorName: string;
  swatchHex: string | null;
  images: string[];
  variants: Variant[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  styleDescription: string;
  care: string;
  gender: Gender;
  forHome: boolean;
  style: string | null;
  basePrice: number;
  compareAtPrice: number | null;
  status: ProductStatus;
  featured: boolean;
  details: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  colorways: Colorway[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductSummary {
  id: string;
  slug: string;
  name: string;
  status: ProductStatus;
  featured: boolean;
  gender: Gender;
  forHome: boolean;
  basePrice: number;
  compareAtPrice: number | null;
  colorName: string | null;
  primaryImage: string | null;
  secondaryImage: string | null;
  colorCount: number;
  totalStock: number;
  updatedAt: Date;
}

export interface VariantInput {
  size: string;
  sku: string;
  stock: number;
  priceOverride?: number | null;
}

export interface ColorwayInput {
  colorName: string;
  swatchHex?: string | null;
  images: string[];
  variants: VariantInput[];
}

export interface ProductInput {
  slug?: string;
  name: string;
  description?: string;
  styleDescription?: string;
  care?: string;
  gender: Gender;
  forHome?: boolean;
  style?: string | null;
  basePrice: number;
  compareAtPrice?: number | null;
  status?: ProductStatus;
  featured?: boolean;
  details?: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  colorways: ColorwayInput[];
}

export interface ListParams {
  search?: string;
  category?: string; // female | masculine | children | home
  status?: ProductStatus;
}

/**
 * Single source of truth for catalog data. Implemented today by
 * SqliteProductRepository; later swappable for a CsCartProductRepository
 * against the CS-Cart REST API without touching the admin UI.
 */
export interface ProductRepository {
  list(params?: ListParams): Promise<ProductSummary[]>;
  get(id: string): Promise<Product | null>;
  getBySlug(slug: string): Promise<Product | null>;
  create(input: ProductInput): Promise<Product>;
  update(id: string, input: ProductInput): Promise<Product>;
  delete(id: string): Promise<void>;
  setStatus(id: string, status: ProductStatus): Promise<void>;
  setFeatured(id: string, featured: boolean): Promise<void>;
  setPrice(id: string, price: number): Promise<void>;
  addStock(productId: string, qty: number): Promise<void>;
  setStockAll(productId: string, qty: number): Promise<void>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  listDeleted(): Promise<ProductSummary[]>;
  updateVariantStock(variantId: string, stock: number): Promise<void>;
}
