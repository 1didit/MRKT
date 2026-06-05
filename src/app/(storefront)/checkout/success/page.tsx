import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <CheckCircle2 size={48} className="mx-auto text-accent" />
      <h1 className="mt-6 text-3xl font-semibold text-zinc-900">Thank you!</h1>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600">
        Your order {order && <span className="font-medium text-zinc-900">{order}</span>}{" "}
        has been placed. We will contact you shortly to confirm delivery and
        payment.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/account"
          className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-7 text-sm font-medium text-white transition-colors hover:bg-accent cursor-pointer"
        >
          View my orders
        </Link>
        <Link
          href="/catalog"
          className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-300 px-7 text-sm text-zinc-900 transition-colors hover:bg-white cursor-pointer"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
