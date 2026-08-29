import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { isLocale, LOCALES } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";
import { products, getProduct, getCategory, productsInCategory } from "@/content/catalog";
import { resolveProductImage } from "@/lib/product-images";
import { ProductImage } from "@/components/catalog/product-image";
import { QuantityPicker } from "@/components/inquiry/quantity-picker";

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => products.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const product = getProduct(slug);
  if (!product) return {};
  return { title: product.name[locale], description: product.summary[locale] };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const product = getProduct(slug);
  if (!product) notFound();

  const t = await getDictionary(locale);
  const category = getCategory(product.category)!;
  const related = productsInCategory(product.category).filter((p) => p.slug !== product.slug);
  const Back = locale === "ar" ? ArrowRight : ArrowLeft;

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-10 lg:px-8 lg:py-16">
      <Link
        href={`/${locale}/products?category=${category.slug}`}
        className="inline-flex items-center gap-2 text-xs text-ink-3 transition-colors duration-200 hover:text-ink"
      >
        <Back size={13} weight="bold" aria-hidden="true" />
        {category.name[locale]}
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <ProductImage
          src={resolveProductImage(product.image)}
          alt=""
          label={product.name[locale]}
          pendingLabel={t.common.imagePending}
          sizes="(min-width: 1024px) 52vw, 100vw"
          priority
          className="aspect-[4/3] w-full rounded-[--radius-plate] border border-hairline"
        />

        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink lg:text-[2.5rem]">
            {product.name[locale]}
          </h1>
          <p className="mt-4 max-w-[54ch] text-[15px] leading-relaxed text-ink-2">
            {product.summary[locale]}
          </p>

          <div className="mt-8">
            <QuantityPicker
              slug={product.slug}
              units={product.units}
              unitLabels={t.units}
              labels={{
                quantity: t.common.quantity,
                unit: t.common.unit,
                add: t.common.addToInquiry,
                added: t.common.inInquiry,
              }}
            />
          </div>

          {/* الأنواع والاستخدامات, the content the brochure asks for on every
              product page. Both render only when populated, so a line with no
              variants simply does not show an empty heading. */}
          {product.applications.length > 0 ? (
            <section className="mt-10">
              <h2 className="font-display text-base font-semibold text-ink">
                {t.product.applicationsTitle}
              </h2>
              <ul className="mt-4 border-t border-hairline">
                {product.applications.map((use) => (
                  <li
                    key={use.en}
                    className="border-b border-hairline py-2.5 text-[14px] text-ink-2"
                  >
                    {use[locale]}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {product.variants.length > 0 ? (
            <section className="mt-10">
              <h2 className="font-display text-base font-semibold text-ink">
                {t.product.variantsTitle}
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <li
                    key={variant.en}
                    className="rounded-[--radius-tile] border border-hairline px-3.5 py-2 text-[13px] text-ink-2"
                  >
                    {variant[locale]}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* Made to order, so rather than publish specifications the company has
              not given us, tell the buyer which details we need back from them. */}
          <section className="mt-10">
            <h2 className="font-display text-base font-semibold text-ink">{t.product.specTitle}</h2>
            <p className="mt-2 max-w-[52ch] text-[13px] leading-relaxed text-ink-3">
              {t.product.specBody}
            </p>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {product.specFields.map((field) => (
                <li
                  key={field}
                  className="plate-inset rounded-[--radius-tile] border border-hairline px-4 py-3 text-[13px] text-ink-2"
                >
                  {t.specFields[field]}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-20 border-t border-hairline pt-12">
          <h2 className="font-display text-xl font-semibold text-ink">{t.product.relatedTitle}</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/${locale}/products/${item.slug}`}
                  className="specular group block overflow-hidden rounded-[--radius-plate] border border-hairline transition-colors duration-300 hover:border-edge"
                >
                  <ProductImage
                    src={resolveProductImage(item.image)}
                    alt=""
                    label={item.name[locale]}
                    pendingLabel={t.common.imagePending}
                    sizes="(min-width: 1024px) 24vw, 50vw"
                    className="aspect-[4/3] w-full"
                  />
                  <span className="block bg-deck px-4 py-3.5 font-display text-[13px] font-medium text-ink">
                    {item.name[locale]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
