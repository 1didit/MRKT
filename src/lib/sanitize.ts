import { FilterXSS } from "xss";

/** Heuristic: does this string contain markup (vs. plain seed text)? */
export const HTML_RE = /<[a-z][\s\S]*>/i;

// Matches the Tiptap StarterKit output set (no links/images/attributes are
// produced by the editor). Allowing zero attributes removes every on*-handler,
// javascript: URL, and style-based vector while keeping legit formatting.
// `xss` is pure JS (no DOM/jsdom) so it runs in both Node (server) and the
// browser — unlike DOMPurify, which needs jsdom and crashes on serverless.
const TAGS = [
  "p", "br", "span", "strong", "b", "em", "i", "u", "s", "del",
  "code", "pre", "blockquote", "hr",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li",
];

const sanitizer = new FilterXSS({
  whiteList: Object.fromEntries(TAGS.map((t) => [t, []])),
  stripIgnoreTag: true,
  stripIgnoreTagBody: ["script", "style"],
});

/** Strip everything outside the allowlist from a known-HTML string. */
export function sanitizeRichHtml(html: string): string {
  return sanitizer.process(html);
}

/**
 * Sanitize a rich-text field at the data boundary. HTML is allowlisted; plain
 * legacy text passes through untouched. Use this server-side before handing
 * product copy to a client component so raw markup never reaches the wire.
 */
export function cleanRichText(value?: string | null): string {
  if (!value) return "";
  return HTML_RE.test(value) ? sanitizer.process(value) : value;
}
