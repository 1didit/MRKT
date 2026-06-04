import type { Metadata } from "next";
import { ContentArticle, type ContentBlock } from "@/components/content-article";
import blocks from "@/content/pages/offer.json";

export const metadata: Metadata = { title: "Public Offer" };

export default function OfferPage() {
  return <ContentArticle blocks={blocks as ContentBlock[]} />;
}
