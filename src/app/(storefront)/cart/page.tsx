"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const t = useTranslations();
  const items = useCart((s) => s.items);
  const remove = useCart((s) => s.remove);
  const setQty = useCart((s) => s.setQty);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const total = items.reduce((n, i) => n + i.price * i.qty, 0);

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 lg:px-8 lg:py-16">
      <h1 className="text-3xl font-semibold text-zinc-900 sm:text-4xl">
        {t("cart.title")}
      </h1>

      {!mounted ? null : items.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-sm text-zinc-500">{t("cart.empty")}</p>
          <Link
            href="/catalog"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-full border border-zinc-300 px-8 text-sm text-zinc-900 transition-colors hover:bg-white cursor-pointer"
          >
            {t("cart.continue")}
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[1.6fr_1fr]">
          <ul className="divide-y divide-black/5 border-y border-black/5">
            {items.map((item) => (
              <li key={`${item.id}-${item.size}`} className="flex gap-4 py-5">
                <Link
                  href={`/product/${item.id}`}
                  className="relative h-28 w-21 shrink-0 overflow-hidden rounded-lg bg-white"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="84px"
                    className="object-cover"
                  />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-zinc-900">
                        {item.name}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {item.colorName} · {t("cart.size")} {item.size}
                      </p>
                    </div>
                    <p className="text-sm text-zinc-900">
                      {formatPrice(item.price * item.qty)}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="inline-flex items-center rounded-full border border-zinc-300">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => setQty(item.id, item.size, item.qty - 1)}
                        disabled={item.qty <= 1}
                        className="flex h-8 w-8 items-center justify-center text-zinc-600 transition-colors hover:text-zinc-900 disabled:text-zinc-300 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm tabular-nums">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => setQty(item.id, item.size, item.qty + 1)}
                        disabled={item.qty >= item.maxStock}
                        className="flex h-8 w-8 items-center justify-center text-zinc-600 transition-colors hover:text-zinc-900 disabled:text-zinc-300 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(item.id, item.size)}
                      className="inline-flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-900 cursor-pointer"
                    >
                      <Trash2 size={13} /> {t("cart.remove")}
                    </button>
                  </div>
                  {item.qty >= item.maxStock && (
                    <p className="mt-1 text-right text-[11px] text-amber-600">
                      {t("product.onlyLeft", { count: item.maxStock })}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit lg:sticky lg:top-28">
            <div className="rounded-xl border border-black/5 bg-white p-6">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">{t("cart.subtotal")}</span>
                <span className="text-zinc-900">{formatPrice(total)}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-zinc-500">{t("cart.delivery")}</span>
                <span className="text-zinc-900">{t("cart.complimentary")}</span>
              </div>
              <div className="mt-4 flex justify-between border-t border-black/5 pt-4 text-base">
                <span className="font-medium text-zinc-900">
                  {t("cart.total")}
                </span>
                <span className="font-medium text-zinc-900">
                  {formatPrice(total)}
                </span>
              </div>
              <Link
                href="/checkout"
                className="mt-6 inline-flex h-13 w-full items-center justify-center rounded-full bg-zinc-900 text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-accent cursor-pointer"
              >
                {t("cart.checkout")}
              </Link>
              <p className="mt-3 text-center text-[11px] text-zinc-500">
                {t("cart.comingSoon")}
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
