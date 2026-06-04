import type { Metadata } from "next";
import Link from "next/link";
import { ContentArticle, type ContentBlock } from "@/components/content-article";
import raw from "@/content/pages/blog-pmef.json";

export const metadata: Metadata = { title: "NEVA Premium на ПМЭФ" };

const blocks = (raw as ContentBlock[]).filter(
  (b) => !b.text.startsWith("←"),
);

export default function BlogPmefPage() {
  return (
    <div>
      <div className="mx-auto max-w-3xl px-5 pt-10">
        <Link href="/blog" className="text-sm text-zinc-500 hover:text-zinc-900">
          ← Blog
        </Link>
      </div>
      <ContentArticle blocks={blocks} />
    </div>
  );
}
