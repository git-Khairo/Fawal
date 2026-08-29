import Link from "next/link";
import { ArrowRight, ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { families, productsInFamily } from "@/content/catalog";
import { ProductImage } from "@/components/catalog/product-image";
import { resolveProductImage } from "@/lib/product-images";
import { Reveal } from "@/components/material/reveal";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/cn";

/** Three items, three cells, unequal weights. The fencing line is the largest
 *  part of the business, so it takes the largest cell. */
const cells = [
  "lg:col-span-2 lg:row-span-2",
  "lg:col-span-1 lg:row-span-1",
  "lg:col-span-1 lg:row-span-1",
] as const;

const order = ["fencing", "construction", "stationery"] as const;

export function Families({ locale, t }: { locale: Locale; t: Dictionary }) {
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;
  const ordered = order.map((id) => families.find((f) => f.id === id)!);

  return (
    <section className="border-b border-hairline">
      <div className="mx-auto max-w-[1400px] px-5 py-20 lg:px-8 lg:py-28">
        <Reveal>
          <h2 className="max-w-[20ch] font-display text-3xl font-semibold tracking-tight text-ink lg:text-4xl">
            {t.home.familiesTitle}
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-4 lg:grid-cols-3 lg:grid-rows-2">
          {ordered.map((family, i) => {
            const items = productsInFamily(family.id);
            const isLead = i === 0;

            return (
              <Reveal key={family.id} step={i as 0 | 1 | 2} className={cn("min-h-0", cells[i])}>
                <Link
                  href={`/${locale}/products?field=${family.id}`}
                  className="specular group flex h-full flex-col overflow-hidden rounded-[--radius-plate] border border-hairline transition-colors duration-300 hover:border-edge"
                >
                  <ProductImage
                    src={resolveProductImage(family.image)}
                    alt=""
                    label={family.name[locale]}
                    pendingLabel={t.common.imagePending}
                    sizes={isLead ? "(min-width: 1024px) 62vw, 100vw" : "(min-width: 1024px) 31vw, 100vw"}
                    className={cn("w-full shrink-0", isLead ? "aspect-[16/9]" : "aspect-[16/8]")}
                  />

                  <div className="flex flex-1 flex-col bg-deck p-6 lg:p-7">
                    <h3
                      className={cn(
                        "font-display font-semibold text-ink",
                        isLead ? "text-2xl lg:text-[1.75rem]" : "text-lg",
                      )}
                    >
                      {family.name[locale]}
                    </h3>
                    <p className="mt-2.5 max-w-[52ch] text-sm leading-relaxed text-ink-3">
                      {family.blurb[locale]}
                    </p>

                    <p className="num mt-5 text-[11px] leading-relaxed text-ink-3">
                      {items.map((p) => p.name[locale]).join("  ·  ")}
                    </p>

                    <span className="mt-auto flex items-center gap-2 pt-6 text-xs font-medium text-patina">
                      {t.common.viewLine}
                      <Arrow
                        size={13}
                        weight="bold"
                        aria-hidden="true"
                        className="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                      />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
