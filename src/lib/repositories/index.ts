import { SqliteProductRepository } from "./sqlite-product-repository";
import type { ProductRepository } from "./types";

/**
 * The app talks to this singleton only. To move products to CS-Cart later,
 * implement CsCartProductRepository (same interface) and switch here based on
 * an env flag — the admin UI and storefront stay untouched.
 */
export const productRepo: ProductRepository = new SqliteProductRepository();

export * from "./types";
