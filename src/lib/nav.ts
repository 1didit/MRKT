export interface NavCategory {
  slug: string;
  label: string;
}

/** Storefront top-level categories (client-safe, no product data). */
export const NAV_CATEGORIES: NavCategory[] = [
  { slug: "female", label: "Female" },
  { slug: "masculine", label: "Masculine" },
  { slug: "children", label: "Children's" },
  { slug: "home", label: "For The Home" },
];

export const FOOTER_SECTIONS = [
  {
    title: "Shop",
    links: [
      { label: "Catalog", href: "/catalog" },
      { label: "About NEVA Premium", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Requisites", href: "/requisites" },
      { label: "Contacts", href: "/contact" },
    ],
  },
  {
    title: "Buyers",
    links: [
      { label: "Delivery and payment", href: "/shipping" },
      { label: "Exchange and return", href: "/returns" },
      { label: "Composition and care", href: "/care" },
      { label: "Public Offer", href: "/offer" },
      { label: "Confidentiality", href: "/privacy" },
    ],
  },
] as const;

export const SHOWROOM = {
  name: "ООО «НЕВА»",
  address: "115035, г. Москва, ул. Большая Ордынка, д. 19, стр. 1",
  telegram: "https://t.me/nevastore81",
};
