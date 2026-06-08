import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ProductGrid } from "@/components/product/product-grid";
import {
  CategoryStrip,
  type CategoryTile,
} from "@/components/home/category-strip";
import { getActiveProducts } from "@/lib/catalog";
import { NAV_CATEGORIES } from "@/lib/nav";
import { SUBCATEGORIES, subcategoryLabel } from "@/lib/subcategories";
import type { ProductSummary } from "@/lib/repositories";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Catalog",
  description: "The full NEVA Premium catalog.",
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
  searchParams: Promise<{ category?: string; subcategory?: string }>;
}) {
  const t = await getTranslations();
  const locale = await getLocale();
  const { category, subcategory } = await searchParams;
  const active = NAV_CATEGORIES.find((c) => c.slug === category);

  const [inCategory, all] = await Promise.all([
    getActiveProducts(active?.slug),
    getActiveProducts(),
  ]);

  const products =
    active && subcategory
      ? inCategory.filter((p) => p.subcategory === subcategory)
      : inCategory;

  const tiles: CategoryTile[] = NAV_CATEGORIES.map((c) => ({
    slug: c.slug,
    label: t(`categories.${c.slug}`),
    image: all.find(MATCH[c.slug])?.primaryImage ?? null,
  }));

  // sub-categories present in the active top category
  const subs = active
    ? SUBCATEGORIES.filter((sc) =>
        inCategory.some((p) => p.subcategory === sc.slug),
      )
    : [];
  const subCount = (slug: string) =>
    inCategory.filter((p) => p.subcategory === slug).length;

  const pill =
    "shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors";

  return (
    <div className="mx-auto max-w-[1600px] px-3 py-8 sm:px-5">
      <header className="mb-6">
        <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
          {t("catalog.label")}
        </p>
        <h1 className="mt-1 text-3xl font-semibold text-zinc-900 sm:text-4xl">
          {active && subcategory
            ? subcategoryLabel(subcategory, locale)
            : active
              ? t(`categories.${active.slug}`)
              : t("catalog.all")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500">
          {t("catalog.subtitle")}
        </p>
      </header>

      <CategoryStrip tiles={tiles} />

      {/* sub-category filter */}
      {subs.length > 1 && active && (
        <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto">
          <Link
            href={`/catalog?category=${active.slug}`}
            className={cn(
              pill,
              !subcategory
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-300 text-zinc-700 hover:bg-white",
            )}
          >
            {t("catalog.all")} ({inCategory.length})
          </Link>
          {subs.map((sc) => (
            <Link
              key={sc.slug}
              href={`/catalog?category=${active.slug}&subcategory=${sc.slug}`}
              className={cn(
                pill,
                subcategory === sc.slug
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-300 text-zinc-700 hover:bg-white",
              )}
            >
              {subcategoryLabel(sc.slug, locale)} ({subCount(sc.slug)})
            </Link>
          ))}
        </div>
      )}

      <div className="mb-6 mt-6 flex items-center justify-between border-b border-black/5 pb-4">
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
