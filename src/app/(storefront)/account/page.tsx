import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { clientLogoutAction } from "@/lib/auth/actions";
import { db } from "@/db/client";
import { orders } from "@/db/schema";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  new: "bg-blue-50 text-blue-700",
  paid: "bg-emerald-50 text-emerald-700",
  processing: "bg-amber-50 text-amber-700",
  shipped: "bg-violet-50 text-violet-700",
  delivered: "bg-zinc-100 text-zinc-600",
  cancelled: "bg-red-50 text-red-700",
};

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/account/login");

  const myOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.customerEmail, user.email))
    .orderBy(desc(orders.createdAt));

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-900 sm:text-4xl">
            Account
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            {user.name ? `${user.name} · ` : ""}
            {user.email}
          </p>
          {user.role === "admin" && (
            <Link
              href="/admin"
              className="mt-2 inline-block text-sm text-accent hover:underline"
            >
              Go to admin panel →
            </Link>
          )}
        </div>
        <form action={clientLogoutAction}>
          <button
            type="submit"
            className="h-10 rounded-full border border-zinc-300 px-5 text-sm text-zinc-800 transition-colors hover:bg-white cursor-pointer"
          >
            Sign out
          </button>
        </form>
      </div>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-zinc-900">Your orders</h2>
        {myOrders.length === 0 ? (
          <div className="mt-4 rounded-xl border border-black/5 bg-white p-8 text-center">
            <p className="text-sm text-zinc-500">You have no orders yet.</p>
            <Link
              href="/catalog"
              className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-accent cursor-pointer"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-black/5 overflow-hidden rounded-xl border border-black/5 bg-white">
            {myOrders.map((o) => (
              <li
                key={o.id}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900">{o.number}</p>
                  <p className="text-xs text-zinc-400">
                    {o.createdAt.toLocaleDateString("ru-RU")} · {o.items.length}{" "}
                    item(s)
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                      STATUS_STYLE[o.status],
                    )}
                  >
                    {o.status}
                  </span>
                  <span className="text-sm text-zinc-900">
                    {formatPrice(o.total)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
