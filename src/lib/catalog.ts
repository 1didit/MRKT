import "server-only";
import { productRepo } from "@/lib/repositories";
import type { ProductSummary } from "@/lib/repositories";

export async function getActiveProducts(
  category?: string,
): Promise<ProductSummary[]> {
  return productRepo.list({ status: "active", category });
}

export async function getFeatured(limit = 8): Promise<ProductSummary[]> {
  const all = await productRepo.list({ status: "active" });
  const featured = all.filter((p) => p.featured);
  return (featured.length ? featured : all).slice(0, limit);
}

export function getProductBySlug(slug: string) {
  return productRepo.getBySlug(slug);
}
