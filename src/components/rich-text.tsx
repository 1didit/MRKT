import { HTML_RE, sanitizeRichHtml } from "@/lib/sanitize";
import { cn } from "@/lib/utils";

/**
 * Renders product copy. New content from the Tiptap editor is HTML; legacy
 * seed content is plain text — fall back to preserving line breaks. HTML is
 * re-sanitized here (idempotent) as a safety net even when callers already
 * cleaned it at the data boundary.
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
        dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(html) }}
      />
    );
  }
  return (
    <div className={cn("richtext whitespace-pre-line", className)}>{html}</div>
  );
}
