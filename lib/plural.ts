import type { Locale } from "@/content/schema";

/**
 * Arabic has six plural categories, not two. "12 أصناف" is wrong: 11 to 99
 * takes the accusative singular ("12 صنفاً"), 3 to 10 takes the plural, and 2
 * takes the dual. Intl.PluralRules knows all of this, so ask it rather than
 * branching on `n === 1`.
 */
export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };

export function plural(locale: Locale, count: number, forms: PluralForms): string {
  const category = new Intl.PluralRules(locale).select(count);
  return forms[category] ?? forms.other;
}
