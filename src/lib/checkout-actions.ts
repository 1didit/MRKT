"use server";

import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/client";
import { orders, type OrderItemSnapshot } from "@/db/schema";
import { productRepo } from "@/lib/repositories";

const schema = z.object({
  name: z.string().min(1, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(3, "Enter your phone"),
  address: z.string().min(3, "Enter delivery address"),
  items: z
    .array(
      z.object({
        slug: z.string(),
        colorName: z.string(),
        size: z.string(),
        qty: z.number().int().min(1),
      }),
    )
    .min(1, "Your basket is empty"),
});

export type CheckoutResult =
  | { ok: true; id: string; number: string }
  | { ok: false; error: string };

export async function createOrderAction(
  input: unknown,
): Promise<CheckoutResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  const data = parsed.data;

  // Rebuild the order from the DB — never trust client prices.
  const snapshots: OrderItemSnapshot[] = [];
  const stockUpdates: { variantId: string; newStock: number }[] = [];
  let total = 0;

  for (const it of data.items) {
    const product = await productRepo.getBySlug(it.slug);
    if (!product || product.status !== "active") {
      return { ok: false, error: `Product unavailable: ${it.slug}` };
    }
    const colorway =
      product.colorways.find((c) => c.colorName === it.colorName) ??
      product.colorways[0];
    const variant = colorway?.variants.find((v) => v.size === it.size);
    if (!colorway || !variant) {
      return {
        ok: false,
        error: `Size ${it.size} unavailable for ${product.name}`,
      };
    }
    if (variant.stock < it.qty) {
      return {
        ok: false,
        error: `Not enough stock: ${product.name} (${it.size})`,
      };
    }
    const price = variant.priceOverride ?? product.basePrice;
    total += price * it.qty;
    snapshots.push({
      productId: product.slug,
      name: product.name,
      colorName: colorway.colorName,
      size: it.size,
      price,
      qty: it.qty,
      image: colorway.images[0] ?? "",
    });
    stockUpdates.push({ variantId: variant.id, newStock: variant.stock - it.qty });
  }

  const count = (await db.select({ id: orders.id }).from(orders)).length;
  const number = `NP-${1001 + count}`;
  const id = nanoid();

  await db.insert(orders).values({
    id,
    number,
    customerName: data.name,
    customerEmail: data.email.toLowerCase(),
    customerPhone: data.phone,
    shippingAddress: data.address,
    status: "new",
    total,
    items: snapshots,
  });

  for (const s of stockUpdates) {
    await productRepo.updateVariantStock(s.variantId, s.newStock);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/account");
  revalidatePath("/");
  revalidatePath("/catalog");

  return { ok: true, id, number };
}
