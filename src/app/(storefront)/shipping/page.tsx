import type { Metadata } from "next";
import { ContentArticle, type ContentBlock } from "@/components/content-article";
import blocks from "@/content/pages/shipping.json";

export const metadata: Metadata = { title: "Delivery and payment" };

export default function ShippingPage() {
  return <ContentArticle blocks={blocks as ContentBlock[]} />;
}
