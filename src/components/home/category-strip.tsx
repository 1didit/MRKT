import Image from "next/image";
import Link from "next/link";

export interface CategoryTile {
  slug: string;
  label: string;
  image: string | null;
}

export function CategoryStrip({ tiles }: { tiles: CategoryTile[] }) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto rounded-2xl bg-white p-2.5 sm:gap-3 sm:p-3">
      {tiles.map((t) => (
        <Link
          key={t.slug}
          href={`/catalog?category=${t.slug}`}
          className="group flex shrink-0 items-center gap-3 rounded-xl px-2.5 py-1.5 transition-colors hover:bg-zinc-100"
        >
          <span className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
            {t.image && (
              <Image
                src={t.image}
                alt={t.label}
                fill
                sizes="48px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
          </span>
          <span className="whitespace-nowrap pr-2 text-sm font-medium text-zinc-800">
            {t.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
