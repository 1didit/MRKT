import Link from "next/link";
import { Hero } from "@/components/home/hero";
import { CategoryStrip, type CategoryTile } from "@/components/home/category-strip";
import { ProductGrid } from "@/components/product/product-grid";
import { getTranslations } from "next-intl/server";
import { getActiveProducts, getBestsellers, getFeatured } from "@/lib/catalog";
import { NAV_CATEGORIES } from "@/lib/nav";
import type { ProductSummary } from "@/lib/repositories";

export const dynamic = "force-dynamic";

const MATCH: Record<string, (p: ProductSummary) => boolean> = {
  female: (p) => p.gender === "women",
  masculine: (p) => p.gender === "men",
  children: (p) => p.gender === "kids",
  home: (p) => p.forHome,
};

export default async function Home() {
  const t = await getTranslations();
  const [featured, bestsellers, all] = await Promise.all([
    getFeatured(8),
    getBestsellers(12),
    getActiveProducts(),
  ]);

  const tiles: CategoryTile[] = NAV_CATEGORIES.map((c) => ({
    slug: c.slug,
    label: t(`categories.${c.slug}`),
    image: all.find(MATCH[c.slug])?.primaryImage ?? null,
  }));

  return (
    <>
      <Hero />

      <section className="mx-auto max-w-[1600px] px-3 pt-8 sm:px-5 sm:pt-10">
        <CategoryStrip tiles={tiles} />
      </section>

      <section className="mx-auto max-w-[1600px] px-3 py-10 sm:px-5 sm:py-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-900 sm:text-3xl">
              New collection
            </h2>
            <p className="mt-1 text-sm text-zinc-500">Selected pieces</p>
          </div>
          <Link
            href="/catalog"
            className="shrink-0 rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-800 transition-colors hover:bg-white"
          >
            View all
          </Link>
        </div>
        <ProductGrid products={featured} priorityCount={4} />
      </section>

      {bestsellers.length > 0 && (
        <section className="mx-auto max-w-[1600px] px-3 pb-12 sm:px-5 sm:pb-16">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-zinc-900 sm:text-3xl">
              {t("home.topSales")}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">{t("home.topSalesSub")}</p>
          </div>
          <ProductGrid products={bestsellers} />
        </section>
      )}
    </>
  );
}
