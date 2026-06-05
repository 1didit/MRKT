"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { ProductGrid } from "@/components/product/product-grid";
import type { ProductSummary } from "@/lib/repositories";

export function SearchClient({ products }: { products: ProductSummary[] }) {
  const t = useTranslations("search");
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();

  const results = useMemo(() => {
    if (!query) return [];
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.colorName ?? "").toLowerCase().includes(query),
    );
  }, [products, query]);

  return (
    <div className="mx-auto max-w-[1600px] px-3 py-8 sm:px-5">
      <h1 className="text-3xl font-semibold text-zinc-900 sm:text-4xl">
        {t("title")}
      </h1>

      <div className="relative mt-6 max-w-xl">
        <Search
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
        />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("placeholder")}
          className="h-12 w-full rounded-full border border-zinc-300 bg-white pl-11 pr-4 text-sm outline-none transition-colors focus:border-zinc-900"
        />
      </div>

      <div className="mt-8">
        {!query ? (
          <p className="text-sm text-zinc-500">{t("start")}</p>
        ) : results.length === 0 ? (
          <p className="text-sm text-zinc-500">{t("empty", { q })}</p>
        ) : (
          <>
            <p className="mb-6 text-sm text-zinc-500">
              {t("results", { count: results.length })}
            </p>
            <ProductGrid products={results} priorityCount={4} />
          </>
        )}
      </div>
    </div>
  );
}
