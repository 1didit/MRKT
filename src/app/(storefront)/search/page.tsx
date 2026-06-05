import type { Metadata } from "next";
import { SearchClient } from "@/components/search-client";
import { getActiveProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage() {
  const products = await getActiveProducts();
  return <SearchClient products={products} />;
}
