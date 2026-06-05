import Link from "next/link";
import { ProductsTable } from "@/components/admin/products-table";
import { productRepo } from "@/lib/repositories";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const [products, deleted] = await Promise.all([
    productRepo.list(),
    productRepo.listDeleted(),
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
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

      <ProductsTable
        products={products}
        deleted={deleted}
        initialSearch={q ?? ""}
      />
    </div>
  );
}
