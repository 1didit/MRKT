import Image from "next/image";
import Link from "next/link";
import { NAV_CATEGORIES } from "@/lib/nav";
import { productsByCategory } from "@/lib/products";
import { Reveal } from "@/components/reveal";

export function CategoryNav() {
  const tiles = NAV_CATEGORIES.map((c) => ({
    ...c,
    image: productsByCategory(c.slug)[0]?.images[0],
  }));

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
      <Reveal>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {tiles.map((tile) => (
            <Link
              key={tile.slug}
              href={`/catalog?category=${tile.slug}`}
              className="group relative block aspect-[4/5] overflow-hidden bg-surface cursor-pointer"
            >
              {tile.image && (
                <Image
                  src={tile.image}
                  alt={tile.label}
                  fill
                  sizes="(min-width:1024px) 24vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/45 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 p-4 font-display text-lg text-white lg:p-6 lg:text-xl">
                {tile.label}
              </span>
            </Link>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
