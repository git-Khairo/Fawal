import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MapPin, Phone, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";
import { ButtonLink } from "@/components/material/button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getDictionary(locale);
  return { title: t.contact.title, description: t.contact.lead };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getDictionary(locale);

  const tel = t.contact.phone.replace(/\s/g, "");

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-14 lg:px-8 lg:py-20">
      <header className="max-w-[46ch]">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink lg:text-5xl">
          {t.contact.title}
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-2">{t.contact.lead}</p>
      </header>

      <div className="mt-14 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <dl className="grid gap-px overflow-hidden border-y border-hairline bg-hairline">
          <div className="flex gap-5 bg-void p-7">
            <MapPin size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-ink-3" />
            <div>
              <dt className="text-xs font-medium text-ink-3">{t.contact.addressLabel}</dt>
              <dd className="mt-1.5 text-[15px] text-ink">{t.contact.address}</dd>
            </div>
          </div>

          <div className="flex gap-5 bg-void p-7">
            <Phone size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-ink-3" />
            <div>
              <dt className="text-xs font-medium text-ink-3">{t.contact.phoneLabel}</dt>
              <dd className="mt-1.5">
                <a
                  href={`tel:${tel}`}
                  dir="ltr"
                  className="num text-[15px] text-ink transition-colors duration-200 hover:text-patina"
                >
                  {t.contact.phone}
                </a>
              </dd>
            </div>
          </div>

          <div className="flex gap-5 bg-void p-7">
            <EnvelopeSimple size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-ink-3" />
            <div>
              <dt className="text-xs font-medium text-ink-3">{t.contact.emailLabel}</dt>
              <dd className="mt-1.5">
                <a
                  href={`mailto:${t.contact.email}`}
                  dir="ltr"
                  className="text-[15px] text-ink transition-colors duration-200 hover:text-patina"
                >
                  {t.contact.email}
                </a>
              </dd>
            </div>
          </div>
        </dl>

        <aside className="plate self-start rounded-[--radius-plate] border border-hairline p-8">
          <h2 className="font-display text-xl font-semibold text-ink">{t.contact.quoteTitle}</h2>
          <p className="mt-3 max-w-[38ch] text-sm leading-relaxed text-ink-3">
            {t.contact.quoteBody}
          </p>
          <ButtonLink href={`/${locale}/products`} className="mt-6">
            {t.common.browseProducts}
          </ButtonLink>
        </aside>
      </div>
    </div>
  );
}
