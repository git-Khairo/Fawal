import "server-only";
import type { Locale } from "./config";
import type { PluralForms } from "@/lib/plural";
import type ar from "@/messages/ar.json";

/**
 * The Arabic file is the source of truth; English must match its shape exactly,
 * which is what catches a key that was added but never translated.
 *
 * `products.count` is the one deliberate exception. Plural categories are a
 * property of the language, not of the message set: Arabic needs six, English
 * needs two. Widening just that node keeps the guard everywhere else.
 */
export type Dictionary = Omit<typeof ar, "products"> & {
  products: Omit<typeof ar.products, "count"> & { count: PluralForms };
};

const loaders: Record<Locale, () => Promise<{ default: Dictionary }>> = {
  ar: () => import("@/messages/ar.json"),
  en: () => import("@/messages/en.json"),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const mod = await loaders[locale]();
  return mod.default;
}
