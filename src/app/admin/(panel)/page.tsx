import Link from "next/link";
import { productRepo } from "@/lib/repositories";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const products = await productRepo.list();
  const active = products.filter((p) => p.status === "active").length;
  const totalStock = products.reduce((n, p) => n + p.totalStock, 0);
  const inventoryValue = products.reduce(
    (n, p) => n + p.basePrice * p.totalStock,
    0,
  );
  const lowStock = products.filter((p) => p.totalStock < 10);

  const cards = [
    { label: "Products", value: String(products.length) },
    { label: "Active", value: String(active) },
    { label: "Units in stock", value: String(totalStock) },
    { label: "Inventory value", value: formatPrice(inventoryValue) },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-zinc-900">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Overview of your catalog
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
          <div
            key={c.label}
            className="rounded-xl border border-zinc-200 bg-white p-5"
          >
            <p className="text-[11px] uppercase tracking-wide text-zinc-500">
              {c.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900">
              {c.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">
            Low stock ({lowStock.length})
          </h2>
          <Link
            href="/admin/products"
            className="text-xs text-zinc-500 hover:text-zinc-900"
          >
            All products →
          </Link>
        </div>
        {lowStock.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-400">Everything is well stocked.</p>
        ) : (
          <ul className="mt-4 divide-y divide-zinc-100">
            {lowStock.slice(0, 6).map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between py-2.5 text-sm"
              >
                <Link
                  href={`/admin/products/${p.id}`}
                  className="text-zinc-800 hover:text-accent"
                >
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
