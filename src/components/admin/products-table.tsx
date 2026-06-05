"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Copy, PackagePlus, RotateCcw, Search, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  addStock,
  bulkProducts,
  deleteProduct,
  duplicateProduct,
  restoreProduct,
  setProductFeatured,
  setProductPrice,
  setProductStatus,
} from "@/lib/admin/catalog-actions";
import { formatPrice } from "@/lib/format";
import type { ProductStatus, ProductSummary } from "@/lib/repositories";
import { cn } from "@/lib/utils";

const GENDER_LABEL: Record<string, string> = {
  women: "Female",
  men: "Masculine",
  kids: "Children's",
};

const STATUS_STYLE: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700",
  draft: "bg-amber-50 text-amber-700",
  archived: "bg-zinc-100 text-zinc-500",
};

const CATEGORY_MATCH: Record<string, (p: ProductSummary) => boolean> = {
  female: (p) => p.gender === "women",
  masculine: (p) => p.gender === "men",
  children: (p) => p.gender === "kids",
  home: (p) => p.forHome,
};

export function ProductsTable({
  products,
  deleted,
  initialSearch = "",
}: {
  products: ProductSummary[];
  deleted: ProductSummary[];
  initialSearch?: string;
}) {
  const router = useRouter();
  const [rows, setRows] = useState(products);
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("updated");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [stockOpen, setStockOpen] = useState(false);
  const [stockQty, setStockQty] = useState(10);
  const [deletedQty, setDeletedQty] = useState<Record<string, number>>({});

  useEffect(() => setRows(products), [products]);
  useEffect(() => setSearch(initialSearch), [initialSearch]);

  const patch = (id: string, p: Partial<ProductSummary>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));

  const visible = useMemo(() => {
    let list = rows;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.colorName ?? "").toLowerCase().includes(q),
      );
    }
    if (category !== "all") list = list.filter(CATEGORY_MATCH[category]);
    if (status !== "all") list = list.filter((p) => p.status === status);
    const sorted = [...list];
    if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "price-asc") sorted.sort((a, b) => a.basePrice - b.basePrice);
    else if (sort === "price-desc") sorted.sort((a, b) => b.basePrice - a.basePrice);
    else if (sort === "stock") sorted.sort((a, b) => a.totalStock - b.totalStock);
    else sorted.sort((a, b) => +b.updatedAt - +a.updatedAt);
    return sorted;
  }, [rows, search, category, status, sort]);

  const allSelected = visible.length > 0 && visible.every((p) => selected.has(p.id));
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(visible.map((p) => p.id)));
  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  async function run(fn: () => Promise<unknown>, ok: string) {
    try {
      await fn();
      toast.success(ok);
    } catch {
      toast.error("Action failed");
      router.refresh();
    }
  }

  async function onPrice(id: string, value: number) {
    setEditingPrice(null);
    const current = rows.find((r) => r.id === id);
    if (!current || current.basePrice === value || Number.isNaN(value)) return;
    patch(id, { basePrice: value });
    await run(() => setProductPrice(id, value), "Price updated");
  }

  async function onStatus(id: string, value: ProductStatus) {
    patch(id, { status: value });
    await run(() => setProductStatus(id, value), "Status updated");
  }

  async function onFeatured(id: string, value: boolean) {
    patch(id, { featured: value });
    await run(() => setProductFeatured(id, value), value ? "Featured" : "Unfeatured");
  }

  async function onDuplicate(id: string) {
    await run(() => duplicateProduct(id), "Duplicated");
    router.refresh();
  }

  async function onDelete(id: string) {
    if (!confirm("Move this product to Deleted?")) return;
    setRows((rs) => rs.filter((r) => r.id !== id));
    await run(() => deleteProduct(id), "Moved to Deleted");
    router.refresh();
  }

  async function onBulk(op: Parameters<typeof bulkProducts>[1]) {
    const ids = [...selected];
    if (ids.length === 0) return;
    if (op === "delete") {
      if (!confirm(`Delete ${ids.length} products?`)) return;
      setRows((rs) => rs.filter((r) => !selected.has(r.id)));
    } else if (op === "feature" || op === "unfeature") {
      const v = op === "feature";
      setRows((rs) => rs.map((r) => (selected.has(r.id) ? { ...r, featured: v } : r)));
    } else {
      setRows((rs) =>
        rs.map((r) => (selected.has(r.id) ? { ...r, status: op } : r)),
      );
    }
    setSelected(new Set());
    await run(() => bulkProducts(ids, op), "Updated");
    router.refresh();
  }

  async function onRestore(id: string, qty: number) {
    await run(
      () => restoreProduct(id, Math.max(0, Math.round(qty))),
      "Product restored",
    );
    router.refresh();
  }

  async function onAddStock() {
    const ids = [...selected];
    const qty = Math.max(1, Math.round(stockQty) || 0);
    if (!ids.length || !qty) return;
    if (!confirm(`Add ${qty} to every size of ${ids.length} product(s)?`)) return;
    setStockOpen(false);
    await run(() => addStock(ids, qty), `Added ${qty} to each size`);
    router.refresh();
  }

  const control =
    "h-9 rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-900";

  return (
    <div>
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className={cn(control, "w-56 pl-9")}
          />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={control}>
          <option value="all">All categories</option>
          <option value="female">Female</option>
          <option value="masculine">Masculine</option>
          <option value="children">Children&apos;s</option>
          <option value="home">For The Home</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={control}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className={control}>
          <option value="updated">Recently updated</option>
          <option value="name">Name</option>
          <option value="price-asc">Price ↑</option>
          <option value="price-desc">Price ↓</option>
          <option value="stock">Stock ↑</option>
        </select>
        <span className="ml-auto text-sm text-zinc-500">
          {visible.length} of {rows.length}
        </span>
      </div>

      {/* bulk bar */}
      {selected.size > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm">
          <span className="font-medium">{selected.size} selected</span>
          <span className="mx-1 h-4 w-px bg-zinc-200" />
          <button onClick={() => onBulk("active")} className="rounded px-2 py-1 hover:bg-zinc-100 cursor-pointer">Set active</button>
          <button onClick={() => onBulk("draft")} className="rounded px-2 py-1 hover:bg-zinc-100 cursor-pointer">Set draft</button>
          <button onClick={() => onBulk("archived")} className="rounded px-2 py-1 hover:bg-zinc-100 cursor-pointer">Archive</button>
          <button onClick={() => onBulk("feature")} className="rounded px-2 py-1 hover:bg-zinc-100 cursor-pointer">Feature</button>
          <button onClick={() => onBulk("unfeature")} className="rounded px-2 py-1 hover:bg-zinc-100 cursor-pointer">Unfeature</button>
          <button onClick={() => onBulk("delete")} className="rounded px-2 py-1 text-red-600 hover:bg-red-50 cursor-pointer">Delete</button>

          <div className="ml-auto flex items-center gap-2">
            {stockOpen ? (
              <>
                <span className="text-xs text-zinc-500">Add to each size:</span>
                <input
                  type="number"
                  min={1}
                  value={stockQty}
                  onChange={(e) => setStockQty(Number(e.target.value))}
                  autoFocus
                  className="h-8 w-20 rounded border border-zinc-300 px-2 text-sm outline-none focus:border-zinc-900"
                />
                <button
                  onClick={onAddStock}
                  className="rounded bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-accent cursor-pointer"
                >
                  Add
                </button>
                <button
                  onClick={() => setStockOpen(false)}
                  className="rounded px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 cursor-pointer"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setStockOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 px-2.5 py-1 text-xs text-zinc-700 hover:bg-zinc-100 cursor-pointer"
              >
                <PackagePlus size={14} /> Add stock
              </button>
            )}
          </div>
        </div>
      )}

      {/* table */}
      <div className="mt-3 overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500">
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4" />
                </th>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="w-10 px-4 py-3 text-center font-medium">★</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {visible.map((p) => (
                <tr key={p.id} className="group hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => toggle(p.id)}
                      className="h-4 w-4"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                      <span className="relative h-12 w-10 shrink-0 overflow-hidden rounded bg-zinc-100">
                        {p.primaryImage && (
                          <Image src={p.primaryImage} alt="" fill sizes="40px" className="object-cover" />
                        )}
                      </span>
                      <span>
                        <span className="block font-medium text-zinc-900 group-hover:text-accent">
                          {p.name}
                        </span>
                        <span className="block text-xs text-zinc-400">
                          {p.colorName}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {GENDER_LABEL[p.gender]}
                    {p.forHome && <span className="ml-1 text-zinc-400">· Home</span>}
                  </td>
                  <td className="px-4 py-3">
                    {editingPrice === p.id ? (
                      <input
                        type="number"
                        autoFocus
                        defaultValue={p.basePrice}
                        onBlur={(e) => onPrice(p.id, Number(e.target.value))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") onPrice(p.id, Number(e.currentTarget.value));
                          if (e.key === "Escape") setEditingPrice(null);
                        }}
                        className="h-8 w-24 rounded border border-zinc-300 px-2 text-sm outline-none focus:border-zinc-900"
                      />
                    ) : (
                      <button
                        onClick={() => setEditingPrice(p.id)}
                        className="rounded px-1 text-zinc-900 hover:bg-zinc-100 cursor-pointer"
                        title="Click to edit"
                      >
                        {formatPrice(p.basePrice)}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={p.totalStock < 10 ? "text-amber-600" : "text-zinc-600"}>
                      {p.totalStock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={p.status}
                      onChange={(e) => onStatus(p.id, e.target.value as ProductStatus)}
                      className={cn(
                        "cursor-pointer rounded-full border-0 px-2.5 py-0.5 text-xs font-medium capitalize outline-none",
                        STATUS_STYLE[p.status],
                      )}
                    >
                      <option value="active">active</option>
                      <option value="draft">draft</option>
                      <option value="archived">archived</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onFeatured(p.id, !p.featured)}
                      className="cursor-pointer"
                      title={p.featured ? "Featured" : "Not featured"}
                    >
                      <Star
                        size={16}
                        className={cn(
                          "transition-colors",
                          p.featured ? "fill-accent text-accent" : "text-zinc-300",
                        )}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => onDuplicate(p.id)}
                        title="Duplicate"
                        className="flex h-8 w-8 items-center justify-center rounded text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 cursor-pointer"
                      >
                        <Copy size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(p.id)}
                        title="Delete"
                        className="flex h-8 w-8 items-center justify-center rounded text-zinc-500 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-sm text-zinc-400">
                    No products match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleted.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-3 text-sm font-semibold text-zinc-500">
            Deleted ({deleted.length})
          </h2>
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-zinc-100">
                {deleted.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="relative h-12 w-10 shrink-0 overflow-hidden rounded bg-zinc-100">
                          {p.primaryImage && (
                            <Image
                              src={p.primaryImage}
                              alt=""
                              fill
                              sizes="40px"
                              className="object-cover opacity-70"
                            />
                          )}
                        </span>
                        <div>
                          <span className="block font-medium text-zinc-700">
                            {p.name}
                          </span>
                          <span className="block text-xs text-zinc-400">
                            {p.colorName}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-zinc-500">Stock</span>
                        <input
                          type="number"
                          min={0}
                          value={deletedQty[p.id] ?? 10}
                          onChange={(e) =>
                            setDeletedQty((q) => ({
                              ...q,
                              [p.id]: Number(e.target.value),
                            }))
                          }
                          className="h-8 w-16 rounded border border-zinc-300 px-2 text-center text-sm outline-none focus:border-zinc-900"
                        />
                        <button
                          type="button"
                          onClick={() => onRestore(p.id, deletedQty[p.id] ?? 10)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent cursor-pointer"
                        >
                          <RotateCcw size={13} /> Return
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
