"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setOrderStatus, type OrderStatus } from "@/lib/admin/order-actions";

const STATUSES: OrderStatus[] = [
  "new",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export function OrderStatusSelect({
  id,
  status,
}: {
  id: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [value, setValue] = useState<OrderStatus>(status);
  const [saving, setSaving] = useState(false);

  async function onChange(v: OrderStatus) {
    setValue(v);
    setSaving(true);
    try {
      await setOrderStatus(id, v);
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update");
      setValue(status);
    }
    setSaving(false);
    router.refresh();
  }

  return (
    <select
      value={value}
      disabled={saving}
      onChange={(e) => onChange(e.target.value as OrderStatus)}
      className="h-9 rounded-lg border border-zinc-300 bg-white px-3 text-sm capitalize outline-none focus:border-zinc-900 disabled:opacity-60 cursor-pointer"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
