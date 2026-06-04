import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const url = process.env.DATABASE_URL ?? "file:./data/neva.db";

const globalForDb = globalThis as unknown as {
  __nevaSqlite?: ReturnType<typeof createClient>;
};

const sqlite = globalForDb.__nevaSqlite ?? createClient({ url });
if (process.env.NODE_ENV !== "production") globalForDb.__nevaSqlite = sqlite;

export const db = drizzle(sqlite, { schema });
export { schema };
