import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { COMPANY } from "@/lib/company";

export const metadata: Metadata = { title: "Contacts" };

const cards = [
  { icon: Mail, label: "Email", value: COMPANY.email, href: `mailto:${COMPANY.email}` },
  { icon: Phone, label: "Телефон", value: COMPANY.phone, href: COMPANY.phoneHref },
  { icon: Send, label: "Telegram", value: COMPANY.telegramHandle, href: COMPANY.telegram },
  { icon: MapPin, label: "Адрес", value: COMPANY.address, href: null },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <h1 className="text-3xl font-semibold text-zinc-900 sm:text-4xl">
        Контакты
      </h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {cards.map(({ icon: Icon, label, value, href }) => {
          const body = (
            <div className="flex items-start gap-3 rounded-xl border border-black/5 bg-white p-5">
              <Icon size={18} className="mt-0.5 shrink-0 text-accent" />
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-400">
                  {label}
                </p>
                <p className="mt-1 text-sm text-zinc-900">{value}</p>
              </div>
            </div>
          );
          return href ? (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="transition-colors hover:[&>div]:border-zinc-300"
            >
              {body}
            </a>
          ) : (
            <div key={label}>{body}</div>
          );
        })}
      </div>

      <div className="mt-6 rounded-xl border border-black/5 bg-white p-6">
        <p className="text-sm font-medium text-zinc-900">
          Юридическая информация
        </p>
        <p className="mt-2 text-sm text-zinc-600">
          {COMPANY.shortName} · ИНН {COMPANY.inn} · ОГРН {COMPANY.ogrn}
        </p>
        <p className="mt-1 text-sm text-zinc-600">{COMPANY.address}</p>
        <Link
          href="/requisites"
          className="mt-3 inline-block text-sm text-accent hover:underline"
        >
          Полные реквизиты →
        </Link>
      </div>

      <p className="mt-6 text-sm text-zinc-500">
        Магазин работает с физическими лицами на территории Российской
        Федерации. Все цены указаны в рублях.
      </p>
    </div>
  );
}
