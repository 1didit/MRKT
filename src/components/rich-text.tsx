import { cn } from "@/lib/utils";

const HTML_RE = /<[a-z][\s\S]*>/i;

/**
 * Renders product copy. New content from the Tiptap editor is HTML; legacy
 * seed content is plain text — fall back to preserving line breaks.
 */
export function RichText({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  if (!html) return null;
  if (HTML_RE.test(html)) {
    return (
      <div
        className={cn("richtext", className)}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
  return (
    <div className={cn("richtext whitespace-pre-line", className)}>{html}</div>
  );
}
