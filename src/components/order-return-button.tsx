"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { returnAndCancelOrder } from "@/lib/admin/order-actions";

export function OrderReturnButton({
  orderId,
  cancelled,
}: {
  orderId: string;
  cancelled: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (cancelled) return null;

  async function onClick() {
    if (!confirm("Return items to stock and cancel this order?")) return;
    setLoading(true);
    try {
      await returnAndCancelOrder(orderId);
    } finally {
      setLoading(false);
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      title="Return items to stock and cancel the order"
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-300 px-3 py-1.5 text-xs text-zinc-700 transition-colors hover:border-amber-500 hover:text-amber-600 disabled:opacity-60 cursor-pointer"
    >
      <RotateCcw size={13} />
      {loading ? "…" : "Return"}
    </button>
  );
}
