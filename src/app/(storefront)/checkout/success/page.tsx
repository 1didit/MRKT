import Link from "next/link";
import { eq } from "drizzle-orm";
import { CheckCircle2 } from "lucide-react";
import { db } from "@/db/client";
import { orders } from "@/db/schema";
import { getPayment } from "@/lib/yookassa";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  let paid = false;
  if (order) {
    const [o] = await db
      .select({
        id: orders.id,
        status: orders.status,
        paymentId: orders.paymentId,
      })
      .from(orders)
      .where(eq(orders.number, order))
      .limit(1);
    if (o) {
      paid = o.status === "paid";
      // Confirm with YooKassa directly (works even before the webhook fires).
      if (!paid && o.paymentId) {
        const payment = await getPayment(o.paymentId);
        if (payment?.status === "succeeded" && payment.paid) {
          await db
            .update(orders)
            .set({ status: "paid" })
            .where(eq(orders.id, o.id));
          paid = true;
        }
      }
    }
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <CheckCircle2
        size={48}
        className={`mx-auto ${paid ? "text-emerald-500" : "text-accent"}`}
      />
      <h1 className="mt-6 text-3xl font-semibold text-zinc-900">Thank you!</h1>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600">
        Your order{" "}
        {order && <span className="font-medium text-zinc-900">{order}</span>}{" "}
        has been placed.
        {paid
          ? " Payment received — we are preparing your order."
          : " We will confirm payment and delivery shortly."}
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/account"
          className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-7 text-sm font-medium text-white transition-colors hover:bg-accent cursor-pointer"
        >
          View my orders
        </Link>
        <Link
          href="/catalog"
          className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-300 px-7 text-sm text-zinc-900 transition-colors hover:bg-white cursor-pointer"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
