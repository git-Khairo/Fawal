"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { List, X } from "@phosphor-icons/react/dist/ssr";
import { Logo } from "@/components/brand/logo";
import { LanguageSwitch } from "./language-switch";
import { InquiryBadge } from "./inquiry-badge";
import { navLinks } from "./nav-links";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/cn";

/** Takes dictionary slices rather than the whole thing: the header is a client
 *  component, so every key handed to it is shipped in the bundle. */
export function SiteHeader({
  locale,
  nav,
  siteName,
}: {
  locale: Locale;
  nav: Dictionary["nav"];
  siteName: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = navLinks(locale, nav);
  // On the homepage the opening sequence should be the first thing on screen,
  // so the navigation arrives a beat later rather than framing an empty room.
  const quiet = pathname === `/${locale}`;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-hairline bg-void/85 backdrop-blur-md",
        quiet && "nav-quiet",
      )}
    >
      <div className="mx-auto flex h-[72px] max-w-[1400px] items-center gap-6 px-5 lg:px-8">
        <Link href={`/${locale}`} className="shrink-0" aria-label={siteName}>
          <Logo name={siteName} />
        </Link>

        <nav aria-label={nav.home} className="hidden flex-1 lg:block">
          <ul className="flex items-center gap-1">
            {links.map((link) => {
              const active =
                link.href === `/${locale}`
                  ? pathname === link.href
                  : pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-block rounded-[--radius-tile] px-3 py-2 text-sm transition-colors duration-200",
                      active ? "text-ink" : "text-ink-2 hover:text-ink",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ms-auto flex items-center gap-2 lg:ms-0">
          <LanguageSwitch
            locale={locale}
            label={nav.switchLanguage}
            a11yLabel={nav.switchLanguageLabel}
            className="hidden sm:inline-block"
          />
          <InquiryBadge href={`/${locale}/inquiry`} label={nav.inquiry} />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? nav.closeMenu : nav.openMenu}
            className="rounded-[--radius-tile] border border-hairline p-2 text-ink-2 transition-colors hover:text-ink lg:hidden"
          >
            {open ? (
              <X size={18} weight="bold" aria-hidden="true" />
            ) : (
              <List size={18} weight="bold" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {open ? (
        <div id="mobile-nav" className="border-t border-hairline bg-void lg:hidden">
          <ul className="mx-auto max-w-[1400px] px-5 py-2">
            {links.map((link) => (
              <li key={link.href} className="border-b border-hairline/60 last:border-0">
                {/* Closing here rather than in an effect on pathname: the tap is
                    the intent, and an effect would fire an extra render pass. */}
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-3.5 text-[15px] text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mx-auto max-w-[1400px] px-5 pb-4 sm:hidden">
            <LanguageSwitch
              locale={locale}
              label={nav.switchLanguage}
              a11yLabel={nav.switchLanguageLabel}
            />
          </div>
        </div>
      ) : null}
    </header>
  );
}
