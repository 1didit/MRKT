import Link from "next/link";
import { Send } from "lucide-react";
import { FOOTER_SECTIONS, SHOWROOM } from "@/lib/nav";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-bg">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-4 lg:gap-8">
          {/* Contacts */}
          <div className="col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="font-display text-xl tracking-[0.3em] text-ink"
            >
              NEVA
            </Link>
            <p className="mt-5 text-[11px] uppercase tracking-luxe text-muted">
              Contacts
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-secondary">
              {SHOWROOM.name}
              <br />
              {SHOWROOM.address}
            </p>
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="text-[11px] uppercase tracking-luxe text-muted">
                {section.title}
              </p>
              <ul className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-secondary transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Social */}
          <div>
            <p className="text-[11px] uppercase tracking-luxe text-muted">
              We are in social networks
            </p>
            <a
              href={SHOWROOM.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-secondary transition-colors hover:text-ink"
            >
              <Send size={15} />
              Telegram
            </a>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} NEVA Premium. All rights reserved.</p>
          <p className="tracking-wide">Velour &amp; cashmere, made in Russia.</p>
        </div>
      </div>
    </footer>
  );
}
