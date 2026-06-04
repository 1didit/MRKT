"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const items = useCart((s) => s.items);
  const remove = useCart((s) => s.remove);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const total = items.reduce((n, i) => n + i.price * i.qty, 0);

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 lg:px-8 lg:py-16">
      <h1 className="font-display text-4xl text-ink lg:text-5xl">Basket</h1>

      {!mounted ? null : items.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-sm text-muted">Your basket is empty.</p>
          <Link
            href="/catalog"
            className="mt-6 inline-flex h-12 items-center justify-center border border-ink px-8 text-[13px] uppercase tracking-wide text-ink transition-colors hover:bg-ink hover:text-bg cursor-pointer"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[1.6fr_1fr]">
          <ul className="divide-y divide-line border-y border-line">
            {items.map((item) => (
              <li key={`${item.id}-${item.size}`} className="flex gap-4 py-5">
                <Link
                  href={`/product/${item.id}`}
                  className="relative h-28 w-21 shrink-0 overflow-hidden bg-surface"
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
                      <p className="text-sm font-medium text-ink">
                        {item.name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {item.colorName} · Size {item.size}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">Qty {item.qty}</p>
                    </div>
                    <p className="text-sm text-ink">
                      {formatPrice(item.price * item.qty)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(item.id, item.size)}
                    className="mt-auto inline-flex w-fit items-center gap-1.5 text-xs text-muted transition-colors hover:text-ink cursor-pointer"
                  >
                    <Trash2 size={13} /> Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit lg:sticky lg:top-28">
            <div className="border border-line p-6">
              <div className="flex justify-between text-sm">
                <span className="text-secondary">Subtotal</span>
                <span className="text-ink">{formatPrice(total)}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-secondary">Delivery</span>
                <span className="text-ink">Complimentary</span>
              </div>
              <div className="mt-4 flex justify-between border-t border-line pt-4 text-base">
                <span className="font-medium text-ink">Total</span>
                <span className="font-medium text-ink">
                  {formatPrice(total)}
                </span>
              </div>
              <button
                type="button"
                className="mt-6 inline-flex h-13 w-full items-center justify-center bg-ink text-[13px] font-medium uppercase tracking-wide text-bg transition-colors hover:bg-accent cursor-pointer"
              >
                Checkout
              </button>
              <p className="mt-3 text-center text-[11px] text-muted">
                Payment integration coming soon
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
