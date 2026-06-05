import {
  and,
  desc,
  eq,
  inArray,
  isNotNull,
  isNull,
  like,
  sql,
  type SQL,
} from "drizzle-orm";
import { nanoid } from "nanoid";
import slugify from "slugify";
import { db } from "@/db/client";
import { colorways, products, variants } from "@/db/schema";
import type {
  ColorwayInput,
  ListParams,
  Product,
  ProductInput,
  ProductRepository,
  ProductStatus,
  ProductSummary,
} from "./types";

function categoryWhere(category?: string) {
  switch (category) {
    case "female":
      return eq(products.gender, "women");
    case "masculine":
      return eq(products.gender, "men");
    case "children":
      return eq(products.gender, "kids");
    case "home":
      return eq(products.forHome, true);
    default:
      return undefined;
  }
}

export class SqliteProductRepository implements ProductRepository {
  async list(params: ListParams = {}): Promise<ProductSummary[]> {
    const conds = [isNull(products.deletedAt)];
    if (params.search) conds.push(like(products.name, `%${params.search}%`));
    if (params.status) conds.push(eq(products.status, params.status));
    const catW = categoryWhere(params.category);
    if (catW) conds.push(catW);
    return this.summaries(and(...conds));
  }

  async listDeleted(): Promise<ProductSummary[]> {
    return this.summaries(isNotNull(products.deletedAt));
  }

  private async summaries(where: SQL | undefined): Promise<ProductSummary[]> {
    const rows = await db
      .select()
      .from(products)
      .where(where)
      .orderBy(desc(products.updatedAt));

    const ids = rows.map((r) => r.id);
    const cws = ids.length
      ? await db.select().from(colorways).where(inArray(colorways.productId, ids))
      : [];
    const vs = ids.length
      ? await db.select().from(variants).where(inArray(variants.productId, ids))
      : [];

    return rows.map((r) => {
      const pcws = cws
        .filter((c) => c.productId === r.id)
        .sort((a, b) => a.position - b.position);
      const pvs = vs.filter((v) => v.productId === r.id);
      return {
        id: r.id,
        slug: r.slug,
        name: r.name,
        status: r.status,
        featured: r.featured,
        gender: r.gender,
        forHome: r.forHome,
        basePrice: r.basePrice,
        compareAtPrice: r.compareAtPrice,
        colorName: pcws[0]?.colorName ?? null,
        primaryImage: pcws[0]?.images[0] ?? null,
        secondaryImage: pcws[0]?.images[1] ?? null,
        colorCount: pcws.length,
        totalStock: pvs.reduce((n, v) => n + v.stock, 0),
        updatedAt: r.updatedAt,
      };
    });
  }

  get(id: string) {
    return this.assemble(eq(products.id, id));
  }

  getBySlug(slug: string) {
    return this.assemble(eq(products.slug, slug));
  }

  private async assemble(
    where: ReturnType<typeof eq>,
  ): Promise<Product | null> {
    const [p] = await db
      .select()
      .from(products)
      .where(and(where, isNull(products.deletedAt)))
      .limit(1);
    if (!p) return null;
    const cws = await db
      .select()
      .from(colorways)
      .where(eq(colorways.productId, p.id))
      .orderBy(colorways.position);
    const vs = await db
      .select()
      .from(variants)
      .where(eq(variants.productId, p.id))
      .orderBy(variants.position);

    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      styleDescription: p.styleDescription,
      care: p.care,
      gender: p.gender,
      forHome: p.forHome,
      style: p.style,
      basePrice: p.basePrice,
      compareAtPrice: p.compareAtPrice,
      status: p.status,
      featured: p.featured,
      details: p.details,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      colorways: cws.map((c) => ({
        id: c.id,
        colorName: c.colorName,
        swatchHex: c.swatchHex,
        images: c.images,
        variants: vs
          .filter((v) => v.colorwayId === c.id)
          .map((v) => ({
            id: v.id,
            colorwayId: v.colorwayId,
            size: v.size,
            sku: v.sku,
            stock: v.stock,
            priceOverride: v.priceOverride,
          })),
      })),
    };
  }

  async create(input: ProductInput): Promise<Product> {
    const id = nanoid();
    const slug = await this.uniqueSlug(input.slug || input.name, null);
    const now = new Date();
    await db.transaction(async (tx) => {
      await tx.insert(products).values({
        id,
        slug,
        name: input.name,
        description: input.description ?? "",
        styleDescription: input.styleDescription ?? "",
        care: input.care ?? "",
        gender: input.gender,
        forHome: input.forHome ?? false,
        style: input.style ?? null,
        basePrice: input.basePrice,
        compareAtPrice: input.compareAtPrice ?? null,
        status: input.status ?? "active",
        featured: input.featured ?? false,
        details: input.details ?? [],
        seoTitle: input.seoTitle ?? null,
        seoDescription: input.seoDescription ?? null,
        createdAt: now,
        updatedAt: now,
      });
      await this.insertColorways(tx, id, input.colorways);
    });
    return (await this.get(id))!;
  }

  async update(id: string, input: ProductInput): Promise<Product> {
    const slug = await this.uniqueSlug(input.slug || input.name, id);
    await db.transaction(async (tx) => {
      await tx
        .update(products)
        .set({
          slug,
          name: input.name,
          description: input.description ?? "",
          styleDescription: input.styleDescription ?? "",
          care: input.care ?? "",
          gender: input.gender,
          forHome: input.forHome ?? false,
          style: input.style ?? null,
          basePrice: input.basePrice,
          compareAtPrice: input.compareAtPrice ?? null,
          status: input.status ?? "active",
          featured: input.featured ?? false,
          details: input.details ?? [],
          seoTitle: input.seoTitle ?? null,
          seoDescription: input.seoDescription ?? null,
          updatedAt: new Date(),
        })
        .where(eq(products.id, id));
      await tx.delete(variants).where(eq(variants.productId, id));
      await tx.delete(colorways).where(eq(colorways.productId, id));
      await this.insertColorways(tx, id, input.colorways);
    });
    return (await this.get(id))!;
  }

  private async insertColorways(
    tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
    productId: string,
    cws: ColorwayInput[],
  ) {
    let cpos = 0;
    for (const cw of cws) {
      const cid = nanoid();
      await tx.insert(colorways).values({
        id: cid,
        productId,
        colorName: cw.colorName,
        swatchHex: cw.swatchHex ?? null,
        position: cpos++,
        images: cw.images ?? [],
      });
      let vpos = 0;
      for (const v of cw.variants) {
        await tx.insert(variants).values({
          id: nanoid(),
          productId,
          colorwayId: cid,
          size: v.size,
          sku: v.sku,
          stock: v.stock ?? 0,
          priceOverride: v.priceOverride ?? null,
          position: vpos++,
        });
      }
    }
  }

  async delete(id: string): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.delete(variants).where(eq(variants.productId, id));
      await tx.delete(colorways).where(eq(colorways.productId, id));
      await tx.delete(products).where(eq(products.id, id));
    });
  }

  async setStatus(id: string, status: ProductStatus): Promise<void> {
    await db
      .update(products)
      .set({ status, updatedAt: new Date() })
      .where(eq(products.id, id));
  }

  async setFeatured(id: string, featured: boolean): Promise<void> {
    await db
      .update(products)
      .set({ featured, updatedAt: new Date() })
      .where(eq(products.id, id));
  }

  async setPrice(id: string, price: number): Promise<void> {
    await db
      .update(products)
      .set({ basePrice: Math.max(0, Math.round(price)), updatedAt: new Date() })
      .where(eq(products.id, id));
  }

  async addStock(productId: string, qty: number): Promise<void> {
    const n = Math.round(qty);
    if (n <= 0) return;
    await db
      .update(variants)
      .set({ stock: sql`${variants.stock} + ${n}` })
      .where(eq(variants.productId, productId));
    await db
      .update(products)
      .set({ updatedAt: new Date() })
      .where(eq(products.id, productId));
  }

  async setStockAll(productId: string, qty: number): Promise<void> {
    await db
      .update(variants)
      .set({ stock: Math.max(0, Math.round(qty)) })
      .where(eq(variants.productId, productId));
    await db
      .update(products)
      .set({ updatedAt: new Date() })
      .where(eq(products.id, productId));
  }

  async softDelete(id: string): Promise<void> {
    await db
      .update(products)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(products.id, id));
  }

  async restore(id: string): Promise<void> {
    await db
      .update(products)
      .set({ deletedAt: null, status: "active", updatedAt: new Date() })
      .where(eq(products.id, id));
  }

  async updateVariantStock(variantId: string, stock: number): Promise<void> {
    await db.update(variants).set({ stock }).where(eq(variants.id, variantId));
  }

  private async uniqueSlug(
    base: string,
    excludeId: string | null,
  ): Promise<string> {
    let s = slugify(base, { lower: true, strict: true });
    if (!s) s = nanoid(6);
    let candidate = s;
    let i = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const [existing] = await db
        .select({ id: products.id })
        .from(products)
        .where(eq(products.slug, candidate))
        .limit(1);
      if (!existing || existing.id === excludeId) return candidate;
      candidate = `${s}-${++i}`;
    }
  }
}
