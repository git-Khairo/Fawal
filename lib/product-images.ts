import "server-only";
import { existsSync } from "node:fs";
import path from "node:path";

const DIR = path.join(process.cwd(), "public", "products");
const EXTENSIONS = ["webp", "avif", "jpg", "jpeg", "png"] as const;

const cache = new Map<string, string | null>();

/**
 * Caching a "not found" is only safe once the file set is frozen. In
 * development it is actively wrong: the server caches null for every name at
 * startup, and a photograph dropped in afterwards never appears until the
 * process is restarted.
 */
const CACHE_MISSES = process.env.NODE_ENV === "production";

/**
 * Resolves a product image name to a public URL, or null when the client has not
 * supplied that photograph yet.
 *
 * Dropping `barbed-wire.png` into public/products replaces the placeholder with
 * the real photograph. No code change, no rebuild of any component.
 */
export function resolveProductImage(name: string): string | null {
  const cached = cache.get(name);
  if (cached !== undefined && (cached !== null || CACHE_MISSES)) return cached;

  for (const ext of EXTENSIONS) {
    if (existsSync(path.join(DIR, `${name}.${ext}`))) {
      const url = `/products/${name}.${ext}`;
      cache.set(name, url);
      return url;
    }
  }
  if (CACHE_MISSES) cache.set(name, null);
  return null;
}
