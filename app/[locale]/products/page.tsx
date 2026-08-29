import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { isLocale, LOCALES, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";
import { categories, products, getCategory } from "@/content/catalog";
import { resolveProductImage } from "@/lib/product-images";
import { ProductFilters } from "@/components/catalog/product-filters";
import type { CatalogItem } from "@/components/catalog/product-tile";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getDictionary(locale);
  return { title: t.products.title, description: t.products.lead };
}

/** Everything the client filter needs, resolved once on the server. */
function buildItems(locale: Locale): CatalogItem[] {
  return products.map((p) => {
    const category = getCategory(p.category)!;
    return {
      slug: p.slug,
      name: p.name[locale],
      summary: p.summary[locale],
      category: p.category,
      categoryName: category.name[locale],
      families: p.families,
      image: resolveProductImage(p.image),
      units: p.units,
      // Searching matches the name, the description and the line it belongs to,
      // in both locales, so an Arabic buyer can still find "barbed wire".
      searchIndex: [
        p.name.ar,
        p.name.en,
        p.summary.ar,
        p.summary.en,
        category.name.ar,
        category.name.en,
      ]
        .join(" ")
        .toLowerCase(),
    };
  });
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getDictionary(locale);

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-14 lg:px-8 lg:py-20">
      <header className="max-w-[52ch]">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink lg:text-5xl">
          {t.products.title}
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-2">
          {t.products.lead}
        </p>
      </header>

      <div className="mt-12">
        {/* useSearchParams needs a boundary. The fallback is never visibly hit
            on a prerendered page, but it has to describe the same shape. */}
        <Suspense fallback={<div className="h-96" aria-busy="true" />}>
          <ProductFilters
            items={buildItems(locale)}
            categories={categories.map((c) => ({
              slug: c.slug,
              name: c.name[locale],
            }))}
            locale={locale}
            labels={{
              searchLabel: t.products.searchLabel,
              searchPlaceholder: t.products.searchPlaceholder,
              filterLabel: t.products.filterLabel,
              allCategories: t.products.allCategories,
              count: t.products.count,
              emptyTitle: t.products.emptyTitle,
              emptyBody: t.products.emptyBody,
              clearFilters: t.products.clearFilters,
              add: t.common.addToInquiry,
              added: t.common.inInquiry,
              pending: t.common.imagePending,
              details: t.common.viewProduct,
            }}
          />
        </Suspense>
      </div>
    </div>
  );
}
