import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/product-detail";
import { getProductBySlug } from "@/lib/catalog";
import { cleanRichText } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Not found" };
  const cover = product.colorways[0]?.images[0];
  return {
    title: `${product.name} — ${product.colorways[0]?.colorName ?? ""}`,
    description: product.description,
    openGraph: cover ? { images: [cover] } : undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  // Sanitize rich-text at the boundary so raw markup never reaches the client.
  const safeProduct = {
    ...product,
    styleDescription: cleanRichText(product.styleDescription),
    care: cleanRichText(product.care),
  };
  return <ProductDetail product={safeProduct} />;
}
