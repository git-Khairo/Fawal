import "server-only";
import { existsSync } from "node:fs";
import path from "node:path";

const DIR = path.join(process.cwd(), "public", "products");
const EXTENSIONS = ["webp", "avif", "jpg", "jpeg", "png"] as const;

const cache = new Map<string, string | null>();

/**
 * Resolves a product image name to a public URL, or null when the client has not
 * supplied that photograph yet.
 *
 * Dropping `barbed-wire.webp` into public/products replaces the placeholder with
 * the real photograph. No code change, no rebuild of any component.
 */
export function resolveProductImage(name: string): string | null {
  const cached = cache.get(name);
  if (cached !== undefined) return cached;

  for (const ext of EXTENSIONS) {
    if (existsSync(path.join(DIR, `${name}.${ext}`))) {
      const url = `/products/${name}.${ext}`;
      cache.set(name, url);
      return url;
    }
  }
  cache.set(name, null);
  return null;
}
