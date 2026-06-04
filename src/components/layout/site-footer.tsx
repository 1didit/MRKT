import Link from "next/link";
import { Send } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { SHOWROOM } from "@/lib/nav";
import { LanguageSwitcher } from "./language-switcher";

const SHOP_LINKS = [
  { key: "catalog", href: "/catalog" },
  { key: "about", href: "/about" },
  { key: "blog", href: "/blog" },
  { key: "requisites", href: "/requisites" },
  { key: "contacts", href: "/contact" },
] as const;

const BUYER_LINKS = [
  { key: "shipping", href: "/shipping" },
  { key: "returns", href: "/returns" },
  { key: "care", href: "/care" },
  { key: "offer", href: "/offer" },
  { key: "privacy", href: "/privacy" },
] as const;

export async function SiteFooter() {
  const t = await getTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-black/5 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-4 lg:gap-8">
          {/* Contacts */}
          <div className="col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="text-xl font-semibold tracking-[0.3em] text-zinc-900"
            >
              NEVA
            </Link>
            <p className="mt-5 text-[11px] uppercase tracking-[0.18em] text-zinc-400">
              {t("footer.contacts")}
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-600">
              {SHOWROOM.name}
              <br />
              {SHOWROOM.address}
            </p>
          </div>

          {/* Shop */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-400">
              {t("footer.shop")}
            </p>
            <ul className="mt-4 space-y-3">
              {SHOP_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-zinc-600 transition-colors hover:text-zinc-900"
                  >
                    {t(`footerLinks.${l.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Buyers */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-400">
              {t("footer.buyers")}
            </p>
            <ul className="mt-4 space-y-3">
              {BUYER_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-zinc-600 transition-colors hover:text-zinc-900"
                  >
                    {t(`footerLinks.${l.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-400">
              {t("footer.social")}
            </p>
            <a
              href={SHOWROOM.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-zinc-600 transition-colors hover:text-zinc-900"
            >
              <Send size={15} />
              {t("footer.telegram")}
            </a>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-black/5 pt-6 text-xs text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} NEVA Premium. {t("footer.rights")}</p>
          <div className="flex items-center gap-4">
            <p className="hidden sm:block">{t("footer.madeIn")}</p>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}
