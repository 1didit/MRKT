import type { Metadata } from "next";
import { ContentArticle, type ContentBlock } from "@/components/content-article";
import blocks from "@/content/pages/privacy.json";

export const metadata: Metadata = { title: "Confidentiality" };

export default function PrivacyPage() {
  return <ContentArticle blocks={blocks as ContentBlock[]} />;
}
