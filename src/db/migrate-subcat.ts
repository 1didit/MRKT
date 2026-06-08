import { isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { products } from "@/db/schema";

// Existing velour/cashmere suits (no subcategory yet) → "velour-suits".
// Imported products already carry their own subcategory, so they're untouched.
async function main() {
  await db
    .update(products)
    .set({ subcategory: "velour-suits" })
    .where(isNull(products.subcategory));

  const rows = await db.select().from(products);
  console.log(
    JSON.stringify({
      total: rows.length,
      velourSuits: rows.filter((r) => r.subcategory === "velour-suits").length,
      stillNull: rows.filter((r) => !r.subcategory).length,
    }),
  );
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
