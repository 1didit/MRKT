import type { ReactNode } from "react";

export interface ContentBlock {
  tag: string;
  text: string;
}

export function ContentArticle({ blocks }: { blocks: ContentBlock[] }) {
  const [first, ...rest] = blocks;
  const out: ReactNode[] = [];
  let liBuf: string[] = [];

  const flush = (key: string) => {
    if (liBuf.length) {
      const items = liBuf;
      out.push(
        <ul
          key={`ul-${key}`}
          className="mt-3 list-disc space-y-1.5 pl-5 text-zinc-600"
        >
          {items.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>,
      );
      liBuf = [];
    }
  };

  rest.forEach((b, i) => {
    if (b.tag === "li") {
      liBuf.push(b.text);
      return;
    }
    flush(String(i));
    if (b.tag === "h2") {
      out.push(
        <h2 key={i} className="mt-10 text-xl font-semibold text-zinc-900">
          {b.text}
        </h2>,
      );
    } else if (b.tag === "h3") {
      out.push(
        <h3 key={i} className="mt-6 text-base font-semibold text-zinc-900">
          {b.text}
        </h3>,
      );
    } else if (b.tag === "strong" || b.tag === "span") {
      out.push(
        <p key={i} className="mt-5 font-medium text-zinc-900">
          {b.text}
        </p>,
      );
    } else {
      out.push(
        <p key={i} className="mt-4 leading-relaxed text-zinc-600">
          {b.text}
        </p>,
      );
    }
  });
  flush("end");

  return (
    <article className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <h1 className="text-3xl font-semibold text-zinc-900 sm:text-4xl">
        {first?.text}
      </h1>
      <div className="mt-6">{out}</div>
    </article>
  );
}
