import type { Metadata } from "next";
import { ContentArticle, type ContentBlock } from "@/components/content-article";
import blocks from "@/content/pages/about.json";

export const metadata: Metadata = { title: "About NEVA Premium" };

export default function AboutPage() {
  return <ContentArticle blocks={blocks as ContentBlock[]} />;
}
