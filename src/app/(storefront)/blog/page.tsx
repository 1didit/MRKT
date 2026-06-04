import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Blog" };

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <h1 className="text-3xl font-semibold text-zinc-900 sm:text-4xl">
        Блог НЕВА Премиум
      </h1>
      <p className="mt-4 text-sm text-zinc-500">Велюровые костюмы в СМИ</p>

      <Link
        href="/blog/pmef"
        className="mt-8 block rounded-xl border border-black/5 bg-white p-6 transition-colors hover:border-zinc-300"
      >
        <p className="text-lg font-semibold text-zinc-900">
          NEVA Premium на ПМЭФ
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          Участие бренда и публикация в СМИ
        </p>
        <span className="mt-3 inline-block text-sm text-accent">Читать →</span>
      </Link>
    </div>
  );
}
