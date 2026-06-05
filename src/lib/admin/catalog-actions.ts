"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { productRepo, type ProductStatus } from "@/lib/repositories";

async function guard() {
  if (!(await isAdmin())) throw new Error("Unauthorized");
}

function revalidate() {
  revalidatePath("/admin/products");
  revalidatePath("/admin");
  revalidatePath("/catalog");
  revalidatePath("/");
}

export async function setProductPrice(id: string, price: number) {
  await guard();
  await productRepo.setPrice(id, price);
  revalidate();
}

export async function setProductStatus(id: string, status: ProductStatus) {
  await guard();
  await productRepo.setStatus(id, status);
  revalidate();
}

export async function setProductFeatured(id: string, featured: boolean) {
  await guard();
  await productRepo.setFeatured(id, featured);
  revalidate();
}

export async function deleteProduct(id: string) {
  await guard();
  await productRepo.softDelete(id);
  revalidate();
}

export async function restoreProduct(id: string, qty?: number) {
  await guard();
  await productRepo.restore(id);
  if (typeof qty === "number" && qty > 0) {
    await productRepo.setStockAll(id, qty);
  }
  revalidate();
}

export async function duplicateProduct(id: string) {
  await guard();
  const p = await productRepo.get(id);
  if (!p) return;
  await productRepo.create({
    name: `${p.name} (copy)`,
    description: p.description,
    styleDescription: p.styleDescription,
    care: p.care,
    gender: p.gender,
    forHome: p.forHome,
    style: p.style,
    basePrice: p.basePrice,
    compareAtPrice: p.compareAtPrice,
    status: "draft",
    featured: false,
    details: p.details,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    colorways: p.colorways.map((c) => ({
      colorName: c.colorName,
      swatchHex: c.swatchHex,
      images: c.images,
      variants: c.variants.map((v) => ({
        size: v.size,
        sku: v.sku,
        stock: v.stock,
        priceOverride: v.priceOverride,
      })),
    })),
  });
  revalidate();
}

export async function addStock(ids: string[], qty: number) {
  await guard();
  const n = Math.max(0, Math.round(qty));
  if (!n) return;
  for (const id of ids) await productRepo.addStock(id, n);
  revalidate();
}

export type BulkOp =
  | "active"
  | "draft"
  | "archived"
  | "feature"
  | "unfeature"
  | "delete";

export async function bulkProducts(ids: string[], op: BulkOp) {
  await guard();
  for (const id of ids) {
    if (op === "delete") await productRepo.softDelete(id);
    else if (op === "feature") await productRepo.setFeatured(id, true);
    else if (op === "unfeature") await productRepo.setFeatured(id, false);
    else await productRepo.setStatus(id, op);
  }
  revalidate();
}
