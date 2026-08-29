import Link from "next/link";
import { MapPin, Phone, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { LogoMark } from "@/components/brand/logo";
import { navLinks } from "./nav-links";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";

export function SiteFooter({ locale, t }: { locale: Locale; t: Dictionary }) {
  const links = navLinks(locale, t.nav);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-hairline bg-deck">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr] lg:px-8">
        <div>
          <LogoMark className="w-12" />
          <p className="mt-5 font-display text-lg font-semibold text-ink">{t.meta.siteName}</p>
          <p className="mt-2 max-w-[34ch] text-sm leading-relaxed text-ink-3">{t.meta.tagline}</p>
        </div>

        <nav aria-label={t.footer.navTitle}>
          <h2 className="font-display text-xs font-semibold text-ink-2">{t.footer.navTitle}</h2>
          <ul className="mt-4 space-y-2.5">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-ink-3 transition-colors duration-200 hover:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-xs font-semibold text-ink-2">
            {t.footer.contactTitle}
          </h2>
          <ul className="mt-4 space-y-3.5 text-sm">
            <li className="flex gap-3 text-ink-3">
              <MapPin size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-ink-3" />
              <span>{t.contact.address}</span>
            </li>
            <li className="flex gap-3">
              <Phone size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-ink-3" />
              <a
                href={`tel:${t.contact.phone.replace(/\s/g, "")}`}
                dir="ltr"
                className="num text-ink-2 transition-colors duration-200 hover:text-patina"
              >
                {t.contact.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <EnvelopeSimple size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-ink-3" />
              <a
                href={`mailto:${t.contact.email}`}
                dir="ltr"
                className="text-ink-2 transition-colors duration-200 hover:text-patina"
              >
                {t.contact.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-hairline">
        <p className="mx-auto max-w-[1400px] px-5 py-5 text-xs text-ink-3 lg:px-8">
          <span className="num">{year}</span> {t.meta.siteName}. {t.footer.rights}.
        </p>
      </div>
    </footer>
  );
}
