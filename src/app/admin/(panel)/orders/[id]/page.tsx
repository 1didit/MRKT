import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { orders } from "@/db/schema";
import { formatPrice } from "@/lib/format";
import { OrderStatusSelect } from "@/components/admin/order-status-select";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/orders"
        className="text-sm text-zinc-500 hover:text-zinc-900"
      >
        ← Orders
      </Link>
      <h1 className="mt-3 font-display text-3xl text-zinc-900">
        {order.number}
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        {order.customerName} · {order.customerEmail} ·{" "}
        {order.createdAt.toLocaleDateString("ru-RU")}
      </p>

      <div className="mt-4 flex items-center gap-3">
        <span className="text-sm text-zinc-500">Status</span>
        <OrderStatusSelect id={order.id} status={order.status} />
      </div>

      {(order.customerPhone || order.shippingAddress) && (
        <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
          {order.customerPhone && (
            <p>
              <span className="text-zinc-400">Phone:</span> {order.customerPhone}
            </p>
          )}
          {order.shippingAddress && (
            <p className="mt-1">
              <span className="text-zinc-400">Address:</span>{" "}
              {order.shippingAddress}
            </p>
          )}
        </div>
      )}

      <div className="mt-6 rounded-xl border border-zinc-200 bg-white">
        <ul className="divide-y divide-zinc-100">
          {order.items.map((it, i) => (
            <li key={i} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-medium text-zinc-900">{it.name}</p>
                <p className="text-xs text-zinc-500">
                  {it.colorName} · {it.size} · ×{it.qty}
                </p>
              </div>
              <p className="text-sm text-zinc-900">
                {formatPrice(it.price * it.qty)}
              </p>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-zinc-200 px-5 py-4">
          <span className="text-sm font-medium text-zinc-900">Total</span>
          <span className="text-base font-semibold text-zinc-900">
            {formatPrice(order.total)}
          </span>
        </div>
      </div>
    </div>
  );
}
