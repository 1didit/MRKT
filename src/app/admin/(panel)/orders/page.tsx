import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db/client";
import { orders } from "@/db/schema";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  new: "bg-blue-50 text-blue-700",
  paid: "bg-emerald-50 text-emerald-700",
  processing: "bg-amber-50 text-amber-700",
  shipped: "bg-violet-50 text-violet-700",
  delivered: "bg-zinc-100 text-zinc-600",
  cancelled: "bg-red-50 text-red-700",
};

export default async function OrdersPage() {
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt));

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-3xl text-zinc-900">Orders</h1>
      <p className="mt-1 text-sm text-zinc-500">{rows.length} orders</p>

      <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500">
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.map((o) => (
                <tr key={o.id} className="group hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-medium text-zinc-900 group-hover:text-accent"
                    >
                      {o.number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{o.customerName}</td>
                  <td className="px-4 py-3 text-zinc-500">
                    {o.createdAt.toLocaleDateString("ru-RU")}
                  </td>
                  <td className="px-4 py-3 text-zinc-900">
                    {formatPrice(o.total)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                        STATUS_STYLE[o.status],
                      )}
                    >
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
