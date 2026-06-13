import "server-only";

/**
 * In-memory sliding-window limiter (per server instance). Good first layer
 * against brute-force; on serverless it's per-warm-instance, so for production
 * pair it with a shared store (e.g. Upstash Redis / @vercel/kv).
 */
const WINDOW_MS = 15 * 60_000; // 15 minutes
const MAX_FAILURES = 5;

const buckets = new Map<string, number[]>();

function recent(key: string, now: number): number[] {
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  buckets.set(key, hits);
  return hits;
}

export function isRateLimited(key: string): boolean {
  return recent(key, Date.now()).length >= MAX_FAILURES;
}

export function recordFailure(key: string): void {
  const now = Date.now();
  const hits = recent(key, now);
  hits.push(now);
  buckets.set(key, hits);

  // bound memory
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (v.every((t) => now - t >= WINDOW_MS)) buckets.delete(k);
    }
  }
}

export function clearAttempts(key: string): void {
  buckets.delete(key);
}

/** First X-Forwarded-For hop, falling back gracefully. */
export function ipFromHeaders(h: Headers): string {
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}
