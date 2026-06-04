import Link from "next/link";
import Image from "next/image";
import { productRepo } from "@/lib/repositories";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const GENDER_LABEL: Record<string, string> = {
  women: "Female",
  men: "Masculine",
  kids: "Children's",
};

const STATUS_STYLE: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700",
  draft: "bg-amber-50 text-amber-700",
  archived: "bg-zinc-100 text-zinc-500",
};

export default async function ProductsPage() {
  const products = await productRepo.list();

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-zinc-900">Products</h1>
          <p className="mt-1 text-sm text-zinc-500">{products.length} items</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex h-10 items-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-accent cursor-pointer"
        >
          + New product
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {products.map((p) => (
                <tr key={p.id} className="group hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="flex items-center gap-3"
                    >
                      <span className="relative h-12 w-10 shrink-0 overflow-hidden rounded bg-zinc-100">
                        {p.primaryImage && (
                          <Image
                            src={p.primaryImage}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        )}
                      </span>
                      <span>
                        <span className="block font-medium text-zinc-900 group-hover:text-accent">
                          {p.name}
                        </span>
                        <span className="block text-xs text-zinc-400">
                          {p.colorCount} colour{p.colorCount > 1 ? "s" : ""}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {GENDER_LABEL[p.gender]}
                    {p.forHome && (
                      <span className="ml-1 text-zinc-400">· Home</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-900">
                    {formatPrice(p.basePrice)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        p.totalStock < 10 ? "text-amber-600" : "text-zinc-600",
                      )}
                    >
                      {p.totalStock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                        STATUS_STYLE[p.status],
                      )}
                    >
                      {p.status}
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
