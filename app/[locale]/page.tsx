import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";
import { categories } from "@/content/catalog";
import { CinematicHero } from "@/components/wire/hero/CinematicHero";
import { TrustLine } from "@/components/home/trust-line";
import { Families } from "@/components/home/families";
import { ProductsSection, type ProductCopy } from "@/components/wire/sections/products-section";
import { Factory } from "@/components/home/factory";
import { QuoteBand } from "@/components/home/quote-band";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getDictionary(locale);

  // The six wire states are keyed by catalogue category slug, so the morph
  // scene and the catalogue can never drift apart.
  const productCopy: ProductCopy = Object.fromEntries(
    categories.map((c) => [c.slug, { name: c.name[locale], blurb: c.blurb[locale], slug: c.slug }]),
  );

  return (
    <>
      <CinematicHero
        copy={{
          wordmarkA: t.home.heroWordmarkA,
          wordmarkB: t.home.heroWordmarkB,
          years: t.home.heroYears,
          tagline: t.home.heroTagline,
          primary: t.common.requestQuote,
          secondary: t.common.browseProducts,
        }}
        primaryHref={`/${locale}/inquiry`}
        secondaryHref={`/${locale}/products`}
      />
      <TrustLine t={t} />
      <Families locale={locale} t={t} />
      <ProductsSection
        copy={productCopy}
        locale={locale}
        title={t.home.productsTitle}
        body={t.home.productsBody}
        ctaLabel={t.common.viewProduct2}
        selectorLabel={t.products.filterLabel}
      />
      <Factory t={t} />
      <QuoteBand locale={locale} t={t} />
    </>
  );
}
