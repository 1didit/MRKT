"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { ImageUploader } from "@/components/admin/image-uploader";
import {
  createProductAction,
  deleteProductAction,
  updateProductAction,
} from "@/lib/admin/product-actions";
import { formatPrice } from "@/lib/format";
import type { Product, ProductInput } from "@/lib/repositories";
import { cn } from "@/lib/utils";

interface ColorwayValue {
  colorName: string;
  swatchHex: string;
  images: string[];
  stock: Record<string, number>;
}

interface ProductFormValues {
  name: string;
  slug: string;
  baseSku: string;
  description: string;
  styleDescription: string;
  care: string;
  details: { value: string }[];
  gender: "women" | "men" | "kids";
  forHome: boolean;
  style: string;
  basePrice: number;
  compareAtPrice: number | null;
  status: "draft" | "active" | "archived";
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  sizes: string[];
  colorways: ColorwayValue[];
}

const input =
  "h-10 w-full rounded-lg border border-zinc-300 px-3 text-sm outline-none transition-colors focus:border-zinc-900";
const label = "mb-1.5 block text-xs font-medium text-zinc-600";
const card = "rounded-xl border border-zinc-200 bg-white p-5";

function deriveBaseSku(p?: Product): string {
  const sku = p?.colorways[0]?.variants[0]?.sku ?? "";
  return sku.split("-")[0] ?? "";
}

function toDefaults(p?: Product): ProductFormValues {
  if (!p) {
    return {
      name: "",
      slug: "",
      baseSku: "",
      description: "",
      styleDescription: "",
      care: "",
      details: [{ value: "" }],
      gender: "women",
      forHome: false,
      style: "",
      basePrice: 0,
      compareAtPrice: null,
      status: "active",
      featured: false,
      seoTitle: "",
      seoDescription: "",
      sizes: ["XS", "S", "M", "L", "XL"],
      colorways: [{ colorName: "", swatchHex: "#cccccc", images: [], stock: {} }],
    };
  }
  const sizes = p.colorways[0]?.variants.map((v) => v.size) ?? [];
  return {
    name: p.name,
    slug: p.slug,
    baseSku: deriveBaseSku(p),
    description: p.description,
    styleDescription: p.styleDescription,
    care: p.care,
    details: (p.details.length ? p.details : [""]).map((value) => ({ value })),
    gender: p.gender,
    forHome: p.forHome,
    style: p.style ?? "",
    basePrice: p.basePrice,
    compareAtPrice: p.compareAtPrice,
    status: p.status,
    featured: p.featured,
    seoTitle: p.seoTitle ?? "",
    seoDescription: p.seoDescription ?? "",
    sizes,
    colorways: p.colorways.map((c) => ({
      colorName: c.colorName,
      swatchHex: c.swatchHex ?? "#cccccc",
      images: c.images,
      stock: Object.fromEntries(c.variants.map((v) => [v.size, v.stock])),
    })),
  };
}

function toInput(v: ProductFormValues): ProductInput {
  const base =
    (v.baseSku || v.slug || v.name)
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "")
      .slice(0, 12) || "SKU";
  const multi = v.colorways.length > 1;
  return {
    slug: v.slug || undefined,
    name: v.name,
    description: v.description,
    styleDescription: v.styleDescription,
    care: v.care,
    gender: v.gender,
    forHome: v.forHome,
    style: v.style || null,
    basePrice: Math.max(0, Number(v.basePrice) || 0),
    compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
    status: v.status,
    featured: v.featured,
    details: v.details.map((d) => d.value.trim()).filter(Boolean),
    seoTitle: v.seoTitle || null,
    seoDescription: v.seoDescription || null,
    colorways: v.colorways.map((c, ci) => {
      const code =
        (c.colorName || `C${ci + 1}`)
          .toUpperCase()
          .replace(/[^A-Z0-9]+/g, "")
          .slice(0, 3) || `C${ci + 1}`;
      return {
        colorName: c.colorName,
        swatchHex: c.swatchHex || null,
        images: c.images,
        variants: v.sizes.map((s) => ({
          size: s,
          sku: multi ? `${base}-${code}-${s}` : `${base}-${s}`,
          stock: Math.max(0, Number(c.stock?.[s] ?? 0)),
        })),
      };
    }),
  };
}

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const mode = product ? "edit" : "create";
  const [newSize, setNewSize] = useState("");
  const [deleting, setDeleting] = useState(false);

  const form = useForm<ProductFormValues>({ defaultValues: toDefaults(product) });
  const { register, control, handleSubmit, watch, setValue, formState } = form;
  const colorways = useFieldArray({ control, name: "colorways" });
  const details = useFieldArray({ control, name: "details" });

  const sizes = watch("sizes");
  const watched = watch();

  function addSize() {
    const s = newSize.trim().toUpperCase();
    if (!s || sizes.includes(s)) return;
    setValue("sizes", [...sizes, s]);
    setNewSize("");
  }
  function removeSize(s: string) {
    setValue(
      "sizes",
      sizes.filter((x) => x !== s),
    );
  }

  async function onSubmit(values: ProductFormValues) {
    if (values.sizes.length === 0) {
      toast.error("Add at least one size");
      return;
    }
    const payload = toInput(values);
    const res = product
      ? await updateProductAction(product.id, payload)
      : await createProductAction(payload);
    if (res.ok) {
      toast.success(product ? "Product updated" : "Product created");
      router.push("/admin/products");
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  async function onDelete() {
    if (!product) return;
    if (!confirm("Delete this product permanently?")) return;
    setDeleting(true);
    const res = await deleteProductAction(product.id);
    if (res.ok) {
      toast.success("Product deleted");
      router.push("/admin/products");
      router.refresh();
    } else {
      toast.error(res.error);
      setDeleting(false);
    }
  }

  const previewImage = watched.colorways?.[0]?.images?.[0];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-6xl pb-24">
      {/* header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="text-sm text-zinc-500 hover:text-zinc-900 cursor-pointer"
          >
            ← Products
          </button>
          <h1 className="mt-2 font-display text-3xl text-zinc-900">
            {mode === "create" ? "New product" : watched.name || product?.name}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {mode === "edit" && (
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-zinc-200 px-3 text-sm text-red-600 transition-colors hover:bg-red-50 cursor-pointer"
            >
              <Trash2 size={15} /> Delete
            </button>
          )}
          <button
            type="submit"
            disabled={formState.isSubmitting}
            className="inline-flex h-10 items-center rounded-lg bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-accent disabled:opacity-60 cursor-pointer"
          >
            {formState.isSubmitting ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* main column */}
        <div className="space-y-6">
          {/* details */}
          <section className={card}>
            <h2 className="mb-4 text-sm font-semibold text-zinc-900">Details</h2>
            <div className="space-y-4">
              <div>
                <label className={label}>Name</label>
                <input
                  {...register("name", { required: true })}
                  className={input}
                  placeholder="Велюровый костюм"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={label}>Slug</label>
                  <input
                    {...register("slug")}
                    className={input}
                    placeholder="auto from name"
                  />
                </div>
                <div>
                  <label className={label}>Base SKU</label>
                  <input
                    {...register("baseSku")}
                    className={input}
                    placeholder="auto"
                  />
                </div>
              </div>
              <div>
                <label className={label}>Short description</label>
                <textarea
                  {...register("description")}
                  rows={2}
                  className={cn(input, "h-auto py-2")}
                />
              </div>
              <div>
                <label className={label}>Style description</label>
                <textarea
                  {...register("styleDescription")}
                  rows={4}
                  className={cn(input, "h-auto py-2")}
                />
              </div>
              <div>
                <label className={label}>Composition &amp; care</label>
                <textarea
                  {...register("care")}
                  rows={4}
                  className={cn(input, "h-auto py-2")}
                />
              </div>

              {/* details list */}
              <div>
                <label className={label}>Details</label>
                <div className="space-y-2">
                  {details.fields.map((f, i) => (
                    <div key={f.id} className="flex gap-2">
                      <input
                        {...register(`details.${i}.value`)}
                        className={input}
                        placeholder="60% Cotton / 40% Polyester"
                      />
                      <button
                        type="button"
                        onClick={() => details.remove(i)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 hover:text-red-600 cursor-pointer"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => details.append({ value: "" })}
                    className="inline-flex items-center gap-1 text-sm text-zinc-600 hover:text-accent cursor-pointer"
                  >
                    <Plus size={14} /> Add detail
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* sizes */}
          <section className={card}>
            <h2 className="mb-4 text-sm font-semibold text-zinc-900">Sizes</h2>
            <div className="flex flex-wrap items-center gap-2">
              {sizes.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-zinc-50 px-3 py-1 text-sm"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => removeSize(s)}
                    className="text-zinc-400 hover:text-red-600 cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
              <input
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSize();
                  }
                }}
                placeholder="Add size"
                className="h-8 w-24 rounded-lg border border-zinc-300 px-2 text-sm outline-none focus:border-zinc-900"
              />
            </div>
          </section>

          {/* colorways + variant matrix */}
          <section className={card}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-900">
                Colours &amp; stock
              </h2>
              <button
                type="button"
                onClick={() =>
                  colorways.append({
                    colorName: "",
                    swatchHex: "#cccccc",
                    images: [],
                    stock: {},
                  })
                }
                className="inline-flex items-center gap-1 text-sm text-zinc-600 hover:text-accent cursor-pointer"
              >
                <Plus size={14} /> Add colour
              </button>
            </div>

            <div className="space-y-6">
              {colorways.fields.map((f, ci) => (
                <div
                  key={f.id}
                  className="rounded-lg border border-zinc-200 p-4"
                >
                  <div className="flex items-center gap-3">
                    <Controller
                      control={control}
                      name={`colorways.${ci}.swatchHex`}
                      render={({ field }) => (
                        <input
                          type="color"
                          value={field.value}
                          onChange={field.onChange}
                          className="h-9 w-9 shrink-0 cursor-pointer rounded border border-zinc-300"
                        />
                      )}
                    />
                    <input
                      {...register(`colorways.${ci}.colorName`)}
                      placeholder="Colour name (e.g. Фианит)"
                      className={input}
                    />
                    {colorways.fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => colorways.remove(ci)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  <div className="mt-4">
                    <Controller
                      control={control}
                      name={`colorways.${ci}.images`}
                      render={({ field }) => (
                        <ImageUploader
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </div>

                  <div className="mt-4">
                    <p className={label}>Stock per size</p>
                    <div className="flex flex-wrap gap-3">
                      {sizes.map((s) => (
                        <div key={s} className="w-16">
                          <div className="mb-1 text-center text-xs text-zinc-500">
                            {s}
                          </div>
                          <input
                            type="number"
                            min={0}
                            {...register(`colorways.${ci}.stock.${s}`, {
                              valueAsNumber: true,
                            })}
                            className="h-9 w-full rounded-lg border border-zinc-300 px-2 text-center text-sm outline-none focus:border-zinc-900"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SEO */}
          <section className={card}>
            <h2 className="mb-4 text-sm font-semibold text-zinc-900">SEO</h2>
            <div className="space-y-4">
              <div>
                <label className={label}>Meta title</label>
                <input {...register("seoTitle")} className={input} />
              </div>
              <div>
                <label className={label}>Meta description</label>
                <textarea
                  {...register("seoDescription")}
                  rows={2}
                  className={cn(input, "h-auto py-2")}
                />
              </div>
            </div>
          </section>
        </div>

        {/* sidebar */}
        <div className="space-y-6">
          {/* status / organization */}
          <section className={card}>
            <h2 className="mb-4 text-sm font-semibold text-zinc-900">
              Organization
            </h2>
            <div className="space-y-4">
              <div>
                <label className={label}>Status</label>
                <select {...register("status")} className={input}>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className={label}>Category (gender)</label>
                <select {...register("gender")} className={input}>
                  <option value="women">Female</option>
                  <option value="men">Masculine</option>
                  <option value="kids">Children&apos;s</option>
                </select>
              </div>
              <div>
                <label className={label}>Style tag</label>
                <input {...register("style")} className={input} placeholder="basic" />
              </div>
              <label className="flex items-center gap-2 text-sm text-zinc-700">
                <input type="checkbox" {...register("forHome")} className="h-4 w-4" />
                Also in “For The Home”
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-700">
                <input type="checkbox" {...register("featured")} className="h-4 w-4" />
                Featured on homepage
              </label>
            </div>
          </section>

          {/* pricing */}
          <section className={card}>
            <h2 className="mb-4 text-sm font-semibold text-zinc-900">Pricing</h2>
            <div className="space-y-4">
              <div>
                <label className={label}>Price, ₽</label>
                <input
                  type="number"
                  min={0}
                  {...register("basePrice", { valueAsNumber: true })}
                  className={input}
                />
              </div>
              <div>
                <label className={label}>Compare-at price, ₽</label>
                <input
                  type="number"
                  min={0}
                  {...register("compareAtPrice", { valueAsNumber: true })}
                  className={input}
                />
              </div>
            </div>
          </section>

          {/* live preview */}
          <section className={card}>
            <h2 className="mb-4 text-sm font-semibold text-zinc-900">
              Preview
            </h2>
            <div className="overflow-hidden rounded-lg border border-zinc-100">
              <div className="relative aspect-[3/4] bg-zinc-50">
                {previewImage ? (
                  <Image
                    src={previewImage}
                    alt=""
                    fill
                    sizes="280px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                    No image
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-zinc-900">
                  {watched.name || "Product name"}
                </p>
                <p className="text-xs text-zinc-400">
                  {watched.colorways?.[0]?.colorName || "Colour"}
                </p>
                <p className="mt-1 text-sm text-zinc-700">
                  {formatPrice(Math.max(0, Number(watched.basePrice) || 0))}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
