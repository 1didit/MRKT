"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { createOrderAction } from "@/lib/checkout-actions";

const input =
  "h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none transition-colors focus:border-zinc-900";
const label = "mb-1.5 block text-xs font-medium text-zinc-600";

export function CheckoutForm({
  defaultName,
  defaultEmail,
}: {
  defaultName: string;
  defaultEmail: string;
}) {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: defaultName,
    email: defaultEmail,
    phone: "",
    address: "",
  });

  useEffect(() => setMounted(true), []);

  const total = items.reduce((n, i) => n + i.price * i.qty, 0);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await createOrderAction({
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: form.address,
      items: items.map((i) => ({
        slug: i.id,
        colorName: i.colorName,
        size: i.size,
        qty: i.qty,
      })),
    });
    if (res.ok) {
      clear();
      router.push(`/checkout/success?order=${res.number}`);
    } else {
      setError(res.error);
      setSubmitting(false);
    }
  }

  if (mounted && items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 text-center">
        <p className="text-sm text-zinc-500">Your basket is empty.</p>
        <Link
          href="/catalog"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-full border border-zinc-300 px-8 text-sm text-zinc-900 transition-colors hover:bg-white cursor-pointer"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
      <h1 className="text-3xl font-semibold text-zinc-900 sm:text-4xl">
        Checkout
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1.3fr_1fr]">
        {/* form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className={label}>Name</label>
            <input className={input} value={form.name} onChange={set("name")} required />
          </div>
          <div>
            <label className={label}>Email</label>
            <input type="email" className={input} value={form.email} onChange={set("email")} required />
          </div>
          <div>
            <label className={label}>Phone</label>
            <input className={input} value={form.phone} onChange={set("phone")} placeholder="+7 ___ ___ __ __" required />
          </div>
          <div>
            <label className={label}>Delivery address</label>
            <input className={input} value={form.address} onChange={set("address")} placeholder="City, street, building, flat" required />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting || !mounted}
            className="mt-2 inline-flex h-13 w-full items-center justify-center rounded-full bg-zinc-900 text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-accent disabled:opacity-60 cursor-pointer"
          >
            {submitting ? "Placing order…" : "Place order"}
          </button>
          <p className="text-center text-[11px] text-zinc-500">
            Payment integration coming soon — order is created as “new”.
          </p>
        </form>

        {/* summary */}
        <aside className="h-fit lg:sticky lg:top-28">
          <div className="rounded-xl border border-black/5 bg-white p-6">
            <h2 className="text-sm font-semibold text-zinc-900">Your order</h2>
            <ul className="mt-4 space-y-3">
              {mounted &&
                items.map((item) => (
                  <li key={`${item.id}-${item.size}`} className="flex gap-3">
                    <span className="relative h-16 w-13 shrink-0 overflow-hidden rounded bg-zinc-100">
                      {item.image && (
                        <Image src={item.image} alt="" fill sizes="52px" className="object-cover" />
                      )}
                    </span>
                    <div className="flex flex-1 justify-between gap-2">
                      <div>
                        <p className="text-sm text-zinc-900">{item.name}</p>
                        <p className="text-xs text-zinc-400">
                          {item.colorName} · {item.size} · {item.qty}×
                        </p>
                      </div>
                      <p className="text-sm text-zinc-900">
                        {formatPrice(item.price * item.qty)}
                      </p>
                    </div>
                  </li>
                ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-black/5 pt-4 text-sm">
              <span className="text-zinc-500">Delivery</span>
              <span className="text-zinc-900">Complimentary</span>
            </div>
            <div className="mt-2 flex justify-between text-base">
              <span className="font-medium text-zinc-900">Total</span>
              <span className="font-medium text-zinc-900">
                {mounted ? formatPrice(total) : "—"}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
