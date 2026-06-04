import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/reveal";

export async function Hero() {
  const t = await getTranslations("hero");
  return (
    <section className="px-3 pt-4 sm:px-5">
      <div className="relative mx-auto flex aspect-[4/5] max-w-[1600px] items-end overflow-hidden rounded-2xl bg-zinc-200 sm:aspect-[16/9] lg:aspect-[2.4/1]">
        <Image
          src="/assets/hero-lookbook-new-U_JBCdtQ.webp"
          alt="NEVA Premium lookbook"
          fill
          priority
          sizes="100vw"
          className="hidden object-cover object-center sm:block"
        />
        <Image
          src="/assets/hero-lookbook-mobile-DemuNJzy.webp"
          alt="NEVA Premium lookbook"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center sm:hidden"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/5 to-transparent" />

        <div className="relative z-10 p-6 sm:p-12 lg:p-16">
          <Reveal>
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/80">
              {t("kicker")}
            </p>
            <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
              {t("title")}
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/85">
              {t("subtitle")}
            </p>
            <Link
              href="/catalog"
              className="mt-7 inline-flex h-12 items-center justify-center rounded-full bg-white px-7 text-sm font-medium text-zinc-900 transition-colors hover:bg-accent hover:text-white"
            >
              {t("cta")}
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
