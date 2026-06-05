"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { RichText } from "@/components/rich-text";
import type { Product } from "@/lib/repositories";
import { cn } from "@/lib/utils";

export function ProductDetail({ product }: { product: Product }) {
  const t = useTranslations();
  const add = useCart((s) => s.add);
  const items = useCart((s) => s.items);
  const [mounted, setMounted] = useState(false);
  const [ci, setCi] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => setMounted(true), []);

  const colorway = product.colorways[ci] ?? product.colorways[0];
  const images = colorway?.images ?? [];
  const variants = colorway?.variants ?? [];
  const selectedVariant = variants.find((v) => v.size === size);

  const inCart = mounted
    ? items.find((i) => i.id === product.slug && i.size === size)?.qty ?? 0
    : 0;
  const canAdd =
    !!selectedVariant && selectedVariant.stock > 0 && inCart < selectedVariant.stock;

  function onAdd() {
    if (!size || !colorway || !selectedVariant) return;
    if (inCart >= selectedVariant.stock) return;
    add({
      id: product.slug,
      name: product.name,
      colorName: colorway.colorName,
      price: product.basePrice,
      image: images[0] ?? "",
      size,
      maxStock: selectedVariant.stock,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="mx-auto max-w-[1400px] px-3 py-6 sm:px-5 sm:py-8">
      <nav className="mb-6 text-xs text-zinc-500">
        <Link href="/catalog" className="hover:text-zinc-900">
          {t("product.breadcrumb")}
        </Link>
        <span className="px-2">/</span>
        <span className="text-zinc-700">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
        {/* gallery */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {images.length === 0 && (
            <div className="aspect-[3/4] rounded-xl bg-white" />
          )}
          {images.map((src, i) => (
            <div
              key={src}
              className="relative aspect-[3/4] overflow-hidden rounded-xl bg-white"
            >
              <Image
                src={src}
                alt={`${product.name} — view ${i + 1}`}
                fill
                priority={i === 0}
                sizes="(min-width:1024px) 40vw, (min-width:640px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {/* info */}
        <div className="lg:sticky lg:top-28 lg:h-fit">
          <h1 className="text-2xl font-semibold text-zinc-900 sm:text-3xl">
            {product.name}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">{colorway?.colorName}</p>
          <p className="mt-4 text-xl text-zinc-900">
            {formatPrice(product.basePrice)}
          </p>

          {product.description && (
            <p className="mt-5 text-sm leading-relaxed text-zinc-600">
              {product.description}
            </p>
          )}

          {product.styleDescription && (
            <RichText
              html={product.styleDescription}
              className="mt-5 text-sm leading-relaxed text-zinc-600"
            />
          )}

          {/* colour switcher */}
          {product.colorways.length > 1 && (
            <div className="mt-6">
              <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                {t("product.colour")}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.colorways.map((c, i) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setCi(i);
                      setSize(null);
                    }}
                    title={c.colorName}
                    className={cn(
                      "h-8 w-8 rounded-full border transition-all",
                      i === ci
                        ? "ring-2 ring-zinc-900 ring-offset-2"
                        : "border-zinc-300",
                    )}
                    style={{ backgroundColor: c.swatchHex ?? "#ddd" }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* sizes */}
          <div className="mt-6">
            <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
              {t("product.size")}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {variants.map((v) => {
                const out = v.stock <= 0;
                return (
                  <button
                    key={v.id}
                    type="button"
                    disabled={out}
                    onClick={() => setSize(v.size)}
                    className={cn(
                      "h-11 min-w-12 border px-3 text-sm transition-colors",
                      out && "cursor-not-allowed text-zinc-300 line-through",
                      !out && size === v.size
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : !out &&
                            "border-zinc-300 text-zinc-700 hover:border-zinc-900",
                    )}
                  >
                    {v.size}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={onAdd}
            disabled={!canAdd}
            className={cn(
              "mt-6 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full text-sm font-medium uppercase tracking-wide transition-colors",
              canAdd
                ? "bg-zinc-900 text-white hover:bg-accent cursor-pointer"
                : "cursor-not-allowed bg-zinc-200 text-zinc-400",
            )}
          >
            {added ? (
              <>
                <Check size={16} /> {t("actions.added")}
              </>
            ) : (
              t("actions.addToBasket")
            )}
          </button>

          {/* stock / hint line */}
          {!size ? (
            <p className="mt-3 text-center text-xs text-zinc-400">
              {t("actions.selectSize")}
            </p>
          ) : selectedVariant && inCart >= selectedVariant.stock ? (
            <p className="mt-3 text-center text-xs text-amber-600">
              {t("product.maxInBasket")}
            </p>
          ) : selectedVariant && selectedVariant.stock <= 5 ? (
            <p className="mt-3 text-center text-xs text-amber-600">
              {t("product.onlyLeft", { count: selectedVariant.stock })}
            </p>
          ) : selectedVariant ? (
            <p className="mt-3 text-center text-xs text-zinc-400">
              {t("product.inStock", { count: selectedVariant.stock })}
            </p>
          ) : null}

          {product.details.length > 0 && (
            <ul className="mt-10 space-y-2 border-t border-black/5 pt-6 text-sm text-zinc-600">
              {product.details.map((d) => (
                <li key={d} className="flex gap-2">
                  <span className="text-accent">—</span>
                  {d}
                </li>
              ))}
            </ul>
          )}

          {product.care && (
            <details className="mt-6 border-t border-black/5 pt-6">
              <summary className="cursor-pointer list-none text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                {t("product.care")}
              </summary>
              <RichText
                html={product.care}
                className="mt-4 text-sm leading-relaxed text-zinc-600"
              />
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
