import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { orders } from "@/db/schema";
import { getPayment } from "@/lib/yookassa";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let paymentId: string | undefined;
  try {
    const body = await req.json();
    paymentId = body?.object?.id;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!paymentId) return NextResponse.json({ ok: false }, { status: 400 });

  // Don't trust the webhook body — re-fetch the payment from YooKassa.
  const payment = await getPayment(paymentId);
  if (!payment) return NextResponse.json({ ok: true });

  const orderId = payment.metadata?.orderId;
  if (orderId) {
    if (payment.status === "succeeded" && payment.paid) {
      await db
        .update(orders)
        .set({ status: "paid" })
        .where(eq(orders.id, orderId));
    } else if (payment.status === "canceled") {
      await db
        .update(orders)
        .set({ status: "cancelled" })
        .where(eq(orders.id, orderId));
    }
    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath("/account");
  }

  return NextResponse.json({ ok: true });
}
