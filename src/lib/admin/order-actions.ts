"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { orders } from "@/db/schema";
import { isAdmin } from "@/lib/auth";
import { productRepo } from "@/lib/repositories";

export type OrderStatus =
  | "new"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export async function setOrderStatus(id: string, status: OrderStatus) {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  await db.update(orders).set({ status }).where(eq(orders.id, id));
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin");
}

/**
 * Admin testing/management helper: return an order's items to stock and mark
 * it cancelled. Skips restock if already cancelled (no double restock).
 */
export async function returnAndCancelOrder(id: string) {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);
  if (!order || order.status === "cancelled") return;

  for (const item of order.items) {
    const product = await productRepo.getBySlug(item.productId);
    if (!product) continue;
    const colorway =
      product.colorways.find((c) => c.colorName === item.colorName) ??
      product.colorways[0];
    const variant = colorway?.variants.find((v) => v.size === item.size);
    if (variant) {
      await productRepo.updateVariantStock(variant.id, variant.stock + item.qty);
    }
  }

  await db.update(orders).set({ status: "cancelled" }).where(eq(orders.id, id));
  revalidatePath("/account");
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/");
  revalidatePath("/catalog");
}
