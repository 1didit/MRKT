import { inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { products } from "@/db/schema";

// neva-store.ru/#best Tilda store block
const URL = `https://store.tildacdn.com/api/getproductslist/?storepartuid=969914085721&recid=693713586&projectid=7176234&slng=ru&size=0:500&c=${Date.now()}`;

async function main() {
  const res = await fetch(URL);
  const data = (await res.json()) as { products?: { uid: number | string }[] };
  const slugs = (data.products ?? []).map((p) => `ns-${p.uid}`);

  // reset, then mark
  await db.update(products).set({ bestseller: false });
  if (slugs.length) {
    await db
      .update(products)
      .set({ bestseller: true })
      .where(inArray(products.slug, slugs));
  }

  const rows = await db.select().from(products);
  console.log(
    "RESULT " +
      JSON.stringify({
        bestUids: slugs.length,
        marked: rows.filter((r) => r.bestseller).length,
      }),
  );
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
