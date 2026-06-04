"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { orders } from "@/db/schema";
import { isAdmin } from "@/lib/auth";

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
