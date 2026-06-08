export interface SubCategory {
  slug: string;
  ru: string;
  en: string;
}

/** Sub-categories within a top category (Female/Masculine/Children's). */
export const SUBCATEGORIES: SubCategory[] = [
  { slug: "velour-suits", ru: "Велюровые костюмы", en: "Velour suits" },
  { slug: "sport-suits", ru: "Спортивные костюмы", en: "Sport suits" },
  { slug: "hoodies", ru: "Худи", en: "Hoodies" },
  { slug: "sweatshirts", ru: "Свитшоты", en: "Sweatshirts" },
  { slug: "pants", ru: "Брюки", en: "Trousers" },
  { slug: "outerwear", ru: "Верхняя одежда", en: "Outerwear" },
  { slug: "shorts", ru: "Шорты", en: "Shorts" },
  { slug: "tshirts", ru: "Футболки", en: "T-shirts" },
  { slug: "bags", ru: "Сумки", en: "Bags" },
];

export const SUBCATEGORY_BY_SLUG: Record<string, SubCategory> =
  Object.fromEntries(SUBCATEGORIES.map((s) => [s.slug, s]));

export function subcategoryLabel(
  slug: string | null | undefined,
  locale: string = "en",
): string {
  if (!slug) return "";
  const sc = SUBCATEGORY_BY_SLUG[slug];
  if (!sc) return slug;
  return locale === "ru" ? sc.ru : sc.en;
}
