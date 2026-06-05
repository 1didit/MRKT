"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ExternalLink,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Package,
  Search,
  ShoppingCart,
} from "lucide-react";
import { logoutAction } from "@/lib/admin/auth-actions";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
];

export function AdminShell({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [q, setQ] = useState("");
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-zinc-200 bg-white lg:flex">
        <div className="flex h-16 items-center px-6">
          <Link
            href="/admin"
            className="font-display text-xl tracking-[0.28em] text-zinc-900"
          >
            NEVA
          </Link>
          <span className="ml-2 text-[10px] uppercase tracking-luxe text-zinc-400">
            admin
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map((item) => {
            const active = isActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-100",
                )}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-1 border-t border-zinc-200 p-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100"
          >
            <ExternalLink size={17} />
            View store
          </a>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 cursor-pointer"
            >
              <LogOut size={17} />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-zinc-200 bg-white/90 px-5 backdrop-blur lg:px-8">
          <Link
            href="/admin"
            className="font-display text-lg tracking-[0.2em] text-zinc-900 lg:hidden"
          >
            NEVA
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                router.push(`/admin/products?q=${encodeURIComponent(q.trim())}`);
              }}
              className="hidden sm:flex"
            >
              <div className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-1.5 focus-within:border-zinc-400">
                <Search size={15} className="text-zinc-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search products…"
                  className="w-40 bg-transparent text-sm text-zinc-700 outline-none placeholder:text-zinc-400"
                />
              </div>
            </form>
            <div
              title={userEmail}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-medium text-white"
            >
              {(userEmail?.[0] ?? "A").toUpperCase()}
            </div>
          </div>
        </header>

        <main className="px-5 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
