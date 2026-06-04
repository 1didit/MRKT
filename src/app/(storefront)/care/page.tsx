import type { Metadata } from "next";
import { ContentArticle, type ContentBlock } from "@/components/content-article";
import blocks from "@/content/pages/care.json";

export const metadata: Metadata = { title: "Composition and care" };

export default function CarePage() {
  return <ContentArticle blocks={blocks as ContentBlock[]} />;
}
