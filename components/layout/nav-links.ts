import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";

export type NavLink = { href: string; label: string };

/** Order matches the brochure's own navigation, so muscle memory carries over. */
export function navLinks(locale: Locale, nav: Dictionary["nav"]): NavLink[] {
  return [
    { href: `/${locale}`, label: nav.home },
    { href: `/${locale}/about`, label: nav.about },
    { href: `/${locale}/products`, label: nav.products },
    { href: `/${locale}/contact`, label: nav.contact },
  ];
}
