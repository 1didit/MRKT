import type { Metadata } from "next";
import { ContentArticle, type ContentBlock } from "@/components/content-article";
import blocks from "@/content/pages/returns.json";

export const metadata: Metadata = { title: "Exchange and return" };

export default function ReturnsPage() {
  return <ContentArticle blocks={blocks as ContentBlock[]} />;
}
