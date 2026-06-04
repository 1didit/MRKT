import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db/client";
import { orders } from "@/db/schema";
import { productRepo } from "@/lib/repositories";
import { formatPrice } from "@/lib/format";
import { SalesChart } from "@/components/admin/sales-chart";
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

export default async function AdminDashboard() {
  const [products, orderRows] = await Promise.all([
    productRepo.list(),
    db.select().from(orders).orderBy(desc(orders.createdAt)),
  ]);

  const totalStock = products.reduce((n, p) => n + p.totalStock, 0);
  const inventoryValue = products.reduce(
    (n, p) => n + p.basePrice * p.totalStock,
    0,
  );
  const revenue = orderRows.reduce((n, o) => n + o.total, 0);
  const lowStock = products.filter((p) => p.totalStock < 10);

  // last 14 days sales
  const days: Date[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  const chart = days.map((d) => {
    const next = new Date(d);
    next.setDate(d.getDate() + 1);
    const total = orderRows
      .filter((o) => o.createdAt >= d && o.createdAt < next)
      .reduce((n, o) => n + o.total, 0);
    return {
      label: d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" }),
      total,
    };
  });

  const recent = orderRows.slice(0, 5);

  const cards = [
    { label: "Revenue", value: formatPrice(revenue) },
    { label: "Orders", value: String(orderRows.length) },
    { label: "Products", value: String(products.length) },
    { label: "Inventory value", value: formatPrice(inventoryValue) },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-zinc-900">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {totalStock} units in stock
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex h-10 items-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-accent cursor-pointer"
        >
          + New product
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-zinc-200 bg-white p-5">
            <p className="text-[11px] uppercase tracking-wide text-zinc-500">
              {c.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-zinc-900">
            Sales · last 14 days
          </h2>
          <SalesChart data={chart} />
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">Recent orders</h2>
            <Link href="/admin/orders" className="text-xs text-zinc-500 hover:text-zinc-900">
              All →
            </Link>
          </div>
          <ul className="divide-y divide-zinc-100">
            {recent.map((o) => (
              <li key={o.id} className="flex items-center justify-between py-2.5">
                <Link
                  href={`/admin/orders/${o.id}`}
                  className="text-sm text-zinc-800 hover:text-accent"
                >
                  {o.number}
                  <span className="ml-2 text-xs text-zinc-400">
                    {o.customerName}
                  </span>
                </Link>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
                    STATUS_STYLE[o.status],
                  )}
                >
                  {o.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">
            Low stock ({lowStock.length})
          </h2>
          <Link href="/admin/products" className="text-xs text-zinc-500 hover:text-zinc-900">
            All products →
          </Link>
        </div>
        {lowStock.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-400">Everything is well stocked.</p>
        ) : (
          <ul className="mt-4 divide-y divide-zinc-100">
            {lowStock.slice(0, 6).map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                <Link href={`/admin/products/${p.id}`} className="text-zinc-800 hover:text-accent">
                  {p.name}
                </Link>
                <span className="text-zinc-500">{p.totalStock} left</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
