"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const LOCALES = [
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
];

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function set(code: string) {
    document.cookie = `NEXT_LOCALE=${code};path=/;max-age=31536000;samesite=lax`;
    startTransition(() => router.refresh());
  }

  return (
    <div className={cn("flex items-center text-xs", className)}>
      {LOCALES.map((l, i) => (
        <span key={l.code} className="flex items-center">
          {i > 0 && <span className="text-zinc-300">/</span>}
          <button
            type="button"
            onClick={() => set(l.code)}
            disabled={pending}
            className={cn(
              "px-1.5 py-1 transition-colors cursor-pointer",
              locale === l.code
                ? "font-medium text-zinc-900"
                : "text-zinc-400 hover:text-zinc-700",
            )}
          >
            {l.label}
          </button>
        </span>
      ))}
    </div>
  );
}
