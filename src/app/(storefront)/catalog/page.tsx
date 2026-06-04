import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SlidersHorizontal } from "lucide-react";
import { ProductGrid } from "@/components/product/product-grid";
import {
  CategoryStrip,
  type CategoryTile,
} from "@/components/home/category-strip";
import { getActiveProducts } from "@/lib/catalog";
import { NAV_CATEGORIES } from "@/lib/nav";
import type { ProductSummary } from "@/lib/repositories";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Catalog",
  description: "Velour and cashmere suits — the full NEVA Premium catalog.",
};

const MATCH: Record<string, (p: ProductSummary) => boolean> = {
  female: (p) => p.gender === "women",
  masculine: (p) => p.gender === "men",
  children: (p) => p.gender === "kids",
  home: (p) => p.forHome,
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const t = await getTranslations();
  const { category } = await searchParams;
  const active = NAV_CATEGORIES.find((c) => c.slug === category);
  const [products, all] = await Promise.all([
    getActiveProducts(active?.slug),
    getActiveProducts(),
  ]);

  const tiles: CategoryTile[] = NAV_CATEGORIES.map((c) => ({
    slug: c.slug,
    label: t(`categories.${c.slug}`),
    image: all.find(MATCH[c.slug])?.primaryImage ?? null,
  }));

  return (
    <div className="mx-auto max-w-[1600px] px-3 py-8 sm:px-5">
      <header className="mb-6">
        <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
          {t("catalog.label")}
        </p>
        <h1 className="mt-1 text-3xl font-semibold text-zinc-900 sm:text-4xl">
          {active ? t(`categories.${active.slug}`) : t("catalog.all")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500">
          {t("catalog.subtitle")}
        </p>
      </header>

      <CategoryStrip tiles={tiles} />

      <div className="mb-6 mt-6 flex items-center justify-between border-b border-black/5 pb-4">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-800 transition-colors hover:bg-white cursor-pointer"
        >
          <SlidersHorizontal size={15} /> {t("actions.showFilters")}
        </button>
        <span className="text-sm text-zinc-500">
          {t("catalog.results", { count: products.length })}
        </span>
      </div>

      {products.length > 0 ? (
        <ProductGrid products={products} priorityCount={4} />
      ) : (
        <p className="py-20 text-center text-sm text-zinc-500">
          {t("catalog.empty")}
        </p>
      )}
    </div>
  );
}
