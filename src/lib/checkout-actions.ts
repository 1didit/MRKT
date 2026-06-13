"use server";

import { eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/db/client";
import { counters, orders, variants, type OrderItemSnapshot } from "@/db/schema";
import { productRepo } from "@/lib/repositories";
import { createPayment, isConfigured } from "@/lib/yookassa";

/** Thrown inside the checkout transaction when a variant was bought out. */
class OutOfStockError extends Error {}

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
  | { ok: true; id: string; number: string; confirmationUrl?: string }
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
  const stockUpdates: { variantId: string; qty: number; label: string }[] = [];
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
    const label = `${product.name} (${it.size})`;
    if (variant.stock < it.qty) {
      return { ok: false, error: `Not enough stock: ${label}` };
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
    stockUpdates.push({ variantId: variant.id, qty: it.qty, label });
  }

  const id = nanoid();

  // Decrement stock, allocate the order number, and write the order atomically.
  // The conditional UPDATE (stock >= qty) makes oversell impossible under
  // concurrency; the counter RETURNING guarantees unique sequential numbers.
  let number: string;
  try {
    number = await db.transaction(async (tx) => {
      for (const u of stockUpdates) {
        const res = await tx
          .update(variants)
          .set({ stock: sql`${variants.stock} - ${u.qty}` })
          .where(
            sql`${variants.id} = ${u.variantId} AND ${variants.stock} >= ${u.qty}`,
          );
        if (res.rowsAffected !== 1) {
          throw new OutOfStockError(`Not enough stock: ${u.label}`);
        }
      }

      const [seq] = await tx
        .update(counters)
        .set({ value: sql`${counters.value} + 1` })
        .where(eq(counters.id, "order_number"))
        .returning({ value: counters.value });
      const num = `NP-${seq?.value ?? Date.now()}`;

      await tx.insert(orders).values({
        id,
        number: num,
        customerName: data.name,
        customerEmail: data.email.toLowerCase(),
        customerPhone: data.phone,
        shippingAddress: data.address,
        status: "new",
        total,
        items: snapshots,
      });
      return num;
    });
  } catch (e) {
    if (e instanceof OutOfStockError) return { ok: false, error: e.message };
    throw e;
  }

  // Create a YooKassa payment if configured; otherwise the order stays "new".
  let confirmationUrl: string | undefined;
  if (isConfigured()) {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    const proto = h.get("x-forwarded-proto") ?? "https";
    if (host) {
      const payment = await createPayment({
        amount: total,
        orderId: id,
        orderNumber: number,
        returnUrl: `${proto}://${host}/checkout/success?order=${encodeURIComponent(number)}`,
        description: `NEVA Premium · order ${number}`,
      });
      if (payment) {
        confirmationUrl = payment.confirmationUrl;
        await db
          .update(orders)
          .set({ paymentId: payment.id })
          .where(eq(orders.id, id));
      }
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/account");
  revalidatePath("/");
  revalidatePath("/catalog");

  return { ok: true, id, number, confirmationUrl };
}
