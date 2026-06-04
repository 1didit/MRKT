import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { productRepo } from "@/lib/repositories";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await productRepo.get(id);
  if (!product) notFound();

  return <ProductForm product={product} />;
}
