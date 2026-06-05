import { defineConfig } from "drizzle-kit";

const url = process.env.DATABASE_URL ?? "file:./data/neva.db";
const authToken = process.env.DATABASE_AUTH_TOKEN;
const remote = !!authToken || url.startsWith("libsql:");

export default defineConfig(
  remote
    ? {
        schema: "./src/db/schema.ts",
        out: "./drizzle",
        dialect: "turso",
        dbCredentials: { url, authToken },
      }
    : {
        schema: "./src/db/schema.ts",
        out: "./drizzle",
        dialect: "sqlite",
        dbCredentials: { url },
      },
);
