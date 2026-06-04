import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/**
 * Backend-agnostic catalog schema (color x size variant matrix).
 * Today backed by local SQLite; later swappable for a CS-Cart adapter
 * behind the ProductRepository interface — no dual-source sync.
 */

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  styleDescription: text("style_description").notNull().default(""),
  care: text("care").notNull().default(""),
  gender: text("gender", { enum: ["women", "men", "kids"] }).notNull(),
  forHome: integer("for_home", { mode: "boolean" }).notNull().default(false),
  style: text("style"),
  basePrice: integer("base_price").notNull(),
  compareAtPrice: integer("compare_at_price"),
  status: text("status", { enum: ["draft", "active", "archived"] })
    .notNull()
    .default("active"),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  details: text("details", { mode: "json" }).$type<string[]>().notNull(),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const colorways = sqliteTable("colorways", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  colorName: text("color_name").notNull(),
  swatchHex: text("swatch_hex"),
  position: integer("position").notNull().default(0),
  images: text("images", { mode: "json" }).$type<string[]>().notNull(),
});

export const variants = sqliteTable("variants", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  colorwayId: text("colorway_id")
    .notNull()
    .references(() => colorways.id, { onDelete: "cascade" }),
  size: text("size").notNull(),
  sku: text("sku").notNull(),
  stock: integer("stock").notNull().default(0),
  priceOverride: integer("price_override"),
  position: integer("position").notNull().default(0),
});

export interface OrderItemSnapshot {
  productId: string;
  name: string;
  colorName: string;
  size: string;
  price: number;
  qty: number;
  image: string;
}

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  number: text("number").notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  status: text("status", {
    enum: ["new", "paid", "processing", "shipped", "delivered", "cancelled"],
  })
    .notNull()
    .default("new"),
  total: integer("total").notNull(),
  items: text("items", { mode: "json" })
    .$type<OrderItemSnapshot[]>()
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type ProductRow = typeof products.$inferSelect;
export type ColorwayRow = typeof colorways.$inferSelect;
export type VariantRow = typeof variants.$inferSelect;
export type OrderRow = typeof orders.$inferSelect;
