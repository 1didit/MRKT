import { randomUUID } from "node:crypto";
import { eq, inArray, like } from "drizzle-orm";
import { put } from "@vercel/blob";
import { db } from "@/db/client";
import { colorways, products } from "@/db/schema";

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const CONC = 8;

const CT: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};
function extOf(url: string): string {
  const m = url.toLowerCase().match(/\.(jpg|jpeg|png|webp|avif)(\?|$)/);
  return m ? m[1].replace("jpeg", "jpg") : "jpg";
}

let migrated = 0;
let failed = 0;

async function migrateUrl(url: string): Promise<string> {
  if (!url.includes("tildacdn.com")) return url;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      failed++;
      return url;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const ext = extOf(url);
    const blob = await put(`products/ns/${randomUUID()}.${ext}`, buf, {
      access: "public",
      contentType: CT[ext] || "image/jpeg",
      token: TOKEN,
    });
    migrated++;
    return blob.url;
  } catch {
    failed++;
    return url;
  }
}

async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (t: T) => Promise<R>,
): Promise<R[]> {
  const out = new Array<R>(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );
  return out;
}

async function main() {
  if (!TOKEN) {
    console.error("NO BLOB_READ_WRITE_TOKEN");
    process.exit(1);
  }
  const ids = (
    await db.select({ id: products.id }).from(products).where(like(products.slug, "ns-%"))
  ).map((r) => r.id);
  const cws = ids.length
    ? await db.select().from(colorways).where(inArray(colorways.productId, ids))
    : [];

  let cwUpdated = 0;
  for (const cw of cws) {
    const imgs = cw.images as string[];
    if (!imgs.some((u) => u.includes("tildacdn.com"))) continue;
    const newImgs = await mapLimit(imgs, CONC, migrateUrl);
    await db
      .update(colorways)
      .set({ images: newImgs })
      .where(eq(colorways.id, cw.id));
    cwUpdated++;
    if (cwUpdated % 15 === 0)
      console.log(`...${cwUpdated} colorways, ${migrated} images, ${failed} failed`);
  }
  console.log(
    "DONE " +
      JSON.stringify({ colorways: cws.length, cwUpdated, migrated, failed }),
  );
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
