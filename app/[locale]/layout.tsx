import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fontVariables } from "@/lib/fonts";
import { LOCALES, isLocale, dirFor, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import "../globals.css";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getDictionary(locale);

  return {
    title: { default: t.meta.defaultTitle, template: `%s | ${t.meta.siteName}` },
    description: t.meta.defaultDescription,
    alternates: {
      canonical: `/${locale}`,
      languages: { ar: "/ar", en: "/en" },
    },
    openGraph: {
      title: t.meta.defaultTitle,
      description: t.meta.defaultDescription,
      siteName: t.meta.siteName,
      locale: locale === "ar" ? "ar_SY" : "en_US",
      type: "website",
    },
  };
}

export const viewport = {
  // A meta tag cannot read a CSS variable, so this literal has to track
  // --color-void by hand. Measured, not guessed: oklch(0.182 0.008 240).
  themeColor: "#0f1315",
  colorScheme: "dark" as const,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const typed: Locale = locale;
  const t = await getDictionary(typed);

  return (
    <html lang={typed} dir={dirFor(typed)} className={fontVariables} suppressHydrationWarning>
      <body className="bg-void text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-[70] focus:rounded-[--radius-tile] focus:border focus:border-hairline focus:bg-raised focus:px-4 focus:py-2 focus:text-sm focus:text-ink"
        >
          {typed === "ar" ? "تخطَّ إلى المحتوى" : "Skip to content"}
        </a>

        <SiteHeader locale={typed} nav={t.nav} siteName={t.meta.siteName} />
        <main id="main">{children}</main>
        <SiteFooter locale={typed} t={t} />

        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
