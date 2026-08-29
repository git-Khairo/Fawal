import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";
import { products, getCategory } from "@/content/catalog";
import { resolveProductImage } from "@/lib/product-images";
import { InquiryView, type CatalogEntry } from "@/components/inquiry/inquiry-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getDictionary(locale);
  return { title: t.inquiry.title, description: t.inquiry.lead, robots: { index: false } };
}

export default async function InquiryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getDictionary(locale);

  // The saved list holds slugs only, so names, images and units are looked up
  // here in whichever locale the buyer is currently reading.
  const catalog: Record<string, CatalogEntry> = Object.fromEntries(
    products.map((p) => [
      p.slug,
      {
        name: p.name[locale],
        categoryName: getCategory(p.category)!.name[locale],
        image: resolveProductImage(p.image),
        units: p.units,
      },
    ]),
  );

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-14 lg:px-8 lg:py-20">
      <header className="max-w-[52ch]">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink lg:text-5xl">
          {t.inquiry.title}
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-2">{t.inquiry.lead}</p>
      </header>

      <div className="mt-12">
        <InquiryView
          locale={locale}
          catalog={catalog}
          phone={t.contact.phone}
          labels={{ inquiry: t.inquiry, units: t.units, common: t.common }}
        />
      </div>
    </div>
  );
}
