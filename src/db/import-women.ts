import { productRepo } from "@/lib/repositories";

const PID = "7176234";
const DRY = process.env.DRY === "1";

// neva-store.ru/woman Tilda store blocks → our sub-category slugs
const BLOCKS = [
  { recid: "821454885", storepart: "733640170602", sub: "sport-suits" },
  { recid: "783261339", storepart: "372634066671", sub: "hoodies" },
  { recid: "697316158", storepart: "543191600021", sub: "pants" },
  { recid: "697314546", storepart: "456109267301", sub: "sweatshirts" },
  { recid: "815238900", storepart: "780532411192", sub: "outerwear" },
  { recid: "774699709", storepart: "351048384542", sub: "shorts" },
  { recid: "697316207", storepart: "786887306391", sub: "tshirts" },
  { recid: "776088621", storepart: "279712658612", sub: "bags" },
] as const;

interface TEdition {
  sku?: string;
  quantity?: string;
  price?: string;
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

      bySub[b.sub] = (bySub[b.sub] || 0) + 1;
      if (DRY) continue;

      await productRepo.create({
        slug,
        name: p.title,
        description: (p.text || "").trim(),
        styleDescription: "",
        care: "",
        gender: "women",
        forHome: false,
        subcategory: b.sub,
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
