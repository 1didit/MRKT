import { sql } from "drizzle-orm";
import { db } from "@/db/client";

/**
 * Additive migration (safe — never drops/recreates). Creates the `counters`
 * sequence table and seeds `order_number` to the highest existing order number
 * so the next checkout continues the sequence without colliding.
 */
async function main() {
  await db.run(
    sql`CREATE TABLE IF NOT EXISTS counters (id text PRIMARY KEY, value integer NOT NULL DEFAULT 0)`,
  );
  await db.run(
    sql`INSERT OR IGNORE INTO counters (id, value)
        SELECT 'order_number', COALESCE(MAX(CAST(SUBSTR(number, 4) AS INTEGER)), 1000) FROM orders`,
  );
  const rows = await db.all(sql`SELECT id, value FROM counters`);
  console.log("counters:", rows);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
