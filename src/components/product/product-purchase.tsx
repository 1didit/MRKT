"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/products";
import { cn } from "@/lib/utils";

export function ProductPurchase({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const [size, setSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const onAdd = () => {
    if (!size) return;
    add({
      id: product.id,
      name: product.name,
      colorName: product.colorName,
      price: product.price,
      image: product.images[0],
      size,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-luxe text-muted">
          Size
        </span>
        <span className="text-[11px] uppercase tracking-luxe text-muted">
          Size guide
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {product.sizes.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSize(s)}
            className={cn(
              "h-11 min-w-12 px-3 text-sm transition-colors cursor-pointer border",
              size === s
                ? "border-ink bg-ink text-bg"
                : "border-line text-secondary hover:border-ink",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onAdd}
        disabled={!size}
        className={cn(
          "mt-6 inline-flex h-13 w-full items-center justify-center gap-2 text-[13px] font-medium uppercase tracking-wide transition-colors",
          size
            ? "bg-ink text-bg hover:bg-accent cursor-pointer"
            : "cursor-not-allowed bg-line text-muted",
        )}
      >
        {added ? (
          <>
            <Check size={16} /> Added to basket
          </>
        ) : (
          "Add to basket"
        )}
      </button>

      {!size && (
        <p className="mt-3 text-center text-xs text-muted">
          Please select a size
        </p>
      )}
    </div>
  );
}
