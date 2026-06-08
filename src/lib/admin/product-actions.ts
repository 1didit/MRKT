"use server";

import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { productRepo } from "@/lib/repositories";
import { isAdmin } from "@/lib/auth";

const variantSchema = z.object({
  size: z.string().min(1),
  sku: z.string().min(1),
  stock: z.number().int().min(0),
  priceOverride: z.number().int().min(0).nullable().optional(),
});

const colorwaySchema = z.object({
  colorName: z.string().min(1, "Colour name is required"),
  swatchHex: z.string().nullable().optional(),
  images: z.array(z.string()),
  variants: z.array(variantSchema).min(1),
});

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  styleDescription: z.string().optional(),
  care: z.string().optional(),
  gender: z.enum(["women", "men", "kids"]),
  forHome: z.boolean().optional(),
  style: z.string().nullable().optional(),
  basePrice: z.number().int().min(0),
  compareAtPrice: z.number().int().min(0).nullable().optional(),
  status: z.enum(["draft", "active", "archived"]).optional(),
  featured: z.boolean().optional(),
  details: z.array(z.string()).optional(),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  colorways: z.array(colorwaySchema).min(1, "Add at least one colour"),
});

export type ProductActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

function revalidateCatalog() {
  revalidatePath("/admin/products");
  revalidatePath("/admin");
  revalidatePath("/catalog");
  revalidatePath("/");
}

export async function createProductAction(
  input: unknown,
): Promise<ProductActionResult> {
  if (!(await isAdmin())) return { ok: false, error: "Unauthorized" };
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  const product = await productRepo.create(parsed.data);
  revalidateCatalog();
  return { ok: true, id: product.id };
}

export async function updateProductAction(
  id: string,
  input: unknown,
): Promise<ProductActionResult> {
  if (!(await isAdmin())) return { ok: false, error: "Unauthorized" };
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  const product = await productRepo.update(id, parsed.data);
  revalidateCatalog();
  return { ok: true, id: product.id };
}

export async function deleteProductAction(
  id: string,
): Promise<ProductActionResult> {
  if (!(await isAdmin())) return { ok: false, error: "Unauthorized" };
  await productRepo.softDelete(id);
  revalidateCatalog();
  return { ok: true, id };
}

const IMAGE_TYPES: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/avif": "avif",
};

export async function uploadImagesAction(
  formData: FormData,
): Promise<{ ok: true; urls: string[] } | { ok: false; error: string }> {
  if (!(await isAdmin())) return { ok: false, error: "Unauthorized" };
  const files = formData.getAll("files").filter((f): f is File => f instanceof File);
  const urls: string[] = [];
  for (const file of files) {
    const ext = IMAGE_TYPES[file.type];
    if (!ext) return { ok: false, error: `Unsupported type: ${file.type}` };
    if (file.size > 8 * 1024 * 1024) {
      return { ok: false, error: `${file.name} exceeds 8MB` };
    }
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`products/${randomUUID()}.${ext}`, file, {
        access: "public",
        contentType: file.type,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      urls.push(blob.url);
    } else {
      const name = `${randomUUID()}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(join(process.cwd(), "public", "uploads", name), buffer);
      urls.push(`/uploads/${name}`);
    }
  }
  return { ok: true, urls };
}
