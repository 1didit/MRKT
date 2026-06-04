import { ProductCard } from "./product-card";
import type { ProductSummary } from "@/lib/repositories";

export function ProductGrid({
  products,
  priorityCount = 0,
}: {
  products: ProductSummary[];
  priorityCount?: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
      {products.map((product, i) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={i < priorityCount}
        />
      ))}
    </div>
  );
}
