import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { nanoid } from "nanoid";
import { db } from "@/db/client";
import {
  colorways,
  orders,
  products,
  variants,
  type OrderItemSnapshot,
} from "@/db/schema";
import { SqliteProductRepository } from "@/lib/repositories/sqlite-product-repository";

interface RawProduct {
  id: string;
  name: string;
  colorName: string;
  sku: string;
  price: number;
  images: string[];
  description?: string;
  care?: string;
  styleDescription?: string;
  details?: string[];
  sizes?: string[];
  gender: "women" | "men" | "kids";
  style?: string;
  category?: string;
}

const rnd = (min: number, max: number) =>
  min + Math.floor(Math.random() * (max - min + 1));

async function main() {
  const raw: RawProduct[] = JSON.parse(
    readFileSync(resolve(process.cwd(), "src/data/products.json"), "utf8"),
  );

  // reset
  await db.delete(variants);
  await db.delete(colorways);
  await db.delete(products);
  await db.delete(orders);

  const repo = new SqliteProductRepository();
  const created = [];
  for (const [i, p] of raw.entries()) {
    const prod = await repo.create({
      slug: p.id,
      name: p.name,
      description: p.description ?? "",
      styleDescription: p.styleDescription ?? "",
      care: p.care ?? "",
      gender: p.gender,
      forHome: p.category === "home",
      style: p.style ?? null,
      basePrice: p.price,
      compareAtPrice: null,
      status: "active",
      featured: i < 6,
      details: p.details ?? [],
      colorways: [
        {
          colorName: p.colorName,
          swatchHex: null,
          images: p.images,
          variants: (p.sizes ?? ["S", "M", "L"]).map((s) => ({
            size: s,
            sku: `${p.sku}-${s}`,
            stock: rnd(4, 22),
          })),
        },
      ],
    });
    created.push(prod);
  }

  // sample orders so Dashboard + Orders are meaningful
  const customers: [string, string][] = [
    ["Анна Иванова", "anna@example.com"],
    ["Дмитрий Соколов", "dmitry@example.com"],
    ["Елена Петрова", "elena@example.com"],
    ["Игорь Волков", "igor@example.com"],
    ["Мария Кузнецова", "maria@example.com"],
  ];
  const statuses = [
    "new",
    "paid",
    "processing",
    "shipped",
    "delivered",
  ] as const;

  for (let i = 0; i < 7; i++) {
    const p = created[rnd(0, created.length - 1)];
    const cw = p.colorways[0];
    const v = cw.variants[rnd(0, cw.variants.length - 1)];
    const qty = rnd(1, 2);
    const item: OrderItemSnapshot = {
      productId: p.id,
      name: p.name,
      colorName: cw.colorName,
      size: v.size,
      price: p.basePrice,
      qty,
      image: cw.images[0] ?? "",
    };
    const [name, email] = customers[i % customers.length];
    await db.insert(orders).values({
      id: nanoid(),
      number: `NP-${1000 + i}`,
      customerName: name,
      customerEmail: email,
      status: statuses[i % statuses.length],
      total: p.basePrice * qty,
      items: [item],
      createdAt: new Date(Date.now() - i * 2 * 86_400_000),
    });
  }

  const counts = {
    products: (await db.select().from(products)).length,
    colorways: (await db.select().from(colorways)).length,
    variants: (await db.select().from(variants)).length,
    orders: (await db.select().from(orders)).length,
  };
  console.log("Seeded:", counts);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
