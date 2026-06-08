import { productRepo } from "@/lib/repositories";

const PID = "7176234";
const DRY = process.env.DRY === "1";

// neva-store.ru/men Tilda store blocks → our sub-category slugs.
// Block 824831419 mixes sport + velour suits → resolved per product.
const BLOCKS = [
  { recid: "824831419", storepart: "600941225692", sub: "sport-suits" },
  { recid: "697318445", storepart: "769085959921", sub: "hoodies" },
  { recid: "697318446", storepart: "917405748161", sub: "sweatshirts" },
  { recid: "697318447", storepart: "248402082961", sub: "pants" },
  { recid: "697318448", storepart: "861342464651", sub: "tshirts" },
  { recid: "776087742", storepart: "928825152412", sub: "shorts" },
] as const;

interface TEdition {
  sku?: string;
  quantity?: string;
  ["Размер"]?: string;
  ["Цвет"]?: string;
}
interface TProduct {
  uid: number | string;
  title: string;
  descr?: string;
  text?: string;
  price?: string;
  gallery?: string;
  json_options?: string;
  editions?: TEdition[];
  sku?: string;
  externalid?: string;
}

const num = (s: unknown) =>
  Math.round(parseFloat(String(s ?? "").replace(/\s/g, "")) || 0);

function parseImages(s?: string): string[] {
  try {
    return (JSON.parse(s || "[]") as { img?: string }[])
      .map((x) => x.img!)
      .filter(Boolean);
  } catch {
    return [];
  }
}

function subFor(block: (typeof BLOCKS)[number], p: TProduct): string {
  if (block.recid === "824831419") {
    return /велюр/i.test(p.title) ? "velour-suits" : "sport-suits";
  }
  return block.sub;
}

function buildColorways(p: TProduct, baseSku: string) {
  const images = parseImages(p.gallery);
  const eds = p.editions ?? [];
  const groups = new Map<string, { size: string; sku: string; stock: number }[]>();

  if (eds.length) {
    for (const e of eds) {
      const color = (e["Цвет"] || p.descr || "—").trim();
      const size = (e["Размер"] || "OS").trim();
      const sku = e.sku || `${baseSku}-${size}`;
      if (!groups.has(color)) groups.set(color, []);
      groups.get(color)!.push({ size, sku, stock: num(e.quantity) || 10 });
    }
  } else {
    let sizes: string[] = ["OS"];
    try {
      const opts = JSON.parse(p.json_options || "[]") as {
        title: string;
        values: string[];
      }[];
      const so = opts.find((o) => /размер/i.test(o.title));
      if (so?.values?.length) sizes = so.values.map(String);
    } catch {
      /* keep default */
    }
    const color = (p.descr || "—").trim();
    groups.set(
      color,
      sizes.map((s) => ({ size: s, sku: `${baseSku}-${s}`, stock: 10 })),
    );
  }

  return [...groups.entries()].map(([colorName, variants]) => ({
    colorName,
    swatchHex: null,
    images,
    variants,
  }));
}

async function fetchBlock(b: (typeof BLOCKS)[number]): Promise<TProduct[]> {
  const url = `https://store.tildacdn.com/api/getproductslist/?storepartuid=${b.storepart}&recid=${b.recid}&projectid=${PID}&slng=ru&getparts=true&size=0:500&c=${Date.now()}`;
  const res = await fetch(url);
  const data = (await res.json()) as { products?: TProduct[] };
  return data.products ?? [];
}

async function main() {
  const seen = new Set<string>();
  let created = 0;
  let skipped = 0;
  const bySub: Record<string, number> = {};

  for (const b of BLOCKS) {
    const prods = await fetchBlock(b);
    for (const p of prods) {
      const uid = String(p.uid);
      if (seen.has(uid)) continue;
      seen.add(uid);

      const slug = `ns-${uid}`;
      if (await productRepo.getBySlug(slug)) {
        skipped++;
        continue;
      }

      const baseSku =
        String(p.sku || p.externalid || uid)
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "")
          .slice(0, 12) || `NS${uid}`;
      const sub = subFor(b, p);
      bySub[sub] = (bySub[sub] || 0) + 1;
      if (DRY) continue;

      await productRepo.create({
        slug,
        name: p.title,
        description: (p.text || "").trim(),
        styleDescription: "",
        care: "",
        gender: "men",
        forHome: false,
        subcategory: sub,
        basePrice: num(p.price),
        status: "active",
        featured: false,
        details: [],
        colorways: buildColorways(p, baseSku),
      });
      created++;
    }
  }

  console.log(
    JSON.stringify({ dry: DRY, unique: seen.size, created, skipped, bySub }),
  );
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
