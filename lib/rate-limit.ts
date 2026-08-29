/**
 * Sliding-window limiter, held in module memory.
 *
 * This is sized for the traffic a regional trade catalogue actually sees. It
 * resets on cold start and is per-instance, so it stops a burst from one script
 * rather than providing a hard global guarantee. If the site ever outgrows that,
 * swap the Map for Upstash Redis; the signature below does not need to change.
 */
const hits = new Map<string, number[]>();

const WINDOW_MS = 10 * 60 * 1000;
const MAX_IN_WINDOW = 5;
const MAX_TRACKED_KEYS = 5000;

export function checkRateLimit(key: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_IN_WINDOW) {
    const oldest = recent[0];
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((WINDOW_MS - (now - oldest)) / 1000)),
    };
  }

  recent.push(now);
  hits.set(key, recent);

  // Bound memory: drop the oldest keys rather than growing without limit.
  if (hits.size > MAX_TRACKED_KEYS) {
    const excess = hits.size - MAX_TRACKED_KEYS;
    let dropped = 0;
    for (const k of hits.keys()) {
      if (dropped++ >= excess) break;
      hits.delete(k);
    }
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

/** Best available client address behind Vercel's proxy, falling back to a shared bucket. */
export function clientKey(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
