import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { ProductSummary } from "@/lib/repositories";

const SIZES = "(min-width:1024px) 24vw, (min-width:640px) 33vw, 50vw";

export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductSummary;
  priority?: boolean;
}) {
  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-white">
        {product.primaryImage && (
          <Image
            src={product.primaryImage}
            alt={product.name}
            fill
            sizes={SIZES}
            priority={priority}
            className="object-cover transition-[opacity,transform] duration-700 ease-out group-hover:scale-[1.02] group-hover:opacity-0"
          />
        )}
        {product.secondaryImage && (
          <Image
            src={product.secondaryImage}
            alt=""
            aria-hidden
            fill
            sizes={SIZES}
            className="object-cover opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100"
          />
        )}
      </div>
      <div className="mt-3 px-0.5">
        <h3 className="text-sm font-medium text-zinc-900">{product.name}</h3>
        <p className="mt-0.5 text-xs text-zinc-500">
          {product.colorName}
          {product.colorCount > 1 && ` · ${product.colorCount} colours`}
        </p>
        <p className="mt-1 text-sm text-zinc-800">
          {formatPrice(product.basePrice)}
        </p>
      </div>
    </Link>
  );
}
