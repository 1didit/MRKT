"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { NAV_CATEGORIES } from "@/lib/nav";
import { selectCount, useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const count = useCart(selectCount);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const iconBtn =
    "flex h-9 w-9 items-center justify-center rounded-full text-zinc-700 transition-colors hover:bg-zinc-100";

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-5 sm:pt-5">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3">
        <Link
          href="/"
          aria-label="NEVA Premium home"
          className="pl-1 text-xl font-semibold tracking-[0.28em] text-zinc-900 sm:text-2xl"
        >
          NEVA
        </Link>

        {/* desktop pill */}
        <nav className="hidden items-center gap-1 rounded-full bg-white/85 p-1.5 shadow-sm ring-1 ring-black/[0.04] backdrop-blur lg:flex">
          {NAV_CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/catalog?category=${c.slug}`}
              className="rounded-full px-4 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100"
            >
              {c.label}
            </Link>
          ))}
          <span className="mx-1 h-5 w-px bg-zinc-200" />
          <Link href="/search" aria-label="Search" className={iconBtn}>
            <Search size={17} />
          </Link>
          <Link href="/account" aria-label="Cabinet" className={iconBtn}>
            <User size={17} />
          </Link>
          <Link
            href="/cart"
            aria-label="Basket"
            className={cn(iconBtn, "relative")}
          >
            <ShoppingBag size={17} />
            {mounted && count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-medium text-white">
                {count}
              </span>
            )}
          </Link>
        </nav>

        {/* mobile pill */}
        <div className="flex items-center gap-1 rounded-full bg-white/90 p-1.5 shadow-sm ring-1 ring-black/[0.04] backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            className={iconBtn}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
          <Link
            href="/cart"
            aria-label="Basket"
            className={cn(iconBtn, "relative")}
          >
            <ShoppingBag size={17} />
            {mounted && count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-medium text-white">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* mobile menu */}
      {open && (
        <div className="fixed inset-0 top-0 z-40 bg-[#ecebe7] px-5 pt-24 lg:hidden">
          <nav className="flex flex-col">
            {NAV_CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                href={`/catalog?category=${c.slug}`}
                onClick={() => setOpen(false)}
                className="border-b border-black/5 py-4 text-2xl font-medium text-zinc-900"
              >
                {c.label}
              </Link>
            ))}
            <div className="mt-6 flex flex-col gap-4 text-sm text-zinc-600">
              <Link href="/search" onClick={() => setOpen(false)}>
                Search
              </Link>
              <Link href="/account" onClick={() => setOpen(false)}>
                Cabinet
              </Link>
              <Link href="/cart" onClick={() => setOpen(false)}>
                Basket
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
