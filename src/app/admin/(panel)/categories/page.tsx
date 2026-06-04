import Link from "next/link";
import { NAV_CATEGORIES } from "@/lib/nav";
import { productRepo } from "@/lib/repositories";

export const dynamic = "force-dynamic";

const COUNT: Record<string, (p: { gender: string; forHome: boolean }) => boolean> =
  {
    female: (p) => p.gender === "women",
    masculine: (p) => p.gender === "men",
    children: (p) => p.gender === "kids",
    home: (p) => p.forHome,
  };

export default async function CategoriesPage() {
  const products = await productRepo.list();

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-3xl text-zinc-900">Categories</h1>
      <p className="mt-1 text-sm text-zinc-500">
        The four storefront categories
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {NAV_CATEGORIES.map((c) => {
          const count = products.filter(COUNT[c.slug]).length;
          return (
            <Link
              key={c.slug}
              href={`/catalog?category=${c.slug}`}
              target="_blank"
              className="rounded-xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-300"
            >
              <p className="font-display text-lg text-zinc-900">{c.label}</p>
              <p className="mt-2 text-sm text-zinc-500">{count} products</p>
            </Link>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-zinc-400">
        Collections and subcategories management — coming in this build.
      </p>
    </div>
  );
}
