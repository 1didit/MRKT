import type { Metadata } from "next";
import { COMPANY } from "@/lib/company";

export const metadata: Metadata = { title: "Requisites" };

const rows: [string, string][] = [
  ["Полное наименование", COMPANY.legalName],
  ["Сокращённое наименование", COMPANY.shortName],
  ["ИНН", COMPANY.inn],
  ["ОГРН", COMPANY.ogrn],
  ["Юридический адрес", COMPANY.address],
  ["Телефон", COMPANY.phone],
  ["Email", COMPANY.email],
  ["Форма расчётов с покупателями", COMPANY.paymentForm],
  ["Категория покупателей", COMPANY.customerCategory],
];

export default function RequisitesPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <h1 className="text-3xl font-semibold text-zinc-900 sm:text-4xl">
        Реквизиты компании
      </h1>
      <dl className="mt-8 overflow-hidden rounded-xl border border-black/5 bg-white">
        {rows.map(([k, v]) => (
          <div
            key={k}
            className="grid grid-cols-1 gap-1 border-b border-black/5 px-5 py-4 last:border-0 sm:grid-cols-[260px_1fr]"
          >
            <dt className="text-sm text-zinc-500">{k}</dt>
            <dd className="text-sm text-zinc-900">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
